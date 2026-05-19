/**
 * skill.ts — bwvi skill 命令
 *
 * 管理 YAML 技能文件（list / search / show / stats）
 *
 * v0.5.0 新增
 */

import {
  loadAllSkills,
  searchSkills,
  findSkillById,
  getSkillsByCategory,
  listCategories,
  getSkillStats,
} from "../engine/skill-loader.js";

export function skillCommand(args: string[]) {
  const subcommand = args[0] || "list";

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`bwvi skill <subcommand> [options]

管理设计技能模板（YAML 文件系统）

子命令:
  list         列出所有技能（可选 --category=landing|deck|social|office）
  search <q>   搜索技能名称/关键词
  show <id>    查看技能详情
  stats        技能统计信息
  categories   列出所有分类
  clear-cache  清除加载缓存

示例:
  bwvi skill list
  bwvi skill list --category=deck
  bwvi skill search 咖啡
  bwvi skill show landing-cafe
  bwvi skill stats
  bwvi skill categories`);
    return;
  }

  switch (subcommand) {
    case "list":
      return cmdList(args);
    case "search":
      return cmdSearch(args);
    case "show":
      return cmdShow(args);
    case "stats":
      return cmdStats();
    case "categories":
      return cmdCategories();
    case "clear-cache":
      return cmdClearCache();
    default:
      console.error(`未知子命令: ${subcommand}。可用: list, search, show, stats, categories, clear-cache`);
      process.exit(1);
  }
}

function cmdList(args: string[]) {
  const catFlag = args.find((a) => a.startsWith("--category="));
  const cat = catFlag ? catFlag.split("=")[1] : null;

  const skills = cat ? getSkillsByCategory(cat) : loadAllSkills();

  if (skills.length === 0) {
    console.log(JSON.stringify({ skills: [], total: 0, category: cat || "all" }, null, 2));
    return;
  }

  const summary = skills.map((s) => ({
    id: s.id,
    name: s.name,
    emoji: s.emoji || "",
    category: s.category,
    direction: s.direction,
    dark: s.dark || false,
    industryCount: s.industry.length,
  }));

  const result = {
    skills: summary,
    total: skills.length,
    category: cat || "all",
  };

  console.log(JSON.stringify(result, null, 2));
}

function cmdSearch(args: string[]) {
  const query = args.find((a) => !a.startsWith("--"));
  if (!query || query === "search") {
    console.error("请提供搜索关键词。用法: bwvi skill search <query>");
    process.exit(1);
  }

  const results = searchSkills(query);
  if (results.length === 0) {
    console.log(JSON.stringify({ query, results: [], total: 0 }));
    return;
  }

  console.log(
    JSON.stringify(
      {
        query,
        total: results.length,
        results: results.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          direction: s.direction,
          emoji: s.emoji || "",
        })),
      },
      null,
      2,
    ),
  );
}

function cmdShow(args: string[]) {
  const id = args.find((a) => !a.startsWith("--") && a !== "show");
  if (!id) {
    console.error("请提供技能 ID。用法: bwvi skill show <id>");
    process.exit(1);
  }

  const skill = findSkillById(id);
  if (!skill) {
    console.error(`未找到技能: ${id}`);
    process.exit(1);
  }

  console.log(JSON.stringify(skill, null, 2));
}

function cmdStats() {
  const stats = getSkillStats();
  console.log(
    JSON.stringify(
      {
        total: stats.total,
        byCategory: stats.byCategory,
        categories: listCategories(),
      },
      null,
      2,
    ),
  );
}

function cmdCategories() {
  const cats = listCategories();
  console.log(JSON.stringify({ categories: cats, count: cats.length }, null, 2));
}

function cmdClearCache() {
  // 重新 import 清除缓存
  const mod = require("../engine/skill-loader.js") as typeof import("../engine/skill-loader.js");
  mod.clearCache();
  console.log(JSON.stringify({ status: "ok", message: "技能缓存已清除" }));
}
