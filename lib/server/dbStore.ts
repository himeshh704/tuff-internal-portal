import fs from 'fs';
import path from 'path';
import {
  User,
  Customer,
  Order,
  OrderItem,
  WorkAssignment,
  ProductionUpdate,
  ReworkTask,
  ActivityLog,
  NotificationItem,
  FactorySettings,
} from '../types';

export interface UserAccount extends User {
  email: string;
  passwordHash: string;
}

const DB_FILE_PATH = path.join(process.cwd(), 'factory_server_db.json');

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-1',
    name: 'Rajesh Patel',
    role: 'owner',
    email: 'owner@ashapurituff.com',
    passwordHash: 'admin123',
    phone: '+91 98250 00001',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'user-2',
    name: 'Vikram Singh',
    role: 'supervisor',
    email: 'supervisor@ashapurituff.com',
    passwordHash: 'super123',
    phone: '+91 98250 00002',
    line_assigned: 'Shift A • Production Floor',
  },
  {
    id: 'user-3',
    name: 'Rahul Sharma',
    role: 'worker',
    email: 'rahul@ashapurituff.com',
    passwordHash: 'worker123',
    phone: '+91 98250 00003',
    line_assigned: 'Cutting Line 1',
  },
  {
    id: 'user-4',
    name: 'Suresh Kumar',
    role: 'worker',
    email: 'suresh@ashapurituff.com',
    passwordHash: 'worker123',
    phone: '+91 98250 00004',
    line_assigned: 'Tempering Line',
  },
  {
    id: 'user-5',
    name: 'Amit Verma',
    role: 'worker',
    email: 'amit@ashapurituff.com',
    passwordHash: 'worker123',
    phone: '+91 98250 00005',
    line_assigned: 'Polishing & Edging',
  },
];

export interface ServerDatabaseData {
  users: UserAccount[];
  customers: Customer[];
  orders: Order[];
  workAssignments: WorkAssignment[];
  reworkTasks: ReworkTask[];
  activityLogs: ActivityLog[];
  notifications: NotificationItem[];
}

function loadDatabase(): ServerDatabaseData {
  const freshData: ServerDatabaseData = {
    users: INITIAL_USER_ACCOUNTS,
    customers: [],
    orders: [],
    workAssignments: [],
    reworkTasks: [],
    activityLogs: [],
    notifications: [],
  };

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const dataStr = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(dataStr);
      // Return parsed if present
      return parsed;
    }
  } catch (err) {
    console.error('Error loading DB file, reinitializing', err);
  }

  saveDatabase(freshData);
  return freshData;
}

function saveDatabase(data: ServerDatabaseData) {
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file', err);
  }
}

export const serverDb = {
  getUsers: (): UserAccount[] => {
    return loadDatabase().users;
  },

  findUserByEmail: (email: string): UserAccount | undefined => {
    const data = loadDatabase();
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  getOrders: (): Order[] => {
    return loadDatabase().orders;
  },

  getAssignments: (): WorkAssignment[] => {
    return loadDatabase().workAssignments;
  },

  getWorkerAssignments: (workerId: string, workerName?: string): WorkAssignment[] => {
    const data = loadDatabase();
    return data.workAssignments.filter(
      (a) =>
        (a.worker_id === workerId ||
          (workerName && a.worker_name.toLowerCase().trim() === workerName.toLowerCase().trim())) &&
        a.status !== 'Approved'
    );
  },

  assignWork: (
    orderId: string,
    itemId: string,
    workerId: string,
    requiredQty: number
  ): WorkAssignment => {
    const dbData = loadDatabase();
    const order = dbData.orders.find((o) => o.id === orderId || o.order_number === orderId);
    if (!order) throw new Error('Order not found');

    const item = order.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Order item not found');

    const worker = dbData.users.find((u) => u.id === workerId);
    if (!worker) throw new Error('Worker not found');

    item.assigned_worker_id = worker.id;
    item.assigned_worker_name = worker.name;
    item.status = 'In Production';

    if (order.status === 'New') {
      order.status = 'In Production';
    }

    const assignment: WorkAssignment = {
      id: `assign-${Date.now()}`,
      order_id: order.id,
      order_number: order.order_number,
      customer_name: order.customer_name,
      order_item_id: item.id,
      item_name: item.item_name,
      dimensions: item.dimensions,
      worker_id: worker.id,
      worker_name: worker.name,
      required_qty: requiredQty,
      completed_qty: item.completed_qty || 0,
      status: 'In Progress',
      slip_url: order.slip_url,
      assigned_at: new Date().toISOString(),
    };

    dbData.workAssignments.unshift(assignment);

    dbData.activityLogs.unshift({
      id: `act-${Date.now()}`,
      order_number: order.order_number,
      user_name: 'Vikram Singh',
      user_role: 'supervisor',
      action: 'Work Assigned',
      details: `Assigned ${requiredQty} pcs of ${item.item_name} to ${worker.name}`,
      created_at: new Date().toISOString(),
    });

    saveDatabase(dbData);
    return assignment;
  },

  updateWorkerQuantity: (
    assignmentId: string,
    addedQty: number,
    workerId: string,
    workerName: string
  ) => {
    const dbData = loadDatabase();
    const asgn = dbData.workAssignments.find((a) => a.id === assignmentId);
    if (!asgn) throw new Error('Assignment not found');

    if (asgn.worker_id !== workerId) {
      throw new Error('Unauthorized: This task is assigned to another worker');
    }

    const newCompleted = asgn.completed_qty + addedQty;
    if (newCompleted > asgn.required_qty) {
      throw new Error(`Completed quantity cannot exceed required (${asgn.required_qty})`);
    }

    asgn.completed_qty = newCompleted;
    asgn.status = 'In Progress';

    const order = dbData.orders.find((o) => o.id === asgn.order_id);
    if (order) {
      const item = order.items.find((i) => i.id === asgn.order_item_id);
      if (item) item.completed_qty = newCompleted;
    }

    dbData.activityLogs.unshift({
      id: `act-${Date.now()}`,
      order_number: asgn.order_number,
      user_name: workerName,
      user_role: 'worker',
      action: 'Quantity Updated',
      details: `Added ${addedQty} pcs. Total: ${newCompleted}/${asgn.required_qty}`,
      created_at: new Date().toISOString(),
    });

    saveDatabase(dbData);
    return asgn;
  },

  markAssignmentComplete: (assignmentId: string, workerId: string, workerName: string) => {
    const dbData = loadDatabase();
    const asgn = dbData.workAssignments.find((a) => a.id === assignmentId);
    if (!asgn) throw new Error('Assignment not found');

    if (asgn.worker_id !== workerId) {
      throw new Error('Unauthorized: This task is assigned to another worker');
    }

    asgn.status = 'Needs Checking';
    asgn.completed_at = new Date().toISOString();

    const order = dbData.orders.find((o) => o.id === asgn.order_id);
    if (order) {
      const item = order.items.find((i) => i.id === asgn.order_item_id);
      if (item) item.status = 'Needs Checking';

      const allChecking = order.items.every(
        (i) => i.status === 'Needs Checking' || i.status === 'Ready'
      );
      if (allChecking) order.status = 'Needs Checking';
    }

    dbData.activityLogs.unshift({
      id: `act-${Date.now()}`,
      order_number: asgn.order_number,
      user_name: workerName,
      user_role: 'worker',
      action: 'Work Completed',
      details: `Marked work complete for ${asgn.item_name}. Pending owner check.`,
      created_at: new Date().toISOString(),
    });

    saveDatabase(dbData);
    return asgn;
  },

  getCustomers: (): Customer[] => {
    return loadDatabase().customers;
  },

  getLogs: (): ActivityLog[] => {
    return loadDatabase().activityLogs;
  },

  createOrder: (orderData: {
    customer_id: string;
    customer_name: string;
    customer_phone: string;
    expected_delivery: string;
    priority: Order['priority'];
    notes?: string;
    slip_url?: string;
    items: {
      item_name: string;
      dimensions: string;
      thickness: string;
      required_qty: number;
    }[];
  }): Order => {
    const dbData = loadDatabase();
    const nextSeq = dbData.orders.length + 1;
    const seqStr = nextSeq.toString().padStart(5, '0');
    const orderNumber = `MAT-2026-${seqStr}`;
    const orderId = `ord-${Date.now()}`;

    const newItems = orderData.items.map((item, idx) => ({
      id: `item-${orderId}-${idx + 1}`,
      order_id: orderId,
      item_name: item.item_name,
      dimensions: item.dimensions,
      thickness: item.thickness || '5mm',
      required_qty: item.required_qty,
      completed_qty: 0,
      status: 'New' as const,
    }));

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_id: orderData.customer_id,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery: orderData.expected_delivery,
      priority: orderData.priority,
      status: 'New',
      notes: orderData.notes,
      slip_url: orderData.slip_url,
      items: newItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbData.orders.unshift(newOrder);

    dbData.activityLogs.unshift({
      id: `act-${Date.now()}`,
      order_number: newOrder.order_number,
      user_name: 'Rajesh Patel',
      user_role: 'owner',
      action: 'Order Created',
      details: `Created ${orderNumber} for ${newOrder.customer_name} (${newItems.length} items)`,
      created_at: new Date().toISOString(),
    });

    saveDatabase(dbData);
    return newOrder;
  },

  addUser: (userData: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserAccount['role'];
    phone: string;
    line_assigned?: string;
  }): UserAccount => {
    const dbData = loadDatabase();
    const existing = dbData.users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      throw new Error(`A user account with email ${userData.email} already exists`);
    }

    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      passwordHash: userData.passwordHash || 'worker123',
      role: userData.role,
      phone: userData.phone,
      line_assigned: userData.line_assigned,
    };

    dbData.users.push(newUser);
    saveDatabase(dbData);
    return newUser;
  },

  updateUser: (userId: string, updates: Partial<UserAccount>): UserAccount => {
    const dbData = loadDatabase();
    const user = dbData.users.find((u) => u.id === userId);
    if (!user) throw new Error('User account not found');

    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email;
    if (updates.passwordHash) user.passwordHash = updates.passwordHash;
    if (updates.role) user.role = updates.role;
    if (updates.phone) user.phone = updates.phone;
    if (updates.line_assigned !== undefined) user.line_assigned = updates.line_assigned;

    saveDatabase(dbData);
    return user;
  },

  deleteUser: (userId: string) => {
    const dbData = loadDatabase();
    dbData.users = dbData.users.filter((u) => u.id !== userId);
    saveDatabase(dbData);
    return true;
  },

  resetDataToZero: () => {
    const cleanData: ServerDatabaseData = {
      users: INITIAL_USER_ACCOUNTS,
      customers: [],
      orders: [],
      workAssignments: [],
      reworkTasks: [],
      activityLogs: [],
      notifications: [],
    };
    saveDatabase(cleanData);
    return cleanData;
  }
};
