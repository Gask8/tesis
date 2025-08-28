import http from "k6/http";
import { check, sleep, group } from "k6";
import { Rate } from "k6/metrics";

const errorRate = new Rate("errors");

const BASE_URL =
  __ENV.BASE_URL ||
  "http://intela-appli-slu18y1s7ajr-1557949211.us-east-1.elb.amazonaws.com/api";

export const options = {
  vus: 1,
  duration: "24h",
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    errors: ["rate<0.1"],
  },
};

const samples = [
  { id: 4001, time: 0, type: "healthCheck" },
  { id: 1978, time: 3, type: "getInStockCars" },
  { id: 724, time: 5, type: "getSaleById" },
  { id: 1763, time: 5, type: "getSaleById" },
  { id: 3477, time: 8, type: "createSale" },
  { id: 3302, time: 10, type: "getInStockCars" },
  { id: 1977, time: 10, type: "getInStockCars" },
];

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

// Global variables to store available IDs
let availableCarIds = [];
let availableSaleIds = [];

// Init function that runs once at the beginning of the test
export function setup() {
  // Fetch available car IDs
  const carsResponse = http.get(`${BASE_URL}/cars/all`);
  if (carsResponse.status === 200) {
    availableCarIds = JSON.parse(carsResponse.body).map((car) => car.id);
  }

  // Fetch available sale IDs
  const salesResponse = http.get(`${BASE_URL}/sales/all`);
  if (salesResponse.status === 200) {
    availableSaleIds = JSON.parse(salesResponse.body).map((sale) => sale.id);
  }

  return {
    carIds: availableCarIds,
    saleIds: availableSaleIds,
  };
}

// Helper function to get random ID from array
function getRandomId(ids) {
  if (!ids || ids.length === 0) return 1; // fallback to ID 1 if no IDs available
  return ids[Math.floor(Math.random() * ids.length)];
}

// Run exactly one sample per iteration
let sampleIndex = 0;

function checkResponse(response, expectedStatus = 200) {
  return check(response, {
    "status is 200 or 201": (r) => r.status == expectedStatus,
    "response time < 2000ms": (r) => r.timings.duration < 2000,
  });
}

// ================ Main Test Function =================
export default function (data) {
  if (sampleIndex >= samples.length) {
    // Stop the test if we exhausted all samples
    return;
  }

  const startedTime = Date.now();

  const sample = samples[sampleIndex];
  const { type } = sample;
  const availableCarIds = data.carIds;
  const availableSaleIds = data.saleIds;

  // Test all routes in groups
  switch (type) {
    case "healthCheck":
      const healthCheck = http.get(`${BASE_URL.replace("/api", "")}/health`);
      if (!checkResponse(healthCheck)) errorRate.add(1);
      break;
    case "getAllCars":
      const getAllCars = http.get(`${BASE_URL}/cars/all`);
      if (!checkResponse(getAllCars)) errorRate.add(1);
      break;
    case "createCar":
      const createCar = http.post(
        `${BASE_URL}/cars`,
        JSON.stringify(testData.car),
        { headers: { "Content-Type": "application/json" } }
      );
      if (!checkResponse(createCar, 201)) errorRate.add(1);
      break;
    case "getCarById":
      const carId = getRandomId(availableCarIds);
      const getCarById = http.get(`${BASE_URL}/cars/id/${carId}`);
      if (!checkResponse(getCarById)) errorRate.add(1);
      break;
    case "updateCar":
      const carIdToUpdate = getRandomId(availableCarIds);
      const updateCar = http.put(
        `${BASE_URL}/cars/id/${carIdToUpdate}`,
        JSON.stringify({ ...testData.car, price: 26000 }),
        { headers: { "Content-Type": "application/json" } }
      );
      if (!checkResponse(updateCar)) errorRate.add(1);
      break;
    case "getCarsByMake":
      const getCarsByMake = http.get(`${BASE_URL}/cars/make/Toyota`);
      if (!checkResponse(getCarsByMake)) errorRate.add(1);
      break;
    case "getInStockCars":
      const getInStockCars = http.get(`${BASE_URL}/cars/inventory/in-stock`);
      if (!checkResponse(getInStockCars)) errorRate.add(1);
      break;
    case "getAllSales":
      const getAllSales = http.get(`${BASE_URL}/sales/all`);
      if (!checkResponse(getAllSales)) errorRate.add(1);
      break;
    case "createSale":
      const createSale = http.post(
        `${BASE_URL}/sales`,
        JSON.stringify(testData.sale),
        { headers: { "Content-Type": "application/json" } }
      );
      if (!checkResponse(createSale, 201)) errorRate.add(1);
      break;
    case "getSaleById":
      const saleId1 = getRandomId(availableSaleIds);
      const getSaleById = http.get(`${BASE_URL}/sales/id/${saleId1}`);
      if (!checkResponse(getSaleById)) errorRate.add(1);
      break;
    case "updateSale":
      const saleId2 = getRandomId(availableSaleIds);
      const updateSale = http.put(
        `${BASE_URL}/sales/id/${saleId2}`,
        JSON.stringify({ ...testData.sale, sale_price: 26000 }),
        { headers: { "Content-Type": "application/json" } }
      );
      if (!checkResponse(updateSale)) errorRate.add(1);
      break;
    case "getSalesByCarId":
      const getSalesByCarId = http.get(`${BASE_URL}/sales/car/1`);
      if (!checkResponse(getSalesByCarId)) errorRate.add(1);
      break;
    case "getSalesByCustomer":
      const getSalesByCustomer = http.get(
        `${BASE_URL}/sales/customer/John%20Doe`
      );
      if (!checkResponse(getSalesByCustomer)) errorRate.add(1);
      break;
    case "getSalesByDateRange":
      const startDate = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      const endDate = new Date().toISOString();
      const getSalesByDateRange = http.get(
        `${BASE_URL}/sales/date-range?startDate=${startDate}&endDate=${endDate}`
      );
      if (!checkResponse(getSalesByDateRange)) errorRate.add(1);
      break;
    case "getTotalSales":
      const getTotalSales = http.get(`${BASE_URL}/sales/total-sales`);
      if (!checkResponse(getTotalSales)) errorRate.add(1);
      break;
    case "generateReport":
      const generateReport = http.get(`${BASE_URL}/report`);
      if (!checkResponse(generateReport)) errorRate.add(1);
      break;
    default:
      console.warn(`Unknown sample type: ${type}`);
  }

  const transcurrentTime = Date.now();
  const elapsed = transcurrentTime - startedTime;

  // Sleep until next sample time
  if (sampleIndex < samples.length - 1) {
    const currentTime = Number(samples[sampleIndex].time);
    const nextTime = Number(samples[sampleIndex + 1].time);
    // Calcular tiempo al siguiente request, elapsed es el tiempo que ya se ha tardado en hacer el request
    const delta = Math.max(
      0,
      (nextTime - currentTime) * 60 - Math.floor(elapsed / 1000)
    );

    sleep(delta);
  }

  sampleIndex++;
}
