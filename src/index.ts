import { initCommand } from "./cli/init.js";
import { analyzeCommand } from "./cli/analyze.js";
import { generateCommand } from "./cli/generate.js";
import { critiqueCommand } from "./cli/critique.js";
import { learnCommand } from "./cli/learn.js";
import { runBenchmark } from "./cli/benchmark.js";
import { startMcpServer } from "./mcp/server.js";
import { checkpointCommand } from "./cli/checkpoint.js";
import { showcaseCommand } from "./cli/showcase.js";
import { feedbackCommand } from "./cli/feedback.js";
import { knowledgeCommand } from "./cli/knowledge.js";
import { assetCommand } from "./cli/asset.js";
import { briefCommand } from "./cli/brief.js";
import { debtCommand } from "./cli/debt.js";
import { historyCommand } from "./cli/history.js";
import { brandCommand } from "./cli/brand.js";
import { pluginInitCommand } from "./cli/plugin.js";
import { critiqueDiff } from "./critique/diff.js";
import { templateCommand } from "./cli/template.js";
import { testCommand } from "./cli/test.js";
import { videoCommand } from "./cli/video.js";
import { styleCommand } from "./cli/style.js";

async function main() {
  const command = process.argv[2];
  const args = process.argv.slice(3);
  switch (command) {
    case "init": await initCommand(args); break;
    case "analyze": await analyzeCommand(args); break;
    case "generate": await generateCommand(args); break;
    case "critique": await critiqueCommand(args); break;
    case "learn": await learnCommand(args); break;
    case "benchmark": await runBenchmark(); break;
    case "mcp": await startMcpServer(); break;
    case "checkpoint": await checkpointCommand(args); break;
    case "showcase": await showcaseCommand(args); break;
    case "feedback": await feedbackCommand(args); break;
    case "knowledge": await knowledgeCommand(args); break;
    case "asset": await assetCommand(args); break;
    case "brief": await briefCommand(args); break;
    case "debt": await debtCommand(args); break;
    case "history": await historyCommand(args); break;
    case "brand": await brandCommand(args); break;
    case "video": await videoCommand(args); break;
    case "style": await styleCommand(args); break;
    case "plugin": await pluginInitCommand(args); break;
    case "template": await templateCommand(args); break;
    case "test": await testCommand(args); break;
    case "diff":
      const f1 = args[0];
      const f2 = args.find(a => !a.startsWith("-"));
      if (!f1 || !f2) { console.error("Usage: bwvi diff <file1> <file2>"); process.exit(1); }
      try {
        const html1 = require("fs").readFileSync(f1, "utf-8");
        const result = await critiqueDiff(html1, f2);
        console.log(JSON.stringify(result, null, 2));
      } catch(e) { console.error("Error:", (e as any).message); process.exit(1); }
      break;
    case "--help": case "-h": case undefined: printHelp(); break;
    default: console.error("unknown command: " + command); process.exit(1);
  }
}
function printHelp() {
  var cmds = [
    "init          Initialize project",
    "analyze       Analyze design task",
    "generate      Generate design output",
    "critique      Critique HTML output",
    "learn         Learn from website URL",
    "showcase      Browse design directions",
    "checkpoint    List/show/restore decisions",
    "feedback      Rate output (1-10)",
    "knowledge     List/show knowledge blocks",
    "asset         <logo|color> <brand>  Asset search",
    "brief         Create structured brief",
    "debt          Design debt list/add/resolve",
    "history       Quality history & trends",
    "brand         <cache|fetch> Brand system",
    "plugin        Create plugin scaffold",
    "template      List/use/delete templates",
    "style         List/show/search visual styles (57 built-in)",
    "test          Validate HTML (a11y, responsive, interactive)",
    "video         Export HTML to MP4/GIF (requires ffmpeg)",
    "diff          Compare two HTML files",
    "benchmark     Run benchmark suite",
    "mcp           Start MCP server",
    "--help        Show this help",
  ];
  console.log("BWVI -- Better Way of Visual Intelligence\n\nCommands:");
  cmds.forEach(function(c) { console.log("  " + c); });
  console.log("\nbwvi <command> --help for details");
}

main().catch((err) => {
  console.error("Fatal:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});