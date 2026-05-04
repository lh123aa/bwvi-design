const EMBEDDED_KNOWLEDGE: Record<string, string> = {
  "direction-advisor": `
你是一位设计方向顾问。分析用户任务后，从以下 5 个基础方向中推荐 3 个差异化的视觉方向。
每个方向需要给出：名称（name）、一句话理由（rationale）、3 个关键词（keywords）。

基础方向库:
1. editorial-monocle: 编辑式排版、克制底色+单 accent、文字驱动
   - 适合: 内容型产品、品牌调性强的场景
   - 关键词: 编辑式、克制、文字驱动、单 accent

2. warm-minimal: 温暖、大留白、暖米色基底、自然材质感
   - 适合: 消费品、生活方式、注重温度的品牌
   - 关键词: 温暖、留白、自然、柔和

3. tech-utility: 科技感、中性色、数据驱动、干净利落
   - 适合: SaaS、开发者工具、B2B 产品
   - 关键词: 科技、中性色、数据驱动、干净

4. dark-luxury: 深色满版、高对比、金属 accent、大标题
   - 适合: 高端品牌、发布会、视觉冲击型场景
   - 关键词: 深色、高对比、奢华、大胆

5. playful-color: 丰富色彩、有机形状、轻松感、插画友好
   - 适合: 创意行业、教育、儿童/年轻受众
   - 关键词: 多彩、有机、轻松、创意

输出格式: 数组形式的 3 个推荐方向，每个包含 name / rationale / keywords。
`,
  "color-theory": `
色板决策规则：
1. 品牌色优先——如果任务涉及品牌，使用品牌色作为基础
2. 无品牌时从选定方向推导色板
3. 只使用 1 个 accent 色——多 accent 会分散视觉焦点
4. accent 色在每屏中可见使用不超过 2 次
5. 使用 oklch 色彩空间以确保色板和谐
6. 基础色板包含: primary / accent / surface / text / semantic 色
`,
  "typography-pairing": `
字体决策规则：
1. display 和 body 必须使用不同字体家族
2. display 选择有特点的字体: Newsreader / Fraunces / Space Grotesk / Syne
3. body 选择可读性优先的字体: Inter / Source Sans 3 / DM Sans / system-ui
4. 中文字体场景: Noto Sans SC / Source Han Sans SC
5. font scale 至少包含 6 级: [12, 14, 16, 20, 24, 32, 48, 64]
`,
};

export function loadChunk(id: string): string | null {
  return EMBEDDED_KNOWLEDGE[id] ?? null;
}

export function listChunks(): string[] {
  return Object.keys(EMBEDDED_KNOWLEDGE);
}

export function loadMultiple(ids: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const id of ids) {
    const chunk = loadChunk(id);
    if (chunk) result[id] = chunk;
  }
  return result;
}
