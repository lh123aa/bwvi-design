import { findBlueprint, fillBlueprint, type BlueprintSection } from "../templates/content-presets.js";
import type { HeroVariant, GridVariant } from "../templates/components.js";
import { getStyle, recommendStyle } from "./style-systems.js";
import { analyzeHtmlForImages, resolveImages } from "./imager.js";
import { getBaseStyles, Navbar, Hero, StatsGrid, FeatureGrid, TestimonialGrid, CTASection, Footer, StatsCounter, Timeline, PriceCard, Form } from "../templates/components.js";
import { wrapWithDevice, type DeviceType } from "../frames/index.js";
import { getStateMachineScript } from "../frames/state-machine.js";
import { getBrand } from "./brand-loader.js";

const DIRECTION_PALETTES: Record<string, { primary: string; accent: string; surface: string; text: string }> = {
  "editorial-monocle": { primary: "#1A1A2E", accent: "#C44536", surface: "#FAF8F5", text: "#2D2D2D" },
  "warm-minimal":      { primary: "#D97757", accent: "#8C6E5D", surface: "#FDF8F5", text: "#3D3D3D" },
  "tech-utility":      { primary: "#1E1E2E", accent: "#00E698", surface: "#FAFBFC", text: "#24292E" },
  "dark-luxury":       { primary: "#0D0D0D", accent: "#C9A84C", surface: "#1A1A1A", text: "#E8E8E8" },
  "playful-color":     { primary: "#FF6B6B", accent: "#4ECDC4", surface: "#FFF8F0", text: "#2C3E50" },
  "corporate-trust":   { primary: "#2563EB", accent: "#059669", surface: "#F8FAFC", text: "#1E293B" },
  "luxury-premium":    { primary: "#1C1917", accent: "#D6A354", surface: "#FAF9F7", text: "#292524" },
  "nature-organic":    { primary: "#2D6A4F", accent: "#95B46A", surface: "#F6F7F4", text: "#1B2F22" },
  "tech-gradient":     { primary: "#6C3BD6", accent: "#00D4AA", surface: "#FAFBFF", text: "#1A1A2E" },
  "minimal-white":     { primary: "#18181B", accent: "#F43F5E", surface: "#FAFAFA", text: "#09090B" },
};

const DIRECTION_FONTS: Record<string, string> = {
  "editorial-monocle": "'Georgia', 'Times New Roman', serif",
  "warm-minimal":      "'Georgia', 'Times New Roman', serif",
  "tech-utility":      "'Inter', system-ui, -apple-system, sans-serif",
  "dark-luxury":       "'Inter', 'Helvetica Neue', sans-serif",
  "playful-color":     "'DM Sans', system-ui, sans-serif",
  "corporate-trust":   "'Inter', 'SF Pro', system-ui, sans-serif",
  "luxury-premium":    "'Playfair Display', 'Georgia', serif",
  "nature-organic":    "'DM Sans', system-ui, sans-serif",
  "tech-gradient":     "'Space Grotesk', system-ui, sans-serif",
  "minimal-white":     "'Inter', -apple-system, sans-serif",
};

export interface PageBuildOptions {
  task: string;
  direction?: string;
  brand?: string;
  device?: DeviceType;
  orientation?: "portrait" | "landscape";
  dark?: boolean;
  interactive?: boolean;
  styleId?: string;
  aiImages?: boolean;
}

export interface PageBuildResult {
  html: string;
  blueprintId: string;
  direction: string;
  brandUsed: string | null;
  matchConfidence: number;
}

export function buildPage(opts: PageBuildOptions): PageBuildResult {
  const { blueprint, confidence } = findBlueprint(opts.task);
  const direction = opts.direction || blueprint.direction;
  let palette = DIRECTION_PALETTES[direction] || DIRECTION_PALETTES["tech-utility"];
  let fontStack = DIRECTION_FONTS[direction] || DIRECTION_FONTS["tech-utility"];
  const isDark = opts.dark || blueprint.dark || false;

  // Apply style system if specified
  const style = opts.styleId ? getStyle(opts.styleId) : null;
  if (style) {
    palette = style.palette;
    fontStack = style.typography.display;
  }

  // AI image generation placeholder (requires configured API key)
  if (opts.aiImages) {
    try {
      const specs = analyzeHtmlForImages("");
      resolveImages(specs).catch(() => {}); // async, fire and forget
    } catch {}
  }

  let brandName = opts.brand || extractBrand(opts.task);
  let tagline = extractTagline(opts.task, blueprint);
  let description = extractDescription(opts.task);

  // Apply brand colors if brand matches
  if (brandName && !opts.brand) {
    const brand = getBrand(brandName.toLowerCase());
    if (brand) {
      brandName = brand.name;
    }
  }

  const filled = fillBlueprint(blueprint, brandName, tagline, description);
  const base = { palette: { ...palette, muted: palette.text + "88" }, fontDisplay: fontStack, animation: true, dark: isDark };
  const styles = getBaseStyles(base);

  const sections = filled.sections.map((s) => renderSection(s, base)).join("\n");

  const headScript = opts.interactive ? getStateMachineScript() : "";
  const themeAttr = isDark ? ' data-theme="dark"' : '';

  let html = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(brandName)} — ${escapeHtml(tagline)}</title>
${headScript}
<style>
:root{--color-primary:${palette.primary};--color-accent:${palette.accent};--color-surface:${palette.surface};--color-text:${palette.text};--font-display:${fontStack};--font-body:system-ui,-apple-system,sans-serif}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font-body);color:var(--color-text);background:${isDark ? '#111' : palette.surface};-webkit-font-smoothing:antialiased}
${styles}
${isDark ? `[data-theme="dark"] body{background:#111;color:#e0e0e0}` : ''}
</style></head><body>
<div${themeAttr} style="font-family:system-ui,-apple-system,sans-serif;color:${palette.text};background:${isDark ? '#111' : palette.surface}">
${sections}
</div>
</body></html>`;

  if (opts.device) {
    html = wrapWithDevice(html, opts.device, opts.orientation, `${brandName} — ${tagline}`);
  }

  return { html, blueprintId: blueprint.id, direction, brandUsed: brandName, matchConfidence: confidence };
}

function renderSection(section: BlueprintSection, base: any): string {
  const cfg = { ...base, ...section.data } as any;
  switch (section.type) {
    case "navbar": return Navbar({ ...base, logo: cfg.logo, links: cfg.links, cta: cfg.cta, style: (section.variant as any) || "default" });
    case "hero": return Hero({ ...base, title: cfg.title, subtitle: cfg.subtitle, cta: cfg.cta, variant: (section.variant as HeroVariant) || "centered" });
    case "features": return FeatureGrid({ ...base, items: cfg.items, variant: (section.variant as GridVariant) || "grid" });
    case "stats": return StatsGrid({ ...base, items: cfg.items, variant: (section.variant as GridVariant) || "grid" });
    case "testimonials": return TestimonialGrid({ ...base, items: cfg.items, variant: (section.variant as GridVariant) || "grid" });
    case "cta": return CTASection({ ...base, title: cfg.title, subtitle: cfg.subtitle, cta: cfg.cta });
    case "footer": return Footer({ ...base, description: cfg.description, columns: cfg.columns, style: (section.variant as any) || "default" });
    case "pricing": return PriceCard({ ...base, name: cfg.name, price: cfg.price, features: cfg.features, cta: cfg.cta, featured: cfg.featured });
    case "timeline": return Timeline({ ...base, items: cfg.items });
    case "form": return Form({ ...base, fields: cfg.fields, submit: cfg.submit });
    case "stats_counter": return StatsCounter({ ...base, items: cfg.items });
    default: return "";
  }
}

function extractBrand(task: string): string {
  // 1. Try to find an existing brand name in the task
  const clean = task.replace(/--?\w+(=\w+)?/g, "").trim();
  const lowerTask = clean.toLowerCase();
  const brandNames = ["linear","stripe","vercel","github","apple","google","notion","figma","shopify","spotify",
    "airbnb","tesla","nike","ibm","nvidia","claude","cursor","supabase","docker","slack","coinbase","starbucks",
    "coca-cola","amazon","netflix","twitter","linkedin","adobe","canva","duolingo","peloton","headspace"];
  for (const name of brandNames) {
    if (lowerTask.includes(name)) return name;
  }

  // 2. Extract first meaningful word as brand name
  const words = clean.split(/\s+/).filter(w => w.length > 1 && !/^(landing|page|app|website|site|homepage)$/i.test(w));
  if (words.length <= 2) return words[0] || "Brand";
  const startIdx = Math.max(0, Math.floor(words.length / 2) - 1);
  return words.slice(startIdx, startIdx + 2).join(" ") || "Brand";
}

function extractTagline(task: string, blueprint: any): string {
  // Try to extract a meaningful phrase from the task description
  const words = task.split(/\s+/).filter(w => w.length > 2 && !w.startsWith("--"));
  if (words.length >= 3) {
    const candidate = words.slice(1, 3).join(" ");
    if (candidate.length < 40) return candidate.charAt(0).toUpperCase() + candidate.slice(1);
  }

  // Fallback: blueprint-specific defaults
  const taglines: Record<string, string> = {
    "landing-saas": "Build Faster",
    "landing-cafe": "Perfect Brew",
    "landing-cosmetics": "Feels as Good as It Looks",
    "landing-fitness": "Transform Your Body",
    "landing-education": "Learn Anything",
    "landing-fashion": "Define Your Style",
    "landing-fintech": "Grow Your Wealth",
    "landing-ecommerce": "Your Style, Delivered",
    "landing-restaurant": "Taste the Difference",
    "landing-realestate": "Find Your Home",
    "landing-photography": "Capture the Moment",
    "landing-music": "Feel the Beat",
  };
  return taglines[blueprint.id] || "Go Beyond";
}

function extractDescription(task: string): string {
  const words = task.split(/\s+/).filter(w => !w.startsWith("--"));
  if (words.length > 3) return words.slice(2).join(" ") || "Premium quality designed for modern needs.";
  return "Premium quality designed for modern needs.";
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Re-export for generate.ts
export { DIRECTION_PALETTES, DIRECTION_FONTS };
