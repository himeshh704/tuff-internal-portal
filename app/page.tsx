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
          if (data.user.role === 'worker') {
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

  const refreshData = () => {
    setOrders([...db.getOrders()]);
    setAssignments([...db.getAssignments()]);
    setLogs([...db.getLogs()]);
  };

  useEffect(() => {
    if (currentUser) {
      refreshData();
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

  const workers = db.getUsers().filter((u) => u.role === 'worker');

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
          {activeTab === 'dashboard' && currentUser.role !== 'worker' && (
            <DashboardView
              orders={orders}
              logs={logs}
              onNavigateToTab={handleTabChange}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
              onOpenNewOrder={() => setIsNewOrderOpen(true)}
            />
          )}

          {activeTab === 'orders' && currentUser.role !== 'worker' && (
            <OrdersView
              orders={orders}
              workers={workers}
              searchQuery={searchQuery}
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

          {activeTab === 'production' && currentUser.role !== 'worker' && (
            <ProductionView
              orders={orders}
              workers={workers}
              assignments={assignments}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'dispatch' && currentUser.role !== 'worker' && (
            <DispatchView orders={orders} onRefresh={refreshData} />
          )}

          {activeTab === 'customers' && currentUser.role !== 'worker' && (
            <CustomersView
              customers={db.getCustomers()}
              orders={orders}
              onRefresh={refreshData}
              onSelectOrder={(ord) => setSelectedOrder(ord)}
            />
          )}

          {activeTab === 'reports' && currentUser.role !== 'worker' && (
            <ReportsView orders={orders} />
          )}

          {activeTab === 'settings' && currentUser.role !== 'worker' && <SettingsView />}

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
