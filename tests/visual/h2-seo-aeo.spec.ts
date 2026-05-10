import { test, expect } from '@playwright/test';

test('h2/seo-aeo renders citation matrix (default)', async ({ page }) => {
  await page.goto('/h2/seo-aeo');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('default.png', { fullPage: true });
});
