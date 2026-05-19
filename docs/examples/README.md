# BWVI Examples

## MCP Integration

```js
// Connect BWVI to any MCP-compatible AI agent
// Claude Code: already configured in package.json
// OpenCode:  add to ~/.opencode/config.json

{
  "mcpServers": {
    "bwvi": {
      "command": "npx",
      "args": ["-y", "bwvi", "mcp"]
    }
  }
}
```

## CLI Workflows

### 1. Design a landing page
```bash
bwvi generate "premium coffee brand landing page" --direct
# → outputs: demo/index.html
```

### 2. Mobile app prototype
```bash
bwvi generate "fitness app onboarding" --device=iphone --interactive
# → outputs: demo/preview-iphone.html
```

### 3. Branded SaaS page
```bash
bwvi generate "SaaS analytics dashboard" --brand=linear --style=glassmorphism
# → outputs: demo/index.html
```

### 4. Full workflow
```bash
bwvi analyze "ecommerce site redesign"      # step 1: direction
bwvi showcase --pick corporate-trust         # step 2: choose style
bwvi generate "ecommerce site" --direct      # step 3: generate
bwvi critique demo/index.html                # step 4: review
bwvi feedback 8 "great layout"               # step 5: rate
```

## CI/CD Integration

```yaml
# .github/workflows/bwvi-design.yml
name: Design Gate
on: [pull_request]
jobs:
  critique:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx bwvi critique index.html
```
