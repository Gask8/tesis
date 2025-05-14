export interface Sale {
  id?: number;
  car_id: number;
  sale_date: Date;
  customer_name: string;
  sale_price: number;
  created_at?: Date;
  updated_at?: Date;
}
