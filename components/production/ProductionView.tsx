'use client';

import React, { useState } from 'react';
import { Order, User, WorkAssignment } from '@/lib/types';
import { db } from '@/lib/db';
import { Factory, UserCheck, Plus, CheckCircle2, Clock } from 'lucide-react';

interface ProductionViewProps {
  orders: Order[];
  workers: User[];
  assignments: WorkAssignment[];
  onRefresh: () => void;
}

export const ProductionView: React.FC<ProductionViewProps> = ({
  orders,
  workers,
  assignments,
  onRefresh,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [assignQty, setAssignQty] = useState<number>(10);

  const activeOrders = orders.filter(
    (o) => o.status !== 'Completed' && o.status !== 'Ready'
  );

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);
  const selectedItem = selectedOrder?.items.find((i) => i.id === selectedItemId);

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !selectedItemId || !selectedWorkerId) {
      alert('Please select an Order, Item, and Worker');
      return;
    }

    try {
      db.assignWork(selectedOrderId, selectedItemId, selectedWorkerId, assignQty);

      // Sync to server database API
      fetch('/api/orders/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderId,
          itemId: selectedItemId,
          workerId: selectedWorkerId,
          requiredQty: assignQty,
        }),
      }).catch((err) => console.error('Assignment server sync error:', err));

      alert('Work assignment created successfully! Worker can now see it immediately in My Work.');
      setSelectedOrderId('');
      setSelectedItemId('');
      setSelectedWorkerId('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error creating assignment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight">
            Production & Work Assignment
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Assign order glass items to floor workers and monitor line progress.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CREATE WORK ASSIGNMENT FORM */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border-2 border-primary/40 shadow-sm space-y-4">
          <div className="border-b border-outline-variant/30 pb-3 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-extrabold text-on-surface">
              Assign Work to Worker
            </h3>
          </div>

          <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
            {/* SELECT ORDER */}
            <div>
              <label className="block font-bold text-secondary mb-1">
                Select Active Order *
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  setSelectedItemId('');
                }}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
              >
                <option value="">-- Choose Order --</option>
                {activeOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.order_number} — {o.customer_name} ({o.status})
                  </option>
                ))}
              </select>
            </div>

            {/* SELECT ITEM */}
            {selectedOrder && (
              <div>
                <label className="block font-bold text-secondary mb-1">
                  Select Glass Item *
                </label>
                <select
                  value={selectedItemId}
                  onChange={(e) => {
                    setSelectedItemId(e.target.value);
                    const itm = selectedOrder.items.find((i) => i.id === e.target.value);
                    if (itm) setAssignQty(itm.required_qty);
                  }}
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
                >
                  <option value="">-- Choose Item --</option>
                  {selectedOrder.items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.item_name} ({item.dimensions}) — Req: {item.required_qty} pcs
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SELECT WORKER */}
            <div>
              <label className="block font-bold text-secondary mb-1">
                Select Floor Worker *
              </label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
              >
                <option value="">-- Choose Worker --</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.line_assigned || 'Floor Worker'})
                  </option>
                ))}
              </select>
            </div>

            {/* ASSIGN QUANTITY */}
            {selectedItem && (
              <div>
                <label className="block font-bold text-secondary mb-1">
                  Quantity to Assign (Pcs) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedItem.required_qty}
                  value={assignQty}
                  onChange={(e) => setAssignQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs font-mono font-extrabold rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-primary text-on-primary font-extrabold rounded-lg shadow hover:bg-amber-800 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Assign Work Now</span>
            </button>
          </form>
        </div>

        {/* ACTIVE WORK ASSIGNMENTS LIST */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
          <div className="border-b border-outline-variant/30 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-on-surface">
                Live Production Assignments
              </h3>
              <p className="text-xs text-secondary">
                Real-time tracking of active floor assignments.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              {assignments.length} assignments
            </span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {assignments.length === 0 ? (
              <p className="text-xs text-secondary py-8 text-center">
                No active work assignments yet. Use the form to assign work to floor workers.
              </p>
            ) : (
              assignments.map((asgn) => {
                const pct =
                  asgn.required_qty > 0
                    ? Math.round((asgn.completed_qty / asgn.required_qty) * 100)
                    : 0;

                return (
                  <div
                    key={asgn.id}
                    className="p-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/40 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-tertiary bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {asgn.order_number}
                        </span>
                        <h4 className="font-bold text-xs text-on-surface">
                          {asgn.customer_name}
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          asgn.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : asgn.status === 'Needs Checking'
                            ? 'bg-purple-100 text-purple-900 border-purple-300'
                            : asgn.status === 'Rework'
                            ? 'bg-red-100 text-red-900 border-red-300'
                            : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}
                      >
                        {asgn.status}
                      </span>
                    </div>

                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <span className="font-bold text-on-surface block">
                          {asgn.item_name} ({asgn.dimensions})
                        </span>
                        <span className="text-secondary text-[11px] block mt-0.5">
                          Worker: <strong className="text-primary">{asgn.worker_name}</strong>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-extrabold text-sm text-on-surface block">
                          {asgn.completed_qty} / {asgn.required_qty} pcs
                        </span>
                        <span className="text-[10px] text-secondary font-mono">
                          Remaining: {asgn.required_qty - asgn.completed_qty} pcs
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
