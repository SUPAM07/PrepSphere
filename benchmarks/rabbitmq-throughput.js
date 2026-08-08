import http from 'k6/http';
import { check, sleep } from 'k6';
import exec from 'k6/execution';

// Test configuration
export const options = {
  scenarios: {
    rabbitmq_event_test: {
      executor: 'constant-arrival-rate',
      rate: 150, // 150 registrations per second (Extremely high for Argon2 hashing)
      timeUnit: '1s',
      duration: '15s',
      preAllocatedVUs: 150,
      maxVUs: 500,
    },
  },
};

const BASE_URL = 'http://localhost:8000';

export default function () {
  // Generate a guaranteed unique user email per iteration
  const testEmail = `load_event_${exec.vu.idInTest}_${exec.scenario.iterationInTest}@example.com`;
  
  
  // Firing this endpoint triggers the 'user.account.registered' event on RabbitMQ!
  // Auth-Service publishes it -> RabbitMQ -> Billing-Service consumes it to initialize the wallet
  const res = http.post(`${BASE_URL}/api/auth/register`, JSON.stringify({
    name: 'Event Test User',
    email: testEmail,
    password: 'Password123!'
  }), { headers: { 'Content-Type': 'application/json' } });

  check(res, {
    'registration successful (event fired)': (r) => r.status === 201,
  });
}
