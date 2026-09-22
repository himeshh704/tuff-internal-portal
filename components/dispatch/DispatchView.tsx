'use client';

import React, { useState } from 'react';
import { Order } from '@/lib/types';
import { db } from '@/lib/db';
import { Truck, CheckCircle2, X, PackageCheck } from 'lucide-react';

interface DispatchViewProps {
  orders: Order[];
  onRefresh: () => void;
}

export const DispatchView: React.FC<DispatchViewProps> = ({
  orders,
  onRefresh,
}) => {
  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null);
  const [vehicle, setVehicle] = useState<string>('GJ-01-AT-4820');
  const [note, setNote] = useState<string>('Packed in wooden crates & verified');

  const readyOrders = orders.filter((o) => o.status === 'Ready');
  const dispatchedOrders = orders.filter((o) => o.status === 'Completed');

  const handleOpenDispatch = (ord: Order) => {
    setDispatchModalOrder(ord);
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalOrder) return;

    try {
      db.dispatchOrder(dispatchModalOrder.id, vehicle, note);
      alert(`Order ${dispatchModalOrder.order_number} marked as Dispatched & Completed!`);
      setDispatchModalOrder(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error dispatching order');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight">
            Dispatch Staging & Logistics
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Manage finished orders ready for truck loading and site delivery.
          </p>
        </div>
        <span className="text-xs font-mono font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300 px-3 py-1 rounded-full">
          {readyOrders.length} Ready for Dispatch
        </span>
      </div>

      {/* READY FOR DISPATCH QUEUE */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold text-on-surface uppercase tracking-wider">
          Ready for Dispatch Queue
        </h3>

        {readyOrders.length === 0 ? (
          <div className="bg-surface-container-lowest p-10 rounded-xl border border-outline-variant/40 text-center space-y-2">
            <PackageCheck className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="font-extrabold text-on-surface text-sm">
              No orders waiting in staging area.
            </h4>
            <p className="text-xs text-secondary">
              Orders will appear here automatically once approved during quality verification.
            </p>
          </div>
        ) : (
          readyOrders.map((ord) => {
            const totalQty = ord.items.reduce((acc, i) => acc + i.required_qty, 0);

            return (
              <div
                key={ord.id}
                className="bg-surface-container-lowest p-5 rounded-2xl border-2 border-emerald-300 shadow-sm space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-tertiary bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                      {ord.order_number}
                    </span>
                    <h3 className="font-extrabold text-base text-on-surface">
                      {ord.customer_name}
                    </h3>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full uppercase">
                      Ready for Dispatch
                    </span>
                  </div>

                  <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 space-y-1">
                    {ord.items.map((i) => (
                      <div key={i.id} className="text-xs font-medium text-on-surface">
                        • {i.item_name} ({i.dimensions}) — <strong>{i.required_qty} pcs</strong>
                      </div>
                    ))}
                    <div className="text-xs text-secondary font-mono pt-1">
                      Total Units: <strong>{totalQty} pcs</strong> • Customer Phone:{' '}
                      <strong>{ord.customer_phone}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenDispatch(ord)}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-sm shadow-md flex items-center gap-2 active:scale-95 transition-all shrink-0"
                >
                  <Truck className="w-5 h-5" />
                  <span>Mark as Dispatched</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* DISPATCH CONFIRMATION MODAL */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-emerald-50 px-4 py-3 border-b border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-800" />
                <h3 className="text-sm font-extrabold text-emerald-900">
                  Dispatch Order — {dispatchModalOrder.order_number}
                </h3>
              </div>
              <button
                onClick={() => setDispatchModalOrder(null)}
                className="p-1 text-emerald-800 hover:bg-emerald-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDispatch} className="p-5 space-y-4 text-xs">
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 text-emerald-950 font-medium">
                Customer: <strong>{dispatchModalOrder.customer_name}</strong>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Vehicle / Transport Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. GJ-01-AT-4820"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Dispatch Note / Receiving Signature
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Verified by driver Harish. Packed in wooden frames."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDispatchModalOrder(null)}
                  className="px-4 py-2 font-bold rounded-lg border border-outline-variant/60 text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-extrabold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
