import { Router, Request, Response } from "express";
import { CarModel } from "../models/car.model";
import { Car } from "../interfaces/car.interface";

const router = Router();

// Get all cars
router.get("/all", async (req: Request, res: Response) => {
  try {
    const cars = await CarModel.findAll();
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get car by ID
router.get("/id/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const car = await CarModel.findById(parseInt(req.params.id));
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json(car);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new car
router.post("/", async (req: Request, res: Response) => {
  try {
    const newCar = await CarModel.create(req.body);
    res.status(201).json(newCar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update car
router.put("/id/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const updatedCar = await CarModel.update(parseInt(req.params.id), req.body);
    if (!updatedCar) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json(updatedCar);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete car
router.delete("/id/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const deleted = await CarModel.delete(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Additional routes using custom methods
router.get("/make/:make", async (req: Request, res: Response) => {
  try {
    const cars = await CarModel.findByMake(req.params.make);
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/inventory/in-stock", async (req: Request, res: Response) => {
  try {
    const cars = await CarModel.findInStockCars();
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
