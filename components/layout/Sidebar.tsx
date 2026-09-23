'use client';

import React from 'react';
import { UserRole } from '@/lib/types';
import {
  LayoutDashboard,
  Package,
  Factory,
  Truck,
  Users,
  FileBarChart,
  Settings,
  HardHat,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'orders'
  | 'production'
  | 'verification'
  | 'dispatch'
  | 'customers'
  | 'reports'
  | 'settings'
  | 'worker-my-work'
  | 'worker-completed';

interface SidebarProps {
  userRole: UserRole;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  counts: {
    ordersCount: number;
    productionCount: number;
    dispatchCount: number;
    needsCheckingCount: number;
    workerAssignedCount: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  activeTab,
  onTabChange,
  counts,
}) => {
  const isOwner = userRole === 'owner';

  return (
    <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant/40 flex flex-col justify-between p-3 select-none shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-4">
        {/* Navigation Section Title */}
        <div className="px-3 pt-1">
          <span className="text-[10px] font-extrabold tracking-wider text-secondary uppercase block">
            {isOwner ? 'Factory Management' : 'Shift Supervisor Terminal'}
          </span>
        </div>

        {/* Primary Navigation */}
        <nav className="space-y-1">
          {isOwner ? (
            <>
              {/* Dashboard */}
              <button
                onClick={() => onTabChange('dashboard')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-primary text-on-primary shadow-sm border-l-4 border-amber-300'
                    : 'text-secondary hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono font-normal">
                  Overview
                </span>
              </button>

              {/* Orders */}
              <button
                onClick={() => onTabChange('orders')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'orders'
                    ? 'bg-primary text-on-primary shadow-sm border-l-4 border-amber-300'
                    : 'text-secondary hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Package className="w-4 h-4" />
                  <span>Orders</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    activeTab === 'orders'
                      ? 'bg-on-primary/20 text-on-primary'
                      : 'bg-surface-container-high text-on-surface'
                  }`}
                >
                  {counts.ordersCount}
                </span>
              </button>

              {/* Production */}
              <button
                onClick={() => onTabChange('production')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'production'
                    ? 'bg-primary text-on-primary shadow-sm border-l-4 border-amber-300'
                    : 'text-secondary hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Factory className="w-4 h-4" />
                  <span>Production</span>
                </div>
                {counts.productionCount > 0 && (
                  <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                    {counts.productionCount} live
                  </span>
                )}
              </button>

              {/* Quality Verification */}
              <button
                onClick={() => onTabChange('verification')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'verification'
                    ? 'bg-purple-700 text-white shadow-sm border-l-4 border-purple-300'
                    : 'text-secondary hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  <span>Verification</span>
                </div>
                {counts.needsCheckingCount > 0 ? (
                  <span className="bg-purple-100 text-purple-900 font-extrabold px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                    {counts.needsCheckingCount} verify
                  </span>
                ) : (
                  <span className="text-[10px] opacity-70 font-mono">Queue</span>
                )}
              </button>

              {/* Dispatch */}
              <button
                onClick={() => onTabChange('dispatch')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'dispatch'
                    ? 'bg-primary text-on-primary shadow-sm border-l-4 border-amber-300'
                    : 'text-secondary hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4" />
                  <span>Dispatch</span>
                </div>
                {counts.dispatchCount > 0 && (
                  <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                    {counts.dispatchCount} ready
                  </span>
                )}
              </button>

              {/* Customers (Owner Only) */}
              {userRole === 'owner' && (
                <button
                  onClick={() => onTabChange('customers')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'customers'
                      ? 'bg-primary text-on-primary shadow-sm border-l-4 border-amber-300'
                      : 'text-secondary hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4" />
                    <span>Customers</span>
                  </div>
                </button>
              )}

              {/* Reports (Owner Only) */}
              {userRole === 'owner' && (
                <button
                  onClick={() => onTabChange('reports')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'reports'
                      ? 'bg-primary text-on-primary shadow-sm border-l-4 border-amber-300'
                      : 'text-secondary hover:bg-surface-container hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FileBarChart className="w-4 h-4" />
                    <span>Reports</span>
                  </div>
                </button>
              )}
            </>
          ) : (
            <>
              {/* WORKER NAVIGATION ONLY */}
              <button
                onClick={() => onTabChange('worker-my-work')}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-extrabold transition-all ${
                  activeTab === 'worker-my-work'
                    ? 'bg-primary text-on-primary shadow-md border-l-4 border-amber-300'
                    : 'text-secondary hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <HardHat className="w-5 h-5 text-amber-600" />
                  <span>My Work</span>
                </div>
                {counts.workerAssignedCount > 0 && (
                  <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full text-xs font-mono">
                    {counts.workerAssignedCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => onTabChange('worker-completed')}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-extrabold transition-all ${
                  activeTab === 'worker-completed'
                    ? 'bg-primary text-on-primary shadow-md border-l-4 border-amber-300'
                    : 'text-secondary hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <span>Completed</span>
                </div>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Secondary Settings Navigation (Owner Only) */}
      {userRole === 'owner' && (
        <div className="pt-3 border-t border-outline-variant/30 space-y-1">
          <button
            onClick={() => onTabChange('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
              activeTab === 'settings'
                ? 'bg-surface-container text-on-surface font-extrabold'
                : 'text-secondary hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      )}
    </aside>
  );
};
