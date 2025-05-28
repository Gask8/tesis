// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import carRoutes from "./routes/car.routes";
import saleRoutes from "./routes/sale.routes";
import reportRoutes from "./routes/report.routes";

dotenv.config();

const app: Express = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from TypeScript Express!" });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/cars", carRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/report", reportRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
