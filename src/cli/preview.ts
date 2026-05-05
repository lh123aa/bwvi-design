import { getStyle, type StyleSystem } from "../engine/style-systems.js";
import { Navbar, Hero, FeatureGrid, StatsGrid, TestimonialGrid, CTASection, Footer, Card, PriceCard, Form, StatsCounter, Timeline, getBaseStyles } from "../templates/components.js";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getDemoDir } from "./demo.js";

function resolveStyle(args: string[]): StyleSystem {
  const id = args.find(x => x.startsWith("--style="))?.split("=")[1] || "minimal-white";
  return getStyle(id) || getStyle("minimal-white")!;
}

const COMPONENTS: Record<string, (args: string[]) => void> = {
  navbar: (a) => {
    const s = resolveStyle(a);
    const html = Navbar({ palette: s.palette, fontDisplay: s.typography.display, animation: true, logo: "Brand", links: [{label:"Home",href:"#"},{label:"About",href:"#"},{label:"Contact",href:"#"}], cta: "Get Started", style: (a.includes("--transparent") ? "transparent" : a.includes("--centered") ? "centered" : "default") });
    outputHtml(html, s, "navbar");
  },
  hero: (a) => {
    const s = resolveStyle(a);
    const v = a.find(x => x.startsWith("--variant="))?.split("=")[1] || "centered";
    const html = Hero({ palette: s.palette, fontDisplay: s.typography.display, animation: true, title: "Your Hero Title", subtitle: "A compelling subtitle describing your value.", cta: "Get Started", variant: v as any });
    outputHtml(html, s, `hero-${v}`);
  },
  features: (a) => {
    const s = resolveStyle(a);
    const v = a.find(x => x.startsWith("--variant="))?.split("=")[1] || "grid";
    const html = FeatureGrid({ palette: s.palette, fontDisplay: s.typography.display, animation: true, items: [{icon:"⚡",title:"Fast",desc:"Lightning performance."},{icon:"🔒",title:"Secure",desc:"Enterprise grade."},{icon:"🎨",title:"Beautiful",desc:"Pixel perfect."}], variant: v as any });
    outputHtml(html, s, `features-${v}`);
  },
};

export async function previewCommand(args: string[]) {
  const name = args.find(a => !a.startsWith("--"));
  if (!name || !COMPONENTS[name]) {
    console.error(JSON.stringify({ error: "未知组件", available: Object.keys(COMPONENTS), usage: "bwvi preview <component> [--variant=] [--style=]" }));
    process.exit(1);
  }
  COMPONENTS[name](args);
}

function outputHtml(body: string, style: StyleSystem, name: string) {
  const styles = getBaseStyles({ palette: style.palette, fontDisplay: style.typography.display, animation: true });
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Preview: ${name}</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:system-ui,sans-serif}${styles}</style></head><body>${body}</body></html>`;
  const filePath = join(getDemoDir(), `preview-${name}.html`);
  writeFileSync(filePath, html, "utf-8");
  console.log(JSON.stringify({ status: "ok", component: name, file: filePath }, null, 2));
}
