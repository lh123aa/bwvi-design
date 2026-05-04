export type DecisionType =
  | "direction"
  | "palette"
  | "typography"
  | "layout"
  | "information_density"
  | "detail_signature";

export interface DesignDecision {
  id: string;
  type: DecisionType;
  inputs: Record<string, unknown>;
  output: Record<string, unknown>;
  tokens?: Record<string, string>;
  rationale: string;
  confidence: number;
  made_by: "agent" | "user" | "rule";
  confirmed_by: "user" | "rule" | null;
  superseded_by?: string;
  created_at: string;
}

export interface DecisionNode {
  next: DecisionType[];
  required_inputs: string[];
  knowledge_required: string[];
}

export interface DecisionRegistry {
  root: DecisionType;
  graph: Record<DecisionType, DecisionNode>;
}

export const DECISION_REGISTRY: DecisionRegistry = {
  root: "direction",
  graph: {
    direction: {
      next: ["palette", "information_density"],
      required_inputs: ["task_type", "brand_context", "audience"],
      knowledge_required: ["direction-advisor"],
    },
    palette: {
      next: ["typography"],
      required_inputs: ["direction", "brand"],
      knowledge_required: ["color-theory"],
    },
    typography: {
      next: ["layout"],
      required_inputs: ["direction", "brand"],
      knowledge_required: ["typography-pairing"],
    },
    information_density: {
      next: ["layout"],
      required_inputs: ["product_type"],
      knowledge_required: [],
    },
    layout: {
      next: ["detail_signature"],
      required_inputs: ["content_inventory", "hierarchy"],
      knowledge_required: [],
    },
    detail_signature: {
      next: [],
      required_inputs: ["direction", "palette"],
      knowledge_required: [],
    },
  },
};
