export interface Store {
  id: string;
  name: string;
  location: string;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  notes?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  default_unit: string;
  supplier_id: string;
  created_at: string;
}

export type RecordType = 'initial_stock' | 'purchase_received' | 'adjustment';

export interface InventoryRecord {
  id: string;
  store_id: string;
  product_id: string;
  quantity: number;
  unit: string;
  record_type: RecordType;
  note?: string;
  created_at: string;
}

export type PurchaseOrderStatus = 'pending' | 'completed' | 'cancelled';

export interface PurchaseOrder {
  id: string;
  store_id: string;
  supplier_id: string;
  order_date: string;
  status: PurchaseOrderStatus;
  notes?: string;
  created_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  product_id: string;
  quantity: number;
  unit: string;
  notes?: string;
}

// Helper type for enriched data (UI display)
export interface EnrichedPurchaseOrder extends PurchaseOrder {
  store_name: string;
  supplier_name: string;
  items_count: number;
}

export interface EnrichedPurchaseOrderItem extends PurchaseOrderItem {
  product_name: string;
}

export interface EnrichedInventoryRecord extends InventoryRecord {
  store_name: string;
  product_name: string;
}

// Authentication types
export type UserRole = 'admin' | 'store';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  store_id?: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
