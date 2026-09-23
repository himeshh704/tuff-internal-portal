import {
  User,
  Customer,
  Order,
  WorkAssignment,
  ReworkTask,
  ActivityLog,
  NotificationItem,
  FactorySettings,
} from './types';

const STORAGE_KEY = 'ma_ashapuri_tuff_factory_data_v1';

export const DEFAULT_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Vikash',
    role: 'owner',
    phone: '+91 98250 00001',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  },
  {
    id: 'user-2',
    name: 'Naveen',
    role: 'owner',
    phone: '+91 98250 00002',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  },
  {
    id: 'user-3',
    name: 'Supervisor 1',
    role: 'supervisor',
    phone: '+91 98250 00003',
    line_assigned: 'Shift A • Production Floor',
  },
  {
    id: 'user-4',
    name: 'Supervisor 2',
    role: 'supervisor',
    phone: '+91 98250 00004',
    line_assigned: 'Shift B • Cutting & Tempering',
  },
  {
    id: 'user-5',
    name: 'Supervisor 3',
    role: 'supervisor',
    phone: '+91 98250 00005',
    line_assigned: 'Shift C • Polishing & Edging',
  },
  {
    id: 'user-6',
    name: 'Rahul Sharma',
    role: 'worker',
    phone: '+91 98250 00006',
    line_assigned: 'Cutting Line 1',
  },
  {
    id: 'user-7',
    name: 'Suresh Kumar',
    role: 'worker',
    phone: '+91 98250 00007',
    line_assigned: 'Tempering Line',
  },
];

export const DEFAULT_SETTINGS: FactorySettings = {
  factory_name: 'Ashapuri Tuff — Factory Portal',
  phone: '+91 98250 99999',
  address: 'Plot 108, Industrial Zone 3, Morbi-Rajkot Highway, Gujarat',
  current_shift: 'SHIFT A (08:00 - 16:00)',
  auto_order_prefix: 'AT-2026-',
};

const CLEAN_DATA = {
  users: DEFAULT_USERS,
  customers: [] as Customer[],
  settings: DEFAULT_SETTINGS,
  orders: [] as Order[],
  workAssignments: [] as WorkAssignment[],
  reworkTasks: [] as ReworkTask[],
  activityLogs: [] as ActivityLog[],
  notifications: [] as NotificationItem[],
};

// Data Management Engine
class FactoryStore {
  private data: typeof CLEAN_DATA;

  constructor() {
    this.data = CLEAN_DATA;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          this.data = JSON.parse(saved);
        } catch {
          this.data = CLEAN_DATA;
        }
      } else {
        this.save();
      }
    }
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    }
  }

  public resetToDefault() {
    this.data = CLEAN_DATA;
    this.save();
  }

  // USERS
  getUsers(): User[] {
    return this.data.users;
  }

  addUser(userData: {
    name: string;
    role: User['role'];
    phone: string;
    line_assigned?: string;
  }): User {
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: userData.name,
      role: userData.role,
      phone: userData.phone,
      line_assigned: userData.line_assigned,
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(userId: string, updates: Partial<User>): User {
    const user = this.data.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    if (updates.name) user.name = updates.name;
    if (updates.role) user.role = updates.role;
    if (updates.phone) user.phone = updates.phone;
    if (updates.line_assigned !== undefined) user.line_assigned = updates.line_assigned;
    this.save();
    return user;
  }

  deleteUser(userId: string) {
    this.data.users = this.data.users.filter((u) => u.id !== userId);
    this.save();
  }

  // CUSTOMERS
  getCustomers(): Customer[] {
    return this.data.customers;
  }

  addCustomer(name: string, phone: string, address: string, notes?: string): Customer {
    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name,
      phone,
      address,
      notes,
      created_at: new Date().toISOString(),
    };
    this.data.customers.unshift(newCust);
    this.save();
    return newCust;
  }

  // ORDERS
  getOrders(): Order[] {
    return this.data.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id || o.order_number === id);
  }

  deleteOrder(orderId: string) {
    const ord = this.getOrderById(orderId);
    if (!ord) return;
    this.data.orders = this.data.orders.filter((o) => o.id !== orderId && o.order_number !== orderId);
    this.data.workAssignments = this.data.workAssignments.filter(
      (a) => a.order_id !== ord.id && a.order_number !== ord.order_number
    );
    this.logActivity({
      order_id: ord.id,
      order_number: ord.order_number,
      user_name: 'Rajesh Patel',
      user_role: 'owner',
      action: 'Order Deleted',
      details: `Deleted order ${ord.order_number} and all associated production tasks`,
    });
    this.save();
  }

  deleteAssignment(assignmentId: string) {
    const asgn = this.data.workAssignments.find((a) => a.id === assignmentId);
    if (asgn) {
      this.data.workAssignments = this.data.workAssignments.filter((a) => a.id !== assignmentId);
      this.save();
    }
  }

  createOrder(orderData: {
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
  }): Order {
    const nextSeq = this.data.orders.length + 1;
    const seqStr = nextSeq.toString().padStart(5, '0');
    const orderNumber = `${this.data.settings.auto_order_prefix}${seqStr}`;

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

    this.data.orders.unshift(newOrder);

    this.logActivity({
      order_id: newOrder.id,
      order_number: newOrder.order_number,
      user_name: 'Rajesh Patel',
      user_role: 'owner',
      action: 'Order Created',
      details: `Created ${orderNumber} for ${newOrder.customer_name} (${newItems.length} items)`,
    });

    this.save();
    return newOrder;
  }

  // WORK ASSIGNMENTS
  getAssignments(): WorkAssignment[] {
    return this.data.workAssignments;
  }

  getAssignmentsForWorker(workerId: string): WorkAssignment[] {
    return this.data.workAssignments.filter(
      (a) => a.worker_id === workerId && a.status !== 'Approved'
    );
  }

  assignWork(
    orderId: string,
    itemId: string,
    workerId: string,
    requiredQty: number
  ): WorkAssignment {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    const item = order.items.find((i) => i.id === itemId);
    if (!item) throw new Error('Order item not found');

    const worker = this.data.users.find((u) => u.id === workerId);
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

    this.data.workAssignments.unshift(assignment);

    this.logActivity({
      order_id: order.id,
      order_number: order.order_number,
      user_name: 'Vikram Singh',
      user_role: 'supervisor',
      action: 'Work Assigned',
      details: `Assigned ${item.item_name} (${requiredQty} pcs) to ${worker.name}`,
    });

    this.save();
    return assignment;
  }

  // WORKER PROGRESS UPDATES
  updateWorkerProgress(
    assignmentId: string,
    addedQty: number,
    workerName: string,
    notes?: string
  ) {
    const assignment = this.data.workAssignments.find((a) => a.id === assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    const newCompleted = assignment.completed_qty + addedQty;
    if (newCompleted > assignment.required_qty) {
      throw new Error(
        `Completed quantity (${newCompleted}) cannot exceed required (${assignment.required_qty}).`
      );
    }

    assignment.completed_qty = newCompleted;
    assignment.status = 'In Progress';

    const order = this.getOrderById(assignment.order_id);
    if (order) {
      const item = order.items.find((i) => i.id === assignment.order_item_id);
      if (item) {
        item.completed_qty = newCompleted;
      }
    }

    this.logActivity({
      order_id: assignment.order_id,
      order_number: assignment.order_number,
      user_name: workerName,
      user_role: 'supervisor',
      action: 'Floor Feedback & Progress',
      details: `Added ${addedQty} pcs for ${assignment.worker_name}. Total: ${newCompleted} / ${assignment.required_qty} pcs.${notes ? ` Note: ${notes}` : ''}`,
    });

    this.save();
  }

  markWorkComplete(assignmentId: string, workerName: string) {
    const assignment = this.data.workAssignments.find((a) => a.id === assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    assignment.status = 'Needs Checking';
    assignment.completed_at = new Date().toISOString();

    const order = this.getOrderById(assignment.order_id);
    if (order) {
      const item = order.items.find((i) => i.id === assignment.order_item_id);
      if (item) {
        item.status = 'Needs Checking';
      }

      const allDoneOrChecking = order.items.every(
        (i) => i.status === 'Needs Checking' || i.status === 'Ready' || i.completed_qty >= i.required_qty
      );
      if (allDoneOrChecking) {
        order.status = 'Needs Checking';
      }
    }

    this.logActivity({
      order_id: assignment.order_id,
      order_number: assignment.order_number,
      user_name: workerName,
      user_role: 'worker',
      action: 'Work Completed',
      details: `Marked work complete for ${assignment.item_name}. Pending owner checking.`,
    });

    this.save();
  }

  approveWork(assignmentId: string, approverName: string) {
    const assignment = this.data.workAssignments.find((a) => a.id === assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    assignment.status = 'Approved';

    const order = this.getOrderById(assignment.order_id);
    if (order) {
      const item = order.items.find((i) => i.id === assignment.order_item_id);
      if (item) {
        item.status = 'Ready';
      }

      const allReady = order.items.every(
        (i) => i.status === 'Ready' || i.status === 'Completed'
      );
      if (allReady) {
        order.status = 'Ready';
      }
    }

    this.logActivity({
      order_id: assignment.order_id,
      order_number: assignment.order_number,
      user_name: approverName,
      user_role: 'owner',
      action: 'Verification Approved',
      details: `Approved completed work for ${assignment.item_name}`,
    });

    this.save();
  }

  rejectForRework(
    assignmentId: string,
    reason: string,
    rejectedByName: string,
    rejectedById: string
  ) {
    const assignment = this.data.workAssignments.find((a) => a.id === assignmentId);
    if (!assignment) throw new Error('Assignment not found');

    assignment.status = 'Rework';

    const reworkTask: ReworkTask = {
      id: `rework-${Date.now()}`,
      assignment_id: assignment.id,
      order_id: assignment.order_id,
      order_number: assignment.order_number,
      order_item_id: assignment.order_item_id,
      item_name: assignment.item_name,
      reason,
      requested_by_id: rejectedById,
      requested_by_name: rejectedByName,
      created_at: new Date().toISOString(),
      resolved: false,
    };
    this.data.reworkTasks.unshift(reworkTask);

    const order = this.getOrderById(assignment.order_id);
    if (order) {
      order.status = 'Rework';
      const item = order.items.find((i) => i.id === assignment.order_item_id);
      if (item) {
        item.status = 'Rework';
      }
    }

    this.logActivity({
      order_id: assignment.order_id,
      order_number: assignment.order_number,
      user_name: rejectedByName,
      user_role: 'owner',
      action: 'Rework Requested',
      details: `Rejected ${assignment.item_name} for rework. Reason: ${reason}`,
    });

    this.save();
  }

  dispatchOrder(orderId: string, vehicleRef?: string, note?: string) {
    const order = this.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    order.status = 'Completed';
    order.dispatched_at = new Date().toISOString();
    order.dispatch_vehicle = vehicleRef;
    order.dispatch_note = note;

    order.items.forEach((i) => (i.status = 'Completed'));

    this.logActivity({
      order_id: order.id,
      order_number: order.order_number,
      user_name: 'Rajesh Patel',
      user_role: 'owner',
      action: 'Order Dispatched',
      details: `Dispatched order ${order.order_number} to ${order.customer_name}. Vehicle: ${vehicleRef || 'N/A'}`,
    });

    this.save();
  }

  getLogs(): ActivityLog[] {
    return this.data.activityLogs;
  }

  logActivity(log: Omit<ActivityLog, 'id' | 'created_at'>) {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      ...log,
      created_at: new Date().toISOString(),
    };
    this.data.activityLogs.unshift(newLog);
  }

  getNotifications(): NotificationItem[] {
    return this.data.notifications;
  }

  markNotificationsRead() {
    this.data.notifications.forEach((n) => (n.read = true));
    this.save();
  }
}

export const db = new FactoryStore();
