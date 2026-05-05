# 提交 BWVI 到 awesome-mcp-servers

## 操作步骤

### 1. Fork 仓库
打开 https://github.com/punkpeye/awesome-mcp-servers
点击右上角 **Fork** → 选你的账号

### 2. 编辑 README.md

在你的 fork 仓库里：
- 找到 `README.md` 文件
- 点击铅笔图标 ✏️ 编辑
- 在 **Server Implementation** 列表的合适位置插入以下内容：

```markdown
- [BWVI](https://github.com/lh123aa/bwvi-design) - 🎨 Agent-native design decision protocol. Provides AI agents with structured design direction, color palette, typography, and layout decisions through 8 native MCP tools. Features 50+ industry blueprints, 115 brand systems, 56 visual styles, 5 device frames, and animation engine. Single binary, 831KB, zero external runtime deps.
```

建议插入在 `B` 字母开头的条目之间。

### 3. 提交 PR

- 滚动到底部，Commit changes → 选 "Create a new branch"
- Commit 信息写：`Add BWVI: design decision protocol for AI agents`
- 点击 **Propose changes**
- 在 PR 页面确认后点击 **Create pull request**
- 标题写：`Add BWVI - Agent-native design decision protocol with MCP`
- 描述写：

```markdown
## Description

Add [BWVI](https://github.com/lh123aa/bwvi-design) to the list of MCP servers.

BWVI (Better Way of Visual Intelligence) is a CLI + MCP Server that gives AI agents a structured design decision framework — direction, palette, typography, layout — before executing design output.

## Key Features
- 8 native MCP tools (analyze, generate, critique, learn, list directions/styles/brands/blueprints)
- 50+ industry blueprints with real content
- 115 built-in brand systems (Linear, Stripe, Apple, Notion...)
- 56 visual styles (brutalism, glassmorphism, cyberpunk, pastel...)
- 5 device frames (iPhone 15 Pro, Pixel 9, iPad Pro, MacBook Pro, Browser)
- Animation engine with 12 animation types, 7 easing curves, MP4 export
- Single binary: 831KB CJS, 3 dependencies, zero external runtime

## Why BWVI belongs here
Unlike other MCP servers that focus on file system or database access, BWVI brings structured design decision-making to AI agents — a capability that's been missing from the MCP ecosystem.
```

### 4. 完成
提交后等待 maintainer review 即可。
