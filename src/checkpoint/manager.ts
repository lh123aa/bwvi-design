import { readFile, writeFile, mkdir, readdir, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { DesignDecision } from "../types/decision.js";

export class CheckpointManager {
  private root: string;
  private checkpointsDir: string;

  constructor(projectRoot: string) {
    this.root = projectRoot;
    this.checkpointsDir = join(projectRoot, ".bwvi", "checkpoints");
  }

  async ensureDir(): Promise<void> {
    if (!existsSync(this.checkpointsDir)) {
      await mkdir(this.checkpointsDir, { recursive: true });
    }
  }

  async save(decision: DesignDecision): Promise<string> {
    await this.ensureDir();
    const filePath = join(this.checkpointsDir, `${decision.id}.json`);
    await writeFile(filePath, JSON.stringify(decision, null, 2), "utf-8");
    return decision.id;
  }

  async load(decisionId: string): Promise<DesignDecision | null> {
    const filePath = join(this.checkpointsDir, `${decisionId}.json`);
    try {
      const raw = await readFile(filePath, "utf-8");
      return JSON.parse(raw) as DesignDecision;
    } catch {
      return null;
    }
  }

  async rollback(toDecisionId: string): Promise<number> {
    const all = await this.allDecisions();
    const idx = all.findIndex((d) => d.id === toDecisionId);
    if (idx === -1) return 0;
    const toRemove = all.slice(idx + 1);
    for (const d of toRemove) {
      try { await unlink(join(this.checkpointsDir, d.id + '.json')); } catch {}
    }
    return toRemove.length;
  }

  async list(): Promise<string[]> {
    await this.ensureDir();
    const files = await readdir(this.checkpointsDir);
    return files
      .filter((f) => f.endsWith(".json"))
      .map((f) => f.replace(/\.json$/, ""))
      .sort();
  }

  async latest(): Promise<DesignDecision | null> {
    const ids = await this.list();
    if (ids.length === 0) return null;
    return this.load(ids[ids.length - 1]);
  }

  async allDecisions(): Promise<DesignDecision[]> {
    const ids = await this.list();
    const decisions: DesignDecision[] = [];
    for (const id of ids) {
      const d = await this.load(id);
      if (d) decisions.push(d);
    }
    return decisions;
  }

  async getDecisionsAfter(checkpointId: string): Promise<DesignDecision[]> {
    const all = await this.allDecisions();
    const idx = all.findIndex((d) => d.id === checkpointId);
    if (idx === -1) return [];
    return all.slice(idx + 1);
  }
}
