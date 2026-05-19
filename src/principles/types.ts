export type HarmonyMode =
  | "monochromatic"
  | "analogous"
  | "complementary"
  | "split-complementary"
  | "triadic"
  | "tetradic";

export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

export interface PaletteSpec {
  primary: HSLColor;
  accent: HSLColor;
  surface: HSLColor;
  text: HSLColor;
  harmonyMode: HarmonyMode;
  hueRange: { min: number; max: number };
  saturationRange: { min: number; max: number };
  luminanceRange: { min: number; max: number };
}

export type FontCategory = "serif" | "sans-serif" | "display" | "monospace" | "handwriting";

export interface FontSpec {
  name: string;
  category: FontCategory;
  stack: string;
  weightRange: { min: number; max: number };
}

export interface TypeScale {
  name: string;
  ratio: number;
  sizes: Record<string, number>;
}

export interface TypographyPairing {
  display: FontSpec;
  body: FontSpec;
  scale: TypeScale;
  rationale: string;
}

export interface GridSpec {
  columns: number;
  gutter: number;
  margin: number;
  maxWidth: number;
}

export type InformationDensity = "sparse" | "moderate" | "dense";

export interface SpacingRhythm {
  baseUnit: number;
  scale: number[];
  rationale: string;
}

export interface LayoutSpec {
  grid: GridSpec;
  density: InformationDensity;
  rhythm: SpacingRhythm;
  visualWeight: number;
}

export type StyleAttribute = "minimal" | "ornate" | "bold" | "subtle" | "warm" | "cool" | "formal" | "playful" | "modern" | "classic" | "organic" | "geometric" | "dark" | "light" | "clean" | "corporate" | "colorful" | "serif" | "natural" | "luxury" | "dramatic" | "airy";

export interface StyleProfile {
  attributes: StyleAttribute[];
  temperature: number;
}

export interface CompositionOption {
  id: string;
  name: string;
  rationale: string;
  palette: PaletteSpec;
  typography: TypographyPairing;
  layout: LayoutSpec;
  style: StyleProfile;
  confidence: number;
}

export interface DesignPrinciple {
  name: string;
  description: string;
  category: "color" | "typography" | "layout" | "style";
  check: (...args: unknown[]) => { passed: boolean; reason?: string };
}
