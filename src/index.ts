// src/index.ts
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import carRoutes from "./routes/car.routes";

dotenv.config();

const app: Express = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Hello from TypeScript Express!" });
});

// Example route with parameters
// Routes
app.use("/api/cars", carRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
