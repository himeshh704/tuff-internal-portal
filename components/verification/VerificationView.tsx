'use client';

import React, { useState } from 'react';
import { WorkAssignment, Order, User } from '@/lib/types';
import { db } from '@/lib/db';
import { CheckCircle2, RotateCcw, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface VerificationViewProps {
  assignments: WorkAssignment[];
  orders?: Order[];
  currentUser: User;
  onRefresh: () => void;
}

export const VerificationView: React.FC<VerificationViewProps> = ({
  assignments,
  orders = [],
  currentUser,
  onRefresh,
}) => {
  const [reworkAssignment, setReworkAssignment] = useState<WorkAssignment | null>(null);
  const [reworkReason, setReworkReason] = useState<string>('');

  // 1. Direct assignments with 'Needs Checking' status
  const checkingAssignments = [...assignments.filter((a) => a.status === 'Needs Checking')];

  // 2. Orders with 'Needs Checking' status that don't already have an assignment item listed
  const existingOrderNumbers = new Set(checkingAssignments.map((a) => a.order_number));
  orders.forEach((ord) => {
    if (ord.status === 'Needs Checking' && !existingOrderNumbers.has(ord.order_number)) {
      const itemDesc = ord.items && ord.items.length > 0 ? ord.items.map(i => i.item_name).join(', ') : 'Toughened Glass Items';
      const itemDimensions = ord.items && ord.items.length > 0 ? ord.items[0].dimensions || 'Standard' : 'Standard';
      const reqQty = ord.items && ord.items.length > 0 ? ord.items.reduce((sum, i) => sum + i.required_qty, 0) : 1;
      const compQty = ord.items && ord.items.length > 0 ? ord.items.reduce((sum, i) => sum + i.completed_qty, 0) : reqQty;
      
      checkingAssignments.push({
        id: `ord-verify-${ord.id}`,
        order_id: ord.id,
        order_number: ord.order_number,
        customer_name: ord.customer_name,
        order_item_id: ord.items && ord.items[0] ? ord.items[0].id : 'item-0',
        item_name: itemDesc,
        dimensions: itemDimensions,
        worker_id: 'user-3',
        worker_name: 'Factory Supervisor',
        required_qty: reqQty,
        completed_qty: compQty,
        status: 'Needs Checking',
        assigned_at: ord.created_at,
        slip_url: ord.slip_url,
      });
    }
  });

  const handleApprove = (asgn: WorkAssignment) => {
    try {
      if (asgn.id.startsWith('ord-verify-')) {
        const realOrdId = asgn.order_id;
        db.updateOrderStatus(realOrdId, 'Ready');
        alert(`Approved Order ${asgn.order_number}! Moved to Ready for Dispatch.`);
      } else {
        db.approveWork(asgn.id, currentUser.name);
        alert(`Approved ${asgn.item_name} for ${asgn.order_number}! Moved to Ready for Dispatch.`);
      }
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error approving work');
    }
  };

  const handleOpenReworkModal = (asgn: WorkAssignment) => {
    setReworkAssignment(asgn);
    setReworkReason('');
  };

  const handleSubmitRework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reworkAssignment) return;
    if (!reworkReason.trim()) {
      alert('Please state what needs to be fixed for rework');
      return;
    }

    try {
      db.rejectForRework(
        reworkAssignment.id,
        reworkReason,
        currentUser.name,
        currentUser.id
      );
      alert('Rework request submitted! Item moved back to In Production with rework reason saved.');
      setReworkAssignment(null);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error submitting rework');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight">
            Quality Verification & Checking Queue
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Inspect completed floor worker jobs before marking ready for dispatch.
          </p>
        </div>
        <span className="text-xs font-mono font-extrabold bg-purple-100 text-purple-900 border border-purple-300 px-3 py-1 rounded-full">
          {checkingAssignments.length} Needs Checking
        </span>
      </div>

      {/* QUEUE CARDS */}
      <div className="space-y-4">
        {checkingAssignments.length === 0 ? (
          <div className="bg-surface-container-lowest p-12 rounded-xl border border-outline-variant/40 text-center space-y-2">
            <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-on-surface text-base">
              Verification Queue is Clear!
            </h3>
            <p className="text-xs text-secondary">
              All completed worker tasks have been checked and approved.
            </p>
          </div>
        ) : (
          checkingAssignments.map((asgn) => (
            <div
              key={asgn.id}
              className="bg-surface-container-lowest p-5 rounded-2xl border-2 border-purple-200 shadow-sm space-y-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-tertiary bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {asgn.order_number}
                  </span>
                  <h3 className="font-extrabold text-base text-on-surface">
                    {asgn.customer_name}
                  </h3>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-900 border border-purple-300 px-2 py-0.5 rounded-full uppercase">
                    Needs Checking
                  </span>
                </div>

                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/30 space-y-1">
                  <span className="font-bold text-sm text-on-surface block">
                    {asgn.item_name} ({asgn.dimensions})
                  </span>
                  <div className="text-xs text-secondary flex items-center gap-4 font-mono">
                    <span>
                      Worker: <strong className="text-primary">{asgn.worker_name}</strong>
                    </span>
                    <span>
                      Completed: <strong className="text-on-surface">{asgn.completed_qty} / {asgn.required_qty} pcs</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleOpenReworkModal(asgn)}
                  className="px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-900 font-extrabold rounded-xl border border-red-300 text-xs shadow-sm flex items-center gap-2 active:scale-95 transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Send for Rework</span>
                </button>

                <button
                  onClick={() => handleApprove(asgn)}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md flex items-center gap-2 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Mark Ready</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* REWORK REASON MODAL */}
      {reworkAssignment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-red-50 px-4 py-3 border-b border-red-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-700" />
                <h3 className="text-sm font-extrabold text-red-900">
                  Request Rework — {reworkAssignment.order_number}
                </h3>
              </div>
              <button
                onClick={() => setReworkAssignment(null)}
                className="p-1 text-red-700 hover:bg-red-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRework} className="p-5 space-y-4">
              <p className="text-xs text-secondary font-medium">
                Specify what needs to be fixed. The item will move back to In Production, and worker{' '}
                <strong>{reworkAssignment.worker_name}</strong> will be notified. Full production history remains saved.
              </p>

              <div>
                <label className="block text-xs font-extrabold text-on-surface mb-1">
                  What needs to be fixed? *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. 2 pieces damaged during edge grinding. Re-cut and re-edge required."
                  value={reworkReason}
                  onChange={(e) => setReworkReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReworkAssignment(null)}
                  className="px-4 py-2 text-xs font-bold rounded-lg border border-outline-variant/60 text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-md"
                >
                  Submit Rework Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
