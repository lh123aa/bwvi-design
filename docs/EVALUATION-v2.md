# BWVI 第二轮迭代评估

## 项目现状

- **源码**: 55 个 TS 文件，5,790 行
- **Bundle**: 832 KB (CJS)
- **命令**: 24 个
- **Benchmark**: 8.2/10

---

## 发现的问题

### 🔴 P0 — 必须修复

| # | 问题 | 文件 | 说明 |
|:-:|------|------|------|
| 01 | **learner.ts 是死代码** | `src/engine/learner.ts` (269行) | page-builder 上线后 `learnFromUrl` 不再被主流程调用，仅 `brand fetch` 间接使用。可精简 200+ 行 |
| 02 | **benchmark.ts 过于臃肿** | `src/cli/benchmark.ts` (279行，第2大文件) | 测试逻辑 + 报告生成混在一起。应拆分为 `benchmark/` 目录 |
| 03 | **showcase.ts 与 generate.ts 逻辑重复** | `src/cli/showcase.ts` (210行) | 两者都调用组件函数生成 HTML，`showcase --pick` 可委托给 `page-builder` |

### 🟡 P1 — 应该改进

| # | 改进 | 说明 | 工作量 |
|:-:|------|------|:------:|
| 04 | **每命令 --help 缺失** | `bwvi generate --help` 报错，应显示参数说明 | 1h |
| 05 | **无 npm publish** | `publish.yml` CI 已存在但包未发布到 npm，他人无法 `npx bwvi` | 0.5h |
| 06 | **截图文件累计** | `demo/screenshots/` 有 9 个 png 文件，部分在 git 中，增大仓库体积 | 0.5h |
| 07 | **无自动版本检查** | 没有 `bwvi update` 或启动时的版本更新提示 | 0.5h |
| 08 | **无 Shell 自动补全** | `bwvi gen<tab>` 不会自动补全为 `generate` | 1h |

### 🔵 P2 — 可以优化

| # | 优化 | 说明 | 工作量 |
|:-:|------|------|:------:|
| 09 | **组件文档页** | `bwvi preview` 只能看单个组件，没有像 Storybook 那样的完整组件目录 | 2h |
| 10 | **MCP Server 增强** | 目前 5 个 tools，可扩展为支持 `list_styles`、`list_brands`、`list_blueprints` | 1h |
| 11 | **性能优化** | esbuild 打包 832 KB，可 tree-shaking 未使用的蓝图/品牌数据 | 1h |
| 12 | **插件示例** | 插件脚手架存在但无示例插件项目 | 1h |

### 🟢 P3 — 长期方向

| # | 方向 | 说明 |
|:-:|------|------|
| 13 | **文档站点** | 搭建 VitePress/GitBook 文档站，展示所有组件 variant + 风格预览 |
| 14 | **Web UI** | 简单的 Electron/Web 界面，可视化选择蓝图/风格/品牌 |
| 15 | **AI 图片生成** | 蓝图中的占位图接入 DALL·E / Stable Diffusion |
| 16 | **插件市场** | 插件注册表 + 社区贡献流程 |

---

## 与第一轮 TODO 的对比

| 优先级 | 第一轮 | 本轮新增 | 状态 |
|:------:|:------:|:---------|:----:|
| P0 | 3 项 | 3 项（learner/benchmark/showcase） | 前 3 已修复 |
| P1 | 5 项 | 5 项（--help/npm/截图/版本/补全） | 前 5 已修复+新增 |
| P2 | 4 项 | 4 项（组件文档/MCP/性能/插件） | 前 4 已修复+新增 |
| P3 | 4 项 | 4 项（文档站/Web UI/AI图片/插件市场） | 长期 |

## 建议执行顺序

```
P0-01 → P0-02 → P0-03 → P1-04 → P1-05 → P1-06 → P1-07 → P1-08 → P2-09 → P2-10
(learner) (benchmark) (showcase) (--help) (npm) (截图) (版本检查) (补全) (组件文档) (MCP扩展)
```
