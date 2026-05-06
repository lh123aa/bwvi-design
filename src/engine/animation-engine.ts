export type Easing = "linear" | "ease-out" | "ease-in" | "ease-in-out" | "bounce" | "elastic" | "spring";
export type AnimType = "fade-in" | "fade-up" | "scale-in" | "slide-left" | "slide-right" | "bounce-in" | "rotate-in" | "flip-in" | "shimmer" | "float" | "glow" | "typewriter";

export interface AnimConfig {
  type: AnimType;
  duration?: number;
  delay?: number;
  easing?: Easing;
  distance?: number;
}

const EASING_CSS: Record<Easing, string> = {
  "linear": "linear",
  "ease-out": "cubic-bezier(0.16, 1, 0.3, 1)",
  "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
  "ease-in-out": "cubic-bezier(0.65, 0, 0.35, 1)",
  "bounce": "cubic-bezier(0.34, 1.56, 0.64, 1)",
  "elastic": "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
  "spring": "cubic-bezier(0.5, 1.8, 0.3, 0.8)",
};

export function getAnimationCSS(): string {
  return `@keyframes bwi-fade-in{from{opacity:0}to{opacity:1}}
@keyframes bwi-fade-up{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
@keyframes bwi-scale-in{from{opacity:0;transform:scale(0.85)}to{opacity:1;transform:scale(1)}}
@keyframes bwi-slide-left{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
@keyframes bwi-slide-right{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:translateX(0)}}
@keyframes bwi-bounce-in{0%{opacity:0;transform:scale(0.3)}50%{transform:scale(1.08)}70%{transform:scale(0.95)}100%{opacity:1;transform:scale(1)}}
@keyframes bwi-rotate-in{from{opacity:0;transform:rotate(-15deg) scale(0.9)}to{opacity:1;transform:rotate(0) scale(1)}}
@keyframes bwi-flip-in{from{opacity:0;transform:perspective(400px) rotateX(-90deg)}to{opacity:1;transform:perspective(400px) rotateX(0)}}
@keyframes bwi-shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes bwi-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes bwi-glow{0%,100%{box-shadow:0 0 8px var(--glow-color,rgba(108,99,255,0.3))}50%{box-shadow:0 0 24px var(--glow-color,rgba(108,99,255,0.6))}}
@keyframes bwi-typewriter{from{width:0}to{width:100%}}

.bwi-anim{animation-fill-mode:both;will-change:transform,opacity}
.bwi-fade-in{animation-name:bwi-fade-in}
.bwi-fade-up{animation-name:bwi-fade-up}
.bwi-scale-in{animation-name:bwi-scale-in}
.bwi-slide-left{animation-name:bwi-slide-left}
.bwi-slide-right{animation-name:bwi-slide-right}
.bwi-bounce-in{animation-name:bwi-bounce-in}
.bwi-rotate-in{animation-name:bwi-rotate-in}
.bwi-flip-in{animation-name:bwi-flip-in}
.bwi-shimmer{animation-name:bwi-shimmer;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent);background-size:200% 100%}
.bwi-float{animation-name:bwi-float;animation-iteration-count:infinite}
.bwi-glow{animation-name:bwi-glow;animation-iteration-count:infinite}
.bwi-typewriter{overflow:hidden;white-space:nowrap;display:inline-block;animation-name:bwi-typewriter;animation-timing-function:steps(30)}

.bwi-ease-linear{animation-timing-function:linear}
.bwi-ease-out{animation-timing-function:cubic-bezier(0.16,1,0.3,1)}
.bwi-ease-in{animation-timing-function:cubic-bezier(0.4,0,1,1)}
.bwi-ease-bounce{animation-timing-function:cubic-bezier(0.34,1.56,0.64,1)}
.bwi-ease-elastic{animation-timing-function:cubic-bezier(0.68,-0.55,0.27,1.55)}
.bwi-ease-spring{animation-timing-function:cubic-bezier(0.5,1.8,0.3,0.8)}

.bwi-dur-1{animation-duration:.3s}
.bwi-dur-2{animation-duration:.5s}
.bwi-dur-3{animation-duration:.8s}
.bwi-dur-4{animation-duration:1.2s}
.bwi-dur-5{animation-duration:2s}

${[1,2,3,4,5,6,7,8].map(i => `.bwi-del-${i}{animation-delay:${(i*0.12).toFixed(2)}s}`).join('\n')}
.bwi-stagger>.bwi-anim:nth-child(1){animation-delay:0.05s}
.bwi-stagger>.bwi-anim:nth-child(2){animation-delay:0.1s}
.bwi-stagger>.bwi-anim:nth-child(3){animation-delay:0.15s}
.bwi-stagger>.bwi-anim:nth-child(4){animation-delay:0.2s}
.bwi-stagger>.bwi-anim:nth-child(5){animation-delay:0.25s}
.bwi-stagger>.bwi-anim:nth-child(6){animation-delay:0.3s}
.bwi-stagger>.bwi-anim:nth-child(7){animation-delay:0.35s}
.bwi-stagger>.bwi-anim:nth-child(8){animation-delay:0.4s}
`.trim();
}

export function animAttr(config: AnimConfig): string {
  const dur = config.duration || 0.5;
  const durClass = dur <= 0.3 ? "bwi-dur-1" : dur <= 0.5 ? "bwi-dur-2" : dur <= 0.8 ? "bwi-dur-3" : dur <= 1.2 ? "bwi-dur-4" : "bwi-dur-5";
  const easing = EASING_CSS[config.easing || "ease-out"];
  const easingSuffix = config.easing && config.easing !== "ease-out" ? ` bwi-ease-${config.easing}` : "";
  const delay = config.delay ? ` bwi-del-${Math.round(config.delay / 0.12)}` : "";
  return ` class="bwi-anim bwi-${config.type} ${durClass}${easingSuffix}${delay}" style="--bwi-distance:${config.distance || 30}px;animation-duration:${dur}s${config.easing && config.easing !== 'ease-out' ? '' : ''}"`;
}

export function getStageScript(): string {
  return `<script>
(function(){'use strict';
function observe(sel){var els=document.querySelectorAll(sel);if(!els.length)return;var obs=new IntersectionObserver(function(entries){entries.forEach(function(e){if(e.isIntersecting){e.target.style.animationPlayState='running';obs.unobserve(e.target)}})},{threshold:0.1});els.forEach(function(el){el.style.animationPlayState='paused';obs.observe(el)})}
document.addEventListener('DOMContentLoaded',function(){observe('.bwi-anim')});
setTimeout(function(){observe('.bwi-anim')},500);
})();
</script>`;
}
