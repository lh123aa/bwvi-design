import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export async function historyCommand(args: string[]) {
  const projectDir = findProjectDir();
  if (!projectDir) { console.error(JSON.stringify({ error: "未找到 .bwvi 项目" })); process.exit(1); }
  const bwviDir = join(projectDir, ".bwvi");

  // Read feedback history
  const feedbackDir = join(bwviDir, "feedback");
  const feedbacks: any[] = [];
  if (existsSync(feedbackDir)) {
    try {
      const files = readdirSync(feedbackDir).filter(f => f.endsWith(".json"));
      files.forEach(f => { try { feedbacks.push(JSON.parse(readFileSync(join(feedbackDir, f), "utf-8"))); } catch {} });
    } catch {}
  }

  // Read report history
  const reportDir = join(bwviDir, "reports");
  const reports: any[] = [];
  if (existsSync(reportDir)) {
    try {
      const files = readdirSync(reportDir).filter(f => f.endsWith(".json"));
      files.forEach(f => { try { reports.push(JSON.parse(readFileSync(join(reportDir, f), "utf-8"))); } catch {} });
    } catch {}
  }

  const avgScore = feedbacks.length > 0 ? (feedbacks.reduce((s, f) => s + f.score, 0) / feedbacks.length).toFixed(1) : null;
  const avgCritique = reports.length > 0 ? (reports.reduce((s, r) => s + r.critique_final, 0) / reports.length).toFixed(1) : null;

  console.log(JSON.stringify({
    project: projectDir.split(/[\\/]/).pop(),
    feedbacks: feedbacks.length,
    avg_user_score: avgScore ? parseFloat(avgScore) : null,
    reports: reports.length,
    avg_critique_score: avgCritique ? parseFloat(avgCritique) : null,
    recent_feedback: feedbacks.slice(-3).reverse(),
    recent_reports: reports.slice(-3).reverse().map(r => ({ name: r.project_name, score: r.critique_final, date: r.created_at })),
    failure_patterns: aggregateFailures(reports),
  }, null, 2));
}
function aggregateFailures(reports: any[]) {
  const map: Record<string, number> = {};
  reports.forEach((r: any) => { if (r.failure_patterns) r.failure_patterns.forEach((fp: any) => { map[fp.type] = (map[fp.type] || 0) + 1; }); });
  return Object.entries(map).sort((a: any, b: any) => b[1] - a[1]).map(([type, count]: any) => ({ type, count }));
}
function findProjectDir() { var d = process.cwd(); for (var i = 0; i < 5; i++) { if (existsSync(join(d, ".bwvi"))) return d; var p = join(d, ".."); if (p === d) break; d = p; } return null; }