/**
 * 直接录制测试 — 绕过 CLI 直接调用 Playwright
 *
 * 运行: node scripts/direct-capture.mjs
 * 前置: npm install playwright && npx playwright install chromium
 */
import { chromium } from "playwright";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const htmlPath = join(root, "demo", "bwvi-promo.html");
const outputDir = join(root, "demo");
const outputPath = join(outputDir, "bwvi-promo-capture.webm");

async function main() {
  console.log("\n═══════════════════════════════════════");
  console.log("  BWVI 推广页 — 直接录制测试");
  console.log("═══════════════════════════════════════\n");

  // 1. 读取 HTML
  console.log("📄 读取页面...");
  let html = readFileSync(htmlPath, "utf-8");
  console.log(`   大小: ${(html.length / 1024).toFixed(0)} KB`);

  // 2. 手动注入视频录制专用的动画脚本
  //    替换 IntersectionObserver 为直接播放
  html = html.replace(
    '<script>',
    `<script>
(function(){
  // 立即播放所有动画（视频录制模式）
  document.addEventListener('DOMContentLoaded', function(){
    setTimeout(function(){
      var anims = document.querySelectorAll('.bwi-anim');
      anims.forEach(function(el){
        el.style.animationPlayState = 'running';
        el.style.opacity = '1';
      });
      document.body.dataset.bwiVideoReady = 'true';
      console.log('[BWVI] ' + anims.length + ' animations activated');
    }, 100);
  });
})();
</script><script>`
  );

  const tmpHtml = join(outputDir, "bwvi-capture-tmp.html");
  writeFileSync(tmpHtml, html, "utf-8");
  console.log("✅ 动画注入完成");

  // 3. 检测交互元素
  console.log("\n🎮 检测交互元素...");
  const interactionCount = (html.match(/data-bwvi-toggle=/g) || []).length;
  const carouselCount = (html.match(/data-bwvi-carousel=/g) || []).length;
  console.log(`   Modal/Tab/Accordion: ${interactionCount} 个`);
  console.log(`   Carousel: ${carouselCount} 个`);

  // 4. 启动 Playwright 录制
  console.log("\n🎥 启动 Chromium 录制...");
  console.log(`   分辨率: 1920×1080`);
  console.log(`   输出: ${outputPath}\n`);

  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: { dir: outputDir, size: { width: 1920, height: 1080 } },
  });

  const page = await context.newPage();

  // 5. 加载页面
  console.log("⏳ 加载页面...");
  await page.goto(`file://${tmpHtml.replace(/\\/g, "/")}`, {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  // 等待动画就绪
  try {
    await page.waitForFunction(
      () => document.body?.dataset?.bwiVideoReady === "true",
      { timeout: 5000 }
    );
    console.log("✅ 动画已就绪");
  } catch {
    console.log("⚠️ 动画就绪超时，继续执行");
  }

  // 6. 执行交互操作
  console.log("\n🖱️ 执行交互操作...");

  // 6a. 切换 Tab
  try {
    const tabs = await page.$$('.tab-item');
    if (tabs.length > 1) {
      await tabs[1].click();
      await page.waitForTimeout(800);
      console.log("   ✅ 切换到 Tab 2 (性能)");
      await tabs[2].click();
      await page.waitForTimeout(800);
      console.log("   ✅ 切换到 Tab 3 (集成)");
      await tabs[0].click();
      await page.waitForTimeout(500);
      console.log("   ✅ 切回 Tab 1 (功能)");
    }
  } catch (e) { console.log("   ⚠️ Tab 交互失败:", e.message); }

  // 6b. 打开 Modal
  try {
    const modalBtn = await page.$('.modal-trigger');
    if (modalBtn) {
      await modalBtn.click();
      await page.waitForTimeout(1000);
      console.log("   ✅ 打开 Modal");
      // 关闭 Modal
      const closeBtn = await page.$('[data-bwvi-toggle="modal"][data-bwvi-target="featuresModal"]');
      if (closeBtn) {
        await closeBtn.click();
        await page.waitForTimeout(500);
        console.log("   ✅ 关闭 Modal");
      }
    }
  } catch (e) { console.log("   ⚠️ Modal 交互失败:", e.message); }

  // 6c. 展开 Accordion
  try {
    const accHeaders = await page.$$('.accordion-header');
    if (accHeaders.length > 0) {
      await accHeaders[0].click();
      await page.waitForTimeout(600);
      console.log("   ✅ 展开 Accordion 1");
      await accHeaders[1].click();
      await page.waitForTimeout(600);
      console.log("   ✅ 展开 Accordion 2");
    }
  } catch (e) { console.log("   ⚠️ Accordion 交互失败:", e.message); }

  // 6d. Carousel
  try {
    const nextBtn = await page.$('[data-bwvi-carousel="sceneCarousel"][data-bwvi-dir="next"]');
    if (nextBtn) {
      for (let i = 0; i < 3; i++) {
        await nextBtn.click();
        await page.waitForTimeout(800);
        console.log(`   ✅ 轮播 ${i + 2}/5`);
      }
    }
  } catch (e) { console.log("   ⚠️ Carousel 交互失败:", e.message); }

  // 6e. Toast
  try {
    const toastBtn = await page.$('[data-bwvi-toggle="toast"]');
    if (toastBtn) {
      await toastBtn.click();
      await page.waitForTimeout(1500);
      console.log("   ✅ Toast 通知");
    }
  } catch (e) { console.log("   ⚠️ Toast 交互失败:", e.message); }

  // 7. 自动滚动浏览页面
  console.log("\n📜 自动滚动...");
  const scrollHeight = await page.evaluate(() =>
    document.documentElement.scrollHeight - window.innerHeight
  );
  const steps = 20;
  for (let i = 0; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), (scrollHeight * i) / steps);
    await page.waitForTimeout(300);
    if (i % 5 === 0) {
      console.log(`   滚动 ${Math.round((i / steps) * 100)}%`);
    }
  }

  // 8. 回到顶部
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  console.log("   滚动完成 ✅");

  // 9. 关闭浏览器（Playwright 写入视频文件）
  console.log("\n💾 保存视频...");
  await context.close();
  await browser.close();

  // 10. 查找生成的 WebM
  const fs = await import("node:fs");
  const path = await import("node:path");
  const files = fs.readdirSync(outputDir);
  const webmFiles = files
    .filter((f) => path.extname(f).toLowerCase() === ".webm")
    .filter((f) => !f.includes("bwvi-capture-"))
    .map((f) => join(outputDir, f));

  if (webmFiles.length > 0) {
    const result = webmFiles.sort().reverse()[0];
    const size = fs.statSync(result).size;
    console.log(`\n═══════════════════════════════════════`);
    console.log(`  ✅ 录制成功!`);
    console.log(`  📁 ${result}`);
    console.log(`  📏 ${(size / 1024 / 1024).toFixed(1)} MB`);
    console.log(`  🎬 分辨率: 1920×1080`);
    console.log(`  📐 25fps · WebM 格式`);
    console.log(`═══════════════════════════════════════\n`);

    // 清理临时文件
    try { fs.unlinkSync(tmpHtml); } catch {}
  } else {
    console.log("\n❌ 未找到录制的视频文件");
  }
}

main().catch((e) => {
  console.error("\n❌ 录制失败:", e.message);
  process.exit(1);
});
