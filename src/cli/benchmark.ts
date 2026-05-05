import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { analyzeHtml } from "../critique/objective.js";
import { buildReport } from "../critique/self-review.js";
import { CheckpointManager } from "../checkpoint/manager.js";
import { FingerprintTracker } from "../fingerprint/tracker.js";
import { recommendDirections } from "../engine/analyzer.js";
import { learnFromUrl } from "../engine/learner.js";

interface TestResult {
  name: string;
  passed: boolean;
  score?: number;
  details: string[];
  duration_ms: number;
}

import { generateDirectHtml } from "./generate.js";

export async function runBenchmark(): Promise<void> {
  const startTime = Date.now();
  const results: TestResult[] = [];
  const tmpDir = join(process.cwd(), ".bwvi-benchmark");

  if (existsSync(tmpDir)) {
    execSync(`rmdir /s /q "${tmpDir}"`, { stdio: "ignore" });
  }
  await mkdir(tmpDir, { recursive: true });

  process.stderr.write("BWVI Benchmark Suite\n");
  process.stderr.write("─".repeat(40) + "\n");

  results.push(await tc01BrandLanding(tmpDir));
  results.push(await tc02ColdStart(tmpDir));
  results.push(await tc03Iteration(tmpDir));
  results.push(await tc04Recovery(tmpDir));
  results.push(await tc05Learn(tmpDir));
  results.push(await tc06StyleList());
  results.push(await tc07BrandSearch());
  results.push(await tc08GenerateWithStyle());
  results.push(await tc09MCPTools());
  results.push(await tc10DeviceFrame());
  results.push(await tc11AnimationCSS());
  results.push(await tc12SlopGuard());
  results.push(await tc13ImageGenProviderList());

  // Cleanup
  execSync(`rmdir /s /q "${tmpDir}"`, { stdio: "ignore" });

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const totalTime = Date.now() - startTime;

  process.stderr.write("\n" + "─".repeat(40) + "\n");
  process.stderr.write(`结果: ${passed}/${total} 通过 (${(totalTime / 1000).toFixed(1)}s)\n\n`);

  console.log(JSON.stringify({
    suite: "BWVI Phase 1 Benchmark",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    total_duration_ms: totalTime,
    results: results.map((r) => ({
      name: r.name,
      passed: r.passed,
      score: r.score,
      details: r.details,
      duration_ms: r.duration_ms,
    })),
    summary: { passed, total, pass_rate: `${passed}/${total}` },
  }, null, 2));

  process.exit(passed === total ? 0 : 1);
}

async function tc01BrandLanding(tmpDir: string): Promise<TestResult> {
  const start = Date.now();
  const details: string[] = [];
  let passed = false;

  try {
    const task = "premium coffee brand landing page";

    // Analyze
    const directions = recommendDirections(task, 3);
    details.push(`方向推荐: ${directions.length} 个`);
    if (directions.length < 2) throw new Error("方向推荐数不足");

    // Generate direct HTML
    const html = generateDirectHtml(task, "warm-minimal",
      { primary: "#D97757", accent: "#8C6E5D", surface: "#FDF8F5", text: "#3D3D3D" },
      "'Georgia', serif");

    const htmlPath = join(tmpDir, "tc01-output.html");
    await writeFile(htmlPath, html, "utf-8");
    details.push(`HTML 生成: ${html.length} bytes`);

    // Critique
    const metrics = analyzeHtml(html, ["#D97757", "#8C6E5D", "#FDF8F5"]);
    const report = buildReport(html, metrics);
    details.push(`评分: ${report.score}/10`);

    if (report.score >= 5.0) {
      passed = true;
      details.push("✓ 评分通过阈值");
    } else {
      details.push("✗ 评分低于 5.0");
    }

    // Check HTML has basic structure
    if (!/<h1/i.test(html)) details.push("⚠ 缺少 h1");
    if (!/<body/i.test(html)) details.push("⚠ 缺少 body");

  } catch (err: any) {
    details.push(`错误: ${err.message}`);
  }

  return { name: "TC01: 品牌 landing page", passed, score: undefined, details, duration_ms: Date.now() - start };
}

async function tc02ColdStart(tmpDir: string): Promise<TestResult> {
  const start = Date.now();
  const details: string[] = [];
  let passed = false;

  try {
    const task = "帮我做个好看的官网";

    // Analyze — should still return directions even with vague task
    const directions = recommendDirections(task, 3);
    details.push(`方向推荐: ${directions.map((d) => d.name).join(", ")}`);
    if (directions.length === 0) throw new Error("冷启动方向推荐为空");

    // Generate with first direction
    const htmlPath = join(tmpDir, "tc02-output.html");
    const html = generateDirectHtml(task, directions[0].name,
      { primary: "#1A1A2E", accent: "#C44536", surface: "#FAF8F5", text: "#2D2D2D" },
      "'Georgia', serif");

    await writeFile(htmlPath, html, "utf-8");
    details.push(`HTML 生成: ${html.length} bytes`);

    const metrics = analyzeHtml(html);
    const report = buildReport(html, metrics);
    details.push(`评分: ${report.score}/10`);

    passed = report.score >= 5.0;
    details.push(passed ? "✓ 冷启动产出合格" : "✗ 冷启动产出低于 5.0");

  } catch (err: any) {
    details.push(`错误: ${err.message}`);
  }

  return { name: "TC02: 冷启动", passed, score: undefined, details, duration_ms: Date.now() - start };
}

async function tc03Iteration(tmpDir: string): Promise<TestResult> {
  const start = Date.now();
  const details: string[] = [];
  let passed = false;

  try {
    // V1: generate a basic HTML
    const v1Html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>V1</title><style>:root{--color-primary:#333;--font-display:serif}</style></head><body><h1>Hello</h1><p>test</p></body></html>`;
    const v1Path = join(tmpDir, "tc03-v1.html");
    await writeFile(v1Path, v1Html, "utf-8");

    const v1Metrics = analyzeHtml(v1Html);
    const v1Report = buildReport(v1Html, v1Metrics);
    details.push(`V1 评分: ${v1Report.score}/10`);

    // V2: improved version
    const v2Html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Improved</title><style>:root{--color-primary:#D97757;--color-accent:#8C6E5D;--color-surface:#FDF8F5;--color-text:#3D3D3D;--font-display:'Georgia',serif;--font-body:'Inter',sans-serif;--space-unit:8px}</style></head><body><header><nav><h1>Improved Site</h1><a href="/">Home</a></nav></header><main><section><h2>Welcome</h2><p>This is improved content with real text.</p></section><section><h2>Features</h2><ul><li>Feature one</li><li>Feature two</li></ul></section></main><footer><p>2026</p></footer></body></html>`;
    const v2Path = join(tmpDir, "tc03-v2.html");
    await writeFile(v2Path, v2Html, "utf-8");

    const v2Metrics = analyzeHtml(v2Html);
    const v2Report = buildReport(v2Html, v2Metrics);
    details.push(`V2 评分: ${v2Report.score}/10`);

    const improved = v2Report.score > v1Report.score;
    details.push(improved ? "✓ 迭代后评分提升" : "✗ 评分未提升");

    passed = improved;

  } catch (err: any) {
    details.push(`错误: ${err.message}`);
  }

  return { name: "TC03: 评审迭代", passed, score: undefined, details, duration_ms: Date.now() - start };
}

async function tc04Recovery(tmpDir: string): Promise<TestResult> {
  const start = Date.now();
  const details: string[] = [];
  let passed = false;

  try {
    const projectDir = join(tmpDir, "tc04-project");
    await mkdir(projectDir, { recursive: true });
    await mkdir(join(projectDir, ".bwvi", "checkpoints"), { recursive: true });

    // Simulate a session: save 2 decisions
    const cp = new CheckpointManager(projectDir);
    await cp.save({
      id: "dec_direction_01",
      type: "direction",
      inputs: { task: "test" },
      output: { school: "warm-minimal" },
      rationale: "best for test",
      tokens: {},
      confidence: 0.8,
      made_by: "agent",
      confirmed_by: "user",
      created_at: new Date().toISOString(),
    });
    await cp.save({
      id: "dec_palette_01",
      type: "palette",
      inputs: { direction: "warm-minimal" },
      output: { primary: "#D97757", accent: "#8C6E5D" },
      rationale: "matches warm direction",
      tokens: { "--color-primary": "#D97757" },
      confidence: 0.85,
      made_by: "agent",
      confirmed_by: "user",
      created_at: new Date().toISOString(),
    });

    // Simulate recovery: list decisions and verify
    const decisions = await cp.allDecisions();
    details.push(`已恢复决策: ${decisions.length} 个`);

    const types = decisions.map((d) => d.type).join(", ");
    details.push(`决策类型: ${types}`);

    // Verify fingerprint tracking
    const html = `<html><body><h1>Test</h1></body></html>`;
    const metrics = analyzeHtml(html);
    const report = buildReport(html, metrics);
    const tracker = new FingerprintTracker(projectDir);
    await tracker.recordProject(decisions, report);

    const fp = await tracker.load();
    details.push(`指纹记录: ${fp?.projects_analyzed ?? 0} 项目`);

    if (decisions.length >= 2 && fp?.projects_analyzed === 1) {
      passed = true;
      details.push("✓ 恢复后决策完整，指纹正确");
    } else {
      details.push("✗ 决策或指纹不完整");
    }

  } catch (err: any) {
    details.push(`错误: ${err.message}`);
  }

  return { name: "TC04: 中断恢复", passed, score: undefined, details, duration_ms: Date.now() - start };
}

async function tc05Learn(tmpDir: string): Promise<TestResult> {
  const start = Date.now();
  const details: string[] = [];
  let passed = false;

  try {
    const result = await learnFromUrl("https://example.com");
    details.push(`标题: ${result.title}`);
    details.push(`流派: ${result.detectedSchool} (置信度: ${result.confidence})`);
    details.push(`色值: ${Object.keys(result.tokens.colors).length} 个`);
    details.push(`字体: ${result.tokens.typography.googleFonts.length} 个 Google Fonts`);

    if (result.title && result.detectedSchool) {
      passed = true;
      details.push("✓ 学习成功完成");
    } else {
      details.push("✗ 学习结果不完整");
    }

  } catch (err: any) {
    details.push(`错误: ${err.message}`);
  }

  return { name: "TC05: 外部学习", passed, score: undefined, details, duration_ms: Date.now() - start };
}

async function tc06StyleList(): Promise<TestResult> {
  const s = Date.now(); const d: string[] = []; let p = false;
  try {
    const st = await import("../engine/style-systems.js");
    const lst = st.listStyles();
    d.push(`风格数量: ${lst.length}`);
    if (lst.length >= 50) { p = true; d.push("✓ 风格列表完整"); }
  } catch(e: any) { d.push(`错误: ${e.message}`); }
  return { name: "TC06: 风格列表", passed: p, details: d, duration_ms: Date.now() - s };
}

async function tc07BrandSearch(): Promise<TestResult> {
  const s = Date.now(); const d: string[] = []; let p = false;
  try {
    const br = await import("../engine/brand-loader.js");
    const lst = br.listBrands();
    d.push(`品牌数量: ${lst.length}`);
    const search = br.searchBrands("payment");
    d.push(`搜索 payment: ${search.length} 个`);
    if (lst.length >= 100) { p = true; d.push("✓ 品牌系统完整"); }
  } catch(e: any) { d.push(`错误: ${e.message}`); }
  return { name: "TC07: 品牌搜索", passed: p, details: d, duration_ms: Date.now() - s };
}

async function tc08GenerateWithStyle(): Promise<TestResult> {
  const s = Date.now(); const d: string[] = []; let p = false;
  try { const { buildPage } = await import("../engine/page-builder.js");
    const r = buildPage({ task: "test", direction: "tech-utility", styleId: "glassmorphism" });
    d.push(`风格 applied: ${r.html.length > 1000 ? "✅" : "⚠️"}`);
    if (r.html.length > 1000) { p = true; d.push("✓ 风格渲染成功"); }
  } catch(e: any) { d.push(`错误: ${e.message}`); }
  return { name: "TC08: 风格渲染", passed: p, details: d, duration_ms: Date.now() - s };
}

async function tc09MCPTools(): Promise<TestResult> {
  const s = Date.now(); const d: string[] = []; let p = false;
  try { const { listStyles } = await import("../engine/style-systems.js");
    const { listBrands } = await import("../engine/brand-loader.js");
    const st = listStyles(); const br = listBrands();
    d.push(`MCP 可用数据: ${st.length} 风格, ${br.length} 品牌`);
    if (st.length > 0 && br.length > 0) { p = true; d.push("✓ MCP 数据源正常"); }
  } catch(e: any) { d.push(`错误: ${e.message}`); }
  return { name: "TC09: MCP 数据源", passed: p, details: d, duration_ms: Date.now() - s };
}

async function tc10DeviceFrame(): Promise<TestResult> {
  const s = Date.now(); const d: string[] = []; let p = false;
  try { const { wrapWithDevice } = await import("../frames/index.js");
    const html = wrapWithDevice("<p>test</p>", "iphone");
    d.push(`iPhone 边框: ${html.length} bytes`);
    if (html.includes("bwvi-iphone")) { p = true; d.push("✓ 设备边框渲染正确"); }
  } catch(e: any) { d.push(`错误: ${e.message}`); }
  return { name: "TC10: 设备边框", passed: p, details: d, duration_ms: Date.now() - s };
}

async function tc11AnimationCSS(): Promise<TestResult> {
  const s = Date.now(); const d: string[] = []; let p = false;
  try { const { getAnimationCSS } = await import("../engine/animation-engine.js");
    const css = getAnimationCSS();
    d.push(`动画 CSS: ${css.length} bytes`);
    if (css.includes("bwi-fade-up") && css.includes("bwi-bounce-in")) { p = true; d.push("✓ 动画引擎正常"); }
  } catch(e: any) { d.push(`错误: ${e.message}`); }
  return { name: "TC11: 动画引擎", passed: p, details: d, duration_ms: Date.now() - s };
}

async function tc12SlopGuard(): Promise<TestResult> {
  const s = Date.now(); const d: string[] = []; let p = false;
  try { const { checkSlop } = await import("../engine/slop-guard.js");
    const r1 = checkSlop("<p>Good content</p>"); const r2 = checkSlop("<p>Lorem ipsum dolor</p>");
    d.push(`干净 HTML: ${r1.score}/10, 含 slop: ${r2.score}/10`);
    if (r1.clean && !r2.clean) { p = true; d.push("✓ Slop 检测正确"); }
  } catch(e: any) { d.push(`错误: ${e.message}`); }
  return { name: "TC12: Slop 检测", passed: p, details: d, duration_ms: Date.now() - s };
}

async function tc13ImageGenProviderList(): Promise<TestResult> {
  const s = Date.now(); const d: string[] = []; let p = false;
  try { const { listProviders } = await import("../engine/image-gen.js");
    const provs = listProviders();
    d.push(`图片提供商: ${provs.length} 个`);
    if (provs.length >= 5) { p = true; d.push("✓ AI 生图配置正常"); }
  } catch(e: any) { d.push(`错误: ${e.message}`); }
  return { name: "TC13: AI 生图配置", passed: p, details: d, duration_ms: Date.now() - s };
}
