import type { HeroVariant, GridVariant, NavStyle, CardStyle } from "./components.js";

export interface BlueprintSection {
  type: "navbar" | "hero" | "features" | "stats" | "testimonials" | "cta" | "footer" | "pricing" | "timeline";
  variant?: string;
  data: Record<string, unknown>;
}

export interface Blueprint {
  id: string;
  name: string;
  pageType: "landing" | "dashboard" | "app" | "deck" | "poster";
  industry: string[];
  keywords: string[];
  direction: string;
  dark?: boolean;
  sections: BlueprintSection[];
}

const BLUEPRINTS: Blueprint[] = [
  {
    id: "landing-cafe", name: "咖啡/餐饮 Landing",
    pageType: "landing", industry: ["咖啡", "餐饮", "cafe", "coffee", "food", "café", "restaurant"],
    keywords: ["咖啡", "温暖", "自然", "有机", "warm"],
    direction: "warm-minimal",
    sections: [
      { type: "navbar", variant: "default", data: { logo: "{brand}", links: [{label:"Menu",href:"#"},{label:"Story",href:"#"},{label:"Locations",href:"#"},{label:"Contact",href:"#"}], cta: "Order Now" } },
      { type: "hero", variant: "split", data: { title: "{brand} — {tagline}", subtitle: "{description}", cta: "Explore Our Menu" } },
      { type: "features", variant: "grid", data: { items: [{icon:"☕",title:"Single Origin",desc:"Sourced directly from small farms in Ethiopia, Colombia, and Guatemala."},{icon:"🌱",title:"Sustainable",desc:"100% compostable packaging and direct trade partnerships."},{icon:"🏆",title:"Award Winning",desc:"Gold medal at the 2025 International Coffee Awards."}] } },
      { type: "stats", variant: "grid", data: { items: [{num:"50+",label:"Origins"},{num:"10K+",label:"Happy Customers"},{num:"4.9★",label:"Rating"},{num:"8",label:"Locations"}] } },
      { type: "testimonials", variant: "grid", data: { items: [{quote:"Best flat white in town. The single origin Ethiopian is incredible.",author:"Sarah L.",role:"Regular"},{quote:"Their sustainable approach sets them apart. And the pastries are divine!",author:"James K.",role:"Food Blogger"},{quote:"Finally a coffee shop that cares about both taste and the planet.",author:"Mia W.",role:"Barista"}] } },
      { type: "cta", variant: "", data: { title:"Visit Us Today", subtitle:"Find your nearest store and enjoy the perfect brew.", cta:"Find a Store" } },
      { type: "footer", variant: "default", data: { description:"{brand} — Crafting exceptional coffee experiences since 2020.", columns:[{title:"Menu",links:[{label:"Drinks",href:"#"},{label:"Food",href:"#"},{label:"Seasonal",href:"#"}]},{title:"Company",links:[{label:"Our Story",href:"#"},{label:"Sustainability",href:"#"},{label:"Careers",href:"#"}]},{title:"Support",links:[{label:"FAQ",href:"#"},{label:"Contact",href:"#"},{label:"Feedback",href:"#"}]}] } },
    ],
  },
  {
    id: "landing-cosmetics", name: "化妆品/美妆 Landing",
    pageType: "landing", industry: ["化妆品", "美妆", "cosmetics", "beauty", "skincare", "护肤", "makeup"],
    keywords: ["化妆品", "美妆", "美", "可爱", "cute", "beauty", "glow", "优雅"],
    direction: "warm-minimal",
    sections: [
      { type: "navbar", variant: "default", data: { logo: "{brand}", links: [{label:"Shop",href:"#"},{label:"Ingredients",href:"#"},{label:"About",href:"#"},{label:"Reviews",href:"#"}], cta: "Get Started" } },
      { type: "hero", variant: "split", data: { title:"Beauty that {tagline}", subtitle:"{description}", cta:"Shop the Collection" } },
      { type: "features", variant: "grid", data: { items: [{icon:"🌿",title:"Clean Ingredients",desc:"No parabens, sulfates, or synthetic fragrances. Ever."},{icon:"🧪",title:"Dermatologist Tested",desc:"All formulas pass rigorous clinical testing for safety."},{icon:"♻️",title:"Sustainable",desc:"100% recycled glass bottles and compostable shipping."}] } },
      { type: "stats", variant: "grid", data: { items: [{num:"15K+",label:"Happy Users"},{num:"50+",label:"Products"},{num:"4.9★",label:"Rating"},{num:"30+",label:"Countries"}] } },
      { type: "testimonials", variant: "grid", data: { items: [{quote:"My skin has never looked better. The serum is absolutely magic!",author:"Sarah K.",role:"Verified Buyer"},{quote:"Finally, a clean beauty brand that actually works.",author:"Mia C.",role:"Verified Buyer"},{quote:"The packaging is gorgeous and the products are even better.",author:"Lisa P.",role:"Verified Buyer"}] } },
      { type: "cta", variant: "", data: { title:"Ready to Glow?", subtitle:"Join 15,000+ happy customers discovering clean beauty.", cta:"Get 15% Off" } },
      { type: "footer", variant: "default", data: { description:"{brand} — Clean beauty crafted with love.", columns:[{title:"Shop",links:[{label:"All Products",href:"#"},{label:"Best Sellers",href:"#"},{label:"New Arrivals",href:"#"},{label:"Gift Sets",href:"#"}]},{title:"Company",links:[{label:"Our Story",href:"#"},{label:"Ingredients",href:"#"},{label:"Sustainability",href:"#"},{label:"Press",href:"#"}]},{title:"Support",links:[{label:"FAQ",href:"#"},{label:"Shipping",href:"#"},{label:"Returns",href:"#"},{label:"Contact",href:"#"}]}] } },
    ],
  },
  {
    id: "landing-saas", name: "SaaS/科技 Landing",
    pageType: "landing", industry: ["saas", "software", "tech", "科技", "SaaS", "B2B", "developer", "startup", "AI"],
    keywords: ["saas", "软件", "科技", "技术", "云", "app", "platform", "enterprise"],
    direction: "tech-utility",
    sections: [
      { type: "navbar", variant: "default", data: { logo: "{brand}", links: [{label:"Features",href:"#"},{label:"Pricing",href:"#"},{label:"Docs",href:"#"},{label:"About",href:"#"}], cta: "Get Started" } },
      { type: "hero", variant: "fullscreen", data: { title:"{brand}", subtitle:"{tagline} — {description}", cta:"Start Free Trial" } },
      { type: "stats", variant: "grid", data: { items: [{num:"99.9%",label:"Uptime"},{num:"10M+",label:"Data Points"},{num:"150+",label:"Enterprise Clients"},{num:"4.9★",label:"Rating"}] } },
      { type: "features", variant: "grid", data: { items: [{icon:"⚡",title:"Lightning Fast",desc:"Sub-second response times on global edge infrastructure."},{icon:"🔒",title:"Enterprise Security",desc:"SOC 2 Type II certified with end-to-end encryption."},{icon:"🎨",title:"Beautiful UI",desc:"Accessibility-first design that your team will love."},{icon:"🔌",title:"API First",desc:"RESTful and GraphQL APIs with SDKs for every language."}] } },
      { type: "testimonials", variant: "grid", data: { items: [{quote:"Transformed our workflow. The API is a dream to work with.",author:"Sarah C.",role:"Engineering Lead"},{quote:"Best platform we've used. The team is incredibly responsive.",author:"Marcus K.",role:"CTO"},{quote:"Finally, a tool that respects both engineers and designers.",author:"Aiko T.",role:"Product Director"}] } },
      { type: "cta", variant: "", data: { title:"Ready to Get Started?", subtitle:"Join 150+ enterprise teams building with {brand}.", cta:"Start Free Trial" } },
      { type: "footer", variant: "default", data: { description:"{brand} — Built for modern teams.", columns:[{title:"Product",links:[{label:"Features",href:"#"},{label:"Pricing",href:"#"},{label:"Integrations",href:"#"},{label:"Changelog",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"Blog",href:"#"},{label:"Careers",href:"#"},{label:"Contact",href:"#"}]},{title:"Legal",links:[{label:"Privacy",href:"#"},{label:"Terms",href:"#"},{label:"Security",href:"#"},{label:"GDPR",href:"#"}]}] } },
    ],
  },
  {
    id: "landing-restaurant", name: "餐厅/美食 Landing",
    pageType: "landing", industry: ["餐厅", "美食", "restaurant", "dining", "gourmet", "chef", "cuisine"],
    keywords: ["餐厅", "美食", "用餐", "dining", "cuisine", "chef"],
    direction: "luxury-premium",
    sections: [
      { type: "navbar", variant: "default", data: { logo: "{brand}", links: [{label:"Menu",href:"#"},{label:"Reservations",href:"#"},{label:"About",href:"#"},{label:"Gallery",href:"#"}], cta: "Reserve a Table" } },
      { type: "hero", variant: "editorial", data: { title:"{brand}", subtitle:"{tagline} — {description}" } },
      { type: "features", variant: "list", data: { items: [{icon:"🍽️",title:"Seasonal Menu",desc:"Farm-to-table ingredients sourced from local producers."},{icon:"🍷",title:"Curated Wine List",desc:"100+ labels from family vineyards around the world."},{icon:"👨‍🍳",title:"Chef's Table",desc:"An intimate dining experience with our executive chef."}] } },
      { type: "stats", variant: "compact", data: { items: [{num:"4.8★",label:"Rating"},{num:"15+",label:"Years"},{num:"50K+",label:"Guests Served"},{num:"2",label:"Michelin Stars"}] } },
      { type: "testimonials", variant: "compact", data: { items: [{quote:"An unforgettable dining experience. The tasting menu is extraordinary.",author:"James B.",role:"Food Critic"},{quote:"The wine pairing was perfect. Every dish told a story.",author:"Elena R.",role:"Regular"}] } },
      { type: "cta", variant: "", data: { title:"Book Your Experience", subtitle:"We look forward to welcoming you.", cta:"Make a Reservation" } },
      { type: "footer", variant: "minimal", data: { description:"{brand} — Fine dining since 2015." } },
    ],
  },
  {
    id: "landing-fitness", name: "健身/运动 Landing",
    pageType: "landing", industry: ["健身", "fitness", "gym", "workout", "yoga", "wellness", "运动"],
    keywords: ["健身", "运动", "健康", "workout", "fitness", "gym"],
    direction: "corporate-trust",
    sections: [
      { type: "navbar", variant: "default", data: { logo: "{brand}", links: [{label:"Programs",href:"#"},{label:"Pricing",href:"#"},{label:"Trainers",href:"#"},{label:"Contact",href:"#"}], cta: "Start Free Trial" } },
      { type: "hero", variant: "fullscreen", data: { title:"Transform Your {tagline}", subtitle:"{description}", cta:"Join Today" } },
      { type: "stats", variant: "list", data: { items: [{num:"5K+",label:"Members"},{num:"50+",label:"Classes Weekly"},{num:"15",label:"Expert Trainers"},{num:"4.8★",label:"Rating"}] } },
      { type: "features", variant: "grid", data: { items: [{icon:"💪",title:"Personal Training",desc:"One-on-one coaching tailored to your goals."},{icon:"🧘",title:"Group Classes",desc:"Yoga, HIIT, spinning, and more."},{icon:"🥗",title:"Nutrition Plans",desc:"Custom meal plans from certified nutritionists."}] } },
      { type: "cta", variant: "", data: { title:"Start Your Journey", subtitle:"Your first week is on us. No commitment required.", cta:"Claim Free Week" } },
      { type: "footer", variant: "default", data: { description:"{brand} — Stronger together.", columns:[{title:"Programs",links:[{label:"Personal Training",href:"#"},{label:"Group Classes",href:"#"},{label:"Nutrition",href:"#"},{label:"Online Coaching",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"Trainers",href:"#"},{label:"Careers",href:"#"},{label:"Blog",href:"#"}]}] } },
    ],
  },
  {
    id: "landing-fashion", name: "时尚/服饰 Landing",
    pageType: "landing", industry: ["时尚", "fashion", "clothing", "apparel", "服饰", "wear"],
    keywords: ["时尚", "服装", "fashion", "style", "wear", "boutique"],
    direction: "dark-luxury",
    dark: true,
    sections: [
      { type: "navbar", variant: "transparent", data: { logo: "{brand}", links: [{label:"New In",href:"#"},{label:"Collections",href:"#"},{label:"About",href:"#"},{label:"Stores",href:"#"}], cta: "Shop Now" } },
      { type: "hero", variant: "fullscreen", data: { title:"{brand}", subtitle:"{tagline} — {description}", cta:"Explore Collection" } },
      { type: "features", variant: "grid", data: { items: [{icon:"✨",title:"Premium Materials",desc:"Italian wool, Japanese denim, Egyptian cotton."},{icon:"✂️",title:"Artisan Crafted",desc:"Each piece is made by master tailors."},{icon:"🌍",title:"Ethical Production",desc:"Fair wages and sustainable practices."}] } },
      { type: "stats", variant: "compact", data: { items: [{num:"20+",label:"Collections"},{num:"100+",label:"Countries"},{num:"500K+",label:"Customers"},{num:"4.7★",label:"Rating"}] } },
      { type: "cta", variant: "", data: { title:"Define Your Style", subtitle:"Free shipping and returns on all orders.", cta:"Shop Now" } },
      { type: "footer", variant: "default", data: { description:"{brand} — Timeless elegance, modern craft.", columns:[{title:"Shop",links:[{label:"New In",href:"#"},{label:"Collections",href:"#"},{label:"Sale",href:"#"},{label:"Gift Cards",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"Sustainability",href:"#"},{label:"Stores",href:"#"},{label:"Press",href:"#"}]}] } },
    ],
  },
  {
    id: "landing-education", name: "教育/课程 Landing",
    pageType: "landing", industry: ["教育", "课程", "education", "learning", "course", "school", "培训"],
    keywords: ["教育", "课程", "学习", "培训", "course", "learn"],
    direction: "playful-color",
    sections: [
      { type: "navbar", variant: "default", data: { logo: "{brand}", links: [{label:"Courses",href:"#"},{label:"Pricing",href:"#"},{label:"Teachers",href:"#"},{label:"Contact",href:"#"}], cta: "Enroll Now" } },
      { type: "hero", variant: "centered", data: { title:"Learn {tagline}", subtitle:"{description}", cta:"Browse Courses" } },
      { type: "stats", variant: "grid", data: { items: [{num:"200+",label:"Courses"},{num:"50K+",label:"Students"},{num:"98%",label:"Satisfaction"},{num:"4.8★",label:"Rating"}] } },
      { type: "features", variant: "grid", data: { items: [{icon:"🎓",title:"Expert Instructors",desc:"Learn from industry leaders and PhDs."},{icon:"📱",title:"Learn Anywhere",desc:"Mobile app with offline download support."},{icon:"🏆",title:"Certificates",desc:"Get certified and boost your career."}] } },
      { type: "testimonials", variant: "compact", data: { items: [{quote:"This course changed my career trajectory. Highly recommend!",author:"Alex M.",role:"Student"},{quote:"The best online learning platform I've ever used.",author:"Priya K.",role:"Developer"},{quote:"Incredible value for the quality of education.",author:"Carlos R.",role:"Designer"}] } },
      { type: "cta", variant: "", data: { title:"Start Learning Today", subtitle:"Join 50,000+ students and transform your future.", cta:"Get Started Free" } },
      { type: "footer", variant: "default", data: { description:"{brand} — Education for everyone.", columns:[{title:"Courses",links:[{label:"Development",href:"#"},{label:"Design",href:"#"},{label:"Business",href:"#"},{label:"Data Science",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"For Teachers",href:"#"},{label:"Careers",href:"#"},{label:"Blog",href:"#"}]}] } },
    ],
  },
  {
    id: "landing-realestate", name: "房产/物业 Landing",
    pageType: "landing", industry: ["房产", "real estate", "property", "公寓", "housing", "建筑"],
    keywords: ["房产", "房地产", "property", "home", "living", "residence"],
    direction: "corporate-trust",
    sections: [
      { type: "navbar", variant: "default", data: { logo: "{brand}", links: [{label:"Properties",href:"#"},{label:"Gallery",href:"#"},{label:"Location",href:"#"},{label:"Contact",href:"#"}], cta: "Schedule Tour" } },
      { type: "hero", variant: "split", data: { title:"Find Your {tagline}", subtitle:"{description}", cta:"View Properties" } },
      { type: "features", variant: "grid", data: { items: [{icon:"🏙️",title:"Prime Locations",desc:"In the heart of the city's best neighborhoods."},{icon:"🔑",title:"Turnkey Ready",desc:"Fully furnished with premium finishes."},{icon:"🌳",title:"Green Spaces",desc:"Rooftop gardens and private parks."}] } },
      { type: "stats", variant: "compact", data: { items: [{num:"200+",label:"Units"},{num:"15",label:"Buildings"},{num:"95%",label:"Occupancy"},{num:"4.7★",label:"Rating"}] } },
      { type: "cta", variant: "", data: { title:"Schedule a Visit", subtitle:"Experience luxury living firsthand.", cta:"Book a Tour" } },
      { type: "footer", variant: "default", data: { description:"{brand} — Premium urban living.", columns:[{title:"Properties",links:[{label:"Apartments",href:"#"},{label:"Studios",href:"#"},{label:"Penthouses",href:"#"},{label:"Commercial",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"Team",href:"#"},{label:"Careers",href:"#"},{label:"Contact",href:"#"}]}] } },
    ],
  },
  {
    id: "landing-fintech", name: "金融/Fintech Landing",
    pageType: "landing", industry: ["金融", "fintech", "banking", "payment", "finance", "财富"],
    keywords: ["金融", "银行", "fintech", "payment", "invest", "wealth", "money"],
    direction: "corporate-trust",
    sections: [
      { type: "navbar", variant: "default", data: { logo: "{brand}", links: [{label:"Features",href:"#"},{label:"Pricing",href:"#"},{label:"Security",href:"#"},{label:"Contact",href:"#"}], cta: "Get Started" } },
      { type: "hero", variant: "centered", data: { title:"Smart {tagline} for Everyone", subtitle:"{description}", cta:"Open Free Account" } },
      { type: "stats", variant: "list", data: { items: [{num:"$2B+",label:"Transactions"},{num:"1M+",label:"Users"},{num:"99.99%",label:"Uptime"},{num:"4.8★",label:"App Rating"}] } },
      { type: "features", variant: "grid", data: { items: [{icon:"🛡️",title:"Bank-Grade Security",desc:"256-bit encryption and biometric authentication."},{icon:"⚡",title:"Instant Transfers",desc:"Send money globally in seconds, not days."},{icon:"📊",title:"Smart Analytics",desc:"AI-powered spending insights and budgeting."}] } },
      { type: "testimonials", variant: "compact", data: { items: [{quote:"Saved hundreds on international transfer fees.",author:"David L.",role:"Freelancer"},{quote:"The budgeting tools completely changed my finances.",author:"Emma T.",role:"Designer"},{quote:"Finally, a bank that feels like modern software.",author:"Raj P.",role:"Engineer"}] } },
      { type: "cta", variant: "", data: { title:"Join 1M+ Smart Savers", subtitle:"No monthly fees. No minimum balance.", cta:"Get Started Free" } },
      { type: "footer", variant: "default", data: { description:"{brand} — Financial freedom for everyone.", columns:[{title:"Product",links:[{label:"Features",href:"#"},{label:"Pricing",href:"#"},{label:"Security",href:"#"},{label:"FAQ",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"Blog",href:"#"},{label:"Careers",href:"#"},{label:"Press",href:"#"}]}] } },
    ],
  },
  {
    id: "landing-ecommerce", name: "电商/Shop Landing",
    pageType: "landing", industry: ["电商", "ecommerce", "shop", "store", "shopify", "零售", "online store"],
    keywords: ["电商", "购物", "shop", "store", "ecommerce", "产品"],
    direction: "warm-minimal",
    sections: [
      { type: "navbar", variant: "default", data: { logo: "{brand}", links: [{label:"Shop All",href:"#"},{label:"New In",href:"#"},{label:"Sale",href:"#"},{label:"About",href:"#"}], cta: "Search" } },
      { type: "hero", variant: "split", data: { title:"Discover {tagline}", subtitle:"{description}", cta:"Shop Now" } },
      { type: "features", variant: "grid", data: { items: [{icon:"🚚",title:"Free Shipping",desc:"On all orders over $50. Delivered in 2-4 days."},{icon:"💯",title:"Quality Guaranteed",desc:"30-day money-back guarantee, no questions asked."},{icon:"🎁",title:"Gift Wrapping",desc:"Complimentary eco-friendly gift wrapping available."}] } },
      { type: "stats", variant: "compact", data: { items: [{num:"10K+",label:"Products"},{num:"50K+",label:"Happy Customers"},{num:"4.8★",label:"Rating"},{num:"30+",label:"Countries"}] } },
      { type: "testimonials", variant: "compact", data: { items: [{quote:"Amazing quality and fast shipping! Highly recommend.",author:"Lisa M.",role:"Verified Buyer"},{quote:"My go-to store for everything. Customer service is superb.",author:"Tom H.",role:"Verified Buyer"}] } },
      { type: "cta", variant: "", data: { title:"Join Our Community", subtitle:"Sign up and get 10% off your first order.", cta:"Get 10% Off" } },
      { type: "footer", variant: "default", data: { description:"{brand} — Curated for modern living.", columns:[{title:"Shop",links:[{label:"All Products",href:"#"},{label:"New Arrivals",href:"#"},{label:"Best Sellers",href:"#"},{label:"Sale",href:"#"}]},{title:"Help",links:[{label:"Shipping",href:"#"},{label:"Returns",href:"#"},{label:"FAQ",href:"#"},{label:"Contact",href:"#"}]}] } },
    ],
  },
];

export function findBlueprint(task: string): { blueprint: Blueprint; confidence: number } {
  const lower = task.toLowerCase();
  let best: Blueprint | null = null;
  let bestScore = 0;

  for (const bp of BLUEPRINTS) {
    let score = 0;
    for (const kw of bp.keywords) {
      if (lower.includes(kw)) score += 2;
    }
    for (const ind of bp.industry) {
      if (lower.includes(ind.toLowerCase())) score += 3;
    }
    if (bp.pageType === "landing" && /\b(landing|homepage|首页|落地|page|site)\b/.test(lower)) score += 1;
    if (bp.pageType === "dashboard" && /\b(dashboard|admin|后台)\b/.test(lower)) score += 3;
    if (bp.pageType === "app" && /\b(app|mobile|ios|android|手机)\b/.test(lower)) score += 3;

    if (score > bestScore) { bestScore = score; best = bp; }
  }

  if (!best) best = BLUEPRINTS[2]; // SaaS fallback
  return { blueprint: best, confidence: bestScore > 0 ? Math.min(bestScore / 10, 1) : 0.1 };
}

export function fillBlueprint(blueprint: Blueprint, brand: string, tagline: string, description: string): Blueprint {
  const filled: Blueprint = { ...blueprint, sections: blueprint.sections.map((s) => ({ ...s, data: fillData(s.data, brand, tagline, description) })) };
  return filled;
}

function fillData(data: Record<string, unknown>, brand: string, tagline: string, description: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (typeof val === "string") {
      result[key] = val.replace(/\{brand\}/g, brand).replace(/\{tagline\}/g, tagline).replace(/\{description\}/g, description);
    } else if (Array.isArray(val)) {
      result[key] = val.map((item) => {
        if (typeof item === "object" && item !== null) return fillData(item as Record<string, unknown>, brand, tagline, description);
        if (typeof item === "string") return item.replace(/\{brand\}/g, brand).replace(/\{tagline\}/g, tagline).replace(/\{description\}/g, description);
        return item;
      });
    } else {
      result[key] = val;
    }
  }
  return result;
}

export { BLUEPRINTS };
