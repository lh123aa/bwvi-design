export interface ProjectConfig {
  name: string;
  created_at: string;
  last_used: string;
  decisions_count: number;
  completed: boolean;
}

export interface Checkpoint {
  id: string;
  decisions: import("./decision.js").DesignDecision[];
  loaded_knowledge: string[];
  artifacts: string[];
  agent_context?: string;
  created_at: string;
}
