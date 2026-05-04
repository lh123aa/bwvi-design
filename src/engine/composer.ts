import { loadMultiple } from "../knowledge/loader.js";
import { DECISION_REGISTRY, type DesignDecision } from "../types/decision.js";

export interface ComposedPrompt {
  systemPrompt: string;
  userPrompt: string;
  tokenEstimate: number;
}

export function composeGeneratePrompt(
  task: string,
  decisions: DesignDecision[],
  _directionName?: string
): ComposedPrompt {
  const knowledgeIds = new Set<string>();
  for (const d of decisions) {
    const node = DECISION_REGISTRY.graph[d.type];
    if (node?.knowledge_required) {
      for (const k of node.knowledge_required) knowledgeIds.add(k);
    }
  }
  const knowledge = loadMultiple([...knowledgeIds]);
  const tokenEstimate = Object.values(knowledge).reduce(
    (sum, body) => sum + body.split(/s+/).length, 0
  );
  const decisionsBlock = decisions.map((d) => "  [" + d.type + "] " + d.rationale).join("\n");
  const knowledgeBlock = Object.entries(knowledge)
    .map(([id, body]) => "--- " + id + " ---\n" + body.trim())
    .join("\n\n");
  const systemPrompt = "You are a designer working with HTML. Produce a single self-contained HTML file with all CSS inlined.\n"
    + "No external dependencies. No filler content.\n"
    + "Wrap the output in <artifact> tags at the end of your response.\n\n"
    + "## Confirmed design decisions\n"
    + (decisionsBlock || "  (none yet, use your best judgment)") + "\n\n"
    + "## Design constraints\n"
    + (knowledgeBlock || "  (none)");
  return { systemPrompt, userPrompt: task, tokenEstimate };
}
