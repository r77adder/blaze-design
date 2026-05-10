import { test, expect } from '@playwright/test';

test.describe('h2-index prototype', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/h2-index');
    await page.waitForLoadState('networkidle');
    // Wait for fonts so typography is stable
    await page.evaluate(() => document.fonts.ready);
  });

  test('renders all-filter (default) state', async ({ page }) => {
    await expect(page).toHaveScreenshot('all.png', { fullPage: true });
  });

  test('renders needs-sign-off filter state', async ({ page }) => {
    await page.getByRole('button', { name: /Needs your sign-off/ }).click();
    await expect(page).toHaveScreenshot('action.png', { fullPage: true });
  });

  test('renders insights filter state', async ({ page }) => {
    await page.getByRole('button', { name: /Insights/ }).click();
    await expect(page).toHaveScreenshot('insight.png', { fullPage: true });
  });
});
