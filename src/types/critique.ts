export interface ObjectiveMetrics {
  color_compliance: number;
  font_compliance: number;
  asset_authenticity: number;
  accent_overuse: number;
  token_efficiency: number;
}

export interface SelfReview {
  philosophy: number;
  hierarchy: number;
  detail: number;
  function: number;
  innovation: number;
}

export interface CritiqueReport {
  mode_used: "self-plus";
  objective: ObjectiveMetrics;
  self?: SelfReview;
  score: number;
  passed: boolean;
  warnings: string[];
}
