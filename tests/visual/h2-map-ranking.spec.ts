import { test, expect } from '@playwright/test';

test.describe('h2/map-ranking prototype', () => {
  test('renders live home (default)', async ({ page }) => {
    await page.goto('/h2/map-ranking');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot('default.png', { fullPage: true });
  });
});
