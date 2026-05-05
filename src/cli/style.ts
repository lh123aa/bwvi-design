import { getStyle, searchStyles, listStyles } from "../engine/style-systems.js";

export async function styleCommand(args: string[]) {
  const sub = args[0];

  if (sub === "list" || !sub) {
    const styles = listStyles();
    console.log(JSON.stringify({ styles, count: styles.length, usage: "bwvi style show <id> ｜ bwvi style search <query>" }, null, 2));
    return;
  }

  if (sub === "show") {
    const id = args[1];
    if (!id) { console.error(JSON.stringify({ error: "请提供风格 ID" })); process.exit(1); }
    const style = getStyle(id);
    if (!style) { console.error(JSON.stringify({ error: `未找到风格: ${id}` })); process.exit(1); }
    console.log(JSON.stringify(style, null, 2));
    return;
  }

  if (sub === "search") {
    const query = args.slice(1).join(" ");
    if (!query) { console.error(JSON.stringify({ error: "请提供搜索关键词" })); process.exit(1); }
    const results = searchStyles(query);
    console.log(JSON.stringify({ query, results, count: results.length }, null, 2));
    return;
  }

  console.error(JSON.stringify({ error: "用法: bwvi style <list|show|search> [参数]" }));
  process.exit(1);
}
