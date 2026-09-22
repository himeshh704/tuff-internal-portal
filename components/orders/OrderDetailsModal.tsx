'use client';

import React from 'react';
import { Order } from '@/lib/types';
import { X, Calendar, User, Phone, MapPin, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface OrderDetailsModalProps {
  order: Order | null;
  onClose: () => void;
  onAssignWorkModal: (order: Order) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  onClose,
  onAssignWorkModal,
}) => {
  if (!order) return null;

  const totalReq = order.items.reduce((acc, i) => acc + i.required_qty, 0);
  const totalDone = order.items.reduce((acc, i) => acc + i.completed_qty, 0);
  const pct = totalReq > 0 ? Math.round((totalDone / totalReq) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono font-extrabold text-sm text-tertiary bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-1 rounded-md">
              {order.order_number}
            </span>
            <div>
              <h3 className="text-base font-extrabold text-on-surface tracking-tight">
                {order.customer_name}
              </h3>
              <p className="text-xs text-secondary font-mono">
                Order Date: {order.order_date} • Delivery: {order.expected_delivery}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                order.status === 'Completed'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : order.status === 'Ready'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : order.status === 'Needs Checking'
                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                  : order.status === 'Rework'
                  ? 'bg-red-100 text-red-900 border-red-300'
                  : 'bg-amber-100 text-amber-900 border-amber-300'
              }`}
            >
              {order.status}
            </span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-container text-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Customer Summary & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/30">
            <div>
              <span className="text-[10px] font-bold text-secondary uppercase block mb-0.5">
                Customer Phone
              </span>
              <span className="text-xs font-mono font-bold text-on-surface">
                {order.customer_phone}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-secondary uppercase block mb-0.5">
                Priority Level
              </span>
              <span className="text-xs font-extrabold text-amber-900">
                {order.priority}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-secondary uppercase block mb-0.5">
                Overall Progress
              </span>
              <span className="text-xs font-mono font-extrabold text-primary">
                {totalDone} / {totalReq} pcs ({pct}%)
              </span>
            </div>
          </div>

          {/* GLASS ITEMS LIST */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wider">
              Order Items & Worker Assignments
            </h4>

            <div className="space-y-2">
              {order.items.map((item) => {
                const itemPct =
                  item.required_qty > 0
                    ? Math.round((item.completed_qty / item.required_qty) * 100)
                    : 0;

                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/30 pb-2">
                      <div>
                        <h5 className="font-bold text-sm text-on-surface">
                          {item.item_name}
                        </h5>
                        <span className="text-xs font-mono text-secondary bg-surface-container px-2 py-0.5 rounded border border-outline-variant/40 mt-1 inline-block">
                          Dimensions: {item.dimensions} • Thickness: {item.thickness}
                        </span>
                      </div>

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          item.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : item.status === 'Needs Checking'
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : item.status === 'Rework'
                            ? 'bg-red-100 text-red-900 border-red-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-secondary block">Assigned Worker:</span>
                        <span className="font-bold text-on-surface">
                          {item.assigned_worker_name || 'Not Assigned Yet'}
                        </span>
                      </div>

                      <div>
                        <span className="text-secondary block">Quantity Progress:</span>
                        <span className="font-mono font-bold text-on-surface">
                          {item.completed_qty} / {item.required_qty} pcs
                        </span>
                      </div>

                      <div>
                        <span className="text-secondary block">Remaining:</span>
                        <span className="font-mono font-bold text-amber-800">
                          {item.required_qty - item.completed_qty} pcs
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NOTES & SLIP */}
          {order.notes && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
              <span className="text-[10px] font-extrabold text-amber-900 uppercase tracking-wider block">
                Factory Special Notes
              </span>
              <p className="text-xs text-amber-900 font-medium">{order.notes}</p>
            </div>
          )}

          {/* ORIGINAL ORDER SLIP PREVIEW */}
          {order.slip_url && (
            <div className="p-4 bg-surface-container-low/40 rounded-xl border border-outline-variant/30 space-y-2">
              <span className="text-xs font-extrabold text-on-surface uppercase tracking-wider block">
                Original Order Slip Document
              </span>
              <div className="rounded-lg overflow-hidden border border-outline-variant/60 max-h-56">
                <img
                  src={order.slip_url}
                  alt="Order Slip"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-surface-container-low px-6 py-4 border-t border-outline-variant/40 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-outline-variant/60 text-secondary hover:bg-surface-container font-bold text-xs"
          >
            Close
          </button>

          {(order.status === 'New' || order.status === 'In Production') && (
            <button
              onClick={() => {
                onClose();
                onAssignWorkModal(order);
              }}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs shadow-md"
            >
              Assign Workers
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
