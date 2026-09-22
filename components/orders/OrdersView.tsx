'use client';

import React, { useState } from 'react';
import { Order, OrderStatus, User } from '@/lib/types';
import {
  PackagePlus,
  Eye,
  UserCheck,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Paperclip,
  Trash2,
} from 'lucide-react';

interface OrdersViewProps {
  orders: Order[];
  workers: User[];
  searchQuery: string;
  onSelectOrder: (order: Order) => void;
  onOpenNewOrder: () => void;
  onAssignWorkModal: (order: Order) => void;
  onApproveWork: (assignmentId: string) => void;
  onDispatchOrder: (orderId: string) => void;
  onDeleteOrder?: (orderId: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  workers,
  searchQuery,
  onSelectOrder,
  onOpenNewOrder,
  onAssignWorkModal,
  onApproveWork,
  onDispatchOrder,
  onDeleteOrder,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus =
      selectedStatus === 'All' || ord.status === selectedStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      ord.order_number.toLowerCase().includes(q) ||
      ord.customer_name.toLowerCase().includes(q) ||
      ord.customer_phone.toLowerCase().includes(q) ||
      ord.items.some((i) => i.item_name.toLowerCase().includes(q));

    return matchesStatus && matchesSearch;
  });

  const statuses: (OrderStatus | 'All')[] = [
    'All',
    'New',
    'In Production',
    'Needs Checking',
    'Rework',
    'Ready',
    'Completed',
  ];

  return (
    <div className="space-y-4">
      {/* Header & New Order Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight">
            Orders Management
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            View, track, and manage all factory glass production orders.
          </p>
        </div>
        <button
          onClick={onOpenNewOrder}
          className="px-4 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg shadow hover:bg-amber-800 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <PackagePlus className="w-4 h-4" />
          <span>+ Create Order</span>
        </button>
      </div>

      {/* STATUS FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statuses.map((st) => {
          const count =
            st === 'All'
              ? orders.length
              : orders.filter((o) => o.status === st).length;

          return (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 border ${
                selectedStatus === st
                  ? 'bg-primary text-on-primary border-amber-600 shadow-sm'
                  : 'bg-surface-container-lowest text-secondary border-outline-variant/40 hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span>{st}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-extrabold ${
                  selectedStatus === st
                    ? 'bg-on-primary/20 text-on-primary'
                    : 'bg-surface-container text-secondary'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ORDERS DATA TABLE */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/40 text-secondary uppercase font-label-ui text-[11px] tracking-wider">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items & Specifications</th>
                <th className="py-3 px-4 text-center">Required / Done</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-secondary">
                    <p className="font-bold text-sm">No orders found</p>
                    <p className="text-xs text-secondary mt-1">
                      Try selecting a different status filter or search query.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const totalReq = ord.items.reduce(
                    (acc, i) => acc + i.required_qty,
                    0
                  );
                  const totalDone = ord.items.reduce(
                    (acc, i) => acc + i.completed_qty,
                    0
                  );
                  const pct =
                    totalReq > 0 ? Math.round((totalDone / totalReq) * 100) : 0;

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-surface-container-low/60 transition-colors"
                    >
                      {/* ORDER NUMBER */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-tertiary bg-blue-50 px-2 py-1 rounded border border-blue-200">
                            {ord.order_number}
                          </span>
                          {ord.slip_url && (
                            <button
                              onClick={() => onSelectOrder(ord)}
                              title="Attached Order Slip Document"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 px-1.5 py-0.5 rounded"
                            >
                              <Paperclip className="w-3 h-3 text-amber-800" />
                              <span>Slip</span>
                            </button>
                          )}
                        </div>
                        <span className="block text-[10px] text-secondary font-mono mt-1">
                          Date: {ord.order_date}
                        </span>
                      </td>

                      {/* CUSTOMER */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-on-surface text-sm block">
                          {ord.customer_name}
                        </span>
                        <span className="text-secondary font-mono text-[11px]">
                          {ord.customer_phone}
                        </span>
                      </td>

                      {/* ITEMS */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {ord.items.map((item) => (
                          <div key={item.id} className="text-xs space-y-0.5 mb-1 last:mb-0">
                            <span className="font-bold text-on-surface block">
                              {item.item_name}
                            </span>
                            <span className="font-mono text-secondary text-[11px] bg-surface-container px-1.5 py-0.5 rounded">
                              {item.dimensions} • {item.thickness}
                            </span>
                          </div>
                        ))}
                      </td>

                      {/* REQUIRED vs COMPLETED */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-extrabold text-sm text-on-surface">
                          {totalDone} / {totalReq}
                        </span>
                        <div className="w-20 mx-auto bg-surface-container h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${pct}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-mono text-primary font-bold">
                          {pct}%
                        </span>
                      </td>

                      {/* PRIORITY */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full ${
                            ord.priority === 'Urgent'
                              ? 'bg-red-100 text-red-900 border border-red-300'
                              : ord.priority === 'High'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-surface-container text-secondary'
                          }`}
                        >
                          {ord.priority}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full border inline-flex items-center gap-1.5 ${
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
                      </td>

                      {/* ACTIONS */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectOrder(ord)}
                            title="View Details"
                            className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors"
                          >
                            <Eye className="w-4 h-4 text-primary" />
                          </button>

                          {(ord.status === 'New' || ord.status === 'In Production') && (
                            <button
                              onClick={() => onAssignWorkModal(ord)}
                              title="Assign Worker"
                              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[11px] flex items-center gap-1 shadow-sm"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Assign</span>
                            </button>
                          )}

                          {ord.status === 'Ready' && (
                            <button
                              onClick={() => onDispatchOrder(ord.id)}
                              title="Mark as Dispatched"
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[11px] flex items-center gap-1 shadow-sm"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Dispatch</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (confirm(`Delete Order ${ord.order_number} for ${ord.customer_name}?`)) {
                                if (onDeleteOrder) onDeleteOrder(ord.id);
                              }
                            }}
                            title="Delete Order"
                            className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
