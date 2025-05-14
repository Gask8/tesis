export interface Car {
  id?: number;
  make: string;
  model: string;
  year: number;
  price: number;
  stock: number;
  created_at?: Date;
  updated_at?: Date;
}
