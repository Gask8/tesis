import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");
const BASE_URL =
  __ENV.BASE_URL ||
  "http://intela-appli-slu18y1s7ajr-1557949211.us-east-1.elb.amazonaws.com/api";

export const options = {
  stages: [
    { duration: "5m", target: 5 }, // Ramp up to 20 users
    { duration: "5m", target: 5 }, // Stay at 20 users
    { duration: "10m", target: 10 }, // Ramp up to 50 users
    { duration: "10m", target: 10 }, // Stay at 50 users
    { duration: "10m", target: 20 }, // Ramp up to 100 users
    { duration: "5m", target: 20 }, // Stay at 100 users
    { duration: "5m", target: 0 }, // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    errors: ["rate<0.1"],
  },
};

// Sample test data
const testData = {
  car: {
    make: "Toyota",
    model: "Camry",
    year: 2024,
    price: 25000,
    stock: 8,
  },
  sale: {
    car_id: 1,
    customer_name: "John Doe",
    sale_price: 25000,
    sale_date: new Date().toISOString(),
  },
};

// Define request probabilities
const REQUEST_PROBABILITIES = {
  // Cars API
  getAllCars: 0.15, // 15%
  getCarById: 0.2, // 20%
  createCar: 0.05, // 5%
  updateCar: 0.05, // 5%
  getCarsByMake: 0.1, // 10%
  getInStockCars: 0.15, // 15%

  // Sales API
  getAllSales: 0.15, // 15%
  createSale: 0.05, // 5%
  getSaleById: 0.2, // 20%
  updateSale: 0.05, // 5%
  getSalesByCarId: 0.08, // 8%
  getSalesByCustomer: 0.15, // 15%
  getSalesByDateRange: 0.08, // 8%
  getTotalSales: 0.1, // 10%

  // Reports API
  generateReport: 0.05, // 5%
};

// Helper function to determine if a request should be executed
function shouldExecuteRequest(probability) {
  return Math.random() < probability;
}

function checkResponse(response, expectedStatus = 200) {
  return check(response, {
    "status is 200 or 201": (r) => r.status == expectedStatus,
    "response time < 2000ms": (r) => r.timings.duration < 2000,
  });
}

export default function () {
  // Test all routes in groups
  group("Health Check", () => {
    const healthCheck = http.get(`${BASE_URL.replace("/api", "")}/health`);
    if (!checkResponse(healthCheck)) errorRate.add(1);
  });
  group("Cars API", () => {
    if (shouldExecuteRequest(REQUEST_PROBABILITIES.getAllCars)) {
      const getAllCars = http.get(`${BASE_URL}/cars/all`);
      if (!checkResponse(getAllCars)) errorRate.add(1);
    }

    if (shouldExecuteRequest(REQUEST_PROBABILITIES.createCar)) {
      const createCar = http.post(
        `${BASE_URL}/cars`,
        JSON.stringify(testData.car),
        { headers: { "Content-Type": "application/json" } }
      );
      if (!checkResponse(createCar, 201)) errorRate.add(1);
    }

    if (shouldExecuteRequest(REQUEST_PROBABILITIES.getCarById)) {
      const carId = 1;
      const getCarById = http.get(`${BASE_URL}/cars/id/${carId}`);
      if (!checkResponse(getCarById)) errorRate.add(1);
    }

    if (shouldExecuteRequest(REQUEST_PROBABILITIES.updateCar)) {
      const carId = 1;
      const updateCar = http.put(
        `${BASE_URL}/cars/id/${carId}`,
        JSON.stringify({ ...testData.car, price: 26000 }),
        { headers: { "Content-Type": "application/json" } }
      );
      if (!checkResponse(updateCar)) errorRate.add(1);
    }

    if (shouldExecuteRequest(REQUEST_PROBABILITIES.getCarsByMake)) {
      const getCarsByMake = http.get(`${BASE_URL}/cars/make/Toyota`);
      if (!checkResponse(getCarsByMake)) errorRate.add(1);
    }

    if (shouldExecuteRequest(REQUEST_PROBABILITIES.getInStockCars)) {
      const getInStockCars = http.get(`${BASE_URL}/cars/inventory/in-stock`);
      if (!checkResponse(getInStockCars)) errorRate.add(1);
    }
  });

  group("Sales API", () => {
    if (shouldExecuteRequest(REQUEST_PROBABILITIES.getAllSales)) {
      const getAllSales = http.get(`${BASE_URL}/sales/all`);
      if (!checkResponse(getAllSales)) errorRate.add(1);
    }

    if (shouldExecuteRequest(REQUEST_PROBABILITIES.createSale)) {
      const createSale = http.post(
        `${BASE_URL}/sales`,
        JSON.stringify(testData.sale),
        { headers: { "Content-Type": "application/json" } }
      );
      if (!checkResponse(createSale, 201)) errorRate.add(1);
    }

    if (shouldExecuteRequest(REQUEST_PROBABILITIES.getSaleById)) {
      const saleId = 2;
      const getSaleById = http.get(`${BASE_URL}/sales/id/${saleId}`);
      if (!checkResponse(getSaleById)) errorRate.add(1);
    }

    if (shouldExecuteRequest(REQUEST_PROBABILITIES.updateSale)) {
      const saleId = 2;
      const updateSale = http.put(
        `${BASE_URL}/sales/id/${saleId}`,
        JSON.stringify({ ...testData.sale, sale_price: 26000 }),
        { headers: { "Content-Type": "application/json" } }
      );
      if (!checkResponse(updateSale)) errorRate.add(1);
    }

    if (shouldExecuteRequest(REQUEST_PROBABILITIES.getSalesByCarId)) {
      const getSalesByCarId = http.get(`${BASE_URL}/sales/car/1`);
      if (!checkResponse(getSalesByCarId)) errorRate.add(1);
    }

    if (shouldExecuteRequest(REQUEST_PROBABILITIES.getSalesByCustomer)) {
      const getSalesByCustomer = http.get(
        `${BASE_URL}/sales/customer/John%20Doe`
      );
      if (!checkResponse(getSalesByCustomer)) errorRate.add(1);
    }

    if (shouldExecuteRequest(REQUEST_PROBABILITIES.getSalesByDateRange)) {
      const startDate = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      const endDate = new Date().toISOString();
      const getSalesByDateRange = http.get(
        `${BASE_URL}/sales/date-range?startDate=${startDate}&endDate=${endDate}`
      );
      if (!checkResponse(getSalesByDateRange)) errorRate.add(1);
    }

    if (shouldExecuteRequest(REQUEST_PROBABILITIES.getTotalSales)) {
      const getTotalSales = http.get(`${BASE_URL}/sales/total-sales`);
      if (!checkResponse(getTotalSales)) errorRate.add(1);
    }
  });

  group("Reports API", () => {
    if (shouldExecuteRequest(REQUEST_PROBABILITIES.generateReport)) {
      const generateReport = http.get(`${BASE_URL}/report`);
      if (!checkResponse(generateReport)) errorRate.add(1);
    }
  });

  // Random sleep between 1-3 seconds to simulate real user behavior
  sleep(Math.random() * 2 + 1);
}
