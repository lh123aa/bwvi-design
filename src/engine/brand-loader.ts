export interface BrandSystem {
  name: string;
  description: string;
  colors: { primary: string; accent: string; surface: string; text: string; muted: string };
  typography: { display: string; body: string; mono?: string };
  category: string;
  tags: string[];
}

type B = BrandSystem;
function b(name: string, desc: string, p: string, a: string, s: string, t: string, m: string, fd: string, fb: string, cat: string, ...tags: string[]): B {
  return { name, description: desc, colors: { primary: p, accent: a, surface: s, text: t, muted: m }, typography: { display: fd, body: fb }, category: cat, tags };
}

const BRANDS: B[] = [
  // Tech / SaaS (25)
  b("linear","Modern issue tracking","#5E6AD2","#E2E8F0","#FFFFFF","#1A202C","#718096","'Inter',sans-serif","'Inter',sans-serif","tech", "tech","B2B","developer"),
  b("stripe","Online payments","#635BFF","#00D4AA","#FFFFFF","#1A1F36","#6B7C93","'Inter',sans-serif","'Inter',sans-serif","fintech", "tech","payment","B2B"),
  b("vercel","Deploy frontends","#000000","#0070F3","#FFFFFF","#000000","#888888","'Inter',sans-serif","'Inter',sans-serif","tech", "developer","deploy","frontend"),
  b("github","Code hosting","#181717","#2DA44E","#FFFFFF","#181717","#656D76","'Inter',sans-serif","'Inter',sans-serif","tech", "developer","code","open-source"),
  b("gitlab","DevOps platform","#FC6D26","#E24329","#FFFFFF","#1F1F1F","#666666","'Inter',sans-serif","'Inter',sans-serif","tech", "devops","CI/CD","developer"),
  b("docker","Container platform","#2496ED","#384D54","#FFFFFF","#1D1D1D","#666666","'Inter',sans-serif","'Inter',sans-serif","tech", "containers","devops","developer"),
  b("kubernetes","Container orchestration","#326CE5","#00A8E8","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","tech", "cloud","containers","devops"),
  b("cloudflare","CDN & security","#F38020","#0051C3","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","tech", "cdn","security","network"),
  b("datadog","Monitoring platform","#632CA6","#00A68C","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","tech", "monitoring","devops","analytics"),
  b("mongodb","NoSQL database","#47A248","#001E2B","#FFFFFF","#001E2B","#666666","'Inter',sans-serif","'Inter',sans-serif","tech", "database","nosql","developer"),
  b("sentry","Error monitoring","#362D59","#FB4226","#FFFFFF","#1A1A2E","#8C8C8C","'Inter',sans-serif","'Inter',sans-serif","tech", "monitoring","debug","B2B"),
  b("posthog","Product analytics","#1D1D1D","#F54E00","#F8F9FA","#1D1A00","#6B7280","'Inter',sans-serif","'Inter',sans-serif","tech", "analytics","product","B2B"),
  b("supabase","Open source backend","#18181B","#3ECF8E","#FAFAFA","#18181B","#71717A","'Inter',sans-serif","'Inter',sans-serif","tech", "database","open-source","backend"),
  b("cursor","AI code editor","#1A1A2E","#E2B714","#FAFAFA","#1A1A2E","#6B7280","'Inter',sans-serif","'Inter',sans-serif","tech", "AI","editor","developer"),
  b("notion","All-in-one workspace","#000000","#E16259","#FFFFFF","#37352F","#9B9A97","'Inter',sans-serif","'Inter',sans-serif","tech", "productivity","workspace","B2B"),
  b("slack","Team messaging","#4A154B","#36C5F0","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","tech", "messaging","collaboration","B2B"),
  b("atlassian","Team productivity","#0052CC","#00A0D2","#FFFFFF","#172B4D","#6B778C","'Inter',sans-serif","'Inter',sans-serif","tech", "project-management","B2B","developer"),
  b("figma","Collaborative design","#1E1E1E","#F24E1E","#FFFFFF","#2C2C2C","#7C7C7C","'Inter',sans-serif","'Inter',sans-serif","tech", "design","collaboration","B2B"),
  b("miro","Online whiteboard","#FFD02F","#0500FF","#FFFFFF","#1A1A1A","#7C7C7C","'Inter',sans-serif","'Inter',sans-serif","tech", "collaboration","whiteboard","B2B"),
  b("framer","Website builder","#222222","#7600FF","#FFFFFF","#222222","#999999","'Inter',sans-serif","'Inter',sans-serif","tech", "website","design","no-code"),
  b("webflow","Visual web dev","#146EF5","#000000","#FFFFFF","#1A1A1A","#6E6E6E","'Inter',sans-serif","'Inter',sans-serif","tech", "web","design","no-code"),
  b("cal","Scheduling infrastructure","#111111","#00A86B","#FAFAFA","#111111","#6B7280","'Inter',sans-serif","'Inter',sans-serif","tech", "scheduling","open-source","B2B"),
  b("sanity","Structured content","#F3642C","#000000","#FFFFFF","#1A1A1A","#8C8C8C","'Inter',sans-serif","'Inter',sans-serif","tech", "CMS","content","B2B"),
  b("replicate","AI model deployment","#1A1A2E","#D946EF","#FAFAFA","#1A1A2E","#6B7280","'Inter',sans-serif","'Inter',sans-serif","tech", "AI","ML","developer"),
  b("raycast","Developer productivity","#FF6363","#1A1A1A","#FFFFFF","#1A1A1A","#7C7C7C","'Inter',sans-serif","'Inter',sans-serif","tech", "productivity","developer","macOS"),
  b("hasura","GraphQL engine","#1A1A2E","#00BFA6","#FFFFFF","#1A1A2E","#666666","'Inter',sans-serif","'Inter',sans-serif","tech", "graphql","API","developer"),
  b("netlify","Web hosting","#00AD9F","#F05340","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","tech", "hosting","jamstack","developer"),
  b("digitalocean","Cloud infrastructure","#0080FF","#00B4D8","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","tech", "cloud","hosting","developer"),

  // Big Tech (8)
  b("apple","Consumer electronics","#1D1D1F","#0071E3","#FBFBFD","#1D1D1F","#86868B","'SF Pro Display',sans-serif","'SF Pro Text',sans-serif","tech", "consumer","premium","design"),
  b("google","Search & cloud","#4285F4","#34A853","#FFFFFF","#1A1A1A","#666666","'Google Sans',sans-serif","'Google Sans',sans-serif","tech", "search","cloud","advertising"),
  b("microsoft","Software & cloud","#00A4EF","#7FBA00","#FFFFFF","#1A1A1A","#666666","'Segoe UI',sans-serif","'Segoe UI',sans-serif","tech", "software","cloud","enterprise"),
  b("meta","Social technology","#0668E1","#00C300","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","tech", "social","VR","advertising"),
  b("amazon","E-commerce & cloud","#FF9900","#146EB4","#FFFFFF","#1A1A1A","#666666","'Amazon Ember',sans-serif","'Amazon Ember',sans-serif","retail", "ecommerce","cloud","logistics"),
  b("netflix","Streaming entertainment","#E50914","#221F1F","#FFFFFF","#221F1F","#666666","'Inter',sans-serif","'Inter',sans-serif","entertainment", "streaming","TV","movies"),
  b("twitter","Social media platform","#1D9BF0","#000000","#FFFFFF","#0F1419","#536471","'Inter',sans-serif","'Inter',sans-serif","social", "social","news","microblog"),
  b("linkedin","Professional network","#0A66C2","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","social", "professional","networking","jobs"),

  // Fintech / Finance (12)
  b("coinbase","Cryptocurrency exchange","#0052FF","#1652F0","#FFFFFF","#1A1A1A","#5B616E","'Inter',sans-serif","'Inter',sans-serif","fintech", "crypto","exchange","B2C"),
  b("paypal","Online payments","#003087","#009CDE","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","fintech", "payment","transfer","B2C"),
  b("square","Payment solutions","#3E4347","#0070E0","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","fintech", "payments","POS","merchant"),
  b("wise","Money transfer","#00D65C","#163300","#FFFFFF","#163300","#666666","'Inter',sans-serif","'Inter',sans-serif","fintech", "transfers","international","remittance"),
  b("revolut","Digital banking","#191C1F","#F5C044","#FFFFFF","#191C1F","#666666","'Inter',sans-serif","'Inter',sans-serif","fintech", "banking","neobank","cards"),
  b("plaid","Fintech infrastructure","#1B1B1B","#00C853","#FFFFFF","#1B1B1B","#666666","'Inter',sans-serif","'Inter',sans-serif","fintech", "API","banking","B2B"),
  b("brex","Corporate card","#1B1B1B","#00A86B","#FFFFFF","#1B1B1B","#666666","'Inter',sans-serif","'Inter',sans-serif","fintech", "cards","expense","B2B"),
  b("mercury","Banking for startups","#1A1A1A","#00C853","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","fintech", "banking","startup","B2B"),
  b("robinhood","Stock trading","#00C805","#000000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","fintech", "trading","stocks","crypto"),
  b("klarna","Buy now pay later","#FFB3C7","#000000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","fintech", "payments","BNPL","shopping"),
  b("affirm","Installment payments","#4A2C2C","#00A86B","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","fintech", "payments","BNPL","lending"),
  b("chime","Digital banking","#00A86B","#1A1A1A","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","fintech", "banking","neobank","mobile"),

  // Enterprise (8)
  b("ibm","Enterprise technology","#0062FF","#121619","#F6F7F9","#121619","#6C7278","'IBM Plex Sans',sans-serif","'IBM Plex Sans',sans-serif","enterprise", "cloud","AI","consulting"),
  b("oracle","Enterprise database","#F80000","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","enterprise", "database","cloud","ERP"),
  b("salesforce","CRM platform","#00A1E0","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","enterprise", "CRM","sales","B2B"),
  b("workday","HR & finance cloud","#FF7A00","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","enterprise", "HR","finance","cloud"),
  b("servicenow","IT service management","#81B5D5","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","enterprise", "ITSM","workflow","B2B"),
  b("splunk","Data analytics","#F58025","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","enterprise", "analytics","monitoring","big-data"),
  b("elastic","Search & analytics","#00B0E4","#00A68C","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","enterprise", "search","analytics","observability"),
  b("hashicorp","Cloud infrastructure","#000000","#00A86B","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","enterprise", "infrastructure","terraform","cloud"),
  b("nvidia","AI computing","#76B900","#000000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","tech", "AI","GPU","computing"),

  // Consumer / Social (12)
  b("airbnb","Travel marketplace","#FF5A5F","#00A699","#FFFFFF","#484848","#767676","'Circular',sans-serif","'Circular',sans-serif","travel", "travel","marketplace","hospitality"),
  b("uber","Ride sharing","#000000","#276EF1","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","mobility", "ride-sharing","delivery","transport"),
  b("lyft","Ride sharing","#FF00BF","#352384","#FFFFFF","#352384","#666666","'Inter',sans-serif","'Inter',sans-serif","mobility", "ride-sharing","transport","B2C"),
  b("doordash","Food delivery","#FF3008","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","food", "delivery","food","marketplace"),
  b("pinterest","Visual discovery","#E60023","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","social", "social","visual","discovery"),
  b("snapchat","Messaging app","#FFFC00","#000000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","social", "social","messaging","AR"),
  b("reddit","Community platform","#FF4500","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","social", "social","community","forum"),
  b("tiktok","Short video platform","#000000","#25F4EE","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","social", "social","video","entertainment"),
  b("discord","Chat platform","#5865F2","#3BA55C","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","social", "chat","gaming","community"),
  b("medium","Publishing platform","#000000","#1A8917","#FFFFFF","#292929","#666666","'Inter',sans-serif","'Inter',sans-serif","media", "writing","publishing","blog"),
  b("substack","Newsletter platform","#FF6719","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","media", "newsletter","publishing","writing"),
  b("patreon","Membership platform","#FF424D","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","media", "membership","creator","funding"),

  // E-commerce / Retail (6)
  b("shopify","E-commerce platform","#008060","#95BF47","#FFFFFF","#212326","#6B7177","'Inter',sans-serif","'Inter',sans-serif","retail", "ecommerce","retail","B2B"),
  b("etsy","Handmade marketplace","#F16521","#222222","#FFFFFF","#222222","#666666","'Inter',sans-serif","'Inter',sans-serif","retail", "marketplace","handmade","vintage"),
  b("alibaba","B2B e-commerce","#FF6A00","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","retail", "ecommerce","B2B","marketplace"),
  b("mercado","E-commerce platform","#FFE600","#333333","#FFFFFF","#333333","#666666","'Inter',sans-serif","'Inter',sans-serif","retail", "ecommerce","marketplace","latin-america"),
  b("nike","Athletic apparel","#000000","#FFFFFF","#FFFFFF","#111111","#757575","'Inter',sans-serif","'Inter',sans-serif","retail", "sportswear","fashion","athletic"),
  b("adidas","Sportswear","#000000","#00A86B","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","retail", "sportswear","fashion","athletic"),

  // Automotive (6)
  b("tesla","Electric vehicles","#E82127","#000000","#FFFFFF","#181818","#666666","'Inter',sans-serif","'Inter',sans-serif","automotive", "EV","tech","premium"),
  b("bmw","Luxury automobiles","#0066B1","#000000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","automotive", "luxury","cars","premium"),
  b("mercedes","Luxury automobiles","#00A3E0","#000000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","automotive", "luxury","cars","premium"),
  b("audi","Premium automobiles","#000000","#FF0000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","automotive", "luxury","cars","premium"),
  b("porsche","Sports cars","#000000","#FFC917","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","automotive", "luxury","sports","premium"),
  b("rivian","Electric adventure","#00A86B","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","automotive", "EV","adventure","outdoor"),

  // Gaming / Entertainment (8)
  b("nintendo","Video games","#E60012","#000000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","gaming", "gaming","console","entertainment"),
  b("playstation","Video game console","#003791","#000000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","gaming", "gaming","console","sony"),
  b("xbox","Video game console","#107C10","#000000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","gaming", "gaming","console","microsoft"),
  b("steam","Game distribution","#171A21","#00A86B","#FFFFFF","#171A21","#666666","'Inter',sans-serif","'Inter',sans-serif","gaming", "gaming","distribution","PC"),
  b("epic","Game engine & store","#313131","#FF0042","#FFFFFF","#313131","#666666","'Inter',sans-serif","'Inter',sans-serif","gaming", "gaming","engine","store"),
  b("unity","Game engine","#000000","#FF6A00","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","gaming", "gaming","engine","AR"),
  b("twitch","Live streaming","#9146FF","#000000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","gaming", "streaming","live","gaming"),
  b("spotify","Music streaming","#1DB954","#191414","#FFFFFF","#191414","#535353","'Circular',sans-serif","'Circular',sans-serif","entertainment", "music","streaming","audio"),

  // Food / Beverage (5)
  b("starbucks","Coffee chain","#006241","#D4AF37","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","food", "coffee","chain","beverage"),
  b("coca-cola","Beverage company","#F40009","#000000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","food", "beverage","soda","heritage"),
  b("mcdonalds","Fast food","#FFBC00","#DA291C","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","food", "fast-food","chain","burger"),
  b("chipotle","Fast casual dining","#E47911","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","food", "mexican","fast-casual","fresh"),
  b("dominos","Pizza delivery","#006491","#E31837","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","food", "pizza","delivery","fast-food"),

  // Media / Publishing (5)
  b("nytimes","News publishing","#000000","#D0021B","#FFFFFF","#000000","#666666","'Georgia',serif","'Georgia',serif","media", "news","publishing","journalism"),
  b("bloomberg","Financial data","#000000","#F15A24","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","media", "finance","news","data"),
  b("reuters","News agency","#FF8000","#000000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","media", "news","wire","journalism"),
  b("cnn","News network","#CC0000","#000000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","media", "news","TV","journalism"),
  b("bbc","Public broadcaster","#000000","#FF0000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","media", "news","broadcast","public"),

  // Design / Creative (5)
  b("adobe","Creative software","#FF0000","#000000","#FFFFFF","#2D2D2D","#666666","'Inter',sans-serif","'Inter',sans-serif","creative", "design","software","creative-cloud"),
  b("canva","Design platform","#00C4CC","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","creative", "design","templates","no-code"),
  b("dribbble","Design community","#EA4C89","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","creative", "design","community","portfolio"),
  b("behance","Creative portfolio","#1769FF","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","creative", "design","portfolio","adobe"),
  b("claude","AI assistant","#CC4C39","#1A1A1A","#FCFCFC","#1A1A1A","#6B7280","'Inter',sans-serif","'Inter',sans-serif","tech", "AI","assistant","language"),

  // Education / Health (5)
  b("coursera","Online learning","#0056D2","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","education", "learning","courses","MOOC"),
  b("duolingo","Language learning","#58CC02","#1CB0F6","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","education", "language","learning","gamification"),
  b("udemy","Online courses","#A435F0","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","education", "learning","courses","marketplace"),
  b("peloton","Fitness subscription","#000000","#FF0000","#FFFFFF","#000000","#666666","'Inter',sans-serif","'Inter',sans-serif","health", "fitness","cycling","subscription"),
  b("headspace","Meditation app","#F47D31","#000000","#FFFFFF","#1A1A1A","#666666","'Inter',sans-serif","'Inter',sans-serif","health", "meditation","mindfulness","wellness"),

  // China / Asia (6)
  b("xiaohongshu","Social commerce","#FF2442","#000000","#FFFFFF","#1A1A1A","#999999","'PingFang SC',sans-serif","'PingFang SC',sans-serif","social", "social","ecommerce","lifestyle"),
  b("wechat","Messaging platform","#07C160","#000000","#FFFFFF","#1A1A1A","#666666","'PingFang SC',sans-serif","'PingFang SC',sans-serif","social", "messaging","social","payment"),
  b("alipay","Payment platform","#1677FF","#000000","#FFFFFF","#1A1A1A","#666666","'PingFang SC',sans-serif","'PingFang SC',sans-serif","fintech", "payment","finance","lifestyle"),
  b("bytedance","Technology company","#000000","#25F4EE","#FFFFFF","#000000","#666666","'PingFang SC',sans-serif","'PingFang SC',sans-serif","tech", "social","video","AI"),
  b("meituan","E-commerce platform","#FFC300","#000000","#FFFFFF","#1A1A1A","#666666","'PingFang SC',sans-serif","'PingFang SC',sans-serif","retail", "delivery","ecommerce","lifestyle"),
  b("pinduoduo","Social commerce","#FF0000","#000000","#FFFFFF","#1A1A1A","#666666","'PingFang SC',sans-serif","'PingFang SC',sans-serif","retail", "ecommerce","social","group-buy"),
];

export function getBrand(name: string): BrandSystem | null {
  return BRANDS.find(b => b.name === name.toLowerCase()) || null;
}

export function searchBrands(query: string): BrandSystem[] {
  const q = query.toLowerCase();
  return BRANDS.filter(b => b.name.includes(q) || b.tags.some(t => t.includes(q)) || b.category.includes(q) || b.description.toLowerCase().includes(q));
}

export function listBrands(): { name: string; description: string; category: string; tags: string[] }[] {
  return BRANDS.map(b => ({ name: b.name, description: b.description, category: b.category, tags: b.tags }));
}

export function getBrandsByCategory(category: string): BrandSystem[] {
  return BRANDS.filter(b => b.category === category.toLowerCase());
}

export async function detectBrandFromUrl(url: string): Promise<BrandSystem | null> {
  try {
    const resp = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const html = await resp.text();
    for (const brand of BRANDS) {
      if (html.toLowerCase().includes(brand.name.toLowerCase())) return brand;
    }
    return null;
  } catch { return null; }
}
