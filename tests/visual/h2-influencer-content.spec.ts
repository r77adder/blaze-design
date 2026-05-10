import { test, expect } from '@playwright/test';

test('h2/influencer-content renders overview tab (default)', async ({ page }) => {
  await page.goto('/h2/influencer-content');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('default.png', { fullPage: true });
});
