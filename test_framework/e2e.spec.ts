/**
 * E2E 测试 — 测试 BWVI 生成的页面。
 *
 * 运行: npx playwright test
 * 前置: npm install -D @playwright/test && npx playwright install chromium
 */

import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const DEMO_DIR = join(__dirname, "..", "demo");

test.describe("BWVI generated pages", () => {
  test("promo page loads with all sections", async ({ page }) => {
    await page.goto(`file://${join(DEMO_DIR, "bwvi-promo.html").replace(/\\/g, "/")}`);
    await expect(page.locator("h1")).toContainText("BWVI");
    await expect(page.locator(".hero")).toBeVisible();
  });

  test("interactive elements respond to clicks", async ({ page }) => {
    await page.goto(`file://${join(DEMO_DIR, "bwvi-promo.html").replace(/\\/g, "/")}`);

    // Tab switching
    const tabs = page.locator(".tab-item");
    await tabs.nth(1).click();
    await page.waitForTimeout(300);
    await expect(tabs.nth(1)).toHaveClass(/bwvi-active/);

    // Accordion
    const accHeader = page.locator(".accordion-header").first();
    await accHeader.click();
    await page.waitForTimeout(300);
  });

  test("animations are present", async ({ page }) => {
    await page.goto(`file://${join(DEMO_DIR, "bwvi-promo.html").replace(/\\/g, "/")}`);
    const animCount = await page.locator(".bwi-anim").count();
    expect(animCount).toBeGreaterThan(10);
  });

  test("dark mode toggle works", async ({ page }) => {
    await page.goto(`file://${join(DEMO_DIR, "bwvi-promo.html").replace(/\\/g, "/")}`);
    const darkBtn = page.locator('[data-bwvi-toggle="darkmode"]');
    await darkBtn.click();
    await page.waitForTimeout(200);
    const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme).toBe("dark");
  });
});
