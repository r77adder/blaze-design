import { test, expect } from '@playwright/test';

test('h2/email-sms renders program hub (default)', async ({ page }) => {
  await page.goto('/h2/email-sms');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('default.png', { fullPage: true });
});
