import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { learnFromUrl, saveReference, injectToFingerprint } from "../engine/learner.js";

export async function learnCommand(args: string[]) {
  const url = args.find((a) => a.startsWith("http://") || a.startsWith("https://"));
  const inject = args.includes("--inject");
  const genTemplate = args.includes("--template");

  if (!url) {
    console.error(JSON.stringify({ error: "请提供要学习的 URL", code: "MISSING_URL" }));
    console.error("Usage: bwvi learn <url> [--inject] [--template]");
    process.exit(1);
  }

  process.stderr.write(`Learning ${url}...\n`);
  const ref = await learnFromUrl(url);
  process.stderr.write("\n");

  const projectDir = findProjectDir();
  if (projectDir) {
    const filePath = await saveReference(projectDir, ref);
    process.stderr.write(`Reference saved: ${filePath}\n`);

    if (inject) {
      await injectToFingerprint(projectDir, ref);
      process.stderr.write("Injected into design fingerprint\n");
    }

    if (genTemplate) {
      const dir = join(projectDir, ".bwvi", "templates");
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
      const colors = Object.entries(ref.tokens.colors).slice(0, 4);
      const palette = colors.map(([k, v]) => `    ${k}: "${v}"`).join(",\n");
      const template = `// Template seed generated from ${url}
// School: ${ref.detectedSchool}, Confidence: ${ref.confidence}
const seed = {
  direction: "${ref.detectedSchool}",
  palette: {
${palette}
  },
  typography: {
    display: "${ref.tokens.typography.display || ""}",
    body: "${ref.tokens.typography.body || ""}",
  },
  sections: ["hero", "features", "cta", "footer"],
};
export default seed;
`;
      const slug = ref.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30) || "learned";
      const templatePath = join(dir, `${slug}.ts`);
      writeFileSync(templatePath, template, "utf-8");
      process.stderr.write(`Template seed generated: ${templatePath}\n`);
    }
  }

  console.log(JSON.stringify({
    title: ref.title,
    source: ref.source,
    detected_school: ref.detectedSchool,
    confidence: ref.confidence,
    tags: ref.tags,
    template_generated: genTemplate,
    extracted: {
      colors: Object.keys(ref.tokens.colors).length,
      fonts: [ref.tokens.typography.display, ref.tokens.typography.body].filter(Boolean).length,
      grid_patterns: ref.tokens.layout.gridPatterns.length,
    },
    tokens: {
      colors: Object.fromEntries(Object.entries(ref.tokens.colors).slice(0, 6)),
      typography: ref.tokens.typography,
    },
  }, null, 2));
}

function findProjectDir(): string | null {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    if (existsSync(join(dir, ".bwvi"))) return dir;
    const parent = join(dir, "..");
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}
