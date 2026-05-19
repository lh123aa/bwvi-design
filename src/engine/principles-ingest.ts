import { writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { IngestResult } from "../types/learning.js";

function getProjectRoot(): string {
  let dir = process.cwd();
  while (dir !== join(dir, "..")) {
    if (existsSync(join(dir, "package.json")) && existsSync(join(dir, "knowledge"))) {
      return dir;
    }
    dir = join(dir, "..");
  }
  return process.cwd();
}

const projectRoot = getProjectRoot();
const KNOWLEDGE_DIR = join(projectRoot, "knowledge");

const DIRECTION_DESCRIPTIONS: Record<string, string> = {
  "editorial-monocle": "编辑式克制 Editorial Monocle — 文字驱动、信息层级清晰、深蓝色为主、暖红为强调色。适合杂志、博客、内容平台、新闻门户。",
  "warm-minimal": "温暖极简 Warm Minimal — 柔和暖色为主、大量留白、暖橙和棕褐配色。适合咖啡馆、手作品牌、生活方式、个人品牌。",
  "tech-utility": "科技实用 Tech Utility — 清晰简约、功能性优先、绿+暗色系。适合 SaaS、开发者工具、企业软件、产品官网。",
  "dark-luxury": "深色奢华 Dark Luxury — 深色背景+金色强调、高端质感。适合奢侈品、高端品牌、时装、Premium 产品。",
  "playful-color": "多彩趣味 Playful Color — 丰富多色、大胆对比、活泼有趣。适合游戏、教育、儿童品牌、创意工作室。",
  "corporate-trust": "企业信赖 Corporate Trust — 蓝色为主、稳健可靠、专业感强。适合金融、保险、法律、咨询、B2B。",
  "luxury-premium": "奢华高端 Luxury Premium — 黑金配色、精致细节、高端材质感。适合珠宝、高端地产、私人俱乐部。",
  "nature-organic": "自然有机 Nature Organic — 绿色大地色系、有机曲线、自然纹理。适合食品、健康、环保、户外。",
  "tech-gradient": "科技渐变 Tech Gradient — 渐变色彩、未来感、动态视觉效果。适合科技品牌、创意 Agency、数字产品。",
  "minimal-white": "极简白 Minimal White — 大量留白、细线框、极致简约。适合艺术、摄影、设计工作室、个人作品集。",
};

const PALETTE_INFO: Record<string, { primary: string; accent: string; surface: string; text: string; hue: number; harmony: string }> = {
  "editorial-monocle": { primary: "#1E3A5F", accent: "#C44536", surface: "#FAF8F5", text: "#2D2D2D", hue: 210, harmony: "complementary" },
  "warm-minimal": { primary: "#C17A47", accent: "#8B5E3C", surface: "#FFF8F0", text: "#3D2B1F", hue: 30, harmony: "analogous" },
  "tech-utility": { primary: "#0057FF", accent: "#00E698", surface: "#F5F7FA", text: "#1A1A2E", hue: 220, harmony: "triadic" },
  "dark-luxury": { primary: "#C9A84C", accent: "#8B6914", surface: "#0D0D0D", text: "#E8E8E8", hue: 45, harmony: "complementary" },
  "playful-color": { primary: "#FF6B9D", accent: "#45E3FF", surface: "#FFF5F5", text: "#2D1B2E", hue: 340, harmony: "triadic" },
  "corporate-trust": { primary: "#1A56DB", accent: "#0C4A6E", surface: "#F8FAFC", text: "#1E293B", hue: 215, harmony: "complementary" },
  "luxury-premium": { primary: "#D4AF37", accent: "#8B6914", surface: "#1A1A1A", text: "#F5F5F5", hue: 48, harmony: "complementary" },
  "nature-organic": { primary: "#4A7C59", accent: "#C17A47", surface: "#F5FBF5", text: "#2D3D2D", hue: 110, harmony: "analogous" },
  "tech-gradient": { primary: "#6C63FF", accent: "#FF6584", surface: "#0A0A1A", text: "#E0E0FF", hue: 250, harmony: "complementary" },
  "minimal-white": { primary: "#2D2D2D", accent: "#C44536", surface: "#FFFFFF", text: "#1A1A1A", hue: 0, harmony: "analogous" },
};

function knowledgeDir(): string {
  if (existsSync(KNOWLEDGE_DIR)) return KNOWLEDGE_DIR;
  const fallback = join(process.cwd(), "knowledge");
  if (!existsSync(fallback)) mkdirSync(fallback, { recursive: true });
  return fallback;
}

interface KnowledgeFile {
  filename: string;
  title: string;
  description: string;
  tags: string[];
  body: string;
}

function buildColorHarmonyContent(): KnowledgeFile {
  const body = `# 色板规则

## 色彩模型

BWVI 使用 **HSL 色彩空间**（色相 Hue、饱和度 Saturation、明度 Lightness）进行所有色板计算。HSL 比 RGB 更符合人类对颜色的感知方式，可以精确控制色调关系和视觉重量。

### HSL 色板生成

函数: \`generateHarmonyPalette(hue, mode)\` — 从基准色相出发，按和谐模式生成一组色相值。
函数: \`generatePaletteFromHues(hues, saturation, lightness)\` — 将色相值转为实际 hex 颜色。

### 6 种和谐模式

| 模式 | 色相运算 | 效果 | 适用场景 |
|------|---------|------|---------|
| 单色 monochromatic | 同一色相 ±10° 内 | 统一、简洁、优雅 | 高端品牌、极简设计 |
| 类似色 analogous | 相邻 ±30° | 和谐、舒适、自然 | 品牌一致性、温暖调性 |
| 互补色 complementary | 相距 180° | 高对比、冲击力强 | CTA 强调、标题突出 |
| 分裂互补 split-complementary | 主色 + 互补两侧 ±30° | 对比柔和、容错率高 | 多色彩品牌系统 |
| 三角色 triadic | 均分 120° | 丰富而不杂乱 | 创意设计、游戏界面 |
| 四角色 tetradic | 两组互补 (90° 间隔) | 色彩丰富，需控制比例 | 大型设计系统 |

### WCAG 对比度验证

函数: \`contrastRatio(color1, color2)\` — 基于 WCAG 2.1 的相对亮度公式计算。

| 级别 | 对比度要求 | 适用 |
|------|-----------|------|
| WCAG AA (正常文本) | ≥ 4.5:1 | 正文 < 18px |
| WCAG AA (大文本) | ≥ 3:1 | 标题 ≥ 18px bold / ≥ 24px |
| WCAG AAA (正常文本) | ≥ 7:1 | 高可访问性要求 |

### 10 个方向的色板配置

| 方向 | 基准色相 | 和谐模式 | 主色 | 强调色 |
|------|---------|---------|:----:|:------:|
| editorial-monocle | 210° | complementary | #1E3A5F | #C44536 |
| warm-minimal | 30° | analogous | #C17A47 | #8B5E3C |
| tech-utility | 220° | triadic | #0057FF | #00E698 |
| dark-luxury | 45° | complementary | #C9A84C | #8B6914 |
| playful-color | 340° | triadic | #FF6B9D | #45E3FF |
| corporate-trust | 215° | complementary | #1A56DB | #0C4A6E |
| luxury-premium | 48° | complementary | #D4AF37 | #8B6914 |
| nature-organic | 110° | analogous | #4A7C59 | #C17A47 |
| tech-gradient | 250° | complementary | #6C63FF | #FF6584 |
| minimal-white | 0° | analogous | #2D2D2D | #C44536 |

### 色板生成规则

1. **Primary** (主色): 基准色相 × 目标饱和度 × 目标明度 — 品牌的视觉锚点
2. **Accent** (强调色): 和谐模式的对应色相 × 调整后的饱和度/明度 — 用于 CTA、链接、高亮
3. **Surface** (背景色): 高亮低饱和版本 — 确保文本可读性
4. **Text** (文本色): 高对比度版本 — 确保 WCAG AA 合规

规则: accent-on-surface 对比度 ≥ 3:1, text-on-surface 对比度 ≥ 4.5:1。
`;
  return { filename: "01-色板规则.md", title: "色板规则", description: "HSL 色板生成、和谐模式、WCAG 对比度验证", tags: ["color", "palette", "WCAG", "HSL"], body };
}

function buildTypographyContent(): KnowledgeFile {
  const body = `# 字体规则

## 字体分类系统

\`classifyFont(fontName)\` — 返回字体类别和风格特征。

### 5 大字体类别

| 类别 | 风格特征 | 推荐场景 | 示例 |
|------|---------|---------|------|
| serif | 经典、优雅、信赖感 | 标题、品牌展示 | Playfair Display, Georgia, DM Serif Display |
| sans-serif | 现代、中性、高可读性 | 正文、UI | Inter, DM Sans, Outfit, Space Grotesk |
| display | 个性、装饰性、强风格 | 大标题、Logo | Bangers, Press Start 2P |
| monospace | 技术感、等宽、精确 | 代码、数据 | JetBrains Mono |
| handwriting | 手写感、个性、温暖 | 引用、签名 | 待扩充 |

## 排版比例尺

\`generateTypeScale(baseSize, ratio)\` — 生成 8 级排版比例尺。

### 8 种比例尺

| 名称 | 比例 | 预览 (base=16px) | 适用 |
|:----|:----:|:--------------:|:-----|
| minor-second | 1.067 | 16→17→18→19→20… | 信息密集 (Dashboard) |
| major-second | 1.125 | 16→18→20→23→26… | 正文为主 |
| minor-third | 1.200 | 16→19→23→28→33… | 通用 (moderate) |
| major-third | 1.250 | 16→20→25→31→39… | 品牌展示 |
| perfect-fourth | 1.333 | 16→21→28→38→50… | 创意设计 |
| augmented-fourth | 1.414 | 16→23→32→45→64… | 戏剧性对比 |
| perfect-fifth | 1.500 | 16→24→36→54→81… | 极端展示 |
| golden-ratio | 1.618 | 16→26→42→68→110… | 奢华品牌 |

### 信息密度与比例尺映射

| 密度 | 比例尺 | base | 典型页面 |
|------|:------:|:----:|---------|
| sparse | major-third (1.250) | 18px | 品牌展示、摄影 |
| moderate | minor-third (1.200) | 16px | 通用页面 |
| dense | major-second (1.125) | 14px | Dashboard、数据 |

### 12 条字体配对规则

配对评分: excellent ≥ 0.8, good ≥ 0.6, fair ≥ 0.4, poor < 0.4

| # | 显示字体 | 正文字体 | 兼容性 | 原理 |
|:-:|:--------|:--------|:------:|:-----|
| 1 | serif (经典) | sans-serif (现代) | excellent | 经典+现代，对比协调 |
| 2 | display (个性) | sans-serif (中性) | excellent | 个性+实用，平衡感好 |
| 3 | sans-serif (展示) | sans-serif (正文) | good | 统一家族，安全选择 |
| 4 | serif (经典) | serif (正文) | good | 全衬线，古典统一 |
| 5 | display (粗犷) | sans-serif (简洁) | good | 粗犷+简洁，张力感 |
| 6 | monospace (技术) | sans-serif (现代) | good | 技术+现代，开发者风格 |
| 7 | serif (经典) | monospace (等宽) | fair | 反差过大，视情况使用 |
| 8 | display (装饰) | serif (传统) | fair | 装饰+传统，风格碰撞 |
| 9 | display (像素) | sans-serif (现代) | fair | 复古+现代，游戏风格 |
| 10 | serif (经典) | display (装饰) | poor | 显示+正文都是强风格 |
| 11 | display (装饰) | display (装饰) | poor | 过于花哨 |
| 12 | monospace (等宽) | monospace (等宽) | poor | 全是等宽，可读性差 |

### 方向→字体映射

见各方向字体配置。display 字体通常在 headings 使用，body 字体在正文、导航和卡片中使用。
`;
  return { filename: "02-字体规则.md", title: "字体规则", description: "字体分类、排版比例尺、12 条配对规则", tags: ["typography", "font", "scale", "pairing"], body };
}

function buildLayoutContent(): KnowledgeFile {
  const body = `# 布局模式

## 8px 网格系统

\`generateGrid(density)\` — 基于信息密度生成响应式网格。

### 3 种信息密度

| 密度 | 列数 | Gutter | Max-Width | 间距基值 | 适用场景 |
|:----|:----:|:------:|:---------:|:--------:|---------|
| sparse | 12 | 32px | 1200px | 8px | 品牌展示、摄影作品、高端页面 |
| moderate | 12 | 24px | 1100px | 8px | 通用页面、博客、企业站 |
| dense | 8 | 16px | 960px | 8px | Dashboard、数据表格、后台 |

### 间距节奏

\`generateRhythm(density)\` — 基于 8px 基准生成间距节奏。

节奏公式: stack = [base], inline = [base * 1, base * 2, base * 4, ...]

| 密度 | 节奏序列 |
|:----|:---------|
| sparse | 16, 32, 64, 96, 128, 192 |
| moderate | 8, 16, 32, 48, 64, 96 |
| dense | 8, 16, 24, 32, 48, 64 |

### 视觉重量计算

\`calcVisualWeight(colors, fontCategory, density)\` — 评估页面的视觉密集程度。

权重因子:
- 色彩权重: 深色 +3, 亮色 +1, 浅色 +0.5
- 字体权重: serif +2, display +2, sans-serif +1, monospace +1.5
- 密度倍数: sparse × 0.7, moderate × 1.0, dense × 1.5

分值范围: 0-10, 越高越"重", 需要更多留白平衡。

### 布局生成

\`generateLayoutSpec(direction, columnCount, displayScale, bodyScale)\` — 生成立即可用的布局规格。
`;
  return { filename: "03-布局模式.md", title: "布局模式", description: "8px 网格系统、信息密度、间距节奏、视觉重量", tags: ["layout", "grid", "density", "rhythm"], body };
}

function buildSpacingContent(): KnowledgeFile {
  const body = `# 间距系统

## 8px 基准

BWVI 使用 **8px 网格**作为间距基准。所有间距值都是 8 的倍数。

### 间距层级

| 层级 | 值 | 用途 |
|:----|:---|:-----|
| xxl | 8 × 24 = 192px | 大区块间隔、Hero 区域 |
| xl | 8 × 16 = 128px | 分节间隔、Section 间距 |
| l | 8 × 8 = 64px | 组件组间距、Section 内间隔 |
| m | 8 × 4 = 32px | 卡片间距、元素组间距 |
| s | 8 × 2 = 16px | 内边距、文本与元素间距 |
| xs | 8 × 1 = 8px | 紧凑内边距、标签间距 |

### 文本行高

| 字号层级 | 推荐行高 |
|:--------|:--------:|
| 48.8px (h1) | 1.1 |
| 39.1px (h2) | 1.2 |
| 31.3px (h3) | 1.3 |
| 25px (h4) | 1.4 |
| 20px (h5) | 1.5 |
| 16px (body) | 1.6 |
| 12.8px (small) | 1.6 |

### 段落间距

- 段落间距 = 正文行高 × 0.75
- 列表项间距 = 8px
- 标题到正文间距 = 标题字号 × 1.2
`;
  return { filename: "08-间距系统.md", title: "间距系统", description: "8px 基准、间距层级、文本行高、段落间距", tags: ["spacing", "rhythm", "grid"], body };
}

function buildDirectionAdvisorContent(): KnowledgeFile {
  let body = `# 方向顾问

## 10 个设计方向

BWVI 提供 10 个预设设计方向，每个方向包含完整的色板、字体配对、布局密度定义。

| 方向 | 学派 | 色板 | 字体 (显示+正文) | 适用 |
|:----|:----|:----|:----------------|:-----|
`;
  for (const [id, desc] of Object.entries(DIRECTION_DESCRIPTIONS)) {
    const pi = PALETTE_INFO[id];
    if (pi) {
      body += `| ${id} | ${desc} | ${pi.primary}+${pi.accent} | 见方向配置 | ${desc.split("。")[1]?.trim() || ""} |\n`;
    }
  }
  body += `
### 方向选择规则

1. 信息密度越高 → 越倾向于 tech-utility / corporate-trust / minimal-white
2. 品牌调性越温暖 → 越倾向于 warm-minimal / nature-organic / playful-color
3. 目标用户越年轻 → 越倾向于 playful-color / tech-gradient
4. 产品单价越高 → 越倾向于 dark-luxury / luxury-premium
5. 内容越文字驱动 → 越倾向于 editorial-monocle / minimal-white

### 方向关键词匹配

analyzer.ts 使用关键词匹配算法: 提取用户任务描述 → 与方向关键词库比对 → 推荐匹配度最高的 3 个方向。
`;
  return { filename: "00-方向顾问.md", title: "方向顾问", description: "10 个设计方向定义、选择规则、关键词匹配", tags: ["direction", "advisor", "recommendation"], body: body.trim() };
}

export async function ingestFromPrinciples(): Promise<IngestResult> {
  const files: KnowledgeFile[] = [
    buildDirectionAdvisorContent(),
    buildColorHarmonyContent(),
    buildTypographyContent(),
    buildLayoutContent(),
    buildSpacingContent(),
  ];

  const kd = knowledgeDir();
  let created = 0;
  let updated = 0;
  let tokenCount = 0;

  for (const f of files) {
    const fp = join(kd, f.filename);
    tokenCount += Math.ceil(f.body.length / 4);
    if (existsSync(fp)) {
      writeFileSync(fp, f.body, "utf-8");
      updated++;
    } else {
      writeFileSync(fp, f.body, "utf-8");
      created++;
    }
  }

  return {
    source: "principles",
    chunksCreated: created,
    chunksUpdated: updated,
    tokensExtracted: tokenCount,
    summary: `从源码抽取 ${files.length} 个知识文件: ${created} 新建, ${updated} 更新, ${tokenCount} tokens`,
  };
}
