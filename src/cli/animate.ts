import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { getAnimationCSS, getStageScript } from "../engine/animation-engine.js";

export async function animateCommand(args: string[]) {
  const filePath = args.find(a => !a.startsWith("--"));
  if (!filePath || !existsSync(filePath)) {
    console.error(JSON.stringify({ error: "请提供 HTML 文件路径", code: "FILE_NOT_FOUND" }));
    process.exit(1);
  }

  const fpsFlag = args.find(a => a.startsWith("--fps="));
  const fps = fpsFlag ? parseInt(fpsFlag.split("=")[1]) : 25;
  const bgmFlag = args.find(a => a.startsWith("--bgm="));
  const bgm = bgmFlag ? bgmFlag.split("=")[1] : undefined;
  const outFlag = args.find(a => a.startsWith("--output="));
  const output = outFlag ? outFlag.split("=")[1] : filePath.replace(/\.html$/i, ".mp4");
  const typeFlag = args.find(a => a.startsWith("--type="));
  const animType = typeFlag ? typeFlag.split("=")[1] : "fade-up";
  const embed = args.includes("--embed");

  if (embed) {
    let html = readFileSync(filePath, "utf-8");
    const css = getAnimationCSS();
    const script = getStageScript();
    if (!html.includes("bwi-anim")) {
      html = html.replace("</head>", `<style>${css}</style></head>`);
      html = html.replace("</body>", `${script}</body>`);
      html = html.replace(/<body[^>]*>/i, (m) => `${m} class="bwi-stagger"`);
      writeFileSync(filePath, html, "utf-8");
    }
    console.log(JSON.stringify({ status: "ok", file: filePath, action: "embedded animation CSS + scroll trigger", type: animType }, null, 2));
    return;
  }

  // Export as MP4
  try {
    execSync("ffmpeg -version", { stdio: "pipe", timeout: 5000 });
  } catch {
    console.log(JSON.stringify({ status: "error", error: "ffmpeg not found", note: "Install ffmpeg: winget install ffmpeg" }, null, 2));
    return;
  }

  const css = getAnimationCSS();
  const script = getStageScript();
  let html = readFileSync(filePath, "utf-8");
  if (!html.includes("bwi-anim")) {
    html = html.replace("</head>", `<style>${css}</style></head>`);
    html = html.replace("</body>", `${script}</body>`);
  }

  const inputHtml = filePath.replace(/\.html$/i, ".animated.html");
  writeFileSync(inputHtml, html, "utf-8");

  const cmds: string[] = [
    `ffmpeg -framerate ${fps} -f lavfi -i color=c=#000:s=1920x1080:d=10 -c:v libx264 -pix_fmt yuv420p "${output}"`,
  ];

  if (bgm && BGM_FILES[bgm]) {
    cmds.push(`ffmpeg -i "${output}" -i "${BGM_FILES[bgm]}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest "output-${bgm}.mp4"`);
  }

  console.log(JSON.stringify({
    status: "prepared", input: filePath, fps, bgm: bgm || null, output, instructions: [
      `Animation CSS + scroll-trigger JS embedded`,
      `To render: ${cmds.join(" && ")}`,
      `Or open ${inputHtml} in a browser to see animations`,
    ].join("\n"),
  }, null, 2));
}

const BGM_FILES: Record<string, string> = {
  tech: "assets/bgm-tech.mp3",
  ad: "assets/bgm-ad.mp3",
  educational: "assets/bgm-educational.mp3",
  tutorial: "assets/bgm-tutorial.mp3",
};
