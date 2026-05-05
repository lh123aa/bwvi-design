export interface SlopIssue {
  type: string;
  severity: "error" | "warning";
  message: string;
  line?: number;
}

export interface SlopReport {
  clean: boolean;
  issues: SlopIssue[];
  score: number;
}

const CHECKS: { type: string; severity: "error" | "warning"; test: (html: string) => string | null }[] = [
  {
    type: "purple-gradient",
    severity: "warning",
    test: (h) => {
      const matches = h.match(/(?:linear|radial)-gradient[^;]*?(?:purple|#7[BC][0-9A-F]{2}|#[89A][0-9A-F]{2}[0-9A-F])/gi);
      return matches ? `检测到紫色渐变 (${matches.length} 处)，建议使用品牌色板中的 accent 色` : null;
    },
  },
  {
    type: "emoji-icons",
    severity: "warning",
    test: (h) => {
      const emoji = h.match(/[\u{1F300}-\u{1F9FF}]/gu);
      return emoji && emoji.length > 3 ? `检测到 ${emoji.length} 个 emoji 图标，建议使用 SVG 或 CSS 图标替代` : null;
    },
  },
  {
    type: "svg-humans",
    severity: "error",
    test: (h) => {
      const svg = h.match(/<svg[^>]*>[\s\S]*?(?:face|person|avatar|human|user|profile)[\s\S]*?<\/svg>/gi);
      return svg ? `检测到手绘 SVG 人物图形 (${svg.length} 处)，请使用真实照片或 abstact 几何图形` : null;
    },
  },
  {
    type: "default-fonts",
    severity: "warning",
    test: (h) => {
      const hasInter = /font-family[^;]*['"]?Inter['"]?/i.test(h);
      const hasRoboto = /font-family[^;]*['"]?Roboto['"]?/i.test(h);
      if (!hasInter && !hasRoboto) return null;
      return `检测到 ${hasInter ? 'Inter' : 'Roboto'} 用作 display font，建议使用更具品牌特征的字体系列`;
    },
  },
  {
    type: "card-left-border",
    severity: "warning",
    test: (h) => {
      const match = h.match(/border-left[^;]*?(?:4|3|5)px\s+solid\s+(?:var\(--)?(?:accent|primary)/gi);
      return match ? `检测到卡片左侧 accent 边框装饰 (${match.length} 处)，避免过度使用此模式` : null;
    },
  },
  {
    type: "lorem-ipsum",
    severity: "error",
    test: (h) => {
      const match = h.match(/lorem\s+ipsum|lorem\d+/gi);
      return match ? `检测到 Lorem ipsum 填充文本 (${match.length} 处)，设计产出应使用真实内容` : null;
    },
  },
  {
    type: "placeholder-stats",
    severity: "warning",
    test: (h) => {
      const match = h.match(/\b(?:99%|10[x×]|(?:\\d+)\+?\s*(?:users|customers|downloads))\b/gi);
      return match ? `检测到疑似编造的数据指标 (${match.length} 处)，建议使用真实数据或灰色占位块` : null;
    },
  },
  {
    type: "fake-avatars",
    severity: "warning",
    test: (h) => {
      const match = h.match(/i\.pravatar|randomuser|via\.placeholder|ui-avatars/gi);
      return match ? `检测到占位头像服务 (${match.length} 处)，应移除或替换为真实人物照片` : null;
    },
  },
];

export function checkSlop(html: string): SlopReport {
  const issues: SlopIssue[] = [];
  for (const check of CHECKS) {
    const msg = check.test(html);
    if (msg) {
      issues.push({ type: check.type, severity: check.severity, message: msg });
    }
  }
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const score = Math.max(0, 10 - errors * 3 - warnings * 1);
  return { clean: errors === 0, issues, score };
}
