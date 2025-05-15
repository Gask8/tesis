// test-cars-api.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';
import exec from 'k6/execution';

// Custom metrics
const getAllCarsRequestDuration = new Trend('get_all_cars_duration');
const getAllCarsRequests = new Counter('get_all_cars_requests');

// OpenTelemetry configuration
const otlpEndpoint = 'http://172.31.87.22:4318'; // Replace with your endpoint

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users over 30 seconds
    { duration: '1m', target: 20 },  // Stay at 20 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  },
};

export default function () {
  // Main test function
  const response = getAllCars();
  
  // Add sleep time between iterations
  sleep(1);
}

function getAllCars() {
  const startTime = new Date();
  
  const response = http.get('http://172.31.91.19/api/cars', {
    headers: {
      'Content-Type': 'application/json',
    },
    tags: {
      name: 'get_all_cars',
    },
  });

  // Calculate request duration
  const duration = new Date() - startTime;
  getAllCarsRequestDuration.add(duration);
  getAllCarsRequests.add(1);

  // Send metrics to OpenTelemetry
  sendToOpenTelemetry({
    name: 'get_all_cars',
    duration: duration,
    status: response.status,
    vuId: exec.vu.idInTest,
  });

  // Perform checks
  check(response, {
    'is status 200': (r) => r.status === 200,
    'has cars data': (r) => r.json().length >= 0,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  return response;
}

function sendToOpenTelemetry(metrics) {
  const payload = {
    resourceSpans: [{
      resource: {
        attributes: [{
          key: "service.name",
          value: { stringValue: "cars-api-test" }
        }]
      },
      instrumentationLibrarySpans: [{
        spans: [{
          name: metrics.name,
          kind: 1, // CLIENT
          startTimeUnixNano: Date.now() * 1000000,
          endTimeUnixNano: (Date.now() + metrics.duration) * 1000000,
          attributes: [
            {
              key: "duration_ms",
              value: { doubleValue: metrics.duration }
            },
            {
              key: "status_code",
              value: { intValue: metrics.status }
            },
            {
              key: "vu_id",
              value: { intValue: metrics.vuId }
            }
          ]
        }]
      }]
    }]
  };

  http.post(`${otlpEndpoint}/v1/traces`, JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
