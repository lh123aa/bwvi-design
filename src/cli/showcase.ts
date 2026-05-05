import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { CheckpointManager } from "../checkpoint/manager.js";
import { buildPage } from "../engine/page-builder.js";
import { info, success, warn, errExit, result } from "./ux.js";
import { getDemoDir } from "./demo.js";

interface ShowcaseDef {
  id: string; label: string; desc: string; direction: string;
  palette: { primary: string; accent: string; surface: string; text: string };
  color: string[]; dark?: boolean; device?: string;
}

const SHOWCASES: ShowcaseDef[] = [
  {id:"landing-editorial",label:"产品落地页 · 编辑式克制",desc:"深蓝底色、暖红 accent、衬线 display",direction:"editorial-monocle",palette:{primary:"#1A1A2E",accent:"#C44536",surface:"#FAF8F5",text:"#2D2D2D"},color:["#1A1A2E","#C44536","#FAF8F5"]},
  {id:"landing-warm",label:"产品落地页 · 温暖极简",desc:"暖橙底色、棕褐 accent、米白基底",direction:"warm-minimal",palette:{primary:"#D97757",accent:"#8C6E5D",surface:"#FDF8F5",text:"#3D3D3D"},color:["#D97757","#8C6E5D","#FDF8F5"]},
  {id:"landing-dark",label:"产品落地页 · 深色科技",desc:"暗色基底、绿 accent、科技感",direction:"dark-luxury",palette:{primary:"#0D0D0D",accent:"#00E698",surface:"#1A1A1A",text:"#E8E8E8"},color:["#0D0D0D","#00E698","#1A1A1A"],dark:true},
  {id:"dashboard-clean",label:"Dashboard · 简洁数据",desc:"左导航栏、KPI 卡片、数据表格",direction:"tech-utility",palette:{primary:"#1E1E2E",accent:"#00E698",surface:"#FAFBFC",text:"#24292E"},color:["#1E1E2E","#00E698","#FAFBFC"],device:"browser"},
  {id:"app-ios",label:"App 原型 · iOS 风格",desc:"iPhone 设备框、tab bar、列表视图",direction:"warm-minimal",palette:{primary:"#D97757",accent:"#8C6E5D",surface:"#FFFFFF",text:"#1D1D1F"},color:["#D97757","#8C6E5D","#FFFFFF"],device:"iphone"},
  {id:"poster-magazine",label:"品牌海报 · 杂志风",desc:"大标题、衬线 display、克制 accent",direction:"editorial-monocle",palette:{primary:"#1A1A2E",accent:"#C44536",surface:"#FAF8F5",text:"#2D2D2D"},color:["#1A1A2E","#C44536","#FAF8F5"]},
  {id:"deck-pitch",label:"演示 Deck · 路演风",desc:"1920×1080 幻灯片、大字标题",direction:"dark-luxury",palette:{primary:"#0D0D0D",accent:"#C9A84C",surface:"#1A1A1A",text:"#E8E8E8"},color:["#0D0D0D","#C9A84C","#1A1A1A"],dark:true},
  {id:"playful-creative",label:"创意页面 · 多彩趣味",desc:"丰富色彩、有机形状、轻松感",direction:"playful-color",palette:{primary:"#FF6B6B",accent:"#4ECDC4",surface:"#FFF8F0",text:"#2C3E50"},color:["#FF6B6B","#4ECDC4","#FFF8F0"]},
  {id:"corporate-trust",label:"企业官网 · 专业信赖",desc:"蓝/灰配色、方正排版、专业感",direction:"corporate-trust",palette:{primary:"#2563EB",accent:"#059669",surface:"#F8FAFC",text:"#1E293B"},color:["#2563EB","#059669","#F8FAFC"]},
  {id:"luxury-premium",label:"奢侈品牌 · 高端质感",desc:"金/黑配色、衬线 display",direction:"luxury-premium",palette:{primary:"#1C1917",accent:"#D6A354",surface:"#FAF9F7",text:"#292524"},color:["#1C1917","#D6A354","#FAF9F7"]},
];

export async function showcaseCommand(args: string[]) {
  const pickIdx = args.findIndex((a) => a === "--pick" || a === "-p");
  const pickId = pickIdx >= 0 ? args[pickIdx + 1] : null;

  if (pickId) {
    const sc = SHOWCASES.find((s) => s.id === pickId);
    if (!sc) errExit("未找到 showcase: " + pickId + "，可选: " + SHOWCASES.map(s => s.id).join(", "));

    const task = sc.label + " " + sc.desc;
    const pageResult = buildPage({ task, direction: sc.direction, device: sc.device as any, dark: sc.dark });
    const htmlPath = join(getDemoDir(), `showcase-${sc.id}.html`);
    writeFileSync(htmlPath, pageResult.html, "utf-8");

    const projectDir = findProjectDir();
    if (projectDir) {
      const cp = new CheckpointManager(projectDir);
      await cp.save({ id:`dec_direction_${Date.now()}`, type:"direction", inputs:{task:sc.label}, output:{school:sc.direction,showcase_id:sc.id}, tokens:{"--color-primary":sc.palette.primary,"--color-accent":sc.palette.accent}, rationale:`用户选择了: ${sc.label}`, confidence:0.7, made_by:"user", confirmed_by:"user", created_at:new Date().toISOString() });
    }

    result({ status:"ok", selected:sc.id, label:sc.label, direction:sc.direction, palette:sc.palette, device:sc.device||"none", dark:sc.dark||false, html:htmlPath, decision_saved:!!projectDir, blueprint:pageResult.blueprintId });
    success("已生成: " + htmlPath);
    return;
  }

  console.log(JSON.stringify({ showcases: SHOWCASES.map(s => ({ id:s.id, label:s.label, desc:s.desc, colors:s.color, device:s.device||null, dark:s.dark||false })), usage:"bwvi showcase --pick <id>" }, null, 2));
}

function findProjectDir(): string | null {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) { if (existsSync(join(dir, ".bwvi"))) return dir; const p = join(dir,".."); if (p===dir) break; dir = p; }
  return null;
}
