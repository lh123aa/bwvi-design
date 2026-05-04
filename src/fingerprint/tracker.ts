import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { DesignDecision } from "../types/decision.js";
import type { CritiqueReport } from "../types/critique.js";
import type { DesignFingerprint } from "../types/fingerprint.js";

const FP_FILE = "fingerprint.yaml";

export class FingerprintTracker {
  private filePath: string;

  constructor(projectRoot: string) {
    this.filePath = join(projectRoot, ".bwvi", FP_FILE);
  }

  async ensureDir(): Promise<void> {
    const dir = join(this.filePath, "..");
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
  }

  async load(): Promise<DesignFingerprint | null> {
    try {
      const raw = await readFile(this.filePath, "utf-8");
      return JSON.parse(raw) as DesignFingerprint;
    } catch {
      return null;
    }
  }

  async recordProject(decisions: DesignDecision[], report: CritiqueReport): Promise<DesignFingerprint> {
    await this.ensureDir();
    const existing = await this.load() || this.createEmpty();

    existing.projects_analyzed++;

    for (const d of decisions) {
      const type = d.type;
      if (!existing.distribution[type]) existing.distribution[type] = {};
      const key = JSON.stringify(d.output).slice(0, 80);
      existing.distribution[type][key] = (existing.distribution[type][key] || 0) + 1;
    }

    if (report.warnings.length > 0) {
      for (const w of report.warnings) {
        if (!existing.implicit_avoid.includes(w)) {
          existing.implicit_avoid.push(w);
        }
      }
    }

    existing.confidence = this.calcConfidence(existing.projects_analyzed);
    existing.last_updated = new Date().toISOString();
    existing.version = "1.0.0";

    await writeFile(this.filePath, JSON.stringify(existing, null, 2), "utf-8");
    return existing;
  }

  async adjustDirections(directions: string[]): Promise<{ adjusted: string[]; fromFingerprint: boolean }> {
    const fp = await this.load();
    if (!fp || fp.confidence === "insufficient" || fp.projects_analyzed < 1) {
      return { adjusted: directions, fromFingerprint: false };
    }

    const preferred: string[] = [];
    const counts = fp.distribution["direction"] || {};
    for (const [key, count] of Object.entries(counts)) {
      if (count >= fp.projects_analyzed * 0.4) {
        try {
          const parsed = JSON.parse(key);
          if (parsed.school && directions.includes(parsed.school)) {
            preferred.push(parsed.school);
          }
        } catch {}
      }
    }

    if (preferred.length === 0) return { adjusted: directions, fromFingerprint: false };

    const sorted = [...directions].sort((a, b) => {
      const aPref = preferred.includes(a) ? -1 : 1;
      const bPref = preferred.includes(b) ? -1 : 1;
      return aPref - bPref;
    });

    return { adjusted: sorted, fromFingerprint: true };
  }

  private createEmpty(): DesignFingerprint {
    return {
      version: "1.0.0",
      projects_analyzed: 0,
      distribution: {},
      implicit_avoid: [],
      confidence: "insufficient",
      last_updated: new Date().toISOString(),
    };
  }

  private calcConfidence(count: number): DesignFingerprint["confidence"] {
    if (count < 3) return "insufficient";
    if (count < 5) return "low";
    if (count < 10) return "medium";
    return "high";
  }
}
