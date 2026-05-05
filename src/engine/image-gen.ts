import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

export interface ImageGenConfig {
  provider: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
}

export interface ImageGenResult {
  url: string;
  provider: string;
  model: string;
  cached: boolean;
  filePath?: string;
}

const PROVIDERS: Record<string, { name: string; models: string[]; baseUrl: string; docs: string }> = {
  openai: { name: "OpenAI", models: ["dall-e-3","dall-e-2"], baseUrl: "https://api.openai.com/v1/images/generations", docs: "platform.openai.com" },
  stability: { name: "Stability AI", models: ["stable-diffusion-3.5","stable-diffusion-3","core"], baseUrl: "https://api.stability.ai/v2beta/stable-image/generate/sd3", docs: "platform.stability.ai" },
  fal: { name: "Fal.ai", models: ["flux-pro","flux-dev","flux-schnell","sd-3.5"], baseUrl: "https://fal.run/fal-ai/flux-pro", docs: "fal.ai" },
  replicate: { name: "Replicate", models: ["flux-pro","flux-dev","sdxl","playground-v2"], baseUrl: "https://api.replicate.com/v1/predictions", docs: "replicate.com" },
  seedream: { name: "字节跳动 Seedream", models: ["seedream-3.0","seedream-2.0"], baseUrl: "https://api.volcengine.com/v1/image/generation", docs: "volcengine.com" },
  tongyi: { name: "阿里通义万象", models: ["tongyi-wanxiang-v2","tongyi-wanxiang-v1"], baseUrl: "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis", docs: "aliyun.com" },
  google: { name: "Google Imagen", models: ["imagen-3","imagen-2"], baseUrl: "https://generativelanguage.googleapis.com/v1beta/models", docs: "makersuite.google.com" },
};

const CONFIG_DIR = ".bwvi";
const CONFIG_FILE = "image-config.json";

function getConfigPath(): string {
  const base = findProjectDir() || process.cwd();
  return join(base, CONFIG_DIR, CONFIG_FILE);
}

export function loadConfig(): Record<string, ImageGenConfig> {
  const p = getConfigPath();
  if (!existsSync(p)) return {};
  try { return JSON.parse(readFileSync(p, "utf-8")); } catch { return {}; }
}

export function saveConfig(key: string, cfg: ImageGenConfig): void {
  const all = loadConfig();
  all[key] = cfg;
  const dir = join(findProjectDir() || process.cwd(), CONFIG_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(getConfigPath(), JSON.stringify(all, null, 2), "utf-8");
}

export async function generateImage(prompt: string, provider: string, model?: string, saveDir?: string): Promise<ImageGenResult> {
  const configs = loadConfig();
  const cfg = configs[provider];
  if (!cfg) throw new Error(`未配置 ${provider} 的 API Key。使用: bwvi image config <provider> --key=<key>`);

  const prov = PROVIDERS[provider];
  if (!prov) throw new Error(`不支持的提供商: ${provider}。可选: ${Object.keys(PROVIDERS).join(", ")}`);

  const m = model || cfg.model || prov.models[0];
  const actualSaveDir = saveDir || join(process.cwd(), "demo");

  try {
    const result = await callProvider(provider, m, prompt, cfg);
    const fileName = `image-${Date.now()}.png`;
    if (!existsSync(actualSaveDir)) mkdirSync(actualSaveDir, { recursive: true });
    const filePath = join(actualSaveDir, fileName);
    writeFileSync(filePath, result, "base64");
    return { url: filePath, provider, model: m, cached: false, filePath };
  } catch (e: any) {
    throw new Error(`${provider} 生成失败: ${e.message}`);
  }
}

async function callProvider(provider: string, model: string, prompt: string, cfg: ImageGenConfig): Promise<string> {
  switch (provider) {
    case "openai": return callOpenAI(model, prompt, cfg);
    case "stability": return callStability(model, prompt, cfg);
    case "tongyi": return callTongyi(model, prompt, cfg);
    case "seedream": return callSeedream(model, prompt, cfg);
    default: throw new Error(`提供商 ${provider} 暂未实现，可用的: ${Object.keys(PROVIDERS).join(", ")}`);
  }
}

async function callOpenAI(model: string, prompt: string, cfg: ImageGenConfig): Promise<string> {
  const resp = await fetch(cfg.baseUrl || PROVIDERS.openai.baseUrl, {
    method: "POST", headers: { "Authorization": `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, n: 1, size: "1024x1024", response_format: "b64_json" }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error?.message || JSON.stringify(data));
  return data.data[0].b64_json;
}

async function callStability(model: string, prompt: string, cfg: ImageGenConfig): Promise<string> {
  const resp = await fetch(cfg.baseUrl || `https://api.stability.ai/v2beta/stable-image/generate/sd3`, {
    method: "POST", headers: { "Authorization": cfg.apiKey.startsWith("Bearer ") ? cfg.apiKey : `Bearer ${cfg.apiKey}`, "Accept": "image/*" },
    body: (() => { const f = new FormData(); f.append("prompt", prompt); f.append("model", model); f.append("output_format", "png"); return f; })(),
  });
  if (!resp.ok) { const t = await resp.text(); throw new Error(t); }
  const buf = await resp.arrayBuffer();
  return Buffer.from(buf).toString("base64");
}

async function callTongyi(model: string, prompt: string, cfg: ImageGenConfig): Promise<string> {
  const resp = await fetch(cfg.baseUrl || PROVIDERS.tongyi.baseUrl, {
    method: "POST", headers: { "Authorization": `Bearer ${cfg.apiKey}`, "Content-Type": "application/json", "X-DashScope-Async": "enable" },
    body: JSON.stringify({ model, input: { prompt }, parameters: { size: "1024*1024", n: 1 } }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.message || JSON.stringify(data));
  const taskId = data.output?.task_id;
  if (!taskId) throw new Error("未获取到 task_id");
  return pollTongyiResult(taskId, cfg);
}

async function pollTongyiResult(taskId: string, cfg: ImageGenConfig): Promise<string> {
  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const resp = await fetch(`${(cfg.baseUrl || PROVIDERS.tongyi.baseUrl)}/${taskId}`, {
      headers: { "Authorization": `Bearer ${cfg.apiKey}` },
    });
    const data = await resp.json();
    if (data.output?.task_status === "SUCCEEDED") return data.output.results[0].b64_json;
    if (data.output?.task_status === "FAILED") throw new Error(data.output.message);
  }
  throw new Error("通义万象生成超时");
}

async function callSeedream(model: string, prompt: string, cfg: ImageGenConfig): Promise<string> {
  const resp = await fetch(cfg.baseUrl || PROVIDERS.seedream.baseUrl, {
    method: "POST", headers: { "Authorization": `Bearer ${cfg.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, size: "1024x1024", n: 1, response_format: "b64_json" }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.message || JSON.stringify(data));
  return data.data?.[0]?.b64_json || data.image;
}

export function listProviders(): { id: string; name: string; models: string[] }[] {
  return Object.entries(PROVIDERS).map(([id, p]) => ({ id, name: p.name, models: p.models }));
}

function findProjectDir(): string | null {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) { if (existsSync(join(dir, ".bwvi"))) return dir; const p = join(dir,".."); if (p===dir) break; dir = p; }
  return null;
}
