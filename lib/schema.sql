-- MA Ashapuri Tuff — Factory Portal Database Schema
-- Run this script in the Supabase SQL Editor

-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'supervisor', 'worker')),
  phone TEXT,
  avatar_url TEXT,
  line_assigned TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_delivery DATE,
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Low', 'Normal', 'High', 'Urgent')),
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'In Production', 'Needs Checking', 'Rework', 'Ready', 'Completed')),
  notes TEXT,
  slip_url TEXT,
  dispatched_at TIMESTAMPTZ,
  dispatch_note TEXT,
  dispatch_vehicle TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  thickness TEXT DEFAULT '5mm',
  required_qty INT NOT NULL CHECK (required_qty > 0),
  completed_qty INT DEFAULT 0 CHECK (completed_qty >= 0),
  status TEXT DEFAULT 'New',
  assigned_worker_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_worker_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WORK ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.work_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  dimensions TEXT NOT NULL,
  worker_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  worker_name TEXT NOT NULL,
  required_qty INT NOT NULL,
  completed_qty INT DEFAULT 0,
  status TEXT DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'In Progress', 'Needs Checking', 'Approved', 'Rework')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 7. PRODUCTION UPDATES TABLE
CREATE TABLE IF NOT EXISTS public.production_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.work_assignments(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  worker_name TEXT NOT NULL,
  added_qty INT NOT NULL CHECK (added_qty > 0),
  total_completed_after INT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. REWORK TASKS TABLE
CREATE TABLE IF NOT EXISTS public.rework_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES public.work_assignments(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  requested_by_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  requested_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- 9. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  order_number TEXT,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_assignments ENABLE ROW LEVEL SECURITY;

-- Owner and Supervisor have full access
CREATE POLICY "Admin & Supervisor full access" ON public.orders FOR ALL USING (true);
CREATE POLICY "Admin & Supervisor full access items" ON public.order_items FOR ALL USING (true);
CREATE POLICY "Admin & Supervisor full access assignments" ON public.work_assignments FOR ALL USING (true);

-- Indexes for maximum query performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_worker ON public.work_assignments(worker_id);
