# BWVI Design — 最终产品需求文档 v2.0

> 版本: 2.0.0
> 状态: 最终草案
> 日期: 2026-05-04
>
> 本 PRD 经过 10 轮深度迭代，融合 huashu-design（设计哲学深度）和 open-design（平台工程广度）
> 的核心精华，目标是定义一套**近乎完美的 Agent 原生设计决策协议**。

---

## 目录

0. [设计哲学](#0-设计哲学)
1. [产品概述](#1-产品概述)
2. [核心概念：设计决策协议](#2-核心概念设计决策协议)
3. [设计语法层](#3-设计语法层)
4. [10 个核心子系统](#4-10-个核心子系统)
5. [数据模型](#5-数据模型)
6. [API 规范](#6-api-规范)
7. [知识管理体系](#7-知识管理体系)
8. [质量保证体系](#8-质量保证体系)
9. [多 Agent 编排](#9-多-agent-编排)
10. [生态与反馈](#10-生态与反馈)
11. [设计能力迭代系统](#11-设计能力迭代系统self-improving-design-engine)
12. [实现路线图](#12-实现路线图)
13. [成功指标](#13-成功指标)
14. [附录：精华溯源](#14-附录精华溯源)

### 层级说明

| 标记 | 含义 |
|------|------|
| **[核心]** | BWVI 的护城河，Phase 1 必须完成。别人抄不走。 |
| **[核心-可替换]** | 核心但可以用社区插件替换实现 |
| **[插件]** | 核心不依赖，晚做或社区做 |
| **[核心-生态层]** | 核心的外部接口，定义协议不实现具体插件 |

---

## 0. 设计哲学

### 0.1 核心第一性原理

```
设计的本质 = 在约束中做决策
BWVI 的本质 = 给 Agent 一个决策框架，不给答案
```

### 0.2 十条指导原则

每条原则标注来源：

| # | 原则 | 来源 | 反例 |
|---|------|------|------|
| 0 | **先验证事实，再碰设计** | huashu #0 | 凭记忆说"Pocket 4 还没发布" |
| 1 | **展示假设再填充** | huashu Junior Designer | 闷头做完发现方向错了 |
| 2 | **资产是设计的第一公民，不是附庸** | huashu 品牌协议升级 v1.1 | 用 CSS 剪影代替产品图 |
| 3 | **用真材实料，不编造** | huashu 反 AI slop | Lorem ipsum、假 stats |
| 4 | **一个细节 120%，其他 80%** | huashu 品位锚点 | 所有地方平均用力 |
| 5 | **渐进约束，不一次性锁死** | BWVI 创新 | 58KB 规则一次塞完 |
| 6 | **决策可追溯，可回滚** | BWVI 创新 | 重做整条链条 |
| 7 | **不自我评审** | BWVI 创新 | Agent 自评分数虚高 |
| 8 | **宁缺毋滥** | huashu 5-10-2-8 质量门 | 素材凑数降低品质 |
| 9 | **知识有版本，不永远最新版** | BWVI 创新 | 用了过时的品牌色 |

### 0.3 设计决策 vs 模板填充

```
模板填充思维:                       设计决策思维:
"加载 landing-page skill"           "这个任务是 landing page → 需要做:
   → 用模板.html                        - 方向决策（3选1）
   → 替换内容                            - 色板决策（品牌约束）
   → 输出                                - 字体决策（Display/Body）
                                          - 布局决策（信息层级）
                                          - 资产决策（Logo下载 → 产品图搜索）
                                          - 细节决策（1个120%的签名）"
```

### 0.4 核心 vs 插件架构（最重要）

**前提：** 其他工具能抄你任何功能。决策树、资产搜索、评审体系、多 Agent——这些都只是 prompt 技巧，不是护城河。

**唯一真正的护城河：使用即训练。**

```
你用 BWVI 做设计
  → 它记录每次决策（方向偏好 / 色板选择 / 失败模式）
  → 它从每项目中学习（什么导致了低分、什么让你满意）
  → 它自动改进自己（知识块优化、指纹更新）
  → 下次它更懂你
  → 你做得更快、质量更高
  → 你用得更频繁
```

**这就是 BWVI 的飞轮。别的都可以抄，但用户数据 + 学习曲线抄不走。**

基于这个前提，BWVI 分为两层：

```
核心层（先做，做深，做到不可替代）
├── 设计决策引擎      — 方向→色板→字体→布局→签名的决策协议
├── 设计指纹系统      — 隐式学习团队偏好，越用越准
└── 自进化引擎        — 项目中采集→模式挖掘→A/B验证→知识更新
    └── 外部设计学习    — 从用户提供的设计参考中学习吸收

插件层（后做，可拼装，可替换，社区可贡献）
├── 资产搜索          — logo/色值/产品图搜索下载
├── 评审模式          — 交叉评审 / 形成性评审 / 视觉回归
├── 多 Agent 编排     — 角色分离流水线
├── 设计债            — 追踪未完成项
├── 媒体管道          — 图片/视频/音频生成
├── 冷启动 showcase   — 预制展示样例
└── ...（插件协议开放，社区可贡献）
```

**核心问题：** 核心层只有 BWVI 有。插件层别人也能做。

所以 Phase 1 只做核心层。插件层只定义接口协议，不实现。社区可以做、用户自己选。

### 0.5 插件接口协议

每个插件遵循统一格式：

```yaml
# 插件注册文件：.bwvi/plugins/<name>/manifest.yaml
bwvi-plugin:
  name: "asset-search"
  version: "1.0.0"
  hooks:                     # 插件挂载点
    - "pre_analyze"          # 分析前执行
    - "post_direction"       # 方向确认后
    - "pre_generate"         # 生成前
    - "post_critique"        # 评审后
  provides:                  # 提供的能力
    - "tool:asset_search"
    - "tool:asset_download"
  requires:                  # 依赖
    - "network"
  install: "bwvi plugin install asset-search"
```

**核心不强依赖插件：** 没有资产搜索插件，generate 还是能跑（只是不用真实 logo 用 placeholder）。核心不依赖于任何插件。

---

## 1. 产品概述 [核心]

### 1.1 一句话定位

> **BWVI 不是一个设计工具。它是一个设计决策协议——让 AI Agent 像资深设计师一样做决策，而不是像模板填充器一样输出。**

### 1.2 能力矩阵

| 能力 | 来源 | BWVI 吸收 |
|------|------|-----------|
| Junior Designer 流程 | huashu | → 决策协议的基础工作流 |
| 5 步品牌资产协议 | huashu | → Asset Pipeline（含 5-10-2-8 质量门） |
| 反 AI slop 清单 | huashu + open-design craft | → 设计语法层的约束规则 |
| 5 维评审体系 | huashu | → 评审子系统的 formative + summative 模式 |
| 5 流派 × 20 设计哲学 | huashu | → 方向顾问注册表（可扩展） |
| 31 个 Skills | open-design | → 模板种子系统（seed→compose→customize） |
| 129 设计系统 | open-design | → 品牌系统 + 继承模型 + 新鲜度检查 |
| Craft 通用规则 | open-design | → 设计语法层的原子单元 |
| 客观 Linter | open-design | → 客观指标引擎 |
| 多 Agent 检测 | open-design | → 多角色编排（角色分离） |
| 媒体生成 | open-design | → 原生决策类型（image/video/audio） |
| 多格式导出 | open-design | → 输出渲染器注册表 |
| 资产真实来源 | huashu 5-10-2-8 | → 置信度评分 + 许可追踪 + 版权标注 |
| 品牌-spec.md | huashu | → 设计简报（Design Brief）实体 |

### 1.3 与现有生态的关系

```
              ┌─────────────────┐
              │   Claude Design  │  ← 灵感来源（artifact-first）
              └────────┬────────┘
                       │ 自研
         ┌─────────────┴─────────────┐
         ▼                           ▼
  ┌──────────────┐          ┌────────────────┐
  │ Huashu-Design│          │  Open-Design   │  ← 21.8k stars
  │  (Skill)     │          │  (Platform)     │
  └──────┬───────┘          └───────┬────────┘
         │ 哲学深度                  │ 工程广度
         └──────────┬──────────────┘
                    ▼
          ┌─────────────────┐
          │   BWVI Design   │  ← 决策协议层，吸收双方精华
          │  (Protocol)     │
          └─────────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
    ┌────────┐          ┌──────────┐
    │ Agent  │          │ 用户     │  ← 可以是人类或 Agent
    │ (MCP)  │          │ (CLI)    │
    └────────┘          └──────────┘
```

---

## 2. 核心概念：设计决策协议 [核心]

### 2.1 什么是设计决策

一个设计决策是**不可再分的最小设计选择单元**。

```typescript
interface DesignDecision<TInput, TOutput> {
  type: DecisionType;
  id: string;
  
  // 输入
  inputs: TInput;
  constraints: Constraint[];
  context: DecisionContext;     // 上游已确认的决策
  
  // 知识依赖
  knowledge_required: string[];  // 需要加载的知识块
  knowledge_loaded: string[];    // 实际加载的
  
  // 产出
  output: TOutput;
  rationale: string;             // 为什么做这个选择 ← huashu Junior Designer 的「展示假设」
  confidence: number;            // 0-1，< 0.6 时强制问用户
  
  // 审计
  made_by: "agent" | "user" | "rule";
  confirmed_by: "user" | "rule";
  created_at: string;
  
  // 版本
  iteration: number;
  superseded_by?: string;        // 被哪个新决策取代了
}
```

### 2.2 决策类型注册表

| 类型 ID | 名称 | 输入 | 输出 | 核心知识块 | 来源 |
|---------|------|------|------|-----------|------|
| `direction` | 方向决策 | 任务描述、品牌语境 | {school, personality, keywords} | direction-library/*, showcase-index | huashu |
| `palette` | 色板决策 | 品牌约束、方向、受众 | {primary, accent, neutral, semantic} 各含 oklch | color-theory, brand-protocol-step4 | huashu + open-design |
| `typography` | 字体决策 | 品牌约束、场景(web/print) | {display, body, mono} font stacks | typography-rules | open-design craft |
| `layout` | 布局决策 | 内容量、信息层级 | {pattern, grid, breakpoints, rhythm} | layout-patterns, content-density | huashu 品位锚点 |
| `asset_logo` | Logo 决策 | 品牌名 | {source, format, filepath, confidence} | brand-protocol-steps 1-5 | huashu |
| `asset_imagery` | 配图决策 | 主题、风格方向 | {type: search/generate/placeholder, sources[], fallback} | asset-sourcing, 5-10-2-8 | huashu |
| `detail_signature` | 签名细节决策 | 确认的方向 | {what, where, why} — 1 个 120% 细节 | taste-anchors | huashu |
| `motion` | 动效决策 | 场景、品牌 | {type, duration, easing, elements} | motion-patterns | open-design |
| `media` | 媒体决策 | 内容、格式 | {type: image/video/audio, params} | media-models, prompt-templates | open-design |
| `information_density` | 信息密度决策 | 产品类型 | {mode: restrained/informational/dense, reasoning} | taste-anchors (信息密度分型) | huashu |

### 2.3 决策树（完整路径）

```
ROOT: task_received
│
├── 0. fact_check [P0]
│   └── WebSearch → product-facts.md
│
├── 1. brief_consolidation [P0]
│   ├── audience? ["创始人 / 投资人 / 终端用户"]
│   ├── tone?  ["专业 / 温暖 / 先锋 / 权威 / 温柔"]
│   ├── output_format?  ["landing / deck / mobile / dashboard / poster"]
│   └── brand_context?  ["有品牌 / 有参考 / 空白"]
│
├── 1b. cold_start_branch [P0] ← 新增：当 brand_context = "空白"
│   ├── step_1_extract:   从描述提取线索，置信度低时承认
│   ├── step_2_ask_minimal: 最多 2 个问题（"给谁看" + "喜欢什么风格"）
│   ├── step_3_showcase:  展示 8 预制 showcase → 用户挑
│   ├── step_4_demo:      生成 3 个极端差异原始 Demo（≤5 屏/个）
│   │   ├── A: 黑白极简（0 color）
│   │   ├── B: 暖色丰富（暖橙 + 米白）
│   │   └── C: 科技暗色（深蓝 + 绿 accent）
│   └── step_5_dna_infer: 用户选定 → 反向推导 Design DNA
│       → 输出 {school, vectors, palette_inferred, typography_inferred}
│       → 跳转到 step 3（information_density）
│
├── 2. direction [P0]
│   ├── 有品牌 → skip（用品牌 spec）
│   └── 无品牌 → 方向顾问 → 3 个推荐 → user 选
│
├── 3. information_density [P0]
│   ├── AI/数据/上下文感知产品 → dense mode
│   └── 其他 → restrained mode
│
├── 4. palette [P0]
│   ├── 品牌色存在 → 提取 + 扩展
│   └── 无品牌 → 从方向推导
│
├── 5. typography [P0]
│   ├── 品牌字体存在 → 使用
│   └── 无品牌 → 从方向选择配对
│
├── 6. asset_sourcing [P0]
│   ├── logo [真实文件 / AI 生成 / 诚实 placeholder]
│   ├── product_imagery [搜索 / AI 生成 / placeholder]
│   └── ui_screenshots [搜索 / 用户提供 / placeholder]
│
├── 7. layout [P1]
│   ├── content inventory
│   ├── information hierarchy
│   └── grid selection
│
├── 8. detail_signature [P1]
│   └── 1x 120% detail
│
├── 9. generate [P0]
│   └── compose → render → output
│
├── 10. critique [P0]
│   ├── objective_metrics → pass/fail
│   ├── self_review → score
│   └── cross_review → diff + scores
│
└── 11. deliver [P0]
    ├── html + assets
    ├── report.md (rationale + scores + debt)
    └── brand-spec.md (更新版)
```

### 2.4 决策上下文传递

每个决策的产出成为下游决策的输入约束：

```
direction.output.school = "editorial-monocle"
    ↓ 约束 palette 的选择范围
palette.output.primary = oklch(0.62 0.12 45)
    ↓ 约束所有后续颜色使用
typography.output.display = "'Newsreader', serif"
    ↓ 约束 layout 中的标题渲染风格
asset_logo.output.filepath = "assets/dji/logo.svg"
    ↓ 约束 generate 中的 <img src> 引用
```

这就是"渐进约束"的实现机制——**约束不是一次性给的，是沿着决策链逐步积累的。**

### 2.5 设计协商模式（Design Negotiation）

**问题：** 传统设计工具是"Agent 提议 → 用户接受/拒绝"的二元决策。但真实设计场景中，决策是**协商**——"我希望左偏一点，但不要太多"。

**方案：** 每个决策支持三态协商链路：

```
Agent 提议:
  "Linear 的绿 accent（oklch 0.62 0.18 135）传达科技感但偏冷。
   我可以把 accent 向橙色偏移 15° 来增加温暖感，
   代价是偏离品牌色 0.02 oklch。接受吗？"

用户回应:
  模式 A: "接受"          → 确认采纳
  模式 B: "接受，但偏 10° 不是 15°"  → 带参数修改后采纳
  模式 C: "不要，换方向"   → 回退到方向决策

Agent 根据用户回应:
  模式 B → 计算新值: oklch(0.62 0.18 120) → 写入决策记录
          → 附带标注: "用户协商修改 offset: 15→10"
```

**协商类型定义：**

```yaml
negotiation_types:
  continuous:
    description: "连续值的协商（色相、大小、间距）"
    format: "当前值 → 建议值 → 用户指定中间值"
    example:
      initial: "accent 色相 135°"
      propose: "偏移 +15° 到 150°"
      accept: "+10° 到 145°"
      delta_log: { dimension: "hue", from: 135, proposed: 150, accepted: 145 }
    
  discrete:
    description: "离散选择的协商（字体、布局模式）"
    format: "当前选项 → 备选 A/B/C → 用户选 或 mix"
    example:
      initial: "Editorial 方向"
      propose: "备选: Minimal / Warm / Experimental"
      accept: "Minimal 色板 + Editorial 布局 → mix"
      mix_log: { combined: ["minimal-palette", "editorial-layout"] }
    
  binary:
    description: "是非决策（要不要某个特性）"
    format: "提议 → 接受/拒绝 → 可选理由"
    example:
      propose: "加微交互动效"
      reject_reason: "当前阶段要快速原型，动效留给 Phase 2"
      debt_record: { deferred: "micro-interaction", target_phase: "Phase 2" }
```

**协商日志（可审计）：**

```json
{
  "decision_id": "dec_palette_01",
  "negotiations": [
    {
      "round": 1,
      "proposal": { "accent_hue_shift": 15 },
      "rationale": "增加温暖感，代价 0.02 oklch 偏差",
      "user_response": "accept_with_modification",
      "user_input": 10,
      "final_value": 10,
      "delta_logged": true
    }
  ]
}
```

**关键规则：** 协商不是无限制的。任何协商修改不能触发**回溯校验**——如果用户协商后的值导致客观指标 < 阈值，Agent 必须提示：

```
"你协商后的 accent (hue 150°) 与品牌色偏差 0.04 oklch，
超过我们的阈值 0.025。要:
A. 保持这个值，标记为设计债
B. 缩小偏移到 8°
C. 放弃修改"
```

---

## 3. 设计语法层 [核心]

### 3.1 原子视觉单元

从 huashu 的"品位锚点"和 open-design 的 craft/ 抽象出的设计语法：

```typescript
interface DesignGrammar {
  // 色彩
  color: {
    primary: OKLCH;
    accent: OKLCH;       // 仅 1 个 accent ← huashu 反 slop
    neutral: OKLCH[];
    semantic: { success: OKLCH; warning: OKLCH; error: OKLCH };
    surface: OKLCH[];
    accent_budget: 2;     // 每屏 visible accent ≤ 2 ← open-design craft
  };
  
  // 字体（强制 display ≠ body）← huashu 品位锚点
  typography: {
    display: FontStack;    // 有特点的 display 字体
    body: FontStack;       // 可读性优先
    mono?: FontStack;
    scale: number[];       // 字阶
  };
  
  // 间距
  spacing: {
    base: 8;               // 基准单位
    scale: [4,8,16,24,32,48,64,96,128];  // 比例尺
    density: "compact" | "comfortable" | "expansive";
  };
  
  // 布局节奏
  rhythm: {
    section_pattern: "alternating" | "consistent" | "asymmetric";
    breakpoints: number[];
  };
  
  // 动效 DNA
  motion: {
    default_duration: 200;   // ms
    easing: "ease-out";
    personality: "snappy" | "smooth" | "dramatic" | "none";
  };
  
  // 签名细节类型 ← huashu: "一个细节 120%"
  signature_type: 
    | "typography_flourish"    // 精心挑选的引语字体
    | "color_punch"           // 一个非传统色点缀
    | "micro_interaction"     // 按钮 2px 下移
    | "texture_overlay"       // 极淡纹理背景
    | "layout_tension"        // 不对称布局创造动感
    | "data_charm"            // 一个精心设计的数据展示
    | null;                   // 尚未决定
}
```

### 3.2 设计个性（Design DNA）

这是 BWVI 独有的创新——在决策之上加一层**个性偏好**，确保多页面/多轮迭代间的一致性：

```yaml
design_dna:
  # 从 huashu 5 流派 × 20 哲学继承
  school: "editorial-monocle"     # 主流派
  
  # 个性向量 (各 0-10)
  vectors:
    warmth: 3                     # 冷 vs 暖
    structure: 8                  # 自由 vs 严谨
    density: 2                    # 克制 vs 丰富
    novelty: 5                    # 传统 vs 先锋
    playfulness: 3                # 严肃 vs 趣味
  
  # 偏好锚点
  prefer:
    photography_over_illustration: true
    restraint_over_ornament: true
    asymmetry_over_symmetry: false
  
  # 禁区（继承 brand-spec.md 的 anti-patterns）
  avoid:
    - "圆形渐变"
    - "emoji 图标"
    - "多色聚类（除非数据有 ≥3 维度）"
```

Design DNA 在项目初始化时建立，所有后续决策参考它保持一致。

### 3.3 信息密度分型（继承 huashu）

```yaml
# 分型规则
information_density:
  types:
    restrained:                   # 默认
      apply_when: "产品不是 AI/数据/上下文感知类"
      rules:
        - "少一层容器、少一个 border"
        - "每个元素 earn its place"
        - "不给每个标题配 icon"
    
    informational:                # 高密度
      apply_when: "产品核心卖点是智能/数据/上下文感知"
      rules:
        - "每屏 ≥ 3 处可见的产品差异化信息"
        - "非装饰性数据优先"
        - "对话/推理片段展示"
    
    dense:                        # 极端密度
      apply_when: "dashboard / analytics / monitor"
      rules:
        - "数据可视化优先"
        - "支持扫视"
        - "层次化信息分组"
```

### 3.4 Design Token 统一接口（BWVI 创新）

**问题：** 传统流程中，决策的产出是"散文"——Agent 理解色板描述，然后自己决定怎么在 CSS 中用。同一套色板，十个 Agent 可能有十种实现方式。

**方案：** 每个设计决策的输出归一化为 **Design Token**（CSS 自定义属性）。

```yaml
# 色板决策的 token 输出
decision_palette_tokens:
  --color-primary: "oklch(0.62 0.12 45)"
  --color-accent: "oklch(0.55 0.18 25)"
  --color-surface: "oklch(0.98 0.01 85)"
  --color-text: "oklch(0.15 0.02 20)"
  --color-success: "oklch(0.65 0.15 145)"
  --radius-sm: "6px"
  --radius-md: "12px"

# 字体决策的 token 输出
decision_typography_tokens:
  --font-display: "'Newsreader', 'Georgia', serif"
  --font-body: "'Source Sans 3', system-ui, sans-serif"
  --font-mono: "'JetBrains Mono', monospace"
  --font-scale: [12, 14, 16, 20, 24, 32, 48, 64]

# 间距决策的 token 输出
decision_spacing_tokens:
  --space-unit: "8px"
  --space-scale: [4, 8, 16, 24, 32, 48, 64, 96, 128]
  --layout-max-width: "1200px"
  --layout-grid-columns: 12
```

**收益：**
- 渲染器（Agent / Figma 插件 / PDF 引擎）只需读 token，无需重新理解"散文"
- 设计决策和最终渲染完全解耦
- Token 可被 Lint：检查页面是否使用了 `--color-primary` 之外的色值
- Token 可版本对比：v1 的 accent 是 `oklch(0.55 0.18 25)`，v2 变成 `oklch(0.58 0.15 30)`——差异精确到小数

**Token 继承链：**

```
设计系统 token（来自 brand-spec.md）
  └── 决策覆盖 token（方向/色板/字体的具体选择）
      └── 项目自定义 token（用户手动覆盖）
          └── 页面实例 token（当前页面的特殊调整）
```

每一层 override 上层。Agent 渲染时从最底层开始读，逐层向上合并。

### 3.5 设计指纹（Design Fingerprint）

**问题：** 每个团队都有隐式偏好——"我们从来不用紫色"、"我们喜欢大留白"、"我们的按钮用圆角"。但传统工具每次都要显式配置。

**方案：** BWVI 从历史决策中隐式学习团队偏好，形成设计指纹。

```yaml
# .bwvi/fingerprint.yaml — 自动生成，无需手动配置
fingerprint:
  version: "1.0"
  projects_analyzed: 5

  # 决策分布
  distribution:
    direction:
      warm-editorial:  3  # 60% — 强烈偏好
      editorial-monocle: 1
      dark-tech:        1
    
    density:
      restrained:       4  # 80%
      informational:    1
    
    accent_color_delta:
      # 团队偏好的 accent 色相区间
      mean: 25           # 暖色倾向
      stddev: 12         # 偏差不大——一致性高

  # 隐式禁区（从历史中发现从未使用过）
  implicit_avoid:
    - "紫色系 accent"
    - "衬线 display 字体"
    - "暗色模式"

  # 置信度
  confidence: "medium"  # ≥5 项目 → high；≥10 → 可作为默认

  # 新鲜度
  last_updated: "2026-05-04"
```

**使用方式：**

```
bwvi analyze "SaaS 产品 landing page"
→ 检测到项目有设计指纹
→ direction 推荐时：
   第 1 个: warm-editorial（基于团队偏好）
   第 2 个: 在偏好附近做小变化
   第 3 个: 故意选一个团队从未试过的方向（防止信息茧房）
   → 标注 "推荐 1 基于团队历史偏好"
```

**工作机制：**
- 每个项目结束时，决策历史汇总到 fingerprint
- 少于 3 个项目时不启用（数据不足）
- 3-5 个项目 → `confidence: low`，仅作为参考建议
- 5-10 个项目 → `confidence: medium`，优先推荐
- 10+ 个项目 → `confidence: high`，可作为默认值（用户仍可修改）

**反信息茧房机制：** 即使用户历史偏好 80% 选 warm-editorial，第三个推荐位**故意选一个从未试过的方向**。防止设计风格固化。

---

## 4. 10 个核心子系统 [核心+插件混合]

### 4.1 方向顾问（Direction Advisor） [核心-可替换]
### 4.2 资产管道（Asset Pipeline） [插件]
### 4.3 评审引擎（Critique Engine） [插件]
### 4.4 品牌系统（Brand System） [插件]
### 4.5 模板种子系统（Template Seed） [插件]
### 4.6 设计简报（Design Brief） [核心]
### 4.7 设计债追踪 [插件]
### 4.8 多角色编排 [插件]
### 4.9 Checkpoint 与恢复 [核心]
### 4.10 媒体管道（Media Pipeline） [插件]

**来源：** open-design 的 GPT-image-2 / Seedance / HyperFrames + audio-jingle

```typescript
type MediaDecision = {
  type: "image" | "video" | "audio";
  
  input: {
    concept: string;
    style_reference: string;     // 方向+色板
    format: string;              // png / mp4 / mp3
    dimensions?: { w: number; h: number };
    duration?: number;           // seconds
  };
  
  provider: {
    image: "gpt-image-2" | "gemini-flash" | "seedance";
    video: "seedance-2.0" | "hyperframes";
    audio: "audio-jingle" | "sfx-composer";
  };
  
  output: {
    filepath: string;
    prompt_used: string;          // 可复现
    attribution?: string;         // 版权归属
  };
};
```

**93 个预制 prompt 模板**（来自 open-design prompt-templates/）：
- 43 gpt-image-2 prompt（海报、头像、信息图、插画…）
- 39 Seedance prompt（产品展示、场景、氛围…）
- 11 HyperFrames prompt（动态排版、数据动画、logo 开场…）

Agent 不凭空写 prompt，而是从模板库加载 → 按当前决策参数化 → 提交。

---

## 5. 数据模型 [核心]

### 5.1 核心实体关系

```
Project 1──N Session
Session 1──N Decision
Session 1──N Checkpoint
Session 1──1 Brief
Session 1──1 DesignDNA
Session 1──N CritiqueReport
Session 1──N DesignDebtItem
Project 1──N BrandCache
BrandCache 1──1 BrandFreshness
KnowledgeChunk N──N Session (当前加载的)
```

### 5.2 开放决策链格式

所有决策可导出为 JSON，实现**完全可审计**：

```json
{
  "decisions": [
    {
      "type": "direction",
      "id": "dec_direction_01",
      "output": {"school": "editorial-monocle", "vectors": {...}},
      "rationale": "用户要做咖啡品牌 landing page，目标受众是精品咖啡爱好者，editorial 风格能传递品质感和故事性",
      "confidence": 0.85,
      "made_by": "agent",
      "confirmed_by": "user",
      "knowledge_used": ["direction-advisor", "direction-library/editorial-monocle"],
      "timestamp": "2026-05-04T12:00:00Z"
    }
  ],
  "critique": {
    "objective": {...},
    "self": {...},
    "cross": {...}
  },
  "debt": [...],
  "dna": {...},
  "knowledge_version": "2.1.0"
}
```

这个 JSON 本身就是**设计过程的审计日志**——每次交付都附带，让用户完全理解"为什么做成了这样"。

---

## 6. API 规范 [核心]

### 6.1 MCP Tools 完整清单

```json
[
  { "name": "analyze",             "desc": "分析设计任务 → 路由 + 知识路径" },
  { "name": "brief",               "desc": "创建设计简报 → 返回结构化 brief" },
  { "name": "directions",          "desc": "推荐 3 个视觉方向" },
  { "name": "decision_make",       "desc": "做单个设计决策（通用）" },
  { "name": "decision_get",        "desc": "查询历史决策" },
  { "name": "decision_rollback",   "desc": "回滚到指定决策" },
  { "name": "generate",            "desc": "异步生成设计（返回 task_id）" },
  { "name": "generate_status",     "desc": "查询生成进度" },
  { "name": "critique",            "desc": "评审产出文件" },
  { "name": "critique_diff",       "desc": "对比两个版本的评审差异" },
  { "name": "asset_search",        "desc": "搜索品牌资产" },
  { "name": "asset_download",      "desc": "下载资产" },
  { "name": "asset_verify",        "desc": "验证资产质量（5-10-2-8）" },
  { "name": "knowledge_load",      "desc": "按需加载知识块" },
  { "name": "knowledge_list",      "desc": "列出可用知识块" },
  { "name": "knowledge_check_version", "desc": "检查知识版本" },
  { "name": "checkpoint_save",     "desc": "保存当前 session" },
  { "name": "checkpoint_restore",  "desc": "恢复 session" },
  { "name": "brand_cache",         "desc": "缓存品牌设计系统" },
  { "name": "brand_freshness",     "desc": "检查品牌数据新鲜度" },
  { "name": "dna_init",            "desc": "初始化项目 design DNA" },
  { "name": "debt_list",           "desc": "列出设计债" },
  { "name": "debt_add",            "desc": "添加设计债" },
  { "name": "debt_resolve",        "desc": "解决设计债" }
]
```

### 6.2 CLI 快速映射

```bash
bwvi analyze <task>
bwvi brief                               # 交互式创建设计简报
bwvi directions <task>                   # 方向推荐
bwvi generate <task> [--direction <d>]   # 生成
bwvi critique <file> [--cross] [--diff <v>]  # 评审
bwvi asset search <brand>                # 资产搜索
bwvi asset verify <path>                 # 5-10-2-8 质量验
bwvi knowledge list                      # 知识列表
bwvi checkpoint restore <id>             # 恢复 checkpoint
bwvi debt list                           # 设计债列表
bwvi debt add "<描述>" --severity high   # 添加设计债
bwvi feedback <file> <score>             # 人工反馈
bwvi history                             # 质量趋势
bwvi init                                # 项目初始化
```

---

## 7. 知识管理体系 [核心]

### 7.1 知识块全景

```
knowledge/
├── 00-fact-check/             ← huashu #0 原则
│   ├── product-verification.md    事实验证协议
│   └── search-strategies.md       搜索策略
│
├── 01-brand-protocol/         ← huashu 核心精华
│   ├── step1-ask.md              问资产（带清单模板）
│   ├── step2-search.md           5 轮搜索策略
│   ├── step3-download.md         三条兜底路径
│   ├── step4-verify-extract.md   grep 色值+5-10-2-8 质量门
│   ├── step5-brand-spec.md       写入规范
│   ├── logo-exception.md         Logo 例外规则
│   └── quality-gate-5-10-2-8.md  质量门详细规程
│
├── 02-anti-slop/              ← huashu + open-design craft
│   ├── cardinal-sins.md          7 宗大罪
│   ├── soft-tells.md             P1 警告
│   ├── polish-tells.md           P2 打磨项
│   ├── soul-rules.md             如何注入灵魂（80% 模式+20% 个性）
│   └── avoidance-logic.md        为什么这些是 slop
│
├── 03-junior-designer/        ← huashu 工作流
│   ├── assumption-first.md       先展示假设
│   ├── placeholder-ethics.md     诚实 placeholder 规范
│   ├── checkpoint-flow.md        分步检查点流程
│   └── variation-strategy.md     变体策略
│
├── 04-direction-advisor/      ← huashu 20 种哲学
│   ├── advisor-flow.md           顾问流程（Phase 1-8）
│   ├── showcase-index.md        预制 showcase 索引
│   ├── 01-information-architecture.md   Pentagram 派
│   ├── 02-motion-poetics.md             Field.io 派
│   ├── 03-minimalism.md                 Kenya Hara 派
│   ├── 04-experimental.md               Sagmeister 派
│   └── 05-eastern-philosophy.md         东方哲学派
│
├── 05-design-grammar/         ← BWVI 创新
│   ├── color-theory.md            色彩理论+oklch
│   ├── typography-pairing.md      字体配对指南
│   ├── layout-patterns.md         布局模式库
│   ├── spacing-rhythm.md          间距与节奏
│   ├── motion-dna.md              动效 DNA
│   ├── information-density.md     信息密度分型
│   └── signature-detail.md        签名细节 120%
│
├── 06-critique/               ← huashu + BWVI 交叉
│   ├── 5-dimension-self.md        5 维自评
│   ├── objective-metrics.md       客观指标计算
│   ├── cross-review-protocol.md   交叉评审协议
│   └── formative-vs-summative.md  形成性 vs 总结性
│
├── 07-templates/              ← open-design 精华
│   ├── landing-page/              种子+组合+自定义
│   ├── dashboard/
│   ├── pricing-page/
│   ├── deck/
│   ├── mobile-app/
│   └── poster/
│
└── 08-media/                  ← open-design 媒体
    ├── image-prompts/             43 个图片 prompt 模板
    ├── video-prompts/             39 个视频 prompt 模板
    ├── hyperframes/               11 个动效模板
    └── audio-design-rules.md      音频设计规则
```

### 7.2 知识版本管理

```yaml
knowledge_version: "2.1.0"
changelog:
  "2.1.0":
    date: "2026-05-04"
    changes:
      - "新增: 信息密度分型规则"
      - "更新: 品牌资产协议 step4 新增 5-10-2-8 质量门"
  "2.0.0":
    date: "2026-04-27"
    changes:
      - "重构: 品牌资产协议从色值优先升级为资产优先"
      - "新增: Logo 例外规则"
  "1.0.0":
    date: "2026-04-20"
    changes:
      - "初始版本"

# Agent 启动时:
# bwvi knowledge check_version
# → "知识库当前版本 2.1.0，上次使用版本 1.0.0，有 2 次更新"
```

### 7.3 知识冲突解决

当多个知识块给出冲突指导时：

```yaml
conflict_resolution:
  # 优先级：brand-spec > design-dna > 知识块 > 默认
  rule_1: "brand-spec.md 的显式规则 > craft 通用规则"
  rule_2: "具体知识块 > 通用知识块"
  rule_3: "更近期的知识版本 > 更旧版本"
  rule_4: "用户确认的决策 > 知识块建议"
  rule_5: "冲突标注时，问用户而不是静默决定"
```

### 7.4 外部设计学习（Design Reverse Engineering）

**核心想法：** 用户发现好的设计（网站的截图、URL、设计作品），BWVI 能**逆向分析**它，提取设计灵感，注入到设计系统或设计指纹中。

```
用户: "bwvi learn https://linear.app"
      "这个页面设计很好，学一下它的风格"

BWVI:
  Step 1: 抓取页面 HTML + CSS
  Step 2: 提取 Design Token
  Step 3: 推断设计哲学流派
  Step 4: 生成 Design Reference 卡片
  Step 5: 问用户 "要注入到当前项目还是全局指纹？"
```

#### 7.4.1 输入来源

```yaml
input_sources:
  url:
    description: "网站 URL"
    pipeline: "fetch HTML → inline CSS → extract tokens"
    example: "bwvi learn https://linear.app"
    confidence: "high"     # 结构完整，CSS 精确
    limits: "需要网络，SPA 可能需 JS 渲染"

  image:
    description: "设计截图/图片文件"
    pipeline: "Agent 视觉分析 → 提取色板/布局/风格"
    example: "bwvi learn screenshot.png"
    confidence: "medium"   # 视觉推断，不如 CSS 精确
    limits: "依赖 Agent 视觉能力，无法提取精确字体"

  url+image:
    description: "URL + 截图（推荐）"
    pipeline: "URL 取 CSS + 截图验证视觉一致性"
    example: "bwvi learn https://linear.app --with-screenshot"
    confidence: "high"
```

#### 7.4.2 逆向分析管道

```
bwvi learn https://linear.app --extract deep
→ 
┌──────────────────────────────────────────────────────────┐
│  Design Reference: Linear.app                            │
│  Source: https://linear.app (2026-05-04)                 │
│                                                          │
│  Extracted Tokens:                                       │
│  ├── --color-primary:  oklch(0.13 0.02 260) [#1E1E2E]   │
│  ├── --color-accent:   oklch(0.62 0.18 145) [#00E698]   │
│  ├── --color-surface:  oklch(0.98 0.005 90) [#FFFFFF]   │
│  ├── --font-display:   'Inter', system-ui, sans-serif    │
│  ├── --font-body:      'Inter', system-ui, sans-serif    │
│  └── --space-base:     8px                               │
│                                                          │
│  Detected Patterns:                                      │
│  ├── 学派: tech-utility (置信度 92%)                      │
│  ├── 个性: 冷 (warmth:2) · 严谨 (structure:9)            │
│  │        克制 (density:2) · 现代 (novelty:7)            │
│  ├── 关键布局: 非对称 hero + 网格卡片列表                  │
│  ├── 签名细节: accent 绿在深色背景上的高对比点缀            │
│  └── 标签: ["saas", "dark-mode", "developer-tool"]       │
│                                                          │
│  Confidence Breakdown:                                   │
│  ├── Color:    0.97 (CSS 直接提取)                       │
│  ├── Font:     0.95 (Google Fonts 检测 + font-face)      │
│  ├── Layout:   0.72 (DOM 结构推断)                       │
│  └── Philosophy: 0.85 (向量匹配)                         │
│                                                          │
│  Commands:                                               │
│  ├── 注入当前项目:  bwvi reference inject linear-ref     │
│  ├── 保存到收藏:    bwvi reference save linear-ref       │
│  ├── 更新指纹:      bwvi fingerprint absorb linear-ref   │
│  └── 原始数据:      cat .bwvi/references/linear-ref.yaml │
└──────────────────────────────────────────────────────────┘
```

#### 7.4.3 提取流程详情

```yaml
extraction_pipeline:
  step_1_fetch:
    url: "获取 HTML"
    detect: "框架识别（React/Vue/Next/纯静态）"
    extract: "内联 CSS / <link> CSS / style 属性"
    
  step_2_parse_css:
    extract_colors:
      - "CSS 变量定义（--color-*, --brand-*, --accent-*）"
      - "出现频率最高的 10 个非黑白 hex/oklch"
      - "gradient 定义"
    extract_typography:
      - "font-family 声明（过滤系统字体）"
      - "Google Fonts / Typekit 引用"
      - "最小/最大/最常用 font-size"
    extract_spacing:
      - "base unit 推断（常用间距值的最大公约数）"
      - "gap / padding / margin 分布"
    extract_layout:
      - "grid-template-columns 模式"
      - "flexbox 方向分布"
      - "breakpoint 定义"
    extract_motion:
      - "transition / animation 定义"
      - "duration / easing 分布"
    extract_radius:
      - "border-radius 分布"
    
  step_3_infer_philosophy:
    method: "向量匹配"
    dimensions:
      - warmth:     [冷: warm=1 · 暖: warm=9]
      - structure:  [自由: struct=1 · 严谨: struct=9]
      - density:    [留白多: density=1 · 信息密: density=9]
      - novelty:    [传统: novel=1 · 先锋: novel=9]
      - playfulness:[严肃: play=1 · 趣味: play=9]
    match: "与 20 种哲学的欧几里得距离最近"
    
  step_4_generate_reference:
    format: "YAML + Markdown"
    output: ".bwvi/references/<slug>.yaml"
    fields:
      - source: 来源 URL/文件路径
      - captured_at: 捕获时间
      - tokens: 提取的设计 token
      - patterns: 检测到的布局/组件模式
      - philosophy: 匹配的设计哲学
      - tags: 用户自定义标签
      - confidence: 每项的置信度
```

#### 7.4.4 注入机制

```yaml
injection_modes:
  into_current_project:
    effect: "更新当前项目的 design-dna.yaml + 添加参考卡片"
    scope: "仅当前项目"
    command: "bwvi reference inject linear-ref"
    
  into_fingerprint:
    effect: "吸收到团队设计指纹（影响所有未来项目）"
    scope: "全局"
    condition: "至少 3 个参考被手动确认高质量后才影响指纹"
    command: "bwvi fingerprint absorb linear-ref"
    
  into_knowledge_base:
    effect: "创建新的知识块或模板种子"
    scope: "全局 + 可分享"
    condition: "手动确认 + 经过 benchmark 验证"
    command: "bwvi knowledge create-from-ref linear-ref --as-template"
```

#### 7.4.5 与迭代系统的关系

外部设计学习与第 4 层的"演化式架构"形成闭环：

```
用户发现好设计
  → bwvi learn <url/image>
    → 提取 Design Reference
      → 置信度 > 0.8 → 自动建议注入
        → 用户确认 → 更新指纹或知识库
          → 下次项目自动受益

用户的好品味 = 系统的训练数据
系统训练的越多 = 设计决策越精准
```

**最终愿景：** 用户不需要"配置"设计系统。用户只需要说 "这个好看，学一下"——系统自己会解析、拆解、吸收。

---

## 8. 质量保证体系 [插件]

### 8.1 客观指标矩阵

| 指标 | 计算 | 阈值 | 自动检测 | 来源 |
|------|------|------|---------|------|
| 色彩合规 | 页面颜色 ∈ 品牌色盘的比例 | ≥ 0.85 | ✅ CSS var/hex 扫描 | open-design lint |
| 字体合规 | display/body 使用指定字体 | ≥ 0.90 | ✅ font-family 属性 | open-design craft |
| 资产识别度 | logo/产品图为真实文件 | 1.0 (logo) / 0.8 (others) | ✅ img src 追踪 | huashu 品牌协议 |
| accent 使用 | accent 出现次数/屏 | ≤ 2 | ✅ accent var 计数 | open-design craft |
| 布局多样性 | DOM 结构与模板库的编辑距离 | ≥ 0.60 | ✅ DOM 签名比对 | BWVI |
| 反模式检测 | 是否含 7 宗大罪元素 | 0 | ✅ 正则/Elem 扫描 | huashu + open-design |
| 文本真实性 | 非 lorem/placeholder 比例 | ≥ 0.95 | ✅ 正则 | huashu 反 slop |
| token 效率 | HTML size / 有效内容 | ≤ 3:1 | ✅ 计算 | BWVI |

### 8.2 质量门槛场景

| 场景 | 通过线 | 额外要求 |
|------|--------|---------|
| 快速草图 | ≥ 4/10 | 无崩溃、无截断 |
| 内部原型 | ≥ 6/10 | 色彩合规 ≥ 0.80 |
| 团队演示 | ≥ 7/10 | 资产识别度 ≥ 0.8 |
| 客户交付 | ≥ 8/10 | 全部指标达标，无待解决设计债 |
| 品牌物料 | ≥ 8.5/10 | 资产识别度 = 1.0，品牌色 100% 合规 |
| 公开发布 | ≥ 9/10 | 三项交叉评审一致，无设计债 |

### 8.3 评审模式对比

```
形成性评审 (formative)
  时机: 生成过程中 → 每完成一个决策节点
  目的: 早发现问题，及时修正方向
  输出: {"issues": [...], "continuation": "safe" | "needs_revision"}
  成本: 低（快速检查）
  类比: 设计评审中的"设计走查"

总结性评审 (summative)
  时机: 生成完成后 → 交付前
  目的: 最终质量把关
  输出: CritiqueReport（完整版）
  成本: 高（多模型交叉）
  类比: 设计评审中的"终审"
```

### 8.4 视觉回归检测（Visual Regression）

**问题：** 现有评审只分析 HTML 结构，不检测**视觉变化**。v1→v2 迭代中，按钮缩小了 2px、色值偏移了 0.003 oklch——这些结构上看不出。

**方案：** 截图 + 像素级对比：

```yaml
visual_regression:
  trigger: "每次 generate v2+ 时自动执行"

  method: |
    1. 保存 v1 截图（.bwvi/screenshots/v1.png）
    2. 生成 v2 时截图（.bwvi/screenshots/v2.png）
    3. 像素级对比 → 生成差异热力图

  report:
    diff_found: true
    changes:
      - region: "hero-cta-button"
        type: "size_change"
        detail: "宽度 200px → 192px (缩小 4%)"
        severity: "minor"
        recommendation: "确认 CTA 尺寸变化是否是故意的"
      
      - region: "accent-color"
        type: "color_shift"
        detail: "oklch 0.55 0.18 25 → oklch 0.55 0.18 28 (hue +3°)"
        severity: "info"
        recommendation: "偏差 <0.005，在可接受范围内"
    
    unchanged_regions:
      - "header-logo"
      - "footer"
      - "card-grid"
    
    regression_score: 0.92     # 1.0 = 完全一样。>0.95 忽略，<0.80 警告
    regression_pass: true      # false 时阻断交付
```

**严重等级：**

```yaml
severity:
  breaking:     # diff > 10%，或影响了核心品牌元素
    auto: "阻断交付，要求确认"
    example: "Logo 位置从左上移到右上"
  
  significant:  # diff 5-10%
    auto: "标记，要求审查"
    example: "主色偏差 >0.01 oklch"
  
  minor:        # diff 1-5%
    auto: "记录但不阻断"
    example: "按钮缩小 4%"
  
  info:         # diff < 1%
    auto: "仅记录"
    example: "色差 <0.005 oklch"
```

### 8.5 设计彩票检测（Auto-retry on Bad Rolls）

**问题：** AI 生成有随机性。同一条 prompt，有时候第一次就完美，有时候第五次才正常。用户看到第一次坏的"彩票"会直接否定整个方向。

**方案：** 自动检测异常低分 → 静默重试。

```yaml
lottery_detection:
  trigger: "generate 完成 → critique score < 5.0"

  detection_logic: |
    if critique.score < 5.0:
      生成 2 个额外变体（不同 random seed）
      if 最佳变体 score > current + 1.5:
        丢弃当前的坏卷
        用最佳变体替换
        record_retry_event(bad_score: current, good_score: best)
      else:
        保留当前版本（可能真的是方向问题，不是 seed 问题）

  retry_record:
    - session: "landing-v1"
      bad_score: 3.2
      good_score: 7.8
      seed_delta: "seed_42 → seed_99"
      notes: "坏卷的 hero 区布局溢出未检测到"
    
    - session: "landing-v2"
      bad_score: 4.1
      good_score: 6.5
      seed_delta: "seed_17 → seed_88"
      notes: "坏卷的 logo 引用路径错误"

  configuration:
    auto_retry: true           # 默认开启
    max_retries_per_session: 2 # 单 session 最多重试 2 次
    score_gap_threshold: 1.5   # 新 score 必须比旧高至少 1.5 才替换
    
    # 进阶：统计离群检测
    outlier_detection: >
      当 session 样本量 > 10 时，
      如果 score < 历史均值 - 2σ，
      自动触发重试。
      不再使用固定阈值。
```

**不暴露给用户：** 重试在后台静默完成。用户只看到最终版本。只有用户主动 `bwvi history --show-retries` 才看到重试记录。

---

## 9. 多 Agent 编排 [插件]

### 9.1 三种运行模式

```yaml
modes:
  single:                     # 默认，快速原型
    pros: "速度快，仅 1 次 tool call 链"
    cons: "质量受限于单一模型"
   适合: "草图 / 内部原型"

  multi-sequential:          # 角色分离，串行
    pros: "每个角色专注，质量高"
    cons: "慢（4-8 次 tool call 链）"
   适合: "客户交付 / 品牌物料"

  multi-parallel:            # 角色分离，评审并行
    pros: "交叉评审同时进行，速度可接受"
    cons: "架构复杂度高"
   适合: "高质量要求 + 时间敏感"
```

### 9.2 角色定义

```yaml
analyst:
  identity: "你是一个需求分析师。你的工作是理解用户的真实需求，
            把模糊描述转化为结构化的设计简报。你不做设计。"
  tools: [analyze, fact_check, knowledge_load, brief]
  temperature: 0.3
  handoff: "brief.json"

director:
  identity: "你是一个创意总监。你的工作是确定视觉方向、色板、
            字体、布局策略。你不写代码。"
  tools: [directions, decision_make, knowledge_load, brand_cache]
  temperature: 0.5
  handoff: "decisions.json"

designer:
  identity: "你是一个执行设计师。你的工作是根据已确认的决策
            生成最终的 HTML。你不推翻已经确认的决策方向。"
  tools: [generate, asset_search, asset_download, knowledge_load]
  temperature: 0.4
  handoff: "output.html"

reviewer:
  identity: "你是一个设计评审专家。你的工作是客观评估产出质量，
            发现潜在问题。你不知道设计师是谁（blind review）。"
  tools: [critique, knowledge_load]
  temperature: 0.2
  handoff: "critique-report.json"
```

---

## 10. 生态与反馈 [核心-生态层]

### 10.1 社区知识贡献

```yaml
community_knowledge:
  registry: "GitHub: github.com/bwvi-design/knowledge"
  format: "Markdown + YAML frontmatter"
  
  contribution_types:
    - type: "design-philosophy"     # 新设计哲学流派
      schema: "philosophy.schema.yaml"
      example: "german-grid-constructivism.md"
    
    - type: "brand-system"          # 新品牌设计系统
      schema: "DESIGN.md (awesome-design-md 格式)"
      example: "cursor-app.md"
    
    - type: "template-seed"         # 新模板种子
      schema: "seed.schema.yaml"
      example: "newsletter.md"
    
    - type: "anti-pattern"          # 新反模式
      schema: "anti-pattern.schema.yaml"
      example: "skeleton-screen-overuse.md"
```

### 10.2 反馈闭环

```
用户交付产出 → 用户评分/反馈
                     ↓
          反馈进入 `.bwvi/feedback/`
                     ↓
          每周分析反馈 → 更新知识库
                     ↓
          知识版本 bump → Agent 检测更新
                     ↓
          下次使用时应用新知识
```

```bash
# 用户反馈
bwvi feedback "output.html" 7
→ "已记录评分 7/10。您的反馈将帮助改进设计质量。"

# Agent 读取历史
bwvi history --project "my-app"
→ "项目质量趋势: v1: 5.2 → v2: 6.8 → v3: 7.5 → v4: 8.1"
→ "常见问题: Logo 资产缺失 (3次), Accent 过用 (2次)"
```

### 10.3 插件协议

```yaml
plugin:
  format: "MCP tool 注册"
  
  registry_points:
    - "decision_type":   注册新的决策类型
    - "knowledge_source": 注册新的知识块源
    - "design_philosophy": 注册新的设计哲学
    - "template_seed":   注册新的模板种子
    - "media_provider":  注册新的媒体生成服务
    - "linter_rule":     注册新的 lint 规则
  
  example:
    name: "bwvi-plugin-figma-import"
    provides: ["design_philosophy", "asset_source"]
    install: "bwvi plugin install bwvi-plugin-figma-import"
```

---

## 11. 设计能力迭代系统 [核心]

### 11.1 核心哲学

BWVI 不靠"我手动重写一个更好版本"来变强。它靠**每次使用都在让自己变强**来进化。

```ascii
  项目 A → 得分 7.5 → 采集失败模式
  项目 B → 得分 6.2 → 采集失败模式
  项目 C → 得分 8.1 → 采集成功模式（正向强化）
           ↓
    模式聚合器（每 N 个项目运行一次）
           ↓
    A/B 实验 + 知识库 PR
           ↓
    合并后 → 新知识版本 v2.1.0
           ↓
    下次项目启动 → bwvi knowledge check_version
         → "知识库已从 v2.0.3 升级到 v2.1.0
            (3 项改进: 资产搜索增强 / Mobile 布局扩展 / 字体禁区)"
```

### 11.2 四层迭代架构

```yaml
iteration_layers:
  layer_1_data_collection:      # 每个项目都是传感器
    what: "自动采集项目过程数据"
    trigger: "每次 generate + critique 完成"
    data:
      - decisions_made: 8                # 做了几个决策
      - critique_final: 7.5              # 最终评分
      - retries: 1                       # 彩票重试次数
      - negotiations: 2                  # 用户协商了几次
      - debt_items: 3                    # 设计债数
      - failure_patterns:                # ← 最有价值
          - type: "asset_not_found"
            impact: "logo placeholder，评分降 1.2"
          - type: "overgenerated"
            impact: "800 行 HTML，超 token 预算"
      - user_feedback: 8                 # 用户最终评分
      - user_comment: "布局不错，字体不对"
    output: "项目报告 (.bwvi/reports/<id>.yaml)"

  layer_2_pattern_mining:       # 从失败中学
    what: "聚合 N 个项目 → 发现重复失败模式"
    trigger: "每 5 个项目 / 手动 bwvi knowledge improve"
    flow: |
      分析 12 个项目的失败模式:

      ┌─ 资产类失败: 5 次 (42%)
      │  └─ 根因: Logo 搜索 2 轮不够，经常 404
      │  └─ 改进建议: quick mode 从 2 轮改为 3 轮
      │
      ├─ 布局类失败: 3 次 (25%)
      │  └─ 根因: Mobile 布局知识块仅 2 条规则
      │  └─ 改进建议: 扩展到 8 条
      │
      ├─ 字体类失败: 2 次 (17%)
      │  └─ 根因: 选了品牌禁区字体
      │  └─ 改进建议: brand-protocol 增加禁区检查
      │
      └─ 其他: 2 次 (17%)

    rules:
      - "同一失败模式 ≥3 次 → 自动生成知识块改进 PR"
      - "PR 必须通过 benchmark 才能合并"
      - "每个修复附带影响预估"

  layer_3_ab_testing:           # 不信直觉信数据
    what: "新知识 vs 旧知识的对照实验"
    trigger: "有候选改进时"
    protocol: |
      对照组 (旧知识)       实验组 (新知识)
      tc01: 6.5             tc01: 7.1  (+0.6)
      tc02: 7.2             tc02: 7.4  (+0.2)
      avg:  6.85            avg:  7.25 (+0.4)

      回归检查:
      tc04 (recovery): unchanged ✓
      tc05 (offline):  unchanged ✓

    decisions:
      - "实验组均分 ≥ 对照组 + 0.3 → 自动合并"
      - "实验组均分 ≥ 对照组 + 0.1 → 人工审核"
      - "实验组均分 < 对照组 → 拒绝，记录失败"
      - "任何回归测试失败 → 拒绝"

  layer_4_evolution:            # 知识以项目为食
    what: "改进合并后自动发布新知识版本"
    output: |
      knowledge_version: "2.2.0"
      changelog:
        - "asset quick mode 2→3 轮 (-15% logo 404)"
        - "mobile-layout 2→8 条规则 (-20% 布局问题)"
        - "brand-protocol 新增禁区检查"

    auto_notify: |
      下次项目启动:
      "知识库已从 v2.1.0 升级到 v2.2.0
       3 项改进，预期减少 18% 的已知失败模式。
       详细: bwvi knowledge changelog"
```

### 11.3 失败模式优先原则

**关键洞察：** 系统不应该只关注"用户喜欢什么"——那会导致知识库偏向热门风格。应该更关注**失败模式**。

```yaml
failure_priority:
  reasoning: |
    成功让你觉得"没问题"，失败才是真正的改进燃料。
    一个失败模式如果影响了 5 个项目，修复它比增加
    一个新的设计哲学对整体质量的提升大 10 倍。

  prioritization_matrix:
    frequency:      # 出现频率
      weight: 0.4
    impact:         # 对评分的影响
      weight: 0.4
    effort:         # 修复难度（越小越优先）
      weight: 0.2

  scoring_example:
    asset 404:
      frequency: 5/12 (0.42)
      impact:    -1.2 score (0.8)
      effort:    15min (0.9)
      score:     0.42×0.4 + 0.8×0.4 + 0.9×0.2 = 0.548

    typo in knowledge:
      frequency: 1/12 (0.08)
      impact:    -0.3 score (0.2)
      effort:    5min (1.0)
      score:     0.08×0.4 + 0.2×0.4 + 1.0×0.2 = 0.312
```

### 11.4 与外部设计学习的闭环

第 7.4 节的外部设计学习与第 11 节的迭代系统形成完整闭环：

```ascii
  用户发现好设计 → bwvi learn <url>
       ↓
  提取 Design Reference
       ↓
  注入 design-dna / fingerprint / knowledge
       ↓
  下次项目使用新知识 → 评分提升
       ↓
  项目报告→模式挖掘→A/B实验→知识库更新
       ↓
  系统继续变强
```

**两条腿走路：**
- **从正面学（外部设计学习）：** 用户看到好的，系统逆向分析吸收
- **从反面学（迭代系统）：** 系统自己的失败模式 → 自动改进

两条腿一起走，BWVI 的设计能力才会持续提升。

### 11.5 落地路线

```yaml
implementation:
  phase_1:
    what: "手动采集"
    how: "用户手动 bwvi feedback <file> <score>"
    output: "原始 feedback 文件"
    start: "Phase 1 发布时"

  phase_2:
    what: "自动项目报告"
    how: "每个项目结束时自动生成 project_report"
    output: ".bwvi/reports/<id>.yaml"
    start: "Phase 2 发布时"

  phase_3:
    what: "模式挖掘 CLI"
    how: "bwvi knowledge improve — 分析 N 个项目 + 生成 PR"
    start: "Phase 3 发布时"

  phase_4:
    what: "全自动 A/B 实验闭环"
    how: "改进提案→benchmark→自动合并→知识版本 bump"
    start: "Phase 3 稳定后"
```

---

## 12. 实现路线图 [核心优先]

### 0. 路线图原则

```
核心优先：先让飞轮转起来，再往上搭东西。
插件只定义接口，不急于实现。
自举检查：每 Phase 结束时用 BWVI 生成 BWVI 自己的物料。
```

**核心层必须在 Phase 1 完成闭环。** 插件可以永远不做——核心不依赖插件。

### Phase 1a: 核心引擎（Day 1-2）

**只做能让飞轮第一次转动的东西。**

```yaml
核心引擎:
  设计决策协议:
    - 决策注册表（direction/palette/typography/layout/detail）
    - 决策执行器（按树逐步确认）
    - 渐进约束传递
    - Design Token 输出（--color-primary 等）
  
  设计指纹:
    - 每项目自动记录决策历史
    - 3 项目后自动生成指纹偏好
    - 方向推荐时参考指纹
  
  自进化:
    - 项目结束后自动生成 report.yaml
    - 记录失败模式 + 用户评分
    - 基础模式聚合（bwvi knowledge improve）

Checkpoint:
    - 每决策确认后自动保存
    - 中断恢复

CLI 命令（4 个）:
  bwvi init
  bwvi analyze         # 参考指纹做方向推荐
  bwvi generate        # 按决策链生成
  bwvi critique        # 基础自评（不依赖插件）

不做:
  - 资产搜索（插件）       - 多 Agent（插件）
  - 视觉回归（插件）       - 外部设计学习（Phase 1b）
  - 冷启动 showcase（先让早期用户手动输入方向）
```

**Phase 1a 交付检查：**

```bash
# 必须通过
bwvi init my-project
bwvi analyze "coffee brand landing page"     → 推荐方向
bwvi generate "..." --direction <choice>      → 产出 HTML
bwvi critique index.html                      → 输出评分
cat .bwvi/fingerprint.yaml                     → 有记录
cat .bwvi/reports/<id>.yaml                    → 有项目报告

# 自举检查
bwvi generate "生成 bwvi 的 --help 排版"       → CLI 帮助由自己生成
```

### Phase 1b: 第一个插件 + 外部学习（Day 3）

```yaml
核心增强:
  外部设计学习:
    - bwvi learn <url> 分析网站
    - 提取 Design Token
    - 吸收到指纹或项目

第一个插件（作为参考实现）:
  插件: asset-search（基础版）
  - bwvi asset logo <brand>  (quick: 2 轮搜索)
  - bwvi asset color <brand> (curl + grep)
  - 不实现 5-10-2-8（留给社区插件）
```

### Phase 2: 插件生态（持续）

```yaml
核心继续增强:
  - 设计指纹置信度阶梯（3→5→10 项目）
  - 自进化 A/B 实验框架
  - 知识版本管理
  
社区插件接口:
  - 发布插件协议文档
  - 示例插件: asset-search / critique-cross / visual-regression
  - 插件注册表（npm / GitHub）

官方插件（按需）:
  - 交叉评审（Phase 2a）
  - 视觉回归检测（Phase 2b）
  - 多 Agent 编排（Phase 2c）
```

### Phase 3: 自维持

```yaml
- 全自动迭代闭环（采集→挖掘→A/B→合并→版本 bump）
- 设计指纹跨团队共享（可选）
- 插件市场
- benchmark 全自动运行
```

**硬门槛：** 任何 Phase 发布前必须通过自举检查。BWVI 自己的文档和品牌物料必须由 BWVI 自己生成。

---

## 13. 成功指标

### 12.1 客观指标

| 指标 | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| 一次交付通过率 | — | ≥ 60% | ≥ 75% |
| 平均对话轮数/任务 | ≤ 8 | ≤ 5 | ≤ 4 |
| 品牌资产识别度 | ≥ 0.7 | ≥ 0.85 | ≥ 0.95 |
| 用户评分（1-10） | ≥ 6 | ≥ 7 | ≥ 8 |
| 知识块覆盖率 | 30% | 80% | 95% |
| 安装到首次产出时间 | ≤ 5min | ≤ 2min | ≤ 1min |

### 12.2 验证场景

```
场景 1: 品牌 landing page
  "帮我的精品咖啡品牌 Blue Bottle 做一个 landing page"
  验证: logo 是真实 SVG？色值匹配品牌？布局有品牌个性？

场景 2: 无品牌空板
  "帮我做一个 AI 产品 landing page，不知道什么风格好"
  验证: 方向顾问给了 3 个选项？选完后产出一致？

场景 3: 评审迭代
  "评审这个页面" → "按评审结果修改"
  验证: v2 评分比 v1 高？设计债减少了？

场景 4: 中断恢复
  Agent 崩溃 → 恢复 checkpoint
  验证: 已确认的决策不重复问？

场景 5: 多角色编排
  复杂设计任务 → 多 Agent 流水线
  验证: 最终产出 > 单 Agent 质量？
```

---

## 14. 附录：精华溯源

### 从 Huashu-Design 吸收的核心

| 精华 | BWVI 中的位置 | 转化方式 |
|------|-------------|---------|
| 事实验证先于假设 | `knowledge/00-fact-check/` | 独立知识块，P0 优先级 |
| 核心资产协议 5 步 | `knowledge/01-brand-protocol/` + `asset_*` tools | 协议代码化，不再是文字指令 |
| 5-10-2-8 质量门 | `asset_verify` tool | 可执行的评分+过滤管道 |
| Junior Designer 工作流 | 决策树的 step 1-8 分步确认 | 流程固化到决策树 |
| 反 AI slop 清单 | `knowledge/02-anti-slop/` + 客观指标 | 可执行检查，不只靠自觉 |
| 5 维评审 | `critique/5-dimension-self.md` + self_review | 标准化评分卡 |
| 5 流派 × 20 设计哲学 | `knowledge/04-direction-advisor/` | 可扩展的方向注册表 |
| 品位锚点（一个细节 120%） | `decision_type: detail_signature` | 成为强制决策节点 |
| 信息密度分型 | `design-grammar/information-density.md` | 自动检测 → 应用规则 |
| 品牌-spec.md | Design Brief + brand-spec.md 生成器 | 自动生成 |
| 设备边框 | `templates/seed/` 可选引用 | 按需使用 |
| 视频 BGM+SFX 管道 | `media/` 知识块 + `media` 决策类型 | 标准化 |

### 从 Open-Design 吸收的核心

| 精华 | BWVI 中的位置 | 转化方式 |
|------|-------------|---------|
| 31 skills 的模板思想 | `knowledge/07-templates/` seed 系统 | seed→compose→customize |
| 129 设计系统 | `brand_cache` 可拉取 | 不是捆绑，是按需+新鲜度检查 |
| Craft 通用规则 | `knowledge/05-design-grammar/` | 原子化知识块 |
| 客观 Linter | `critique/objective-metrics.md` + 自动检测 | 规则可执行 |
| 多 Agent 检测 | MCP server 自动注册 | 工具发现 |
| 媒体生成 | `knowledge/08-media/` + `media` 决策类型 | 标准化 prompt 模板 |
| 流式 artifact | 异步任务模型（task_id + polling） | MCP 兼容 |
| 多格式导出 | 输出渲染器注册表 | 可扩展 |
| Skill ID 版本 | checkpoint 版本追踪 | 保留 |
| Prompt stack 组合 | 知识块 compositing 策略 | 按需组装 |
| CLI 生命周期 | `bwvi init/analyze/generate/critique` | 类似 tools-dev 但轻量 |

---

*本 PRD 是 bwvi design 的定义文档。所有设计决策应首先参考本文件。*
*批评分析见 `docs/critical-review.md`。架构规格见 `specs/architecture.md`。*
*v2.1 修订记录见 `docs/revisions-v2.1.md` — 包含 10 项针对自审问题的优化。*
