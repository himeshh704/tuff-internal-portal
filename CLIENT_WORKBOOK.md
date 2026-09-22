# MA ASHAPURI TUFF — FACTORY PORTAL
## Non-Technical Client Operating Manual & Training Workbook

---

### Welcome to Your Factory Digital Portal!

This simple workbook explains how to use **MA Ashapuri Tuff — Factory Portal** to manage your daily glass processing orders, floor worker assignments, quality checks, and customer deliveries.

The system is designed to be **extremely simple** to use, replacing paper slips and WhatsApp messages with a clean digital shop notebook.

---

## 1. Quick Login & Role Summary

| Who Are You? | Email Account | Password | What You Can Do |
| :--- | :--- | :--- | :--- |
| **Factory Owner (Admin)** | `owner@ashapurituff.com` | `admin123` | Full control: Create orders, manage customers, check quality, approve dispatch, view monthly reports, and add new workers. |
| **Shift Supervisor** | `supervisor@ashapurituff.com` | `super123` | Manage daily production: Assign glass items to floor workers, monitor line progress, and inspect completed work. |
| **Floor Line Worker** | `rahul@ashapurituff.com` | `worker123` | Simple mobile screen: See assigned glass jobs, tap **+ Update Quantity** when finished with pieces, and tap **Mark Work Complete**. |

---

## 2. Daily Operational Guide (Step-by-Step)

### Step 1: Owner Creates a New Order
1. Log in as **Owner** (`owner@ashapurituff.com`).
2. Go to **Orders** → Click **+ Create Order**.
3. Select or type Customer Name, Phone Number, Expected Delivery Date, and Priority.
4. Add your Glass Items (e.g. *5mm Clear Toughened Glass*, *914 × 1828 mm*, *20 pcs*).
5. Click **Create Order**.
   - *The system automatically creates Order # `MAT-2026-00001` with status **New**.*

---

### Step 2: Assigning Glass Items to Floor Workers
1. Go to **Production** on the left menu.
2. Select the Active Order, the Glass Item, and choose your Floor Worker (e.g. **Rahul Sharma**).
3. Click **Assign Work Now**.
   - *Rahul immediately sees this job on his mobile phone screen under **My Work**.*

---

### Step 3: Worker Updates Progress on Shop Floor
1. Worker logs in on mobile or tablet (`rahul@ashapurituff.com`).
2. Worker opens **My Work** and sees a card with big numbers:
   - **REQUIRED: 20 pcs**
   - **DONE: 0 pcs**
   - **REMAIN: 20 pcs**
3. When Rahul completes 12 pieces, he taps **+ Update Quantity**, enters `12`, and taps **Save Progress**.
   - *His card automatically updates: **DONE: 12**, **REMAIN: 8**, **60% Progress**.*
4. When all 20 pieces are done, he taps **Mark Work Complete**.
   - *The job moves to **Needs Checking** for the owner's review.*

---

### Step 4: Quality Checking & Approval (Owner / Supervisor)
1. Owner opens **Needs Checking** (or Quality Verification queue).
2. Inspect the completed glass pieces on the shop floor.
3. **If Approved**: Click **Approve & Mark Ready**. The order moves to **Ready for Dispatch**.
4. **If Rejected (Rework Needed)**:
   - Click **Send for Rework**.
   - Type what needs to be fixed (e.g. *"2 pieces damaged during edge grinding"*).
   - Click **Submit Rework**.
   - *The job moves back to **In Production** for the worker to fix, preserving full history.*

---

### Step 5: Dispatching Finished Glass Orders
1. Go to **Dispatch** on the left menu.
2. Under **Ready for Dispatch Queue**, locate the client's order.
3. Click **Mark as Dispatched**.
4. Enter truck/vehicle number (e.g. `GJ-01-AT-4820`) and receiving note.
5. Click **Confirm Dispatch**.
   - *Order moves to **Completed** and is archived in reports.*

---

## 3. Frequently Asked Questions (FAQ)

### Q1: How do I add a new worker to the portal?
- Log in as **Owner** → Click **Settings** → Scroll to **Factory Personnel & User Directory** → Click **+ Register Worker**. Enter their Name, Phone, and Email.

### Q2: Can workers see reports, customer phone lists, or financial data?
- **No.** Workers are strictly locked out of Admin screens and can only see their own assigned tasks.

### Q3: How do I export monthly reports for accounting?
- Go to **Reports** → Select the Month → Click **Download CSV** or **Print PDF**.

---

## 4. Operational Sign-off & Client Receipt

```
MA ASHAPURI TUFF — FACTORY SYSTEM RECEIPT
-----------------------------------------------------------
Factory Name: MA Ashapuri Tuff
Portal URL: http://localhost:3007 (or live domain)
GitHub Repository: https://github.com/himeshh704/tuff-internal-portal.git

Client Signature: _______________________   Date: ____________
System Trainer: _________________________   Date: ____________
```
