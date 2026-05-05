type Palette = { primary: string; accent: string; surface: string; text: string; muted?: string };

type HeroVariant = "fullscreen" | "centered" | "split" | "editorial";
type GridVariant = "grid" | "list" | "compact";
type CardStyle = "flat" | "elevated" | "bordered";
type NavStyle = "default" | "transparent" | "centered";

interface AnimConfig {
  animation?: boolean;
}

interface DarkConfig {
  dark?: boolean;
}

type BaseConfig = AnimConfig & DarkConfig & { palette: Palette; fontDisplay?: string; fontBody?: string };

const FONT_DISPLAY = "'Inter', system-ui, -apple-system, sans-serif";
const FONT_BODY = "system-ui, -apple-system, sans-serif";

function p(c: BaseConfig): Palette {
  return { ...c.palette, muted: c.palette.muted || c.palette.text + "88" };
}

function animClass(base: BaseConfig, name: string, delay?: string): string {
  return base.animation ? ` class="${name}${delay ? ' ' + delay : ''}"` : '';
}

function darkCSS(base: BaseConfig, selector: string, rules: string): string {
  if (!base.dark) return '';
  return `[data-theme="dark"] ${selector} { ${rules} }`;
}

export function getBaseStyles(base: BaseConfig): string {
  const a = base.animation ? `
@keyframes bwvi-fade-up{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes bwvi-fade-in{from{opacity:0}to{opacity:1}}
@keyframes bwvi-scale-in{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
@keyframes bwvi-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.bwvi-fade-up{animation:bwvi-fade-up .6s ease-out both}
.bwvi-fade-in{animation:bwvi-fade-in .5s ease-out both}
.bwvi-scale-in{animation:bwvi-scale-in .4s ease-out both}
${[1,2,3,4,5,6].map(i => `.bwvi-d${i}{animation-delay:${i*0.1}s}`).join('\n')}
.bwvi-stagger>*{animation:bwvi-fade-up .5s ease-out both}
${[1,2,3,4,5,6].map(i => `.bwvi-stagger>*:nth-child(${i}){animation-delay:${i*0.08}s}`).join('\n')}
` : '';
  const d = base.dark ? `[data-theme="dark"]{color-scheme:dark}
[data-theme="dark"] body{background:#111;color:#e0e0e0}
.bwvi-dark-bg{background:#1a1a1a!important}
.bwvi-dark-surface{background:#222!important}
.bwvi-dark-border{border-color:#333!important}
` : '';
  return a + d;
}

export function Navbar(config: BaseConfig & {
  logo: string; links: { label: string; href: string }[];
  cta?: string; style?: NavStyle;
}) {
  const s = config.style || "default";
  const pl = p(config);
  const bg = s === "transparent" ? "transparent" : pl.surface;
  const border = s === "centered" ? "none" : `1px solid ${pl.text}15`;
  const pos = s === "transparent" ? "absolute" : "fixed";
  return `<header style="position:${pos};top:0;left:0;right:0;z-index:100;background:${bg};border-bottom:${border};backdrop-filter:blur(12px)"${animClass(config,'bwvi-fade-up')}>
<div style="max-width:1200px;margin:0 auto;padding:0 24px;display:flex;justify-content:${s==='centered'?'center':'space-between'};align-items:center;height:64px">
<a href="/" style="font-weight:700;font-size:1.25rem;color:${pl.primary};text-decoration:none;letter-spacing:-0.02em">${config.logo}</a>
<nav style="display:flex;gap:${s==='centered'?'32':'24'}px;list-style:none">${config.links.map(l => `<a href="${l.href}" style="text-decoration:none;font-size:0.875rem;color:${pl.text}99;transition:color 0.2s">${l.label}</a>`).join('')}</nav>
${!config.cta || s==='centered' ? '' : `<button style="padding:8px 20px;background:${pl.primary};color:#fff;border:none;border-radius:8px;font-size:0.875rem;cursor:pointer;transition:opacity 0.2s">${config.cta}</button>`}
</div></header>
${darkCSS(config,'header',`background:#1a1a1a!important;border-color:#333!important`)}`;
}

export function Hero(config: BaseConfig & {
  title: string; subtitle: string; cta?: string;
  variant?: HeroVariant;
}) {
  const v = config.variant || "centered";
  const pl = p(config);
  const fd = config.fontDisplay || FONT_DISPLAY;

  const variants: Record<HeroVariant, string> = {
    fullscreen: `<section style="min-height:100vh;display:flex;align-items:center;justify-content:center;text-align:center;background:${pl.primary};padding:40px">
<div style="max-width:720px">
<h1 style="font-size:clamp(2.5rem,5vw,4.5rem);font-weight:700;line-height:1.1;color:#fff;margin-bottom:20px;letter-spacing:-0.03em;font-family:${fd}"${animClass(config,'bwvi-fade-up')}>${config.title}</h1>
<p style="font-size:1.125rem;color:rgba(255,255,255,0.65);line-height:1.8;margin-bottom:32px;max-width:560px;margin-left:auto;margin-right:auto"${animClass(config,'bwvi-fade-up','bwvi-d1')}>${config.subtitle}</p>
${config.cta ? `<button style="padding:14px 36px;background:${pl.accent};color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer;transition:transform 0.2s,box-shadow 0.2s;font-weight:500"${animClass(config,'bwvi-fade-up','bwvi-d2')}>${config.cta}</button>` : ''}
</div></section>`,

    centered: `<section style="min-height:80vh;display:flex;align-items:center;padding:80px 0">
<div style="max-width:1200px;margin:0 auto;padding:0 24px;width:100%">
<div style="max-width:640px">
<h1 style="font-size:clamp(2rem,4vw,3.5rem);font-weight:700;line-height:1.15;color:${pl.text};margin-bottom:20px;letter-spacing:-0.03em;font-family:${fd}"${animClass(config,'bwvi-fade-up')}>${config.title}</h1>
<p style="font-size:1.125rem;color:${pl.muted || pl.text+'99'};line-height:1.8;margin-bottom:32px"${animClass(config,'bwvi-fade-up','bwvi-d1')}>${config.subtitle}</p>
${config.cta ? `<button style="padding:14px 32px;background:${pl.accent};color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer;transition:transform 0.2s;font-weight:500">${config.cta}</button>` : ''}
</div></div></section>`,

    split: `<section style="min-height:80vh;display:grid;grid-template-columns:1fr 1fr;align-items:center;padding:80px 0">
<div style="padding:0 24px 0 80px">
<h1 style="font-size:clamp(2rem,4vw,3.5rem);font-weight:700;line-height:1.15;color:${pl.text};margin-bottom:20px;letter-spacing:-0.03em;font-family:${fd}"${animClass(config,'bwvi-fade-up')}>${config.title}</h1>
<p style="font-size:1.125rem;color:${pl.muted || pl.text+'99'};line-height:1.8;margin-bottom:32px"${animClass(config,'bwvi-fade-up','bwvi-d1')}>${config.subtitle}</p>
${config.cta ? `<button style="padding:14px 32px;background:${pl.primary};color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer;font-weight:500">${config.cta}</button>` : ''}
</div>
<div style="background:linear-gradient(135deg,${pl.primary}15,${pl.accent}15);min-height:60vh;display:flex;align-items:center;justify-content:center;border-radius:12px;margin:24px">
<span style="opacity:0.3;font-size:0.875rem">Image</span>
</div>
</section>`,

    editorial: `<section style="padding:120px 0 80px;max-width:960px;margin:0 auto;padding-left:24px;padding-right:24px">
<div${animClass(config,'bwvi-fade-up')}>
<p style="font-size:0.875rem;text-transform:uppercase;letter-spacing:0.1em;color:${pl.accent};margin-bottom:16px;font-weight:600">${config.subtitle.length > 60 ? config.subtitle : 'Feature'}</p>
<h1 style="font-size:clamp(2.5rem,5vw,4.5rem);font-weight:700;line-height:1.1;color:${pl.text};letter-spacing:-0.03em;font-family:${fd}">${config.title}</h1>
${config.subtitle.length <= 60 ? '' : `<p style="font-size:1.25rem;color:${pl.muted || pl.text+'99'};max-width:640px;margin-top:24px;line-height:1.7">${config.subtitle}</p>`}
</div>
<div style="width:80px;height:4px;background:${pl.accent};margin-top:32px;border-radius:2px"${animClass(config,'bwvi-scale-in','bwvi-d2')}></div>
</section>`,
  };

  return variants[v];
}

export function StatsGrid(config: BaseConfig & {
  items: { num: string; label: string }[];
  variant?: GridVariant;
}) {
  const v = config.variant || "grid";
  const pl = p(config);
  const cols = Math.min(config.items.length, 4);

  if (v === "compact") {
    return `<section style="padding:60px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:16px">${config.items.map((i, idx) => `<div style="padding:20px;background:${pl.surface};border-radius:8px;border:1px solid ${pl.text}10;text-align:center"${animClass(config,'bwvi-fade-up',`bwvi-d${idx+1}`)}>
<div style="font-size:2rem;font-weight:700;color:${pl.accent}">${i.num}</div>
<div style="font-size:0.8125rem;color:${pl.muted || pl.text+'77'}">${i.label}</div>
</div>`).join('')}
</div></div></section>`;
  }

  if (v === "list") {
    return `<section style="padding:60px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div style="display:flex;gap:32px;justify-content:center;flex-wrap:wrap">${config.items.map((i, idx) => `<div style="text-align:center;padding:16px 32px"${animClass(config,'bwvi-fade-up',`bwvi-d${idx+1}`)}>
<div style="font-size:3rem;font-weight:700;color:${pl.accent};line-height:1">${i.num}</div>
<div style="font-size:0.9375rem;color:${pl.muted || pl.text+'77'};margin-top:8px">${i.label}</div>
</div>`).join('')}
</div></div></section>`;
  }

  return `<section style="padding:80px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div class="bwvi-stagger" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:24px">${config.items.map(i => `<div style="text-align:center;padding:32px;background:${pl.surface};border-radius:12px">
<div style="font-size:2.5rem;font-weight:700;color:${pl.accent};margin-bottom:4px">${i.num}</div>
<div style="font-size:0.875rem;color:${pl.muted || pl.text+'88'}">${i.label}</div>
</div>`).join('')}
</div></div></section>`;
}

export function FeatureGrid(config: BaseConfig & {
  items: { icon: string; title: string; desc: string }[];
  columns?: number;
  variant?: GridVariant;
}) {
  const v = config.variant || "grid";
  const cols = config.columns || 3;
  const pl = p(config);

  if (v === "list") {
    return `<section style="padding:80px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div style="display:flex;flex-direction:column;gap:16px">${config.items.map((i, idx) => `<div style="display:grid;grid-template-columns:48px 1fr;gap:16px;padding:20px;background:${pl.surface};border-radius:8px;align-items:start"${animClass(config,'bwvi-fade-up',`bwvi-d${idx+1}`)}>
<div style="font-size:1.5rem;width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:${pl.primary}15;border-radius:8px">${i.icon}</div>
<div><h3 style="font-size:1rem;font-weight:600;margin-bottom:4px">${i.title}</h3><p style="font-size:0.875rem;color:${pl.muted || pl.text+'88'};line-height:1.7">${i.desc}</p></div>
</div>`).join('')}
</div></div></section>`;
  }

  if (v === "compact") {
    return `<section style="padding:60px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div style="display:grid;grid-template-columns:repeat(${Math.min(cols,4)},1fr);gap:16px">${config.items.map(i => `<div style="padding:20px;border:1px solid ${pl.text}10;border-radius:8px">
<div style="font-size:1.25rem;margin-bottom:8px">${i.icon}</div>
<h3 style="font-size:0.9375rem;font-weight:600;margin-bottom:4px">${i.title}</h3>
<p style="font-size:0.8125rem;color:${pl.muted || pl.text+'77'};line-height:1.6">${i.desc}</p>
</div>`).join('')}
</div></div></section>`;
  }

  return `<section style="padding:80px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div class="bwvi-stagger" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:24px">${config.items.map(i => `<div style="padding:32px;background:${pl.surface};border:1px solid ${pl.text}10;border-radius:12px;transition:transform 0.3s,box-shadow 0.3s;cursor:default">
<div style="font-size:1.5rem;margin-bottom:16px;width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:${pl.primary}15;border-radius:10px">${i.icon}</div>
<h3 style="font-size:1.125rem;font-weight:600;margin-bottom:8px">${i.title}</h3>
<p style="font-size:0.875rem;color:${pl.muted || pl.text+'88'};line-height:1.7">${i.desc}</p>
</div>`).join('')}
</div></div></section>`;
}

export function TestimonialGrid(config: BaseConfig & {
  items: { quote: string; author: string; role: string }[];
  variant?: GridVariant;
}) {
  const v = config.variant || "grid";
  const pl = p(config);
  const cols = Math.min(config.items.length, 3);

  if (v === "compact") {
    return `<section style="padding:60px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:16px">${config.items.map(i => `<div style="padding:20px;border:1px solid ${pl.text}10;border-radius:8px">
<p style="font-size:0.875rem;color:${pl.muted || pl.text+'77'};margin-bottom:12px;font-style:italic">${i.quote}</p>
<div style="font-weight:600;font-size:0.8125rem">${i.author}</div>
<div style="font-size:0.75rem;color:${pl.muted || pl.text+'55'}">${i.role}</div>
</div>`).join('')}
</div></div></section>`;
  }

  return `<section style="padding:80px 0;background:${pl.surface}"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div class="bwvi-stagger" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:24px">${config.items.map(i => `<div style="padding:32px;border:1px solid ${pl.text}10;border-radius:12px">
<p style="font-size:0.9375rem;color:${pl.muted || pl.text+'88'};line-height:1.8;margin-bottom:20px;font-style:italic">${i.quote}</p>
<div style="display:flex;align-items:center;gap:12px">
<div style="width:40px;height:40px;border-radius:50%;background:${pl.primary}20;display:flex;align-items:center;justify-content:center;font-size:0.875rem;font-weight:600;color:${pl.primary}">${i.author[0]}</div>
<div><div style="font-weight:600;font-size:0.875rem">${i.author}</div><div style="font-size:0.8125rem;color:${pl.muted || pl.text+'66'}">${i.role}</div></div>
</div></div>`).join('')}
</div></div></section>`;
}

export function CTASection(config: BaseConfig & {
  title: string; subtitle: string; cta: string;
}) {
  const pl = p(config);
  return `<section style="padding:80px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div style="padding:64px;background:linear-gradient(135deg,${pl.primary}08,${pl.accent}08);border:1px solid ${pl.text}10;border-radius:16px;text-align:center"${animClass(config,'bwvi-fade-up')}>
<h2 style="font-size:2rem;font-weight:700;margin-bottom:12px;color:${pl.text}">${config.title}</h2>
<p style="color:${pl.muted || pl.text+'88'};margin-bottom:32px;max-width:520px;margin-left:auto;margin-right:auto">${config.subtitle}</p>
<button style="padding:14px 36px;background:${pl.accent};color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer;font-weight:500;transition:transform 0.2s">${config.cta}</button>
</div></div></section>
${darkCSS(config,'section > div','background:#1a1a1a!important')}`;
}

export function Footer(config: BaseConfig & {
  description: string;
  columns: { title: string; links: { label: string; href: string }[] }[];
  style?: "default" | "minimal";
}) {
  const s = config.style || "default";
  const pl = p(config);
  if (s === "minimal") {
    return `<footer style="border-top:1px solid ${pl.text}10;padding:32px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px;display:flex;justify-content:space-between;align-items:center;font-size:0.8125rem;color:${pl.muted || pl.text+'66'}">
<span>${config.description}</span>
<span>© 2026</span>
</div></footer>`;
  }
  return `<footer style="border-top:1px solid ${pl.text}10;padding:48px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div style="display:grid;grid-template-columns:2fr repeat(${config.columns.length},1fr);gap:48px">
<div><p style="font-size:0.875rem;color:${pl.muted || pl.text+'77'};line-height:1.8">${config.description}</p></div>
${config.columns.map(col => `<div><h4 style="font-size:0.8125rem;font-weight:600;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.08em;color:${pl.text}">${col.title}</h4><ul style="list-style:none">${col.links.map(l => `<li style="margin-bottom:8px"><a href="${l.href}" style="color:${pl.muted || pl.text+'77'};text-decoration:none;font-size:0.875rem">${l.label}</a></li>`).join('')}</ul></div>`).join('')}
</div>
<div style="border-top:1px solid ${pl.text}10;margin-top:32px;padding-top:24px;display:flex;justify-content:space-between;font-size:0.8125rem;color:${pl.muted || pl.text+'66'}">
<span>2026 ${config.columns[0]?.title || 'Company'}</span><span>BWVI</span>
</div></div></footer>`;
}

export function PriceCard(config: BaseConfig & {
  name: string; price: string; features: string[]; cta: string;
  featured?: boolean;
}) {
  const pl = p(config);
  const border = config.featured ? `2px solid ${pl.accent}` : `1px solid ${pl.text}15`;
  return `<div style="padding:40px;background:${pl.surface};border:${border};border-radius:16px;position:relative;${config.featured ? 'transform:scale(1.02)' : ''}"${animClass(config,'bwvi-scale-in')}>
${config.featured ? `<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${pl.accent};color:#fff;padding:4px 16px;border-radius:20px;font-size:0.75rem;font-weight:600">Popular</div>` : ''}
<h3 style="font-size:1rem;font-weight:600;margin-bottom:4px;color:${pl.text}">${config.name}</h3>
<div style="font-size:2.5rem;font-weight:700;margin-bottom:24px;color:${pl.text}">${config.price}</div>
<ul style="list-style:none;margin-bottom:32px">${config.features.map(f => `<li style="padding:10px 0;border-bottom:1px solid ${pl.text}08;font-size:0.875rem;color:${pl.text}cc">${f}</li>`).join('')}</ul>
<button style="width:100%;padding:12px;background:${config.featured ? pl.accent : 'transparent'};color:${config.featured ? '#fff' : pl.text};border:1px solid ${config.featured ? pl.accent : pl.text+'30'};border-radius:8px;cursor:pointer;font-size:0.875rem;font-weight:500">${config.cta}</button>
</div>`;
}

export function Card(config: BaseConfig & {
  title: string; desc: string; meta?: string;
  style?: CardStyle;
}) {
  const st = config.style || "flat";
  const pl = p(config);
  let shadow = '';
  let border = `1px solid ${pl.text}08`;
  if (st === "elevated") { shadow = `0 4px 24px ${pl.text}10`; border = 'none'; }
  if (st === "bordered") { border = `1px solid ${pl.text}20`; }
  return `<div style="padding:24px;background:${pl.surface};border:${border};border-radius:12px;box-shadow:${shadow};transition:transform 0.2s,box-shadow 0.2s"${animClass(config,'bwvi-fade-up')}>
<h3 style="font-size:1.125rem;font-weight:600;margin-bottom:8px;color:${pl.text}">${config.title}</h3>
<p style="font-size:0.875rem;color:${pl.muted || pl.text+'88'};line-height:1.7;margin-bottom:12px">${config.desc}</p>
${config.meta ? `<div style="font-size:0.75rem;color:${pl.muted || pl.text+'66'}">${config.meta}</div>` : ''}
</div>`;
}

export function Form(config: BaseConfig & {
  fields: { label: string; type: string; placeholder?: string }[];
  submit: string;
}) {
  const pl = p(config);
  return `<form style="max-width:480px;margin:0 auto;padding:40px;background:${pl.surface};border-radius:12px;border:1px solid ${pl.text}10" onsubmit="event.preventDefault();alert('Demo')"${animClass(config,'bwvi-fade-up')}>
${config.fields.map(f => `<div style="margin-bottom:20px"><label style="display:block;font-size:0.875rem;font-weight:500;margin-bottom:6px;color:${pl.text}">${f.label}</label>
<input type="${f.type}" placeholder="${f.placeholder || ''}" style="width:100%;padding:12px 14px;border:1px solid ${pl.text}20;border-radius:8px;font-size:0.875rem;background:${pl.surface};color:${pl.text};outline:none;transition:border-color 0.2s"></div>`).join('')}
<button type="submit" style="width:100%;padding:14px;background:${pl.primary};color:#fff;border:none;border-radius:8px;font-size:0.875rem;cursor:pointer;font-weight:500;transition:opacity 0.2s">${config.submit}</button></form>`;
}

export function StatsCounter(config: BaseConfig & {
  items: { value: string; label: string; prefix?: string; suffix?: string }[];
  columns?: number;
}) {
  const pl = p(config);
  const cols = config.columns || Math.min(config.items.length, 4);
  return `<section style="padding:80px 0;background:${pl.surface}"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div class="bwvi-stagger" style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:32px;text-align:center">${config.items.map(i => `<div>
<div style="font-size:3rem;font-weight:700;color:${pl.accent};line-height:1.2">${i.prefix||''}${i.value}${i.suffix||''}</div>
<div style="font-size:0.9375rem;color:${pl.muted || pl.text+'77'};margin-top:8px">${i.label}</div>
</div>`).join('')}
</div></div></section>`;
}

export function Timeline(config: BaseConfig & {
  items: { year: string; title: string; desc: string }[];
}) {
  const pl = p(config);
  return `<section style="padding:80px 0"><div style="max-width:800px;margin:0 auto;padding:0 24px">
<div style="position:relative">${config.items.map((i, idx) => `<div style="display:grid;grid-template-columns:80px 1fr;gap:24px;padding-bottom:40px;position:relative"${animClass(config,'bwvi-fade-up',`bwvi-d${idx+1}`)}>
<div style="font-size:1.5rem;font-weight:700;color:${pl.accent}">${i.year}</div>
<div><h3 style="font-size:1.125rem;font-weight:600;margin-bottom:4px">${i.title}</h3>
<p style="font-size:0.875rem;color:${pl.muted || pl.text+'88'};line-height:1.7">${i.desc}</p></div>
</div>`).join('')}
</div></div></section>`;
}

export function NavDrawer(config: BaseConfig & {
  links: { label: string; href: string }[];
  cta?: string;
}) {
  const pl = p(config);
  return `<nav style="display:flex;flex-direction:column;gap:8px;padding:16px;background:${pl.surface};border-radius:12px;border:1px solid ${pl.text}10">
${config.links.map(l => `<a href="${l.href}" style="padding:12px 16px;text-decoration:none;color:${pl.text}cc;font-size:0.9375rem;border-radius:8px;transition:background 0.2s">${l.label}</a>`).join('')}
${config.cta ? `<button style="margin-top:8px;padding:12px;background:${pl.primary};color:#fff;border:none;border-radius:8px;font-size:0.9375rem;cursor:pointer">${config.cta}</button>` : ''}
</nav>`;
}
