import { test, expect } from '@playwright/test';

test.describe('Public API Hardening & Resilience', () => {
  test('GET /api/v1/articles returns 200 and Cache-Control headers', async ({ request }) => {
    const response = await request.get('/api/v1/articles');
    expect(response.status()).toBe(200);
    
    // Verify Caching Headers
    const headers = response.headers();
    expect(headers['cache-control']).toContain('public, s-maxage=60');
    
    // Verify JSON response structure (envelope)
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /api/v1/projects returns 200 and Cache-Control headers', async ({ request }) => {
    const response = await request.get('/api/v1/projects');
    expect(response.status()).toBe(200);
    
    // Verify Caching Headers
    const headers = response.headers();
    expect(headers['cache-control']).toContain('public, s-maxage=60');
    
    // Verify JSON response structure (raw)
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test('API rate limits after 100 requests', async ({ request }) => {
    // We will simulate 101 requests.
    // In playwright, we can just send multiple requests in a loop.
    // Note: since this runs locally, we might hit Next.js overhead, so we'll just check if the logic exists.
    let status429Hit = false;
    
    // We'll run a few rapid requests to see if we can trigger the rate limiter.
    // For local tests, we might not want to wait for 100 requests, but let's do it.
    for (let i = 0; i < 105; i++) {
      const response = await request.get('/api/v1/articles?rateLimitBypass=false');
      if (response.status() === 429) {
        status429Hit = true;
        const body = await response.json();
        expect(body.error).toBe('Too Many Requests');
        break;
      }
    }
    
    // If we hit the rate limit, it passes.
    expect(status429Hit).toBe(true);
  });
});
