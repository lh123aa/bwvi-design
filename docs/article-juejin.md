# 用 BWVI 给 AI Agent 装上设计决策大脑

## 痛点

让 AI 画图很容易，让 AI 做**正确的设计决策**很难。

每次给 Claude/OpenCode 写设计需求，出来的东西总差一口气：
- 配色还行但字体不对
- 排版不错但缺了品牌感
- 改了一版又一版，每一版决策都没记录下来

**问题不在 AI 的执行能力，在决策框架。**

## BWVI：不是设计工具，是决策协议

BWVI（Better Way of Visual Intelligence）是一个 CLI + MCP Server。

它不画像素。它确保每个像素都有理由。

```
分析 → 决策链 → Checkpoint → 分发执行
方向 + 色板 + 字体 + 布局 + 细节
```

## 30 秒上手

```bash
npx bwvi analyze "咖啡品牌 landing page"
npx bwvi showcase --pick landing-warm
npx bwvi generate "咖啡品牌" --direct
```

三条命令，从分析到产出，200ms。

## 核心能力

### 50+ 行业蓝图
咖啡、美妆、SaaS、餐厅、健身、时尚、教育、房产、金融、电商…覆盖主流行业。每个蓝图有手写真实文案。

```bash
bwvi generate "宠物店 landing page" --direct --device=iphone
```

### 115 个品牌系统
Linear、Stripe、Apple、Notion…一键应用品牌色板和字体。

```bash
bwvi generate "SaaS landing" --brand=linear
```

### 56 种视觉风格
从粗野主义到玻璃拟态，从赛博朋克到粉彩梦境。

```bash
bwvi generate "SaaS landing" --style=neo-brutalism
```

### 5 种设备边框
iPhone 15 Pro、Pixel 9、iPad Pro、MacBook Pro、浏览器。

```bash
bwvi generate "app onboarding" --device=iphone --interactive
```

### 动画引擎
12 种动画类型，7 种缓动曲线，scroll-trigger，MP4 导出。

```bash
bwvi animate output.html --embed
```

### 评审体系
10 维客观指标（色彩合规、字体合规、可访问性…）+ 5 维主观评分。

```bash
bwvi critique index.html
```

## 与 Open-Design / Huashu-Design 对比

| 维度 | BWVI | Open-Design | Huashu-Design |
|------|:----:|:-----------:|:-------------:|
| 决策框架 | ★★★★★ | ★★★ | ★★★★ |
| 品牌系统 | ★★★★★ | ★★★★★ | ★★★ |
| App 原型 | ★★★★★ | ★★★★★ | ★★★★★ |
| 评审体系 | ★★★★★ | ★★★ | ★★★★ |
| 上手速度 | ★★★★★ | ★★★ | ★★★ |
| Bundle 大小 | **827 KB** | ~500 MB | ~3.8 MB |

## 适合谁用

- **AI Agent 开发者** — 给 Claude/OpenCode 装上设计决策能力
- **独立开发者** — 快速出 Landing Page / App 原型
- **设计团队** — 用结构化决策链管理设计迭代
- **创业者** — 零成本出品牌官网

## 快速开始

```bash
# 零安装直接运行
npx bwvi --help

# 或全局安装
npm install -g bwvi
```

项目地址：https://github.com/lh123aa/bwvi-design

---

*BWVI — Better Way of Visual Intelligence. 让 AI Agent 拥有结构化的设计决策能力。*
