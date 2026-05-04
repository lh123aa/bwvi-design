# BWVI Design — Architecture Specification v2.1

> Companion to PRD.md. Covers MCP tool contracts, runtime modes, token budget.
> v2.1 changes: tool-enforced decision contracts, three-tier critique, offline modes.

---

## 1. 模块架构（Phase 1）

```
@bwvi/core
├── src/
│   ├── cli/             4 个核心命令（Phase 1）
│   │   ├── index.ts
│   │   ├── init.ts          bwvi init
│   │   ├── analyze.ts       bwvi analyze
│   │   ├── generate.ts      bwvi generate
│   │   └── critique.ts      bwvi critique
│   ├── engine/           核心引擎
│   │   ├── analyzer.ts     任务分析 + 知识路由
│   │   ├── composer.ts     提示词组装（按决策链）
│   │   ├── generator.ts    生成调度（异步 task）
│   │   └── renderer.ts     HTML 渲染+导出
│   ├── checkpoint/       Checkpoint 文件系统
│   │   ├── manager.ts      read/write/rollback
│   │   └── recover.ts      中断恢复
│   ├── critique/         评审引擎
│   │   ├── objective.ts    客观指标计算
│   │   └── self-review.ts  5 维自评
│   ├── knowledge/        知识引擎
│   │   ├── loader.ts       知识块加载器（10 个核心块）
│   │   └── cache.ts        session 缓存
│   ├── asset/            Phase 1b 资产
│   │   └── searcher.ts     logo/color 搜索（quick mode）
│   └── types/
│       ├── decision.ts
│       ├── knowledge.ts
│       ├── critique.ts
│       └── runtime.ts       # 新增：运行模式定义
├── knowledge/             10 个核心知识块
├── templates/             3 个种子模板
└── package.json
```

---

## 2. MCP Tool 契约（关键：决策强制）

### 2.1 Generate Tool — 带决策强制

```typescript
interface GenerateInput {
  task: string;
  
  // ← 强制执行：不允许直接生成
  confirmed_decisions: {
    direction: string;      // 决策 ID，必须已被 user 确认
    palette: string;
    typography: string;
    layout?: string;
    information_density?: string;
  };
  
  // ← 可选但推荐
  assets?: {
    logo?: string;          // asset download 返回的文件路径
    imagery?: string[];
  };
  
  mode: "sync" | "async";
}

// 错误返回
type GenerateError = 
  | { code: "MISSING_DECISIONS"; 
      missing: string[];           // ["direction", "palette"]
      message: "请先完成方向、色板决策再生成";
      next_step: "bwvi decision_make --type direction"; }
  | { code: "DECISION_NOT_CONFIRMED";
      decision_id: string;
      message: "该决策尚未被用户确认"; }
  | { code: "GENERATION_INCOMPLETE";
      partial_output: string;
      message: "输出截断，自动重试中"; };
```

### 2.2 Critique Tool — 三级模式

```typescript
interface CritiqueInput {
  file: string;
  mode?: "auto" | "cross" | "self-plus" | "objective";
  // auto: 自动检测可用模型 → 选择最佳模式
  // cross: 强制交叉（需要 2+ 模型）
  // self-plus: 自评 + 客观指标（默认）
  // objective: 仅客观指标
}

interface CritiqueOutput {
  mode_used: "cross" | "self-plus" | "objective";
  objective: {
    color_compliance: number;
    font_compliance: number;
    asset_authenticity: number;
    layout_diversity: number;
    accent_overuse: number;
    anti_patterns_detected: string[];
  };
  self?: {
    philosophy: number;
    hierarchy: number;
    detail: number;
    function: number;
    innovation: number;
  };
  cross?: {
    scores: typeof self;
    reviewer_model: string;
    deviation: number;
  };
  // 自评+模式有该标记
  warning?: "未经交叉验证，评分可能偏高";
  // 仅客观模式有该标记  
  notice?: "仅客观指标，未做设计评审";
  score: number;
  passed: boolean;
}
```

---

## 3. 三种运行模式

```yaml
runtime_modes:
  online:
    detection: "curl -s --connect-timeout 2 https://api.github.com > nul 2>&1"
    features:
      - 品牌资产搜索（官网 curl）
      - 知识库版本检查 + 更新
      - 交叉评审（多模型 API）
      - 品牌新鲜度验证
      
  limited:
    trigger: "网络可达但无多模型 key"
    features:
      - 任务分析（本地知识库）
      - 生成（依赖 Agent 模型）
      - 评审（self-plus：客观指标 + 自评）
      - 资产搜索降级（本地缓存 + placeholder）
      
  offline:
    trigger: "网络不可达"
    features:
      - 任务分析（仅缓存知识块）
      - 生成（依赖 Agent 模型）
      - 评审（objective：仅客观指标）
      - 资产搜索不可用 → 诚实 placeholder
    note: "首次使用需 bwvi init --cache 预缓存知识库"
```

---

## 4. Token 预算表

```yaml
token_budget:
  analysis:
    tool_call:              200
    result_reading:         800
    knowledge_selection:    300
    subtotal:               1,300

  knowledge_loading:
    per_chunk (avg):        2,500
    chunks_per_session:     3-5
    subtotal:               7,500 - 12,500

  direction_selection:
    recommendation:         1,200
    user_confirmation:      200
    subtotal:               1,400

  palette_typography:
    recommendation:         800
    user_confirmation:      200
    subtotal:               1,000

  generation:
    system_prompt:          1,500
    user_prompt:            500
    output:                 3,000 - 6,000
    subtotal:               5,000 - 8,000

  critique:
    input (HTML):           3,000 - 6,000
    output:                 1,000
    subtotal:               4,000 - 7,000

  ──────────────────────────────────────────
  单次全流程估算:           20,200 - 31,200 tokens
  单次全流程实测:           TBD（实现后校准）
```

优化策略：
- 知识块目标上限：每个块 ≤ 2,000 tokens（超了拆）
- 生成输出 > 4,000 tokens → tree-shaking（移除注释、压缩 CSS）
- 全流程 > 30,000 tokens → 换更短的评审模式或裁减知识块

---

## 5. 错误码 v2.1

```typescript
enum BwviError {
  // 致命（Phase 1）
  CONFIG_CORRUPTED = "E001",
  CHECKPOINT_CORRUPTED = "E002",
  
  // 可恢复
  NETWORK_TIMEOUT = "E101",
  API_RATE_LIMITED = "E102",
  ASSET_NOT_FOUND = "E103",
  GENERATION_INCOMPLETE = "E104",
  
  // 决策契约（新增）
  MISSING_DECISIONS = "E105",       // generate 未传决策 ID
  DECISION_NOT_CONFIRMED = "E106",  // 决策未确认
  DECISION_NOT_FOUND = "E107",      // 决策 ID 不存在
  
  // 运行模式
  OFFLINE_MODE = "I201",            // 离线模式提示（非错误）
  LIMITED_MODE = "I202",            // 有限模式提示
  
  // 警告
  BRAND_STALE = "W301",
  KNOWLEDGE_UPDATED = "W302",
  LOW_CONFIDENCE = "W303",
}
```

---

## 6. Benchmark 测试套件

```yaml
benchmark_suite:
  version: "1.0.0"
  
  cases:
    TC01_brand_landing:
      name: "品牌 landing page"
      input: "帮我的精品咖啡品牌 Blue Bottle 做一个 landing page"
      criteria:
        - "logo 为真实 SVG 文件"
        - "色值与 bluebottlecoffee.com 匹配（≤0.02 oklch 差）"
        - "critique 评分 ≥ 7/10"
        
    TC02_cold_start:
      name: "冷启动 — 无品牌无参考"
      input: "帮我做个好看的官网，不知道什么风格"
      criteria:
        - "触发了冷启动协议（checkpoint 有 direction 决策）"
        - "问了至少 1 个问题"
        - "完成了方向→色板→字体决策链"
        
    TC03_iteration:
      name: "评审迭代"
      input: '"评审这个页面" → "按评审结果修改"'
      criteria:
        - "v2 客观指标 > v1"
        - "已确认的决策不重复问"
        
    TC04_recovery:
      name: "中断恢复"
      input: "模拟 Agent 中断 → checkpoint restore"
      criteria:
        - "已确认决策不重复问"
        - "最终产出 ≈ 无中断产出的 90%+"
        
    TC05_offline:
      name: "离线模式"
      input: "断网状态下 bwvi critique"
      criteria:
        - "仅返回 objective 指标，不崩溃"
        - "标注 '仅客观指标'"
  
  run_command: "bwvi benchmark run"
  pass_threshold: "5/5 all phases; 4/5 during development"
```

---

## 7. 安装与占用（Phase 1）

| 资源 | 大小 | 备注 |
|------|------|------|
| npm 包（核心） | < 300 KB | 仅 4 命令 + 3 引擎 |
| 知识库 | < 50 KB | 10 个核心块 |
| 模板 | < 20 KB | 3 个种子 |
| 初始安装 | < 400 KB | 无网络依赖 |
| 可选缓存 | + 2 MB | `bwvi init --cache` 预缓存全量知识 |
| 更新频率 | 按需 npm update | semver 兼容 |
| 离线可用 | 是 | `--cache` 后全功能离线 |

对比：Open-Design clone + node_modules ≈ 800 MB+

---

## 8. 设计原则（v2.1 补充）

| # | 原则 | 来源 | 解释 |
|---|------|------|------|
| 6 | **用契约强制，不用信任驱动** | R04 | MCP tool 的 input schema 是硬边界 |
| 7 | **快路优先，深路可选** | R03 | 默认 30s 出东西，深度分析按需触发 |
| 8 | **离线是一等公民** | R02 | 不是偶然的降级，是主动设计的模式 |
| 9 | **不自欺：标注所有置信度** | R05+R02 | 来源、模式、偏差全部标明 |
| 10 | **自举才能发布** | R10 | 自己的狗粮自己先吃 |
