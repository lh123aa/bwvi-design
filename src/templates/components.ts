// BWVI Component Library — 15+ composable components for --direct mode
// Each component returns HTML string given a config object

type Palette = { primary: string; accent: string; surface: string; text: string };

export function Navbar(config: { logo: string; links: { label: string; href: string }[]; cta?: string; palette: Palette }) {
  return `<header style="position:fixed;top:0;left:0;right:0;z-index:100;background:${config.palette.surface};border-bottom:1px solid ${config.palette.text}15;backdrop-filter:blur(12px)">
<div style="max-width:1200px;margin:0 auto;padding:0 24px;display:flex;justify-content:space-between;align-items:center;height:64px">
<a href="/" style="font-weight:700;font-size:1.25rem;color:${config.palette.primary};text-decoration:none;letter-spacing:-0.02em">${config.logo}</a>
<nav style="display:flex;gap:24px;list-style:none">${config.links.map(l => `<a href="${l.href}" style="text-decoration:none;font-size:0.875rem;color:${config.palette.text}99;transition:color 0.2s">${l.label}</a>`).join('')}</nav>
${config.cta ? `<button style="padding:8px 20px;background:${config.palette.primary};color:#fff;border:none;border-radius:4px;font-size:0.875rem;cursor:pointer">${config.cta}</button>` : ''}
</div></header>`;
}

export function Hero(config: { title: string; subtitle: string; cta?: string; palette: Palette; fullWidth?: boolean }) {
  const bg = config.fullWidth ? config.palette.primary : 'transparent';
  const color = config.fullWidth ? '#fff' : config.palette.text;
  return `<section style="min-height:80vh;display:flex;align-items:center;background:${bg};padding:80px 0">
<div style="max-width:1200px;margin:0 auto;padding:0 24px;width:100%">
<div style="max-width:640px">
<h1 style="font-size:clamp(2.5rem,5vw,4rem);font-weight:700;line-height:1.1;color:${color};margin-bottom:20px;letter-spacing:-0.03em">${config.title}</h1>
<p style="font-size:1.125rem;color:${config.fullWidth ? 'rgba(255,255,255,0.6)' : config.palette.text + '99'};line-height:1.8;margin-bottom:32px">${config.subtitle}</p>
${config.cta ? `<button style="padding:14px 32px;background:${config.palette.accent};color:#fff;border:none;border-radius:4px;font-size:1rem;cursor:pointer;transition:transform 0.2s">${config.cta}</button>` : ''}
</div></div></section>`;
}

export function StatsGrid(config: { items: { num: string; label: string }[]; palette: Palette }) {
  return `<section style="padding:80px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div style="display:grid;grid-template-columns:repeat(${Math.min(config.items.length, 4)},1fr);gap:24px">${config.items.map(i => `<div style="text-align:center;padding:32px"><div style="font-size:2.5rem;font-weight:700;color:${config.palette.accent};margin-bottom:4px">${i.num}</div><div style="font-size:0.875rem;color:${config.palette.text}88">${i.label}</div></div>`).join('')}
</div></div></section>`;
}

export function FeatureGrid(config: { items: { icon: string; title: string; desc: string }[]; palette: Palette; columns?: number }) {
  const cols = config.columns || 3;
  return `<section style="padding:80px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:24px">${config.items.map(i => `<div style="padding:32px;background:${config.palette.surface};border:1px solid ${config.palette.text}10;border-radius:8px;transition:transform 0.3s"><div style="font-size:1.5rem;margin-bottom:16px">${i.icon}</div><h3 style="font-size:1.125rem;font-weight:600;margin-bottom:8px">${i.title}</h3><p style="font-size:0.875rem;color:${config.palette.text}88;line-height:1.7">${i.desc}</p></div>`).join('')}
</div></div></section>`;
}

export function TestimonialGrid(config: { items: { quote: string; author: string; role: string }[]; palette: Palette }) {
  return `<section style="padding:80px 0;background:${config.palette.surface}"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div style="display:grid;grid-template-columns:repeat(${Math.min(config.items.length, 3)},1fr);gap:24px">${config.items.map(i => `<div style="padding:32px;border:1px solid ${config.palette.text}10;border-radius:8px"><p style="font-size:0.9375rem;color:${config.palette.text}88;line-height:1.8;margin-bottom:20px;font-style:italic">${i.quote}</p><div style="font-weight:600;font-size:0.875rem">${i.author}</div><div style="font-size:0.8125rem;color:${config.palette.text}66">${i.role}</div></div>`).join('')}
</div></div></section>`;
}

export function CTASection(config: { title: string; subtitle: string; cta: string; palette: Palette }) {
  return `<section style="padding:80px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div style="padding:64px;background:${config.palette.surface};border:1px solid ${config.palette.text}10;border-radius:12px;text-align:center">
<h2 style="font-size:2rem;font-weight:700;margin-bottom:12px">${config.title}</h2>
<p style="color:${config.palette.text}88;margin-bottom:32px">${config.subtitle}</p>
<button style="padding:14px 36px;background:${config.palette.accent};color:#fff;border:none;border-radius:4px;font-size:1rem;cursor:pointer">${config.cta}</button>
</div></div></section>`;
}

export function Footer(config: { description: string; columns: { title: string; links: { label: string; href: string }[] }[]; palette: Palette }) {
  return `<footer style="border-top:1px solid ${config.palette.text}10;padding:48px 0"><div style="max-width:1200px;margin:0 auto;padding:0 24px">
<div style="display:grid;grid-template-columns:2fr repeat(${config.columns.length},1fr);gap:48px">
<div><p style="font-size:0.875rem;color:${config.palette.text}77;line-height:1.8">${config.description}</p></div>
${config.columns.map(col => `<div><h4 style="font-size:0.8125rem;font-weight:600;margin-bottom:16px;text-transform:uppercase;letter-spacing:0.08em">${col.title}</h4><ul style="list-style:none">${col.links.map(l => `<li style="margin-bottom:8px"><a href="${l.href}" style="color:${config.palette.text}77;text-decoration:none;font-size:0.875rem">${l.label}</a></li>`).join('')}</ul></div>`).join('')}
</div>
<div style="border-top:1px solid ${config.palette.text}10;margin-top:32px;padding-top:24px;display:flex;justify-content:space-between;font-size:0.8125rem;color:${config.palette.text}66">
<span>2026 ${config.columns[0]?.title || 'Company'}</span><span>BWVI</span>
</div></div></footer>`;
}

export function PriceCard(config: { name: string; price: string; features: string[]; cta: string; palette: Palette; featured?: boolean }) {
  const border = config.featured ? `2px solid ${config.palette.accent}` : `1px solid ${config.palette.text}15`;
  return `<div style="padding:40px;background:${config.palette.surface};border:${border};border-radius:12px;position:relative;${config.featured ? 'transform:scale(1.02)' : ''}">
${config.featured ? `<div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:${config.palette.accent};color:#fff;padding:4px 16px;border-radius:12px;font-size:0.75rem;font-weight:600">Popular</div>` : ''}
<h3 style="font-size:1rem;font-weight:600;margin-bottom:4px">${config.name}</h3>
<div style="font-size:2.5rem;font-weight:700;margin-bottom:24px">${config.price}</div>
<ul style="list-style:none;margin-bottom:32px">${config.features.map(f => `<li style="padding:8px 0;border-bottom:1px solid ${config.palette.text}08;font-size:0.875rem">${f}</li>`).join('')}</ul>
<button style="width:100%;padding:12px;background:${config.featured ? config.palette.accent : 'transparent'};color:${config.featured ? '#fff' : config.palette.text};border:1px solid ${config.featured ? config.palette.accent : config.palette.text}30;border-radius:4px;cursor:pointer;font-size:0.875rem">${config.cta}</button>
</div>`;
}

export function Card(config: { title: string; desc: string; meta?: string; palette: Palette }) {
  return `<div style="padding:24px;background:${config.palette.surface};border:1px solid ${config.palette.text}08;border-radius:8px;transition:transform 0.2s">
<h3 style="font-size:1.125rem;font-weight:600;margin-bottom:8px">${config.title}</h3>
<p style="font-size:0.875rem;color:${config.palette.text}88;line-height:1.7;margin-bottom:12px">${config.desc}</p>
${config.meta ? `<div style="font-size:0.75rem;color:${config.palette.text}66">${config.meta}</div>` : ''}
</div>`;
}

export function Form(config: { fields: { label: string; type: string; placeholder?: string }[]; submit: string; palette: Palette }) {
  return `<form style="max-width:480px;margin:0 auto" onsubmit="event.preventDefault();alert('Demo')">
${config.fields.map(f => `<div style="margin-bottom:16px"><label style="display:block;font-size:0.875rem;font-weight:500;margin-bottom:4px">${f.label}</label>
<input type="${f.type}" placeholder="${f.placeholder || ''}" style="width:100%;padding:12px;border:1px solid ${config.palette.text}20;border-radius:4px;font-size:0.875rem;background:${config.palette.surface}"></div>`).join('')}
<button type="submit" style="width:100%;padding:14px;background:${config.palette.primary};color:#fff;border:none;border-radius:4px;font-size:0.875rem;cursor:pointer">${config.submit}</button></form>`;
}
