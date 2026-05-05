import type { HeroVariant, GridVariant, NavStyle, CardStyle } from "./components.js";

export interface BlueprintSection {
  type: "navbar" | "hero" | "features" | "stats" | "testimonials" | "cta" | "footer" | "pricing" | "timeline" | "form" | "stats_counter";
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

  // === MOBILE APP BLUEPRINTS ===
  {
    id: "mobile-onboarding", name: "App 引导页 Onboarding",
    pageType: "app", industry: ["app", "mobile", "ios", "android", "onboarding", "引导"],
    keywords: ["app", "mobile", "onboarding", "引导", "注册", "welcome", "start"],
    direction: "playful-color",
    sections: [
      { type: "hero", variant: "fullscreen", data: { title:"Welcome to {brand}", subtitle:"{tagline} — {description}", cta:"Get Started" } },
      { type: "stats_counter", variant: "", data: { items: [{value:"1M+",label:"Downloads"},{value:"4.8★",label:"Rating"},{value:"150+",label:"Countries"}] } },
      { type: "features", variant: "list", data: { items: [{icon:"✨",title:"Smart Features",desc:"AI-powered recommendations just for you."},{icon:"🔒",title:"Private & Secure",desc:"Your data is encrypted end-to-end."},{icon:"⚡",title:"Lightning Fast",desc:"Optimized for the best experience."}] } },
      { type: "form", variant: "", data: { fields: [{label:"Email",type:"email",placeholder:"your@email.com"}], submit:"Create Account" } },
      { type: "footer", variant: "minimal", data: { description:"{brand} — {tagline}" } },
    ],
  },
  {
    id: "mobile-profile", name: "App 个人主页 Profile",
    pageType: "app", industry: ["app", "mobile", "profile", "个人", "account", "user"],
    keywords: ["profile", "个人", "账号", "account", "user", "设置"],
    direction: "warm-minimal",
    sections: [
      { type: "navbar", variant: "centered", data: { logo: "{brand}", links: [{label:"Profile",href:"#"},{label:"Settings",href:"#"}], cta: "Edit" } },
      { type: "stats_counter", variant: "", data: { items: [{value:"1.2K",label:"Followers"},{value:"340",label:"Following"},{value:"89",label:"Posts"}] } },
      { type: "features", variant: "list", data: { items: [{icon:"📸",title:"My Photos",desc:"View your photo gallery"},{icon:"⭐",title:"Saved Items",desc:"Your bookmarked content"},{icon:"🏆",title:"Achievements",desc:"Badges and milestones"}] } },
      { type: "cta", variant: "", data: { title:"Share Your Profile", subtitle:"Let friends find you on {brand}.", cta:"Share Profile" } },
      { type: "footer", variant: "minimal", data: { description:"{brand}" } },
    ],
  },
  {
    id: "mobile-ecommerce-app", name: "App 电商购物",
    pageType: "app", industry: ["app", "mobile", "shop", "store", "购物", "ecommerce"],
    keywords: ["app", "购物", "shop", "store", "商品", "产品", "ecommerce", "buy"],
    direction: "warm-minimal",
    sections: [
      { type: "navbar", variant: "default", data: { logo: "{brand}", links: [{label:"Home",href:"#"},{label:"Search",href:"#"},{label:"Cart",href:"#"},{label:"Account",href:"#"}], cta: "Cart" } },
      { type: "hero", variant: "centered", data: { title:"Shop {tagline}", subtitle:"{description}", cta:"Browse" } },
      { type: "features", variant: "grid", data: { items: [{icon:"🚚",title:"Free Shipping",desc:"On orders over $50"},{icon:"💯",title:"Easy Returns",desc:"30-day guarantee"},{icon:"🎁",title:"Gift Ready",desc:"Free gift wrapping"}] } },
      { type: "stats", variant: "compact", data: { items: [{num:"10K+",label:"Products"},{num:"50K+",label:"Shoppers"},{num:"4.8★",label:"Rating"}] } },
      { type: "cta", variant: "", data: { title:"Download the App", subtitle:"Get the best shopping experience on mobile.", cta:"Get the App" } },
      { type: "footer", variant: "minimal", data: { description:"{brand}" } },
    ],
  },
  {
    id: "mobile-social", name: "App 社交 Social Feed",
    pageType: "app", industry: ["app", "mobile", "social", "社交", "feed", "community"],
    keywords: ["social", "社交", "feed", "community", "分享", "post"],
    direction: "playful-color",
    sections: [
      { type: "navbar", variant: "centered", data: { logo: "{brand}", links: [{label:"Feed",href:"#"},{label:"Explore",href:"#"},{label:"Notifications",href:"#"},{label:"Profile",href:"#"}], cta: "Post" } },
      { type: "hero", variant: "centered", data: { title:"{brand}", subtitle:"{tagline} — Share your story with the world.", cta:"Join Now" } },
      { type: "stats_counter", variant: "", data: { items: [{value:"5M+",label:"Creators"},{value:"50M+",label:"Posts"},{value:"100M+",label:"Likes"}] } },
      { type: "features", variant: "list", data: { items: [{icon:"📷",title:"Share Photos",desc:"Capture and share your moments."},{icon:"💬",title:"Connect",desc:"Message friends and followers."},{icon:"🔥",title:"Trending",desc:"Discover what's popular now."}] } },
      { type: "cta", variant: "", data: { title:"Join the Community", subtitle:"Be part of something bigger.", cta:"Sign Up Free" } },
      { type: "footer", variant: "minimal", data: { description:"{brand}" } },
    ],
  },
  {
    id: "mobile-settings", name: "App 设置页 Settings",
    pageType: "app", industry: ["app", "mobile", "settings", "设置", "preferences", "config"],
    keywords: ["settings", "设置", "配置", "preferences", "account", "privacy"],
    direction: "tech-utility",
    sections: [
      { type: "navbar", variant: "centered", data: { logo: "Settings", links: [], cta: "" } },
      { type: "hero", variant: "centered", data: { title:"Account Settings", subtitle:"Manage your preferences and privacy.", cta:"" } },
      { type: "features", variant: "list", data: { items: [{icon:"👤",title:"Profile",desc:"Name, email, avatar"},{icon:"🔒",title:"Privacy",desc:"Password, security, data"},{icon:"🔔",title:"Notifications",desc:"Push, email, SMS"},{icon:"🎨",title:"Appearance",desc:"Theme, font, density"}] } },
      { type: "cta", variant: "", data: { title:"Need help?", subtitle:"Contact our support team anytime.", cta:"Contact Support" } },
      { type: "footer", variant: "minimal", data: { description:"{brand}" } },
    ],
  },

  // === ADDITIONAL LANDING BLUEPRINTS ===
  {id:"landing-portfolio",name:"个人作品集 Portfolio",pageType:"landing",industry:["portfolio","作品集","personal","freelancer"],keywords:["portfolio","作品集","freelance","designer","artist"],direction:"minimal-white",sections:[
    {type:"navbar",variant:"transparent",data:{logo:"{brand}",links:[{label:"Work",href:"#"},{label:"About",href:"#"},{label:"Contact",href:"#"}],cta:"Hire Me"}},
    {type:"hero",variant:"centered",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"View My Work"}},
    {type:"stats",variant:"compact",data:{items:[{num:"50+",label:"Projects"},{num:"30+",label:"Clients"},{num:"4.9★",label:"Rating"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"🎨",title:"UI/UX Design",desc:"User-centered interfaces."},{icon:"⚡",title:"Development",desc:"Clean front-end code."},{icon:"📱",title:"Mobile First",desc:"Responsive for every device."}]}},
    {type:"cta",variant:"",data:{title:"Let's Work Together",subtitle:"Available for freelance and full-time.",cta:"Get in Touch"}},{type:"footer",variant:"minimal",data:{description:"{brand}"}},
  ]},
  {id:"landing-agency",name:"创意代理 Agency",pageType:"landing",industry:["agency","代理","广告","digital","creative agency"],keywords:["agency","代理","广告","studio","creative","digital"],direction:"agency-dark",sections:[
    {type:"navbar",variant:"transparent",data:{logo:"{brand}",links:[{label:"Work",href:"#"},{label:"Services",href:"#"},{label:"Team",href:"#"},{label:"Contact",href:"#"}],cta:"Start Project"}},
    {type:"hero",variant:"fullscreen",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"Our Work"}},
    {type:"stats",variant:"list",data:{items:[{num:"200+",label:"Projects"},{num:"80+",label:"Clients"},{num:"15",label:"Years"},{num:"25",label:"Team"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"🎯",title:"Strategy",desc:"Data-driven marketing."},{icon:"🎨",title:"Creative",desc:"Award-winning branding."},{icon:"📈",title:"Growth",desc:"Scale your business."}]}},
    {type:"testimonials",variant:"compact",data:{items:[{quote:"The best agency we've ever worked with.",author:"Sarah L.",role:"CEO"},{quote:"Transformed our brand completely.",author:"James K.",role:"Founder"}]}},
    {type:"cta",variant:"",data:{title:"Ready to Create?",subtitle:"Build something extraordinary together.",cta:"Start a Project"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Services",links:[{label:"Branding",href:"#"},{label:"Design",href:"#"},{label:"Development",href:"#"},{label:"Marketing",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"Work",href:"#"},{label:"Team",href:"#"},{label:"Careers",href:"#"}]}]}},
  ]},
  {id:"landing-nonprofit",name:"非营利 Nonprofit",pageType:"landing",industry:["nonprofit","charity","foundation","ngo","公益"],keywords:["nonprofit","公益","charity","donate","volunteer","cause"],direction:"nonprofit-soft",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Mission",href:"#"},{label:"Impact",href:"#"},{label:"Programs",href:"#"},{label:"Donate",href:"#"}],cta:"Donate"}},
    {type:"hero",variant:"fullscreen",data:{title:"{tagline}",subtitle:"{description}",cta:"Get Involved"}},
    {type:"stats",variant:"grid",data:{items:[{num:"50K+",label:"Lives Impacted"},{num:"100+",label:"Communities"},{num:"15",label:"Years"},{num:"92%",label:"To Programs"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"🌍",title:"Global Reach",desc:"30+ countries worldwide."},{icon:"🤝",title:"Community",desc:"Local partnerships."},{icon:"💚",title:"Sustainable",desc:"Long-term solutions."}]}},
    {type:"cta",variant:"",data:{title:"Make a Difference",subtitle:"Your support can change lives.",cta:"Donate Now"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Programs",links:[{label:"Education",href:"#"},{label:"Health",href:"#"},{label:"Environment",href:"#"},{label:"Advocacy",href:"#"}]},{title:"About",links:[{label:"Mission",href:"#"},{label:"Team",href:"#"},{label:"Financials",href:"#"},{label:"Careers",href:"#"}]}]}},
  ]},
  {id:"landing-event",name:"活动/会议 Event",pageType:"landing",industry:["event","活动","conference","summit","meetup","convention"],keywords:["event","活动","conference","summit","talk","workshop"],direction:"bold-contrast",sections:[
    {type:"navbar",variant:"transparent",data:{logo:"{brand}",links:[{label:"Schedule",href:"#"},{label:"Speakers",href:"#"},{label:"Tickets",href:"#"},{label:"Venue",href:"#"}],cta:"Get Tickets"}},
    {type:"hero",variant:"fullscreen",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"Register Now"}},
    {type:"stats",variant:"list",data:{items:[{num:"50+",label:"Speakers"},{num:"3K+",label:"Attendees"},{num:"30",label:"Sessions"},{num:"5",label:"Tracks"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"🎤",title:"Speakers",desc:"Industry leaders sharing insights."},{icon:"🔬",title:"Workshops",desc:"Hands-on learning."},{icon:"🤝",title:"Networking",desc:"Connect with peers."}]}},
    {type:"cta",variant:"",data:{title:"Don't Miss Out",subtitle:"Early bird tickets available.",cta:"Get Your Ticket"}},{type:"footer",variant:"minimal",data:{description:"{brand}"}},
  ]},
  {id:"landing-booking",name:"预订/预约 Booking",pageType:"landing",industry:["booking","预约","hotel","spa","salon","wellness"],keywords:["booking","预约","reserve","salon","spa","hotel"],direction:"warm-editorial",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Services",href:"#"},{label:"Pricing",href:"#"},{label:"Gallery",href:"#"},{label:"Contact",href:"#"}],cta:"Book Now"}},
    {type:"hero",variant:"split",data:{title:"{tagline}",subtitle:"{description}",cta:"Book Appointment"}},
    {type:"stats",variant:"compact",data:{items:[{num:"10K+",label:"Appointments"},{num:"4.9★",label:"Rating"},{num:"50+",label:"Services"},{num:"15",label:"Experts"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"✨",title:"Premium Service",desc:"Luxurious experience."},{icon:"💆",title:"Expert Therapists",desc:"Certified professionals."},{icon:"🌿",title:"Organic",desc:"Natural products."}]}},
    {type:"cta",variant:"",data:{title:"Ready to Indulge?",subtitle:"Your relaxation awaits.",cta:"Book Your Slot"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Services",links:[{label:"Spa",href:"#"},{label:"Massage",href:"#"},{label:"Facial",href:"#"},{label:"Nail",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"Gallery",href:"#"},{label:"Gift Cards",href:"#"},{label:"Contact",href:"#"}]}]}},
  ]},
  {id:"landing-medical",name:"医疗/诊所 Medical",pageType:"landing",industry:["medical","医疗","clinic","doctor","hospital","dentist"],keywords:["medical","clinic","doctor","hospital","health","dentist"],direction:"healthcare-clean",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Services",href:"#"},{label:"Doctors",href:"#"},{label:"Insurance",href:"#"},{label:"Contact",href:"#"}],cta:"Book"}},
    {type:"hero",variant:"centered",data:{title:"{tagline}",subtitle:"{description}",cta:"Schedule Visit"}},
    {type:"stats",variant:"compact",data:{items:[{num:"20+",label:"Doctors"},{num:"15K+",label:"Patients"},{num:"4.8★",label:"Rating"},{num:"10+",label:"Years"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"🩺",title:"Expert Doctors",desc:"Board-certified."},{icon:"🏥",title:"Modern Facility",desc:"State-of-the-art."},{icon:"💊",title:"Comprehensive",desc:"From checkups to surgery."}]}},
    {type:"cta",variant:"",data:{title:"Your Health Matters",subtitle:"Same-day appointments available.",cta:"Book Now"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Services",links:[{label:"Primary Care",href:"#"},{label:"Pediatrics",href:"#"},{label:"Cardiology",href:"#"},{label:"Dermatology",href:"#"}]},{title:"Patients",links:[{label:"Insurance",href:"#"},{label:"Records",href:"#"},{label:"FAQ",href:"#"},{label:"Contact",href:"#"}]}]}},
  ]},
  {id:"landing-legal",name:"法律/律所 Legal",pageType:"landing",industry:["legal","法律","law","attorney","lawyer","firm"],keywords:["legal","法律","lawyer","attorney","firm","诉讼"],direction:"legal-format",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Practice Areas",href:"#"},{label:"Team",href:"#"},{label:"Results",href:"#"},{label:"Contact",href:"#"}],cta:"Free Consultation"}},
    {type:"hero",variant:"editorial",data:{title:"{brand}",subtitle:"{tagline} — {description}"}},
    {type:"stats",variant:"compact",data:{items:[{num:"30+",label:"Years"},{num:"10K+",label:"Cases"},{num:"98%",label:"Success"},{num:"4.9★",label:"Rating"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"⚖️",title:"Experienced",desc:"Decades of expertise."},{icon:"🏆",title:"Proven Results",desc:"Multi-million settlements."},{icon:"🤝",title:"Personalized",desc:"Dedicated partner."}]}},
    {type:"cta",variant:"",data:{title:"Free Case Evaluation",subtitle:"No obligation.",cta:"Get Free Consultation"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Areas",links:[{label:"Personal Injury",href:"#"},{label:"Family Law",href:"#"},{label:"Criminal",href:"#"},{label:"Real Estate",href:"#"}]},{title:"Firm",links:[{label:"About",href:"#"},{label:"Team",href:"#"},{label:"Results",href:"#"},{label:"Contact",href:"#"}]}]}},
  ]},
  {id:"landing-consulting",name:"商业咨询 Consulting",pageType:"landing",industry:["consulting","咨询","management","strategy","advisory"],keywords:["consulting","咨询","strategy","management","advisor","coach"],direction:"consulting-dark",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Services",href:"#"},{label:"Case Studies",href:"#"},{label:"Team",href:"#"},{label:"Contact",href:"#"}],cta:"Free Consultation"}},
    {type:"hero",variant:"split",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"Book a Call"}},
    {type:"stats",variant:"list",data:{items:[{num:"150+",label:"Clients"},{num:"500+",label:"Projects"},{num:"98%",label:"Satisfaction"},{num:"20+",label:"Years"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"📊",title:"Strategy",desc:"Data-driven strategies."},{icon:"🚀",title:"Growth",desc:"Scale operations."},{icon:"💰",title:"Profitability",desc:"Maximize ROI."}]}},
    {type:"cta",variant:"",data:{title:"Transform Your Business",subtitle:"Let's discuss how we can help.",cta:"Schedule a Call"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Services",links:[{label:"Strategy",href:"#"},{label:"Operations",href:"#"},{label:"Digital",href:"#"},{label:"Growth",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"Case Studies",href:"#"},{label:"Team",href:"#"},{label:"Careers",href:"#"}]}]}},
  ]},
  {id:"landing-photography",name:"摄影/视频 Photography",pageType:"landing",industry:["photography","摄影","videography","photo","film"],keywords:["photography","摄影师","wedding","portrait","film"],direction:"photography",sections:[
    {type:"navbar",variant:"transparent",data:{logo:"{brand}",links:[{label:"Portfolio",href:"#"},{label:"Pricing",href:"#"},{label:"About",href:"#"},{label:"Contact",href:"#"}],cta:"Book"}},
    {type:"hero",variant:"fullscreen",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"View Portfolio"}},
    {type:"stats",variant:"compact",data:{items:[{num:"500+",label:"Shoots"},{num:"200+",label:"Clients"},{num:"4.9★",label:"Rating"},{num:"10",label:"Years"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"📸",title:"Professional",desc:"Industry-leading equipment."},{icon:"🎨",title:"Artistic",desc:"Creative direction."},{icon:"⏱️",title:"Fast Delivery",desc:"48hr turnaround."}]}},
    {type:"cta",variant:"",data:{title:"Book Your Session",subtitle:"Available for weddings, portraits, commercial.",cta:"Reserve"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Services",links:[{label:"Wedding",href:"#"},{label:"Portrait",href:"#"},{label:"Commercial",href:"#"},{label:"Event",href:"#"}]},{title:"Info",links:[{label:"About",href:"#"},{label:"Pricing",href:"#"},{label:"FAQ",href:"#"},{label:"Contact",href:"#"}]}]}},
  ]},
  {id:"landing-travel",name:"旅行/旅游 Travel",pageType:"landing",industry:["travel","旅游","tour","vacation","destination","holiday"],keywords:["travel","旅游","vacation","destination","tour","trip"],direction:"ocean-breeze",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Destinations",href:"#"},{label:"Packages",href:"#"},{label:"Gallery",href:"#"},{label:"Contact",href:"#"}],cta:"Book"}},
    {type:"hero",variant:"fullscreen",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"Explore"}},
    {type:"stats",variant:"list",data:{items:[{num:"50+",label:"Destinations"},{num:"10K+",label:"Travelers"},{num:"4.8★",label:"Rating"},{num:"100+",label:"Guides"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"✈️",title:"Curated Trips",desc:"Hand-picked experiences."},{icon:"🏨",title:"Premium Stays",desc:"Luxury accommodations."},{icon:"🗺️",title:"Local Guides",desc:"Expert guides."}]}},
    {type:"cta",variant:"",data:{title:"Adventure Awaits",subtitle:"Book now and save 20%.",cta:"Book a Trip"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Destinations",links:[{label:"Europe",href:"#"},{label:"Asia",href:"#"},{label:"Americas",href:"#"},{label:"Africa",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"Blog",href:"#"},{label:"Careers",href:"#"},{label:"Contact",href:"#"}]}]}},
  ]},
  {id:"landing-pets",name:"宠物服务 Pets",pageType:"landing",industry:["pet","宠物","dog","cat","veterinary","animal"],keywords:["pet","宠物","dog","cat","veterinary","puppy"],direction:"soft-minimal",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Services",href:"#"},{label:"Shop",href:"#"},{label:"Gallery",href:"#"},{label:"Contact",href:"#"}],cta:"Book"}},
    {type:"hero",variant:"centered",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"Our Services"}},
    {type:"stats",variant:"compact",data:{items:[{num:"5K+",label:"Pets Cared"},{num:"4.9★",label:"Rating"},{num:"15+",label:"Years"},{num:"50+",label:"Services"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"🐾",title:"Grooming",desc:"Professional for all breeds."},{icon:"🩺",title:"Veterinary",desc:"Checkups and vaccines."},{icon:"🏠",title:"Boarding",desc:"Overnight stays."}]}},
    {type:"cta",variant:"",data:{title:"Treat Your Pet",subtitle:"First visit 20% off.",cta:"Book Appointment"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Services",links:[{label:"Grooming",href:"#"},{label:"Veterinary",href:"#"},{label:"Boarding",href:"#"},{label:"Training",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"Gallery",href:"#"},{label:"Careers",href:"#"},{label:"Contact",href:"#"}]}]}},
  ]},
  {id:"landing-music",name:"音乐人/乐队 Music",pageType:"landing",industry:["music","音乐","band","artist","musician","concert"],keywords:["music","音乐","band","artist","musician","concert","album"],direction:"music-vibe",sections:[
    {type:"navbar",variant:"transparent",data:{logo:"{brand}",links:[{label:"Music",href:"#"},{label:"Tour",href:"#"},{label:"Store",href:"#"},{label:"Contact",href:"#"}],cta:"Listen"}},
    {type:"hero",variant:"fullscreen",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"Listen on Spotify"}},
    {type:"stats",variant:"list",data:{items:[{num:"1M+",label:"Streams"},{num:"50K+",label:"Followers"},{num:"100+",label:"Shows"},{num:"5",label:"Albums"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"🎵",title:"Latest Album",desc:"Listen now."},{icon:"🎸",title:"Tour Dates",desc:"Live near you."},{icon:"👕",title:"Merch",desc:"Official apparel."}]}},
    {type:"cta",variant:"",data:{title:"Join the List",subtitle:"Get exclusive content.",cta:"Subscribe"}},{type:"footer",variant:"minimal",data:{description:"{brand}"}},
  ]},
  {id:"landing-gym",name:"健身房 Gym",pageType:"landing",industry:["gym","健身","crossfit","workout","fitness","training"],keywords:["gym","健身","crossfit","workout","training","boxing"],direction:"bold-contrast",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Programs",href:"#"},{label:"Schedule",href:"#"},{label:"Pricing",href:"#"},{label:"Contact",href:"#"}],cta:"Free Trial"}},
    {type:"hero",variant:"fullscreen",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"Start Free Trial"}},
    {type:"stats",variant:"list",data:{items:[{num:"2K+",label:"Members"},{num:"50+",label:"Classes"},{num:"20",label:"Trainers"},{num:"4.8★",label:"Rating"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"💪",title:"Strength",desc:"Build muscle."},{icon:"🏃",title:"Cardio",desc:"Improve endurance."},{icon:"🧘",title:"Yoga",desc:"Mind and body."}]}},
    {type:"cta",variant:"",data:{title:"Start Your Journey",subtitle:"First week free.",cta:"Claim Free Week"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Programs",links:[{label:"Strength",href:"#"},{label:"Cardio",href:"#"},{label:"Yoga",href:"#"},{label:"Personal",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"Trainers",href:"#"},{label:"Careers",href:"#"},{label:"Contact",href:"#"}]}]}},
  ]},
  {id:"landing-yoga",name:"瑜伽/冥想 Yoga",pageType:"landing",industry:["yoga","瑜伽","meditation","mindfulness","wellness"],keywords:["yoga","瑜伽","meditation","mindfulness","wellness","pilates"],direction:"nature-organic",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Classes",href:"#"},{label:"Schedule",href:"#"},{label:"About",href:"#"},{label:"Contact",href:"#"}],cta:"Try Free"}},
    {type:"hero",variant:"centered",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"View Schedule"}},
    {type:"features",variant:"grid",data:{items:[{icon:"🧘",title:"All Levels",desc:"Beginner to advanced."},{icon:"🌅",title:"Flexible",desc:"Morning & evening."},{icon:"🌿",title:"Holistic",desc:"Mind, body, spirit."}]}},
    {type:"stats",variant:"compact",data:{items:[{num:"30+",label:"Classes"},{num:"500+",label:"Students"},{num:"4.9★",label:"Rating"},{num:"10",label:"Teachers"}]}},
    {type:"cta",variant:"",data:{title:"Find Your Peace",subtitle:"First class free.",cta:"Book a Class"}},{type:"footer",variant:"minimal",data:{description:"{brand}"}},
  ]},
  {id:"landing-artist",name:"艺术家/插画 Artist",pageType:"landing",industry:["artist","art","illustration","painting","gallery","fine art"],keywords:["artist","art","illustration","painting","gallery","drawing"],direction:"art-gallery",sections:[
    {type:"navbar",variant:"transparent",data:{logo:"{brand}",links:[{label:"Works",href:"#"},{label:"About",href:"#"},{label:"Exhibitions",href:"#"},{label:"Shop",href:"#"}],cta:"Shop"}},
    {type:"hero",variant:"editorial",data:{title:"{brand}",subtitle:"{tagline} — {description}"}},
    {type:"stats",variant:"compact",data:{items:[{num:"200+",label:"Works"},{num:"30+",label:"Exhibitions"},{num:"15",label:"Awards"},{num:"50+",label:"Collections"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"🖼️",title:"Original Works",desc:"Unique pieces."},{icon:"🖨️",title:"Prints",desc:"Limited editions."},{icon:"🏛️",title:"Commissions",desc:"Custom artwork."}]}},
    {type:"cta",variant:"",data:{title:"Acquire Art",subtitle:"Inquire about works and commissions.",cta:"Contact Gallery"}},{type:"footer",variant:"minimal",data:{description:"{brand}"}},
  ]},
  {id:"landing-architecture",name:"建筑/设计 Architecture",pageType:"landing",industry:["architecture","建筑","architect","firm","construction"],keywords:["architecture","建筑","architect","firm","interior"],direction:"cold-minimal",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Projects",href:"#"},{label:"Services",href:"#"},{label:"Studio",href:"#"},{label:"Contact",href:"#"}],cta:"Let's Talk"}},
    {type:"hero",variant:"split",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"View Projects"}},
    {type:"stats",variant:"compact",data:{items:[{num:"100+",label:"Projects"},{num:"30+",label:"Awards"},{num:"25",label:"Years"},{num:"4.9★",label:"Rating"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"🏗️",title:"Residential",desc:"Custom homes."},{icon:"🏢",title:"Commercial",desc:"Office spaces."},{icon:"🌳",title:"Sustainable",desc:"Eco-friendly."}]}},
    {type:"cta",variant:"",data:{title:"Start Your Project",subtitle:"Create something beautiful.",cta:"Get in Touch"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Services",links:[{label:"Residential",href:"#"},{label:"Commercial",href:"#"},{label:"Interior",href:"#"},{label:"Planning",href:"#"}]},{title:"Studio",links:[{label:"About",href:"#"},{label:"Projects",href:"#"},{label:"Awards",href:"#"},{label:"Contact",href:"#"}]}]}},
  ]},
  {id:"landing-hotel",name:"酒店/度假村 Hotel",pageType:"landing",industry:["hotel","酒店","resort","lodging","accommodation"],keywords:["hotel","酒店","resort","lodging","stay","vacation"],direction:"luxury-premium",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Rooms",href:"#"},{label:"Amenities",href:"#"},{label:"Gallery",href:"#"},{label:"Book",href:"#"}],cta:"Book"}},
    {type:"hero",variant:"fullscreen",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"Check Availability"}},
    {type:"stats",variant:"list",data:{items:[{num:"120",label:"Rooms"},{num:"4.8★",label:"Rating"},{num:"4",label:"Restaurants"},{num:"50+",label:"Staff"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"🛏️",title:"Luxury Rooms",desc:"Premium bedding."},{icon:"🍽️",title:"Fine Dining",desc:"Michelin-starred."},{icon:"💆",title:"Spa",desc:"Full-service."}]}},
    {type:"cta",variant:"",data:{title:"Book Your Stay",subtitle:"Best rate guaranteed.",cta:"Reserve Now"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Rooms",links:[{label:"Rooms",href:"#"},{label:"Suites",href:"#"},{label:"Villas",href:"#"},{label:"Accessible",href:"#"}]},{title:"Hotel",links:[{label:"About",href:"#"},{label:"Gallery",href:"#"},{label:"Dining",href:"#"},{label:"Contact",href:"#"}]}]}},
  ]},
  {id:"landing-coworking",name:"共享办公 Coworking",pageType:"landing",industry:["coworking","共享办公","office","workspace","remote"],keywords:["coworking","workspace","office","remote","desk"],direction:"tech-utility",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Plans",href:"#"},{label:"Locations",href:"#"},{label:"Amenities",href:"#"},{label:"Contact",href:"#"}],cta:"Tour"}},
    {type:"hero",variant:"split",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"See Plans"}},
    {type:"features",variant:"grid",data:{items:[{icon:"🚀",title:"WiFi",desc:"Enterprise-grade."},{icon:"☕",title:"Coffee",desc:"Premium bar."},{icon:"🤝",title:"Community",desc:"Network."}]}},
    {type:"stats",variant:"compact",data:{items:[{num:"20+",label:"Locations"},{num:"5K+",label:"Members"},{num:"4.7★",label:"Rating"},{num:"24/7",label:"Access"}]}},
    {type:"cta",variant:"",data:{title:"Tour a Space",subtitle:"Free day pass.",cta:"Book a Tour"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Plans",links:[{label:"Hot Desk",href:"#"},{label:"Fixed Desk",href:"#"},{label:"Private Office",href:"#"},{label:"Virtual",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"Locations",href:"#"},{label:"Careers",href:"#"},{label:"Contact",href:"#"}]}]}},
  ]},
  {id:"landing-spa",name:"水疗/按摩 Spa",pageType:"landing",industry:["spa","水疗","massage","wellness","beauty","skincare"],keywords:["spa","水疗","massage","wellness","beauty","facial"],direction:"garden-bloom",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Treatments",href:"#"},{label:"Packages",href:"#"},{label:"Gallery",href:"#"},{label:"Contact",href:"#"}],cta:"Book"}},
    {type:"hero",variant:"split",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"View Treatments"}},
    {type:"features",variant:"grid",data:{items:[{icon:"💆",title:"Massage",desc:"Swedish, deep tissue."},{icon:"🧖",title:"Facials",desc:"Rejuvenating."},{icon:"🌿",title:"Body",desc:"Detox rituals."}]}},
    {type:"stats",variant:"compact",data:{items:[{num:"30+",label:"Treatments"},{num:"4.9★",label:"Rating"},{num:"10+",label:"Therapists"},{num:"15",label:"Years"}]}},
    {type:"cta",variant:"",data:{title:"Indulge Yourself",subtitle:"First-timers 20% off.",cta:"Book Treatment"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Treatments",links:[{label:"Massage",href:"#"},{label:"Facials",href:"#"},{label:"Body",href:"#"},{label:"Packages",href:"#"}]},{title:"Company",links:[{label:"About",href:"#"},{label:"Gallery",href:"#"},{label:"Gift Cards",href:"#"},{label:"Contact",href:"#"}]}]}},
  ]},
  {id:"landing-automotive",name:"汽车 Automotive",pageType:"landing",industry:["automotive","汽车","dealer","car","auto","dealership"],keywords:["automotive","car","dealer","auto","repair","service"],direction:"corporate-trust",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Inventory",href:"#"},{label:"Financing",href:"#"},{label:"Service",href:"#"},{label:"Contact",href:"#"}],cta:"Shop"}},
    {type:"hero",variant:"split",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"View Inventory"}},
    {type:"features",variant:"grid",data:{items:[{icon:"🚗",title:"New & Used",desc:"Quality vehicles."},{icon:"💰",title:"Financing",desc:"Flexible options."},{icon:"🔧",title:"Service",desc:"Certified techs."}]}},
    {type:"stats",variant:"compact",data:{items:[{num:"500+",label:"Vehicles"},{num:"4.7★",label:"Rating"},{num:"25+",label:"Years"},{num:"10K+",label:"Customers"}]}},
    {type:"cta",variant:"",data:{title:"Find Your Dream Car",subtitle:"Best prices guaranteed.",cta:"Browse Inventory"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Inventory",links:[{label:"New",href:"#"},{label:"Used",href:"#"},{label:"SUVs",href:"#"},{label:"Trucks",href:"#"}]},{title:"Service",links:[{label:"Repair",href:"#"},{label:"Maintenance",href:"#"},{label:"Parts",href:"#"},{label:"Financing",href:"#"}]}]}},
  ]},
  {id:"landing-gaming",name:"游戏/电竞 Gaming",pageType:"landing",industry:["gaming","游戏","esports","stream","console"],keywords:["gaming","游戏","esports","twitch","gamer","console"],direction:"night-owl",sections:[
    {type:"navbar",variant:"default",data:{logo:"{brand}",links:[{label:"Games",href:"#"},{label:"Team",href:"#"},{label:"Schedule",href:"#"},{label:"Shop",href:"#"}],cta:"Discord"}},
    {type:"hero",variant:"fullscreen",data:{title:"{brand}",subtitle:"{tagline} — {description}",cta:"Watch Live"}},
    {type:"stats",variant:"list",data:{items:[{num:"1M+",label:"Followers"},{num:"50+",label:"Tournaments"},{num:"$500K",label:"Prize Pool"},{num:"15",label:"Players"}]}},
    {type:"features",variant:"grid",data:{items:[{icon:"🎮",title:"Competitive",desc:"Highest level."},{icon:"📺",title:"Streaming",desc:"Watch on Twitch."},{icon:"👕",title:"Merch",desc:"Team apparel."}]}},
    {type:"cta",variant:"",data:{title:"Join the Game",subtitle:"Tryouts open.",cta:"Apply Now"}},{type:"footer",variant:"default",data:{description:"{brand}",columns:[{title:"Team",links:[{label:"Roster",href:"#"},{label:"Schedule",href:"#"},{label:"Results",href:"#"},{label:"Tryouts",href:"#"}]},{title:"Community",links:[{label:"Discord",href:"#"},{label:"Twitch",href:"#"},{label:"YouTube",href:"#"},{label:"Twitter",href:"#"}]}]}},
  ]},
  {id:"landing-blog",name:"博客/自媒体 Blog",pageType:"landing",industry:["blog","博客","writer","writing","newsletter","journal"],keywords:["blog","博客","writer","writing","newsletter","articles"],direction:"journalism",sections:[
    {type:"navbar",variant:"centered",data:{logo:"{brand}",links:[{label:"Articles",href:"#"},{label:"About",href:"#"},{label:"Newsletter",href:"#"},{label:"Search",href:"#"}],cta:""}},
    {type:"hero",variant:"editorial",data:{title:"{brand}",subtitle:"{tagline} — {description}"}},
    {type:"stats",variant:"compact",data:{items:[{num:"200+",label:"Articles"},{num:"50K+",label:"Readers"},{num:"10K+",label:"Subscribers"},{num:"5",label:"Years"}]}},
    {type:"features",variant:"list",data:{items:[{icon:"✍️",title:"Latest Posts",desc:"Read the latest."},{icon:"📬",title:"Newsletter",desc:"Get updates."},{icon:"💬",title:"Discussion",desc:"Share thoughts."}]}},
    {type:"cta",variant:"",data:{title:"Subscribe",subtitle:"Join 10K+ readers.",cta:"Subscribe Free"}},{type:"footer",variant:"minimal",data:{description:"{brand}"}},
  ]},
];

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[\s_\-\/\\,.;:!?()【】\[\]{}"'（）、。，；：！？]+/).filter(t => t.length > 1);
}

function idf(keywords: string[], allDocs: string[][]): Map<string, number> {
  const df = new Map<string, number>();
  for (const doc of allDocs) {
    const seen = new Set(doc);
    for (const term of seen) {
      df.set(term, (df.get(term) || 0) + 1);
    }
  }
  const total = allDocs.length;
  const idfMap = new Map<string, number>();
  for (const [term, count] of df) {
    idfMap.set(term, Math.log(1 + (total - count + 0.5) / (count + 0.5)));
  }
  return idfMap;
}

const ALL_DOCS = BLUEPRINTS.map(b => [...b.keywords, ...b.industry.map(i => i.toLowerCase())]);
const IDF_CACHE: Map<string, number> = idf([], ALL_DOCS);
(function precomputeIdf() {
  const allTerms = new Set<string>();
  for (const doc of ALL_DOCS) for (const t of doc) allTerms.add(t);
  for (const term of allTerms) {
    let count = 0;
    for (const doc of ALL_DOCS) if (doc.includes(term)) count++;
    IDF_CACHE.set(term, Math.log(1 + (ALL_DOCS.length - count + 0.5) / (count + 0.5)));
  }
})();

export function findBlueprint(task: string): { blueprint: Blueprint; confidence: number } {
  const lower = task.toLowerCase();
  const taskTokens = tokenize(task);
  let best: Blueprint | null = null;
  let bestScore = -Infinity;

  for (const bp of BLUEPRINTS) {
    let score = 0;
    const bpTokens = [...bp.keywords.map(k => k.toLowerCase()), ...bp.industry.map(i => i.toLowerCase())];

    // TF-IDF scoring
    for (const tok of taskTokens) {
      if (bpTokens.includes(tok)) {
        score += IDF_CACHE.get(tok) || 1;
      }
    }

    // Exact phrase bonus (2x)
    for (const kw of bp.keywords) {
      if (lower.includes(kw)) score += 2;
    }

    // Industry bonus (3x)
    for (const ind of bp.industry) {
      if (lower.includes(ind.toLowerCase())) score += 3;
    }

    // Page type boost
    if (bp.pageType === "landing" && /\b(landing|homepage|首页|落地|page|site)\b/.test(lower)) score += 1.5;
    if (bp.pageType === "dashboard" && /\b(dashboard|admin|后台)\b/.test(lower)) score += 3;
    if (bp.pageType === "app" && /\b(app|mobile|ios|android|手机|小程序)\b/.test(lower)) score += 3;

    if (score > bestScore) { bestScore = score; best = bp; }
  }

  if (!best) best = BLUEPRINTS[2]; // SaaS fallback
  const confidence = bestScore > 0 ? Math.min(bestScore / 15, 1) : 0.05;
  return { blueprint: best, confidence };
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
