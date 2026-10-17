/**
 * video-inject.ts — 视频录制专用的 HTML 动画注入
 *
 * 与 animation-engine.ts 的区别：
 * - animation-engine.ts 生成通用 CSS + IntersectionObserver（等待滚动触发）
 * - video-inject.ts 替换为“页面加载后立即播放所有动画”（适合录屏）
 */

import { getAnimationCSS } from "./animation-engine.js";

export interface InjectOptions {
  /** 是否启用 stagger 序列动画（默认 true） */
  stagger?: boolean;
  /** 循环次数，0 = 无限循环（默认 1） */
  loop?: number;
  /** 是否在加载后自动滚动（用于触发 IntersectionObserver 类动画） */
  autoScroll?: boolean;
  /** 动画引擎：css（默认）| gsap（需页面已加载 GSAP） */
  animationEngine?: "css" | "gsap";
}

/** 视频注入标记，用于检测是否已注入 */
const VIDEO_MARKER = "data-bwi-video-injected";

/**
 * 为视频录制模式注入动画到 HTML。
 * 替换 IntersectionObserver 为直接播放，确保录屏时所有动画可见。
 */
export function injectForVideo(html: string, opts: InjectOptions = {}): string {
  const { stagger = true, loop = 1, autoScroll = false, animationEngine = "css" } = opts;

  if (html.includes(VIDEO_MARKER)) return html;

  let result = html;

  if (animationEngine === "gsap") {
    const gsapScript = generateGsapVideoScript({ loop, autoScroll });
    result = result.replace("</body>", `${gsapScript}</body>`);
  } else {
    const css = getAnimationCSS();
    const script = generateVideoScript({ stagger, loop, autoScroll });
    const styleTag = `<style data-bwi-video="anim">${css}</style>`;
    result = result.replace("</head>", `${styleTag}</head>`);
    result = result.replace("</body>", `${script}</body>`);
  }

  result = result.replace("<body", `<body ${VIDEO_MARKER}="true"`);

  if (autoScroll) {
    result = result.replace("</head>", `<style>
html{scroll-behavior:smooth}
.bwi-video-section{scroll-margin-top:20px}
</style></head>`);
  }

  return result;
}

/**
 * 生成视频录制模式的脚本。
 * 替换 IntersectionObserver 为直接触发动画。
 */
function generateVideoScript(opts: {
  stagger: boolean;
  loop: number;
  autoScroll: boolean;
}): string {
  const autoPlayAll = `
(function(){
  'use strict';
  // 立即播放所有动画
  var anims = document.querySelectorAll('.bwi-anim');
  anims.forEach(function(el){
    el.style.animationPlayState = 'running';
    el.style.opacity = '1';
  });
  // 移除 stagger 子元素的初始隐藏
  document.querySelectorAll('.bwi-stagger').forEach(function(p){
    p.style.opacity = '1';
  });
  ${opts.loop > 1 ? `
  // 循环播放
  var count = 0;
  var maxLoops = ${opts.loop};
  document.addEventListener('animationend', function(){
    count++;
    if (count < maxLoops) {
      anims.forEach(function(el){
        el.style.animation = 'none';
        el.offsetHeight; // reflow
        el.style.animation = '';
      });
    }
  });` : ''}
  // 标记视频就绪
  document.body.dataset.bwiVideoReady = 'true';
})();
`;

  return `<script>${autoPlayAll}</script>`;
}

/**
 * 为 GSAP 驱动页面生成视频录制脚本。
 * 暂停所有 ScrollTrigger 实例，强制播放所有 tween。
 */
function generateGsapVideoScript(_opts: {
  loop: number;
  autoScroll: boolean;
}): string {
  return `<script>
(function(){
  'use strict';
  try {
    var sts = ScrollTrigger.getAll();
    sts.forEach(function(st){ st.kill(); });
  } catch(e){}
  try {
    var tweens = gsap.globalTimeline ? gsap.globalTimeline.getChildren() : [];
    tweens.forEach(function(t){ t.progress(1); });
  } catch(e){}
  document.body.dataset.bwiVideoReady = 'true';
})();
<\/script>`;
}
