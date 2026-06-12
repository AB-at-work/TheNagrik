import { test, expect } from '@playwright/test';

test.describe('Public Navigation', () => {
  test('homepage renders correctly and has links', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page).toHaveTitle(/The Nagrik/);

    // Verify critical elements are present
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // The hero section should be visible
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Verify a link works
    const aboutLink = page.getByRole('link', { name: /About/i }).first();
    await expect(aboutLink).toBeVisible();
  });

  test('about page renders', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/About The Nagrik/i);
  });
});
