export type CapabilityId =
  | "direction-recommendation"
  | "palette-generation"
  | "typography-pairing"
  | "layout-generation"
  | "critique-objective"
  | "critique-self-review"
  | "knowledge-quality"
  | "brand-coverage"
  | "style-coverage"
  | "animation"
  | "learning-from-url"
  | "feedback-learning";

export interface CapabilityNode {
  id: CapabilityId;
  name: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  diagnosis: string;
  bottleneck: string;
  improvementHistory: ImprovementEntry[];
}

export interface ImprovementEntry {
  id: string;
  timestamp: string;
  previousLevel: number;
  newLevel: number;
  method: "knowledge-ingest" | "algorithm-upgrade" | "data-expansion" | "feedback-accumulation";
  description: string;
  source: string;
  verified: boolean;
}

export interface KnowledgeSource {
  type: "url" | "file" | "feedback" | "critique-pattern" | "manual";
  uri: string;
  ingestedAt: string;
  contentSummary: string;
  quality: number;
}

export interface KnowledgeChunk {
  id: string;
  title: string;
  body: string;
  tags: string[];
  sources: KnowledgeSource[];
  tokenCount: number;
  lastUpdated: string;
}

export interface LearningReport {
  capabilities: CapabilityNode[];
  overallLevel: number;
  weakest: { id: CapabilityId; level: number; bottleneck: string };
  strongest: { id: CapabilityId; level: number };
  recentImprovements: ImprovementEntry[];
  totalImprovements: number;
  knowledgeChunks: number;
}

export interface IngestResult {
  source: string;
  chunksCreated: number;
  chunksUpdated: number;
  tokensExtracted: number;
  summary: string;
}
