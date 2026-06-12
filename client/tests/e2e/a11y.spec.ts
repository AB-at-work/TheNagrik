import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility (a11y)', () => {
  test('homepage should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Check for violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('about page should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/about');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Check for violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
