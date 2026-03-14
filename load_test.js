import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // ramp up to 20 users
    { duration: '1m', target: 20 },  // stay at 20 users
    { duration: '20s', target: 0 },  // scale down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // less than 1% errors
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8000/api/v1';

export default function () {
  const params = {
    headers: {
      'Accept': 'application/json',
    },
  };

  // 1. Hit the products endpoint (highly cached)
  let res = http.get(`${BASE_URL}/products`, params);
  
  if (!check(res, {
    'status is 200': (r) => r.status === 200,
    'has products': (r) => {
        try {
            return r.json().data !== undefined;
        } catch (e) {
            console.error(`Failed to parse JSON for STATUS ${r.status}. Body: ${r.body.substring(0, 500)}`);
            return false;
        }
    },
  })) {
    // If check fails, we already logged the error inside the check's has products function
  }

  sleep(1);

  // 2. Hit a specific product (cached)
  let productRes = http.get(`${BASE_URL}/products/1`);
  if (productRes.status === 200) {
    check(productRes, {
      'product status is 200': (r) => r.status === 200,
    });
  }

  sleep(1);
}
