import { loadMultiple } from "../knowledge/loader.js";
import { DECISION_REGISTRY, type DesignDecision } from "../types/decision.js";

export interface ComposedPrompt {
  systemPrompt: string;
  userPrompt: string;
  tokenEstimate: number;
}

const ANIMATION_KEYWORDS = [
  "scroll", "parallax", "animate", "animation", "fade", "slide",
  "transition", "motion", "gsap", "timeline", "stagger", "reveal",
  "morph", "svg animation", "text animation", "split text",
  "flip", "drag", "physics", "bounce", "elastic", "spring",
];

function needsAnimation(task: string): boolean {
  const lower = task.toLowerCase();
  return ANIMATION_KEYWORDS.some((kw) => lower.includes(kw));
}

function getGsapKnowledge(): string {
  return "When producing animations, use GSAP (GreenSock Animation Platform) instead of CSS @keyframes for complex sequences.\n"
    + "Load GSAP from CDN:\n"
    + '  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/gsap.min.js"></script>\n'
    + "Or use local copy:\n"
    + '  <script src="../GSAP/dist/gsap.min.js"></script>\n\n'
    + "ScrollTrigger requires an additional script:\n"
    + '  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12/dist/ScrollTrigger.min.js"></script>\n'
    + '  <script>gsap.registerPlugin(ScrollTrigger)</script>\n\n'
    + "Core Tween API:\n"
    + "  gsap.to(target, vars) — animate from current to to values\n"
    + "  gsap.from(target, vars) — animate from values to current\n"
    + "  gsap.fromTo(target, fromVars, toVars) — explicit start/end\n\n"
    + "Always use transform aliases (x, y, scale, rotation) instead of layout properties (top, left, width, height).\n"
    + 'Use autoAlpha instead of opacity — autoAlpha also sets visibility:hidden when value is 0.\n\n'
    + "Timeline for sequenced animations:\n"
    + "  const tl = gsap.timeline();\n"
    + '  tl.to(".el1", { x: 100, duration: 0.5 })\n'
    + '    .to(".el2", { opacity: 1, duration: 0.3 }, "+=0.2");\n\n'
    + "Stagger for lists:\n"
    + '  gsap.from(".card", { opacity: 0, y: 30, stagger: 0.1 });\n\n'
    + "ScrollTrigger for scroll-driven animations:\n"
    + "  gsap.to('.progress', {\n"
    + "    scaleX: 1,\n"
    + "    scrollTrigger: { trigger: '.section', start: 'top center', end: 'bottom top', scrub: 1 }\n"
    + "  });\n"
    + "Use scrub: true to link animation progress directly to scroll position.\n"
    + "Do not use scrub and toggleActions together.\n"
    + "Remove markers: true in production.\n"
    + "Call ScrollTrigger.refresh() after DOM changes.\n"
    + "Do not set delay on individual timeline children — use the position parameter instead.\n"
    + "All GSAP plugins (SplitText, MorphSVG, Flip, Draggable, ScrollTrigger, etc.) are free — no Club GSAP membership needed.";
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

  let extraBlock = "";
  if (needsAnimation(task)) {
    extraBlock = "\n\n## GSAP Animation Reference\n" + getGsapKnowledge();
  }

  const systemPrompt = "You are a designer working with HTML. Produce a single self-contained HTML file with all CSS inlined.\n"
    + "No external dependencies. No filler content.\n"
    + "Wrap the output in <artifact> tags at the end of your response.\n\n"
    + "## Confirmed design decisions\n"
    + (decisionsBlock || "  (none yet, use your best judgment)") + "\n\n"
    + "## Design constraints\n"
    + (knowledgeBlock || "  (none)")
    + extraBlock;
  return { systemPrompt, userPrompt: task, tokenEstimate };
}
