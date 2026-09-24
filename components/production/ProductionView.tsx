'use client';

import React, { useState } from 'react';
import { Order, User, WorkAssignment } from '@/lib/types';
import { db } from '@/lib/db';
import { Factory, UserCheck, Plus, CheckCircle2, Clock, Trash2 } from 'lucide-react';

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

  const [feedbackAssignment, setFeedbackAssignment] = useState<WorkAssignment | null>(null);
  const [addedQty, setAddedQty] = useState<number>(1);
  const [feedbackNote, setFeedbackNote] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !selectedItemId || !selectedWorkerId) {
      alert('Please select an Order, Item, and Worker');
      return;
    }

    try {
      const createdAsgn = db.assignWork(selectedOrderId, selectedItemId, selectedWorkerId, assignQty);

      // Sync to server database API with full orderData fallback
      await fetch('/api/orders/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrderId,
          itemId: selectedItemId,
          workerId: selectedWorkerId,
          requiredQty: assignQty,
          orderData: { ...selectedOrder, id: createdAsgn.id },
        }),
      });

      alert('Work assignment created successfully!');
      setSelectedOrderId('');
      setSelectedItemId('');
      setSelectedWorkerId('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Error creating assignment');
    }
  };

  const handleSupervisorSubmitFeedback = async (isMarkComplete: boolean = false) => {
    if (!feedbackAssignment) return;
    setSubmittingFeedback(true);

    try {
      if (isMarkComplete) {
        db.markWorkComplete(feedbackAssignment.id, 'Supervisor');
      } else {
        db.updateWorkerProgress(
          feedbackAssignment.id,
          addedQty,
          'Supervisor',
          feedbackNote
        );
      }

      // Sync with backend API
      await fetch('/api/worker/my-work', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isMarkComplete ? 'mark_complete' : 'update_qty',
          assignmentId: feedbackAssignment.id,
          addedQty: isMarkComplete ? 0 : addedQty,
          notes: feedbackNote,
        }),
      });

      alert(
        isMarkComplete
          ? 'Work marked as Complete & sent for Quality Checking!'
          : `Added ${addedQty} pcs floor feedback for ${feedbackAssignment.worker_name}!`
      );
      setFeedbackAssignment(null);
      setAddedQty(1);
      setFeedbackNote('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to submit floor feedback.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight">
            Production & Floor Feedback Management
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Supervisors assign order glass items and log shop-floor progress feedback for line workers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CREATE WORK ASSIGNMENT FORM */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border-2 border-primary/40 shadow-sm space-y-4">
          <div className="border-b border-outline-variant/30 pb-3 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-extrabold text-on-surface">
              Assign Line Task
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

            {/* SELECT SHIFT SUPERVISOR */}
            <div>
              <label className="block font-bold text-secondary mb-1">
                Select Shift Supervisor *
              </label>
              <select
                value={selectedWorkerId}
                onChange={(e) => setSelectedWorkerId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
              >
                <option value="">-- Choose Shift Supervisor --</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.line_assigned || 'Shift Supervisor'})
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

        {/* ACTIVE WORK ASSIGNMENTS LIST WITH SUPERVISOR FEEDBACK ACTIONS */}
        <div className="lg:col-span-2 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
          <div className="border-b border-outline-variant/30 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-on-surface">
                Shop Floor Production Lines & Assignments
              </h3>
              <p className="text-xs text-secondary">
                Click "Submit Feedback" to update finished piece counts for any line.
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
              {assignments.length} assignments
            </span>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {assignments.length === 0 ? (
              <p className="text-xs text-secondary py-8 text-center">
                No active work assignments yet.
              </p>
            ) : (
              assignments.map((asgn) => {
                const pct =
                  asgn.required_qty > 0
                    ? Math.round((asgn.completed_qty / asgn.required_qty) * 100)
                    : 0;
                const remain = asgn.required_qty - asgn.completed_qty;

                return (
                  <div
                    key={asgn.id}
                    className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-low/40 space-y-3"
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
                          Line Worker: <strong className="text-primary">{asgn.worker_name}</strong>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-extrabold text-sm text-on-surface block">
                          {asgn.completed_qty} / {asgn.required_qty} pcs
                        </span>
                        <span className="text-[10px] text-secondary font-mono">
                          Remaining: {remain} pcs
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

                    {/* SUPERVISOR & OWNER ACTION BUTTONS */}
                    <div className="pt-1 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          if (confirm(`Delete assignment for ${asgn.item_name}?`)) {
                            db.deleteAssignment(asgn.id);
                            fetch(`/api/orders/assign/${asgn.id}`, { method: 'DELETE' }).catch(() => {});
                            onRefresh();
                          }
                        }}
                        className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-extrabold text-xs rounded-lg transition-all flex items-center gap-1 active:scale-95"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>

                      {asgn.status !== 'Approved' && (
                        <button
                          onClick={() => {
                            setFeedbackAssignment(asgn);
                            setAddedQty(1);
                            setFeedbackNote('');
                          }}
                          className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded-lg shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                        >
                          <Factory className="w-3.5 h-3.5" />
                          <span>⚡ Send Floor Progress Feedback</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* SUPERVISOR FLOOR FEEDBACK MODAL */}
      {feedbackAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900 relative border-2 border-blue-500">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                  SUPERVISOR FLOOR FEEDBACK
                </span>
                <h3 className="font-black text-base mt-1 text-slate-950">
                  {feedbackAssignment.item_name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {feedbackAssignment.order_number} • Worker: <strong>{feedbackAssignment.worker_name}</strong>
                </p>
              </div>
              <button
                onClick={() => setFeedbackAssignment(null)}
                className="text-slate-400 hover:text-slate-700 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Current Counters */}
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-3 rounded-xl text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">REQUIRED</span>
                <span className="text-base font-black text-slate-900">{feedbackAssignment.required_qty}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">COMPLETED</span>
                <span className="text-base font-black text-blue-700">{feedbackAssignment.completed_qty}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">REMAINING</span>
                <span className="text-base font-black text-amber-600">
                  {feedbackAssignment.required_qty - feedbackAssignment.completed_qty}
                </span>
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Add Finished Pieces (Today's Shift):
              </label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[1, 5, 10, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setAddedQty(num)}
                    className={`py-2 text-xs font-black rounded-lg border transition-all ${
                      addedQty === num
                        ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    +{num} Pcs
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                max={feedbackAssignment.required_qty - feedbackAssignment.completed_qty}
                value={addedQty}
                onChange={(e) => setAddedQty(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 bg-slate-50 text-slate-900"
              />
            </div>

            {/* Floor Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Floor Supervisor Remarks / Notes:
              </label>
              <textarea
                rows={2}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="e.g. Cutting line completed 10 pcs, glass edge quality verified."
                className="w-full p-2.5 text-xs rounded-lg border border-slate-300 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600"
              ></textarea>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={submittingFeedback}
                onClick={() => handleSupervisorSubmitFeedback(false)}
                className="w-full py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                <span>Submit Progress (+{addedQty} Pcs)</span>
              </button>

              <button
                type="button"
                disabled={submittingFeedback}
                onClick={() => handleSupervisorSubmitFeedback(true)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Item Entirely Complete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
