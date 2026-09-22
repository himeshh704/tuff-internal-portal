'use client';

import React from 'react';
import { Order, ActivityLog } from '@/lib/types';
import {
  PackagePlus,
  Factory,
  CheckCircle2,
  Truck,
  ArrowRight,
  Clock,
  UserCheck,
} from 'lucide-react';

interface DashboardViewProps {
  orders: Order[];
  logs: ActivityLog[];
  onNavigateToTab: (tab: any) => void;
  onSelectOrder: (order: Order) => void;
  onOpenNewOrder: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  logs,
  onNavigateToTab,
  onSelectOrder,
  onOpenNewOrder,
}) => {
  const newOrders = orders.filter((o) => o.status === 'New');
  const inProduction = orders.filter((o) => o.status === 'In Production' || o.status === 'Rework');
  const needsChecking = orders.filter((o) => o.status === 'Needs Checking');
  const readyForDispatch = orders.filter((o) => o.status === 'Ready');

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick CTA Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight">
            Factory Floor Overview
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Real-time status of active shop floor orders and production stages.
          </p>
        </div>
        <button
          onClick={onOpenNewOrder}
          className="px-4 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg shadow hover:bg-amber-800 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <PackagePlus className="w-4 h-4" />
          <span>+ Create New Order</span>
        </button>
      </div>

      {/* 4 CORE KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* NEW ORDERS */}
        <div
          onClick={() => onNavigateToTab('orders')}
          className="bg-surface-container-lowest p-4 rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              New Orders
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <PackagePlus className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-on-surface">
              {newOrders.length}
            </span>
            <span className="text-xs text-blue-700 font-semibold group-hover:underline flex items-center gap-1">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* IN PRODUCTION */}
        <div
          onClick={() => onNavigateToTab('production')}
          className="bg-surface-container-lowest p-4 rounded-xl border-2 border-amber-200 hover:border-amber-400 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              In Production
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Factory className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-on-surface">
              {inProduction.length}
            </span>
            <span className="text-xs text-amber-800 font-semibold group-hover:underline flex items-center gap-1">
              View <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* NEEDS CHECKING */}
        <div
          onClick={() => onNavigateToTab('orders')}
          className="bg-surface-container-lowest p-4 rounded-xl border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
              Needs Checking
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-on-surface">
              {needsChecking.length}
            </span>
            <span className="text-xs text-purple-800 font-semibold group-hover:underline flex items-center gap-1">
              Verify <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* READY FOR DISPATCH */}
        <div
          onClick={() => onNavigateToTab('dispatch')}
          className="bg-surface-container-lowest p-4 rounded-xl border-2 border-emerald-200 hover:border-emerald-400 transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
              Ready for Dispatch
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-on-surface">
              {readyForDispatch.length}
            </span>
            <span className="text-xs text-emerald-800 font-semibold group-hover:underline flex items-center gap-1">
              Dispatch <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* TODAY'S ORDERS & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TODAY'S ORDERS LIST */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <div>
              <h3 className="text-sm font-extrabold text-on-surface">
                Today&apos;s Active Orders
              </h3>
              <p className="text-xs text-secondary">
                Click any order to view detailed items and worker assignments.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('orders')}
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              View All ({orders.length}) <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {recentOrders.map((ord) => {
              const totalReq = ord.items.reduce((acc, i) => acc + i.required_qty, 0);
              const totalDone = ord.items.reduce((acc, i) => acc + i.completed_qty, 0);
              const pct = totalReq > 0 ? Math.round((totalDone / totalReq) * 100) : 0;

              return (
                <div
                  key={ord.id}
                  onClick={() => onSelectOrder(ord)}
                  className="p-3 rounded-lg border border-outline-variant/40 hover:border-primary/60 bg-surface-container-low/40 hover:bg-surface-container-low transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-tertiary bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {ord.order_number}
                      </span>
                      <h4 className="font-bold text-sm text-on-surface">
                        {ord.customer_name}
                      </h4>
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          ord.priority === 'Urgent'
                            ? 'bg-red-100 text-red-900 border border-red-300'
                            : ord.priority === 'High'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-surface-container text-secondary'
                        }`}
                      >
                        {ord.priority}
                      </span>
                    </div>
                    <p className="text-xs text-secondary font-mono">
                      {ord.items.length} Glass Item(s) • Expected: {ord.expected_delivery}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Status Pill */}
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                        ord.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : ord.status === 'Ready'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : ord.status === 'Needs Checking'
                          ? 'bg-purple-100 text-purple-900 border-purple-300'
                          : ord.status === 'Rework'
                          ? 'bg-red-100 text-red-900 border-red-300'
                          : ord.status === 'In Production'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-blue-100 text-blue-900 border-blue-300'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {ord.status}
                    </span>

                    {/* Progress */}
                    <div className="w-24 text-right">
                      <div className="text-[11px] font-bold text-on-surface font-mono">
                        {totalDone}/{totalReq} ({pct}%)
                      </div>
                      <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-0.5">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RECENT ACTIVITY TIMELINE */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
          <div className="border-b border-outline-variant/30 pb-3">
            <h3 className="text-sm font-extrabold text-on-surface flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Recent Activity Log
            </h3>
            <p className="text-xs text-secondary">
              Production updates & approval actions.
            </p>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {logs.slice(0, 8).map((log) => (
              <div
                key={log.id}
                className="relative pl-4 border-l-2 border-outline-variant/60 space-y-0.5"
              >
                <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-primary"></div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-on-surface">
                    {log.user_name} ({log.user_role.toUpperCase()})
                  </span>
                  <span className="text-secondary font-mono text-[10px]">
                    {new Date(log.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs font-semibold text-primary">{log.action}</p>
                <p className="text-xs text-secondary leading-snug">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
