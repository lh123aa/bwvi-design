<div align="center">
  <h1>BWVI</h1>
  <p><strong>B</strong>etter <strong>W</strong>ay of <strong>V</strong>isual <strong>I</strong>ntelligence</p>
  <p><em>Agent-native design decision protocol — CLI · MCP Server · Multi-backend</em></p>
  <p>
    <img src="https://img.shields.io/badge/version-0.2.0-5E6AD2" alt="version">
    <img src="https://img.shields.io/badge/license-Apache%202.0-00D4AA" alt="license">
    <img src="https://img.shields.io/badge/tests-80%20passed-00E698" alt="tests">
    <img src="https://img.shields.io/badge/benchmark-13%2F13-00D4AA" alt="benchmark">
    <img src="https://img.shields.io/badge/scores-10%E2%9C%85-FF6B9D" alt="all 5-star">
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
| Bundle Size | **873 KB** (CJS) | **~500 MB** | **~3.8 MB** |
| Cold Start | **0ms** (npx) | **~30-60s** | **0ms** |
| First Output | **~200ms** | **~10-30s** | **~30-120s** |
| Memory | **~5 MB** | **~150-300 MB** | **0** |
| Dependencies | **3 packages** | **1,200+** | **0** |
| Source Files | **~50 TS files** | **740+ app files** | **154 files** |
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

---

## 🚀 Quick Start

```bash
npx bwvi init my-project && cd my-project
npx bwvi analyze "coffee brand landing page"     # Analyze → direction recs
npx bwvi showcase --pick landing-warm            # Pick direction
npx bwvi generate "coffee brand" --direct        # Generate HTML
npx bwvi critique index.html                     # Critique
npx bwvi feedback 8                              # Rate
```

## 📦 Install

```bash
npx bwvi --help          # Run instantly (no install)
npm install -g bwvi      # Or install globally
```

## 📟 Commands

**Core**: `init` `analyze` `generate` `critique` `learn`  
**Design**: `showcase` `checkpoint` `feedback` `knowledge` `asset` `brief` `debt` `history` `brand` `style` `template`  
**Tools**: `test` `animate` `export` `preview` `image` `serve` `plugin` `diff` `benchmark` `mcp`

## 🔗 Features

| Feature | Example |
|---------|---------|
| Blueprint engine | `bwvi generate "cafe landing" --direct` |
| Device frames | `bwvi generate "app" --device=iphone` |
| Brand colors | `bwvi generate "SaaS" --brand=linear` |
| Visual styles | `bwvi style list` (56 styles) |
| Animations | `bwvi animate file.html --embed` |
| Video recording | `bwvi animate file.html --record --fps=60` |
| GIF export | `bwvi animate file.html --record --format=gif` |
| Interactive recording | `bwvi animate file.html --record --interactive` |
| Multi-backend | `bwvi generate "task" --engine=od` |
| MCP Server | `bwvi mcp` |
| Interactive prototype | `bwvi generate "app" --device=iphone --interactive` |
| Design critique | `bwvi critique output.html` |
| AI image generation | `bwvi image "product photo" --provider=openai` |
| Preview server | `bwvi serve --port=3000` |

## 🎯 Design Decision Protocol

```
direction → palette → typography → [information_density] → layout → detail_signature
```

Every decision is persisted as JSON to `.bwvi/checkpoints/`, supporting cross-session recovery and rollback.

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

5 native tools: `analyze_design` `generate_design` `critique_design` `learn_design` `list_directions`

## 📦 Project Stats

| Metric | Value |
|--------|-------|
| Version | 0.2.0 |
| Bundle | 873 KB (CJS single file) |
| Dependencies | 3 packages |
| Source files | ~50 TypeScript |
| CLI commands | 25 |
| Built-in brands | 115 (12 categories) |
| Visual styles | 56 |
| Industry blueprints | 50+ |
| Device frames | 5 |
| Animation types | 12 |
| Knowledge blocks | 15 |
| Benchmark suite | 13/13 passing |
| Unit tests | 80 passing |
| License | Apache-2.0 |

---

## 🖼 Screenshots

| Demo page | Demo page |
|:----------:|:----------:|
| ![](demo/screenshots/photography.png) | ![](demo/screenshots/cosmetics.png) |
| `photography.html` | `cosmetics.html` |
| ![](demo/screenshots/enterprise.png) | ![](demo/screenshots/metallix-3d.png) |
| `enterprise.html` | `metallix-3d.html` |

---

## 📄 License

Apache-2.0
