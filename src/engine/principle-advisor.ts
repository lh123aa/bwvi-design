import type { CompositionOption } from "../principles/types.js";
import { generateMixOptions, explainComposition } from "../principles/composer.js";
import { recommendDirections, type Direction } from "./analyzer.js";

export interface EnhancedRecommendation {
  directions: Direction[];
  mixOptions: MixSummary[];
}

export interface MixSummary {
  id: string;
  name: string;
  rationale: string;
  score: number;
  details: string[];
}

export function recommendWithPrinciples(task: string, count: number = 3): EnhancedRecommendation {
  const directions = recommendDirections(task, count);
  const mixes = generateMixOptions(task, count);

  const mixSummaries: MixSummary[] = mixes.map(m => ({
    id: m.option.id,
    name: m.option.name,
    rationale: m.option.rationale,
    score: m.principleScore,
    details: explainComposition(m.option),
  }));

  return { directions, mixOptions: mixSummaries };
}
