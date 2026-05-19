import { getStyle, type StyleSystem } from "../engine/style-systems.js";
import { Navbar, Hero, FeatureGrid, StatsGrid, TestimonialGrid, CTASection, Footer, Card, PriceCard, Form, StatsCounter, Timeline, NavDrawer, getBaseStyles } from "../templates/components.js";
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
  stats: (a) => {
    const s = resolveStyle(a);
    const v = a.find(x => x.startsWith("--variant="))?.split("=")[1] || "grid";
    const html = StatsGrid({ palette: s.palette, animation: true, items: [{ num: "99%", label: "Uptime" }, { num: "10K+", label: "Users" }, { num: "50+", label: "Countries" }, { num: "4.9★", label: "Rating" }], variant: v as any });
    outputHtml(html, s, `stats-${v}`);
  },
  testimonials: (a) => {
    const s = resolveStyle(a);
    const html = TestimonialGrid({ palette: s.palette, animation: true, items: [
      { quote: "This product transformed how we work. Invaluable.", author: "Alice Chen", role: "CTO, TechCorp" },
      { quote: "Simple, elegant, and incredibly effective.", author: "Bob Martinez", role: "Design Lead" },
      { quote: "Best investment we made this year.", author: "Carol Williams", role: "Product Manager" },
    ]});
    outputHtml(html, s, "testimonials");
  },
  cta: (a) => {
    const s = resolveStyle(a);
    const html = CTASection({ palette: s.palette, animation: true, title: "Ready to Get Started?", subtitle: "Join thousands of happy customers using BWVI to create beautiful designs.", cta: "Start Free Trial" });
    outputHtml(html, s, "cta");
  },
  footer: (a) => {
    const s = resolveStyle(a);
    const style = a.includes("--minimal") ? "minimal" : "default";
    const html = Footer({ palette: s.palette, animation: true, description: "Building the future of design intelligence.", columns: [{ title: "Product", links: [{ label: "Features", href: "#" }, { label: "Pricing", href: "#" }] }, { title: "Company", links: [{ label: "About", href: "#" }, { label: "Blog", href: "#" }] }], style: style as any });
    outputHtml(html, s, `footer-${style}`);
  },
  card: (a) => {
    const s = resolveStyle(a);
    const cardStyle = a.find(x => x.startsWith("--card-style="))?.split("=")[1] || "flat";
    const html = Card({ palette: s.palette, animation: true, title: "Design Intelligence", desc: "AI-powered design decisions that ensure every pixel has a purpose.", meta: "Updated 2 days ago", style: cardStyle as any });
    outputHtml(html, s, `card-${cardStyle}`);
  },
  pricecard: (a) => {
    const s = resolveStyle(a);
    const featured = a.includes("--featured");
    const html = PriceCard({ palette: s.palette, animation: true, name: "Pro Plan", price: featured ? "$29/mo" : "$19/mo", features: ["Unlimited projects", "Team collaboration", "Priority support", "Custom templates"], cta: featured ? "Start Free Trial" : "Get Started", featured });
    outputHtml(html, s, `pricecard${featured ? '-featured' : ''}`);
  },
  form: (a) => {
    const s = resolveStyle(a);
    const html = Form({ palette: s.palette, animation: true, fields: [{ label: "Name", type: "text", placeholder: "Your name" }, { label: "Email", type: "email", placeholder: "you@example.com" }, { label: "Message", type: "text", placeholder: "Your message" }], submit: "Send Message" });
    outputHtml(html, s, "form");
  },
  statscounter: (a) => {
    const s = resolveStyle(a);
    const html = StatsCounter({ palette: s.palette, animation: true, items: [{ value: "99", suffix: "%", label: "Uptime" }, { value: "10", suffix: "K+", label: "Users" }, { value: "50", suffix: "+", label: "Countries" }] });
    outputHtml(html, s, "statscounter");
  },
  timeline: (a) => {
    const s = resolveStyle(a);
    const html = Timeline({ palette: s.palette, animation: true, items: [
      { year: "2024", title: "Founded", desc: "BWVI was created to bridge AI and design." },
      { year: "2025", title: "Public Launch", desc: "First public release with 10 design directions." },
      { year: "2026", title: "v0.2 Release", desc: "56 visual styles, 115 brands, animation engine." },
    ]});
    outputHtml(html, s, "timeline");
  },
  navdrawer: (a) => {
    const s = resolveStyle(a);
    const html = NavDrawer({ palette: s.palette, animation: true, links: [{ label: "Home", href: "#" }, { label: "Features", href: "#" }, { label: "Pricing", href: "#" }, { label: "About", href: "#" }], cta: "Get Started" });
    outputHtml(html, s, "navdrawer");
  },
};

export async function previewCommand(args: string[]) {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(`bwvi preview <component> [options]

Preview a single UI component with live rendering.

Components:
  navbar        Navigation bar (--transparent, --centered)
  hero          Hero section (--variant=centered|fullscreen|split|editorial)
  features      Feature grid (--variant=grid|list|compact)
  stats         Statistics grid (--variant=grid|list|compact)
  testimonials  Customer testimonials
  cta           Call-to-action section
  footer        Page footer (--minimal)
  card          Content card (--card-style=flat|elevated|bordered)
  pricecard     Pricing card (--featured)
  form          Contact form
  statscounter  Animated statistics counter
  timeline      Timeline/history
  navdrawer     Mobile navigation drawer

Options:
  --style=<id>  Visual style (default: minimal-white)
  --variant=<v> Component variant (varies by component)
  --dark        Dark mode

Examples:
  bwvi preview hero --variant=split --style=glassmorphism
  bwvi preview stats --variant=compact --dark`);
    return;
  }
  const name = args.find(a => !a.startsWith("--"));
  if (!name || !COMPONENTS[name]) {
    console.error(JSON.stringify({ error: "未知组件", available: Object.keys(COMPONENTS), usage: "bwvi preview <component> [--variant=] [--style=] [--transparent] [--centered] [--featured] [--minimal] [--card-style=]" }));
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
