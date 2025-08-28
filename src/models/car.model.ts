import { query } from "../db";
import { Car } from "../interfaces/car.interface";

export class CarModel {
  // Get all cars
  static async findAll(): Promise<Car[]> {
    try {
      const result = await query("SELECT * FROM cars ORDER BY id LIMIT 100");
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching cars: ${error}`);
    }
  }

  // Get car by ID
  static async findById(id: number): Promise<Car | null> {
    try {
      const result = await query("SELECT * FROM cars WHERE id = $1", [id]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching car with id ${id}: ${error}`);
    }
  }

  // Create new car
  static async create(car: Omit<Car, "id">): Promise<Car> {
    const { make, model, year, price, stock } = car;
    try {
      const result = await query(
        "INSERT INTO cars (make, model, year, price, stock) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [make, model, year, price, stock]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error creating car: ${error}`);
    }
  }

  // Update car
  static async update(id: number, car: Partial<Car>): Promise<Car | null> {
    try {
      const currentCar = await this.findById(id);
      if (!currentCar) return null;

      const updatedCar = { ...currentCar, ...car };
      const result = await query(
        `UPDATE cars 
                SET make = $1, model = $2, year = $3, price = $4, stock = $5, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $6 
                RETURNING *`,
        [
          updatedCar.make,
          updatedCar.model,
          updatedCar.year,
          updatedCar.price,
          updatedCar.stock,
          id,
        ]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating car with id ${id}: ${error}`);
    }
  }

  // Delete car
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await query("DELETE FROM cars WHERE id = $1 RETURNING *", [
        id,
      ]);
      return result.rows.length > 0;
    } catch (error) {
      throw new Error(`Error deleting car with id ${id}: ${error}`);
    }
  }

  // Custom methods
  static async findByMake(make: string): Promise<Car[]> {
    try {
      const result = await query(
        "SELECT * FROM cars WHERE make ILIKE $1 LIMIT 100",
        [`%${make}%`]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching cars by make ${make}: ${error}`);
    }
  }

  static async findInStockCars(): Promise<Car[]> {
    try {
      const result = await query(
        "SELECT * FROM cars WHERE stock > 0 LIMIT 100"
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching in-stock cars: ${error}`);
    }
  }

  static async updateStock(id: number, quantity: number): Promise<Car | null> {
    try {
      const result = await query(
        `UPDATE cars 
                SET stock = stock + $1, updated_at = CURRENT_TIMESTAMP 
                WHERE id = $2 
                RETURNING *`,
        [quantity, id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error updating stock for car with id ${id}: ${error}`);
    }
  }
}
