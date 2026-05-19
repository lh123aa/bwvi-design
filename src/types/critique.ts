export interface ObjectiveMetrics {
  color_compliance: number;
  font_compliance: number;
  asset_authenticity: number;
  accent_overuse: number;
  token_efficiency: number;
  // New metrics
  accessibility: number;     // contrast, ARIA, labels
  semantic_html: number;     // proper tag usage, heading hierarchy
  responsive: number;        // viewport meta, media queries
  seo_score: number;         // title, meta, heading structure
  html_validity: number;     // charset, doctype, no broken tags
}

export interface CritiqueIssue {
  type: string;
  severity: "info" | "warning" | "error";
  message: string;
  suggestion?: string;
}

export interface SelfReview {
  philosophy: number;
  hierarchy: number;
  detail: number;
  function: number;
  innovation: number;
}

export interface CrossReviewResult {
  model_a_score: number;
  model_b_score: number;
  deviation: number;          // 0-1, 越小越一致
  bias_analysis: string[];    // 分析差异点
  confidence_adjustment: number; // -0.5 ~ +0.5
}

export interface CritiqueReport {
  mode_used: "self-plus" | "cross";
  objective: ObjectiveMetrics;
  self?: SelfReview;
  cross?: CrossReviewResult;
  weighted_score: number;
  score: number;
  passed: boolean;
  warnings: string[];
  issues: CritiqueIssue[];
  summary: string;
}
