export type DeviceType = "iphone" | "pixel" | "ipad" | "macbook" | "browser";
export type Orientation = "portrait" | "landscape";

const BASE = `.bwvi-frame *{margin:0;padding:0;box-sizing:border-box}
.bwvi-frame{display:flex;align-items:center;justify-content:center;padding:40px;background:#f0f0f0}
.bwvi-device{position:relative;overflow:hidden;background:#fff}
.bwvi-notch{position:absolute;z-index:10}
.bwvi-status{position:absolute;z-index:10;font-family:-apple-system,BlinkMacSystemFont,sans-serif}
`;

export function iPhone15Frame(innerHtml: string, orientation: Orientation = "portrait"): string {
  const w = orientation === "portrait" ? 390 : 844;
  const h = orientation === "portrait" ? 844 : 390;
  const radius = 55;
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${BASE}
.bwvi-iphone{width:${w}px;height:${h}px;border-radius:${radius}px;border:8px solid #333;box-shadow:0 20px 60px rgba(0,0,0,0.3),inset 0 0 0 2px #555;position:relative;background:#fff}
.bwvi-dynamic-island{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:120px;height:36px;background:#111;border-radius:20px;z-index:20}
.bwvi-status-bar{position:absolute;top:0;left:0;right:0;height:54px;display:flex;justify-content:space-between;align-items:flex-start;padding:12px 28px 0;font-size:14px;font-weight:600;color:#111;z-index:15}
.bwvi-home-indicator{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:134px;height:5px;background:#ddd;border-radius:3px;z-index:20}
.bwvi-screen{position:absolute;top:0;left:0;right:0;bottom:0;border-radius:${radius-8}px;overflow-y:auto;overflow-x:hidden;background:#fff}
.bwvi-screen::-webkit-scrollbar{display:none}
</style>
</head><body><div class="bwvi-frame bwvi-iphone">
<div class="bwvi-dynamic-island"></div>
<div class="bwvi-status-bar"><span>9:41</span><span>🔋</span></div>
<div class="bwvi-screen"><div style="padding-top:60px;min-height:100%">${innerHtml}</div></div>
<div class="bwvi-home-indicator"></div>
</div></body></html>`;
}

export function Pixel9Frame(innerHtml: string, orientation: Orientation = "portrait"): string {
  const w = orientation === "portrait" ? 412 : 846;
  const h = orientation === "portrait" ? 846 : 412;
  const radius = 45;
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${BASE}
.bwvi-pixel{width:${w}px;height:${h}px;border-radius:${radius}px;border:7px solid #444;box-shadow:0 20px 60px rgba(0,0,0,0.3);position:relative;background:#fff}
.bwvi-pixel-camera{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:12px;height:12px;background:#222;border-radius:50%;z-index:20;box-shadow:0 0 0 2px #555}
.bwvi-pixel-status{position:absolute;top:0;left:0;right:0;height:48px;display:flex;justify-content:space-between;align-items:center;padding:12px 24px 0;font-size:14px;font-weight:500;color:#111;z-index:15}
.bwvi-pixel-nav{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);display:flex;gap:12px;z-index:20}
.bwvi-pixel-nav span{width:16px;height:16px;border:2px solid #ccc;border-radius:50%;display:block}
.bwvi-pixel-nav span:first-child{width:48px;border-radius:10px;border:none;background:#ccc}
.bwvi-pixel-screen{position:absolute;top:0;left:0;right:0;bottom:0;border-radius:${radius-7}px;overflow-y:auto;overflow-x:hidden;background:#fff}
.bwvi-pixel-screen::-webkit-scrollbar{display:none}
</style>
</head><body><div class="bwvi-frame bwvi-pixel">
<div class="bwvi-pixel-camera"></div>
<div class="bwvi-pixel-status"><span>9:41</span><span>🔋</span></div>
<div class="bwvi-pixel-screen"><div style="padding-top:56px;min-height:100%">${innerHtml}</div></div>
<div class="bwvi-pixel-nav"><span></span><span></span><span></span></div>
</div></body></html>`;
}

export function iPadProFrame(innerHtml: string, orientation: Orientation = "landscape"): string {
  const w = orientation === "landscape" ? 1032 : 744;
  const h = orientation === "landscape" ? 744 : 1032;
  const radius = 35;
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${BASE}
.bwvi-ipad{width:${w}px;height:${h}px;border-radius:${radius}px;border:8px solid #444;box-shadow:0 20px 60px rgba(0,0,0,0.25);position:relative;background:#fff}
.bwvi-ipad-notch{position:absolute;top:0;left:50%;transform:translateX(-50%);width:200px;height:28px;background:#444;border-radius:0 0 16px 16px;z-index:20}
.bwvi-ipad-screen{position:absolute;top:0;left:0;right:0;bottom:0;border-radius:${radius-8}px;overflow-y:auto;overflow-x:hidden;background:#fff}
.bwvi-ipad-screen::-webkit-scrollbar{display:none}
</style>
</head><body><div class="bwvi-frame bwvi-ipad">
<div class="bwvi-ipad-notch"></div>
<div class="bwvi-ipad-screen"><div style="padding-top:${orientation==='landscape'?36:40}px;min-height:100%">${innerHtml}</div></div>
</div></body></html>`;
}

export function MacBookFrame(innerHtml: string): string {
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${BASE}
.bwvi-macbook{width:1024px;position:relative;background:#fff;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,0.2);overflow:hidden}
.bwvi-macbook-notch{position:absolute;top:0;left:50%;transform:translateX(-50%);width:120px;height:6px;background:#222;border-radius:0 0 8px 8px;z-index:20}
.bwvi-macbook-screen{width:100%;height:640px;overflow-y:auto;overflow-x:hidden;background:#fff;border-radius:12px}
.bwvi-macbook-screen::-webkit-scrollbar{display:none}
.bwvi-macbook-base{height:28px;background:linear-gradient(to bottom,#d4d4d4,#e8e8e8);border-radius:0 0 8px 8px;position:relative}
.bwvi-macbook-base::after{content:'';position:absolute;bottom:6px;left:50%;transform:translateX(-50%);width:80px;height:4px;background:#aaa;border-radius:4px}
</style>
</head><body><div class="bwvi-frame"><div class="bwvi-macbook">
<div class="bwvi-macbook-notch"></div>
<div class="bwvi-macbook-screen"><div style="padding-top:12px;min-height:100%">${innerHtml}</div></div>
<div class="bwvi-macbook-base"></div>
</div></div></body></html>`;
}

export function BrowserFrame(innerHtml: string, title: string = "BWVI Preview"): string {
  return `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>${BASE}
.bwvi-browser{width:100%;max-width:1200px;border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,0.15);overflow:hidden;background:#fff}
.bwvi-browser-bar{display:flex;align-items:center;gap:8px;padding:12px 16px;background:#f0f0f0;border-bottom:1px solid #ddd;position:sticky;top:0}
.bwvi-browser-dots{display:flex;gap:6px}
.bwvi-browser-dots span{width:12px;height:12px;border-radius:50%}
.bwvi-browser-dots span:nth-child(1){background:#ff5f57}
.bwvi-browser-dots span:nth-child(2){background:#ffbd2e}
.bwvi-browser-dots span:nth-child(3){background:#28c840}
.bwvi-browser-url{flex:1;padding:6px 12px;background:#fff;border-radius:6px;font-size:13px;color:#666;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.bwvi-browser-body{overflow-y:auto;max-height:80vh}
</style>
</head><body><div class="bwvi-frame"><div class="bwvi-browser">
<div class="bwvi-browser-bar">
<div class="bwvi-browser-dots"><span></span><span></span><span></span></div>
<div class="bwvi-browser-url">${title}</div>
</div>
<div class="bwvi-browser-body">${innerHtml}</div>
</div></div></body></html>`;
}

export function wrapWithDevice(innerHtml: string, device?: DeviceType, orientation?: Orientation, title?: string): string {
  switch (device) {
    case "iphone": return iPhone15Frame(innerHtml, orientation);
    case "pixel": return Pixel9Frame(innerHtml, orientation);
    case "ipad": return iPadProFrame(innerHtml, orientation);
    case "macbook": return MacBookFrame(innerHtml);
    case "browser": return BrowserFrame(innerHtml, title);
    default: return innerHtml;
  }
}
