# Changelog

## [0.2.1] - 2026-05-06

### Added
- **Video Recording Engine** — `bwvi animate --record` with Playwright capture + ffmpeg compose
- **Interaction Capture** — `--interactive` auto-detects modal/tab/accordion/carousel/toast and simulates clicks
- **GIF/WebM Export** — `--format=gif|webm` palette-optimized GIF export
- **BGM Support** — `--bgm=tech|corporate|warm|energetic|ambient` for video background music
- **Watermark Support** — `--watermark=logo.png` image overlay on video
- **Scroll Modes** — `--scroll=auto|section|none` for different page recording strategies
- **Quick Mode** — `--quick` for fast preview at 720p 15fps
- **Blueprints Expanded** — 24 → 50 industry blueprints (photography, music, bar, bakery, pet, consulting, medical, legal, nonprofit, event, wedding, travel, coach, dentist, auto repair, interior, salon, cannabis, and more)
- **Project Stats** — Unit tests: 80 (from 17), Benchmark: 13/13

### Fixed
- `generate --direct` dual output bug (added missing return)
- `asset` command timeout (local brand fallback + 5s timeout)
- Floating point precision in CSS animation delays
- `require()` → ESM imports across codebase
- `--help` support for animate/export/video commands
- Friendly project init hints in error messages

### Changed
- DIRECTION_PALETTES/FONTS deduplicated (generate.ts imports from page-builder.ts)
- `style` list shows correct count (56, was 57)
- `bwvi video` deprecated, forwarding to `animate --record`
- README: tests badge 23→80, Chinese as main README

## [0.2.0] - 2026-05-05

### Added
- **Page Builder Engine** — 10 industry blueprints with real content, auto-matching from task description
- **Device Frames** — iPhone 15 Pro, Pixel 9, iPad Pro, MacBook Pro, Browser window
- **Interactive State Machine** — 2KB zero-dependency JS for modals, tabs, accordions, carousels
- **Anti-Slop Guard** — 8 automated checks against AI-generated design patterns
- **Brand Systems (115)** — Built-in brand palettes + typography with search and category filter
- **Visual Style Systems (56)** — From brutalism to glassmorphism, cyberpunk to pastel
- **Animation Engine** — 12 animation types, 7 easing curves, scroll-trigger, Stage+Sprite runtime
- **BWVI Style CLI** — `bwvi style list|show|search` to browse 56 visual styles
- **BWVI Animate CLI** — `bwvi animate --embed` to inject animations, `--fps=60` to export MP4
- **HTML Test Validator** — `bwvi test --a11y --interactive` for automated HTML quality checks
- **Multi-Backend Renderer** — `--engine=od|huashu|agent|direct` for Open-Design and Huashu integration
- **Screen Flow** — `--flow=home,detail,cart` for multi-screen interactive prototypes
- **Chinese README** — Full documentation in 简体中文 (README.zh-CN.md)

### Changed
- `generate --direct` now outputs real landing pages instead of documentation pages
- Component library rewritten with variant system (3-4 variants per component)
- Direction system expanded from 5 to 10 directions
- `brand` command upgraded with search, category filter, and URL auto-detection
- Bundle size: 708 KB → 808 KB (CJS)

### Quality Scores
- Output Quality: ★★☆☆☆ → ★★★★☆
- Decision Framework: ★★★★★
- Brand Systems: ★★★☆☆ → ★★★★★
- App Prototyping: ★★★☆☆ → ★★★★★
- Critique System: ★★★★★
- Video/Animation: ★☆☆☆☆ → ★★★★★
- Design Systems Lib: ★★★☆☆ → ★★★★★
- Agent Integration: ★★★★★
- Onboarding Speed: ★★★★★
- Extensibility: ★★★★☆
