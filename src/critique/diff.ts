import { readFileSync } from "node:fs";

export async function critiqueDiff(v1Html: string, v2Path: string) {
  let v2Html: string;
  try {
    v2Html = readFileSync(v2Path, "utf-8");
  } catch {
    return { error: `无法读取: ${v2Path}` };
  }

  const v1Tags = (v1Html.match(/<\w+/g) || []).length;
  const v2Tags = (v2Html.match(/<\w+/g) || []).length;
  const v1Words = v1Html.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;
  const v2Words = v2Html.replace(/<[^>]+>/g, "").split(/\s+/).filter(Boolean).length;

  const changes: string[] = [];
  if (v1Tags !== v2Tags) changes.push(`标签数: ${v1Tags} → ${v2Tags}`);
  if (Math.abs(v1Words - v2Words) / Math.max(v1Words, 1) > 0.2) changes.push(`内容量: ${v1Words} → ${v2Words} 词`);

  return {
    diff: true,
    v1: { tags: v1Tags, words: v1Words, size: v1Html.length },
    v2: { tags: v2Tags, words: v2Words, size: v2Html.length },
    changes,
    assessment: changes.length === 0 ? "minor" : "significant",
  };
}
