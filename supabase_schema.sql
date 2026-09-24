-- ========================================================
-- MA ASHAPURI TUFF — FACTORY PORTAL SUPABASE DATABASE SCHEMA
-- Clean Production Setup (0 Orders, 0 Customers)
-- Execute this script in your Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql/new
-- ========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'supervisor', 'worker')),
  phone TEXT,
  avatar_url TEXT,
  line_assigned TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS public.customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT,
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
  id TEXT PRIMARY KEY,
  order_id TEXT,
  item_name TEXT NOT NULL,
  dimensions TEXT,
  thickness TEXT DEFAULT '5mm',
  required_qty INT NOT NULL CHECK (required_qty > 0),
  completed_qty INT DEFAULT 0 CHECK (completed_qty >= 0),
  status TEXT DEFAULT 'New',
  assigned_worker_id TEXT,
  assigned_worker_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WORK ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS public.work_assignments (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  order_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  order_item_id TEXT,
  item_name TEXT NOT NULL,
  dimensions TEXT,
  worker_id TEXT,
  worker_name TEXT NOT NULL,
  required_qty INT NOT NULL,
  completed_qty INT DEFAULT 0,
  status TEXT DEFAULT 'Assigned' CHECK (status IN ('Assigned', 'In Progress', 'Needs Checking', 'Approved', 'Rework')),
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 7. REWORK TASKS TABLE
CREATE TABLE IF NOT EXISTS public.rework_tasks (
  id TEXT PRIMARY KEY,
  assignment_id TEXT,
  order_id TEXT,
  order_number TEXT NOT NULL,
  order_item_id TEXT,
  item_name TEXT NOT NULL,
  reason TEXT NOT NULL,
  requested_by_id TEXT,
  requested_by_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- 8. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id TEXT PRIMARY KEY,
  order_id TEXT,
  order_number TEXT,
  user_name TEXT NOT NULL,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rework_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow read/write policies (Drop first if exists to prevent rerun errors)
DROP POLICY IF EXISTS "Public Users Policy" ON public.users;
DROP POLICY IF EXISTS "Public Customers Policy" ON public.customers;
DROP POLICY IF EXISTS "Public Orders Policy" ON public.orders;
DROP POLICY IF EXISTS "Public Order Items Policy" ON public.order_items;
DROP POLICY IF EXISTS "Public Assignments Policy" ON public.work_assignments;
DROP POLICY IF EXISTS "Public Rework Policy" ON public.rework_tasks;
DROP POLICY IF EXISTS "Public Activity Logs Policy" ON public.activity_logs;

CREATE POLICY "Public Users Policy" ON public.users FOR ALL USING (true);
CREATE POLICY "Public Customers Policy" ON public.customers FOR ALL USING (true);
CREATE POLICY "Public Orders Policy" ON public.orders FOR ALL USING (true);
CREATE POLICY "Public Order Items Policy" ON public.order_items FOR ALL USING (true);
CREATE POLICY "Public Assignments Policy" ON public.work_assignments FOR ALL USING (true);
CREATE POLICY "Public Rework Policy" ON public.rework_tasks FOR ALL USING (true);
CREATE POLICY "Public Activity Logs Policy" ON public.activity_logs FOR ALL USING (true);

-- 10. INDEXES FOR FAST QUERYING
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_assignments_worker ON public.work_assignments(worker_id);

-- 11. FACTORY SYSTEM ACCOUNTS ONLY (Purges any old/obsolete workers)
DELETE FROM public.users WHERE email NOT IN (
  'vikash@ashapurituff.com',
  'naveen@ashapurituff.com',
  'supervisor1@ashapurituff.com',
  'supervisor2@ashapurituff.com',
  'supervisor3@ashapurituff.com'
);

INSERT INTO public.users (id, name, email, role, phone, line_assigned) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Vikash', 'vikash@ashapurituff.com', 'owner', '+91 98250 00001', 'Factory Owner'),
  ('22222222-2222-4222-8222-222222222222', 'Naveen', 'naveen@ashapurituff.com', 'owner', '+91 98250 00002', 'Factory Owner'),
  ('33333333-3333-4333-8333-333333333333', 'Supervisor 1', 'supervisor1@ashapurituff.com', 'supervisor', '+91 98250 00003', 'Shift A • Production Floor'),
  ('44444444-4444-4444-8444-444444444444', 'Supervisor 2', 'supervisor2@ashapurituff.com', 'supervisor', '+91 98250 00004', 'Shift B • Cutting & Tempering'),
  ('55555555-5555-4555-8555-555555555555', 'Supervisor 3', 'supervisor3@ashapurituff.com', 'supervisor', '+91 98250 00005', 'Shift C • Polishing & Edging')
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  phone = EXCLUDED.phone,
  line_assigned = EXCLUDED.line_assigned;
