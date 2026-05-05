import { loadConfig, saveConfig, generateImage, listProviders } from "../engine/image-gen.js";
import { getDemoDir } from "./demo.js";
import { info, success, errExit, result } from "./ux.js";

export async function imageCommand(args: string[]) {
  const sub = args[0];

  // bwvi image config <provider> --key=<key> [--model=<model>] [--url=<url>]
  if (sub === "config") {
    const provider = args[1];
    if (!provider) {
      const configs = loadConfig();
      const configured = Object.keys(configs);
      console.log(JSON.stringify({ configured: configured.length > 0 ? configured : "无", all: listProviders() }, null, 2));
      return;
    }
    const keyFlag = args.find(a => a.startsWith("--key="));
    const modelFlag = args.find(a => a.startsWith("--model="));
    const urlFlag = args.find(a => a.startsWith("--url="));
    if (!keyFlag) errExit(`请提供 --key=<API Key>`);
    saveConfig(provider, { provider, apiKey: keyFlag.split("=")[1], model: modelFlag?.split("=")[1] || "", baseUrl: urlFlag?.split("=")[1] || "" });
    success(`${provider} 配置已保存`);
    return;
  }

  // bwvi image <prompt> --provider=<provider> [--model=<model>]
  const prompt = args.find(a => !a.startsWith("--"));
  if (!prompt || prompt === "config") {
    result({ providers: listProviders(), usage: "bwvi image <prompt> --provider=<id> [--model=<model>]\nbwvi image config <provider> --key=<key> [--model=<model>]" });
    return;
  }

  const providerFlag = args.find(a => a.startsWith("--provider="));
  const provider = providerFlag?.split("=")[1] || "openai";
  const modelFlag = args.find(a => a.startsWith("--model="));
  const model = modelFlag?.split("=")[1];

  info(`正在通过 ${provider} 生成图片: "${prompt.slice(0, 60)}..."`);

  try {
    const result_img = await generateImage(prompt, provider, model, getDemoDir());
    success(`图片已保存: ${result_img.url}`);
    result({ status: "ok", file: result_img.url, provider: result_img.provider, model: result_img.model });
  } catch (e: any) {
    errExit(e.message);
  }
}
