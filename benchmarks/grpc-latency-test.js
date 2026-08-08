import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  scenarios: {
    grpc_latency_test: {
      executor: 'constant-vus',
      vus: 500, // 500 concurrent virtual users
      duration: '20s', // Run for 20 seconds
    },
  },
  thresholds: {
    // We want the p(95) latency to be under 50ms, proving gRPC is blazing fast!
    http_req_duration: ['p(95)<50'], 
  },
};

const BASE_URL = 'http://localhost:8000';

export function setup() {
  const testEmail = `load_test_grpc_${Math.random().toString(36).substring(7)}@example.com`;
  const password = 'Password123!';
  
  http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
    name: 'Latency Test User',
    email: testEmail,
    password: password
  }), { headers: { 'Content-Type': 'application/json' } });

  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: testEmail,
    password: password
  }), { headers: { 'Content-Type': 'application/json' } });

  let token = '';
  if (loginRes.status === 200) {
    const body = loginRes.json();
    token = body.accessToken;
  }

  return { token: token };
}

export default function (data) {
  const params = {
    headers: {
      'Authorization': `Bearer ${data.token}`,
    },
  };

  // Fire the /api/me request which triggers the gRPC isAuth middleware
  const res = http.get(`${BASE_URL}/api/me`, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // Brief pause to simulate normal user behavior
  sleep(0.1);
}
