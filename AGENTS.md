# BWVI 项目规则（v0.2.2）

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
npm test                 # 86 用例单元测试（vitest）
npm run benchmark        # 13 用例基准测试 v
npm run build && npm start  # 完整构建+运行
```

## 视频录制（v0.2.1 新增）

```bash
bwvi animate page.html --record                    # 1080p 25fps MP4
bwvi animate page.html --record --fps=60           # 60fps
bwvi animate page.html --record --format=gif       # GIF 导出
bwvi animate page.html --record --bgm=tech         # BGM
bwvi animate page.html --record --interactive      # 交互录制
```

依赖: `npm install -D playwright && npx playwright install chromium`

## Pencil Bridge（v0.2.1 新增）

```bash
bwvi generate "咖啡品牌" --engine=pencil          # Pencil 设计稿
```

## 视频文件清单

```
src/engine/
├── video-capture.ts        Playwright 录屏
├── video-composer.ts       ffmpeg 合成 + BGM
├── video-inject.ts         录制动画注入
├── interaction-capture.ts  交互录制
└── bridges/pencil-bridge.ts Pencil 设计稿
```

## 代码规范

- **语言**: TypeScript 5.7+, strict mode
- **模块**: ESM (`"type": "module"`)
- **目标**: ES2022
- **入口**: `src/index.ts` 读取 `process.argv[2]` 路由命令
- **输出**: stdout = JSON, stderr = 日志（Agent 友好）
- **构建**: esbuild 双格式输出至 `dist/`

## 文件组织规范（全局强制）

根目录必须保持精简，只允许以下条目：

| 允许类型 | 目录/文件 | 说明 |
|---------|-----------|------|
| 源码入口 | `src/` | 项目核心代码 |
| 构建配置 | `package.json`, `tsconfig.json`, `vitest.config.ts` | 构建/依赖定义 |
| 项目门面 | `README.md`, `README.en.md`, `LICENSE`, `CHANGELOG.md`, `CONTRIBUTING.md` | 对外展示文档 |
| 项目规则 | `AGENTS.md` | 会话规则 |
| CI/CD | `.github/` | GitHub Actions |
| Docker | `Dockerfile` | 容器化部署 |
| Git 配置 | `.gitignore` | 版本控制 |
| 文档 | `docs/` | 含 `planning/`, `specs/`, `examples/` |
| 构建脚本 | `scripts/` | 工具脚本 |
| 测试框架 | `test_framework/` | Playwright 配置 + E2E 测试 |
| 知识库 | `knowledge/` | 15 个知识块 MD 文件 |
| 临时文件 | `_temp/` | 用完即删，已 `.gitignore` 排除 |
| 构建产出 | `dist/` | 已 `.gitignore` 排除 |
| 依赖 | `node_modules/` | 已 `.gitignore` 排除 |
| 生成预览 | `demo/` | 生成 HTML，部分 `.gitignore` 排除 |

> **规则**: 根目录不得出现孤立临时文件（如 `pencil-batch-*.json`）、插件脚手架（`my-plugin/` 应放 `docs/examples/`）、测试框架配置（应放 `test_framework/`）。

## 文件命名约定

| 模式 | 说明 |
|------|------|
| `src/types/*.ts` | 纯接口/类型定义，0 依赖 |
| `src/engine/*.ts` | 核心逻辑（无 CLI 耦合） |
| `src/cli/*.ts` | 每个文件一个 CLI 命令 |
| `src/critique/*.ts` | 评审相关 |
| `knowledge/*.md` | 知识块，双层加载（文件优先于源码） |
| `demo/*.html` | 演示 HTML |
| `docs/specs/*.md` | 架构规范 |
| `docs/examples/*/` | 示例项目（如 `my-plugin/`） |
| `test_framework/` | 测试框架配置 + E2E 测试 |

## 架构约束

1. **types/ 层不可引用 src/ 其他模块** — 纯接口，0 外部依赖
2. **cli/ 命令只做参数解析和调用** — 核心逻辑在 engine/、critique/ 等
3. **MCP Server 独立于 CLI 路由** — 共用 engine/ 但不依赖 cli/
4. **所有持久化走 `.bwvi/`** — 纯 JSON/YAML 文件，零数据库依赖

## MCP Tool 契约（决策强制）

### Generate Tool — 必须带决策确认

```typescript
interface GenerateInput {
  task: string;
  confirmed_decisions: {                      // 强制执行：不允许直接生成
    direction: string;                         // 决策 ID，已被 user 确认
    palette: string;
    typography: string;
    layout?: string;
    information_density?: string;
  };
  assets?: {
    logo?: string;                             // asset download 返回的文件路径
    imagery?: string[];
  };
  mode: "sync" | "async";
}
```

**规则**: 所有 generate 调用必须先完成方向→色板→字体决策链，缺少任一决策返回 `MISSING_DECISIONS` 错误。

### Critique Tool — 三级模式

| 模式 | 条件 | 功能 |
|------|------|------|
| `objective` | 无条件 | 仅客观指标（color/font/asset/accessibility 等） |
| `self-plus` | 默认 | 客观指标 + 5 维自评（philosophy/hierarchy/detail/function/innovation） |
| `cross` | 2+ 模型可用 | 客观指标 + 多模型交叉验证 + 偏差分析 |

## 三种运行模式

| 模式 | 网络 | 功能 |
|------|------|------|
| **online** | ✅ 可达 | 品牌资产搜索、知识库更新、交叉评审、品牌新鲜度验证 |
| **limited** | ⚠️ 可达无多模型 Key | 本地分析、生成、self-plus 评审、资产降级（缓存+placeholder） |
| **offline** | ❌ 不可达 | 仅缓存知识块、生成、objective 评审、诚实 placeholder |

> **规则**: 离线是一等公民，不是偶然降级。首次使用 `bwvi init --cache` 预缓存知识库。

## Token 预算表

| 阶段 | 预算 | 说明 |
|------|:----:|------|
| **任务分析** | ~1,300 | tool_call + result + knowledge 选择 |
| **知识加载** | 7,500~12,500 | 每会话 3-5 个块，每块 ≤ 2,000 |
| **方向选择** | ~1,400 | 推荐 + 用户确认 |
| **色板/字体** | ~1,000 | 推荐 + 用户确认 |
| **生成** | 5,000~8,000 | system + user prompt + output |
| **评审** | 4,000~7,000 | input + output |
| **全流程估算** | **20,200~31,200** | 超出则裁减知识块或换短评审模式 |

## 错误码体系

| 级别 | 编码 | 含义 |
|------|:----:|------|
| 🔴 致命 | E001 | 配置损坏 (CONFIG_CORRUPTED) |
| 🔴 致命 | E002 | Checkpoint 损坏 (CHECKPOINT_CORRUPTED) |
| 🟡 可恢复 | E101 | 网络超时 (NETWORK_TIMEOUT) |
| 🟡 可恢复 | E102 | API 限流 (API_RATE_LIMITED) |
| 🟡 可恢复 | E103 | 资产未找到 (ASSET_NOT_FOUND) |
| 🟡 可恢复 | E104 | 生成不完整 (GENERATION_INCOMPLETE) |
| 🟡 决策契约 | E105 | 缺少决策 ID (MISSING_DECISIONS) |
| 🟡 决策契约 | E106 | 决策未确认 (DECISION_NOT_CONFIRMED) |
| 🟡 决策契约 | E107 | 决策 ID 不存在 (DECISION_NOT_FOUND) |
| 🔵 运行提示 | I201 | 离线模式提示 (非错误) |
| 🔵 运行提示 | I202 | 有限模式提示 (非错误) |
| ⚠️ 警告 | W301 | 品牌信息过时 (BRAND_STALE) |
| ⚠️ 警告 | W302 | 知识库已更新 (KNOWLEDGE_UPDATED) |
| ⚠️ 警告 | W303 | 置信度低 (LOW_CONFIDENCE) |

## 设计原则（架构级）

| # | 原则 | 说明 |
|---|------|------|
| 6 | **用契约强制，不用信任驱动** | MCP tool 的 input schema 是硬边界 |
| 7 | **快路优先，深路可选** | 默认 ~200ms 出东西，深度分析按需触发 |
| 8 | **离线是一等公民** | 不是偶然的降级，是主动设计的模式 |
| 9 | **不自欺：标注所有置信度** | 来源、模式、偏差全部标明 |
| 10 | **自举才能发布** | 自己的狗粮自己先吃 |

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
- `dist/` 和 `_temp/` 不提交（已在 `.gitignore` 中）
- `test_framework/` 应提交（含 Playwright 配置 + E2E 测试）
- 发布前必须通过 `npm run typecheck && npm test && npm run build && npm run benchmark`
- 根目录不得有孤立临时文件，发现即清理

## 生成文件规则

所有命令生成的产出文件必须按类型放入固定位置，不得散落在根目录：

### 文件类型分类存放表

| 文件类型 | 存放位置 | git | 清理策略 |
|---------|---------|:---:|---------|
| `generate` 产出 HTML | `demo/` | 不提交 | 随时可删（生成即出） |
| `animate` 录制视频 (MP4/GIF/WebM) | `demo/` | 不提交 | 随时可删 |
| 截图 | `demo/screenshots/` | 不提交 | 只保留与 `demo/` 中 HTML 对应的截图 |
| 预览图片 (PNG/JPG) | `demo/` | 不提交 | 用完即删 |
| 测试报告 HTML | `_temp/test-reports/` | 不提交 | 用完即删 |
| benchmark 报告 | `_temp/benchmark/` | 不提交 | 用完即删 |
| 实验性脚本/临时文件 | `_temp/` | 不提交 | 用完即删 |
| 用户自定义模板 | `.bwvi/templates/` | 不提交 | 按需保留 |
| 设计评审报告 | `.bwvi/reports/` | 不提交 | 按需保留 |
| Pencil 设计稿 JSON | `_temp/pencil/` | 不提交 | 用完即删 |

### 路径规则

- **唯一基准路径**: `E:\程序\bwvi design\bwvi\`（禁止使用 `E:\程序\bwvi设计\`）
- **函数**: 调用 `getDemoDir()`（`src/cli/demo.ts`），自动优先检测 `.bwvi` 项目目录
- **生成命令**: `generate --direct`, `showcase --pick`, `preview`, `video`, `export` 都必须通过 `getDemoDir()`
- **禁止**: 
  - 不直接使用 `join(process.cwd(), "demo")`，统一走 `getDemoDir()`
  - 禁止在任何其他路径（尤其是根目录）生成孤立文件
  - 禁止创建 `logos/`、`vending-sticker-*` 等根目录文件

### Git 规则更新

- `demo/` 中所有非文档产出已通过 `.gitignore` 排除（HTML/MP4/GIF/PNG/JPG/WebM）
- `_temp/` 整体不提交
- `demo/screenshots/` 不提交
- 根目录不得出现任何孤立文件（.html/.png/.json/.mjs 等）

## 路径映射表（强制参考）

当用户用中文名指代路径时，必须按此表映射，不得自动创建中文文件夹：

| 用户提到的名称 | 应映射到 |
|---------------|---------|
| bwvi设计、bwvi项目、bwvi | `E:\程序\bwvi design\bwvi\` |
| 花叔设计、huashu设计 | `E:\程序\bwvi design\huashu-design\` |
| open-design、Open Design | `E:\程序\bwvi design\open-design\` |

## 路径防火墙（强制预检协议）

所有 AI Agent 在每次 **write/mkdir/cp** 操作前必须执行：

### 步骤 1：路径黑名单检查
```javascript
const forbidden = ["bwvi设计"];
const targetPath = "要写入的路径";
for (const f of forbidden) {
  if (targetPath.includes(f)) {
    throw new Error("禁止路径被拦截！路径包含: " + f);
  }
}
```

### 步骤 2：写入前父路径确认
在 write/mkdir 前必须用 `Test-Path` 确认父目录是 `E:\程序\bwvi design\bwvi\` 或其子目录。

### 违规后果
若 `E:\程序\bwvi设计\` 再次出现 → **严重违规**，立即执行：
1. 将误放的文件迁移到 `E:\程序\bwvi design\bwvi\` 对应位置
2. 删除 `E:\程序\bwvi设计\` 文件夹
3. 在对话记录中标记此次违规

## 异常检测

- 如果发现 `E:\程序\bwvi设计\` 或类似的中文名文件夹存在，立即检查其内容是否为主项目的子集
- 确认后立即删除中文名副本，所有文件统一到 `E:\程序\bwvi design\bwvi\`
