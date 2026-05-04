# BWVI v2.1 — 自审修订

> 对应自审发现的 10 个问题，逐条优化。

---

## R01: 规模失控 → Phase 1 真·最小可行

**问题：** Phase 1 3 天排了十几个命令，做不到。

**优化：** 3 天 → **只做 4 个命令 + 1 个核心引擎**。第 4 天才是完整的 MCP Server 适配。

### Phase 1 真实 scope

```
Phase 1a: Day 1-2 — 4 个核心命令
╔══════════════════════════════════════════════════════════════╗
║  bwvi init       项目初始化                                  ║
║  bwvi analyze    任务分析 → 知识路由 + 模板推荐               ║
║  bwvi generate   异步生成（Agent 调用）                       ║
║  bwvi critique   评审（客观指标 + 5 维自评，模式自评）         ║
╚══════════════════════════════════════════════════════════════╝
  ├─ 决策引擎：决策注册表 + 执行器
  ├─ checkpoint：文件系统（.bwvi/checkpoints/）
  ├─ 知识库：10 个核心知识块（不是 50+）
  ├─ 种子模板：3 个（landing / dashboard / deck）
  └─ 跳过：多角色、交叉评审、品牌新鲜度、设计债、媒体管道

Phase 1b: Day 3 — 资产搜索（简陋版）
╔══════════════════════════════════════════════════════════════╗
║  bwvi asset logo <brand>    只搜 logo（快档，2 轮搜索）      ║
║  bwvi asset color <brand>   只搜色值（curl 官网 → grep hex） ║
╚══════════════════════════════════════════════════════════════╝
  └─ 不做产品图、不做 UI 截图、不做 5-10-2-8 完整门
```

**被砍到 Phase 2 的功能（不加延期）：**
- 设计 DNA → 只有基础方向选择
- 设计债 → 移到 Phase 2
- 多角色编排 → Phase 2
- 品牌新鲜度 → Phase 2
- 5-10-2-8 完整质量门 → Phase 2
- 交叉评审 → Phase 2
- 媒体管道 → Phase 2

**Phase 1 交付标准：**
```
bwvi init my-project
bwvi analyze "咖啡品牌 landing page"
  → 输出: task_type=landing, knowledge=[...], direction="warm-editorial"
bwvi generate "咖啡品牌 landing page" --direction warm-editorial
  → 输出: index.html + assets/
bwvi critique index.html
  → 输出: {objective: ..., self: ..., score: 6.5, passed: true}
```

---

## R02: 离线盲区 → 三级模式定义

**问题：** 所有功能假设在线。断网全废。

**优化：** 明确定义三档运行模式。

```yaml
runtime_modes:
  online:
    features:
      - 品牌资产搜索（curl 官网）
      - 知识库版本检查 + 更新
      - 交叉评审（多模型 API）
      - 品牌新鲜度验证
    requirements: "网络可达"

  limited:
    features:
      - 任务分析（本地知识库）
      - 生成（依赖 Agent 模型）
      - 评审（仅自评 + 客观指标）
      - 资产搜索降级（本地缓存 + placeholder）
    requirements: "无网络，知识库全量缓存"

  offline:
    features:
      - 任务分析（仅缓存的 10 个核心知识块）
      - 生成（依赖 Agent 模型）
      - 评审（仅客观指标）
      - 资产搜索不可用 → 诚实 placeholder
    requirements: "完全断网，首次使用需 `bwvi init --cache` 预缓存"
```

**离线检测：**
```bash
bwvi status
→ "网络状态: 在线 | 知识版本: 2.1.0 (最新) | 品牌缓存: 3/5 有效"

# 离线时：
bwvi analyze "coffee brand landing page"
→ "⚠ 离线模式。使用本地知识库 v2.1.0（缓存于 2026-05-01）。
   品牌资产搜索不可用，将使用诚实 placeholder。"
```

**安装时的缓存策略：**
```bash
npm install -g bwvi
bwvi init --cache    # 可选：预下载知识库+品牌缓存（+50MB）
# 不跑 --cache：仅核心知识块（<1MB），其他按需下载
```

---

## R03: 5-10-2-8 太慢 → 快慢双档

**问题：** 完整 5-10-2-8 一轮 2-3 分钟，用户等不了。

**优化：** 快慢两档，自适应用户上下文。

```typescript
type AssetSearchMode = 
  | "quick"   // 2轮搜索, 3候选, ~30s → 快速原型/内部演示
  | "full";   // 5轮搜索, 10候选, ~3min → 客户交付/品牌物料

interface AssetSearchResult {
  mode: AssetSearchMode;
  duration_ms: number;
  candidate_count: number;
  top_results: Asset[];
  confidence_delta: number;  // full mode 比 quick mode 提升的置信度
}
```

**默认策略：**
```
首次调用 → quick（30s，给用户快速看到产出）
如果 critique 的 asset_authenticity < 0.8
  → 提示用户："资产质量不足，要升级到 full mode 重搜吗？"
```

**这样用户 30s 能先看到东西，3min 的深度搜索只在必要时触发。**

---

## R04: 决策树虚执行 → MCP Tool 契约强制

**问题：** 规则写得再好，Agent 可以跳过不遵守。

**优化：** 用 MCP tool 的输入/输出 schema 做强制契约。

```typescript
// ❌ 旧: generate 不要求决策历史
interface OldGenerateInput {
  task: string;
  direction?: string;
}

// ✅ 新: generate 强制要求决策 ID 引用
interface GenerateInput {
  task: string;
  // 核心：必须引用已确认的决策
  confirmed_decisions: {
    direction?: string;    // 方向决策 ID
    palette?: string;      // 色板决策 ID
    typography?: string;   // 字体决策 ID
    // 不允许跳过方向/色板/字体直接生成
  };
  // 资产引用（可选但推荐）
  assets?: {
    logo?: string;         // asset download 返回的文件路径
    imagery?: string[];
  };
}

// Agent 必须先调 decision_make 确认方向/色板/字体
// 然后调 generate 时传入 confirmed_decisions
// 如果 confirmed_decisions 为空 → tool 返回错误
```

```typescript
// Generate 的错误返回
interface GenerateError {
  code: "MISSING_DECISIONS";
  missing: string[];            // ["direction", "palette"]
  message: "请先完成方向、色板决策再生成";
  next_step: "bwvi decision_make --type direction";
}
```

---

## R05: 交叉评审鸡生蛋 → 单模型降级方案

**问题：** 用户没有第二个模型 key 时交叉评审做不了。

**优化：** 三级评审模式，按可用资源降级。

```yaml
critique_modes:
  mode_1_cross:         # 最佳：交叉评审
    requires: "2+ 模型 API key"
    accuracy: "高"
    flow:
      - 主模型输出 HTML
      - 评审模型 blind review
      - 对比自评 vs 他评 → >2 分差异标记
    config: "bwvi config set critique.mode cross"
    
  mode_2_self_plus:     # 次佳：自评 + 客观指标
    requires: "仅 1 模型"
    accuracy: "中"
    flow:
      - 客观指标自动计算（色彩/字体/资产/布局/反模式）
      - 自评 5 维（标记"未经交叉验证"）
      - 输出中含偏差警告
    config: "默认模式 / bwvi config set critique.mode self-plus"

  mode_3_objective:     # 降级：仅客观指标
    requires: "无模型 API"
    accuracy: "基础"
    flow:
      - 仅计算客观指标
      - 无 5 维评分
      - 明确标注"未评审"
    config: "bwvi config set critique.mode objective"
```

**默认检测逻辑：**
```bash
bwvi critique index.html
# → 检测到仅 Claude API key 可用
# → 自动使用 mode_2_self_plus
# → 输出: 客观指标 + 自评 + "⚠ 未交叉评审" 标记
```

---

## R06: 冷启动 → 完整协议

**问题：** 用户说"做个好看的"——无品牌、无方向、无参考时 BWVI 怎么做？

**优化：** 冷启动 5 步协议。

```yaml
cold_start_protocol:
  trigger: "用户需求中无品牌、无参考、无明确方向"
  
  step_1_extract:
    action: "从描述中提取可能线索"
    example: 
      input: "做个好看的官网"
      output: "品牌类型: 未知 | 行业: 未知 | 风格: 未知 | 置信度: 0"
    
  step_2_ask_minimal:
    action: "最少问题原则 — 最多问 2 个"
    questions:
      - "给谁看的？（投资人 / 客户 / 自己）"
      - "什么风格的 App/网站让你觉得好看？（给例子或截图）"
    
  step_3_showcase_picker:
    action: "用户仍说不清 → 展示 8 预制 showcase"
    showcase_set:
      - "01: 产品 landing（Editorial Monocle 风）"
      - "02: 产品 landing（Warm Minimal 风）"
      - "03: 产品 landing（Dark Tech 风）"
      - "04: Dashboard（简洁数据风）"
      - "05: Dashboard（暗色科技风）"
      - "06: App 原型（iOS 风格）"
      - "07: 品牌海报（杂志风）"
      - "08: Deck（演示文稿风）"
    
  step_4_demo_generate:
    action: "用户选一个 → 生成 3 个极端差异 Demo"
    demos:
      - "A: 黑白极简（0 color）"
      - "B: 暖色丰富（暖橙 + 米白）"
      - "C: 科技暗色（深蓝 + 绿 accent）"
    note: "每个 Demo ≤ 5 屏，不花时间打磨——只是为了方向确认"
    
  step_5_dna_infer:
    action: "用户选定 Demo → 反向推导 Design DNA"
    input: "用户选的 Demo A"
    output:
      school: "minimalist"
      vectors: { warmth: 2, structure: 8, density: 1, novelty: 3 }
      palette_inferred: { base: "#FAFAFA", accent: "#333333" }
      typography_inferred: { display: "'Inter', sans", body: "'Inter', sans" }
```

**关键规则：** 冷启动不走品牌资产协议——没有品牌可以搜。

---

## R07: 设计债闭环

**问题：** 债创建了没人还。

**优化：** 闭环设计——创建 → 跟踪 → 自动提醒 → 解决验证。

```yaml
design_debt_lifecycle:
  create:
    trigger: "用户说 '先这样' / critique 未通过 / asset 未找到"
    auto_create:
      - "Logo 使用 AI 生成版本"         [severity: high,   effort: 30min]
      - "产品图未找到，使用 placeholder"  [severity: high,   effort: 1hr]
      - "色值从网站推断，非官方"          [severity: medium, effort: 15min]
      - "布局复用模板，未自定义"          [severity: low,    effort: 30min]

  track:
    storage: ".bwvi/debt.json"
    format: |
      {
        "items": [{
          "id": "debt_001",
          "description": "Logo 使用了 AI 生成版本",
          "severity": "high",
          "effort": "30min",
          "status": "open",
          "created_at": "2026-05-04T12:00Z",
          "resolution_hint": "用户提供官方 logo SVG → bwvi asset download <url> --as logo"
        }]
      }

  auto_remind:
    trigger: "Agent 开始新会话且该项目有 open 债"
    behavior: |
      "你上次有 3 项未解决的设计债：
       1. [HIGH] Logo 使用了 AI 生成版本（30min）
       2. [HIGH] 产品图 placeholder（1hr）
       3. [LOW] 布局复用模板（30min）
       
       要先处理前两项再继续吗？"
    
  resolve_verify:
    action: "bwvi debt resolve debt_001 --note '用户提供了官方 SVG'"
    verify: "critique 重新检查 asset_authenticity 指标"
    result: |
      "debt_001 已解决。资产识别度从 0.3 → 1.0 ✓"
```

---

## R08: 缺少 Benchmark → 5 个标准测试用例

**问题：** 没法客观说 BWVI 比现有方案好。

**优化：** 5 个标准验证用例，每个有明确的 pass/fail 标准。

```yaml
benchmark_suite:
  version: "1.0.0"
  
  cases:
    TC01_brand_landing:
      name: "品牌 landing page"
      input: "帮我的精品咖啡品牌 Blue Bottle 做一个 landing page"
      success_criteria:
        - "logo 为真实 SVG 文件（检查 <img src> 引用）"
        - "色值与 bluebottlecoffee.com 官网匹配（≤0.02 oklch 差）"
        - "布局有品牌个性（不是通用模板）"
        - "critique 评分 ≥ 7/10"
      measured_by: "客观指标 + 人工盲审"
      
    TC02_cold_start:
      name: "冷启动 — 无品牌、无参考"
      input: "帮我做个好看的官网，不知道什么风格"
      success_criteria:
        - "触发了冷启动协议（不是闷头生成）"
        - "至少问了 1-2 个问题"
        - "用户选方向后产出一致"
        - "完成了方向→色板→字体→布局的决策链"
      measured_by: "检查 checkpoint 决策记录"
      
    TC03_iteration:
      name: "评审迭代"
      input: '"评审这个页面" → "按评审结果修改"'
      success_criteria:
        - "v2 评分 > v1 评分（客观指标）"
        - "v2 设计债数量 ≤ v1"
        - "每次 new 问题不重复问已确认的决策"
      measured_by: "critique diff + 决策记录"
      
    TC04_recovery:
      name: "中断恢复"
      input: "Agent 生成到一半崩溃 → 恢复 checkpoint"
      success_criteria:
        - "已确认的决策不重新问"
        - "从 checkpoint 的位置继续生成"
        - "最终产出 = 无中断的等价产出的 90%+"
      measured_by: "checkpoint 测试"
      
    TC05_offline:
      name: "离线模式"
      input: "断网状态下完成一次设计生成"
      success_criteria:
        - "bwvi critique 可以运行（仅客观指标）"
        - "资产搜索提示 '离线不可用' 而非崩溃"
        - "生成功能正常（依赖于 Agent 模型）"
      measured_by: "离线环境测试"
```

**每发布前跑一次完整测试套件：**
```bash
bwvi benchmark run
# 运行中: 4/5 通过
# TC01: 通过 [7.2/10]
# TC02: 通过 [方向确认: ✓, 决策链: ✓]
# TC03: 通过 [v1: 5.8 → v2: 7.1]
# TC04: 失败 [checkpoint 恢复率: 60%]
# TC05: 通过 [离线降级正常]
# 
# 结果: 4/5 通过。TC04 需要修复 checkpoint 序列化。
```

---

## R09: Token 预算 → 实测表

**问题：** "3-8 KB 每决策" 是估算，不是实测。

**优化：** 建立 token 预算表，并在首次实现后实测校准。

```yaml
token_budget:

  # 设计阶段 — 预估
  analysis:
    tool_call:               200 tokens
    result_reading:          800 tokens
    knowledge_selection:     300 tokens
    subtotal:                1,300 tokens

  knowledge_loading:
    per_chunk (avg):         2,500 tokens
    chunks_per_session:      3-5
    subtotal:                7,500 - 12,500 tokens

  direction_selection:
    recommendation_display:  1,200 tokens
    user_confirmation:       200 tokens
    subtotal:                1,400 tokens

  palette_typography:
    recommendation:          800 tokens
    user_confirmation:       200 tokens
    subtotal:                1,000 tokens

  generation:
    system_prompt:           1,500 tokens
    user_prompt:             500 tokens
    output:                  3,000 - 6,000 tokens
    subtotal:                5,000 - 8,000 tokens

  critique:
    input (HTML):            3,000 - 6,000 tokens
    output:                  1,000 tokens
    subtotal:                4,000 - 7,000 tokens

  ──────────────────────────────────────────
  单次全流程估算:            20,200 - 31,200 tokens
  单次全流程实测:            TBD（实现后校准）
```

**优化策略：**
- 知识块目标上限：**每个块 ≤ 2,000 tokens**（超了就拆）
- 生成输出截断风险：>4,000 tokens 的 HTML → 需要对内容做 tree-shaking（移除注释、压缩内联 CSS）
- 如果全流程 > 30,000 tokens → 考虑缩短知识块或用更短的评审模式

---

## R10: 没有 Dogfooding → 自举要求

**问题：** 自己不用自己的工具做设计，说明设计还不够好。

**优化：** 在每个 Phase 结束时，要求用 BWVI 生成 BWVI 的物料。

```yaml
dogfooding_requirements:

  Phase_1_deliverable:
    what: "BWVI 的 CLI --help 输出格式"
    how: "用 bwvi generate 设计 --help 的 ASCII 排版"
    verify: "输出的 --help 风格是否一致、可读"
    
  Phase_2_deliverable:
    what: "BWVI 的 README.md + 官网 landing page"
    how: |
      1. bwvi analyze "BWVI Design 官网 landing page"
      2. bwvi direction → 选择 editorial-minimal
      3. bwvi generate → index.html
      4. bwvi critique → 自评 + 修改
      5. 最终产出 = bwvi 官网的 HTML
    verify: "README 和官网全部由 BWVI 生成，不是手写"

  Phase_3_deliverable:
    what: "BWVI 的品牌 spec"
    how: |
      1. bwvi asset logo "bwvi" → 生成 BWVI LOGO
      2. bwvi asset color "bwvi" → 确定 BWVI 品牌色
      3. 整合为 brand-spec.md
    verify: "BWVI 自己的品牌资产由 BWVI 自己管理"

  ongoing:
    - "所有 issue 的设计相关 PR 的 demo 必须带 `Generated by BWVI` 标注"
    - "违反 → PR 打回，要求用 BWVI 重新生成"
```

**硬门槛：** 没有通过自举测试的版本不发布。

```bash
# 发布前的自举检查
bwvi dogfood check
→ "Phase 1 自举: ✅ CLI --help 由 BWVI 生成"
→ "Phase 2 自举: ✅ Landing page 由 BWVI 生成"
→ "Phase 3 自举: ❌ 品牌 spec 未使用 BWVI"
→ "结果: 不满足发布条件。原因: Phase 3 自举未通过。"
```

---

## 汇总：v2.1 变更对 PRD 的影响

| 问题 | 变更类型 | 影响 |
|------|---------|------|
| R01 规模 | Phase 1 重写 | PRD 第 11 章路线图全部重写 |
| R02 离线 | 新增运行模式 | PRD 第 6 章新增 runtime_modes |
| R03 资产速度 | 快慢双档 | PRD 第 4.2 节 asset_pipeline 新增 mode |
| R04 执行契约 | generate tool 改 schema | PRD 第 6 章 generate input 改 |
| R05 评审降级 | 三级评审模式 | PRD 第 8.3 节新增 critique_modes |
| R06 冷启动 | 新增 5 步协议 | PRD 第 2.3 节决策树新增 cold_start 分支 |
| R07 债闭环 | 新增生命周期 | PRD 第 4.7 节设计债扩展 |
| R08 基准 | 新增 5 个测试用例 | PRD 第 12 节新增 benchmark_suite |
| R09 token | 新增预算表 | PRD 第 7 节或新增附录 |
| R10 自举 | 新增 dogfooding 要求 | PRD 第 11 节路线图新增自举检查点 |

接下来需要对 PRD.md 做上述 10 处修改。
