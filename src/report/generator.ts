import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { DesignDecision } from "../types/decision.js";
import type { CritiqueReport } from "../types/critique.js";

export interface ProjectReport {
  project_name: string;
  created_at: string;
  duration_ms: number;
  decisions_made: number;
  decisions_chain: string[];
  critique_final: number;
  failure_patterns: Array<{
    type: string;
    description: string;
    impact: number;
  }>;
}

export async function generateReport(
  projectRoot: string,
  projectName: string,
  decisions: DesignDecision[],
  critique: CritiqueReport,
  startTime: number
): Promise<ProjectReport> {
  const reportDir = join(projectRoot, ".bwvi", "reports");
  if (!existsSync(reportDir)) {
    await mkdir(reportDir, { recursive: true });
  }

  const failurePatterns: ProjectReport["failure_patterns"] = [];
  for (const w of critique.warnings) {
    failurePatterns.push({
      type: classifyWarning(w),
      description: w,
      impact: 0.5,
    });
  }

  if (critique.score < 6) {
    failurePatterns.push({
      type: "low_score",
      description: `最终评分 ${critique.score}/10，低于 6 分阈值`,
      impact: 1.0,
    });
  }

  const report: ProjectReport = {
    project_name: projectName,
    created_at: new Date().toISOString(),
    duration_ms: Date.now() - startTime,
    decisions_made: decisions.length,
    decisions_chain: decisions.map((d) => d.type),
    critique_final: critique.score,
    failure_patterns: failurePatterns,
  };

  const filePath = join(reportDir, `${projectName}-${Date.now()}.json`);
  await writeFile(filePath, JSON.stringify(report, null, 2), "utf-8");

  return report;
}

function classifyWarning(warning: string): string {
  if (warning.includes("accent")) return "accent_overuse";
  if (warning.includes("placeholder") || warning.includes("资产")) return "asset_missing";
  if (warning.includes("HTML") || warning.includes("体积")) return "bloat";
  if (warning.includes("色板") || warning.includes("brand")) return "color_mismatch";
  return "other";
}
