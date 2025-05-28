import request from "supertest";
import express from "express";
import carRoutes from "../routes/car.routes";
import { CarModel } from "../models/car.model";

// Mock the CarModel
jest.mock("../models/car.model");

const app = express();
app.use(express.json());
app.use("/api/cars", carRoutes);

describe("Car Routes", () => {
  const mockCar = {
    id: 1,
    make: "Toyota",
    model: "Corolla",
    year: 2022,
    price: 25000.0,
    stock: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test GET all cars
  describe("GET /api/cars", () => {
    it("should get all cars", async () => {
      (CarModel.findAll as jest.Mock).mockResolvedValue([mockCar]);

      const res = await request(app).get("/api/cars");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([mockCar]);
    });

    it("should handle errors", async () => {
      (CarModel.findAll as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app).get("/api/cars");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: "Internal server error" });
    });
  });

  // Test GET car by ID
  describe("GET /api/cars/id/:id", () => {
    it("should get car by id", async () => {
      (CarModel.findById as jest.Mock).mockResolvedValue(mockCar);

      const res = await request(app).get("/api/cars/id/1");
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockCar);
    });

    it("should return 404 for non-existent car", async () => {
      (CarModel.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get("/api/cars/id/999");
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Car not found" });
    });
  });

  // Test POST new car
  describe("POST /api/cars", () => {
    it("should create a new car", async () => {
      (CarModel.create as jest.Mock).mockResolvedValue(mockCar);

      const res = await request(app).post("/api/cars").send(mockCar);

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockCar);
    });

    it("should handle errors", async () => {
      (CarModel.create as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app).post("/api/cars").send(mockCar);

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: "Internal server error" });
    });
  });

  // Test PUT update car
  describe("PUT /api/cars/id/:id", () => {
    it("should update an existing car", async () => {
      const updatedCar = { ...mockCar, price: 26000.0 };
      (CarModel.update as jest.Mock).mockResolvedValue(updatedCar);

      const res = await request(app).put("/api/cars/id/1").send(updatedCar);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(updatedCar);
    });

    it("should return 404 for non-existent car", async () => {
      (CarModel.update as jest.Mock).mockResolvedValue(null);

      const res = await request(app).put("/api/cars/id/999").send(mockCar);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Car not found" });
    });
  });

  // Test DELETE car
  describe("DELETE /api/cars/id/:id", () => {
    it("should delete an existing car", async () => {
      (CarModel.delete as jest.Mock).mockResolvedValue(true);

      const res = await request(app).delete("/api/cars/id/1");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "Car deleted successfully" });
    });

    it("should return 404 for non-existent car", async () => {
      (CarModel.delete as jest.Mock).mockResolvedValue(false);

      const res = await request(app).delete("/api/cars/id/999");
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Car not found" });
    });
  });

  // Test GET cars by make
  describe("GET /api/cars/make/:make", () => {
    it("should get cars by make", async () => {
      (CarModel.findByMake as jest.Mock).mockResolvedValue([mockCar]);

      const res = await request(app).get("/api/cars/make/Toyota");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([mockCar]);
    });

    it("should handle errors", async () => {
      (CarModel.findByMake as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app).get("/api/cars/make/Toyota");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: "Internal server error" });
    });
  });

  // Test GET in-stock cars
  describe("GET /api/cars/inventory/in-stock", () => {
    it("should get in-stock cars", async () => {
      (CarModel.findInStockCars as jest.Mock).mockResolvedValue([mockCar]);

      const res = await request(app).get("/api/cars/inventory/in-stock");
      expect(res.status).toBe(200);
      expect(res.body).toEqual([mockCar]);
    });

    it("should handle errors", async () => {
      (CarModel.findInStockCars as jest.Mock).mockRejectedValue(
        new Error("Database error")
      );

      const res = await request(app).get("/api/cars/inventory/in-stock");
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ message: "Internal server error" });
    });
  });
});
