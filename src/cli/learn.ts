import { existsSync } from "node:fs";
import { join } from "node:path";
import { learnFromUrl, saveReference, injectToFingerprint } from "../engine/learner.js";

export async function learnCommand(args: string[]) {
  const url = args.find((a) => a.startsWith("http://") || a.startsWith("https://"));
  const inject = args.includes("--inject");

  if (!url) {
    console.error(JSON.stringify({ error: "请提供要学习的 URL", code: "MISSING_URL" }));
    console.error("Usage: bwvi learn <url> [--inject]");
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
  }

  console.log(JSON.stringify({
    title: ref.title,
    source: ref.source,
    detected_school: ref.detectedSchool,
    confidence: ref.confidence,
    tags: ref.tags,
    extracted: {
      colors: Object.keys(ref.tokens.colors).length,
      fonts: [ref.tokens.typography.display, ref.tokens.typography.body].filter(Boolean).length,
      grid_patterns: ref.tokens.layout.gridPatterns.length,
      google_fonts: ref.tokens.typography.googleFonts,
    },
    tokens: {
      colors: ref.tokens.colors,
      typography: ref.tokens.typography,
      layout: {
        grids: ref.tokens.layout.gridPatterns.slice(0, 3),
        gaps: ref.tokens.spacing.gapPatterns.slice(0, 3),
        radius: ref.tokens.radius.slice(0, 3),
      },
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
