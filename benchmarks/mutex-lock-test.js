import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  scenarios: {
    mutex_lock_test: {
      executor: 'shared-iterations',
      vus: 500, // 500 concurrent virtual users
      iterations: 5000, // Fire exactly 5000 requests total
      maxDuration: '20s',
    },
  },
};

const BASE_URL = 'http://localhost:8000';

// The setup runs once before the load test starts
export function setup() {
  // 1. Register a dummy user to ensure they exist and have initial coins
  const testEmail = `load_test_mutex_${Math.random().toString(36).substring(7)}@example.com`;
  const password = 'Password123!';
  
  http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
    name: 'Load Test User',
    email: testEmail,
    password: password
  }), { headers: { 'Content-Type': 'application/json' } });

  // Give the outbox worker a second to process the registration and grant 150 coins
  sleep(1);

  // 2. Login to get the access token
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

// The main test function runs concurrently across the VUs
export default function (data) {
  const payload = JSON.stringify({
    type: "technical",
    role: "software engineer"
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`,
    },
  };

  // Fire the start interview request
  const res = http.post(`${BASE_URL}/api/interview/start`, payload, params);

  // Check that the request was processed (either success or expected 402 Insufficient Coins)
  // A 500 error would indicate a crash or failed mutex lock resulting in negative balance DB error
  check(res, {
    'status is 201 or 402': (r) => r.status === 201 || r.status === 402,
    'no 500 errors': (r) => r.status !== 500,
  });
}
