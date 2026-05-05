# BWVI Development Plan — Phase 1a

> 基于 PRD v2.1 核心优先架构
> 周期: 2 天 | 产出: 4 CLI 命令 + 核心引擎闭环

---

## 概述

Phase 1a 的目标不是"功能多"，而是让**飞轮第一次转动**。只需要 4 个命令，让用户能完成一次"分析→决策→生成→评审→反馈"的完整链路，而且系统能从这次使用中学到东西。

```
bwvi init        → 项目初始化
bwvi analyze     → 任务分析 + 方向推荐（含指纹参考）
bwvi generate    → 按决策链生成 HTML
bwvi critique    → 基础自评 + 客观指标
                  ↓
           项目报告（自动生成）
           设计指纹（自动更新）
```

---

## 项目结构

```
E:\程序\bwvi design\bwvi\src\
├── index.ts               CLI 入口 + 命令路由
├── types/
│   ├── decision.ts        决策类型定义
│   ├── project.ts         项目/配置文件类型
│   ├── critique.ts        评审类型
│   └── fingerprint.ts     设计指纹类型
├── engine/
│   ├── analyzer.ts        任务分析器（task + context → 决策路径）
│   ├── composer.ts        提示词组装器（按决策链拼接 prompt）
│   ├── generator.ts       生成调度器（调用 Agent CLI）
│   ├── renderer.ts        HTML 渲染/后处理
│   └── registry.ts        决策注册表 + 执行器
├── checkpoint/
│   ├── manager.ts         checkpoint 读写
│   └── recover.ts         中断恢复
├── critique/
│   ├── objective.ts       客观指标计算
│   └── self-review.ts     5 维自评
├── knowledge/
│   ├── loader.ts          知识块加载器
│   └── cache.ts           session 缓存
├── fingerprint/
│   └── tracker.ts         指纹记录 + 更新 + 推荐
├── report/
│   └── generator.ts       项目报告生成
└── cli/
    ├── init.ts
    ├── analyze.ts
    ├── generate.ts
    └── critique.ts
```

---

## 构建依赖图

```
                    types/ (纯接口定义，无依赖)
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
        engine/       checkpoint/  knowledge/
        (决策执行)     (持久化)     (知识加载)
              │           │
              └──────┬────┘
                     ▼
                critique/       fingerprint/
                (评审)           (指纹追踪)
                     │              │
                     └──────┬───────┘
                            ▼
                       report/
                      (项目报告)
                            │
                            ▼
                       cli/ (命令组装)
                            │
                            ▼
                      index.ts (入口)
```

**构建顺序（严格按依赖）：**

```
Step 1: types/         ← 0 依赖，所有模块的基础
Step 2: checkpoint/    ← 仅依赖 types
Step 3: knowledge/     ← 仅依赖 types
Step 4: engine/        ← 依赖 types + checkpoint + knowledge
Step 5: critique/      ← 依赖 types
Step 6: fingerprint/   ← 依赖 types + checkpoint
Step 7: report/        ← 依赖 types + checkpoint + critique
Step 8: cli/           ← 依赖以上所有
Step 9: index.ts       ← 组装
```

---

## Day 1 计划

### Step 1: types/ — 核心类型定义（1h）

所有数据结构的 TypeScript 接口。不包含业务逻辑。

**文件清单：**

```typescript
// types/decision.ts
// 决策是 BWVI 的核心抽象。每个决策: type + input → output + rationale

type DecisionType =
  | "direction"
  | "palette"
  | "typography"
  | "layout"
  | "information_density"
  | "detail_signature";

interface DesignDecision {
  id: string;
  type: DecisionType;
  inputs: Record<string, unknown>;
  output: Record<string, unknown>;
  rationale: string;
  confidence: number;          // 0-1, <0.6 强制用户确认
  made_by: "agent" | "user" | "rule";
  confirmed_by: "user" | "rule" | null;
  superseded_by?: string;
  created_at: string;          // ISO
}

interface DecisionRegistry {
  // 决策树结构（非线性的有向图）
  root: DecisionType;
  graph: Record<DecisionType, {
    next: DecisionType[];     // 后续决策
    required_inputs: string[];
    knowledge_required: string[];
  }>;
}
```

```typescript
// types/project.ts
interface ProjectConfig {
  name: string;
  created_at: string;
  last_used: string;
  decisions_count: number;
  completed: boolean;
}

interface Checkpoint {
  id: string;
  decisions: DesignDecision[];
  loaded_knowledge: string[];
  artifacts: string[];
  agent_context?: string;
  created_at: string;
}
```

```typescript
// types/critique.ts
interface ObjectiveMetrics {
  color_compliance: number;      // 0-1
  font_compliance: number;
  asset_authenticity: number;
  accent_overuse: number;
  token_efficiency: number;
}

interface SelfReview {
  philosophy: number;   // 0-10
  hierarchy: number;
  detail: number;
  function: number;
  innovation: number;
}

interface CritiqueReport {
  mode_used: "self-plus";
  objective: ObjectiveMetrics;
  self?: SelfReview;
  score: number;
  passed: boolean;
  warnings: string[];
}
```

```typescript
// types/fingerprint.ts
interface DesignFingerprint {
  version: string;
  projects_analyzed: number;
  distribution: Record<DecisionType, Record<string, number>>;
  // e.g. { direction: { "warm-editorial": 3, "dark-tech": 1 } }
  implicit_avoid: string[];
  confidence: "insufficient" | "low" | "medium" | "high";
  last_updated: string;
}
```

**完成标志：** 所有接口编译通过。写一个简单的 type 测试确保结构正确。

### Step 2: checkpoint/ — 文件系统持久化（1h）

**核心逻辑：** 所有持久化走文件系统，零数据库依赖。

```
.bwvi/
├── checkpoints/         JSON 文件，每决策确认后自动写入
│   ├── dec_direction_01.json
│   ├── dec_palette_01.json
│   └── dec_typography_01.json
├── config.yaml          项目配置
├── fingerprint.yaml     设计指纹
└── reports/             项目报告
```

**接口：**

```typescript
// checkpoint/manager.ts
export class CheckpointManager {
  constructor(projectRoot: string);
  save(decision: DesignDecision): Promise<string>;  // ← 每步自动调用
  load(decisionId: string): Promise<DesignDecision>;
  list(): Promise<string[]>;                         // 列出所有已确认决策
  latest(): Promise<string | null>;                  // 最后一个决策 ID
  
  // 恢复用
  getDecisionsAfter(checkpointId: string): Promise<DesignDecision[]>;
}
```

**边界情况：**
- `.bwvi/` 目录不存在 → 自动创建
- JSON 文件损坏 → 返回 E002 错误 + 提示修复方式
- 并发写入 → 小项目不考虑并发（CLI 工具，单用户）

**测试：**
```
✓ 创建 checkpoint → 写入 JSON → 读取 → 校验内容一致
✓ 目录不存在时自动创建
✓ 文件损坏时返回 E002 而非崩溃
```

### Step 3: knowledge/ — 知识块加载（0.5h）

**简单实现：** Phase 1a 不实现动态知识加载。知识块作为内嵌字符串。

```typescript
// knowledge/loader.ts
// Phase 1a: 内嵌 3 个核心知识块
// Phase 2: 改为从 Markdown 文件加载

const EMBEDDED_KNOWLEDGE: Record<string, string> = {
  "direction-advisor": `
    任务分析完成后，根据以下维度推荐 3 个视觉方向:
    1. 品牌语境（如果有品牌）
    2. 目标受众
    3. 情感基调
    
    5 个基础方向（Phase 1a 简化版）:
    - editorial-monocle: 编辑式、克制、文字驱动
    - warm-minimal: 温暖、留白、自然材质
    - tech-utility: 科技感、中性色、数据驱动
    - dark-luxury: 深色、高对比、金属感
    - playful-color: 丰富色彩、有机形状、轻松感
  `,
  "color-theory": `
    色板决策规则:
    - 品牌色优先
    - 无品牌时从方向推导
    - 只使用 1 个 accent 色
    - accent 每屏出现 ≤2 次
    - 使用 oklch 颜色空间
  `,
  "typography-pairing": `
    字体决策规则:
    - display 和 body 必须不同字体
    - display 使用有特点的字体（Newsreader / Fraunces / Space Grotesk）
    - body 使用可读性优先的字体（Inter / Source Sans / system-ui）
  `,
};

export function loadChunk(id: string): string | null {
  return EMBEDDED_KNOWLEDGE[id] ?? null;
}
```

**完成标志：** `loadChunk("direction-advisor")` 返回字符串，`loadChunk("nonexistent")` 返回 null。

### Step 4: engine/ — 决策引擎（3h）

这是最核心的模块。

**组件：**

```typescript
// engine/registry.ts
// 决策注册表——定义了每种决策的输入、输出、后续决策

const DECISION_REGISTRY: DecisionRegistry = {
  root: "direction",
  graph: {
    direction: {
      next: ["palette"],
      required_inputs: ["task_type", "brand_context", "audience"],
      knowledge_required: ["direction-advisor"],
    },
    palette: {
      next: ["typography"],
      required_inputs: ["direction", "brand"],
      knowledge_required: ["color-theory"],
    },
    typography: {
      next: ["layout", "information_density"],
      required_inputs: ["direction", "brand"],
      knowledge_required: ["typography-pairing"],
    },
    information_density: {
      next: ["layout"],
      required_inputs: ["product_type"],
      knowledge_required: [],
    },
    layout: {
      next: ["detail_signature"],
      required_inputs: ["content_inventory", "hierarchy"],
      knowledge_required: [],
    },
    detail_signature: {
      next: [],
      required_inputs: ["direction", "palette"],
      knowledge_required: [],
    },
  },
};

// engine/analyzer.ts
// 接收用户任务 → 输出任务类型 + 推荐方向（含指纹补充）

interface AnalyzerInput {
  task: string;
  context?: {
    brand?: string;
    audience?: string;
    output_format?: string;
  };
}

interface AnalyzerOutput {
  task_type: string;
  knowledge_path: string[];
  recommended_directions: Array<{
    name: string;
    rationale: string;
    from_fingerprint?: boolean;  // ← 如果推荐来自指纹偏好，标注
  }>;
  estimated_tokens: number;
}

// engine/composer.ts
// 按当前已确认的决策 → 组装 generate 的 system prompt

interface ComposeInput {
  base_task: string;
  decisions: DesignDecision[];     // 已确认的决策链
  knowledge_chunks: string[];      // 已加载的知识块
}

interface ComposeOutput {
  prompt: string;                   // 完整的 system + user prompt
  token_estimate: number;
}
```

**决策执行流（核心算法）：**

```typescript
async function executeDecisionChain(task: string, projectRoot: string) {
  // 1. 加载 checkpoint（如果有历史）
  const checkpoint = new CheckpointManager(projectRoot);
  const existing = await checkpoint.list();
  
  // 2. 从最后一个决策继续
  const startFrom = existing.length > 0 
    ? DECISION_REGISTRY.graph[lastDecisionType].next
    : [DECISION_REGISTRY.root];
  
  // 3. 逐个执行决策
  for (const decisionType of startFrom) {
    const registry = DECISION_REGISTRY.graph[decisionType];
    
    // 加载知识块
    const knowledge = registry.knowledge_required.map(loadChunk);
    
    // 组装这一轮的 prompt
    const prompt = composeDecisionStep(decisionType, knowledge, existing);
    
    // 调用 Agent 做决策
    const output = await callAgent(prompt);
    
    // 写入 checkpoint
    const decision = {
      id: `dec_${decisionType}_${Date.now()}`,
      type: decisionType,
      outputs: output,
      ...
    };
    await checkpoint.save(decision);
    
    // 如果置信度 < 0.6，等待用户确认
    if (decision.confidence < 0.6) {
      await waitForUserConfirm(decisionType, output);
    }
  }
}
```

**边界情况：**
- 用户中断 → checkpoint 保存到上一步 → 恢复时从中断点继续
- 所有决策完成后才调用 generate → generate 需要 `confirmed_decisions`
- Agent 返回空/无效决策 → 最多重试 1 次，仍失败则报错提示用户手动选

### Step 5: critique/ — 基础评审（1.5h）

**客观指标（Phase 1a 简化版）：**

```typescript
// critique/objective.ts

export function analyzeColorCompliance(html: string, palette: Palette): number {
  // 提取 HTML 中所有 hex/oklch/rgb 值
  // 计算在 palette 内的比例
}

export function analyzeFontCompliance(html: string, fonts: FontStack): number {
  // 检查 font-family 是否匹配
}

export function analyzeAccentOveruse(html: string): number {
  // 统计 accent 色值在 HTML 中出现的次数
}

export function analyzeTokenEfficiency(html: string): number {
  // HTML 字节数 / 有效内容字符数
}

// critique/self-review.ts
// 生成 5 维自评（见 PRD §8）
```

**边界情况：**
- HTML 为空 → 返回全 0 + warning
- 无法解析 CSS 变量 → fallback 到 hex 直接对比
- Score < 5.0 → 自动标记为"建议重试"（彩票检测种子）

---

## Day 2 计划

### Step 6: fingerprint/ — 设计指纹（1.5h）

**核心逻辑：**

```typescript
// fingerprint/tracker.ts

export class FingerprintTracker {
  constructor(projectRoot: string);
  
  // 每完成一个项目调用
  async recordProject(decisions: DesignDecision[], report: CritiqueReport): Promise<void>;
  
  // 获取当前指纹（用于方向推荐）
  async getFingerprint(): Promise<DesignFingerprint | null>;
  
  // 推荐时参考指纹
  async adjustRecommendations(directions: Direction[]): Promise<{
    adjusted: Direction[];
    from_fingerprint: boolean;
  }>;
}
```

**三种推荐模式：**
```
项目 < 3 → 不启用指纹（数据不够）
项目 3-5 → low confidence，方向列表中标注 "您的团队偏好: X"
项目 5-10 → 第一个推荐来自指纹偏好
项目 10+ → 前两个推荐来自指纹，第三个故意选一个新的（反信息茧房）
```

**边界情况：**
- 指纹文件不存在 → 返回 null，不报错
- 指纹已过期（超过 30 天未更新）→ 继续使用但提示"基于 30 天前的数据"

### Step 7: report/ — 项目报告（1h）

```typescript
// report/generator.ts

interface ProjectReport {
  project_name: string;
  duration_ms: number;
  decisions_made: number;
  decisions_chain: string[];       // 决策类型列表
  critique_final: number;          // 最终评分
  failure_patterns: Array<{
    type: string;
    description: string;
    impact: number;                // 对评分的负面影响
  }>;
  fingerprint_used: boolean;
  fingerprint_updated: boolean;
}

// 项目结束（critique 完成后）自动触发
export async function generateReport(projectRoot: string): Promise<ProjectReport>;
```

### Step 8: CLI 命令实现（2h）

每个命令遵循统一模式：

```typescript
// cli/analyze.ts
export async function analyzeCommand(task: string, options: {
  project?: string;
  context?: string;  // JSON string
}) {
  const config = await loadOrInitProject(options.project);
  
  // 1. 查询指纹
  const fingerprint = new FingerprintTracker(config.root);
  const fp = await fingerprint.getFingerprint();
  
  // 2. 执行分析
  const analyzer = new Analyzer();
  const result = await analyzer.analyze({
    task,
    context: options.context ? JSON.parse(options.context) : undefined,
  });
  
  // 3. 如果指纹存在，调整推荐
  if (fp && fp.confidence !== "insufficient") {
    result.recommended_directions = await fingerprint.adjustRecommendations(
      result.recommended_directions
    );
  }
  
  // 4. 输出
  console.log(JSON.stringify(result, null, 2));
}
```

### Step 9: 自举检查（1h）

用 BWVI 生成 BWVI 的 CLI --help 排版：

```bash
# 1. 现有 CLI 输出 --help 文本
bwvi --help > /tmp/bwvi-help.txt

# 2. 用 BWVI 重新排版这个帮助文本
bwvi analyze "重新排版 BWVI 的 CLI 帮助文本" > /tmp/analysis.json
bwvi generate "..." --direction <choice> > /tmp/redesigned-help.html

# 3. 评审
bwvi critique /tmp/redesigned-help.html
# 评分 ≥ 6.0 则通过
```

---

## 测试策略

### 单元测试（每个模块独立）

```
types/          → 编译时验证（TypeScript 本身就是测试）
checkpoint/     → 写入/读取/错误处理
knowledge/      → 加载已知/未知 ID
engine/         → 决策链执行、边界情况
critique/       → 空 HTML、品牌色匹配、accent 计数
fingerprint/    → 0/3/5/10 项目的不同行为
```

### 集成测试（CLI 端到端）

```bash
# TC01: 品牌 landing page
bwvi init test-project
bwvi analyze "coffee brand landing page"
bwvi generate "coffee brand landing page" --direction warm-minimal
bwvi critique output.html

# 验证:
# - init 创建了 .bwvi/
# - analyze 输出了 3 个方向
# - generate 产生了 index.html
# - critique 返回了评分
# - .bwvi/fingerprint.yaml 存在
# - .bwvi/reports/ 有项目报告
```

### 基准测试（5 个标准用例，来自 PRD §6）

```bash
# 每次发布前运行
bwvi benchmark run
→ 5/5 通过 或 4/5（标记失败用例）
```

---

## Day 排期总表

| 天 | 步骤 | 模块 | 预估 | 累计 |
|----|------|------|------|------|
| D1 | 1 | types/ 类型定义 | 1h | 1h |
| D1 | 2 | checkpoint/ 持久化 | 1h | 2h |
| D1 | 3 | knowledge/ 加载器 | 0.5h | 2.5h |
| D1 | 4 | engine/ 决策引擎 | 3h | 5.5h |
| D1 | 5 | critique/ 评审 | 1.5h | 7h |
| D2 | 6 | fingerprint/ 指纹 | 1.5h | 8.5h |
| D2 | 7 | report/ 项目报告 | 1h | 9.5h |
| D2 | 8 | CLI 命令 | 2h | 11.5h |
| D2 | 9 | 自举检查 | 1h | 12.5h |

**总计：约 12.5 小时（2 个完整工作日）**

---

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 语言 | TypeScript (Bun) | 类型安全，Bun 自带 TS 支持无需编译 |
| 包管理 | 单文件发布 | 不需要 npm 包的 Phase 1 只需 `bun run src/index.ts` |
| 配置格式 | YAML | 人类可读写（vs JSON 无注释） |
| 评审引擎 | HTML 纯文本解析 | Phase 1a 不需要 headless browser |
| 方向推荐 | 基于规则的确定性输出 | Phase 1a 不用 AI 做推荐，用模板+随机组合 |
| 生成 | 输出 Agent prompt 到 stdout | 用户手动复制给 Agent / 后续接 MCP |
| 持久化 | JSON 文件 | 零依赖 |

---

## 发布条件

```bash
# 1. 4 个 CLI 命令全部正常工作
bwvi init --help
bwvi analyze --help
bwvi generate --help
bwvi critique --help

# 2. 完整链路跑通
bwvi init my-project && \
bwvi analyze "test task" && \
bwvi generate "test task" --direction editorial-monocle && \
bwvi critique output.html
→ 退出码 0

# 3. 自举通过
cat .bwvi/fingerprint.yaml      # 存在且有内容
cat .bwvi/reports/*.yaml        # 存在且有内容

# 4. 基准测试 ≥ 4/5
bwvi benchmark run
```

---

*开发计划应与 PRD.md 一同阅读。PRD 定义了"为什么"，本文件定义了"怎么做"。*
