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

const getDbFilePath = () => {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return path.join('/tmp', 'factory_server_db.json');
  }
  return path.join(process.cwd(), 'factory_server_db.json');
};

const DB_FILE_PATH = getDbFilePath();

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-1',
    name: 'Vikash',
    role: 'owner',
    email: 'vikash@ashapurituff.com',
    passwordHash: 'admin123',
    phone: '+91 98250 00001',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'user-2',
    name: 'Naveen',
    role: 'owner',
    email: 'naveen@ashapurituff.com',
    passwordHash: 'admin123',
    phone: '+91 98250 00002',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'user-3',
    name: 'Supervisor 1',
    role: 'supervisor',
    email: 'supervisor1@ashapurituff.com',
    passwordHash: 'super123',
    phone: '+91 98250 00003',
    line_assigned: 'Shift A • Production Floor',
  },
  {
    id: 'user-4',
    name: 'Supervisor 2',
    role: 'supervisor',
    email: 'supervisor2@ashapurituff.com',
    passwordHash: 'super123',
    phone: '+91 98250 00004',
    line_assigned: 'Shift B • Cutting & Tempering',
  },
  {
    id: 'user-5',
    name: 'Supervisor 3',
    role: 'supervisor',
    email: 'supervisor3@ashapurituff.com',
    passwordHash: 'super123',
    phone: '+91 98250 00005',
    line_assigned: 'Shift C • Polishing & Edging',
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

  findUserByEmail: (emailOrUsername: string): UserAccount | undefined => {
    const data = loadDatabase();
    const query = emailOrUsername.trim().toLowerCase();
    
    return data.users.find((u) => {
      const uEmail = u.email.toLowerCase();
      const uPrefix = uEmail.split('@')[0];
      const uName = u.name.toLowerCase();
      const uId = u.id.toLowerCase();

      return (
        uEmail === query ||
        uPrefix === query ||
        uName === query ||
        uId === query
      );
    });
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
    requiredQty: number,
    orderDataFallback?: any
  ): WorkAssignment => {
    const dbData = loadDatabase();
    let order = dbData.orders.find((o) => o.id === orderId || o.order_number === orderId);

    if (!order && orderDataFallback) {
      order = serverDb.createOrder(orderDataFallback);
    }

    if (!order) {
      order = dbData.orders.find((o) => orderId.includes(o.order_number) || o.order_number.includes(orderId));
    }

    if (!order) {
      throw new Error('Order not found on server database. Please refresh page to sync.');
    }

    let item = order.items.find((i) => i.id === itemId);
    if (!item && order.items.length > 0) {
      item = order.items[0];
    }

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
      user_name: 'Vikash',
      user_role: 'owner',
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
    updaterId: string,
    updaterName: string,
    updaterRole: string = 'supervisor',
    notes?: string
  ) => {
    const dbData = loadDatabase();
    const asgn = dbData.workAssignments.find((a) => a.id === assignmentId);
    if (!asgn) throw new Error('Assignment not found');

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
      user_name: updaterName,
      user_role: updaterRole as any,
      action: 'Floor Feedback & Progress',
      details: `Added ${addedQty} pcs for ${asgn.worker_name}. Total: ${newCompleted}/${asgn.required_qty}.${notes ? ` Note: ${notes}` : ''}`,
      created_at: new Date().toISOString(),
    });

    saveDatabase(dbData);
    return asgn;
  },

  markAssignmentComplete: (
    assignmentId: string,
    updaterId: string,
    updaterName: string,
    updaterRole: string = 'supervisor'
  ) => {
    const dbData = loadDatabase();
    const asgn = dbData.workAssignments.find((a) => a.id === assignmentId);
    if (!asgn) throw new Error('Assignment not found');

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
      user_name: updaterName,
      user_role: updaterRole as any,
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

  createOrder: (orderData: any): Order => {
    const dbData = loadDatabase();

    const orderId = orderData.id || `ord-${Date.now()}`;
    const orderNumber = orderData.order_number || `MAT-2026-${(dbData.orders.length + 1).toString().padStart(5, '0')}`;

    const existing = dbData.orders.find((o) => o.id === orderId || o.order_number === orderNumber);
    if (existing) {
      return existing;
    }

    const newItems = (orderData.items || []).map((item: any, idx: number) => ({
      id: item.id || `item-${orderId}-${idx + 1}`,
      order_id: orderId,
      item_name: item.item_name,
      dimensions: item.dimensions,
      thickness: item.thickness || '5mm',
      required_qty: item.required_qty,
      completed_qty: item.completed_qty || 0,
      status: item.status || 'New',
    }));

    const newOrder: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_id: orderData.customer_id,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      order_date: orderData.order_date || new Date().toISOString().split('T')[0],
      expected_delivery: orderData.expected_delivery,
      priority: orderData.priority || 'Normal',
      status: orderData.status || 'New',
      notes: orderData.notes,
      slip_url: orderData.slip_url,
      items: newItems,
      created_at: orderData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dbData.orders.unshift(newOrder);

    dbData.activityLogs.unshift({
      id: `act-${Date.now()}`,
      order_number: newOrder.order_number,
      user_name: 'Vikash',
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
