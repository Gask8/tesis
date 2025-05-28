//npx ts-node src/scripts/createTables.ts

import { query } from "../db";

async function createTables() {
  try {
    // Create cars table
    await query(`
      CREATE TABLE IF NOT EXISTS cars (
        id SERIAL PRIMARY KEY,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        year INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Cars table created successfully");

    // Create sales table
    await query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        car_id INTEGER REFERENCES cars(id),
        sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        customer_name VARCHAR(200) NOT NULL,
        sale_price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Sales table created successfully");

    console.log("All tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
}

// Run the function
createTables()
  .then(() => {
    console.log("Table creation process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Failed to create tables:", error);
    process.exit(1);
  });
