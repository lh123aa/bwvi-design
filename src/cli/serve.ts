import { existsSync, readFileSync, watch } from "node:fs";
import { join } from "node:path";
import { createServer } from "node:http";
import { getDemoDir } from "./demo.js";
import { info, success, errExit, result } from "./ux.js";

export async function serveCommand(args: string[]) {
  const portFlag = args.find(a => a.startsWith("--port="));
  const port = portFlag ? parseInt(portFlag.split("=")[1]) : 3000;
  const dir = getDemoDir();
  const watchMode = !args.includes("--no-watch");

  if (!existsSync(dir)) {
    errExit("demo 目录不存在，请先生成一些页面", "NO_DEMO_DIR");
  }

  const MIME: Record<string, string> = {
    ".html": "text/html;charset=utf-8",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".json": "application/json",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };

  const server = createServer((req, res) => {
    let url = req.url || "/";
    if (url === "/") url = "/index.html";
    if (!url.startsWith("/")) url = "/" + url;

    const filePath = join(dir, url);
    const ext = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();

    if (!existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain;charset=utf-8" });
      res.end("404 - File not found in demo/");
      return;
    }

    const content = readFileSync(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(content);
  });

  server.listen(port, () => {
    info(`BWVI 预览服务器已启动`);
    success(`  http://localhost:${port}`);
    info(`  demo 目录: ${dir}`);
    info(`  按 Ctrl+C 停止`);
    if (watchMode) {
      info("  文件变更自动刷新 (需手动刷新浏览器)");
    }
  });
}
