import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp up to 50 users
    { duration: '1m', target: 50 },  // Stay at 50 users for 1m
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
    http_req_failed: ['rate<0.01'],   // Error rate should be less than 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // Read Load (95%)
  const res1 = http.get(`${BASE_URL}/api/v1/settings`);
  check(res1, { 'status is 200': (r) => r.status === 200 });

  const res2 = http.get(`${BASE_URL}/api/v1/blog`);
  check(res2, { 'status is 200': (r) => r.status === 200 });

  const res3 = http.get(`${BASE_URL}/api/v1/projects`);
  check(res3, { 'status is 200': (r) => r.status === 200 });

  // Write Load (5%)
  if (Math.random() < 0.05) {
    const payload = JSON.stringify({
      email: `test_${__VU}_${__ITER}@example.com`,
      name: 'Load Test User',
      subject: 'general',
      message: 'This is a load test message.',
    });
    
    const params = {
      headers: { 'Content-Type': 'application/json' },
    };
    
    const resWrite = http.post(`${BASE_URL}/api/v1/forms/contact`, payload, params);
    check(resWrite, { 'status is 201 or 429': (r) => r.status === 201 || r.status === 429 });
  }

  sleep(1);
}
