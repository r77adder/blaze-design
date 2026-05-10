import { test, expect } from '@playwright/test';

test.describe('h2/landing-pages prototype', () => {
  test('renders hub list (default)', async ({ page }) => {
    await page.goto('/h2/landing-pages');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot('default.png', { fullPage: true });
  });
});
