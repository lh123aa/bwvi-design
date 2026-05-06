import esbuild from "esbuild";
import { readFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf-8"));
const external = ["playwright", "playwright-core"];

async function main() {
  const start = Date.now();
  await esbuild.build({ entryPoints: [join(root, "src", "index.ts")], bundle: true, platform: "node", target: "node20", format: "esm", outfile: join(root, "dist", "bwvi.mjs"), external, banner: { js: "// BWVI v" + pkg.version }, tsconfig: join(root, "tsconfig.json") });
  await esbuild.build({ entryPoints: [join(root, "src", "index.ts")], bundle: true, platform: "node", target: "node20", format: "cjs", outfile: join(root, "dist", "bwvi.cjs"), external, banner: { js: "// BWVI v" + pkg.version }, tsconfig: join(root, "tsconfig.json") });
  console.log("BWVI bundled in " + ((Date.now() - start) / 1000).toFixed(1) + "s");
  for (const f of ["bwvi.mjs", "bwvi.cjs"]) { console.log("  " + f + ": " + (statSync(join(root, "dist", f)).size / 1024).toFixed(0) + " KB"); }
}
main().catch((e) => { console.error(e.message); process.exit(1); });
