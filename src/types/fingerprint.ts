export type DecisionType = import("./decision.js").DecisionType;

export interface DesignFingerprint {
  version: string;
  projects_analyzed: number;
  distribution: Record<string, Record<string, number>>;
  implicit_avoid: string[];
  confidence: "insufficient" | "low" | "medium" | "high";
  last_updated: string;
}
