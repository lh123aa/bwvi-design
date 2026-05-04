# 贡献指南

## 开发

```bash
git clone <repo>
cd bwvi
npm install
npm run build          # esbuild 打包 → dist/bwvi.cjs
npm run dev -- analyze "test"   # tsx 开发模式
```

## 代码结构

```
src/
├── index.ts            CLI 入口
├── engine/             核心引擎（analyze / compose）
├── critique/           评审引擎（objective / self-review / diff）
├── checkpoint/         文件系统持久化
├── knowledge/          知识块加载
├── fingerprint/        设计指纹
├── report/             项目报告
├── cli/                各命令实现
├── mcp/                MCP Server
└── types/              类型定义
```

## 添加新命令

1. 在 `src/cli/` 下创建 `your-command.ts`
2. 在 `src/index.ts` 中 import + 注册 case
3. `npm run build` → 测试
4. `bwvi benchmark` → 确保 5/5

## 添加知识块

1. 在 `src/knowledge/loader.ts` 的 `EMBEDDED_KNOWLEDGE` 中添加
2. 在 `src/cli/knowledge.ts` 的 `CHUNK_DESCRIPTIONS` 中添加描述
3. 知识块 ≤ 2000 tokens，Markdown 格式

## 插件开发

```bash
bwvi plugin my-plugin
cd my-plugin
# 编辑 manifest.yaml 和 src/index.ts
```

插件 API 参考 `src/mcp/server.ts` 中的 tool 注册格式。

## 发布检查

```bash
npm run build           # 打包
npm test                # 暂未配置
bwvi benchmark          # 必须 5/5
```

## 代码规范

- TypeScript strict mode
- 不依赖外部 API（除非是插件）
- 每个 CLI 命令输出 JSON（stdout）+ 日志（stderr）
- 错误码前缀：E=错误, W=警告, I=信息
