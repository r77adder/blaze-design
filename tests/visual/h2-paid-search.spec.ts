import { test, expect } from '@playwright/test';

test.describe('h2/paid-search prototype', () => {
  test('renders live campaign view (default)', async ({ page }) => {
    await page.goto('/h2/paid-search');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await expect(page).toHaveScreenshot('default.png', { fullPage: true });
  });
});
