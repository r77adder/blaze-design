import { test, expect } from '@playwright/test';

test.describe('modal-showcase prototype', () => {
  test('renders trigger buttons (no modal open)', async ({ page }) => {
    await page.goto('/modal-showcase');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('default.png', { fullPage: true });
  });

  test('opens the simple modal', async ({ page }) => {
    await page.goto('/modal-showcase');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('open-simple').click();
    await expect(page.getByTestId('simple-modal')).toBeVisible();
    await expect(page).toHaveScreenshot('simple.png', { fullPage: true });
  });

  test('opens the hero modal', async ({ page }) => {
    await page.goto('/modal-showcase');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('open-hero').click();
    await expect(page.getByTestId('hero-modal')).toBeVisible();
    await expect(page).toHaveScreenshot('hero.png', { fullPage: true });
  });

  test('opens the wizard modal', async ({ page }) => {
    await page.goto('/modal-showcase');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('open-wizard').click();
    await expect(page.getByTestId('wizard-modal')).toBeVisible();
    await expect(page).toHaveScreenshot('wizard-step-1.png', { fullPage: true });
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page).toHaveScreenshot('wizard-step-2.png', { fullPage: true });
  });

  test('stacks two modals via openModal from inside a modal', async ({ page }) => {
    await page.goto('/modal-showcase');
    await page.waitForLoadState('networkidle');
    await page.getByTestId('open-stacked').click();
    await expect(page.getByTestId('stacked-first')).toBeVisible();
    await page.getByTestId('stacked-first').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByTestId('stacked-confirm')).toBeVisible();
    await expect(page).toHaveScreenshot('stacked.png', { fullPage: true });
  });
});
