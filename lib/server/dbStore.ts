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

declare global {
  var __FACTORY_DB__: ServerDatabaseData | undefined;
}

import { supabaseServer, isSupabaseConfigured } from '../supabaseServer';

function loadDatabase(): ServerDatabaseData {
  if (global.__FACTORY_DB__) {
    return global.__FACTORY_DB__;
  }

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
      global.__FACTORY_DB__ = parsed;
      return parsed;
    }
  } catch (err) {
    console.error('Error loading DB file, reinitializing', err);
  }

  global.__FACTORY_DB__ = freshData;
  saveDatabase(freshData);
  return freshData;
}

function saveDatabase(data: ServerDatabaseData) {
  global.__FACTORY_DB__ = data;
  try {
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB file', err);
  }

  // Asynchronously sync to Supabase if configured
  if (supabaseServer && isSupabaseConfigured()) {
    const client = supabaseServer;
    Promise.resolve().then(async () => {
      try {
        // Sync orders to Supabase
        for (const order of data.orders) {
          await client.from('orders').upsert({
            id: order.id,
            order_number: order.order_number,
            customer_name: order.customer_name,
            customer_phone: order.customer_phone,
            order_date: order.order_date,
            expected_delivery: order.expected_delivery,
            priority: order.priority,
            status: order.status,
            notes: order.notes,
            slip_url: order.slip_url,
          }, { onConflict: 'order_number' });
        }

        // Sync work assignments to Supabase
        for (const asgn of data.workAssignments) {
          await client.from('work_assignments').upsert({
            id: asgn.id,
            order_id: asgn.order_id,
            order_number: asgn.order_number,
            customer_name: asgn.customer_name,
            order_item_id: asgn.order_item_id,
            item_name: asgn.item_name,
            dimensions: asgn.dimensions || 'Standard',
            worker_id: asgn.worker_id,
            worker_name: asgn.worker_name,
            required_qty: asgn.required_qty,
            completed_qty: asgn.completed_qty || 0,
            status: asgn.status,
            assigned_at: asgn.assigned_at,
          }, { onConflict: 'id' });
        }
      } catch (e) {
        console.error('Supabase async sync error:', e);
      }
    });
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
    const activeOrderIds = new Set(data.orders.map((o) => o.id));
    const activeOrderNumbers = new Set(data.orders.map((o) => o.order_number));

    const targetName = (workerName || '').toLowerCase().trim();
    const targetId = (workerId || '').toLowerCase().trim();

    return data.workAssignments.filter((a) => {
      // 1. Order Status Filter: Must belong to active non-deleted orders (if orders are loaded)
      const isOrderActive =
        activeOrderIds.size === 0 ||
        activeOrderIds.has(a.order_id) ||
        activeOrderNumbers.has(a.order_number);

      if (!isOrderActive) return false;
      if (a.status === 'Approved') return false;

      // 2. Supervisor / Worker Matching
      const asgnWorkerId = (a.worker_id || '').toLowerCase().trim();
      const asgnWorkerName = (a.worker_name || '').toLowerCase().trim();

      // Exact ID or Name match
      if (asgnWorkerId === targetId) return true;
      if (targetName && asgnWorkerName === targetName) return true;

      // Flexible Supervisor matching (e.g., Supervisor 1, Supervisor 2, Supervisor 3)
      if (targetName.includes('supervisor 1') && asgnWorkerName.includes('supervisor 1')) return true;
      if (targetName.includes('supervisor 2') && asgnWorkerName.includes('supervisor 2')) return true;
      if (targetName.includes('supervisor 3') && asgnWorkerName.includes('supervisor 3')) return true;

      // User ID matching (user-3 = Supervisor 1, user-4 = Supervisor 2, user-5 = Supervisor 3)
      if (targetId === 'user-3' && (asgnWorkerId === 'user-3' || asgnWorkerName.includes('1'))) return true;
      if (targetId === 'user-4' && (asgnWorkerId === 'user-4' || asgnWorkerName.includes('2'))) return true;
      if (targetId === 'user-5' && (asgnWorkerId === 'user-5' || asgnWorkerName.includes('3'))) return true;

      return false;
    });
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

    // Check if matching assignment already exists to prevent duplicates
    let existingAsgn = dbData.workAssignments.find(
      (a) => (a.order_id === order.id || a.order_number === order.order_number) &&
             a.order_item_id === item.id &&
             a.worker_id === worker.id
    );

    if (existingAsgn) {
      existingAsgn.required_qty = requiredQty;
      saveDatabase(dbData);
      return existingAsgn;
    }

    const assignment: WorkAssignment = {
      id: orderDataFallback?.id || `assign-${Date.now()}`,
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
    let asgn = dbData.workAssignments.find(
      (a) => a.id === assignmentId || a.order_number === assignmentId || a.order_id === assignmentId
    );

    if (!asgn) {
      asgn = dbData.workAssignments.find(
        (a) => a.order_item_id === assignmentId || (a.worker_id === updaterId && a.status !== 'Approved')
      );
    }

    if (!asgn) {
      throw new Error(`Assignment not found for ID ${assignmentId}`);
    }

    const newCompleted = Math.min(asgn.required_qty, (asgn.completed_qty || 0) + addedQty);
    asgn.completed_qty = newCompleted;
    if (newCompleted >= asgn.required_qty) {
      asgn.status = 'Needs Checking';
      asgn.completed_at = new Date().toISOString();
    } else {
      asgn.status = 'In Progress';
    }

    const order = dbData.orders.find((o) => o.id === asgn.order_id || o.order_number === asgn.order_number);
    if (order) {
      const item = order.items.find((i) => i.id === asgn.order_item_id || i.item_name === asgn.item_name);
      if (item) {
        item.completed_qty = newCompleted;
        if (newCompleted >= asgn.required_qty) {
          item.status = 'Needs Checking';
        }
      }
      if (newCompleted >= asgn.required_qty) {
        order.status = 'Needs Checking';
      }
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
    let asgn = dbData.workAssignments.find(
      (a) => a.id === assignmentId || a.order_number === assignmentId || a.order_id === assignmentId
    );

    if (!asgn && dbData.workAssignments.length > 0) {
      asgn = dbData.workAssignments[0];
    }

    if (!asgn) return null;

    asgn.status = 'Needs Checking';
    asgn.completed_at = new Date().toISOString();

    const order = dbData.orders.find((o) => o.id === asgn.order_id || o.order_number === asgn.order_number);
    if (order) {
      order.status = 'Needs Checking';
      const item = order.items.find((i) => i.id === asgn.order_item_id || i.item_name === asgn.item_name);
      if (item) item.status = 'Needs Checking';
    }

    dbData.activityLogs.unshift({
      id: `act-${Date.now()}`,
      order_number: asgn.order_number,
      user_name: updaterName,
      user_role: updaterRole as any,
      action: 'Marked Work Complete',
      details: `Marked work complete for ${asgn.item_name} (${asgn.worker_name}). Sent for Owner Approval.`,
      created_at: new Date().toISOString(),
    });

    saveDatabase(dbData);
    return asgn;
  },

  approveAssignment: (assignmentId: string, approverName: string) => {
    const dbData = loadDatabase();
    let asgn = dbData.workAssignments.find(
      (a) => a.id === assignmentId || a.order_number === assignmentId || a.order_id === assignmentId
    );
    if (asgn) {
      asgn.status = 'Approved';
      const order = dbData.orders.find((o) => o.id === asgn.order_id || o.order_number === asgn.order_number);
      if (order) {
        const item = order.items.find((i) => i.id === asgn.order_item_id || i.item_name === asgn.item_name);
        if (item) item.status = 'Ready';
        const allReady = order.items.every((i) => i.status === 'Ready' || i.status === 'Completed');
        if (allReady) order.status = 'Ready';
      }
      dbData.activityLogs.unshift({
        id: `act-${Date.now()}`,
        order_number: asgn.order_number,
        user_name: approverName,
        user_role: 'owner',
        action: 'Verification Approved',
        details: `Approved completed work for ${asgn.item_name}`,
        created_at: new Date().toISOString(),
      });
      saveDatabase(dbData);
    }
  },

  rejectAssignmentForRework: (
    assignmentId: string,
    reason: string,
    rejectedByName: string,
    rejectedById: string
  ) => {
    const dbData = loadDatabase();
    let asgn = dbData.workAssignments.find(
      (a) => a.id === assignmentId || a.order_number === assignmentId || a.order_id === assignmentId
    );
    if (asgn) {
      asgn.status = 'Rework';
      const reworkTask: ReworkTask = {
        id: `rework-${Date.now()}`,
        assignment_id: asgn.id,
        order_id: asgn.order_id,
        order_number: asgn.order_number,
        order_item_id: asgn.order_item_id,
        item_name: asgn.item_name,
        reason,
        requested_by_id: rejectedById,
        requested_by_name: rejectedByName,
        created_at: new Date().toISOString(),
        resolved: false,
      };
      dbData.reworkTasks.unshift(reworkTask);
      const order = dbData.orders.find((o) => o.id === asgn.order_id || o.order_number === asgn.order_number);
      if (order) {
        order.status = 'Rework';
        const item = order.items.find((i) => i.id === asgn.order_item_id || i.item_name === asgn.item_name);
        if (item) item.status = 'Rework';
      }
      dbData.activityLogs.unshift({
        id: `act-${Date.now()}`,
        order_number: asgn.order_number,
        user_name: rejectedByName,
        user_role: 'owner',
        action: 'Rework Requested',
        details: `Rejected ${asgn.item_name} for rework. Reason: ${reason}`,
        created_at: new Date().toISOString(),
      });
      saveDatabase(dbData);
    }
  },

  mergeClientData: (incoming: { orders?: Order[]; assignments?: WorkAssignment[]; logs?: ActivityLog[] }) => {
    const dbData = loadDatabase();
    const statusRank: Record<string, number> = {
      'New': 1, 'In Production': 2, 'Needs Checking': 3, 'Rework': 4, 'Ready': 5, 'Completed': 6
    };

    if (incoming.orders && Array.isArray(incoming.orders)) {
      incoming.orders.forEach((so) => {
        const idx = dbData.orders.findIndex((o) => o.id === so.id || o.order_number === so.order_number);
        if (idx !== -1) {
          const ex = dbData.orders[idx];
          const exRank = statusRank[ex.status] || 0;
          const soRank = statusRank[so.status] || 0;
          const finalStatus = soRank >= exRank ? so.status : ex.status;
          dbData.orders[idx] = { ...ex, ...so, status: finalStatus };
        } else {
          dbData.orders.unshift(so);
        }
      });
    }

    if (incoming.assignments && Array.isArray(incoming.assignments)) {
      incoming.assignments.forEach((sa) => {
        const idx = dbData.workAssignments.findIndex((a) => a.id === sa.id);
        if (idx !== -1) {
          const ex = dbData.workAssignments[idx];
          const finalQty = Math.max(ex.completed_qty || 0, sa.completed_qty || 0);
          const exRank = statusRank[ex.status] || 0;
          const saRank = statusRank[sa.status] || 0;
          const finalStatus = saRank >= exRank ? sa.status : ex.status;
          dbData.workAssignments[idx] = { ...ex, ...sa, completed_qty: finalQty, status: finalStatus };
        } else {
          dbData.workAssignments.unshift(sa);
        }
      });
    }

    saveDatabase(dbData);
    return dbData;
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
    const orderNumber = orderData.order_number || `AT-2026-${(dbData.orders.length + 1).toString().padStart(5, '0')}`;

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

  deleteOrder: (orderId: string) => {
    const dbData = loadDatabase();
    const ord = dbData.orders.find((o) => o.id === orderId || o.order_number === orderId);
    dbData.orders = dbData.orders.filter((o) => o.id !== orderId && o.order_number !== orderId);
    if (ord) {
      dbData.workAssignments = dbData.workAssignments.filter(
        (a) => a.order_id !== ord.id && a.order_number !== ord.order_number
      );
    } else {
      dbData.workAssignments = dbData.workAssignments.filter(
        (a) => a.order_id !== orderId && a.order_number !== orderId
      );
    }
    saveDatabase(dbData);
    return true;
  },

  deleteAssignment: (assignmentId: string) => {
    const dbData = loadDatabase();
    dbData.workAssignments = dbData.workAssignments.filter(
      (a) => a.id !== assignmentId && a.order_number !== assignmentId
    );
    saveDatabase(dbData);
    return true;
  },

  deleteCustomer: (customerId: string) => {
    const dbData = loadDatabase();
    dbData.customers = dbData.customers.filter((c) => c.id !== customerId);
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
