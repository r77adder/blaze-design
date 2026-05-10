import { test, expect } from '@playwright/test';

test('h2/campaigns renders campaign list (default)', async ({ page }) => {
  await page.goto('/h2/campaigns');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('default.png', { fullPage: true });
});
