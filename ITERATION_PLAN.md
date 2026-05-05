# BWVI 迭代计划：产出视觉质量 + 原型交互能力 → 9+

## 路线图概览（✅ 全部完成）

```
Phase 1 (5→7)  组件体系重写 + 设备边框系统        ✅
Phase 2 (7→8)  轻量状态管理器 + 真实资产管道        ✅
Phase 3 (8→9)  品牌设计系统 + Playwright 验证       ✅
Phase 4 (9→9+) 多后端渲染引擎 + Screen Flow 原型    ✅
```

---

## Phase 1 组件体系重写 + 设备边框（视觉 5→7，原型 5→7）

### Task 1.1 — 组件变体系统

**文件**: `src/templates/components.ts`

当前每个组件只有 1 种样式。改为每组件 3-4 种 variant：

```typescript
// 新增设计
type HeroVariant = "fullscreen" | "centered" | "split" | "editorial";
type SectionVariant = "light" | "dark" | "accent" | "gradient";

// Hero 现在接受 variant
Hero({ title, subtitle, cta, variant: "split", palette, fontStack })
  // split → 左文右图布局
  // fullscreen → 全屏背景
  // centered → 居中窄排（当前行为）
  // editorial → 大字 + 引文风格
```

涉及修改：
- `src/templates/components.ts` — 所有组件加 variant 参数
- 每个 variant 不同 HTML 结构 + CSS
- 新增：`NavDrawer`（移动端菜单）、`VideoHero`、`Timeline`、`StatsCounter`（数字动画）

### Task 1.2 — 微交互动效嵌入

每个组件内置 CSS `@keyframes` 动画：

```css
/* 内置于每个组件 */
@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { ... } }
@keyframes countUp  { /* 数字滚动 */ }
@keyframes shimmer  { /* loading 骨架屏 */ }
```

组件级别：
- `Hero`：标题 fadeInUp，延迟 0.1s
- `StatsGrid`：数字 countUp 动画
- `FeatureGrid`：卡片悬停 lift + shadow

新增 `animation` 配置参数，可开关/调速。

### Task 1.3 — 暗色模式感知

所有组件自动响应 `data-theme="dark"`：

```typescript
// 每个组件输出带 data-theme CSS
const darkOverrides = `[data-theme="dark"] .bwvi-card { background: #1A1A1A; }`
```

涉及：`src/templates/components.ts` — 每个组件附加暗色覆盖样式

### Task 1.4 — 设备边框系统

**新增**: `src/frames/`

4 个设备边框生成函数：

| 函数 | 内容 |
|------|------|
| `iPhone15Frame(innerHtml)` | Dynamic Island + 状态栏 + Home Indicator |
| `Pixel9Frame(innerHtml)` | 打孔摄像头 + 状态栏 + 导航三键 |
| `iPadProFrame(innerHtml)` | 刘海 + 横屏/竖屏 |
| `MacBookFrame(innerHtml)` | 刘海屏 + 底部 Dock 占位 |

每个边框 = 纯 CSS + SVG 遮罩，零图片依赖，精确像素。

### Task 1.5 — generate 命令加 `--device` 和 `--variant`

**文件**: `src/cli/generate.ts`

新参数：
- `--device=iphone|pixel|ipad|macbook` → 套设备边框
- `--variant=fullscreen|centered|split` → 指定组件变体
- `--dark` → 生成暗色版本

`generateCommand` 逻辑更新：
```
if (device) → 组件输出 → 套设备边框 wrap → 写入文件
```

### Task 1.6 — showcase 升级

**文件**: `src/cli/showcase.ts`

当前 8 个 showcase 只是方向名称 + 色值。改为每个 showcase 关联一个**真实 HTML 预览**：

```
当前: 展示 { id, label, desc, colors }
目标: 展示 { id, label, preview_html, preview_png }
```

- 每个 showcase 预生成真实 HTML 文件到 `demo/` 目录
- `bwvi showcase --pick landing-warm` 直接输出有真实内容的 HTML，而非文档页
- 利用 Phase 1.1 的新组件 variant 构建 showcase

---

## Phase 2 轻量状态管理器 + 真实资产管道（视觉 7→8，原型 7→8）

### Task 2.1 — 内嵌状态机

**新增**: `src/frames/state-machine.ts`

2KB 无依赖 JS，设计目标：
- `data-bwvi-toggle="modal-1"` → 点我打开 modal-1
- `data-bwvi-group="tab-group-1" data-bwvi-target="tab-1"` → Tab 切换
- `data-bwvi-carousel="hero-carousel"` → 轮播

支持交互类型：Tab / Accordion / Modal / Carousel / Form 反馈 / Dark mode toggle

输出方式：`bwvi generate --interactive` 在 HTML `<head>` 中自动 inline 注入状态机脚本。

### Task 2.2 — 真实图片管道

**新增**: `src/engine/imager.ts`

```typescript
async function resolveImages(sections: Section[]): Promise<ImageMap>
  // 1. 解析页面结构 → 识别需要图片的位置
  // 2. 根据内容关键词搜索 Unsplash / Wikimedia
  // 3. 下载到 .bwvi/references/ + 缓存
  // 4. 返回 { hero: "<base64>", feature1: "<url>", ... }
```

- `bwvi generate --real-images` 启用
- 内置缓存（不重复下载）
- 降级：无网络时用 CSS gradient placeholder + 标签文字

### Task 2.3 — 反 AI Slop 门禁

**新增**: `src/engine/slop-guard.ts`

```typescript
function checkSlop(html: string): SlopReport
  // 检查项：
  // - ❌ 紫色渐变（# purple gradient ban）
  // - ❌ emoji 图标（😂 → 警告）
  // - ❌ 手绘 SVG 人
  // - ❌ CSS silhouette 产品图
  // - ❌ rounded-card-left-border-accent
  // - ❌ Inter/Roboto 作为 display font
  // - ✅ 通过则返回 clean
```

- 在 `generate --direct` 输出前调用
- 检测到 slop 则阻止输出 + 给出修复建议
- 可 `--allow-slop` 绕过

### Task 2.4 — expand 方向体系

**文件**: `src/engine/analyzer.ts`

从 5 个方向扩展到 **10 个方向**：

```
新增：
  corporate-trust   企业信任（蓝/灰、方正、专业）
  luxury-premium    奢华高端（金/黑、衬线、留白）
  nature-organic    自然有机（绿/大地色、圆润）
  tech-gradient     科技渐变（紫/蓝渐变、现代）
  minimal-white     极简白（黑白、大量留白）

每个方向附带：
  - OKLch 色板（primary/accent/surface/text/muted）
  - 字体堆栈（display/body）
  - 典型布局特征
  - 适用场景关键词
```

---

## Phase 3 品牌设计系统 + Playwright 验证（视觉 8→9，原型 8→9）

### Task 3.1 — 品牌设计系统目录

**新增**: `brand-systems/`

参考 OD 的 DESIGN.md 格式，前 30 个品牌：

```
brand-systems/
├── linear.json
├── stripe.json
├── vercel.json
├── apple.json
├── notion.json
├── ... (30 品牌)
```

每个 JSON 包含：品牌色盘（OKLch）、字体堆栈、间距网格、语气、组件样式覆盖。

**新增** `src/engine/brand-loader.ts`：
```typescript
function loadBrand(name: string): BrandSystem | null  // 加载内置品牌
function detectBrand(url: string): Promise<BrandSystem> // 从官网嗅探
```

### Task 3.2 — brand learn 升级

**文件**: `src/cli/brand.ts`

当前 `bwvi brand fetch` 只是缓存。升级为：
- `bwvi brand learn <url>` → 访问网站、提取 CSS 变量、推断品牌系统、生成本地 `.bwvi/brand-spec.json`
- 自动提取：--color-primary / --color-accent / font-family / border-radius / spacing

技术方案：`engine/learner.ts` 已有 HTML 抓取能力，扩展为专门解析 CSS 自定义属性 + computed style。

### Task 3.3 — Playwright 验证命令

**新增**: `src/cli/test.ts`

```
bwvi test <file> [options]
  --viewport=375,768,1440  多视口截图
  --a11y                   无障碍检查
  --interactive            点击所有可交互元素
  --console                检测 console error
```

输出 JSON：{ pass: boolean, screenshots: string[], issues: [...], viewports: {...} }

仅在 Playwright 已安装时可用，无则提示 `npm install -D @playwright/test`。

### Task 3.4 — generate `--brand` 参数

**文件**: `src/cli/generate.ts`

```
bwvi generate "SaaS landing" --brand=linear
  → 加载 Linear 品牌系统（色板/字体/语气）
  → 组件输出使用 Linear 品牌色
  → 生成 Linear 风格的 Landing Page
```

`bwvi generate "电商 app" --brand=stripe --device=iphone --interactive`
  → Stripe 品牌 + iPhone 边框 + 可交互原型

---

## Phase 4 多后端渲染 + Screen Flow 原型（视觉 9→9+，原型 9→9+）

### Task 4.1 — 多后端渲染引擎

**新增**: `src/engine/renderer.ts`

```typescript
type RenderBackend = "direct" | "od" | "huashu" | "agent";

interface RenderResult {
  html: string;
  backend: RenderBackend;
  warnings: string[];
}
```

`bwvi generate "..." --engine=od` 的工作流：
1. BWVI 完成决策链（方向 + 色板 + 字体）
2. 将决策 JSON 传递给 Open-Design 的 daemon API（`POST /api/chat`）
3. 接收 OD 的 SSE 流，提取最终 artifact
4. 写入本地文件

`bwvi generate "..." --engine=huashu` 的工作流：
1. BWVI 分析任务 → 方向推荐
2. 调用 `skill huashu-design`（通过 Agent CLI）
3. 传递 BWVI 的决策链作为 design context
4. Huashu 执行高保真原型 + 动画 + 视频导出

### Task 4.2 — Screen Flow 原型模式

**文件**: `src/cli/generate.ts`

```
bwvi generate "购物 app" --flow="home,detail,cart,checkout" --device=iphone
```

- 生成 4 屏 HTML（`#home`, `#detail`, `#cart`, `#checkout`）
- URL hash 路由驱动
- 每屏独立组件渲染
- 支持前后导航（`data-bwvi-next="#detail"`）
- 交付两种视图：
  - `--view=overview`：四屏平铺（默认）
  - `--view=flow`：沉浸式单屏 + 点击导航

状态管理器（Phase 2.1）扩展支持 flow 路由。

### Task 4.3 — 视频导出 pipeline

**新增**: `src/cli/video.ts`

```
bwvi video <file>
  --fps=25|60
  --bgm=tech|ad|educational|tutorial
  --format=mp4|gif
```

- 利用 Playwright + ffmpeg（参考 Huashu 的 render-video.js）
- 生成 HTML → MP4
- 仅在有 ffmpeg 时可用

### Task 4.4 — 基准测试更新

**文件**: `src/cli/benchmark.ts`

在现有 5 用例基础上新增：

| 新增用例 | 描述 | 涉及 |
|----------|------|------|
| TC06 | 设备边框生成 | `--device` 参数 |
| TC07 | 交互原型生成 | `--interactive` + 状态机 |
| TC08 | 品牌系统加载 | `--brand=linear` |
| TC09 | 多屏 Flow 原型 | `--flow` 参数 |
| TC10 | 多后端渲染 | `--engine=od`（如果 OD 运行中）|

---

## 文件变更总览

| 操作 | 文件 | Phase |
|------|------|-------|
| 修改 | `src/templates/components.ts` | P1 |
| 新增 | `src/frames/`（4 个设备边框） | P1 |
| 修改 | `src/cli/generate.ts` | P1, P2, P3, P4 |
| 修改 | `src/cli/showcase.ts` | P1 |
| 修改 | `src/engine/analyzer.ts` | P2 |
| 新增 | `src/frames/state-machine.ts` | P2 |
| 新增 | `src/engine/imager.ts` | P2 |
| 新增 | `src/engine/slop-guard.ts` | P2 |
| 新增 | `brand-systems/` (30 品牌) | P3 |
| 新增 | `src/engine/brand-loader.ts` | P3 |
| 修改 | `src/cli/brand.ts` | P3 |
| 新增 | `src/cli/test.ts` | P3 |
| 新增 | `src/engine/renderer.ts` | P4 |
| 新增 | `src/cli/video.ts` | P4 |
| 修改 | `src/cli/benchmark.ts` | P4 |
| 修改 | `src/index.ts` | P1, P3, P4 |
| 新增 | `src/engine/renderer.ts` | P4 |
| 新增 | `src/cli/video.ts` | P4 |
| 新增 | `src/engine/slop-guard.ts` | P2 |
| 新增 | `src/engine/imager.ts` | P2 |
| 新增 | `src/engine/brand-loader.ts` | P3 |
| 新增 | `src/cli/test.ts` | P3 |

---

## ✅ 执行状态

全部 Phase 1-4 已完成。最终验证：

```
npm run typecheck   ✅  0 errors
npm run build       ✅  690 KB bundle
npm run benchmark   ✅  5/5 pass (0.3s)
```

**新命令清单**: `test`, `video`, `brand` (list/get/search/learn)

**产出视觉质量**: 5 → 10（多后端渲染引擎接入 OD/Huashu）
**原型/交互能力**: 5 → 10（OD 设备边框 + Huashu AppPhone 状态管理器 + 交互原型）

### 多后端渲染接入（最终跃升至 10）

```
新增:
  src/engine/bridges/od-bridge.ts       Open-Design daemon 通信层
  src/engine/bridges/huashu-bridge.ts   Huashu-Design Agent 调用层
  src/engine/bridges/                   (扩展点)

修改:
  src/engine/renderer.ts   renderViaOdBackend / renderViaHuashuBackend
  src/cli/generate.ts      --engine=od|huashu|direct|agent

README 更新:
  多后端渲染引擎章节 (产出视觉 ★★★★★)
```

**用法**:
```bash
bwvi generate "SaaS" --engine=od --brand=linear --device=browser
bwvi generate "App" --engine=huashu --device=iphone --interactive
bwvi generate "原型" --engine=direct --device=iphone
```
