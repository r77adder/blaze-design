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

  test('Create-new chooser modal — Campaign vs Post picker', async ({ page }) => {
    await page.getByRole('button', { name: 'Create new' }).click();
    await expect(
      page.getByRole('dialog', { name: 'What do you want to create?' }),
    ).toBeVisible();
    await expect(page).toHaveScreenshot('chooser-open.png', { fullPage: true });
  });

  test('New-post modal opens via Post chooser tile', async ({ page }) => {
    await page.getByRole('button', { name: 'Create new' }).click();
    await page
      .getByRole('dialog', { name: 'What do you want to create?' })
      .getByText('Post', { exact: true })
      .click();
    await expect(page.getByRole('dialog', { name: 'New post' })).toBeVisible();
    await expect(page).toHaveScreenshot('new-post-open.png', { fullPage: true });
  });

  test('Week navigation — previous week shows empty cells', async ({ page }) => {
    await page.getByRole('button', { name: 'Previous week' }).click();
    await expect(page.getByText('Apr 27 – May 3, 2026')).toBeVisible();
    await expect(page).toHaveScreenshot('prev-week.png', { fullPage: true });
  });
});
