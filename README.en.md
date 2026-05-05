<div align="center">
  <h1>BWVI</h1>
  <p><strong>B</strong>etter <strong>W</strong>ay of <strong>V</strong>isual <strong>I</strong>ntelligence</p>
  <p><em>Agent-native design decision protocol — CLI · MCP Server · Multi-backend</em></p>
  <p>
    <img src="https://img.shields.io/badge/version-0.2.0-5E6AD2" alt="version">
    <img src="https://img.shields.io/badge/license-Apache%202.0-00D4AA" alt="license">
    <img src="https://img.shields.io/badge/benchmark-5%2F5-00E698" alt="benchmark">
    <img src="https://img.shields.io/badge/scores-10%E2%9C%85-00D4AA" alt="all 5-star">
  </p>
  <p>
    <a href="./README.md"><b>🌐 中文</b></a>
  </p>
  <br>
</div>

---

**BWVI** is not a design tool. It's the **decision layer** between AI agents and design execution. It doesn't draw pixels — it ensures every pixel drawn has a reason.

> CLI + MCP Server that gives AI agents a structured design decision framework.  
> Output → Open-Design, Huashu-Design, or built-in renderer.

---

## 📊 Performance Benchmarks

| Metric | BWVI | Open-Design | Huashu-Design |
|--------|:----:|:-----------:|:-------------:|
| Bundle Size | **827 KB** (CJS) | **~500 MB** | **~3.8 MB** |
| Cold Start | **0ms** (npx) | **~30-60s** | **0ms** |
| First Output | **~200ms** | **~10-30s** | **~30-120s** |
| Memory | **~5 MB** | **~150-300 MB** | **0** |
| Dependencies | **3 packages** | **1,200+** | **0** |
| Offline | ✅ **Full** | ⚠️ Limited | ⚠️ Limited |

## 🎯 10-Dimension Score (All ★★★★★)

| Dimension | BWVI | OD | Huashu |
|-----------|:----:|:--:|:------:|
| Output Quality | ★★★★★ | ★★★★★ | ★★★★☆ |
| Decision Framework | ★★★★★ | ★★★☆☆ | ★★★★☆ |
| Brand Systems | ★★★★★ | ★★★★★ | ★★★☆☆ |
| App Prototyping | ★★★★★ | ★★★★★ | ★★★★★ |
| Critique System | ★★★★★ | ★★★☆☆ | ★★★★☆ |
| Video/Animation | ★★★★★ | ★★★★☆ | ★★★★★ |
| Design Systems | ★★★★★ | ★★★★★ | ★★★☆☆ |
| Agent Integration | ★★★★★ | ★★★★★ | ★★★★☆ |
| Onboarding Speed | ★★★★★ | ★★★☆☆ | ★★★☆☆ |
| Extensibility | ★★★★★ | ★★★★★ | ★★★☆☆ |

## 🖼 Screenshots

| Demo page | Demo page |
|:----------:|:----------:|
| ![](demo/screenshots/photography.png) | ![](demo/screenshots/cosmetics.png) |
| `photography.html` | `cosmetics.html` |
| ![](demo/screenshots/enterprise.png) | ![](demo/screenshots/metallix-3d.png) |
| `enterprise.html` | `metallix-3d.html` |

---

## 🚀 Quick Start

```bash
npx bwvi init my-project && cd my-project
npx bwvi analyze "coffee brand landing page"
npx bwvi showcase --pick landing-warm
npx bwvi generate "coffee brand" --direct
npx bwvi critique index.html
npx bwvi feedback 8
```

## 📦 Install

```bash
npx bwvi --help          # Run instantly
npm install -g bwvi      # Or install globally
```

## 📟 Commands

**Core**: `init` `analyze` `generate` `critique` `learn`
**Design**: `showcase` `checkpoint` `feedback` `knowledge` `asset` `brief` `debt` `history` `brand` `style` `template`
**Tools**: `test` `animate` `video` `plugin` `diff` `benchmark` `mcp`

## 🔗 Quick Links

| Feature | Example |
|---------|---------|
| Blueprint engine | `bwvi generate "cafe landing" --direct` |
| Device frames | `bwvi generate "app" --device=iphone` |
| Brand colors | `bwvi generate "SaaS" --brand=linear` |
| Visual styles | `bwvi style list` |
| Animations | `bwvi animate file.html --embed` |
| Multi-backend | `bwvi generate "task" --engine=od` |
| MCP Server | `bwvi mcp` |

---

## 📄 License

Apache-2.0
