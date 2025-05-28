import { query } from "../db";
import { Sale } from "../interfaces/sale.interface";

export class SaleModel {
  // Get all sales
  static async findAll(): Promise<Sale[]> {
    try {
      const result = await query(`
        SELECT s.*, c.make, c.model 
        FROM sales s 
        JOIN cars c ON s.car_id = c.id 
        ORDER BY s.id
      `);
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching sales: ${error}`);
    }
  }

  // Get sale by ID
  static async findById(id: number): Promise<Sale | null> {
    try {
      const result = await query(
        `
        SELECT s.*, c.make, c.model 
        FROM sales s 
        JOIN cars c ON s.car_id = c.id 
        WHERE s.id = $1
      `,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching sale with id ${id}: ${error}`);
    }
  }

  // Create new sale
  static async create(sale: Omit<Sale, "id">): Promise<Sale> {
    const { car_id, customer_name, sale_price, sale_date } = sale;
    try {
      // Start a transaction
      await query("BEGIN");

      // Create the sale record
      const saleResult = await query(
        `INSERT INTO sales (car_id, customer_name, sale_price, sale_date) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [car_id, customer_name, sale_price, sale_date || new Date()]
      );

      // Update the car stock
      await query(
        `UPDATE cars 
         SET stock = stock - 1, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1 AND stock > 0`,
        [car_id]
      );

      // Commit the transaction
      await query("COMMIT");

      return saleResult.rows[0];
    } catch (error) {
      // Rollback in case of error
      await query("ROLLBACK");
      throw new Error(`Error creating sale: ${error}`);
    }
  }

  // Update sale
  static async update(id: number, sale: Partial<Sale>): Promise<Sale | null> {
    try {
      const currentSale = await this.findById(id);
      if (!currentSale) return null;

      const updatedSale = { ...currentSale, ...sale };
      const result = await query(
        `UPDATE sales 
         SET car_id = $1, 
             customer_name = $2, 
             sale_price = $3, 
             sale_date = $4, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = $5 
         RETURNING *`,
        [
          updatedSale.car_id,
          updatedSale.customer_name,
          updatedSale.sale_price,
          updatedSale.sale_date,
          id,
        ]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Error updating sale with id ${id}: ${error}`);
    }
  }

  // Delete sale
  static async delete(id: number): Promise<boolean> {
    try {
      // Start a transaction
      await query("BEGIN");

      // Get the sale to restore car stock
      const sale = await this.findById(id);
      if (sale) {
        // Restore the car stock
        await query(
          `UPDATE cars 
           SET stock = stock + 1, 
               updated_at = CURRENT_TIMESTAMP 
           WHERE id = $1`,
          [sale.car_id]
        );
      }

      // Delete the sale
      const result = await query(
        "DELETE FROM sales WHERE id = $1 RETURNING *",
        [id]
      );

      // Commit the transaction
      await query("COMMIT");

      return result.rows.length > 0;
    } catch (error) {
      // Rollback in case of error
      await query("ROLLBACK");
      throw new Error(`Error deleting sale with id ${id}: ${error}`);
    }
  }

  // Custom methods
  static async findByCarId(carId: number): Promise<Sale[]> {
    try {
      const result = await query(
        `SELECT s.*, c.make, c.model 
         FROM sales s 
         JOIN cars c ON s.car_id = c.id 
         WHERE s.car_id = $1`,
        [carId]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching sales for car ${carId}: ${error}`);
    }
  }

  static async findByCustomerName(customerName: string): Promise<Sale[]> {
    try {
      const result = await query(
        `SELECT s.*, c.make, c.model 
         FROM sales s 
         JOIN cars c ON s.car_id = c.id 
         WHERE s.customer_name ILIKE $1`,
        [`%${customerName}%`]
      );
      return result.rows;
    } catch (error) {
      throw new Error(
        `Error fetching sales for customer ${customerName}: ${error}`
      );
    }
  }

  static async getSalesByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Sale[]> {
    try {
      const result = await query(
        `SELECT s.*, c.make, c.model 
         FROM sales s 
         JOIN cars c ON s.car_id = c.id 
         WHERE s.sale_date BETWEEN $1 AND $2
         ORDER BY s.sale_date`,
        [startDate, endDate]
      );
      return result.rows;
    } catch (error) {
      throw new Error(`Error fetching sales in date range: ${error}`);
    }
  }

  static async getTotalSalesAmount(): Promise<number> {
    try {
      const result = await query("SELECT SUM(sale_price) as total FROM sales");
      return result.rows[0].total || 0;
    } catch (error) {
      throw new Error(`Error calculating total sales amount: ${error}`);
    }
  }
}
