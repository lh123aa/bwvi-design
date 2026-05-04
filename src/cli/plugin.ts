import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const PLUGIN_TEMPLATE = `name: my-bwvi-plugin
version: "0.1.0"
description: "Describe your plugin here"
hooks:
  - "post_analyze"
  - "pre_generate"
provides:
  - "tool:custom_command"
`;

export async function pluginInitCommand(args: string[]) {
  const name = args[0] || "my-plugin";
  const dir = join(process.cwd(), name);

  if (existsSync(dir)) {
    console.error(JSON.stringify({ error: `目录已存在: ${name}` }));
    process.exit(1);
  }

  mkdirSync(dir, { recursive: true });
  mkdirSync(join(dir, "src"), { recursive: true });

  // Plugin manifest
  writeFileSync(join(dir, "manifest.yaml"), PLUGIN_TEMPLATE, "utf-8");

  // Starter source
  writeFileSync(join(dir, "src", "index.ts"), `export function register(api: any) {
  // Register your tools here
  // api.registerTool("my_tool", async (args) => { ... });
  console.log("Plugin loaded: ${name}");
};\n`, "utf-8");

  // Package.json
  writeFileSync(join(dir, "package.json"), JSON.stringify({
    name, version: "0.1.0", private: true,
    description: "BWVI plugin",
    main: "src/index.ts",
    bwvi: { manifest: "manifest.yaml" },
  }, null, 2) + "\n", "utf-8");

  // README
  writeFileSync(join(dir, "README.md"), `# ${name}\n\nBWVI Plugin. See manifest.yaml for configuration.\n`, "utf-8");

  console.log(JSON.stringify({
    status: "ok",
    plugin: name,
    path: dir,
    files: ["manifest.yaml", "src/index.ts", "package.json", "README.md"],
    next: "cd " + name + " && bwvi plugin install .",
  }, null, 2));
}
