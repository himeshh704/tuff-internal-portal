export type UserRole = 'owner' | 'supervisor' | 'worker';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar_url?: string;
  line_assigned?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
  created_at: string;
}

export type OrderStatus =
  | 'New'
  | 'In Production'
  | 'Needs Checking'
  | 'Rework'
  | 'Ready'
  | 'Completed';

export type PriorityLevel = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface OrderItem {
  id: string;
  order_id: string;
  item_name: string; // e.g. "5mm Clear Toughened Glass"
  dimensions: string; // e.g. "914 × 1828 mm"
  thickness: string; // e.g. "5mm"
  required_qty: number;
  completed_qty: number;
  status: OrderStatus;
  assigned_worker_id?: string;
  assigned_worker_name?: string;
}

export interface Order {
  id: string;
  order_number: string; // e.g. "MAT-2026-00021"
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  order_date: string;
  expected_delivery: string;
  priority: PriorityLevel;
  status: OrderStatus;
  notes?: string;
  slip_url?: string; // Order Slip photo/document
  items: OrderItem[];
  created_at: string;
  updated_at: string;
  dispatched_at?: string;
  dispatch_note?: string;
  dispatch_vehicle?: string;
}

export type AssignmentStatus =
  | 'Assigned'
  | 'In Progress'
  | 'Needs Checking'
  | 'Approved'
  | 'Rework';

export interface WorkAssignment {
  id: string;
  order_id: string;
  order_number: string;
  customer_name: string;
  order_item_id: string;
  item_name: string;
  dimensions: string;
  worker_id: string;
  worker_name: string;
  required_qty: number;
  completed_qty: number;
  status: AssignmentStatus;
  slip_url?: string;
  assigned_at: string;
  completed_at?: string;
}

export interface ProductionUpdate {
  id: string;
  assignment_id: string;
  order_id: string;
  worker_id: string;
  worker_name: string;
  added_qty: number;
  total_completed_after: number;
  notes?: string;
  created_at: string;
}

export interface ReworkTask {
  id: string;
  assignment_id: string;
  order_id: string;
  order_number: string;
  order_item_id: string;
  item_name: string;
  reason: string;
  requested_by_id: string;
  requested_by_name: string;
  created_at: string;
  resolved: boolean;
}

export interface ActivityLog {
  id: string;
  order_id?: string;
  order_number?: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  details: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  created_at: string;
}

export interface FactorySettings {
  factory_name: string;
  phone: string;
  address: string;
  current_shift: string;
  auto_order_prefix: string;
}
