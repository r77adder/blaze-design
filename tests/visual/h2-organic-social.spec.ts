import { test, expect } from '@playwright/test';

test.describe('h2/organic-social prototype', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/h2/organic-social');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
  });

  test('renders calendar with scheduled posts', async ({ page }) => {
    await expect(page).toHaveScreenshot('default.png', { fullPage: true });
  });
});
