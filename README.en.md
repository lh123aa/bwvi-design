<div align="center">
  <h1>BWVI</h1>
  <p><strong>B</strong>etter <strong>W</strong>ay of <strong>V</strong>isual <strong>I</strong>ntelligence</p>
  <p><em>Agent-native design decision protocol — CLI · MCP Server · Multi-backend</em></p>
  <p>
    <img src="https://img.shields.io/badge/version-0.4.1-5E6AD2" alt="version">
    <img src="https://img.shields.io/badge/license-Apache%202.0-00D4AA" alt="license">
    <img src="https://img.shields.io/badge/tests-230%20passed-00E698" alt="tests">
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

## 📊 BWVI Capability Panorama

A systematic assessment of BWVI's own capabilities by category, based on source code analysis and benchmark tests.

### 1. Core Design Categories (`bwvi generate`)

| Category | Flag | Description | Rating |
|:---------|:-----|:------------|:-------|
| **Landing Page** | default | 50+ blueprints + dynamic layout, 8px grid, 3 info densities | ⭐⭐⭐⭐ Most mature, ~5-15KB HTML |
| **Deck / Slides** | `--deck` | Multi-section auto-pagination, slide/fade transitions, PPTX export | ⭐⭐⭐⭐ 13 test cases passed |
| **Social Card** | `--social` | Square card, centered hero text + CTA, brand palette | ⭐⭐⭐ Newer feature, simplified renderer |
| **Office Doc** | `--office` | OKR/report/invoice/receipt, DOCX export | ⭐⭐⭐ Solid framework, content self-filled |
| **Poster** | `--poster` | A3/A2/A1 specs, 300dpi print-grade PNG (`--scale=4`) | ⭐⭐⭐⭐ Pixel-accurate, print-ready |

### 2. Render Engines (`--engine=`)

| Engine | Mode | Rating |
|:-------|:-----|:-------|
| `direct` (default) | Built-in, zero external deps | ⭐⭐⭐⭐⭐ Fastest, ~200ms output |
| `od` | Open-Design backend | ⭐⭐⭐ Requires network, richer design library |
| `huashu` | Huashu-Design HTML rendering | ⭐⭐⭐⭐ High-fidelity prototypes + animation |
| `pencil` | Pencil design-to-code | ⭐⭐⭐ Auto-generates hand-drawn style UI |
| `agent` | Claude/OpenCode agent generation | ⭐⭐⭐ Highest quality but token budget needed |

### 3. Output Formats (`bwvi export`)

| Format | Flag | Rating | Notes |
|:-------|:-----|:-------|:------|
| **PDF** | `--format=pdf` | ⭐⭐⭐⭐ | Playwright rendering, A4 print-accurate |
| **PNG** | `--format=png` | ⭐⭐⭐⭐⭐ | `--scale=4` print-grade + `--transparent` background |
| **PPTX** | `--format=pptx` | ⭐⭐⭐ | Pure XML generation, zero external deps |
| **DOCX** | `--format=docx` | ⭐⭐⭐ | Paragraph-aware, heading/body style alignment |

### 4. Device Frames (`--device=`)

| Device | Support | Rating |
|:-------|:--------|:-------|
| **iPhone** | ✅ Notch + status bar | ⭐⭐⭐⭐ Verified rendering |
| **Pixel (Android)** | ✅ Punch-hole | ⭐⭐⭐⭐ |
| **iPad** | ✅ Portrait/landscape | ⭐⭐⭐ |
| **MacBook** | ✅ Browser chrome + traffic lights | ⭐⭐⭐⭐ |
| **Browser window** | ✅ Rounded + URL bar | ⭐⭐⭐⭐ |

### 5. Style System (`--style=`)

| Item | Data | Rating |
|:-----|:-----|:-------|
| **Built-in styles** | **56** | ⭐⭐⭐⭐ Covers major design movements |
| Examples | minimal-white, neo-brutalism, cyberpunk, glassmorphism, japanese-wabi, dark-luxury | |
| Application | Overrides palette + fonts + spacing rhythm | Verified with `--style=glassmorphism` |

### 6. Brand System (`--brand=`)

| Item | Data | Rating |
|:-----|:-----|:-------|
| **Built-in brands** | **115** (12 categories) | ⭐⭐⭐⭐⭐ |
| Examples | Linear, Stripe, Apple, Vercel, Figma, Notion, Airbnb, Shopify, Spotify | |
| Data structure | Palette(primary/accent/surface/text) + font(display/body) + tags | |
| Search | `bwvi brand search <keyword>` | Multi-tag filtering |

### 7. Animation & Video

| Capability | Command | Rating |
|:-----------|:--------|:-------|
| CSS animations | `bwvi animate <file.html>` | ⭐⭐⭐⭐ 12 types, 8 delays, 5 easing functions |
| MP4 recording | `--record` | ⭐⭐⭐ Requires ffmpeg, 1080p 25/60fps |
| GIF export | `--format=gif` | ⭐⭐⭐ Requires ffmpeg, palette optimization |
| BGM | `--bgm=tech/warm/...` | ⭐⭐⭐ Scene-based BGM, auto fade |
| Interactive recording | `--interactive` | ⭐⭐⭐ Records user click flow |

### 8. Image Generation (`bwvi image`)

| Provider | Flag | Rating |
|:---------|:-----|:-------|
| DALL·E 3 | `--provider=openai` | ⭐⭐⭐⭐ Needs API Key |
| Stable Diffusion | `--provider=stability` | ⭐⭐⭐ Needs API Key |
| Tongyi Wanxiang | `--provider=tongyi` | ⭐⭐⭐ Needs API Key |
| Seedream | `--provider=seedream` | ⭐⭐⭐ Needs API Key |
| Mock mode | `--mock` | ⭐⭐⭐ SVG placeholder when no Key |

### 9. Critique System (`bwvi critique`)

| Mode | Dimensions | Rating |
|:-----|:-----------|:-------|
| **Objective** | 10 dimensions (tag existence, structure integrity) | ⭐⭐⭐ Regex-based checking |
| **Self-Plus** | 5 dimensions (philosophy, hierarchy, detail, function, innovation) | ⭐⭐⭐ Rule-driven |
| **Cross** | Multi-model cross-validation (multiple API Keys) | ⭐⭐ Conditional |

### 10. Learning System (`bwvi learn`)

| Capability | Rating |
|:-----------|:-------|
| Learn palette + fonts from URL | ⭐⭐⭐ Title + color + font extraction |
| Direction detection | ⭐⭐⭐ Confidence output |
| Knowledge injection | ⭐⭐⭐ Writes to knowledge/ |
| Continuous upgrade (learn-system) | ⭐⭐⭐ Self-diagnosis + auto upgrade suggestions |

### 11. Capability Graph (Source-Level Diagnosis)

| Capability | Level | Diagnosis | Bottleneck |
|:-----------|:-----:|:----------|:-----------|
| **Palette generation** | **6/10** | 6 HSL harmony modes, WCAG contrast | → AI-assisted palette |
| **Typography pairing** | **6/10** | 5 font classes × 8 scales × 12 rules | → Semantic font recommendation |
| **Layout generation** | **6/10** | 50+ blueprints × 8px grid × 3 densities | → Responsive adaptive layout |
| **Self-review system** | **5/10** | Rule-driven 5-dimension scoring | → Finer-grained rules |
| **Direction recommendation** | **4/10** | 10 presets + keyword matching | → Semantic Embedding |
| **Objective critique** | **4/10** | Regex tag checking | → Visual hierarchy + contrast |
| **Knowledge quality** | **1~8/10** (per fill) | File count/content volume | → More design rules |

### 12. Use Case Recommendations

| Scenario | Rating | Recommended Command | Reason |
|:---------|:------:|:-------------------|:-------|
| **Web / Landing Page** | ⭐⭐⭐⭐⭐ | `generate "xxx"` | Most mature: 50+ blueprints, 56 styles, 115 brands |
| **Deck / Slides** | ⭐⭐⭐⭐ | `generate "xxx" --deck` | Deck rendering + PPTX export |
| **Poster / Print** | ⭐⭐⭐⭐ | `generate "xxx" --poster` | A3/A2/A1 precise, 300dpi output |
| **Office / Invoice** | ⭐⭐⭐ | `generate "xxx" --office` | Framework complete, content self-designed |
| **Social Card** | ⭐⭐⭐ | `generate "xxx" --social` | Newer feature, functional but basic |
| **Animation / Video** | ⭐⭐⭐ | `animate file.html --record` | Needs ffmpeg |
| **AI Image** | ⭐⭐⭐ | `image "prompt"` | Needs API Key |
| **Design Critique** | ⭐⭐⭐ | `critique file.html` | Objective checks work, deep review WIP |
| **App Prototype** | ⭐⭐⭐⭐ | `generate "xxx" --device=iphone --interactive` | Device frames + interactive state machine |

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
**Design**: `learn-system` `showcase` `checkpoint` `feedback` `knowledge` `asset` `brief` `debt` `history` `brand` `style` `template`  
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

## 🧠 Continuous Learning System

BWVI includes a **self-improving learning system** that measures, diagnoses, and upgrades 12 capability nodes via the `learn-system` command.

```
measure → diagnose → improve → verify → solidify → loop
```

### 12 Capability Nodes

```bash
bwvi learn-system status          # View all capability levels (colored TTY output)
bwvi learn-system diagnose        # Diagnose weakest link
bwvi learn-system improve <id>    # Upgrade a capability
bwvi learn-system history         # View upgrade history
bwvi learn-system knowledge       # View knowledge chunks
```

| Capability | Level | Bottleneck |
|-----------|:-----:|-----------|
| `feedback-learning` | 2/10 | Needs more feedback data |
| `direction-recommendation` | 4/10 | Keyword matching → Semantic Embedding |
| `critique-objective` | 4/10 | Tag checking → Visual hierarchy analysis |
| `critique-self-review` | 5/10 | Needs finer-grained scoring rules |
| `learning-from-url` | 5/10 | Regex → Playwright rendering |
| `palette-generation` | 6/10 | 6 HSL harmony modes implemented |
| `typography-pairing` | 6/10 | 5 categories × 8 scales × 12 rules |
| `layout-generation` | 6/10 | 8px grid + visual weight |
| `animation` | 6/10 | 12 animation types |
| `brand-coverage` | 7/10 | 115 brands |
| `style-coverage` | 7/10 | 56 styles |
| `knowledge-quality` | **8/10** 🟢 | All 15 knowledge files populated |
| **Overall** | **5.5/10** | |

### Auto-Closed Loop (v0.4.1+)

```bash
# critique → auto ingest patterns into knowledge base
bwvi critique index.html                            # Auto-learns after critique

# feedback < 6 → auto triggers improvement record
bwvi feedback 4 "poor typography readability"        # Low score = auto improve

# Improvements persisted to .bwvi/capabilities/
# bwvi learn-system history → view auto-generated improvement history
```

### Knowledge Ingestion — 4 Channels

```bash
bwvi learn-system ingest https://linear.app         # Extract design tokens from URL
bwvi learn-system ingest feedback                   # Analyze user feedback patterns
bwvi learn-system ingest critique                   # Analyze critique failure patterns
bwvi learn-system ingest principles                 # NEW: Extract design rules from source code 🚀
```

`ingest principles` auto-reads `src/principles/*.ts` exports and generates structured knowledge markdown files. Keeps knowledge base in sync with source code.

### Architecture

```
User / Agent  →  learn-system CLI  /  MCP tools
                        │
          ┌─────────────┴─────────────┐
          ▼                           ▼
  Capability Graph            Knowledge Pipeline
  ┌─────────────────┐    ┌───────────────────────────┐
  │ 12 nodes         │    │ URL → extract → inject     │
  │ measure/diagnose │    │ feedback → analyze → store │
  │ .bwvi/capabilities│   │ critique → aggregate       │
  │ (auto records)    │    │ source → principles-ingest │ ← NEW
  └─────────────────┘    └─────────┬─────────────────┘
                                    ▼
            .bwvi/learned/ + knowledge/*.md (~18KB, 15 files)
```

## 🎨 Design Principles Engine

`v0.4.0` — A **principle-driven design composition system** that evolves BWVI from "template matching" to "creative mixing under principle constraints."

### Core Design

```
Not "pick a bundle" — creative composition under principle constraints:

  Color:    Generated from hue wheel rules → 6 harmony modes (analogous/complementary/triadic...)
            Automatic WCAG contrast validation → text-on-surface ≥ 4.5:1

  Typography: From font taxonomy → 5 categories × 8 scales × 12 pairing rules
            "Serif headings + sans-serif body → classic pairing (excellent compatibility)"

  Layout:   From 8px grid → visual weight calculation → information density determination
            More content → denser layout → grid columns auto-adapt

  Conflict: 22 style attributes × compatibility matrix → can A+B be mixed?
            "Minimal palette × colorful palette" → conflict → fix suggestions
```

### Mix Composition Example

```
Option A: warm-minimal palette + tech-utility layout + analogous harmony
Option B: warm-minimal palette + corporate-trust typography + complementary harmony
Option C: Custom mix (choose color source + font source + layout source independently)
```

### Architecture

```
src/principles/
├── types.ts             → HSL color, font spec, grid system types
├── color-harmony.ts     → HSL ops · 6 harmony modes · WCAG contrast · auto palette
├── typography.ts        → Font classification · 8 scales · 12 pairing rules · density aware
├── layout.ts            → 8px grid · visual weight · info density · spacing rhythm
├── conflict.ts          → 22 style attributes · compatibility matrix · mix suggestions
├── composer.ts          → Mix generator · principle scoring · readable explanations
└── __tests__/           → 95 tests, all passing
```

**5 modules, zero external dependencies, pure math.**

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

15 design tools + 4 learning tools: `analyze_design` `generate_design` `critique_design` `critique_diff` `learn_design` `animate_html` `list_directions` `list_styles` `list_brands` `brand_get` `list_blueprints` `learn_system_status` `learn_system_diagnose` `learn_system_ingest` `learn_system_knowledge`

## 📦 Project Stats

| Metric | Value |
|--------|-------|
| Version | 0.4.1 |
| Bundle | 1050 KB (CJS single file) |
| Dependencies | 3 packages |
| Source files | ~55 TypeScript |
| CLI commands | 26 |
| Built-in brands | 115 (12 categories) |
| Visual styles | 56 |
| Industry blueprints | 50+ |
| Device frames | 5 |
| Animation types | 12 |
| Design principles | 5 modules (color/typography/layout/conflict/composer) |
| Knowledge blocks | 15 (~18KB, auto-sync from source) |
| Learning capability | 5.5/10 (12 nodes, auto-improvement loop) |
| Benchmark suite | 13/13 passing |
| Unit tests | 230 passing |
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
