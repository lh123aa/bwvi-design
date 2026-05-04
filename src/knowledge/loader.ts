const EMBEDDED_KNOWLEDGE: Record<string, string> = {
  "direction-advisor": `
方向顾问: 分析用户任务后，从 5 个基础方向中推荐 3 个差异化的视觉方向。
1. editorial-monocle: 编辑式排版、克制底色+单 accent、文字驱动
2. warm-minimal: 温暖、大留白、暖米色基底、自然材质感
3. tech-utility: 科技感、中性色、数据驱动、干净利落
4. dark-luxury: 深色满版、高对比、金属 accent、大标题
5. playful-color: 丰富色彩、有机形状、轻松感、插画友好
`,
  "color-theory": `
色板规则:
1. 品牌色优先。无品牌时从方向推导
2. 只使用 1 个 accent 色，每屏 ≤2 次
3. 使用 oklch 色彩空间
4. 基础色板: primary / accent / surface / text / semantic
`,
  "typography-pairing": `
字体规则:
1. display ≠ body，必须不同字体家族
2. display: Newsreader / Fraunces / Space Grotesk / Syne
3. body: Inter / Source Sans 3 / DM Sans / system-ui
4. 中文: Noto Sans SC / Source Han Sans SC
5. font scale: [12, 14, 16, 20, 24, 32, 48, 64]
`,
  "layout-patterns": `
布局模式:
1. Hero + Features + CTA: 标准营销页，适合 landing page
2. Sidebar + Main: 文档/博客，三栏或两栏
3. Card Grid: 作品集/文章列表，2-4 列响应式
4. Dashboard: 左侧导航 + 顶部栏 + 卡片网格
5. Split Screen: 左右分屏，图文对比
6. Full-width Sections: 全宽交替区块，适合品牌站
7. Masonry: 瀑布流，适合作品集
8. Single Column: 窄排版，适合长文阅读
`,
  "motion-principles": `
动效原则:
1. 不要为了动效而动效——每处动画必须有功能目的
2. 导航/按钮 hover 用 150-200ms ease-out
3. 页面入场用 300-500ms，stagger 子元素
4. 退出动画比入场快 (200ms)
5. 避免同时动画超过 3 个元素
6. 使用 cubic-bezier 而不是预设 ease
7. 减少动效偏好: prefers-reduced-motion
`,
  "content-guidelines": `
内容规则:
1. 不要 lorem ipsum，不要 placeholder 文本
2. 每个标题必须有信息量，不只是"Feature One"
3. 数据真实或标注 placeholder
4. 不要 emoji 作图标
5. 文案语气一致，不混合"专业"和"俏皮"
6. 英文+中文混排时注意字间距
7. 数字用阿拉伯数字，百分比用 %
`,
  "brand-protocol": `
品牌资产协议 (5步):
1. 问: 清单式问用户要 logo/色值/字体
2. 搜: 官网 → press kit → 社媒 → App Store
3. 下载: logo 找 SVG，产品图找 2000px+
4. 验: grep 真实 hex 色值，过滤黑白灰
5. 写: brand-spec.md，HTML 用 CSS 变量引用
Logo 必须真实 SVG/PNG，不用 CSS 剪影代替。
`,
  "component-specs": `
组件规格:
1. Button: 14-16px, 10-16px padding, 4-8px radius, 两种变体(实心/线框)
2. Card: 背景白色/浅色, 16-24px padding, 4-12px radius, 可选阴影
3. Navbar: 固定顶部, 64-80px 高度, logo + 链接 + CTA
4. Footer: 4 列网格, logo + 描述 + 链接 + 版权
5. Input: 12-14px, 12px padding, 4px radius, 标签在上
6. Modal: 居中, 背景遮罩, 关闭按钮, 至少 320px 宽
7. Tabs: 水平排列, 下划线指示 active
`,
  "spacing-system": `
间距系统:
1. 基准单位 8px
2. 常用间距: 4, 8, 16, 24, 32, 48, 64, 96, 128
3. 内边距 (padding): 卡片 24px, 页面 24-48px
4. 外边距 (gap): 元素间 16-24px, 区块间 64-96px
5. 行高: 标题 1.2-1.3, 正文 1.6-1.8
6. 段落间距: 1em 或 16px
7. 列宽: 12 列栅格, 最大宽度 1120-1200px
`,
  "responsive-breakpoints": `
响应式断点:
1. 桌面: ≥1024px, 12 列
2. 平板: 768-1023px, 8 列
3. 手机: <768px, 4 列, 单栏
4. 导航: 桌面显示链接，手机汉堡菜单
5. 字体: 手机 h1 = 桌面 h1 的 70% 大小
6. 触控: 所有可点击元素 ≥44px
`,
  "icon-guidelines": `
图标规则:
1. 使用 1.5-2px stroke 的 SVG，不用 emoji
2. 图标用 currentColor 继承文本色
3. 尺寸: 内联图标 14-16px, 功能图标 20-24px
4. 带图标的按钮: 图标在左侧，间距 8px
5. 不要每个标题都配图标
6. SVG 必须有 viewBox 和 role="img"
`,
  "image-guidelines": `
图片规则:
1. 产品图用真实照片，不用 CSS 剪影
2. logo 用真实 SVG/PNG，不重画
3. 配图使用 Unsplash/Pexels 等真实来源
4. 图片必须包含 alt 文本
5. hero 图片建议 1920x1080+，卡片图建议 16:9
6. 使用 loading="lazy" 延迟加载
7. 有文字叠加的图片需要暗色 overlay
`,
  "form-design": `
表单设计:
1. 标签在输入框上方，不在内部
2. 错误信息在对应字段下方
3. 提交按钮左对齐，不是居中
4. 选填字段标注 Optional
5. 输入框高度 44px+，保证触控
6. 成功提交后有反馈提示
7. 长表单分步骤，显示进度
`,
  "navigation-patterns": `
导航模式:
1. Top Nav: 标准营销站，logo 左 + 链接中 + CTA 右
2. Sidebar: 文档/后台，左侧持久导航
3. Sticky: 滚动时固定顶部
4. Breadcrumb: 深层页面，层级指示
5. Tab Bar: 移动端，底部 4-5 个 tab
6. Dot Nav: 单页长滚动，侧边圆点指示
7. 导航链接不超过 6 项，多了用下拉
`,
  "data-visualization": `
数据可视化:
1. 数字指标: 大数字 + 标签 + 可选趋势箭头
2. 图表: 简化为 CSS/SVG，复杂用 Chart.js
3. 对比: 并排卡片，顶部分类标签
4. 进度: 进度条或环形进度
5. 列表: 带数字编号或圆点
6. 表格: 斑马条纹，表头加粗，响应式滚动
7. 避免 3D 图表和装饰性数据
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
