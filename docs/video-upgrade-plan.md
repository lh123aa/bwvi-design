# BWVI 视频功能升级计划

> 创建日期: 2026-05-06
> 状态: 规划中
> 技术选型: Playwright 原生录屏 + ffmpeg 合成

---

## 问题总结

当前 `bwvi animate` 和 `bwvi video` 的实际行为：

```
bwvi animate page.html --embed         → ✅ 注入 12 种 CSS 动画 + scroll-trigger
bwvi animate page.html --fps=60        → ❌ 只打印黑帧 ffmpeg 命令，不执行
bwvi video page.html --fps=30          → ❌ 只生成不完整的 Playwright 脚本框架
```

**根因**：没有"把 HTML 页面逐帧渲染成视频"的核心环节。

---

## 目标架构

```
                         BWVI 视频引擎
                                │
            ┌───────────────────┴───────────────────┐
            │                                       │
      本地录制（免费）                         云端渲染（付费，后续考虑）
            │                                       │
   Playwright 原生录屏                     Browserless + ffmpeg
   + ffmpeg 后期合成                       + CDN 分发
            │                                       │
   5-10s 出 1080p MP4                    3-5s 出 4K 60fps
   需安装 Playwright                      零安装
```

---

## 技术方案

### 核心原理

```
HTML 文件
  │  injectAnimations() 注入动画 CSS + JS
  ▼
带动画的 HTML
  │  Playwright 打开页面 + 自动滚动
  ▼
浏览器渲染（真实 CSS）
  │  context.recordVideo 原生录屏
  ▼
原始 WebM
  │  ffmpeg 转码 + 裁剪 + 加 BGM
  ▼
成品 MP4 / GIF
```

### 为什么选 Playwright 原生录屏

| 方案 | 代码量 | 渲染保真度 | 稳定性 | 依赖 |
|:----:|:------:|:---------:|:------:|:----:|
| 逐帧截图 + ffmpeg 合成 | ~80 行 | ★★★★★ | ⚠️ 帧间隔不稳定 | Chromium + ffmpeg |
| **Playwright recordVideo** | **~30 行** | **★★★★★** | **✅ 原生** | **Chromium** |
| Puppeteer Stream | ~50 行 | ★★★★★ | ⚠️ 社区维护 | Chromium |
| Canvas 2D | ~200 行 | ★☆☆☆☆ | ✅ | node-canvas |

Playwright 的 `recordVideo` 是 **Chromium 原生录屏**——录制的是真实的浏览器 Tab 流，不是逐帧截图，所以：
- 不丢帧（原生视频编码 vs 截图定时器）
- 性能更好（GPU 加速编码）
- 代码最少（3 行配置）

---

## 迭代计划

### Phase 1：核心录制引擎（2-3 天）

#### 1.1 新建 `src/engine/video-capture.ts`

```typescript
// 核心功能：Playwright 打开 HTML → 自动滚动 → 录制成视频

interface CaptureOptions {
  fps: number;                    // 25 / 30 / 60
  format: "mp4" | "gif" | "webm";
  viewport: { width: number; height: number };
  scrollBehavior: "auto" | "section" | "none";
  duration?: number;              // 秒（不指定则滚动到页底）
}

export async function captureVideo(
  htmlPath: string,
  outputPath: string,
  opts: CaptureOptions
): Promise<{ path: string; duration: number; frames: number }>
```

**实现步骤**：
1. 读取 HTML，调用 `injectAnimations()` 注入动画 CSS + JS
2. 启动 Playwright + Chromium
3. 配置 `recordVideo` 参数（输出目录、分辨率）
4. 加载 HTML，等待网络空闲 + 字体加载
5. 根据 `scrollBehavior` 自动滚动页面
6. 关闭 browser context → Playwright 自动保存 WebM
7. 调用 ffmpeg 转码为指定格式

#### 1.2 滚动策略实现

| 滚动模式 | 实现 | 适用场景 |
|----------|------|----------|
| `auto` | 匀速 scrollTo(deltaY) 到页底 | 长页面 landing page |
| `section` | 逐个找到 `<section>` 标签，每节停顿 1s | 多 section 页面 |
| `none` | 不滚动，固定视口 | 单屏 App 原型 |

#### 1.3 动画注入增强

当前 `animate --embed` 只是注入 CSS + JS，需要额外注入：

```typescript
function injectAnimations(html: string, opts: {
  stagger?: boolean;    // 序列动画
  autoPlay?: boolean;   // 自动播放（不需要 IntersectionObserver 等待）
  loop?: number;        // 循环次数
}): string {
  // 1. 注入动画 CSS（同现有 getAnimationCSS()）
  // 2. 替换 IntersectionObserver 为直接播放（视频录制不需要等待滚动）
  // 3. 注入 stagger 延迟
  // 4. 可选：注入循环动画
}
```

---

### Phase 2：ffmpeg 合成引擎（1-2 天）

#### 2.1 新建 `src/engine/video-composer.ts`

```typescript
// 核心功能：WebM → MP4/GIF 转码 + BGM + 水印 + 裁剪

interface ComposeOptions {
  fps: number;
  format: "mp4" | "gif";
  bgm?: string;                    // BGM 文件路径
  bgmVolume?: number;              // 0-1
  crossfadeIn?: number;            // 淡入秒数
  crossfadeOut?: number;           // 淡出秒数
  crop?: { width: number; height: number; x: number; y: number };
  watermark?: string;              // 水印图片路径
  quality?: "high" | "medium" | "low";
}

export async function composeVideo(
  inputPath: string,       // Playwright 输出的 .webm
  outputPath: string,      // 最终输出 .mp4 / .gif
  opts: ComposeOptions
): Promise<void>
```

**支持的转换链**：

```
输入.webm
  │
  ├──→ MP4（H.264, 默认）
  │     ffmpeg -i input.webm -c:v libx264 -pix_fmt yuv420p output.mp4
  │
  ├──→ GIF（palette 优化）
  │     ffmpeg -i input.webm -vf "palettegen" palette.png
  │     ffmpeg -i input.webm -i palette.png -lavfi "paletteuse" output.gif
  │
  ├──→ +BGM
  │     ffmpeg -i output.mp4 -i bgm.mp3 -c:v copy -c:a aac -shortest output-bgm.mp4
  │
  └──→ +水印
        ffmpeg -i output.mp4 -i watermark.png -filter_complex "overlay=W-w-20:H-h-20" output-wm.mp4
```

#### 2.2 内置 BGM 资产

从免费音乐库（Pixabay / Freesound）下载 5 首免版权 BGM：

```
assets/bgm/
├── tech.mp3          # 科技感电子乐
├── corporate.mp3     # 企业专业
├── warm.mp3          # 温暖原声
├── energetic.mp3     # 动感活力
└── ambient.mp3       # 氛围环境
```

首次使用 `--bgm=tech` 时自动下载到本地缓存 `~/.bwvi/cache/bgm/`。

---

### Phase 3：CLI 命令改造（1 天）

#### 3.1 改造 `bwvi animate`

```bash
# 当前行为（保留兼容）
bwvi animate page.html --embed           # → 只注入动画（不变）

# 新增行为
bwvi animate page.html --record          # → 录制视频（默认 1080p 25fps）
bwvi animate page.html --record --fps=60 # → 60fps 高帧率
bwvi animate page.html --record --duration=15  # → 15 秒视频
bwvi animate page.html --record --bgm=tech    # → 加 BGM
bwvi animate page.html --record --format=gif  # → 导出 GIF
bwvi animate page.html --record --scroll=section  # → 按节滚动
bwvi animate page.html --record --quick   # → 快速模式（720p 15fps）
```

#### 3.2 完整命令帮助

```
bwvi animate <file.html> [options]

Embed animations or export video from HTML.

Animation options:
  --embed               Embed animation CSS + scroll-trigger JS (default)

Video export options:
  --record              Record browser video (requires Playwright)
  --fps=<n>             Frame rate: 15|25|30|60 (default: 25)
  --duration=<n>        Video duration in seconds (default: auto, scroll to bottom)
  --format=<fmt>        Output format: mp4|gif|webm (default: mp4)
  --bgm=<name>          Background music: tech|corporate|warm|energetic|ambient
  --scroll=<mode>       Scroll behavior: auto|section|none (default: auto)
  --quick               Quick mode: 720p, 15fps, lower quality (faster export)
  --output=<file>       Output file path (default: page.mp4)
  --watermark=<file>    Watermark image overlay

Examples:
  bwvi animate page.html --record                          # 默认录制
  bwvi animate page.html --record --fps=60 --format=mp4    # 60fps 高清
  bwvi animate page.html --record --bgm=tech --duration=10 # 10s 配乐视频
  bwvi animate page.html --record --format=gif             # GIF 导出
  bwvi animate page.html --record --quick                  # 快速预览
```

#### 3.3 废弃 `bwvi video`

将 `bwvi video` 命令标记为 deprecated，指向 `bwvi animate --record`：

```typescript
export async function videoCommand(args: string[]) {
  console.warn("⚠️ bwvi video 已废弃，请使用 bwvi animate --record");
  await animateCommand([...(args || []), "--record"]);
}
```

---

### Phase 4：交互原型录制（2-3 天）

#### 4.1 交互检测引擎

```typescript
// 自动检测 HTML 中的交互元素并模拟点击
export async function recordInteraction(
  htmlPath: string,
  outputPath: string,
  interactions: InteractionStep[]
): Promise<void>

interface InteractionStep {
  selector: string;      // CSS 选择器
  action: "click" | "scrollTo" | "type" | "wait";
  value?: string;
  pauseAfter?: number;   // 操作后停顿（ms）
}
```

#### 4.2 自动识别交互元素

扫描 HTML 中的 `data-bwvi-toggle` 属性，自动生成交互步骤：

```typescript
function autoDetectInteractions(html: string): InteractionStep[] {
  const steps: InteractionStep[] = [];
  
  // Modal
  if (html.includes('data-bwvi-toggle="modal"')) {
    steps.push({ selector: '[data-bwvi-toggle="modal"]', action: "click", pauseAfter: 1000 });
  }
  
  // Tab
  if (html.includes('data-bwvi-toggle="tab"')) {
    steps.push({ selector: '[data-bwvi-toggle="tab"]', action: "click", pauseAfter: 800 });
  }
  
  // Carousel
  if (html.includes('data-bwvi-carousel')) {
    steps.push({ selector: '[data-bwvi-carousel]', action: "click", pauseAfter: 500 });
  }
  
  return steps;
}
```

#### 4.3 交互 Demo 录制命令

```bash
bwvi generate "App onboarding" --device=iphone --interactive
bwvi animate preview-iphone.html --record --interactive
# → 自动检测交互元素 → 模拟点击 → 录制操作流程 Demo
```

---

### Phase 5：质量优化（1-2 天）

#### 5.1 GIF 优化链

```bash
# 当前 GIF 质量差（颜色丢失、抖动）
ffmpeg -i input.mp4 -vf "palettegen" palette.png
ffmpeg -i input.mp4 -i palette.png -lavfi "paletteuse=dither=bayer:bayer_scale=5" output.gif

# 可选：更高质量（慢）
ffmpeg -i input.mp4 -vf "palettegen=stats_mode=diff" palette.png
ffmpeg -i input.mp4 -i palette.png -lavfi "paletteuse=dither=floyd_steinberg" output.gif
```

#### 5.2 帧率插帧（60fps 平滑）

```bash
# Motion-interpolated 60fps（需要 ffmpeg 的 minterpolate 滤镜）
ffmpeg -i input.webm -vf "minterpolate=fps=60:mi_mode=mci" output-60fps.mp4
```

#### 5.3 自动检测 ffmpeg + Playwright

首次运行 `--record` 时自动检测依赖并给出明确的安装指引：

```
✓ ffmpeg found (v6.1)
✓ Playwright found (v1.48)
✓ Chromium installed
→ 开始录制...
```

或：

```
✗ ffmpeg not found
  → Install: winget install ffmpeg 或 brew install ffmpeg

✗ Playwright not found
  → Install: npm install -D playwright && npx playwright install chromium
```

#### 5.4 缓存机制

```
~/.bwvi/cache/
├── bgm/               # 下载的 BGM 文件
│   ├── tech.mp3
│   └── ...
├── frames/            # 临时帧目录（自动清理）
│   └── bwvi-xxxxx/
│       ├── frame-0001.png
│       └── ...
└── chromium/          # 可选：托管 Chromium（避免全局安装）
```

---

## 文件清单

| 文件 | 作用 | 新增/修改 | 预估行数 |
|------|------|:---------:|:--------:|
| `src/engine/video-capture.ts` | Playwright 录屏核心 | 新增 | ~120 |
| `src/engine/video-composer.ts` | ffmpeg 合成 + BGM + 水印 | 新增 | ~150 |
| `src/engine/video-inject.ts` | HTML 动画注入（录制专用） | 新增 | ~80 |
| `src/engine/interaction-capture.ts` | 交互检测 + 自动点击 | 新增 | ~100 |
| `src/cli/animate.ts` | 改造 animate 命令 | 修改 | ~200 |
| `src/cli/video.ts` | 废弃 video，指向 animate | 修改 | ~20 |
| `src/engine/animation-engine.ts` | 增加视频模式的 animation 注入 | 修改 | ~30 |
| `assets/bgm/` | 5 首免版权 BGM | 新增 | 5 文件 |
| `docs/video-upgrade-plan.md` | 本文档 | 新增 | — |

**合计新增代码**：~700 行 TS
**合计修改代码**：~250 行 TS

---

## 时间线

| Phase | 内容 | 预估工时 | 产出 |
|:-----:|------|:--------:|------|
| **P1** | 核心录制引擎 `captureVideo()` | 2-3 天 | `bwvi animate --record` 可用 |
| **P2** | ffmpeg 合成 `composeVideo()` | 1-2 天 | MP4/GIF + BGM 支持 |
| **P3** | CLI 改造 + 帮助文档 | 1 天 | 完整命令体系 |
| **P4** | 交互录制 `recordInteraction()` | 2-3 天 | 自动点击 Demo 录制 |
| **P5** | 质量优化 + 缓存 + 依赖检测 | 1-2 天 | 生产级稳定性 |
| **总计** | | **7-11 天** | |

---

## 验收标准

```
✅ bwvi animate page.html --record
   → 输出 page.mp4（1080p, 25fps, 含 CSS 动画）
   → 视频长度 = 页面滚动到底的时间

✅ bwvi animate page.html --record --fps=60
   → 60fps 流畅视频

✅ bwvi animate page.html --record --bgm=tech
   → 视频含背景音乐，淡入淡出

✅ bwvi animate page.html --record --format=gif
   → 输出优化后的 GIF（palette 模式）

✅ bwvi animate page.html --record --quick
   → 快速模式，5s 内出视频

✅ bwvi animate preview-iphone.html --record --interactive
   → 自动检测交互元素 → 录制操作流程

✅ bwvi animate page.html --record --duration=10
   → 精确 10 秒视频

❌ bwvi animate page.html --record（无 Playwright）
   → 清晰提示安装 Playwright + Chromium

❌ bwvi animate page.html --record --bgm=xyz（不存在的 BGM）
   → 优雅降级，提示可用 BGM 列表
```

---

## 优先级组合

```
MVP（Phase 1 + 2 + 3） ─── 5 天
├── `bwvi animate --record` 核心录制
├── ffmpeg MP4/GIF 合成
├── BGM 支持
└── CLI 改造完成

增强版（+ Phase 4） ───── 7-8 天
└── 交互录制 + 自动点击

生产版（+ Phase 5） ───── 9-11 天
├── GIF 优化
├── 帧率插帧
├── 依赖自动检测
└── 缓存机制
```

---

## 依赖安装指南

```bash
# 安装 Playwright（视频录制的核心依赖）
npm install --save-dev playwright
npx playwright install chromium

# 安装 ffmpeg（视频合成的核心依赖）
# Windows:
winget install ffmpeg
# macOS:
brew install ffmpeg
# Linux:
sudo apt install ffmpeg
```

BWVI 将在首次执行 `--record` 时自动检测这些依赖并给出指引。
