import { test, expect } from '@playwright/test';

test.describe('h2/reputation prototype', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/h2/reputation');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
  });

  test('renders reviews tab (default)', async ({ page }) => {
    await expect(page).toHaveScreenshot('reviews.png', { fullPage: true });
  });

  test('renders insights tab', async ({ page }) => {
    await page.getByRole('button', { name: /Business Insights/ }).click();
    await expect(page).toHaveScreenshot('insights.png', { fullPage: true });
  });
});
