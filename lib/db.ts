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
];

export const DEFAULT_SETTINGS: FactorySettings = {
  factory_name: 'Ashapuri Tuff — Factory Portal',
  phone: '+91 98250 99999',
  address: 'Industrial Area, Sirohi, Rajasthan - 307001',
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
  private channel: BroadcastChannel | null = null;

  constructor() {
    this.data = CLEAN_DATA;
    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel('ashapuri_realtime_sync');
        } catch (e) {}
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Sanitize old mock logs with invalid names
          if (parsed.activityLogs && Array.isArray(parsed.activityLogs)) {
            parsed.activityLogs = parsed.activityLogs.map((log: ActivityLog) => {
              let name = log.user_name;
              if (name === 'Rajesh Patel') name = 'Vikash';
              if (name === 'Vikram Singh' || name === 'Vikram Singh (SUPERVISOR)') name = 'Supervisor 1';
              return { ...log, user_name: name };
            });
          }
          this.data = parsed;
        } catch {
          this.data = CLEAN_DATA;
        }
      } else {
        this.save();
      }
    }
  }

  private save(pushToServer: boolean = true) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      localStorage.setItem('ashapuri_last_sync_ts', Date.now().toString());
      if (this.channel) {
        try {
          this.channel.postMessage({ type: 'SYNC_NOW', ts: Date.now() });
        } catch (e) {}
      }

      if (pushToServer) {
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orders: this.data.orders,
            assignments: this.data.workAssignments,
            customers: this.data.customers,
            logs: this.data.activityLogs,
            deletedOrderIds: (this.data as any).deletedOrderIds || [],
            deletedAssignmentIds: (this.data as any).deletedAssignmentIds || [],
            deletedCustomerIds: (this.data as any).deletedCustomerIds || [],
          }),
        }).catch(() => {});
      }
    }
  }

  public resetToDefault() {
    this.data = CLEAN_DATA;
    this.save(true);
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

  deleteCustomer(customerId: string) {
    if (!(this.data as any).deletedCustomerIds) {
      (this.data as any).deletedCustomerIds = [];
    }
    if (!(this.data as any).deletedCustomerIds.includes(customerId)) {
      (this.data as any).deletedCustomerIds.push(customerId);
    }

    this.data.customers = (this.data.customers || []).filter((c) => c.id !== customerId);
    this.save();
    if (typeof window !== 'undefined') {
      fetch(`/api/customers/${customerId}`, { method: 'DELETE' }).catch(console.error);
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedCustomerIds: [customerId] }),
      }).catch(console.error);
    }
  }

  mergeCustomers(serverCustomers: Customer[], serverDeletedCustomerIds?: string[]): Customer[] {
    if (!(this.data as any).deletedCustomerIds) {
      (this.data as any).deletedCustomerIds = [];
    }

    if (serverDeletedCustomerIds && Array.isArray(serverDeletedCustomerIds)) {
      serverDeletedCustomerIds.forEach((id) => {
        if (id && !(this.data as any).deletedCustomerIds.includes(id)) {
          (this.data as any).deletedCustomerIds.push(id);
        }
      });
    }

    const deleted = new Set((this.data as any).deletedCustomerIds || []);
    this.data.customers = (this.data.customers || []).filter((c) => !deleted.has(c.id));

    if (!serverCustomers || serverCustomers.length === 0) {
      this.save(false);
      return this.data.customers;
    }

    serverCustomers = serverCustomers.filter((sc) => !deleted.has(sc.id));

    const mergedMap = new Map<string, Customer>();
    this.data.customers.forEach((c) => {
      if (!deleted.has(c.id)) mergedMap.set(c.id, c);
    });

    serverCustomers.forEach((sc) => {
      if (mergedMap.has(sc.id)) {
        mergedMap.set(sc.id, { ...mergedMap.get(sc.id)!, ...sc });
      } else {
        mergedMap.set(sc.id, sc);
      }
    });

    this.data.customers = Array.from(mergedMap.values());
    this.save(false);
    return this.data.customers;
  }

  // ORDERS
  getOrders(): Order[] {
    return this.data.orders;
  }

  mergeOrders(serverOrders: Order[], serverDeletedOrderIds?: string[]): Order[] {
    if (!(this.data as any).deletedOrderIds) {
      (this.data as any).deletedOrderIds = [];
    }

    if (serverDeletedOrderIds && Array.isArray(serverDeletedOrderIds)) {
      serverDeletedOrderIds.forEach((id) => {
        if (id && !(this.data as any).deletedOrderIds.includes(id)) {
          (this.data as any).deletedOrderIds.push(id);
        }
      });
    }

    const deleted = new Set((this.data as any).deletedOrderIds || []);

    this.data.orders = (this.data.orders || []).filter(
      (o) => !deleted.has(o.id) && !deleted.has(o.order_number)
    );
    this.data.workAssignments = (this.data.workAssignments || []).filter(
      (a) => !deleted.has(a.order_id) && !deleted.has(a.order_number)
    );

    if (!serverOrders || serverOrders.length === 0) {
      this.save(false);
      return this.data.orders;
    }

    serverOrders = serverOrders.filter((so) => !deleted.has(so.id) && !deleted.has(so.order_number));

    const mergedMap = new Map<string, Order>();
    this.data.orders.forEach((o) => {
      if (!deleted.has(o.id) && !deleted.has(o.order_number)) {
        mergedMap.set(o.id, o);
      }
    });

    serverOrders.forEach((so) => {
      const existingKey = Array.from(mergedMap.keys()).find(
        (k) => k === so.id || mergedMap.get(k)?.order_number === so.order_number
      );
      if (existingKey) {
        const existing = mergedMap.get(existingKey)!;
        const statusRank: Record<string, number> = {
          'New': 1, 'In Production': 2, 'Needs Checking': 3, 'Rework': 4, 'Ready': 5, 'Completed': 6
        };
        const exRank = statusRank[existing.status] || 0;
        const soRank = statusRank[so.status] || 0;
        const finalStatus = soRank >= exRank ? so.status : existing.status;
        mergedMap.set(existingKey, { ...existing, ...so, status: finalStatus });
      } else {
        mergedMap.set(so.id, so);
      }
    });

    this.data.orders = Array.from(mergedMap.values());
    this.save(false);
    return this.data.orders;
  }

  mergeAssignments(serverAssignments: WorkAssignment[], serverDeletedAssignmentIds?: string[]): WorkAssignment[] {
    if (!(this.data as any).deletedAssignmentIds) {
      (this.data as any).deletedAssignmentIds = [];
    }

    if (serverDeletedAssignmentIds && Array.isArray(serverDeletedAssignmentIds)) {
      serverDeletedAssignmentIds.forEach((id) => {
        if (id && !(this.data as any).deletedAssignmentIds.includes(id)) {
          (this.data as any).deletedAssignmentIds.push(id);
        }
      });
    }

    const deletedAsgns = new Set((this.data as any).deletedAssignmentIds || []);
    const deletedOrds = new Set((this.data as any).deletedOrderIds || []);

    this.data.workAssignments = (this.data.workAssignments || []).filter(
      (a) => !deletedAsgns.has(a.id) && !deletedOrds.has(a.order_id) && !deletedOrds.has(a.order_number)
    );

    if (!serverAssignments || serverAssignments.length === 0) {
      this.save(false);
      return this.data.workAssignments;
    }

    serverAssignments = serverAssignments.filter(
      (sa) => !deletedAsgns.has(sa.id) && !deletedOrds.has(sa.order_id) && !deletedOrds.has(sa.order_number)
    );

    const mergedMap = new Map<string, WorkAssignment>();
    this.data.workAssignments.forEach((a) => {
      if (!deletedAsgns.has(a.id) && !deletedOrds.has(a.order_id) && !deletedOrds.has(a.order_number)) {
        mergedMap.set(a.id, a);
      }
    });

    const statusRank: Record<string, number> = {
      'In Progress': 1, 'Needs Checking': 2, 'Rework': 3, 'Approved': 4
    };

    serverAssignments.forEach((sa) => {
      if (mergedMap.has(sa.id)) {
        const existing = mergedMap.get(sa.id)!;
        const finalQty = Math.max(existing.completed_qty || 0, sa.completed_qty || 0);
        const exRank = statusRank[existing.status] || 0;
        const saRank = statusRank[sa.status] || 0;
        const finalStatus = sa.status === 'Approved' ? 'Approved' : (saRank >= exRank ? sa.status : existing.status);
        mergedMap.set(sa.id, {
          ...existing,
          ...sa,
          completed_qty: finalQty,
          status: finalStatus,
        });
      } else {
        mergedMap.set(sa.id, sa);
      }
    });

    this.data.workAssignments = Array.from(mergedMap.values());
    this.save(false);
    return this.data.workAssignments;
  }

  getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id === id || o.order_number === id);
  }

  updateOrderStatus(orderId: string, status: Order['status']) {
    const order = this.getOrderById(orderId);
    if (order) {
      order.status = status;
      if (order.items) {
        order.items.forEach((i) => {
          if (status === 'Ready') i.status = 'Ready';
        });
      }
      this.save();
      if (typeof window !== 'undefined') {
        fetch(`/api/orders/${order.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'approve', orderId: order.id }),
        }).catch(console.error);
      }
    }
  }

  deleteOrder(orderId: string, userName?: string) {
    const ord = this.getOrderById(orderId);
    if (!ord) return;

    const targetId = ord.id;
    const targetOrderNumber = ord.order_number;

    if (!(this.data as any).deletedOrderIds) {
      (this.data as any).deletedOrderIds = [];
    }
    (this.data as any).deletedOrderIds.push(targetId);
    if (targetOrderNumber) (this.data as any).deletedOrderIds.push(targetOrderNumber);

    this.data.orders = this.data.orders.filter((o) => o.id !== targetId && o.order_number !== targetOrderNumber);
    this.data.workAssignments = this.data.workAssignments.filter(
      (a) => a.order_id !== targetId && a.order_number !== targetOrderNumber
    );

    this.logActivity({
      order_id: targetId,
      order_number: targetOrderNumber,
      user_name: userName || 'Vikash',
      user_role: 'owner',
      action: 'Order Deleted',
      details: `Deleted order ${targetOrderNumber} and all associated production tasks`,
    });
    this.save();

    if (typeof window !== 'undefined') {
      fetch(`/api/orders/${targetId}`, { method: 'DELETE' }).catch(console.error);
      fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletedOrderIds: [targetId] }),
      }).catch(console.error);
    }
  }

  deleteAssignment(assignmentId: string) {
    const asgn = this.data.workAssignments.find((a) => a.id === assignmentId);
    if (asgn) {
      if (!(this.data as any).deletedAssignmentIds) {
        (this.data as any).deletedAssignmentIds = [];
      }
      (this.data as any).deletedAssignmentIds.push(assignmentId);

      this.data.workAssignments = this.data.workAssignments.filter((a) => a.id !== assignmentId);
      this.save();

      if (typeof window !== 'undefined') {
        fetch(`/api/orders/assign/${assignmentId}`, { method: 'DELETE' }).catch(console.error);
        fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deletedAssignmentIds: [assignmentId] }),
        }).catch(console.error);
      }
    }
  }

  createOrder(
    orderData: {
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
    },
    creatorName?: string
  ): Order {
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
      user_name: creatorName || 'Vikash',
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
    requiredQty: number,
    assignerName?: string
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
      user_name: assignerName || 'Supervisor 1',
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

    // AUTO-FINISH IF ALL QTY PRODUCED
    if (newCompleted >= assignment.required_qty) {
      assignment.status = 'Needs Checking';
      assignment.completed_at = new Date().toISOString();
    } else {
      assignment.status = 'In Progress';
    }

    const order = this.getOrderById(assignment.order_id);
    if (order) {
      const item = order.items.find((i) => i.id === assignment.order_item_id);
      if (item) {
        item.completed_qty = newCompleted;
        if (newCompleted >= assignment.required_qty) {
          item.status = 'Needs Checking';
        }
      }
      if (newCompleted >= assignment.required_qty) {
        order.status = 'Needs Checking';
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

    // Sync with Server API immediately
    if (typeof window !== 'undefined') {
      fetch('/api/worker/my-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_qty',
          assignmentId: assignment.id,
          addedQty: addedQty,
        }),
      }).catch(console.error);
    }
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
      user_role: 'supervisor',
      action: 'Work Completed',
      details: `Marked work complete for ${assignment.item_name}. Pending owner checking.`,
    });

    this.save();

    // Sync with Server API immediately
    if (typeof window !== 'undefined') {
      fetch('/api/worker/my-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'mark_complete',
          assignmentId: assignment.id,
        }),
      }).catch(console.error);
    }
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

    if (typeof window !== 'undefined') {
      fetch(`/api/orders/${assignment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', assignmentId: assignment.id }),
      }).catch(console.error);
    }
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

    if (typeof window !== 'undefined') {
      fetch(`/api/orders/${assignment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rework', assignmentId: assignment.id, reason }),
      }).catch(console.error);
    }
  }

  dispatchOrder(orderId: string, vehicleRef?: string, note?: string, userName?: string) {
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
      user_name: userName || 'Vikash',
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
