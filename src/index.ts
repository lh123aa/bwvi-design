import { initCommand } from "./cli/init.js";
import { analyzeCommand } from "./cli/analyze.js";
import { generateCommand } from "./cli/generate.js";
import { critiqueCommand } from "./cli/critique.js";
import { learnCommand } from "./cli/learn.js";
import { runBenchmark } from "./cli/benchmark.js";
import { readFileSync } from "node:fs";
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
import { animateCommand } from "./cli/animate.js";
import { imageCommand } from "./cli/image.js";
import { exportCommand } from "./cli/export.js";
import { previewCommand } from "./cli/preview.js";
import { serveCommand } from "./cli/serve.js";

const BWVI_VERSION = "0.2.0";
const COMMANDS = ["init","analyze","generate","critique","learn","showcase","checkpoint","feedback","knowledge","asset","brief","debt","history","brand","style","template","test","animate","export","preview","video","plugin","diff","benchmark","mcp"];
const GENERATE_FLAGS = ["--direct","--run","--device=","--orientation=","--variant=","--style=","--brand=","--dark","--interactive","--engine=","--json"];
const STYLE_IDS = ["minimal-white","clean-corporate","soft-minimal","warm-editorial","dark-luxury","neo-brutalism","glassmorphism","cyberpunk","playful-color","pastel-dream","kawaii-japan","nature-organic","corporate-trust","tech-utility","photography","music-vibe"];

async function main() {
  if (process.argv.includes("--version") || process.argv.includes("-v")) {
    console.log("bwvi v" + BWVI_VERSION);
    return;
  }
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
    case "animate": await animateCommand(args); break;
    case "image": await imageCommand(args); break;
    case "export": await exportCommand(args); break;
    case "preview": await previewCommand(args); break;
    case "serve": await serveCommand(args); break;
    case "completion":
      {
        const sh = args[0] || "bash";
        if (sh === "bash") {
          const cmds = COMMANDS.join(" ");
          console.log("_bwvi_completions(){ local cur=${COMP_WORDS[COMP_CWORD]}; if [[ $COMP_CWORD -eq 1 ]]; then COMPREPLY=($(compgen -W '" + cmds + "' -- $cur)); fi }; complete -F _bwvi_completions bwvi");
        } else if (sh === "powershell") {
          const cmds = COMMANDS.join('","');
          console.log('Register-ArgumentCompleter -Native -CommandName bwvi -ScriptBlock { param($w,$a,$p); $c=@("' + cmds + '"); $c | Where-Object {$_ -like "$w*"} | ForEach-Object {[System.Management.Automation.CompletionResult]::new($_)} }');
        }
      }
      return;
    case "plugin": await pluginInitCommand(args); break;
    case "template": await templateCommand(args); break;
    case "test": await testCommand(args); break;
    case "diff":
      const f1 = args[0];
      const f2 = args.find(a => !a.startsWith("-"));
      if (!f1 || !f2) { console.error("Usage: bwvi diff <file1> <file2>"); process.exit(1); }
      try {
        const html1 = readFileSync(f1, "utf-8");
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
    "image         Generate image via AI (DALL·E / SD / Tongyi / Seedream) requires API key",
    "animate       Embed animations / export MP4 (needs ffmpeg)",
    "export        Export HTML to PDF/PNG/PPTX/DOCX",
    "preview       Preview a component (hero, navbar, features...)",
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