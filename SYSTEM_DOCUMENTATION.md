# MA Ashapuri Tuff — Factory Portal Master Documentation

## Table of Contents
1. [System Purpose & Philosophy](#1-system-purpose--philosophy)
2. [User Roles & Access Scope](#2-user-roles--access-scope)
3. [Core Production Lifecycle & Workflow](#3-core-production-lifecycle--workflow)
4. [Detailed Interface & Module Capabilities](#4-detailed-interface--module-capabilities)
   - [Dashboard Overview](#41-dashboard-overview)
   - [Orders Management](#42-orders-management)
   - [Single-Page Order Creation](#43-single-page-order-creation)
   - [Production & Work Assignment](#44-production--work-assignment)
   - [Worker Mobile Interface](#45-worker-mobile-interface)
   - [Quality Verification & Rework Branch](#46-quality-verification--rework-branch)
   - [Dispatch Staging & Logistics](#47-dispatch-staging--logistics)
   - [Customer Directory](#48-customer-directory)
   - [Month-Wise Reports & Exports](#49-month-wise-reports--exports)
   - [System Settings & Adding Workers](#410-system-settings--adding-workers)
5. [Database Architecture & Data Models](#5-database-architecture--data-models)
6. [Security, Roles & Server API Enforcements](#6-security-roles--server-api-enforcements)
7. [Supabase Setup & Deployment Guide](#7-supabase-setup--deployment-guide)

---

## 1. System Purpose & Philosophy

**MA Ashapuri Tuff — Factory Portal** is a digital shop-floor management platform specifically built for toughened glass processing environments.

### Core Philosophy:
- **Digital Paper Ledger**: Designed to feel as simple as a digital shop-floor notebook or WhatsApp message stream rather than an over-engineered corporate ERP.
- **Zero Cognitive Overhead**: High-visibility text (`Plus Jakarta Sans`), monospaced numerical dimensions (`JetBrains Mono`), and tactile hit targets built for floor operators wearing protective gloves.
- **Complexity on the Inside, Simplicity on the Top**: Database integrity, security, audit trails, and rework history are handled strictly in the backend, leaving the UI clean and non-cluttered.

---

## 2. User Roles & Access Scope

The portal defines 2 active system account roles (Workers do NOT access portal directly):

| Role | Accounts | Permitted Capabilities | Primary Navigation |
| :--- | :--- | :--- | :--- |
| **Owner / Admin** | **Vikash**, **Naveen** | Full control: Create/edit orders, upload slips, manage customers, assign tasks, inspect quality, approve dispatch, export reports, and manage settings. | Dashboard, Orders, Production, Dispatch, Customers, Reports, Settings |
| **Shift Supervisor** | **Supervisor 1**, **Supervisor 2**, **Supervisor 3** | Manage daily shop-floor production: Assign tasks, submit floor progress feedback & piece counts on behalf of workers, inspect completed work, send for rework, process dispatch. | Dashboard, Orders, Production, Dispatch, Customers, Reports |
| **Floor Line Worker** | *(Internal Personnel Only)* | **No Portal Access.** Shift Supervisors log all production progress and floor feedback on behalf of floor workers. | *(No Login / Portal Access)* |

---

## 3. Core Production Lifecycle & Workflow

The portal follows a simple 6-state status model:

```
[ New Order ] 
      ↓
[ In Production ]  ← (Assigned to Worker)
      ↓
[ Needs Checking ] ← (Worker marks work complete)
   ↙        ↘
[ Approved ]  [ Rework Requested ]
   ↓                 ↓
[ Ready ]    (Moves back to In Production with reason logged)
   ↓
[ Completed / Dispatched ]
```

### Detailed State Progression:
1. **New**: Order created by Owner/Supervisor. Order number generated (e.g. `MAT-2026-00001`).
2. **In Production**: Specific glass items & quantities assigned to floor workers.
3. **Needs Checking**: Worker completes assigned quantity and taps **Mark Work Complete**. Moves into Quality Verification queue.
4. **Rework (Branch)**: Owner/Supervisor rejects completed item, states what needs to be fixed. Item moves back to **In Production** with full audit history intact.
5. **Ready**: Owner/Supervisor approves completed work. Item is staged for delivery.
6. **Completed**: Staged order marked as dispatched with truck vehicle registration number & receiving note.

---

## 4. Detailed Interface & Module Capabilities

### 4.1 Dashboard Overview
- **4 Key Status Cards**: Total counts for `New Orders`, `In Production`, `Needs Checking`, and `Ready for Dispatch`.
- **Today's Active Orders List**: Overview showing client name, glass item count, expected delivery, and percentage progress bar.
- **Recent Activity Log**: Real-time audit timeline logging order creation, worker quantity updates, approvals, and dispatches.

### 4.2 Orders Management
- **Status Filter Tabs**: `All`, `New`, `In Production`, `Needs Checking`, `Rework`, `Ready`, `Completed`.
- **Search Bar**: Instant filter by Order #, Customer Name, Phone, or Glass Specifications.
- **Actions**: View detailed item breakdown, attach original order slips, assign workers, and trigger status updates.

### 4.3 Single-Page Order Creation
- **Customer Picker**: Select an existing customer or create a new customer record inline.
- **Glass Specifications Rows**: Add dynamic item rows with Glass Name, Dimensions (`W × H mm`), Thickness (`5mm`, `6mm`, `8mm`, `10mm`, `12mm`), and Required Quantity.
- **Order Slip Attachment**: Upload/attach order slip images.
- **Order Number Generator**: Auto-assigns formatted sequential order numbers (e.g. `MAT-2026-00001`).

### 4.4 Production & Work Assignment
- Owner/Supervisor selects:
  1. Active Order
  2. Glass Item
  3. Floor Worker (e.g. **Rahul Sharma**)
  4. Quantity to Assign
- Work assignment is immediately pushed to the selected worker's **My Work** screen.

### 4.5 Worker Mobile Interface
- **Optimized for Mobile Handhelds & Tablets**:
  - Oversized cards showing Client Name, Order ID, Glass Specifications.
  - 3 Large Numeric Displays visible from a distance: **REQUIRED**, **DONE**, **REMAIN**.
  - Visual Progress Bar.
- **+ Update Quantity Keypad**: Large tactile buttons (+1, +5, +10) to update completed pieces. Prevents `Completed > Required` over-reporting.
- **Mark Work Complete Button**: Sends job to the Owner checking queue.

### 4.6 Quality Verification & Rework Branch
- Displays all items with status **Needs Checking**.
- **Approve Button**: Upgrades item to **Ready for Dispatch**.
- **Send for Rework Button**: Opens a modal prompt ("What needs to be fixed?"). Saves rework reason, creates a rework task, and sends item back to **In Production**. The database preserves all original completion history.

### 4.7 Dispatch Staging & Logistics
- Lists orders in **Ready for Dispatch**.
- **Mark as Dispatched Button**: Captures vehicle registration number (e.g., `GJ-01-AT-4820`) and receiving signature note, then archives order to **Completed**.

### 4.8 Customer Directory
- Internal directory storing Customer Name, Phone, Site Address, and Notes.
- View previous order history per customer. (Customers do NOT log in).

### 4.9 Month-Wise Reports & Exports
- Filter records by Month (e.g., `2026-09`).
- View total orders, total required pieces, and completed pieces.
- **Download CSV / Excel Export**: One-click download of all order items.
- **Print PDF View**: Clean formatted printable summary.

### 4.10 System Settings & Adding Workers
- **How Admin Adds New Workers**:
  1. Go to **Settings** → **Factory Personnel & User Directory**.
  2. Register worker Name, Email, Phone, and assigned line (e.g., *Polishing Line 2*).
  3. Worker can immediately log in using their credentials.

---

## 5. Database Architecture & Data Models

### Normalized Tables (`supabase_schema.sql`):
- `users`: User identity, email, role (`owner`, `supervisor`, `worker`), phone, line assigned.
- `customers`: Client directory records.
- `orders`: Core order record (`MAT-2026-XXXXX`), delivery date, priority, status.
- `order_items`: Glass specifications (`914 × 1828 mm`), required & completed quantities.
- `work_assignments`: Worker job assignments.
- `rework_tasks`: Inspection rejection tasks & reasons.
- `activity_logs`: Complete audit history stream.

---

## 6. Security, Roles & Server API Enforcements

- **HttpOnly JWT Session Cookies**: Issued upon login (`ashapuri_factory_session`).
- **Server API Route Guards**:
  - `/api/orders`: `403 Forbidden` for workers.
  - `/api/customers`: `403 Forbidden` for workers.
  - `/api/worker/my-work`: Workers can ONLY retrieve their own assigned tasks.

---

## 7. Supabase Setup & Deployment Guide

1. Create a Supabase project at [app.supabase.com](https://app.supabase.com).
2. Open **SQL Editor** → **New Query**, paste the contents of `supabase_schema.sql`, and click **Run**.
3. Add your keys to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
   ```
