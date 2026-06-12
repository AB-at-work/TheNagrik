import { test, expect } from '@playwright/test';

test.describe('Public Forms', () => {
  test('contact form shows validation errors on empty submission', async ({ page }) => {
    await page.goto('/contact');

    // Find the submit button
    const submitBtn = page.getByRole('button', { name: /Send Message/i });
    await expect(submitBtn).toBeVisible();

    // Submit the form empty
    await submitBtn.click();

    // Verify validation error messages appear for required fields
    // Assuming React Hook Form places error messages inside the DOM near the inputs
    await expect(page.getByText(/String must contain at least 2 character/i).first()).toBeVisible();
    await expect(page.getByText(/Invalid email/i).first()).toBeVisible();
  });
});
