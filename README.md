<div align="center">
  <h1>BWVI</h1>
  <p><strong>B</strong>etter <strong>W</strong>ay of <strong>V</strong>isual <strong>I</strong>ntelligence</p>
  <p><em>Agent-native design decision protocol — CLI · MCP Server · Multi-backend</em></p>
  <p>
    <a href="#-comparison">Compare</a> ·
    <a href="#-quick-start">Quick Start</a> ·
    <a href="#-architecture">Architecture</a> ·
    <a href="#-commands">Commands</a> ·
    <a href="#-multi-backend">Backends</a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/version-0.1.0-5E6AD2" alt="version">
    <img src="https://img.shields.io/badge/license-Apache%202.0-00D4AA" alt="license">
    <img src="https://img.shields.io/badge/benchmark-5%2F5-00E698" alt="benchmark">
    <img src="https://img.shields.io/badge/typescript-strict-3178C6" alt="typescript">
  </p>
  <br>
</div>

---

**BWVI** is not a design tool. It's the **decision layer** between AI agents and design execution. It doesn't draw pixels — it ensures every pixel drawn has a reason.

> CLI + MCP Server that gives AI agents a structured design decision framework.  
> Output → Open-Design, Huashu-Design, or built-in renderer.

---

<div align="center">
  <table>
    <tr>
      <td align="center"><b>🧠 Decision Chain</b><br>direction→palette→typography→layout→detail</td>
      <td align="center"><b>📐 10 Directions</b><br>from editorial to playful</td>
      <td align="center"><b>🏷️ 30 Brands</b><br>Linear · Stripe · Apple · Notion …</td>
    </tr>
    <tr>
      <td align="center"><b>📱 5 Device Frames</b><br>iPhone · Pixel · iPad · MacBook · Browser</td>
      <td align="center"><b>🔍 10-dim Critique</b><br>automated objective metrics</td>
      <td align="center"><b>🔌 4 Render Backends</b><br>direct · OD · Huashu · agent</td>
    </tr>
  </table>
</div>

---

## 🆚 Comparison

BWVI, [Open-Design](https://github.com/nexu-io/open-design) (21.8k ★), and [Huashu-Design](https://github.com/huashu-design) serve different roles in the AI-native design pipeline. Here's how they compare across 10 dimensions.

### One-Line Identity

| System | Identity |
|--------|----------|
| **BWVI** | Design **decision protocol** — the architect who decides *what* to build |
| **Open-Design** | Design **execution engine** — the factory that builds *anything* |
| **Huashu-Design** | Design **craft studio** — the artisan who perfects *one thing* |

### 10-Dimension Score

| Dimension | BWVI | Open-Design | Huashu-Design | Why |
|-----------|:----:|:-----------:|:-------------:|-----|
| **Output Quality** | ★★☆☆☆ | ★★★★★ | ★★★★☆ | BWVI delegates to backends; OD has 129 design systems; Huashu has anti-slop rigor |
| **Decision Framework** | ★★★★★ | ★★★☆☆ | ★★★★☆ | BWVI's structured chain + checkpoints + fingerprint is unique |
| **Brand Systems** | ★★★☆☆ | ★★★★★ | ★★★☆☆ | OD: 129 built-in brands. BWVI: 30. Huashu: protocol-based |
| **App Prototyping** | ★★★☆☆ | ★★★★★ | ★★★★★ | Huashu: iPhone bezel + state manager. OD: 5 device frames |
| **Critique System** | ★★★★★ | ★★★☆☆ | ★★★★☆ | BWVI: only automated 10-dim objective metrics |
| **Video/Animation** | ★☆☆☆☆ | ★★★★☆ | ★★★★★ | Huashu: Stage+Sprite engine + BGM+SFX pipeline |
| **Design Systems Lib** | ★★☆☆☆ | ★★★★★ | ★★★☆☆ | OD: 129 brands + 57 styles. BWVI: 30 brands |
| **Agent Integration** | ★★★★★ | ★★★★★ | ★★★★☆ | BWVI: native MCP. OD: 13 CLIs + BYOK. Huashu: SKILL.md |
| **Onboarding Speed** | ★★★★☆ | ★★★★☆ | ★★★☆☆ | BWVI: `npx bwvi`. OD: daemon + web UI. Huashu: 1100-line SKILL |
| **Extensibility** | ★★★★☆ | ★★★★★ | ★★★☆☆ | OD: droppable SKILL/DESIGN files. BWVI: plugin system |

### Scoring Rationale

<details>
<summary>Click to expand detailed reasoning</summary>

#### Output Quality — OD 5★, Huashu 4★, BWVI 2★

OD wins with 129 brand design systems, 64 skills, and sandboxed iframe preview. Huashu's strict anti-slop rules produce clean output but limited to single-file HTML. BWVI's built-in renderer is minimal — its strength is delegating to OD/Huashu backends.

#### Decision Framework — BWVI 5★

The only system with a structured decision chain (`direction→palette→typography→layout→detail`), cross-session checkpoint persistence, and a fingerprint tracker that prevents design echo chambers. OD has a turn-1 question form but decisions are session-bound. Huashu has the Junior Designer workflow but no structured data model.

#### Brand Systems — OD 5★

OD ships 129 complete `DESIGN.md` files with 9-section schemas covering brands from Apple to Xiaohongshu. BWVI has 30 brands embedded in code. Huashu has a rigorous 5-step asset protocol but no pre-built brand library.

#### App Prototyping — OD/Huashu 5★

Huashu's iPhone 15 Pro bezel with Dynamic Island + AppPhone state manager + Playwright click tests is unmatched. OD has 5 device frames and mobile-app skills. BWVI has device frames + state machine but less app-specific polish.

#### Critique System — BWVI 5★

The only system with **automated objective metrics**: color compliance, font compliance, asset authenticity, accent overuse, token efficiency, accessibility, semantic HTML, responsive, SEO, and HTML validity. OD and Huashu both rely on agent role-play (5-dim subjective scoring).

#### Video/Animation — Huashu 5★

Huashu's built-in Stage+Sprite animation engine + 25/60fps MP4 export + palette-optimized GIF + 37 SFX + 6 BGM dual-track audio pipeline is a complete in-house solution. OD has 16 video models but depends on external APIs. BWVI has no video capability (delegates to backends).

#### Design Systems — OD 5★

129 brands × 57 design styles is unmatched breadth. Each system has a consistent schema. BWVI's 30 brands cover the essentials. Huashu's 20 design philosophies are curated and named but fewer in number.

#### Agent Integration — BWVI/OD 5★

BWVI was built from scratch as an MCP Server with 5 native tools and JSON-only CLI output. OD detects 13 agent CLIs + BYOK proxy + SSE streaming. Huashu works with 6 CLIs but as a SKILL.md text file — execution fidelity depends on the agent.

#### Onboarding — BWVI/OD 4★

`npx bwvi` works instantly with zero configuration. OD requires daemon + Next.js but has a web UI. Huashu requires the agent to process 1100+ lines of instructions.

#### Extensibility — OD 5★

Droppable SKILL.md and DESIGN.md files make OD the most extensible. BWVI has a plugin scaffold and knowledge MD files. Huashu is a monolithic SKILL.md — extensions require editing the master file.
</details>

### When to Use What

| Scenario | Pick | Why |
|----------|------|-----|
| Quick landing page with brand polish | **Open-Design** | 129 brands + 64 skills + sandbox preview |
| iOS app hi-fi prototype | **Huashu-Design** | iPhone bezel + state manager + click tests |
| Multi-iteration brand project | **BWVI → OD** | BWVI decides direction, OD executes |
| Design review / quality gate | **BWVI** | Only automated 10-dim objective critique |
| Product animation / motion demo | **Huashu-Design** | Built-in animation engine + audio pipeline |
| Agent-native design toolchain | **BWVI + OD** | BWVI for decisions, OD for execution |

### The Decision Hub

```
┌──────────────────────────────────────────┐
│                  BWVI                    │
│     analyze → decision chain → checkpoint│
│     direction + palette + typography     │
└─────────────┬────────────────────────────┘
              │ decision JSON
     ┌────────┴────────┐
     ▼                  ▼
┌────────────┐   ┌──────────────┐
│Open-Design │   │Huashu-Design │
│129 brands  │   │iPhone frames │
│64 skills   │   │animation eng │
│sandbox     │   │video export  │
└────────────┘   └──────────────┘
```

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

---

## 📦 Install

```bash
# Run instantly
npx bwvi --help

# Or install globally
npm install -g bwvi
bwvi --help
```

---

## 🏛 Architecture

```
src/
├── types/              Pure interfaces, zero deps
│   ├── decision.ts     Decision chain types
│   ├── project.ts      Project / Checkpoint config
│   ├── critique.ts     Critique report types
│   └── fingerprint.ts  Design fingerprint types
│
├── engine/             Core engines
│   ├── analyzer.ts     Task analysis → 10 directions
│   ├── composer.ts     Prompt assembly
│   ├── agent.ts        Agent CLI detection (Claude/OpenCode/Codex...)
│   ├── learner.ts      External design learning
│   ├── brand-loader.ts 30 built-in brand systems
│   ├── imager.ts       Real image pipeline (Unsplash + cache)
│   ├── slop-guard.ts   Anti-AI-slop detection (8 checks)
│   ├── renderer.ts     Multi-backend render dispatcher
│   └── bridges/
│       ├── od-bridge.ts      Open-Design daemon client
│       └── huashu-bridge.ts  Huashu-Design agent invoker
│
├── frames/             Device bezels
│   ├── index.ts        iPhone 15 / Pixel / iPad / MacBook / Browser
│   └── state-machine.ts 2KB interactive state machine
│
├── checkpoint/         File-based persistence
│   └── manager.ts      save/load/list/rollback
│
├── critique/           Critique engine
│   ├── objective.ts    10-dim objective metrics
│   ├── self-review.ts  5-dim subjective scoring
│   └── diff.ts         Version comparison
│
├── fingerprint/        Design fingerprint
│   └── tracker.ts      Implicit preference learning
│
├── knowledge/          Knowledge loader
│   └── loader.ts       Dual-layer (MD files + source fallback)
│
├── templates/          Component library
│   └── components.ts   Navbar/Hero/StatsGrid/FeatureGrid/PriceCard...
│
├── mcp/                MCP Server
│   └── server.ts       stdio transport, 5 tools
│
├── report/             Project report generator
│
└── cli/                22 CLI commands
    ├── init / analyze / generate / critique / learn
    ├── showcase / checkpoint / feedback / knowledge
    ├── asset / brief / debt / history / brand
    ├── template / test / video / plugin / diff
    ├── benchmark / mcp
    └── → mcp routes to mcp/server.ts
```

---

## 🎯 Design Decision Protocol

The core abstraction is a **progressive constraint chain**:

```
direction → palette → typography → [information_density] → layout → detail_signature
```

Each decision is a `DesignDecision` entity persisted to `.bwvi/checkpoints/`, supporting cross-session recovery and rollback.

| Principle | Description |
|-----------|-------------|
| 🔍 Verify facts first, then design | WebSearch → product-facts.md before any pixel |
| 📋 Show assumptions before filling | Direction first, user confirms, then execute |
| 🖼 Assets are first-class citizens | Logo/product shots are not CSS afterthoughts |
| 🚫 Never fabricate | No Lorem ipsum, no fake stats |
| ✨ One detail at 120%, rest at 80% | One signature detail, restraint elsewhere |
| 🧱 Progressive constraints | Accumulate along the decision chain |
| 🔄 Decisions are auditable & rollbackable | All decisions as persisted JSON |
| 👁 No self-review without cross-validation | Built-in bias compensation |
| 📚 Knowledge has versions | Never always-latest |
| 🥩 Dogfood before shipping | Self-bootstrapping required |

---

## 📟 Commands

### Core

| Command | Function |
|---------|----------|
| `init` | Create `.bwvi/` project structure |
| `analyze` | Analyze task → direction recommendations + fingerprint |
| `generate` | Generate design (`--direct` HTML / `--run` agent / default prompt) |
| `critique` | Critique HTML → 10-dim objective + 5-dim subjective |
| `learn` | Learn design tokens from URL (`--inject` / `--template`) |

### Design Assistant

| Command | Function |
|---------|----------|
| `showcase` | 10 showcase directions with real HTML previews (`--pick`) |
| `checkpoint` | Decision management (list/show/restore/rollback) |
| `feedback` | Rate 1-10, auto-update fingerprint |
| `knowledge` | Knowledge block viewer (list/show/improve/check_version) |
| `asset` | Brand asset search (logo/color \<brand\>) |
| `brief` | Structured design brief |
| `debt` | Design debt tracker (list/add/resolve) |
| `history` | Quality trends + failure pattern aggregation |
| `brand` | Brand system (list/get/search/learn — 30 built-in) |
| `template` | Template management (list/use/delete) |

### Tools

| Command | Function |
|---------|----------|
| `test` | HTML validation (a11y/responsive/semantic/interactive) |
| `video` | HTML → MP4/GIF export (requires ffmpeg) |
| `plugin` | Plugin scaffold generator |
| `diff` | HTML version comparison |
| `benchmark` | 5-test suite |
| `mcp` | Start MCP Server (stdio transport) |

---

## 📱 Device Frames

`bwvi generate` supports 5 device bezels via `--device`:

| Device | Value | Orientation |
|--------|-------|-------------|
| iPhone 15 Pro | `iphone` | portrait / landscape |
| Pixel 9 | `pixel` | portrait / landscape |
| iPad Pro | `ipad` | portrait / landscape |
| MacBook Pro | `macbook` | landscape only |
| Browser window | `browser` | responsive |

```bash
bwvi generate "Coffee App" --device=iphone --orientation=portrait
bwvi generate "Dashboard" --device=browser
bwvi generate "Landing" --device=macbook
```

---

## 🎮 Interactive Prototypes

`--interactive` embeds a 2KB zero-dependency state machine:

| Feature | Usage |
|---------|-------|
| Modal | `data-bwvi-toggle="modal" data-bwvi-target="id"` |
| Tab switch | `data-bwvi-toggle="tab" data-bwvi-group="tabs"` |
| Accordion | `data-bwvi-toggle="accordion"` |
| Carousel | `data-bwvi-carousel="id"` |
| Dark mode | `data-bwvi-toggle="darkmode"` |
| Toast | `data-bwvi-toggle="toast"` |
| Form submit | `data-bwvi-form="message"` |

```bash
bwvi generate "App onboarding" --device=iphone --interactive
bwvi generate "Dashboard" --device=browser --interactive --dark
```

---

## 🧩 Component Variants

Each component has 3-4 variants:

| Component | Variants |
|-----------|----------|
| Hero | `fullscreen` / `centered` / `split` / `editorial` |
| Navbar | `default` / `transparent` / `centered` |
| FeatureGrid | `grid` / `list` / `compact` |
| StatsGrid | `grid` / `list` / `compact` |
| TestimonialGrid | `grid` / `compact` |
| Card | `flat` / `elevated` / `bordered` |
| Footer | `default` / `minimal` |

---

## 🏷️ Brand Systems

30 built-in brands with auto-loaded palettes + typography via `--brand`:

```bash
bwvi brand list                          # List all brands
bwvi brand search developer              # Search brands
bwvi brand get linear                    # View brand details
bwvi generate "SaaS" --brand=linear      # Generate with Linear brand
```

**Included**: Linear, Stripe, Vercel, Apple, Notion, Airbnb, Figma, Supabase, Cursor, Shopify, Spotify, Coinbase, Tesla, Nike, IBM, NVIDIA, Miro, Framer, PostHog, Cal, Sanity, Replicate, Raycast, Intercom, Zapier, Webflow, Sentry, Claude, Xiaohongshu, and more.

---

## 🔌 Multi-Backend Rendering

4 render backends via `--engine`:

| Backend | Flag | Quality | Prerequisite |
|---------|------|---------|-------------|
| BWVI built-in | `direct` | ★★★☆☆ | None |
| Open-Design | `od` | ★★★★★ | OD daemon (`pnpm tools-dev run web`) |
| Huashu-Design | `huashu` | ★★★★★ | Agent CLI (OpenCode/Claude) |
| Agent CLI | `agent` | ★★★★☆ | Agent CLI installed |

```bash
bwvi generate "SaaS landing" --engine=od --brand=linear --device=browser
bwvi generate "App prototype" --engine=huashu --device=iphone --interactive
bwvi generate "Quick mockup" --engine=direct --device=iphone
```

When BWVI delegates to OD or Huashu, output quality reaches the backend's level (★★★★★).

---

## 🔍 Critique System

### 10-dim Objective Metrics

| Metric | Description |
|--------|-------------|
| `color_compliance` | % of colors within brand palette |
| `font_compliance` | Uses `--font-display` / `--font-body` |
| `asset_authenticity` | Non-placeholder asset ratio |
| `accent_overuse` | Accent ≤ 2 per viewport |
| `token_efficiency` | HTML size / content ratio ≤ 3:1 |
| `accessibility` | alt / aria / role / label / tabindex |
| `semantic_html` | header / nav / main / section / article / footer |
| `responsive` | viewport / @media / clamp / grid |
| `seo_score` | title / description / lang / heading |
| `html_validity` | doctype / charset / tag pairing |

### 5-dim Subjective Scoring

Weighted by project type (landing / dashboard / deck / default):

| Dimension | Description |
|-----------|-------------|
| `philosophy` | Design philosophy consistency |
| `hierarchy` | Information hierarchy clarity |
| `detail` | Craft quality and polish |
| `function` | Functional completeness |
| `innovation` | Originality and creativity |

---

## 📚 Knowledge System

15 knowledge blocks, dual-layer loading (MD files preferred, source fallback):

```
00-direction-advisor.md   01-color-theory.md       02-typography.md
03-layout-patterns.md     04-motion-principles.md  05-content-rules.md
06-brand-protocol.md      07-component-specs.md    08-spacing-system.md
09-responsive.md          10-icon-specs.md         11-image-specs.md
12-form-specs.md          13-navigation.md         14-data-viz.md
```

---

## 🤖 MCP Server

Agent integration via MCP:

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

5 native MCP tools:

| Tool | Function |
|------|----------|
| `analyze_design` | Analyze task → direction + fingerprint |
| `generate_design` | Generate HTML by direction |
| `critique_design` | Critique HTML → score |
| `learn_design` | Learn design from URL |
| `list_directions` | List all available directions |

---

## 🔄 Cross-Session Workflow

```bash
# Session 1: User picks direction
bwvi showcase --pick landing-editorial
# → Saved to .bwvi/checkpoints/

# Session 2 (new terminal): Designer reads decision
bwvi checkpoint list
# → Direction locked, proceed to generate
```

---

## 📋 API Reference

```bash
bwvi analyze "SaaS landing page"
bwvi generate "SaaS landing" --direction=tech-utility
bwvi critique output.html --brand-colors #1E1E2E,#00E698
bwvi learn https://linear.app
bwvi showcase --pick dashboard-clean
bwvi checkpoint list
bwvi checkpoint restore dec_direction_123
bwvi feedback 8 "Great layout"
bwvi knowledge list
bwvi knowledge improve
bwvi asset color stripe
bwvi brief "coffee brand, audience:investors, tone:professional"
bwvi debt add "Logo needs official SVG replacement"
bwvi history
bwvi brand fetch linear
bwvi plugin my-plugin
bwvi test index.html --a11y --interactive
bwvi diff v1.html v2.html
bwvi video index.html --fps=60 --format=mp4
bwvi benchmark
```

---

## 🛠 Development

```bash
# Install
npm install

# Dev mode (TS direct)
npm run dev -- analyze "SaaS landing page"

# Type check
npm run typecheck

# Build
npm run build

# Production
npm start

# Benchmark
npm run benchmark
```

### Stack

- **Language**: TypeScript 5.7+ (strict mode)
- **Runtime**: Node.js 20+ (ES2022)
- **Bundler**: esbuild (CJS + ESM dual format)
- **MCP**: `@modelcontextprotocol/sdk` v1.29+ (stdio transport)
- **Config**: YAML

### Project Structure

```
bwvi/
├── src/                TypeScript source
├── dist/               Build output (CJS + ESM)
├── scripts/            Build scripts
├── knowledge/          15 knowledge blocks (MD)
├── demo/               Showcase previews (generated)
├── docs/               Design documentation
├── specs/              Architecture specs
├── brand-systems/      (reserved for future brand JSON files)
├── .bwvi/              Runtime (gitignored)
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

---

## ✅ Benchmark

```bash
bwvi benchmark
# → 5/5 passed (0.2s)
```

| Test | Description |
|------|-------------|
| TC01 | Brand landing → direction + HTML + critique ≥ 5.0 |
| TC02 | Cold start → output with no brand/reference |
| TC03 | Iteration → v2 score > v1 |
| TC04 | Recovery → checkpoint resume, complete decisions |
| TC05 | External learning → learnFromUrl succeeds |

---

## 📄 License

Apache-2.0
