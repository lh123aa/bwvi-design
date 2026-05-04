import { readFileSync } from "node:fs";
import { analyzeHtml } from "./objective.js";
import { buildReport } from "./self-review.js";

export function critiqueDiff(v1Html: string, v2Path: string) {
  let v2Html: string;
  try {
    v2Html = readFileSync(v2Path, "utf-8");
  } catch {
    return { error: `Cannot read: ${v2Path}` };
  }

  const m1 = analyzeHtml(v1Html);
  const m2 = analyzeHtml(v2Html);
  const r1 = buildReport(v1Html, m1);
  const r2 = buildReport(v2Html, m2);

  const metricDiffs: Record<string, { from: number; to: number; improved: boolean }> = {};
  const keys = Object.keys(m1) as (keyof typeof m1)[];
  for (const k of keys) {
    const from = +((m1[k] as number) || 0);
    const to = +((m2[k] as number) || 0);
    if (from !== to) {
      metricDiffs[k] = { from: +from.toFixed(2), to: +to.toFixed(2), improved: to > from };
    }
  }

  const improvements = Object.values(metricDiffs).filter(d => d.improved).length;
  const regressions = Object.values(metricDiffs).filter(d => !d.improved).length;

  return {
    diff: true,
    score_change: { from: r1.weighted_score, to: r2.weighted_score, delta: +(r2.weighted_score - r1.weighted_score).toFixed(1) },
    passed: r2.passed,
    improved_metrics: improvements,
    regressed_metrics: regressions,
    v1_issues: r1.issues.length,
    v2_issues: r2.issues.length,
    metric_diffs: metricDiffs,
    v1_summary: r1.summary,
    v2_summary: r2.summary,
    assessment: r2.weighted_score > r1.weighted_score ? "improved" : r2.weighted_score < r1.weighted_score ? "regressed" : "unchanged",
  };
}
