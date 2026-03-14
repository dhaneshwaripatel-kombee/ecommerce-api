/**
 * k6 spike test – sudden spike to 200 users
 * Run from repo root: k6 run load-testing/k6/spike-test.js
 * Run from this folder: k6 run spike-test.js
 * Override base URL: k6 run -e BASE_URL=http://localhost:8000 load-testing/k6/spike-test.js
 */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '10s', target: 200 },
    { duration: '1m', target: 200 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<5000'],
    http_req_failed: ['rate<0.2'],
  },
};

export function setup() {
  const loginRes = http.post(`${BASE_URL}/api/v1/login`, JSON.stringify({
    email: __ENV.TEST_USER_EMAIL || 'test@example.com',
    password: __ENV.TEST_USER_PASSWORD || 'password',
  }), {
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  });
  if (loginRes.status !== 200) {
    return { token: null };
  }
  const body = loginRes.json();
  const token = body.data?.token || body.token || body.access_token;
  return { token };
}

export default function (data) {
  const headers = { 'Accept': 'application/json' };
  if (data.token) {
    headers['Authorization'] = `Bearer ${data.token}`;
  }
  const res = http.get(`${BASE_URL}/api/v1/products`, { headers });
  check(res, { 'products status 200 or 401': (r) => r.status === 200 || r.status === 401 });
  sleep(0.3);
}
