# BWVI

> **B**etter **W**ay of **V**isual **I**ntelligence — Agent-native design decision protocol.

CLI 工具 + MCP Server，让 AI Agent 拥有结构化的设计决策能力。不抢 Agent 的执行，给 Agent 更好的决策框架。

## 快速开始

```bash
npx bwvi init my-project && cd my-project
npx bwvi analyze "咖啡品牌 landing page"     # 分析任务 → 方向推荐
npx bwvi showcase --pick landing-warm        # 选方向（真实 HTML 预览）
npx bwvi generate "咖啡品牌" --direct        # 直接出 HTML
npx bwvi critique index.html                 # 评审
npx bwvi generate "咖啡 App" --device=iphone --interactive  # iPhone 交互原型
npx bwvi test preview-iphone.html --a11y     # 验证
npx bwvi feedback 8                          # 评分
```

## 安装

```bash
# 直接运行（无需安装）
npx bwvi --help

# 或全局安装
npm install -g bwvi
bwvi --help
```

## 架构

```
src/
├── types/          纯接口定义层，0 依赖
│   ├── decision.ts    设计决策链 (direction→palette→typography→layout)
│   ├── project.ts     项目配置 / Checkpoint
│   ├── critique.ts    评审报告类型
│   └── fingerprint.ts 设计指纹类型
│
├── engine/         核心引擎
│   ├── analyzer.ts    任务分析：方向推荐 + 5 direction 路由
│   ├── composer.ts    Prompt 组装
│   ├── agent.ts       Agent CLI 检测/调度（Claude/OpenCode/Codex 等）
│   └── learner.ts     外部设计学习：URL → Design Token
│
├── checkpoint/     文件系统持久化
│   └── manager.ts    Checkpoint: save/load/list/rollback
│
├── critique/       评审引擎
│   ├── objective.ts    10 维客观指标
│   ├── self-review.ts  5 维主观自评
│   └── diff.ts         版本对比
│
├── fingerprint/    设计指纹
│   └── tracker.ts    隐式学习团队偏好，反信息茧房
│
├── knowledge/      知识加载器
│   └── loader.ts     双层加载：MD 文件优先，源码 fallback
│
├── templates/      组件库
│   └── components.ts  Navbar/Hero/StatsGrid/FeatureGrid/PriceCard 等
│
├── mcp/            MCP Server
│   └── server.ts      stdio transport，5 个 tools
│
├── report/         项目报告
│   └── generator.ts
│
└── cli/            19 个 CLI 命令
    ├── init.ts / analyze.ts / generate.ts / critique.ts / learn.ts
    ├── showcase.ts / checkpoint.ts / feedback.ts / knowledge.ts
    ├── asset.ts / brief.ts / debt.ts / history.ts / brand.ts
    ├── template.ts / plugin.ts / diff.ts / benchmark.ts
    └── mcp → 转发到 mcp/server.ts
```

## 设计决策协议

核心抽象是一条**渐进约束的决策链**：

```
direction → palette → typography → [information_density] → layout → detail_signature
```

每步决策以 `DesignDecision` 实体持久化到 `.bwvi/checkpoints/`，支持跨会话恢复与回滚。

| 原则 | 说明 |
|------|------|
| 先验证事实，再碰设计 | 先做 WebSearch → product-facts.md |
| 展示假设再填充 | 出方向 → 用户确认 → 继续执行 |
| 资产是设计的第一公民 | Logo/产品图不是 CSS 附庸 |
| 用真材实料，不编造 | 禁止 Lorem ipsum、假 stats |
| 一个细节 120%，其他 80% | 1 个签名细节，别处保持节奏 |
| 渐进约束，不一次性锁死 | 沿决策链逐步积累 |
| 决策可追溯，可回滚 | 所有决策持久化 JSON |
| 不自我评审 | 自评有偏差，需交叉验证 |
| 知识有版本 | 不永远最新版 |
| 自举才能发布 | 自己的狗粮自己先吃 |

## 命令

### 核心

| 命令 | 功能 |
|------|------|
| `init` | 创建 `.bwvi/` 项目结构 |
| `analyze` | 分析设计任务 → 方向推荐 + 指纹参考 |
| `generate` | 生成设计（`--direct` 直出 HTML / `--run` 调 Agent / 默认出 prompt） |
| `critique` | 评审 HTML → 10 维客观指标 + 5 维自评 |
| `learn` | 从 URL 学习设计 Token（`--inject` / `--template`） |

### 设计辅助

| 命令 | 功能 |
|------|------|
| `showcase` | 8 预制风格展示（`--pick` 选择） |
| `checkpoint` | 决策管理（list/show/restore/rollback） |
| `feedback` | 用户评分 1-10，自动更新指纹 |
| `knowledge` | 知识块查看（list/show/improve/check_version） |
| `asset` | 品牌资产搜索（logo/color \<brand\>） |
| `brief` | 结构化设计简报 |
| `debt` | 设计债追踪（list/add/resolve） |
| `history` | 质量趋势 + 失败模式聚合 |
| `brand` | 品牌系统列表/搜索/获取（30 内置品牌） |
| `brand learn <url>` | 从 URL 学习品牌 Token |
| `test` | HTML 验证（a11y/响应式/语义/交互） |
| `template` | 模板管理（list/use/delete） |
| `plugin` | 插件脚手架生成 |
| `video` | HTML → MP4/GIF 导出（需 ffmpeg） |
| `diff` | HTML 版本对比 |
| `benchmark` | 5 用例测试套件 |
| `mcp` | 启动 MCP Server（stdio transport） |

## 设备边框系统

`bwvi generate` 支持 5 种设备边框包裹，`--device` 参数：

| 设备 | 值 | 方向 |
|------|-----|------|
| iPhone 15 Pro | `iphone` | portrait / landscape |
| Pixel 9 | `pixel` | portrait / landscape |
| iPad Pro | `ipad` | portrait / landscape |
| MacBook Pro | `macbook` | 仅 landscape |
| 浏览器窗口 | `browser` | 自适应 |

```bash
bwvi generate "咖啡 App" --device=iphone --orientation=portrait
bwvi generate "Dashboard" --device=browser
bwvi generate "Landing" --device=macbook
```

## 交互原型模式

`--interactive` 参数在 HTML 中嵌入 2KB 无依赖状态机：

| 功能 | 用法 |
|------|------|
| Modal 弹窗 | `data-bwvi-toggle="modal" data-bwvi-target="id"` |
| Tab 切换 | `data-bwvi-toggle="tab" data-bwvi-group="tabs"` |
| Accordion | `data-bwvi-toggle="accordion"` |
| Carousel | `data-bwvi-carousel="id"` |
| 暗色模式 | `data-bwvi-toggle="darkmode"` |
| Toast 提示 | `data-bwvi-toggle="toast"` |
| 表单提交 | `data-bwvi-form="消息"` |

```bash
bwvi generate "App onboarding" --device=iphone --interactive
bwvi generate "Dashboard" --device=browser --interactive --dark
```

## 组件变体

每个组件内置 3-4 种 variant：

| 组件 | 可选 variant |
|------|-------------|
| Hero | `fullscreen` / `centered` / `split` / `editorial` |
| Navbar | `default` / `transparent` / `centered` |
| FeatureGrid | `grid` / `list` / `compact` |
| StatsGrid | `grid` / `list` / `compact` |
| TestimonialGrid | `grid` / `compact` |
| Card | `flat` / `elevated` / `bordered` |
| Footer | `default` / `minimal` |

## 品牌系统

30 个内置品牌系统，`--brand` 参数自动加载色板+字体：

```bash
bwvi brand list                          # 列出所有品牌
bwvi brand search developer              # 搜索品牌
bwvi brand get linear                    # 查看品牌详情
bwvi generate "SaaS" --brand=linear      # 使用 Linear 品牌
bwvi generate "电商" --brand=stripe --device=iphone --interactive
```

内置品牌：Linear, Stripe, Vercel, Apple, Notion, Airbnb, Figma, Supabase, Cursor, Shopify, Spotify, Coinbase, Tesla, Nike, IBM, NVIDIA, Miro, Framer, PostHog, Cal, Sanity, Replicate, Raycast, Intercom, Zapier, Webflow, Sentry, Claude, Xiaohongshu 等。

## 多后端渲染引擎

BWVI 支持 4 种渲染后端，通过 `--engine` 切换：

| 后端 | 值 | 产出质量 | 前置条件 |
|------|-----|---------|----------|
| BWVI 内置 | `direct` | ★★★☆☆ | 无 |
| Open-Design | `od` | ★★★★★ | OD daemon 运行中 (`pnpm tools-dev run web`) |
| Huashu-Design | `huashu` | ★★★★★ | Agent CLI (OpenCode/Claude Code) |
| Agent CLI | `agent` | ★★★★☆ | Agent CLI 已安装 |

```bash
bwvi generate "SaaS landing" --engine=od --brand=linear --device=browser
bwvi generate "移动 App 原型" --engine=huashu --device=iphone --interactive
bwvi generate "快速原型" --engine=direct --device=iphone
```

当 BWVI 作为**决策枢纽**调用 OD/Huashu 后端时，产出视觉质量自动达到后端水平（★★★★★）。

## 评审体系

### 10 维客观指标

| 指标 | 说明 |
|------|------|
| `color_compliance` | 页面颜色在品牌色盘内的比例 |
| `font_compliance` | 使用 `--font-display` / `--font-body` |
| `asset_authenticity` | 非 placeholder 资产比例 |
| `accent_overuse` | accent 每屏 ≤2 次 |
| `token_efficiency` | HTML 体积 / 有效内容 ≤3:1 |
| `accessibility` | alt/aria/role/label/tabindex |
| `semantic_html` | header/nav/main/section/article/footer |
| `responsive` | viewport/@media/clamp/grid |
| `seo_score` | title/description/lang/heading |
| `html_validity` | doctype/charset/标签对 |

### 5 维主观自评

按项目类型加权（landing_page / dashboard / deck / default）：

| 维度 | 说明 |
|------|------|
| `philosophy` | 设计哲学一致性 |
| `hierarchy` | 信息层级 |
| `detail` | 细节打磨 |
| `function` | 功能完整性 |
| `innovation` | 创新性 |

## 知识块系统

15 个知识块，双层加载（`knowledge/` 目录 MD 文件优先，源码 fallback）：

```
00-方向顾问.md   01-色板规则.md    02-字体规则.md    03-布局模式.md
04-动效原则.md   05-内容规则.md    06-品牌协议.md    07-组件规格.md
08-间距系统.md   09-响应式.md      10-图标规范.md    11-图片规范.md
12-表单规范.md   13-导航模式.md    14-数据可视化.md
```

## MCP Server

与 Agent 集成：

```json
{
  "mcpServers": {
    "bwvi": {
      "command": "npx",
      "args": ["-y", "bwvi", "mcp"]
    }
  }
}
```

Agent 可直接调用 5 个 Tool：

| Tool | 功能 |
|------|------|
| `analyze_design` | 分析设计任务 → 方向 + 指纹 |
| `generate_design` | 按方向生成 HTML |
| `critique_design` | 评审 HTML → 评分 |
| `learn_design` | 从 URL 学习设计 |
| `list_directions` | 列举所有方向 |

## 运行模式

| 模式 | 检测条件 | 功能范围 |
|------|----------|----------|
| online | 网络可达 + 多模型 key | 资产搜索/交叉评审/知识更新 |
| limited | 网络可达但无多模型 key | 本地知识/生成/self-plus 评审 |
| offline | 网络不可达 | 仅缓存知识/生成/objective 评审 |

## 跨会话分工

```bash
# 会话 1: 用户选方向
bwvi showcase --pick landing-editorial
# → 写入 .bwvi/checkpoints/

# 新开会话 2: 设计师读决策
bwvi checkpoint list
# → 方向已定，直接 generate
```

## API

```bash
bwvi analyze "SaaS landing page"
bwvi generate "SaaS landing" --direction=tech-utility
bwvi critique output.html --brand-colors #1E1E2E,#00E698
bwvi learn https://linear.app
bwvi showcase --pick dashboard-clean
bwvi checkpoint list
bwvi checkpoint restore dec_direction_123
bwvi feedback 8 "排版不错"
bwvi knowledge list
bwvi knowledge improve
bwvi asset color stripe
bwvi brief "咖啡品牌, 受众:投资人, 语气:专业"
bwvi debt add "Logo 需要替换为官方 SVG"
bwvi history
bwvi brand fetch linear
bwvi plugin my-plugin
bwvi test index.html --a11y --interactive
bwvi diff v1.html v2.html
bwvi video index.html --fps=60 --format=mp4
bwvi benchmark
```

## 开发

```bash
# 依赖安装
npm install

# 开发模式（TS 直接运行）
npm run dev -- analyze "SaaS landing page"

# 类型检查
npm run typecheck

# 打包
npm run build

# 生产运行
npm start

# 基准测试
npm run benchmark
```

### 技术栈

- **语言**: TypeScript 5.7+ (strict mode)
- **运行时**: Node.js 20+ (ES2022)
- **打包**: esbuild（CJS + ESM 双格式）
- **MCP**: `@modelcontextprotocol/sdk` v1.29+ (stdio transport)
- **配置**: YAML

### 项目结构

```
bwvi/
├── src/             TypeScript 源码
├── dist/            构建产物 (CJS + ESM)
├── scripts/         构建脚本
├── knowledge/       知识块 (15 个 MD 文件)
├── demo/            演示 HTML (9 个)
├── docs/            设计文档
├── specs/           架构规范
├── .bwvi/           运行时生成（不在版本控制）
│   ├── config.json
│   ├── checkpoints/
│   ├── fingerprint.yaml
│   ├── reports/
│   ├── feedback/
│   ├── debt/
│   ├── references/
│   ├── templates/
│   └── brief.json
├── package.json
├── tsconfig.json
└── README.md
```

## Benchmark

```bash
bwvi benchmark
# → 5/5 通过 (0.2s)
```

| 用例 | 描述 |
|------|------|
| TC01 | 品牌 landing page → 方向 + HTML + 评审 ≥ 5.0 |
| TC02 | 冷启动 → 无品牌无参考也能产出 |
| TC03 | 迭代优化 → v2 评分 > v1 |
| TC04 | 中断恢复 → checkpoint 恢复后决策完整 |
| TC05 | 外部学习 → learnFromUrl 成功 |

## 许可证

Apache-2.0
