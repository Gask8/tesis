import request from "supertest";
import express from "express";
import saleRoutes from "../routes/sale.routes";

const app = express();
app.use(express.json());
app.use("/api/sales", saleRoutes);

describe("Sale Routes", () => {
  const mockSale = {
    car_id: 1,
    customer_name: "John Doe",
    sale_price: 25000.0,
    sale_date: new Date("2025-05-01"),
  };

  let createdSaleId: number;

  // Test GET all sales
  describe("GET /api/sales/all", () => {
    it("should get all sales", async () => {
      const res = await request(app).get("/api/sales/all");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  // Test POST new sale
  describe("POST /api/sales", () => {
    it("should create a new sale", async () => {
      const res = await request(app).post("/api/sales").send(mockSale);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.customer_name).toBe(mockSale.customer_name);
      createdSaleId = res.body.id;
    });

    it("should fail if required fields are missing", async () => {
      const incompleteSale = { customer_name: "John Doe" };
      const res = await request(app).post("/api/sales").send(incompleteSale);

      expect(res.status).toBe(500);
    });
  });

  // Test GET sale by ID
  describe("GET /api/sales/id/:id", () => {
    it("should get sale by id", async () => {
      const res = await request(app).get(`/api/sales/id/${createdSaleId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdSaleId);
    });

    it("should return 404 for non-existent sale", async () => {
      const res = await request(app).get("/api/sales/99999");
      expect(res.status).toBe(404);
    });
  });

  // Test PUT update sale
  describe("PUT /api/sales/id/:id", () => {
    it("should update an existing sale", async () => {
      const updateData = {
        customer_name: "Jane Doe",
        sale_price: 26000.0,
      };

      const res = await request(app)
        .put(`/api/sales/id/${createdSaleId}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.customer_name).toBe(updateData.customer_name);
      expect(parseFloat(res.body.sale_price)).toBe(updateData.sale_price);
    });

    it("should return 404 for non-existent sale", async () => {
      const res = await request(app)
        .put("/api/sales/99999")
        .send({ customer_name: "Jane Doe" });

      expect(res.status).toBe(404);
    });
  });

  // Test custom routes
  describe("Custom Routes", () => {
    // Test sales by car ID
    it("should get sales by car ID", async () => {
      const res = await request(app).get("/api/sales/car/1");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    // Test sales by customer name
    it("should get sales by customer name", async () => {
      const res = await request(app).get("/api/sales/customer/John");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    // Test sales by date range
    it("should get sales by date range", async () => {
      const res = await request(app).get("/api/sales/date-range").query({
        startDate: "2025-05-01",
        endDate: "2025-05-02",
      });

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    // Test total sales
    it("should get total sales amount", async () => {
      const res = await request(app).get("/api/sales/total-sales");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("totalSales");
    });
  });

  // Test DELETE sale
  describe("DELETE /api/sales/id/:id", () => {
    it("should delete an existing sale", async () => {
      const res = await request(app).delete(`/api/sales/id/${createdSaleId}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Sale deleted successfully");
    });

    it("should return 404 for non-existent sale", async () => {
      const res = await request(app).delete("/api/sales/99999");
      expect(res.status).toBe(404);
    });
  });
});
