import { test, expect } from '@playwright/test';

test.describe('hello-world prototype', () => {
  test('renders default state', async ({ page }) => {
    await page.goto('/hello-world');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('default.png', { fullPage: true });
  });

  test('renders cold state', async ({ page }) => {
    await page.goto('/hello-world');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'cold' }).click();
    await expect(page).toHaveScreenshot('cold.png', { fullPage: true });
  });

  test('renders error state', async ({ page }) => {
    await page.goto('/hello-world');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'error' }).click();
    await expect(page).toHaveScreenshot('error.png', { fullPage: true });
  });
});
