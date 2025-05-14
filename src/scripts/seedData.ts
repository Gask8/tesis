//npx ts-node src/scripts/seedData.ts

import { query } from "../db";

const seedCars = async () => {
  const cars = [
    ["Toyota", "Corolla", 2022, 25000.0, 10],
    ["Honda", "Civic", 2023, 27000.0, 8],
    ["Ford", "F-150", 2022, 45000.0, 5],
    ["Chevrolet", "Malibu", 2023, 28000.0, 7],
    ["Nissan", "Altima", 2022, 26000.0, 9],
    ["Hyundai", "Elantra", 2023, 24000.0, 12],
    ["Kia", "Forte", 2022, 23000.0, 6],
    ["Mazda", "CX-5", 2023, 32000.0, 4],
    ["Subaru", "Outback", 2022, 35000.0, 3],
    ["Volkswagen", "Jetta", 2023, 26000.0, 8],
  ];

  for (const car of cars) {
    await query(
      "INSERT INTO cars (make, model, year, price, stock) VALUES ($1, $2, $3, $4, $5)",
      car
    );
  }

  console.log("Cars seeded successfully");
};

const seedSales = async () => {
  const sales = [
    [1, "2025-05-01", "John Doe", 24500.0],
    [2, "2025-05-02", "Jane Smith", 26800.0],
    [3, "2025-05-03", "Mike Johnson", 44500.0],
    [4, "2025-05-04", "Emily Brown", 27800.0],
    [5, "2025-05-05", "David Wilson", 25800.0],
    [6, "2025-05-06", "Sarah Davis", 23800.0],
    [7, "2025-05-07", "Tom Taylor", 22800.0],
    [8, "2025-05-08", "Lisa Anderson", 31800.0],
    [9, "2025-05-09", "Chris Martinez", 34800.0],
    [10, "2025-05-10", "Karen Thompson", 25800.0],
    [1, "2025-05-11", "Robert Garcia", 24600.0],
    [2, "2025-05-12", "Patricia Lee", 26900.0],
    [3, "2025-05-13", "Daniel Clark", 44600.0],
    [4, "2025-05-14", "Nancy Rodriguez", 27900.0],
    [5, "2025-05-15", "Paul Wright", 25900.0],
  ];

  for (const sale of sales) {
    await query(
      "INSERT INTO sales (car_id, sale_date, customer_name, sale_price) VALUES ($1, $2, $3, $4)",
      sale
    );
  }

  console.log("Sales seeded successfully");
};

const seedData = async () => {
  try {
    await seedCars();
    await seedSales();
    console.log("All data seeded successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    process.exit();
  }
};

seedData();
