// BWVI MCP Integration Example
// Run: node mcp-integration.js

import { spawn } from "child_process";

const bwvi = spawn("npx", ["-y", "bwvi", "mcp"], {
  stdio: ["pipe", "pipe", "inherit"],
});

// Call analyze_design tool
bwvi.stdin.write(JSON.stringify({
  jsonrpc: "2.0",
  id: 1,
  method: "tools/call",
  params: {
    name: "analyze_design",
    arguments: { task: "coffee brand landing page" }
  }
}) + "\n");

// Call generate_design tool
bwvi.stdin.write(JSON.stringify({
  jsonrpc: "2.0",
  id: 2,
  method: "tools/call",
  params: {
    name: "generate_design",
    arguments: { task: "coffee brand", direction: "warm-minimal" }
  }
}) + "\n");

bwvi.stdout.on("data", (data) => {
  const lines = data.toString().trim().split("\n");
  for (const line of lines) {
    try {
      const msg = JSON.parse(line);
      console.log(`[Response ${msg.id}]`, JSON.stringify(msg.result, null, 2));
    } catch {}
  }
});

setTimeout(() => process.exit(0), 3000);
