# BWVI

> **B**etter **W**ay of **V**isual **I**ntelligence — Agent-native design tool.

CLI 工具 + MCP Server，让 AI Agent 拥有结构化的设计决策能力。不抢 Agent 的执行，给 Agent 更好的决策框架。

## 快速开始

```bash
npx bwvi init my-project && cd my-project
npx bwvi analyze "咖啡品牌 landing page"
npx bwvi showcase --pick landing-warm    # 选方向
npx bwvi generate "咖啡品牌" --direct    # 直接出 HTML
npx bwvi critique index.html             # 评审
npx bwvi feedback 8                      # 评分
```

## 安装

```bash
# 直接运行（无需安装）
npx bwvi --help

# 或全局安装
npm install -g bwvi
bwvi --help
```

## 命令

```
核心:
  init       创建 .bwvi/ 项目
  analyze    分析任务 → 方向推荐 + 指纹参考
  generate   生成设计（--direct 直接出 / 默认出 prompt）
  critique   评审 HTML → 5 维评分 + 客观指标
  learn      从 URL 学习设计 Token

设计辅助:
  showcase   8 预制风格展示
  checkpoint 跨会话决策管理
  feedback   评分 → 自动更新指纹
  knowledge  知识块查看 / 模式挖掘
  asset      品牌色搜索
  brief      结构化设计简报
  debt       设计债追踪
  history    质量趋势
  brand      品牌系统缓存

工具:
  plugin     插件脚手架
  diff       HTML 版本对比
  benchmark  5 用例测试套件
  mcp        MCP Server（Agent 原生调用）
```

## 跨会话分工

```bash
# 会话 1: 用户选方向
bwvi showcase --pick landing-editorial
# → 写入 .bwvi/checkpoints/

# 新开会话 2: 设计师读决策
bwvi checkpoint list
# → 方向已定，直接 generate
```

## 与 Agent 集成

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

Agent 可直接调用 `analyze_design`、`generate_design`、`critique_design` 等工具。

## API

```bash
bwvi analyze "SaaS landing page"
bwvi generate "SaaS landing" --direction=tech-utility
bwvi critique output.html --brand-colors #1E1E2E,#00E698
bwvi learn https://linear.app
bwvi showcase --pick dashboard-clean
bwvi checkpoint list
bwvi checkpoint restore dec_direction_123
bwvi feedback 8 "排版不错"
bwvi knowledge list
bwvi knowledge improve
bwvi asset color stripe
bwvi brief "咖啡品牌, 受众:投资人, 语气:专业"
bwvi debt add "Logo 需要替换为官方 SVG"
bwvi history
bwvi brand fetch linear
bwvi plugin my-plugin
bwvi diff v1.html v2.html
bwvi benchmark
```

## Benchmark

```bash
bwvi benchmark
# → 5/5 通过 (0.2s)
```

## 许可证

Apache-2.0
