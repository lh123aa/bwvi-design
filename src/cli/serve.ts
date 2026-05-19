/**
 * serve.ts — BWVI 预览服务器 + Web UI
 *
 * 双重功能：
 * 1. 静态文件服务器（demo/ 目录）
 * 2. Web UI 交互式设计界面（http://localhost:<port>）
 */

import { existsSync, readFileSync } from "node:fs";
import { join, extname } from "node:path";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { getDemoDir } from "./demo.js";
import { buildPage } from "../engine/page-builder.js";
import { listStyles, getStyle } from "../engine/style-systems.js";
import { listBrands, searchBrands, getBrand } from "../engine/brand-loader.js";
import { findBlueprint } from "../templates/content-presets.js";
import { info, success, errExit, result } from "./ux.js";

const MIME: Record<string, string> = {
  ".html": "text/html;charset=utf-8",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};

export async function serveCommand(args: string[]) {
  const portFlag = args.find((a) => a.startsWith("--port="));
  const port = portFlag ? parseInt(portFlag.split("=")[1]) : 3000;
  const dir = getDemoDir();

  if (!existsSync(dir)) {
    errExit("demo 目录不存在，请先生成一些页面", "NO_DEMO_DIR");
  }

  const server = createServer((req, res) => {
    try {
      handleRequest(req, res, dir);
    } catch (e: any) {
      res.writeHead(500, { "Content-Type": "text/plain;charset=utf-8" });
      res.end("Internal error: " + e.message);
    }
  });

  server.listen(port, () => {
    info("BWVI Web UI + 预览服务器已启动");
    success(`  http://localhost:${port}`);
    info("  demo 目录: " + dir);
    info("  按 Ctrl+C 停止");
  });
}

function handleRequest(req: IncomingMessage, res: ServerResponse, demoDir: string): void {
  const url = req.url || "/";

  // ─── API 路由 ──────────────────────────────────────────────────────────────
  if (url === "/api/styles") {
    return json(res, listStyles());
  }
  if (url === "/api/brands") {
    return json(res, listBrands());
  }
  if (url.startsWith("/api/brands/search?q=")) {
    const q = decodeURIComponent(url.split("?q=")[1] || "");
    return json(res, q ? searchBrands(q) : listBrands());
  }
  if (url.startsWith("/api/brand/")) {
    const name = url.split("/api/brand/")[1];
    const brand = getBrand(name.toLowerCase());
    return json(res, brand || { error: "not_found" });
  }
  if (url.startsWith("/api/style/")) {
    const id = url.split("/api/style/")[1];
    const style = getStyle(id);
    return json(res, style || { error: "not_found" });
  }
  if (url.startsWith("/api/blueprint?task=")) {
    const task = decodeURIComponent(url.split("?task=")[1] || "");
    const result = findBlueprint(task);
    return json(res, { blueprint: result.blueprint.id, confidence: result.confidence, sections: result.blueprint.sections.length });
  }
  if (url === "/api/generate" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const opts = JSON.parse(body);
        const pageResult = buildPage({
          task: opts.task || "Untitled",
          direction: opts.direction,
          brand: opts.brand,
          device: opts.device,
          orientation: opts.orientation || "portrait",
          dark: opts.dark || false,
          interactive: opts.interactive || false,
          styleId: opts.styleId,
        });
        return json(res, { status: "ok", html: pageResult.html, direction: pageResult.direction, brandUsed: pageResult.brandUsed, blueprint: pageResult.blueprintId });
      } catch (e: any) {
        return json(res, { status: "error", message: e.message }, 400);
      }
    });
    return;
  }

  // ─── Web UI 首页 ──────────────────────────────────────────────────────────
  if (url === "/" || url === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html;charset=utf-8" });
    res.end(WEB_UI_HTML);
    return;
  }

  // ─── 静态文件（demo/ 目录） ────────────────────────────────────────────────
  let filePath = url;
  if (!filePath.startsWith("/")) filePath = "/" + filePath;
  const fullPath = join(demoDir, filePath);
  const ext = extname(fullPath).toLowerCase();

  if (existsSync(fullPath)) {
    const content = readFileSync(fullPath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(content);
    return;
  }

  // 404
  res.writeHead(404, { "Content-Type": "text/plain;charset=utf-8" });
  res.end("404 — 未找到");
}

function json(res: ServerResponse, data: unknown, status = 200): void {
  res.writeHead(status, { "Content-Type": "application/json;charset=utf-8" });
  res.end(JSON.stringify(data));
}

// ═══════════════════════════════════════════════════════════════════════════════
// Web UI HTML（内嵌 SPA，零外部依赖）
// ═══════════════════════════════════════════════════════════════════════════════

const WEB_UI_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>BWVI 设计工作室</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#f8f9fa;--surface:#fff;--primary:#2563eb;--accent:#059669;--text:#1e293b;--muted:#64748b;--border:#e2e8f0;--radius:8px;--font:system-ui,-apple-system,sans-serif}
body{font-family:var(--font);background:var(--bg);color:var(--text);min-height:100vh}
.layout{display:grid;grid-template-columns:280px 1fr;min-height:100vh}
.sidebar{background:var(--surface);border-right:1px solid var(--border);padding:24px;overflow-y:auto}
.main{padding:32px;max-width:1200px}
h1{font-size:1.5rem;font-weight:700;margin-bottom:4px;letter-spacing:-0.03em}
h1 small{font-size:0.75rem;color:var(--muted);font-weight:400}
h2{font-size:1.125rem;font-weight:600;margin-bottom:16px}
.sub{color:var(--muted);font-size:0.875rem;margin-bottom:24px}
.card{background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:20px;margin-bottom:20px}
.card h3{font-size:0.9375rem;font-weight:600;margin-bottom:8px}
.form-group{margin-bottom:16px}
.form-group label{display:block;font-size:0.8125rem;font-weight:500;margin-bottom:4px;color:var(--text)}
.form-group input,.form-group select,.form-group textarea{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:6px;font-size:0.875rem;font-family:var(--font);background:var(--surface);color:var(--text)}
.form-group textarea{min-height:60px;resize:vertical}
.btn{padding:10px 24px;background:var(--primary);color:#fff;border:none;border-radius:6px;font-size:0.875rem;cursor:pointer;font-weight:500;transition:opacity .2s}
.btn:hover{opacity:.85}
.btn:disabled{opacity:.5;cursor:not-allowed}
.btn-secondary{background:transparent;color:var(--text);border:1px solid var(--border)}
.tag{display:inline-block;padding:2px 8px;border-radius:4px;font-size:0.75rem;margin:2px;cursor:pointer;border:1px solid var(--border);transition:all .15s}
.tag:hover,.tag.active{border-color:var(--primary);color:var(--primary)}
.tag.active{background:var(--primary);color:#fff;border-color:var(--primary)}
.swatch{display:inline-block;width:24px;height:24px;border-radius:4px;margin:2px;border:1px solid var(--border);vertical-align:middle}
#result{display:none}
#result.show{display:block}
#iframe-preview{width:100%;border:1px solid var(--border);border-radius:var(--radius);background:#fff}
.controls{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.badge{display:inline-block;padding:2px 8px;border-radius:12px;font-size:0.75rem;background:#e8f5e9;color:#2e7d32}
.badge-blue{background:#e8eaf6;color:#283593}
.spinner{display:inline-block;width:16px;height:16px;border:2px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:8px}
@keyframes spin{to{transform:rotate(360deg)}}
.nav-link{display:flex;align-items:center;gap:8px;padding:8px 12px;text-decoration:none;color:var(--text);font-size:0.875rem;border-radius:6px;transition:background .15s;margin-bottom:4px;cursor:pointer}
.nav-link:hover,.nav-link.active{background:#f1f5f9}
.nav-link .icon{font-size:1.125rem}
.section-hidden{display:none}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;margin-bottom:20px}
.stat-card{text-align:center;padding:16px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius)}
.stat-card .num{font-size:1.5rem;font-weight:700;color:var(--primary)}
.stat-card .lbl{font-size:0.75rem;color:var(--muted);margin-top:4px}
pre.view{max-height:400px;overflow:auto;background:#1e293b;color:#e2e8f0;padding:16px;border-radius:var(--radius);font-size:0.8125rem;line-height:1.5}
</style>
</head>
<body>
<div class="layout">
  <div class="sidebar">
    <h1>BWVI <small>v0.2</small></h1>
    <p class="sub">设计决策引擎</p>
    <div style="margin-top:24px">
      <div class="nav-link active" data-page="generate" onclick="showPage('generate')">
        <span class="icon">🎯</span> 生成设计
      </div>
      <div class="nav-link" data-page="styles" onclick="showPage('styles')">
        <span class="icon">🎨</span> 56 种风格
      </div>
      <div class="nav-link" data-page="brands" onclick="showPage('brands')">
        <span class="icon">🏷️</span> 115 品牌
      </div>
      <div class="nav-link" data-page="blueprints" onclick="showPage('blueprints')">
        <span class="icon">📐</span> 50+ 蓝图
      </div>
    </div>
    <div style="margin-top:32px;padding-top:16px;border-top:1px solid var(--border)">
      <div class="stat-grid">
        <div class="stat-card"><div class="num" id="stat-styles">-</div><div class="lbl">风格</div></div>
        <div class="stat-card"><div class="num" id="stat-brands">-</div><div class="lbl">品牌</div></div>
      </div>
    </div>
  </div>
  <div class="main">
    <!-- 生成页面 -->
    <div id="page-generate">
      <h2>生成设计</h2>
      <p class="sub">输入需求，BWVI 自动匹配蓝图、风格和品牌</p>
      <div class="card">
        <div class="form-group">
          <label>设计需求</label>
          <textarea id="task" placeholder="例如：精品咖啡品牌 landing page，面向投资人展示">精品咖啡品牌 landing page</textarea>
        </div>
        <div class="form-group">
          <label>视觉风格 <span style="color:var(--muted);font-weight:400">（可选）</span></label>
          <select id="styleSelect"><option value="">自动匹配</option></select>
        </div>
        <div class="form-group">
          <label>品牌系统 <span style="color:var(--muted);font-weight:400">（可选）</span></label>
          <select id="brandSelect"><option value="">无</option></select>
        </div>
        <div class="form-group">
          <label>设备边框</label>
          <select id="deviceSelect">
            <option value="">无边框</option>
            <option value="iphone">iPhone 15 Pro</option>
            <option value="pixel">Pixel 9</option>
            <option value="ipad">iPad Pro</option>
            <option value="macbook">MacBook Pro</option>
            <option value="browser">浏览器窗口</option>
          </select>
        </div>
        <div class="controls">
          <label><input type="checkbox" id="darkMode" /> 暗色模式</label>
          <label><input type="checkbox" id="interactive" /> 交互原型</label>
        </div>
        <div style="margin-top:16px">
          <button class="btn" onclick="generate()" id="genBtn">🎨 生成设计</button>
          <span id="genStatus" style="margin-left:12px;font-size:0.875rem;color:var(--muted)"></span>
        </div>
      </div>
      <div id="result">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <div>
            <span id="resultDirection" class="badge"></span>
            <span id="resultBrand" class="badge-blue"></span>
            <span id="resultBlueprint" class="badge" style="background:#fff3e0;color:#e65100"></span>
          </div>
          <div class="controls">
            <button class="btn btn-secondary" onclick="document.getElementById('iframe-preview').contentWindow.location.reload()">刷新预览</button>
            <button class="btn btn-secondary" onclick="viewSource()">查看源码</button>
          </div>
        </div>
        <iframe id="iframe-preview" height="500" sandbox="allow-scripts"></iframe>
        <pre id="sourceView" class="view section-hidden"></pre>
      </div>
    </div>
    <!-- 风格页面 -->
    <div id="page-styles" class="section-hidden">
      <h2>56 种视觉风格</h2>
      <p class="sub">从粗野主义到玻璃拟态，从赛博朋克到极简白</p>
      <div id="styleGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px"></div>
    </div>
    <!-- 品牌页面 -->
    <div id="page-brands" class="section-hidden">
      <h2>115 个内置品牌</h2>
      <p class="sub">Linear · Stripe · Apple · Notion · 小红书 · WeChat 等</p>
      <div class="form-group" style="max-width:320px">
        <input id="brandSearch" type="text" placeholder="搜索品牌..." oninput="searchBrandsUI(this.value)" />
      </div>
      <div id="brandGrid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px"></div>
    </div>
    <!-- 蓝图页面 -->
    <div id="page-blueprints" class="section-hidden">
      <h2>50+ 行业蓝图</h2>
      <p class="sub">输入关键词查找匹配的行业模板</p>
      <div class="form-group" style="max-width:320px">
        <input id="bpSearch" type="text" placeholder="例如：咖啡、SaaS、摄影..." oninput="searchBlueprint(this.value)" />
      </div>
      <div id="bpResult" style="margin-top:16px"></div>
      <div style="margin-top:24px">
        <h3>覆盖行业</h3>
        <div id="industryTags" style="margin-top:8px"></div>
      </div>
    </div>
  </div>
</div>

<script>
// ─── 页面切换 ──────────────────────────────────────────────────────────────
function showPage(name){
  document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===name));
  document.querySelectorAll('[id^="page-"]').forEach(el=>el.classList.toggle('section-hidden',el.id!=='page-'+name));
}

// ─── 加载数据 ──────────────────────────────────────────────────────────────
async function loadStats(){
  try{
    const [styles,brands]=await Promise.all([
      fetch('/api/styles').then(r=>r.json()),
      fetch('/api/brands').then(r=>r.json())
    ]);
    document.getElementById('stat-styles').textContent=styles.length;
    document.getElementById('stat-brands').textContent=brands.length;
    // populate style select
    const sel=document.getElementById('styleSelect');
    styles.forEach(s=>{const o=document.createElement('option');o.value=s.id;o.textContent=s.name||s.id;sel.appendChild(o)});
    // populate brand select
    const bsel=document.getElementById('brandSelect');
    brands.forEach(b=>{const o=document.createElement('option');o.value=b.name.toLowerCase();o.textContent=b.name;bsel.appendChild(o)});
    // render style grid
    renderStyles(styles);
    // render brand grid
    renderBrands(brands);
  }catch(e){console.error('load error',e)}
}

// ─── 生成 ──────────────────────────────────────────────────────────────────
let lastGeneratedHtml='';

async function generate(){
  const btn=document.getElementById('genBtn');
  const status=document.getElementById('genStatus');
  btn.disabled=true;status.innerHTML='<span class="spinner"></span>生成中...';
  document.getElementById('result').classList.remove('show');
  try{
    const task=document.getElementById('task').value||'Untitled';
    const styleId=document.getElementById('styleSelect').value;
    const brand=document.getElementById('brandSelect').value;
    const device=document.getElementById('deviceSelect').value;
    const dark=document.getElementById('darkMode').checked;
    const interactive=document.getElementById('interactive').checked;
    const resp=await fetch('/api/generate',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({task,direction:undefined,styleId:styleId||undefined,brand:brand||undefined,device:device||undefined,dark,interactive})
    });
    const data=await resp.json();
    if(data.status!=='ok'){status.textContent='❌ '+data.message;return;}
    lastGeneratedHtml=data.html;
    document.getElementById('resultDirection').textContent='方向: '+data.direction;
    document.getElementById('resultBrand').textContent=data.brandUsed?'品牌: '+data.brandUsed:'';
    document.getElementById('resultBlueprint').textContent='蓝图: '+data.blueprint;
    const preview=document.getElementById('iframe-preview');
    preview.src='data:text/html;charset=utf-8,'+encodeURIComponent(data.html);
    document.getElementById('sourceView').classList.add('section-hidden');
    document.getElementById('result').classList.add('show');
    status.textContent='✅ 生成完成 ('+(data.html.length/1024).toFixed(0)+'KB)';
  }catch(e){status.textContent='❌ 错误: '+e.message;}
  finally{btn.disabled=false;}
}

function viewSource(){
  const el=document.getElementById('sourceView');
  el.textContent=lastGeneratedHtml;
  el.classList.toggle('section-hidden');
}

// ─── 风格页面 ──────────────────────────────────────────────────────────────
function renderStyles(styles){
  const grid=document.getElementById('styleGrid');
  grid.innerHTML=styles.map(s=>{
    const p=s.palette||{};
    const colors=[p.primary,p.accent,p.surface,p.text].filter(Boolean);
    const swatches=colors.map(c=>'<span class="swatch" style="background:'+c+'"></span>').join('');
    return '<div class="card" style="cursor:default"><h3>'+(s.name||s.id)+'</h3>'+
      '<div style="margin:8px 0">'+swatches+'</div>'+
      '<div style="font-size:0.75rem;color:var(--muted)">'+(s.description||s.id||'')+'</div></div>';
  }).join('');
}

// ─── 品牌页面 ──────────────────────────────────────────────────────────────
function renderBrands(brands){
  const grid=document.getElementById('brandGrid');
  grid.innerHTML=brands.map(b=>{
    const c=b.colors||{};
    const colors=[c.primary,c.accent,c.surface,c.text].filter(Boolean);
    const swatches=colors.map(c=>'<span class="swatch" style="background:'+c+'"></span>').join('');
    return '<div class="card" style="cursor:default"><h3>'+(b.name||'')+'</h3>'+
      '<div style="margin:8px 0">'+swatches+'</div>'+
      '<div style="font-size:0.75rem;color:var(--muted)">'+(b.category||'')+'</div></div>';
  }).join('');
}

async function searchBrandsUI(q){
  try{
    const resp=await fetch('/api/brands/search?q='+encodeURIComponent(q));
    const data=await resp.json();
    renderBrands(data);
  }catch(e){}
}

// ─── 蓝图页面 ──────────────────────────────────────────────────────────────
const INDUSTRIES=['咖啡餐饮','化妆品美妆','SaaS/科技','餐厅美食','健身运动','时尚服饰',
  '教育培训','房产物业','金融科技','电商零售','个人作品集','创意代理','非营利组织',
  '活动会议','医疗诊所','法律律所','摄影视频','婚礼策划','旅行旅游','宠物服务',
  '音乐人','健身房','瑜伽冥想','艺术家','建筑设计','酒吧','面包店','酒店度假村',
  '共享办公','水疗按摩','汽车经销','游戏电竞','博客自媒体'];

document.getElementById('industryTags').innerHTML='';
INDUSTRIES.forEach(i=>{const el=document.createElement('span');el.className='tag';el.textContent=i;el.dataset.bp=i;el.onclick=()=>searchBlueprint(el.dataset.bp);document.getElementById('industryTags').appendChild(el)});

async function searchBlueprint(q){
  const el=document.getElementById('bpResult');
  if(!q){el.innerHTML='';return;}
  try{
    const resp=await fetch('/api/blueprint?task='+encodeURIComponent(q));
    const data=await resp.json();
    el.innerHTML='<div class="card"><h3>🎯 '+data.blueprint+'</h3>'+
      '匹配置信度: '+(data.confidence*100).toFixed(0)+'% · '+
      data.sections+' 个区块</div>';
  }catch(e){el.innerHTML='<div style="color:var(--muted)">查询失败</div>';}
}

loadStats();
</script>
</body>
</html>`;
