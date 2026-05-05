# BWVI 项目规则

## RTK 使用规则

执行 Bash 命令时，优先使用以下替代：

| 原始命令 | 替换为 |
|---------|-------|
| `ls`, `tree` | `rtk ls`, `rtk tree` |
| `cat`, `head`, `tail` `<文件>` | `rtk read <文件>` |
| `grep`, `rg` | `rtk grep` |
| `find` | `rtk find` |
| `git status` | `rtk git status` |
| `git log` | `rtk git log` |
| `git diff` | `rtk git diff` |
| `git push` | `rtk git push` |
| `npm test`, `cargo test` 等 | `rtk test <命令>` |

## 构建与测试

```bash
npm install              # 安装依赖
npm run dev -- <args>    # 开发模式（TS 直接运行）
npm run typecheck        # 类型检查（tsc --noEmit）
npm run build            # 生产构建（esbuild CJS+ESM）
npm start                # 运行 dist/bwvi.cjs
npm run benchmark        # 5 用例基准测试
npm run build && npm start  # 完整构建+运行
```

## 代码规范

- **语言**: TypeScript 5.7+, strict mode
- **模块**: ESM (`"type": "module"`)
- **目标**: ES2022
- **入口**: `src/index.ts` 读取 `process.argv[2]` 路由命令
- **输出**: stdout = JSON, stderr = 日志（Agent 友好）
- **构建**: esbuild 双格式输出至 `dist/`

## 文件命名约定

| 模式 | 说明 |
|------|------|
| `src/types/*.ts` | 纯接口/类型定义，0 依赖 |
| `src/engine/*.ts` | 核心逻辑（无 CLI 耦合） |
| `src/cli/*.ts` | 每个文件一个 CLI 命令 |
| `src/critique/*.ts` | 评审相关 |
| `knowledge/*.md` | 知识块，双层加载（文件优先于源码） |
| `demo/*.html` | 演示 HTML |
| `specs/*.md` | 架构规范 |

## 架构约束

1. **types/ 层不可引用 src/ 其他模块** — 纯接口，0 外部依赖
2. **cli/ 命令只做参数解析和调用** — 核心逻辑在 engine/、critique/ 等
3. **MCP Server 独立于 CLI 路由** — 共用 engine/ 但不依赖 cli/
4. **所有持久化走 `.bwvi/`** — 纯 JSON/YAML 文件，零数据库依赖

## 设计决策链

核心抽象，决策顺序不可逆：

```
direction → palette → typography → [information_density] → layout → detail_signature
```

每步决策为 `DesignDecision` 实体，包含：type, inputs, output, rationale, confidence, made_by, confirmed_by, tokens。

## 运行时目录 (.bwvi/)

| 路径 | 说明 |
|------|------|
| `.bwvi/config.json` | 项目配置 |
| `.bwvi/checkpoints/` | 决策持久化（跨会话恢复） |
| `.bwvi/fingerprint.yaml` | 设计指纹（隐式学习团队偏好） |
| `.bwvi/reports/` | 项目评审报告 |
| `.bwvi/feedback/` | 用户反馈 |
| `.bwvi/debt/` | 设计债 |
| `.bwvi/references/` | 设计参考（learn/asset 下载） |
| `.bwvi/templates/` | 用户自定义模板 |
| `.bwvi/brief.json` | 设计简报 |

## Git 规则

- `.bwvi/` 运行时目录不提交（已在 `.gitignore` 中）
- `knowledge/` 和 `demo/` 应提交
- `dist/` 不提交（CI 构建）
- 发布前必须通过 `npm run benchmark`（5/5）
