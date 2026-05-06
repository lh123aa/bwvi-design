# BWVI 迭代计划 v2

> 创建日期: 2026-05-06
> 当前版本: v0.2.1
> 测试: 80 ✅ | Benchmark: 13/13 ✅

---

## Phase 1 — 修复文档与数据不一致

| # | 任务 | 文件 | 状态 |
|:-:|------|------|:----:|
| 1 | 蓝图扩充 38→50+ | `src/templates/content-presets.ts` | ⏳ |
| 2 | 风格数修正 57→56 | `src/index.ts` | ⏳ |
| 3 | MCP tools 数量修正 (5→8) | `README.md` | ⏳ |
| 4 | CHANGELOG 补充 v0.2.1 | `CHANGELOG.md` | ⏳ |

## Phase 2 — 蓝图引擎完整

| # | 任务 | 文件 | 状态 |
|:-:|------|------|:----:|
| 5 | 新增 12 个行业蓝图 | `src/templates/content-presets.ts` | ⏳ |
| 6 | 自动方向匹配（analyze→generate） | `src/cli/generate.ts` | ⏳ |
| 7 | 蓝图增加复杂 section | `src/templates/content-presets.ts` | ⏳ |

## Phase 3 — 视频录制生产化

| # | 任务 | 文件 | 状态 |
|:-:|------|------|:----:|
| 8 | ffmpeg 安装引导优化 | `src/cli/animate.ts` | ⏳ |
| 9 | BGM 资产下载 | `assets/bgm/` | ⏳ |
| 10 | 交互录制稳健性修复 | `src/engine/interaction-capture.ts` | ⏳ |
| 11 | GIF 导出端到端验证 | `src/engine/video-composer.ts` | ⏳ |

## Phase 4 — MCP + 国际化

| # | 任务 | 文件 | 状态 |
|:-:|------|------|:----:|
| 12 | MCP 增加新 tools | `src/mcp/server.ts` | ⏳ |
| 13 | MCP SSE Transport | `src/mcp/server.ts` | ⏳ |
| 14 | i18n 全覆盖 | `src/cli/i18n.ts` + 各 CLI | ⏳ |
| 15 | 英文 UI 统一 | 各 CLI 命令 | ⏳ |

## Phase 5 — 基础设施

| # | 任务 | 文件 | 状态 |
|:-:|------|------|:----:|
| 16 | Docker 镜像 | `Dockerfile` | ⏳ |
| 17 | Playwright E2E 测试 | `src/engine/__tests__/` | ⏳ |
| 18 | 文档清理 | `docs/` | ⏳ |
| 19 | npm prepublish 完善 | `package.json` | ⏳ |
