# BWVI 迭代计划

## P0 — Bug 修复（影响使用）

| # | 问题 | 文件 | 修复方案 | 预估 |
|:-:|------|------|----------|:----:|
| 01 | `demoDir()` 依赖 `process.cwd()`，文件生成到终端路径而非项目目录 | `src/cli/generate.ts:223` | 改为 `join(projectDir || cwd, "demo")`，优先检测 `.bwvi` 项目目录 | 15min |
| 02 | `generateDirectHtml` 是死代码（page-builder 已替代但该函数仍保留） | `src/cli/generate.ts:136-217` | 删除函数，所有调用改为 page-builder | 10min |
| 03 | `animation-engine.ts` / `style.ts` 等文件存在于两个路径（`bwvi design` 和 `bwvi设计`） | 项目根目录 | 清理错误路径的文件，统一到 `bwvi design` | 10min |

## P1 — 功能缺失（用户可见）

| # | 功能 | 实现方案 | 文件 | 预估 |
|:-:|------|----------|------|:----:|
| 04 | **PDF/PNG 导出** | `bwvi export file.html --pdf`，用 Puppeteer/Playwright 渲染后导出 | 新增 `src/cli/export.ts` + 注册到 index.ts | 2h |
| 05 | **组件预览模式** | `bwvi preview hero --variant=split --style=brutalism` 单独渲染单个组件 | 新增 `src/cli/preview.ts` | 1.5h |
| 06 | **样式系统接入 generate** | `style-systems.ts` 已就绪，但 `generate --style=<id>` 未接入 page-builder | 修改 `src/engine/page-builder.ts` + `src/cli/generate.ts` | 30min |
| 07 | **交互式 CLI 输出** | 命令执行时显示 spinner、进度条、彩色 log（非 `--json` 模式） | 修改 `src/index.ts` + 各 cli 命令 | 1h |
| 08 | **AI 图片生成** | 蓝图中的图片占位改为调用 DALL·E / Stable Diffusion API | 扩展 `src/engine/imager.ts` + 新增 `--ai-images` 参数 | 2h |

## P2 — 质量提升

| # | 改进 | 方案 | 文件 | 预估 |
|:-:|------|------|------|:----:|
| 09 | **单元测试** | 为 `findBlueprint`、`buildPage`、`checkSlop` 等核心函数加 vitest 测试 | 新增 `src/**/*.test.ts` + `vitest.config.ts` | 2h |
| 10 | **Benchmark 扩展** | 从 5 用例扩展到 20 用例，覆盖所有 24 个命令 | 修改 `src/cli/benchmark.ts` | 1h |
| 11 | **错误信息人性化** | 将 `JSON.stringify({error})` 改为用户可读的中文/英文消息 | 修改所有 `src/cli/*.ts` 中的错误输出 | 1.5h |
| 12 | **配置文件生效** | `.bwvi/config.json` 中读取默认 direction、device、brand | 修改 `src/cli/generate.ts` 等 | 30min |

## P3 — 长期

| # | 方向 | 说明 |
|:-:|------|------|
| 13 | **蓝图关键词匹配升级** | 当前用 `includes` 简单匹配，可改为 TF-IDF 或 embedding 向量搜索 |
| 14 | **插件生态** | 插件注册表 + 社区贡献指南 + 示例插件 |
| 15 | **VSCode 插件** | BWVI 命令的 VSCode 集成，右键 HTML → Critique |
| 16 | **Web UI** | 简单的本地 Web 界面，可视化选择蓝图/风格/品牌 |

## 建议执行顺序

```
P0-01 → P0-02 → P0-03 → P1-06 → P1-04 → P1-05 → P2-09 → P2-11 → P1-07 → P2-10 → P2-12 → P1-08
 (Bug)     (死代码)  (清理)   (样式接入) (导出)   (预览)   (测试)   (错误信息) (CLI UX) (Benchmark) (配置) (AI图片)
```
