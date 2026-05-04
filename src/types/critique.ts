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

export interface CritiqueReport {
  mode_used: "self-plus";
  objective: ObjectiveMetrics;
  self?: SelfReview;
  weighted_score: number;
  score: number;
  passed: boolean;
  warnings: string[];
  issues: CritiqueIssue[];
  summary: string;
}
