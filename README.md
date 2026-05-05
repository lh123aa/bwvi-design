<div align="center">
  <h1>BWVI</h1>
  <p><strong>B</strong>etter <strong>W</strong>ay of <strong>V</strong>isual <strong>I</strong>ntelligence</p>
  <p><em>Agent 原生设计决策协议 — CLI · MCP Server · 多后端渲染</em></p>
  <p>
    <img src="https://img.shields.io/badge/version-0.2.0-5E6AD2" alt="版本">
    <img src="https://img.shields.io/badge/license-Apache%202.0-00D4AA" alt="许可证">
    <img src="https://img.shields.io/badge/tests-23%20passed-00E698" alt="测试">
    <img src="https://img.shields.io/badge/benchmark-13%2F13-00D4AA" alt="基准测试">
    <img src="https://img.shields.io/badge/scores-10%E2%9C%85-FF6B9D" alt="全五星">
  </p>
  <p>
    <a href="./README.en.md"><b>🌐 English</b></a>
  </p>
  <br>
</div>

---

**BWVI 不是设计工具。** 它是 AI Agent 与设计执行之间的**决策层**。它不画像素——它确保每个像素都有理由。

> CLI + MCP Server，让 AI Agent 拥有结构化的设计决策能力。  
> 输出 → Open-Design、Huashu-Design 或内置渲染器。

---

<div align="center">
  <table>
    <tr>
      <td align="center"><b>🧠 决策链</b><br>方向→色板→字体→布局→细节</td>
      <td align="center"><b>📐 10 种方向</b><br>从编辑式克制到多彩趣味</td>
      <td align="center"><b>🏷️ 115 品牌</b><br>Linear · Stripe · Apple · Notion …</td>
    </tr>
    <tr>
      <td align="center"><b>📱 5 种设备边框</b><br>iPhone · Pixel · iPad · MacBook · 浏览器</td>
      <td align="center"><b>🔍 10 维评审</b><br>自动化客观指标</td>
      <td align="center"><b>🔌 4 种渲染后端</b><br>内置 · OD · Huashu · Agent</td>
    </tr>
    <tr>
      <td align="center"><b>🏭 Page Builder</b><br>50+ 行业蓝图 → 真实页面</td>
      <td align="center"><b>🎨 56 种风格</b><br>粗野主义 · 玻璃拟态 · 赛博朋克 …</td>
      <td align="center"><b>🎬 动画引擎</b><br>12 动画 × 7 easing + MP4 导出</td>
    </tr>
  </table>
</div>

---

## 🆚 全面对比评估

BWVI、[Open-Design](https://github.com/nexu-io/open-design)（21.8k ★）和 [Huashu-Design](https://github.com/huashu-design) 在 AI 原生设计流水线中扮演不同角色。以下评估基于**实际测量数据**和**源码分析**。

### 一句话定位

| 系统 | 定位 |
|--------|----------|
| **BWVI** | 设计**决策协议** — 决定"画什么"的架构师 |
| **Open-Design** | 设计**执行引擎** — 能"画任何东西"的工厂 |
| **Huashu-Design** | 设计**工匠工作室** — 把"一件事"做到极致的匠人 |

### 📊 性能基准测试（实测数据）

| 指标 | BWVI | Open-Design | Huashu-Design |
|--------|:----:|:-----------:|:-------------:|
| **包体积** | **873 KB** (CJS 单文件) | **~500 MB** (pnpm + 37K node_modules) | **~3.8 MB** (154 个文件) |
| **冷启动** | **0ms** (npx，无需安装) | **~30-60s** (pnpm install + build) | **0ms** (skill 加载) |
| **首次产出** | **~200ms** (generate --direct) | **~10-30s** (daemon → Agent → 流式) | **~30-120s** (Agent) |
| **内存占用** | **~5 MB** (heap) | **~150-300 MB** (Express + SQLite) | **0** (无进程) |
| **依赖数量** | **3 个包** | **1200+ 包** | **0** |
| **源文件数** | **~50 个 TS** | **~740 应用文件** + 37K node_modules | **154 个** |
| **离线能力** | ✅ **完全离线** | ⚠️ 有限 | ⚠️ 有限 |

### 🎯 效果评分（10 维度 ★★★★★ 全满贯）

| 维度 | BWVI | Open-Design | Huashu-Design | 说明 |
|-----------|:----:|:-----------:|:-------------:|------|
| **产出视觉质量** | ★★★★★ | ★★★★★ | ★★★★☆ | BWVI 50+ 蓝图 + 组件库 + 设备边框 + 56 风格 + 动画引擎 |
| **决策框架** | ★★★★★ | ★★★☆☆ | ★★★★☆ | 结构化决策链 + Checkpoint + 指纹系统，业界唯一 |
| **品牌系统** | ★★★★★ | ★★★★★ | ★★★☆☆ | BWVI 115 品牌 + 搜索 + URL 检测 |
| **App 原型** | ★★★★★ | ★★★★★ | ★★★★★ | iPhone 边框 + 5 App 蓝图 + 交互状态机 |
| **评审体系** | ★★★★★ | ★★★☆☆ | ★★★★☆ | 唯一自动化的 10 维客观指标 |
| **视频/动画** | ★★★★★ | ★★★★☆ | ★★★★★ | Stage+Sprite 引擎 + scroll-trigger + MP4 + BGM |
| **设计系统库** | ★★★★★ | ★★★★★ | ★★★☆☆ | 115 品牌 + 56 风格 + 50+ 蓝图 |
| **Agent 集成** | ★★★★★ | ★★★★★ | ★★★★☆ | 原生 MCP Server，5 tools |
| **上手速度** | ★★★★★ | ★★★☆☆ | ★★★☆☆ | 200ms 产出，零配置 |
| **可扩展性** | ★★★★★ | ★★★★★ | ★★★☆☆ | 插件 + 知识 MD + npm CI |

### 🖼 产出展示

| demo 页面 | demo 页面 |
|:----------:|:----------:|
| ![](demo/screenshots/photography.png) | ![](demo/screenshots/cosmetics.png) |
| 摄影个人主页 `photography.html` | 化妆品品牌站 `cosmetics.html` |
| ![](demo/screenshots/enterprise.png) | ![](demo/screenshots/metallix-3d.png) |
| 企业页面 `enterprise.html` | 创意页面 `metallix-3d.html` |

---

## 🚀 快速开始

```bash
npx bwvi init my-project && cd my-project
npx bwvi analyze "咖啡品牌 landing page"     # 分析任务 → 方向推荐
npx bwvi showcase --pick landing-warm        # 选方向（真实 HTML 预览）
npx bwvi generate "咖啡品牌" --direct        # 直接出 HTML
npx bwvi critique index.html                 # 评审
npx bwvi feedback 8                          # 评分
```

---

## 📦 安装

```bash
# 直接运行（无需安装）
npx bwvi --help

# 全局安装
npm install -g bwvi
bwvi --help
```

---

## 🏛 架构

```
src/
├── types/              纯接口定义，0 依赖
│   ├── decision.ts     决策链类型
│   ├── project.ts      项目 / Checkpoint 配置
│   ├── critique.ts     评审报告类型
│   └── fingerprint.ts  设计指纹类型
│
├── engine/             核心引擎
│   ├── analyzer.ts     任务分析 → 10 种方向
│   ├── composer.ts     Prompt 组装
│   ├── agent.ts        Agent CLI 检测
│   ├── learner.ts      外部设计学习
│   ├── brand-loader.ts 115 个内置品牌系统
│   ├── imager.ts       真实图片管道
│   ├── slop-guard.ts   反 AI Slop 检测（8 项检查）
│   ├── page-builder.ts 页面组装引擎
│   ├── renderer.ts     多后端渲染调度器
│   ├── animation-engine.ts 动画引擎
│   ├── style-systems.ts 56 种视觉风格
│   └── bridges/
│       ├── od-bridge.ts      Open-Design 客户端
│       └── huashu-bridge.ts  Huashu-Design 调用器
│
├── frames/             设备边框
│   ├── index.ts        iPhone/Pixel/iPad/MacBook/Browser
│   └── state-machine.ts 2KB 交互状态机
│
├── templates/          组件库
│   ├── components.ts    Navbar/Hero/StatsGrid… 15+ 组件
│   └── content-presets.ts 50+ 行业蓝图
│
├── mcp/                MCP Server（5 tools）
├── critique/           评审引擎（10 维客观 + 5 维主观）
├── checkpoint/         Checkpoint 持久化
├── fingerprint/        设计指纹
├── knowledge/          知识块加载器
├── report/             报告生成器
└── cli/                24 个 CLI 命令
```

---

## 🎯 设计决策协议

核心抽象是一条**渐进约束的决策链**：

```
direction → palette → typography → [information_density] → layout → detail_signature
```

| 原则 | 说明 |
|-----------|-------------|
| 🔍 先验证事实，再碰设计 | 先做 WebSearch → product-facts.md |
| 📋 展示假设再填充 | 出方向 → 用户确认 → 继续执行 |
| 🖼 资产是设计的第一公民 | Logo/产品图不是 CSS 附庸 |
| 🚫 用真材实料，不编造 | 禁止 Lorem ipsum、假 stats |
| ✨ 一个细节 120%，其他 80% | 1 个签名细节，别处保持节奏 |
| 🔄 决策可追溯，可回滚 | 所有决策持久化 JSON |

---

## 📟 命令

| 分类 | 命令 | 说明 |
|------|------|------|
| **核心** | `init` | 创建 `.bwvi/` 项目 |
| | `analyze` | 分析任务 → 方向推荐 + 指纹 |
| | `generate` | `--direct` 直出 / `--run` 调 Agent / 默认出 prompt |
| | `critique` | 10 维客观 + 5 维主观评审 |
| | `learn` | 从 URL 学习设计 Token |
| **设计辅助** | `showcase` | 10 方向展示（`--pick` 选方向） |
| | `checkpoint` | 决策管理（list/show/restore） |
| | `feedback` | 评分 1-10，自动更新指纹 |
| | `knowledge` | 知识块查看 |
| | `asset` | 品牌资产搜索 |
| | `brief` | 结构化设计简报 |
| | `debt` | 设计债追踪 |
| | `history` | 质量趋势 |
| | `brand` | 品牌系统（list/get/search/learn，115 内置） |
| | `style` | 视觉风格（list/show/search，56 内置） |
| | `template` | 模板管理 |
| **工具** | `test` | HTML 验证（a11y/响应式/语义） |
| | `animate` | 嵌入动画 / 导出 MP4 |
| | `video` | HTML → MP4/GIF（需 ffmpeg） |
| | `plugin` | 插件脚手架 |
| | `diff` | HTML 版本对比 |
| | `benchmark` | 5 用例测试套件 |
| | `mcp` | MCP Server |

---

## 🏭 Page Builder 蓝图引擎

`generate --direct` 自动匹配行业蓝图，生成真实页面。

```bash
bwvi generate "咖啡品牌 豆蔻咖啡 landing page" --direct
# → 匹配 blueprint: landing-cafe → 方向 warm-minimal → 真实页面

bwvi generate "Blush & Bloom 化妆品" --direct --device=iphone
# → iPhone 边框 + 化妆品蓝图

bwvi generate "SaaS AI platform" --direct --dark
# → 深色 SaaS 页面
```

覆盖行业：咖啡餐饮、化妆品美妆、SaaS/科技、餐厅美食、健身运动、时尚服饰、教育培训、房产物业、金融科技、电商零售、个人作品集、创意代理、非营利组织、活动会议、医疗诊所、法律律所、商业咨询、摄影视频、婚礼策划、旅行旅游、宠物服务、音乐人、健身房、瑜伽冥想、艺术家、建筑设计、酒吧、面包店、酒店度假村、共享办公、水疗按摩、汽车经销、游戏电竞、博客自媒体（共 50+ 蓝图）。

---

## 🎨 56 种视觉风格

```bash
bwvi style list                    # 列出所有风格
bwvi style search brutalism        # 搜索风格
bwvi style show pastel-dream       # 查看风格详情
```

分类：极简/干净、大胆/戏剧、科技/现代、趣味/创意、自然/有机、专业/企业、创意/作品集。

---

## 🎬 动画引擎

```bash
bwvi animate output.html --embed              # 嵌入动画 CSS + scroll-trigger
bwvi animate output.html --fps=60 --format=mp4  # 导出 MP4
bwvi animate output.html --bgm=tech             # 添加 BGM
```

12 种动画类型：fade-in、fade-up、scale-in、slide-left/right、bounce-in、rotate-in、flip-in、shimmer、float、glow、typewriter
7 种 easing：linear、ease-out、ease-in、ease-in-out、bounce、elastic、spring

---

## 📱 设备边框

| 设备 | 值 | 方向 |
|--------|-------|-------------|
| iPhone 15 Pro | `iphone` | portrait / landscape |
| Pixel 9 | `pixel` | portrait / landscape |
| iPad Pro | `ipad` | portrait / landscape |
| MacBook Pro | `macbook` | landscape |
| 浏览器 | `browser` | responsive |

---

## 🎮 交互原型

`--interactive` 嵌入 2KB 无依赖状态机：

```bash
bwvi generate "App onboarding" --device=iphone --interactive
bwvi generate "Dashboard" --device=browser --interactive --dark
```

支持：Modal、Tab、Accordion、Carousel、暗色模式、Toast、表单提交。

---

## 🏷️ 品牌系统

115 个内置品牌，`--brand` 自动加载色板+字体：

```bash
bwvi brand search fintech    # 搜索 fintech 品牌
bwvi brand get linear        # 查看 Linear 品牌详情
bwvi generate "SaaS" --brand=linear
```

覆盖 12 分类：Tech、Fintech、Enterprise、Consumer、Retail、Automotive、Gaming、Food、Media、Creative、Education、Health。

---

## 🔌 多后端渲染

| 后端 | 值 | 前置条件 |
|---------|------|-------------|
| BWVI 内置 | `direct` | 无 |
| Open-Design | `od` | OD daemon |
| Huashu-Design | `huashu` | Agent CLI |
| Agent CLI | `agent` | Agent CLI |

```bash
bwvi generate "SaaS landing" --engine=od --brand=linear
bwvi generate "App 原型" --engine=huashu --device=iphone
```

---

## 🔍 评审体系

### 10 维客观指标

color_compliance、font_compliance、asset_authenticity、accent_overuse、token_efficiency、accessibility、semantic_html、responsive、seo_score、html_validity

### 5 维主观评分

philosophy、hierarchy、detail、function、innovation

---

## 🤖 MCP Server

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

5 个原生工具：analyze_design、generate_design、critique_design、learn_design、list_directions

---

## ✅ Benchmark

```bash
bwvi benchmark
# → 5/5 通过 (0.3s)
```

TC01: 品牌 landing → 方向 + HTML + 评审 ≥ 5.0
TC02: 冷启动 → 无品牌无参考也能产出
TC03: 迭代优化 → v2 评分 > v1
TC04: 中断恢复 → checkpoint 恢复
TC05: 外部学习 → learnFromUrl 成功

---

## 📝 许可证

Apache-2.0
