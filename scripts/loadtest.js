import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");
const BASE_URL = "http://localhost:3000/api";

export const options = {
  stages: [
    { duration: "1m", target: 20 }, // Ramp up to 20 users
    { duration: "2m", target: 20 }, // Stay at 20 users
    { duration: "1m", target: 50 }, // Ramp up to 50 users
    { duration: "2m", target: 50 }, // Stay at 50 users
    { duration: "1m", target: 100 }, // Ramp up to 100 users
    { duration: "2m", target: 100 }, // Stay at 100 users
    { duration: "1m", target: 0 }, // Ramp down to 0
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
    is_available: true,
  },
  sale: {
    car_id: 1,
    customer_name: "John Doe",
    sale_price: 25000,
    sale_date: new Date().toISOString(),
  },
};

function checkResponse(response, expectedStatus = 200) {
  return check(response, {
    [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
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
    // GET all cars
    const getAllCars = http.get(`${BASE_URL}/cars/all`);
    if (!checkResponse(getAllCars)) errorRate.add(1);

    // POST new car
    const createCar = http.post(
      `${BASE_URL}/cars`,
      JSON.stringify(testData.car),
      { headers: { "Content-Type": "application/json" } }
    );
    if (!checkResponse(createCar, 201)) errorRate.add(1);

    // Assuming we got an ID from the created car
    const carId = 1; // You might want to parse this from createCar response

    // GET car by ID
    const getCarById = http.get(`${BASE_URL}/cars/id/${carId}`);
    if (!checkResponse(getCarById)) errorRate.add(1);

    // PUT update car
    const updateCar = http.put(
      `${BASE_URL}/cars/id/${carId}`,
      JSON.stringify({ ...testData.car, price: 26000 }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (!checkResponse(updateCar)) errorRate.add(1);

    // GET cars by make
    const getCarsByMake = http.get(`${BASE_URL}/cars/make/Toyota`);
    if (!checkResponse(getCarsByMake)) errorRate.add(1);

    // GET in-stock cars
    const getInStockCars = http.get(`${BASE_URL}/cars/inventory/in-stock`);
    if (!checkResponse(getInStockCars)) errorRate.add(1);

    // DELETE car
    const deleteCar = http.del(`${BASE_URL}/cars/id/${carId}`);
    if (!checkResponse(deleteCar)) errorRate.add(1);
  });

  group("Sales API", () => {
    // GET all sales
    const getAllSales = http.get(`${BASE_URL}/sales/all`);
    if (!checkResponse(getAllSales)) errorRate.add(1);

    // POST new sale
    const createSale = http.post(
      `${BASE_URL}/sales`,
      JSON.stringify(testData.sale),
      { headers: { "Content-Type": "application/json" } }
    );
    if (!checkResponse(createSale, 201)) errorRate.add(1);

    // Assuming we got an ID from the created sale
    const saleId = 1; // You might want to parse this from createSale response

    // GET sale by ID
    const getSaleById = http.get(`${BASE_URL}/sales/id/${saleId}`);
    if (!checkResponse(getSaleById)) errorRate.add(1);

    // PUT update sale
    const updateSale = http.put(
      `${BASE_URL}/sales/id/${saleId}`,
      JSON.stringify({ ...testData.sale, sale_price: 26000 }),
      { headers: { "Content-Type": "application/json" } }
    );
    if (!checkResponse(updateSale)) errorRate.add(1);

    // GET sales by car ID
    const getSalesByCarId = http.get(`${BASE_URL}/sales/car/1`);
    if (!checkResponse(getSalesByCarId)) errorRate.add(1);

    // GET sales by customer name
    const getSalesByCustomer = http.get(
      `${BASE_URL}/sales/customer/John%20Doe`
    );
    if (!checkResponse(getSalesByCustomer)) errorRate.add(1);

    // GET sales by date range
    const startDate = new Date(
      Date.now() - 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    const endDate = new Date().toISOString();
    const getSalesByDateRange = http.get(
      `${BASE_URL}/sales/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    if (!checkResponse(getSalesByDateRange)) errorRate.add(1);

    // GET total sales
    const getTotalSales = http.get(`${BASE_URL}/sales/total-sales`);
    if (!checkResponse(getTotalSales)) errorRate.add(1);

    // DELETE sale
    const deleteSale = http.del(`${BASE_URL}/sales/id/${saleId}`);
    if (!checkResponse(deleteSale)) errorRate.add(1);
  });

  group("Reports API", () => {
    // Generate report
    const generateReport = http.get(`${BASE_URL}/report`);
    if (!checkResponse(generateReport)) errorRate.add(1);
  });

  // Random sleep between 1-3 seconds to simulate real user behavior
  sleep(Math.random() * 2 + 1);
}
