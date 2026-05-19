/**
 * palettes.ts — 共享色板与字体常量（10 种设计方向）
 *
 * 同时被 page-builder.ts 和 mcp/server.ts 引用，
 * 确保两端的色板/字体数据一致。
 * 修改此文件 = 同步修改所有后端。
 */

export interface DirectionPalette {
  primary: string;
  accent: string;
  surface: string;
  text: string;
}

export const DIRECTION_PALETTES: Record<string, DirectionPalette> = {
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

export const DIRECTION_FONTS: Record<string, string> = {
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

/** 所有方向的名称列表（用于 MCP enum 等场景） */
export const DIRECTION_NAMES = Object.keys(DIRECTION_PALETTES);

/** 获取方向的色板，未知方向回退到 tech-utility */
export function getPalette(direction: string): DirectionPalette {
  return DIRECTION_PALETTES[direction] || DIRECTION_PALETTES["tech-utility"];
}

/** 获取方向的字体栈，未知方向回退到 tech-utility */
export function getFontStack(direction: string): string {
  return DIRECTION_FONTS[direction] || DIRECTION_FONTS["tech-utility"];
}
