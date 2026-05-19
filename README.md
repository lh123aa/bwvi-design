<div align="center">
  <h1>BWVI</h1>
  <p><strong>B</strong>etter <strong>W</strong>ay of <strong>V</strong>isual <strong>I</strong>ntelligence</p>
  <p><em>Agent 原生设计决策协议 — CLI · MCP Server · 多引擎渲染</em></p>
  <p>
    <img src="https://img.shields.io/badge/version-0.5.0-5E6AD2" alt="版本">
    <img src="https://img.shields.io/badge/license-Apache%202.0-00D4AA" alt="许可证">
    <img src="https://img.shields.io/badge/tests-230%20passed-00E698" alt="测试">
    <img src="https://img.shields.io/badge/skills-53-FF6B9D" alt="技能">
    <img src="https://img.shields.io/badge/benchmark-13%2F13-00D4AA" alt="基准测试">
    <img src="https://img.shields.io/badge/scores-10%E2%9C%85-00D4AA" alt="全五星">
  </p>
  <p>
    <a href="./README.en.md"><b>🌐 English</b></a>
  </p>
  <br>
</div>

---

**BWVI 不是设计工具。** 它是 AI Agent 与设计执行之间的**决策层**。它不画像素——它确保每个像素都有理由。

> CLI + MCP Server，让 AI Agent 拥有结构化的设计决策能力。

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
      <td align="center"><b>🔌 渲染后端</b><br>direct · huashu · agent · pencil</td>
    </tr>
    <tr>
      <td align="center"><b>🏭 Page Builder</b><br>50+ 行业蓝图 → 真实页面</td>
      <td align="center"><b>🎨 56 种视觉风格</b><br>粗野主义 · 玻璃拟态 · 赛博朋克 …</td>
      <td align="center"><b>🎬 动画引擎</b><br>12 动画 × 7 easing + MP4 导出</td>
    </tr>
    <tr>
      <td align="center"><b>📁 Skill 文件系统</b><br>YAML 技能文件 · 热加载 · 社区贡献</td>
      <td align="center"><b>📊 Deck 幻灯片</b><br>3 套模板 · 键盘导航 · 过渡动画</td>
      <td align="center"><b>🐦 Social 卡片</b><br>Twitter · 小红书 · 一键适配</td>
    </tr>
    <tr>
      <td align="center"><b>🧠 持续学习</b><br>12 能力节点 · 自动诊断 · 知识注入</td>
      <td align="center"><b>🔌 渲染后端</b><br>direct · huashu · agent · pencil</td>
      <td align="center"><b>🔄 自我进化</b><br>测量→诊断→改进→验证循环</td>
    </tr>
    <tr>
      <td align="center"><b>🎨 设计原理层</b><br>HSL 色彩和谐 · 排版比例尺 · 风格冲突检测</td>
      <td align="center"><b>🧩 混搭组合</b><br>A的配色+B的字体+C的布局 · 原理可解释</td>
      <td align="center"><b>✅ WCAG 验证</b><br>自动检查对比度 · 提示修复建议</td>
    </tr>
  </table>
</div>

---

## 📋 目录

- [核心特性](#-核心特性)
- [快速开始](#-快速开始)
- [安装](#-安装)
- [架构](#-架构)
- [设计决策协议](#-设计决策协议)
- [命令](#-命令)
- [设备边框](#-设备边框)
- [交互原型模式](#-交互原型模式)
- [组件变体](#-组件变体)
- [Page Builder 蓝图引擎](#-page-builder-蓝图引擎)
- [56 种视觉风格](#-56-种视觉风格)
- [动画引擎](#-动画引擎)
- [品牌系统](#-品牌系统)
- [评审体系](#-评审体系)
- [知识块系统](#-知识块系统)
- [持续学习系统](#-持续学习系统)
- [设计原理层](#-设计原理层)
- [MCP Server](#-mcp-server)
- [跨会话工作流](#-跨会话工作流)
- [API 参考](#-api-参考)
- [开发](#-开发)
- [基准测试](#-基准测试)
- [许可证](#-许可证)

---

## 📊 BWVI 类型能力全景评估

以下为 BWVI 自身各品类能力的系统性评估，数据来自源码分析与基准测试。

### 一、核心设计品类（`bwvi generate` 快捷标志）

| 品类 | 命令 | 能力说明 | 性能评估 |
|:-----|:------|:---------|:---------|
| **Landing Page 网页** | 默认（无标志） | 50+ 蓝图 + 动态布局引擎，8px 网格，3 种信息密度 | ⭐⭐⭐⭐ 成熟度最高，出 HTML 约 5-15KB |
| **幻灯片 Deck** | `--deck` | 多 section 自动分页，slide/fade 过渡，PPTX 导出 | ⭐⭐⭐⭐ 13 个测试案例通过 |
| **社交媒体卡片** | `--social` | 方形卡片，居中大字 + CTA，品牌色板适配 | ⭐⭐⭐ 较新功能，简化版渲染 |
| **办公文档** | `--office` | OKR/报告/发票/收据，支持 DOCX 导出 | ⭐⭐⭐ 框架结构完备，内容需自行填充 |
| **海报 Poster** | `--poster` | A3/A2/A1 规格，300dpi 印刷级 PNG（`--scale=4`） | ⭐⭐⭐⭐ 像素尺寸准确，适合打印 |

### 二、渲染引擎（`--engine=`）

| 引擎 | 模式 | 性能评估 |
|:-----|:------|:---------|
| `direct`（默认） | BWVI 内置渲染，零外部依赖 | ⭐⭐⭐⭐⭐ 最快，~200ms 出结果 |
| `pencil` | Pencil 设计稿转代码 | ⭐⭐⭐ 自动生成手绘风格 UI |
| `agent` | 通过 Claude/OpenCode 智能生成 | ⭐⭐⭐ 质量最高但需 token 预算 |

### 三、输出格式（`bwvi export`）

| 格式 | 命令 | 能力等级 | 备注 |
|:-----|:------|:---------|:-----|
| **PDF** | `--format=pdf` | ⭐⭐⭐⭐ | Playwright 渲染，A4 打印精确 |
| **PNG 图片** | `--format=png` | ⭐⭐⭐⭐⭐ | 支持 `--scale=4` 印刷级 + `--transparent` 透明背景 |
| **PPTX 幻灯片** | `--format=pptx` | ⭐⭐⭐ | 纯 XML 生成，零外部依赖，支持分页 |
| **DOCX 文档** | `--format=docx` | ⭐⭐⭐ | 段落感知，标题/正文样式对齐 |

### 四、设备预览框架（`--device=`）

| 设备 | 支持 | 性能评估 |
|:-----|:------|:---------|
| **iPhone** | ✅ 全面屏刘海 + 状态栏 | ⭐⭐⭐⭐ 实测边框渲染正确 |
| **Pixel 安卓** | ✅ 打孔屏 | ⭐⭐⭐⭐ |
| **iPad** | ✅ 横竖屏 | ⭐⭐⭐ |
| **MacBook** | ✅ 浏览器框架 + 三色圆点 | ⭐⭐⭐⭐ |
| **浏览器窗口** | ✅ 圆角 + URL 栏 | ⭐⭐⭐⭐ |

### 五、风格系统（`--style=`）

| 项目 | 数据 | 评估 |
|:-----|:------|:-----|
| **内置风格数** | **56 种** | ⭐⭐⭐⭐ 覆盖主流设计流派 |
| 代表风格 | minimal-white, neo-brutalism, cyberpunk, glassmorphism, japanese-wabi, dark-luxury 等 | |
| 风格应用机制 | 覆盖色板 + 字体 + 间距节奏 | `--style=glassmorphism` 应用验证通过 |

### 六、品牌系统（`--brand=`）

| 项目 | 数据 | 评估 |
|:-----|:------|:-----|
| **内置品牌数** | **115 个** | ⭐⭐⭐⭐⭐ 覆盖 12 分类 |
| 代表品牌 | Linear, Stripe, Apple, Vercel, Figma, Notion, Airbnb, Shopify, Spotify 等 | |
| 品牌数据结构 | 色板(primary/accent/surface/text) + 字体(display/body) + 标签 | |
| 搜索能力 | `bwvi brand search <关键词>` | 支持多标签过滤 |

### 七、动画与视频

| 能力 | 命令 | 评估 |
|:-----|:------|:-----|
| CSS 动画 | `bwvi animate <file.html>` | ⭐⭐⭐⭐ 12 种动画类型，8 级延迟，5 种缓动函数 |
| 视频录制 MP4 | `--record` | ⭐⭐⭐ 需 ffmpeg，1080p 25/60fps |
| GIF 导出 | `--format=gif` | ⭐⭐⭐ 需 ffmpeg，palette 优化 |
| BGM 背景音乐 | `--bgm=tech/warm/...` | ⭐⭐⭐ 场景化 BGM，fade 自动处理 |
| 交互录制 | `--interactive` | ⭐⭐⭐ 记录用户点击流程 |

### 八、图片生成（`bwvi image`）

| 提供商 | 模式 | 评估 |
|:-------|:------|:-----|
| DALL·E 3 | `--provider=openai` | ⭐⭐⭐⭐ 需 API Key |
| Stable Diffusion | `--provider=stability` | ⭐⭐⭐ 需 API Key |
| 通义万相 | `--provider=tongyi` | ⭐⭐⭐ 需 API Key |
| Seedream | `--provider=seedream` | ⭐⭐⭐ 需 API Key |
| Mock 模式 | `--mock` | ⭐⭐⭐ 无 Key 时 SVG 占位 |

### 九、评审系统（`bwvi critique`）

| 模式 | 维度 | 能力评估 |
|:------|:------|:---------|
| **Objective 客观** | 10 维（标签存在性、结构完整性等） | ⭐⭐⭐ 正则匹配检查 |
| **Self-Plus 自评** | 5 维（哲学、层级、细节、功能、创新） | ⭐⭐⭐ 规则驱动 |
| **Cross 交叉** | 多模型交叉验证（需多个 API Key） | ⭐⭐ 条件苛刻 |

### 十、学习系统（`bwvi learn`）

| 能力 | 评估 |
|:------|:------|
| 从 URL 学习色板 + 字体 | ⭐⭐⭐ 标题 + 色值 + 字体提取成功 |
| 方向检测 | ⭐⭐⭐ 置信度输出 |
| 知识库注入 | ⭐⭐⭐ 学习结果写入 knowledge/ |
| 持续升级（learn-system） | ⭐⭐⭐ 能力图谱自诊断 + 自动升级建议 |

### 十一、能力图谱自评（源码级诊断）

BWVI 内置 `capability-graph.ts` 自我诊断系统，当前各能力等级（满级 10）：

| 能力 | 当前等级 | 诊断 | 最大瓶颈 |
|:-----|:--------:|:-----|:---------|
| **色板生成** | **6/10** | HSL 6 种和谐模式，WCAG 对比度验证 | → AI 辅助色板推荐 |
| **字体配对** | **6/10** | 5 类字体 + 8 种比例尺 + 12 条规则 | → 语义级字体推荐 |
| **布局生成** | **6/10** | 50+ 蓝图 + 8px 网格 + 3 种密度 | → 响应式自适应布局 |
| **自评系统** | **5/10** | 规则驱动 5 维评分 | → 更细粒度规则 |
| **方向推荐** | **4/10** | 10 个预设方向 + 关键词匹配 | → Semantic Embedding |
| **客观评审** | **4/10** | 正则标签存在性检查 | → 视觉层级 + 对比度计算 |
| **知识质量** | **1~8/10**（按填充度） | 文件数/内容量决定 | → 更多实质设计规则 |

### 十二、常用场景推荐

| 场景 | 推荐度 | 推荐命令 | 理由 |
|:-----|:------:|:---------|:------|
| **网页 / Landing Page** | ⭐⭐⭐⭐⭐ | `generate "xxx"` | 最成熟品类，50+ 蓝图 + 56 风格 + 115 品牌 |
| **演示幻灯片** | ⭐⭐⭐⭐ | `generate "xxx" --deck` | Deck 渲染 + PPTX 导出闭环 |
| **海报 / 印刷品** | ⭐⭐⭐⭐ | `generate "xxx" --poster` | A3/A2/A1 精确，300dpi 输出 |
| **办公文档 / 收据发票** | ⭐⭐⭐ | `generate "xxx" --office` | 框架完备，内容需自行设计 |
| **社交媒体卡片** | ⭐⭐⭐ | `generate "xxx" --social` | 新功能，够用但尚简 |
| **动画 / 视频** | ⭐⭐⭐ | `animate file.html --record` | 需额外依赖 ffmpeg |
| **AI 图片生成** | ⭐⭐⭐ | `image "prompt"` | 需自行配置 API Key |
| **设计评审** | ⭐⭐⭐ | `critique file.html` | 客观指标检查可用，深度视觉评审待完善 |
| **App 原型** | ⭐⭐⭐⭐ | `generate "xxx" --device=iphone --interactive` | 设备边框 + 交互状态机 |

---

## 🚀 快速开始

```bash
npx bwvi init my-project && cd my-project
npx bwvi analyze "咖啡品牌 landing page"     # 分析任务 → 方向推荐
npx bwvi showcase --pick landing-warm        # 选方向（真实 HTML 预览）
npx bwvi generate "咖啡品牌" --direct        # 直接出 HTML
npx bwvi generate "产品路线图" --deck        # Deck 幻灯片
npx bwvi generate "新品发布" --social        # 社交卡片
npx bwvi skill list                          # 查看所有技能模板
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
| | `generate` | `--direct` 直出 / `--deck` 幻灯片 / `--social` 卡片 / `--run` 调 Agent / 默认出 prompt |
| | `critique` | 10 维客观 + 5 维主观评审 |
| | `learn` | 从 URL 学习设计 Token |
| **设计辅助** | `learn-system` | 持续学习系统（status/diagnose/improve/ingest） |
| | `showcase` | 10 方向展示（`--pick` 选方向） |
| | `skill` | 技能管理（list/search/show/stats） |
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
| | `animate` | 注入动画 / `--record` 录制 MP4/GIF / `--interactive` 交互录制 |
| | `video` | ⚠️ 已废弃，使用 `animate --record` |
| | `export` | 导出为 PDF/PNG/PPTX/DOCX |
| | `preview` | 预览组件 |
| | `image` | AI 生图（需 API Key） |
| | `serve` | 启动预览服务器 |
| | `plugin` | 插件脚手架 |
| | `diff` | HTML 版本对比 |
| | `benchmark` | 13 用例测试套件 |
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

bwvi generate "2026 产品路线图" --deck
# → Deck 幻灯片（键盘←/→翻页 + 过渡动画 + 触屏支持）

bwvi generate "AI 新品发布" --social --brand=linear
# → 社交卡片（Twitter/X / 小红书风格）

bwvi skill list
# → 查看所有可用技能模板（YAML 文件系统）
```

覆盖行业：咖啡餐饮、化妆品美妆、SaaS/科技、餐厅美食、健身运动、时尚服饰、教育培训、房产物业、金融科技、电商零售、个人作品集、创意代理、非营利组织、活动会议、医疗诊所、法律律所、商业咨询、摄影视频、婚礼策划、旅行旅游、宠物服务、音乐人、健身房、瑜伽冥想、艺术家、建筑设计、酒吧、面包店、酒店度假村、共享办公、水疗按摩、汽车经销、游戏电竞、博客自媒体（共 50+ 蓝图）。

---

## 🎨 56 种视觉风格

```bash
bwvi style list                    # 列出所有风格
bwvi style search brutalism        # 搜索风格
bwvi style show pastel-dream       # 查看风格详情
```

**分类**：极简/干净、大胆/戏剧、科技/现代、趣味/创意、自然/有机、专业/企业、创意/作品集。

代表风格：`minimal-white` `neo-brutalism` `glassmorphism` `cyberpunk` `pastel-dream` `kawaii-japan` `nature-organic` `corporate-trust` `photography` `music-vibe` 等。

---

## 🎬 动画引擎 + 视频录制

```bash
# 注入 CSS 动画（原行为）
bwvi animate output.html --embed

# 视频录制（需 Playwright + ffmpeg）
bwvi animate output.html --record                    # 默认 1080p 25fps MP4
bwvi animate output.html --record --fps=60           # 60fps 高清
bwvi animate output.html --record --format=gif       # GIF 导出
bwvi animate output.html --record --bgm=tech         # 加背景音乐
bwvi animate output.html --record --duration=10      # 固定时长
bwvi animate output.html --record --interactive      # 自动录制交互操作
bwvi animate output.html --record --quick            # 快速模式（720p 15fps）
bwvi animate output.html --record --watermark=logo.png  # 加水印
```

### 录制流水线

```
HTML 页面
  │  injectAnimations() 注入 12 种 CSS 动画
  ▼
带动画的 HTML
  │  Playwright 打开页面 → 原生录屏 → 自动滚动/交互
  ▼
原始 WebM
  │  ffmpeg 合成 → H.264 编码 → BGM → 水印
  ▼
成品 MP4 / GIF
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

## 🧩 组件变体

| 组件 | 可选 variant |
|-----------|----------|
| Hero | `fullscreen` / `centered` / `split` / `editorial` |
| Navbar | `default` / `transparent` / `centered` |
| FeatureGrid | `grid` / `list` / `compact` |
| StatsGrid | `grid` / `list` / `compact` |
| Footer | `default` / `minimal` |

---

## 🏷️ 品牌系统

115 个内置品牌，`--brand` 自动加载色板+字体：

```bash
bwvi brand search fintech    # 搜索 fintech 品牌
bwvi brand get linear        # 查看 Linear 品牌详情
bwvi generate "SaaS" --brand=linear
```

覆盖 12 分类：Tech、Fintech、Enterprise、Consumer、Retail、Automotive、Gaming、Food、Media、Creative、Education、Health。

部分内置品牌：Linear, Stripe, Vercel, Apple, Notion, Airbnb, Figma, Supabase, Cursor, Shopify, Spotify, Coinbase, Tesla, Nike, IBM, NVIDIA, Miro, Framer, Claude, Xiaohongshu, WeChat 等。

---

## 🔍 评审体系

### 10 维客观指标

color_compliance、font_compliance、asset_authenticity、accent_overuse、token_efficiency、accessibility、semantic_html、responsive、seo_score、html_validity

### 5 维主观评分

philosophy、hierarchy、detail、function、innovation

---

## 📚 知识块系统

15 个知识块（~18KB 设计规则），双层加载（`knowledge/` 目录 MD 文件优先，源码 fallback）：

```
00-方向顾问.md  01-色板规则.md  02-字体规则.md  03-布局模式.md
04-动效原则.md  05-内容规则.md  06-品牌协议.md  07-组件规格.md
08-间距系统.md  09-响应式.md    10-图标规范.md  11-图片规范.md
12-表单规范.md  13-导航模式.md  14-数据可视化.md
```

---

## 🧠 持续学习系统

BWVI 内置一套**自我进化的学习系统**，通过 `learn-system` 命令测量、诊断、升级自身 12 个能力节点。

```
测量(measure) → 诊断(diagnose) → 改进(improve) → 验证(verify) → 固化(solidify) → 循环
```

### 12 个能力节点

```bash
bwvi learn-system status          # 查看所有能力状态 (彩色终端输出)
bwvi learn-system diagnose        # 诊断最大瓶颈
```

| 能力 | 当前等级 | 瓶颈 |
|------|:--------:|------|
| `feedback-learning` | 2/10 | 需收集更多反馈数据 |
| `direction-recommendation` | 4/10 | 关键词匹配 → Semantic Embedding |
| `critique-objective` | 4/10 | 标签检查 → 视觉层级分析 |
| `critique-self-review` | 5/10 | 需要更细粒度评分规则 |
| `learning-from-url` | 5/10 | 正则 → Playwright 渲染 |
| `palette-generation` | 6/10 | HSL 6 种和谐模式已实现 |
| `typography-pairing` | 6/10 | 5 类 × 8 比例尺 × 12 规则 |
| `layout-generation` | 6/10 | 8px 网格 + 视觉重量 |
| `animation` | 6/10 | 12 动画类型，可加 scroll-trigger |
| `brand-coverage` | 7/10 | 115 品牌 |
| `style-coverage` | 7/10 | 56 风格 |
| `knowledge-quality` | **8/10** 🟢 | 15 个知识文件全填充 |
| **综合** | **5.5/10** | |

### 自动闭环

```bash
# critique → 自动注入评审模式到知识库
bwvi critique index.html                            # 评审后自动学习

# feedback < 6 → 自动触发改进记录
bwvi feedback 4 "字体不好看"                         # 低分自动改进

# 低分触发改进后，持久化到 capabilities/
# bwvi learn-system history → 可以看到自动产生的改进记录
```

### 知识注入四通道

```bash
bwvi learn-system ingest https://linear.app         # 从 URL 学习色板/字体/布局
bwvi learn-system ingest feedback                   # 从用户反馈分析模式
bwvi learn-system ingest critique                   # 从评审报告发现失败模式
bwvi learn-system ingest principles                 # 从源码抽取设计原理（新增🚀）
```

`ingest principles` 自动读取 `src/principles/*.ts` 的导出数据，生成结构化的知识 markdown 文件。保证知识库与源码永远同步。

### 升级记录

```bash
bwvi learn-system improve palette-generation   # 升级色板生成能力
bwvi learn-system improve direction-recommendation
bwvi learn-system history                      # 查看全部升级历史
bwvi learn-system knowledge                    # 查看已学知识块
```

### 架构

```
用户 / Agent  →  learn-system CLI  /  MCP tools
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
  Capability Graph            Knowledge Pipeline
  ┌─────────────────┐    ┌───────────────────────────┐
  │ 12 能力节点       │    │ URL → 提取 → 注入知识库    │
  │ 测量 / 诊断 / 记录 │    │ 反馈 → 分析 → 存储模式     │
  │ .bwvi/capabilities│    │ 评审 → 聚合 → 发现瓶颈    │
  │ (自动改进记录)     │    │ 源码 → principles-ingest  │ ← 新增
  └─────────────────┘    └─────────┬─────────────────┘
                                    ▼
                          .bwvi/learned/ + knowledge/*.md (~18KB)
```

---

## 🎨 设计原理层

`v0.4.0` 新增的**原理驱动设计系统**，让 BWVI 从"模板匹配"进化到"原理约束下的创造性混搭"。

### 核心设计

```
不是"选套餐"，而是在原理约束下做创造性组合：

  色彩:    从色相环规则生成 → 6 种和谐模式 (类似色/补色/三角色...)
          自动 WCAG 对比度验证 → text-on-surface ≥ 4.5:1
  
  字体:    从字体分类学出发 → 5 大类 × 8 种比例尺 × 12 条配对规则
          智能推荐: "衬线标题 + 无衬线正文 → 经典组合"
  
  布局:    从 8px 网格系统出发 → 计算视觉重量 → 确定信息密度
          内容量越大 → 布局越紧凑 → 网格列数自适应
  
  冲突检测: 22 种风格属性 × 兼容矩阵 → 判断 A+B 能不能混搭
          "极简色板 × 多彩色板" → 冲突 → 给出修复建议
```

### 混搭组合示例

```bash
# 原理感知的 analyze（新增功能）
bwvi analyze "咖啡品牌"  # 现有：推荐 warm-minimal 方向
                          # 新增：同时推荐混搭方案

# 方案示例 — 不必整套用同一个方向的配置
方案A:  warm-minimal 的方向 + tech-utility 的布局 + 类似色和谐
方案B:  warm-minimal 的方向 + corporate-trust 的字体 + 互补色和谐
方案C:  自定义混搭（选择配色来源 + 字体来源 + 布局来源）
```

### 架构

```
src/principles/
├── types.ts             → HSL 颜色、字体规格、网格系统等类型
├── color-harmony.ts     → HSL 运算 · 6 和谐模式 · WCAG 对比度 · 自动色板生成
├── typography.ts        → 字体分类 · 8 比例尺 · 12 配对规则 · 密度感知
├── layout.ts            → 8px 网格 · 视觉重量 · 信息密度 · 间距节奏
├── conflict.ts          → 22 风格属性 · 兼容矩阵 · 混搭建议引擎
├── composer.ts          → 组合生成器 · 原理评分 · 可读解释
└── __tests__/           → 95 个测试，全部通过
```

### 5 个模块均为零外部依赖，纯数学运算。

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

15 个设计工具 + 4 个学习工具：

**设计工具**: `analyze_design` `generate_design` `critique_design` `critique_diff` `learn_design` `animate_html` `list_directions` `list_styles` `list_brands` `brand_get` `list_blueprints`

**学习工具**: `learn_system_status` `learn_system_diagnose` `learn_system_ingest` `learn_system_knowledge`

**原理工具**（即将推出 CLI 集成）: `compose_mix` `analyze_principle` `validate_palette`

---

## 🔄 跨会话工作流

```bash
# 会话 1: 用户选方向
bwvi showcase --pick landing-editorial
# → 写入 .bwvi/checkpoints/

# 会话 2（新终端）: 读取决策
bwvi checkpoint list
# → 方向已定，直接 generate
```

---

## 📋 API 参考

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

---

## 🛠 开发

```bash
npm install              # 安装依赖
npm run dev -- <args>    # 开发模式（TS 直接运行）
npm run typecheck        # 类型检查（tsc --noEmit）
npm run build            # 生产构建（esbuild CJS+ESM）
npm start                # 运行 dist/bwvi.cjs
npm run benchmark        # 13 用例基准测试
npm test                 # 100 用例单元测试
npm run build && npm start  # 完整构建+运行
```

### 技术栈

- **语言**: TypeScript 5.7+ (strict mode)
- **运行时**: Node.js 20+ (ES2022)
- **打包**: esbuild（CJS + ESM 双格式）
- **MCP**: `@modelcontextprotocol/sdk` v1.29+ (stdio transport)
- **测试**: vitest
- **配置**: YAML

### 项目结构

```
bwvi/
├── src/                TypeScript 源码（112+ 文件）
│   ├── skills/          YAML 技能文件 (v0.5.0 新增)
│   ├── engine/          skill-loader.ts + deck-renderer.ts (v0.5.0 新增)
│   └── cli/             skill.ts (v0.5.0 新增)
├── dist/               构建产物 (CJS 873KB + ESM 867KB)
├── scripts/            构建脚本
├── knowledge/          15 个知识块 (MD)
├── demo/               展示预览（生成文件 + 截图）
├── docs/               设计文档
├── node_modules/       依赖（3 个包）
├── package.json
├── tsconfig.json
├── vitest.config.ts
└── README.md
```

---

## ✅ 基准测试

```bash
bwvi benchmark
# → 13/13 通过 (0.2s)
```

| 用例 | 描述 |
|------|-------------|
| TC01 | 品牌 landing → 方向 + HTML + 评审 ≥ 5.0 |
| TC02 | 冷启动 → 无品牌无参考也能产出 |
| TC03 | 迭代优化 → v2 评分 > v1 |
| TC04 | 中断恢复 → checkpoint 恢复 |
| TC05 | 外部学习 → learnFromUrl 成功 |
| TC06 | 风格列表 → 56 风格完整 |
| TC07 | 品牌搜索 → 115 品牌 |
| TC08 | 风格渲染 → 风格应用成功 |
| TC09 | MCP 数据源 → 56 风格 + 115 品牌 |
| TC10 | 设备边框 → iPhone 渲染正确 |
| TC11 | 动画引擎 → CSS 正常 |
| TC12 | Slop 检测 → 正确识别 |
| TC13 | AI 生图配置 → 7 家提供商 |
| TC14 | Skill 文件系统 → YAML 加载 (v0.5.0) |
| TC15 | Deck 渲染 → 幻灯片输出 (v0.5.0) |
| TC16 | Social 卡片 → 社交卡片输出 (v0.5.0) |

---

## 📄 许可证

Apache-2.0
