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

  getWorkerAssignments: (workerId: string): WorkAssignment[] => {
    const data = loadDatabase();
    return data.workAssignments.filter(
      (a) => a.worker_id === workerId && a.status !== 'Approved'
    );
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
