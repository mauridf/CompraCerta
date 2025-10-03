// Tipos para o banco de dados
export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface ShoppingList {
  id: number;
  user_id: number;
  name: string;
  status: 'active' | 'completed';
  total_amount: number;
  final_amount?: number;
  created_at: string;
  completed_at?: string;
}

export interface ListItem {
  id: number;
  list_id: number;
  name: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  total: number;
  is_checked: boolean;
  barcode?: string;
  created_at: string;
}

export interface BarcodePrice {
  id: number;
  barcode: string;
  unit_price: number;
  date_seen: string;
}