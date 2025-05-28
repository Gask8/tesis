import { Router, Request, Response } from "express";
import { SaleModel } from "../models/sale.model";
import { Sale } from "../interfaces/sale.interface";

const router = Router();

// Get all sales
router.get("/all", async (req: Request, res: Response) => {
  try {
    const sales = await SaleModel.findAll();
    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get sale by ID
router.get("/id/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const sale = await SaleModel.findById(parseInt(req.params.id));
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.json(sale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new sale
router.post("/", async (req: Request, res: Response) => {
  try {
    const newSale = await SaleModel.create(req.body);
    res.status(201).json(newSale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update sale
router.put("/id/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const updatedSale = await SaleModel.update(
      parseInt(req.params.id),
      req.body
    );
    if (!updatedSale) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.json(updatedSale);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete sale
router.delete("/id/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const deleted = await SaleModel.delete(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ message: "Sale not found" });
    }
    res.json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Additional routes using custom methods
router.get("/car/:carId", async (req: Request, res: Response) => {
  try {
    const sales = await SaleModel.findByCarId(parseInt(req.params.carId));
    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/customer/:name", async (req: Request, res: Response) => {
  try {
    const sales = await SaleModel.findByCustomerName(req.params.name);
    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/date-range", async (req: Request, res: Response): Promise<any> => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "Start date and end date are required" });
    }
    const sales = await SaleModel.getSalesByDateRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.json(sales);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/total-sales", async (req: Request, res: Response) => {
  try {
    const totalSales = await SaleModel.getTotalSalesAmount();
    res.json({ totalSales });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
