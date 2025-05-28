import request from "supertest";
import express from "express";
import carRoutes from "../routes/car.routes";

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

  let createdCarId: number;

  // Test GET all cars
  describe("GET /api/cars/all", () => {
    it("should get all cars", async () => {
      const res = await request(app).get("/api/cars/all");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  // Test POST new car
  describe("POST /api/cars", () => {
    it("should create a new car", async () => {
      const res = await request(app).post("/api/cars").send(mockCar);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      createdCarId = res.body.id;
    });

    it("should fail if required fields are missing", async () => {
      const incompleteCar = { customer_name: "John Doe" };
      const res = await request(app).post("/api/cars").send(incompleteCar);

      expect(res.status).toBe(500);
    });
  });

  // Test GET car by ID
  describe("GET /api/cars/id/:id", () => {
    it("should get car by id", async () => {
      const res = await request(app).get(`/api/cars/id/${createdCarId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdCarId);
    });

    it("should return 404 for non-existent car", async () => {
      const res = await request(app).get("/api/cars/99999");
      expect(res.status).toBe(404);
    });
  });

  // Test PUT update car
  describe("PUT /api/cars/id/:id", () => {
    it("should update an existing car", async () => {
      const updateData = {
        price: 26000.0,
      };

      const res = await request(app)
        .put(`/api/cars/id/${createdCarId}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(parseFloat(res.body.price)).toBe(updateData.price);
    });

    it("should return 404 for non-existent car", async () => {
      const res = await request(app)
        .put("/api/cars/99999")
        .send({ price: 26000.0 });

      expect(res.status).toBe(404);
    });
  });

  // Test DELETE car
  describe("DELETE /api/cars/id/:id", () => {
    it("should delete an existing car", async () => {
      const res = await request(app).delete(`/api/cars/id/${createdCarId}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Car deleted successfully");
    });

    it("should return 404 for non-existent car", async () => {
      const res = await request(app).delete("/api/cars/99999");
      expect(res.status).toBe(404);
    });
  });

  // Test GET cars by make
  describe("GET /api/cars/make/:make", () => {
    it("should get cars by make", async () => {
      const res = await request(app).get("/api/cars/make/Toyota");
      expect(res.status).toBe(200);
    });
  });

  // Test GET in-stock cars
  describe("GET /api/cars/inventory/in-stock", () => {
    it("should get in-stock cars", async () => {
      const res = await request(app).get("/api/cars/inventory/in-stock");
      expect(res.status).toBe(200);
    });
  });
});
