export interface BrandSystem {
  name: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
    surface: string;
    text: string;
    muted: string;
  };
  typography: {
    display: string;
    body: string;
    mono?: string;
  };
  spacing?: {
    unit: number;
    grid: number;
  };
  tone?: string;
  tags: string[];
}

const BRANDS: BrandSystem[] = [
  { name: "linear", description: "Linear — Modern issue tracking", colors: { primary: "#5E6AD2", accent: "#E2E8F0", surface: "#FFFFFF", text: "#1A202C", muted: "#718096" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", mono: "'SF Mono', 'Cascadia Code', monospace" }, spacing: { unit: 8, grid: 24 }, tone: "clean, minimal, B2B", tags: ["tech", "B2B", "minimal", "developer"] },
  { name: "stripe", description: "Stripe — Online payment infrastructure", colors: { primary: "#635BFF", accent: "#00D4AA", surface: "#FFFFFF", text: "#1A1F36", muted: "#6B7C93" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "professional, trustworthy, fintech", tags: ["tech", "fintech", "payment", "B2B"] },
  { name: "vercel", description: "Vercel — Deploy frontends", colors: { primary: "#000000", accent: "#0070F3", surface: "#FFFFFF", text: "#000000", muted: "#888888" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", mono: "'SF Mono', monospace" }, spacing: { unit: 8, grid: 24 }, tone: "bold, minimal, developer-first", tags: ["tech", "developer", "deploy", "frontend"] },
  { name: "apple", description: "Apple — Consumer electronics", colors: { primary: "#1D1D1F", accent: "#0071E3", surface: "#FBFBFD", text: "#1D1D1F", muted: "#86868B" }, typography: { display: "'SF Pro Display', system-ui, sans-serif", body: "'SF Pro Text', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "premium, minimal, aspirational", tags: ["tech", "consumer", "premium", "design"] },
  { name: "notion", description: "Notion — All-in-one workspace", colors: { primary: "#000000", accent: "#E16259", surface: "#FFFFFF", text: "#37352F", muted: "#9B9A97" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "clean, friendly, productive", tags: ["tech", "productivity", "workspace", "B2B"] },
  { name: "airbnb", description: "Airbnb — Travel marketplace", colors: { primary: "#FF5A5F", accent: "#00A699", surface: "#FFFFFF", text: "#484848", muted: "#767676" }, typography: { display: "'Circular', system-ui, sans-serif", body: "'Circular', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "friendly, warm, adventurous", tags: ["travel", "marketplace", "consumer", "hospitality"] },
  { name: "figma", description: "Figma — Collaborative design tool", colors: { primary: "#1E1E1E", accent: "#F24E1E", surface: "#FFFFFF", text: "#2C2C2C", muted: "#7C7C7C" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "creative, collaborative, modern", tags: ["tech", "design", "collaboration", "B2B"] },
  { name: "supabase", description: "Supabase — Open source backend", colors: { primary: "#18181B", accent: "#3ECF8E", surface: "#FAFAFA", text: "#18181B", muted: "#71717A" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", mono: "'JetBrains Mono', monospace" }, spacing: { unit: 8, grid: 24 }, tone: "open, modern, developer-friendly", tags: ["tech", "database", "open-source", "backend"] },
  { name: "cursor", description: "Cursor — AI code editor", colors: { primary: "#1A1A2E", accent: "#E2B714", surface: "#FAFAFA", text: "#1A1A2E", muted: "#6B7280" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", mono: "'JetBrains Mono', monospace" }, spacing: { unit: 8, grid: 24 }, tone: "AI-first, modern, developer", tags: ["tech", "AI", "editor", "developer"] },
  { name: "shopify", description: "Shopify — E-commerce platform", colors: { primary: "#008060", accent: "#95BF47", surface: "#FFFFFF", text: "#212326", muted: "#6B7177" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "friendly, entrepreneurial, trustworthy", tags: ["ecommerce", "retail", "B2B", "shop"] },
  { name: "spotify", description: "Spotify — Music streaming", colors: { primary: "#1DB954", accent: "#191414", surface: "#FFFFFF", text: "#191414", muted: "#535353" }, typography: { display: "'Circular', system-ui, sans-serif", body: "'Circular', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "energetic, youthful, creative", tags: ["music", "streaming", "consumer", "entertainment"] },
  { name: "coinbase", description: "Coinbase — Cryptocurrency exchange", colors: { primary: "#0052FF", accent: "#1652F0", surface: "#FFFFFF", text: "#1A1A1A", muted: "#5B616E" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", mono: "'SF Mono', monospace" }, spacing: { unit: 8, grid: 24 }, tone: "trustworthy, modern, fintech", tags: ["crypto", "fintech", "exchange", "B2C"] },
  { name: "tesla", description: "Tesla — Electric vehicles & energy", colors: { primary: "#E82127", accent: "#000000", surface: "#FFFFFF", text: "#181818", muted: "#666666" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "bold, innovative, premium", tags: ["automotive", "energy", "tech", "premium"] },
  { name: "nike", description: "Nike — Athletic footwear & apparel", colors: { primary: "#000000", accent: "#FFFFFF", surface: "#FFFFFF", text: "#111111", muted: "#757575" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "bold, athletic, aspirational", tags: ["sportswear", "fashion", "consumer", "athletic"] },
  { name: "ibm", description: "IBM — Enterprise technology", colors: { primary: "#0062FF", accent: "#121619", surface: "#F6F7F9", text: "#121619", muted: "#6C7278" }, typography: { display: "'IBM Plex Sans', system-ui, sans-serif", body: "'IBM Plex Sans', system-ui, sans-serif", mono: "'IBM Plex Mono', monospace" }, spacing: { unit: 8, grid: 24 }, tone: "professional, enterprise, trustworthy", tags: ["tech", "enterprise", "B2B", "cloud"] },
  { name: "nvidia", description: "NVIDIA — AI computing", colors: { primary: "#76B900", accent: "#000000", surface: "#FFFFFF", text: "#000000", muted: "#666666" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "innovative, powerful, tech", tags: ["tech", "AI", "GPU", "computing"] },
  { name: "miro", description: "Miro — Online whiteboard", colors: { primary: "#FFD02F", accent: "#0500FF", surface: "#FFFFFF", text: "#1A1A1A", muted: "#7C7C7C" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "creative, collaborative, playful", tags: ["tech", "collaboration", "whiteboard", "B2B"] },
  { name: "framer", description: "Framer — Website builder", colors: { primary: "#222222", accent: "#7600FF", surface: "#FFFFFF", text: "#222222", muted: "#999999" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "creative, modern, design-focused", tags: ["tech", "website", "design", "no-code"] },
  { name: "posthog", description: "PostHog — Product analytics", colors: { primary: "#1D1D1D", accent: "#F54E00", surface: "#F8F9FA", text: "#1D1DA0", muted: "#6B7280" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", mono: "'SF Mono', monospace" }, spacing: { unit: 8, grid: 24 }, tone: "open, developer-friendly, analytical", tags: ["tech", "analytics", "product", "B2B"] },
  { name: "cal", description: "Cal.com — Scheduling infrastructure", colors: { primary: "#111111", accent: "#00A86B", surface: "#FAFAFA", text: "#111111", muted: "#6B7280" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "clean, open, efficient", tags: ["tech", "scheduling", "open-source", "B2B"] },
  { name: "sanity", description: "Sanity — Structured content platform", colors: { primary: "#F3642C", accent: "#000000", surface: "#FFFFFF", text: "#1A1A1A", muted: "#8C8C8C" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "modern, developer-friendly, content-first", tags: ["tech", "CMS", "content", "B2B"] },
  { name: "replicate", description: "Replicate — AI model deployment", colors: { primary: "#1A1A2E", accent: "#D946EF", surface: "#FAFAFA", text: "#1A1A2E", muted: "#6B7280" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", mono: "'JetBrains Mono', monospace" }, spacing: { unit: 8, grid: 24 }, tone: "AI-first, creative, developer", tags: ["tech", "AI", "ML", "developer"] },
  { name: "raycast", description: "Raycast — Developer productivity", colors: { primary: "#FF6363", accent: "#1A1A1A", surface: "#FFFFFF", text: "#1A1A1A", muted: "#7C7C7C" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", mono: "'SF Mono', monospace" }, spacing: { unit: 8, grid: 24 }, tone: "developer-friendly, efficient, modern", tags: ["tech", "productivity", "developer", "macOS"] },
  { name: "intercom", description: "Intercom — Customer messaging", colors: { primary: "#1E1E1E", accent: "#6F2DA8", surface: "#FFFFFF", text: "#1E1E1E", muted: "#6E6E6E" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "professional, helpful, B2B", tags: ["tech", "CRM", "messaging", "B2B"] },
  { name: "zapier", description: "Zapier — Workflow automation", colors: { primary: "#FF4A00", accent: "#4A4A4A", surface: "#FFFFFF", text: "#1A1A1A", muted: "#8C8C8C" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "friendly, efficient, accessible", tags: ["tech", "automation", "B2B", "productivity"] },
  { name: "webflow", description: "Webflow — Visual web development", colors: { primary: "#146EF5", accent: "#000000", surface: "#FFFFFF", text: "#1A1A1A", muted: "#6E6E6E" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "creative, modern, no-code", tags: ["tech", "web", "design", "no-code"] },
  { name: "sentry", description: "Sentry — Error monitoring", colors: { primary: "#362D59", accent: "#FB4226", surface: "#FFFFFF", text: "#1A1A2E", muted: "#8C8C8C" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif", mono: "'SF Mono', monospace" }, spacing: { unit: 8, grid: 24 }, tone: "developer-focused, reliable, technical", tags: ["tech", "monitoring", "debug", "B2B"] },
  { name: "claude", description: "Claude — AI assistant by Anthropic", colors: { primary: "#CC4C39", accent: "#1A1A1A", surface: "#FCFCFC", text: "#1A1A1A", muted: "#6B7280" }, typography: { display: "'Inter', system-ui, sans-serif", body: "'Inter', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "thoughtful, careful, helpful", tags: ["tech", "AI", "assistant", "language"] },
  { name: "xiaohongshu", description: "Xiaohongshu — Social commerce platform", colors: { primary: "#FF2442", accent: "#000000", surface: "#FFFFFF", text: "#1A1A1A", muted: "#999999" }, typography: { display: "'PingFang SC', system-ui, sans-serif", body: "'PingFang SC', system-ui, sans-serif" }, spacing: { unit: 8, grid: 24 }, tone: "youthful, trendy, social", tags: ["social", "ecommerce", "lifestyle", "China"] },
];

export function getBrand(name: string): BrandSystem | null {
  const lower = name.toLowerCase();
  return BRANDS.find((b) => b.name === lower) || null;
}

export function searchBrands(query: string): BrandSystem[] {
  const lower = query.toLowerCase();
  return BRANDS.filter(
    (b) => b.name.includes(lower) || b.tags.some((t) => t.includes(lower)) || b.description.toLowerCase().includes(lower)
  );
}

export function listBrands(): { name: string; description: string; tags: string[] }[] {
  return BRANDS.map((b) => ({ name: b.name, description: b.description, tags: b.tags }));
}

export async function detectBrandFromUrl(url: string): Promise<BrandSystem | null> {
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const html = await resp.text();
    for (const brand of BRANDS) {
      const name = brand.name.toLowerCase();
      if (html.toLowerCase().includes(name) || html.includes(`"${brand.colors.primary}"`)) {
        return brand;
      }
    }
    return null;
  } catch {
    return null;
  }
}
