'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, UserRole, Order, WorkAssignment, ActivityLog } from '@/lib/types';
import { db } from '@/lib/db';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar, TabType } from '@/components/layout/Sidebar';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { OrdersView } from '@/components/orders/OrdersView';
import { NewOrderModal } from '@/components/orders/NewOrderModal';
import { OrderDetailsModal } from '@/components/orders/OrderDetailsModal';
import { ProductionView } from '@/components/production/ProductionView';
import { VerificationView } from '@/components/verification/VerificationView';
import { DispatchView } from '@/components/dispatch/DispatchView';
import { WorkerMyWork } from '@/components/worker/WorkerMyWork';
import { WorkerCompleted } from '@/components/worker/WorkerCompleted';
import { CustomersView } from '@/components/customers/CustomersView';
import { ReportsView } from '@/components/reports/ReportsView';
import { SettingsView } from '@/components/settings/SettingsView';

export default function Home() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [assignments, setAssignments] = useState<WorkAssignment[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Modals
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Authenticate Session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/login');
          return;
        }

        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          if (data.user.role !== 'owner') {
            setActiveTab('worker-my-work');
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        router.push('/login');
      } finally {
        setLoadingSession(false);
      }
    }

    checkAuth();
  }, [router]);

  const refreshData = async () => {
    try {
      // 1. Fetch main server orders & assignments
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          db.mergeOrders(data.orders);
        }
        if (data.assignments && Array.isArray(data.assignments)) {
          db.mergeAssignments(data.assignments);
        }
        if (data.logs && Array.isArray(data.logs)) {
          setLogs((prev) =>
            JSON.stringify(prev) === JSON.stringify(data.logs) ? prev : data.logs
          );
        }
      }

      // 2. Fetch specific worker/supervisor assignments if non-owner
      if (currentUser?.role !== 'owner') {
        const workerRes = await fetch('/api/worker/my-work');
        if (workerRes.ok) {
          const workerData = await workerRes.json();
          if (workerData.assignments && Array.isArray(workerData.assignments)) {
            db.mergeAssignments(workerData.assignments);
          }
        }
      }

      const allOrders = db.getOrders();
      const allAssignments = db.getAssignments();
      const allLogs = db.getLogs();

      setOrders((prev) =>
        JSON.stringify(prev) === JSON.stringify(allOrders) ? prev : allOrders
      );
      setAssignments((prev) =>
        JSON.stringify(prev) === JSON.stringify(allAssignments) ? prev : allAssignments
      );
      setLogs((prev) =>
        JSON.stringify(prev) === JSON.stringify(allLogs) ? prev : allLogs
      );

      // 3. Auto-heal: Sync local orders to server if server lambda restarted
      if (allOrders.length > 0 && currentUser?.role === 'owner') {
        allOrders.forEach((ord) => {
          fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(ord),
          }).catch(() => {});
        });
      }
    } catch (err) {
      const localOrders = db.getOrders();
      const localAssignments = db.getAssignments();
      const localLogs = db.getLogs();

      setOrders((prev) =>
        JSON.stringify(prev) === JSON.stringify(localOrders) ? prev : localOrders
      );
      setAssignments((prev) =>
        JSON.stringify(prev) === JSON.stringify(localAssignments) ? prev : localAssignments
      );
      setLogs((prev) =>
        JSON.stringify(prev) === JSON.stringify(localLogs) ? prev : localLogs
      );
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();

      // Silent background polling: 10-second check with zero UI flicker
      const interval = setInterval(() => {
        refreshData();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [currentUser]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  if (loadingSession || !currentUser) {
    return (
      <div className="min-h-screen bg-[#070d18] text-white flex items-center justify-center p-4 font-sans">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-slate-400 font-mono">
            Verifying Factory Session Credentials...
          </p>
        </div>
      </div>
    );
  }

  // Counts for sidebar badges
  const ordersCount = orders.length;
  const productionCount = orders.filter(
    (o) => o.status === 'In Production' || o.status === 'Rework'
  ).length;
  const dispatchCount = orders.filter((o) => o.status === 'Ready').length;
  const needsCheckingCount = orders.filter((o) => o.status === 'Needs Checking').length;
  const workerAssignedCount = assignments.filter(
    (a) => a.worker_id === currentUser.id && a.status !== 'Approved'
  ).length;

  const supervisors = db.getUsers().filter((u) => u.role === 'supervisor');

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        currentUser={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onRefresh={refreshData}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Body */}
      <div className="flex flex-1 relative">
        {/* Desktop & Mobile Responsive Sidebar Drawer */}
        <div
          className={`${
            isMobileSidebarOpen
              ? 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex'
              : 'hidden md:flex'
          }`}
        >
          <div className="w-64 min-h-full bg-surface-container-lowest z-50">
            <Sidebar
              userRole={currentUser.role}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              counts={{
                ordersCount,
                productionCount,
                dispatchCount,
                needsCheckingCount,
                workerAssignedCount,
              }}
            />
          </div>
          {isMobileSidebarOpen && (
            <div
              className="flex-1"
              onClick={() => setIsMobileSidebarOpen(false)}
            ></div>
          )}
        </div>

        {/* Main Workspace View */}
        <main className="flex-1 p-3 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && currentUser.role === 'owner' && (
            <DashboardView
              orders={orders}
              logs={logs}
              userRole={currentUser.role}
              onNavigateToTab={handleTabChange}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              onOpenNewOrder={() => setIsNewOrderOpen(true)}
            />
          )}

          {activeTab === 'orders' && currentUser.role === 'owner' && (
            <OrdersView
              orders={orders}
              workers={supervisors}
              searchQuery={searchQuery}
              userRole={currentUser.role}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              onOpenNewOrder={() => setIsNewOrderOpen(true)}
              onAssignWorkModal={(ord) => {
                setActiveTab('production');
              }}
              onApproveWork={(asgnId) => {
                db.approveWork(asgnId, currentUser.name);
                refreshData();
              }}
              onDispatchOrder={(ordId) => {
                setActiveTab('dispatch');
              }}
              onDeleteOrder={(ordId) => {
                db.deleteOrder(ordId);
                fetch(`/api/orders/${ordId}`, { method: 'DELETE' }).catch(() => {});
                refreshData();
              }}
            />
          )}

          {activeTab === 'production' && currentUser.role === 'owner' && (
            <ProductionView
              orders={orders}
              workers={supervisors}
              assignments={assignments}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'verification' && currentUser.role === 'owner' && (
            <VerificationView
              assignments={assignments}
              currentUser={currentUser}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'dispatch' && currentUser.role === 'owner' && (
            <DispatchView orders={orders} onRefresh={refreshData} />
          )}

          {activeTab === 'customers' && currentUser.role === 'owner' && (
            <CustomersView
              customers={db.getCustomers()}
              orders={orders}
              onRefresh={refreshData}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
            />
          )}

          {activeTab === 'reports' && currentUser.role === 'owner' && (
            <ReportsView orders={orders} />
          )}

          {activeTab === 'settings' && currentUser.role === 'owner' && <SettingsView />}

          {/* WORKER VIEWS (ROLE ENFORCED) */}
          {activeTab === 'worker-my-work' && (
            <WorkerMyWork
              worker={currentUser}
              assignments={assignments}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'worker-completed' && (
            <WorkerCompleted worker={currentUser} assignments={assignments} />
          )}
        </main>
      </div>

      {/* MODALS */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        onOrderCreated={refreshData}
      />

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAssignWorkModal={(ord) => {
          setSelectedOrder(null);
          setActiveTab('production');
        }}
      />
    </div>
  );
}
