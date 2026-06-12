import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('API Boundary and Validation Testing', () => {
  test('GET /api/v1/settings returns 200 and valid JSON', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/settings`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('POST /api/v1/forms/contact validates empty body', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/v1/forms/contact`, {
      data: {}
    });
    expect(response.status()).toBe(422);
    const data = await response.json();
    expect(data.error.code).toBe('VALIDATION_ERROR');
  });

  test('POST /api/v1/forms/contact prevents SQLi/XSS via input validation', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/v1/forms/contact`, {
      data: {
        name: "<script>alert('xss')</script>",
        email: "test' OR '1'='1",
        subject: "general",
        message: "Injecting bad data"
      }
    });
    // This should fail email validation if validation is strong enough
    expect(response.status()).toBe(422);
  });
});
