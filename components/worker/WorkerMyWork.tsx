'use client';

import React, { useState } from 'react';
import { WorkAssignment, User } from '@/lib/types';
import { db } from '@/lib/db';
import { HardHat, PlusCircle, CheckCircle2, AlertCircle, X, ShieldAlert, Paperclip, FileText, ExternalLink } from 'lucide-react';

interface WorkerMyWorkProps {
  worker: User;
  assignments: WorkAssignment[];
  onRefresh: () => void;
}

export const WorkerMyWork: React.FC<WorkerMyWorkProps> = ({
  worker,
  assignments,
  onRefresh,
}) => {
  const [activeAssignment, setActiveAssignment] = useState<WorkAssignment | null>(null);
  const [activeSlipUrl, setActiveSlipUrl] = useState<string | null>(null);
  const [addQty, setAddQty] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const workerAssignments = assignments.filter(
    (a) =>
      (a.worker_id === worker.id ||
        a.worker_name.toLowerCase().trim() === worker.name.toLowerCase().trim()) &&
      a.status !== 'Approved'
  );

  const handleOpenUpdateModal = (asgn: WorkAssignment) => {
    setActiveAssignment(asgn);
    setAddQty(1);
    setNote('');
    setErrorMsg('');
  };

  const handleSaveProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment) return;

    try {
      db.updateWorkerProgress(
        activeAssignment.id,
        addQty,
        worker.name,
        note
      );
      setActiveAssignment(null);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating progress');
    }
  };

  const handleMarkComplete = (asgnId: string) => {
    if (confirm('Mark this assigned work as complete and send for checking?')) {
      try {
        db.markWorkComplete(asgnId, worker.name);
        alert('Work marked complete! Sent to Owner for checking.');
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Error marking complete');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12">
      {/* Worker Header Card */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <HardHat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-on-surface leading-tight">
              {worker.name}
            </h2>
            <p className="text-xs text-secondary font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {worker.line_assigned || 'Floor Line 1'} • Active Shift
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-extrabold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md border border-amber-300">
          {workerAssignments.length} Jobs
        </span>
      </div>

      {/* Active Work Cards */}
      <div className="space-y-4">
        {workerAssignments.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/40 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="font-extrabold text-on-surface text-base">
              No Pending Work!
            </h3>
            <p className="text-xs text-secondary">
              All assigned work items have been updated or completed. Check back when supervisor assigns new glass sheets.
            </p>
          </div>
        ) : (
          workerAssignments.map((asgn) => {
            const remaining = asgn.required_qty - asgn.completed_qty;
            const pct =
              asgn.required_qty > 0
                ? Math.round((asgn.completed_qty / asgn.required_qty) * 100)
                : 0;

            const isPendingChecking = asgn.status === 'Needs Checking';

            return (
              <div
                key={asgn.id}
                className="bg-surface-container-lowest border-2 border-outline-variant/60 rounded-2xl p-4 shadow-sm space-y-4 relative"
              >
                {/* Status Header */}
                <div className="flex justify-between items-start border-b border-outline-variant/30 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-secondary uppercase block tracking-wider">
                      CLIENT ORDER
                    </span>
                    <h3 className="text-lg font-extrabold text-on-surface tracking-tight leading-snug">
                      {asgn.customer_name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs font-mono font-bold text-tertiary bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {asgn.order_number}
                      </span>
                      {asgn.slip_url && (
                        <button
                          onClick={() => setActiveSlipUrl(asgn.slip_url || null)}
                          className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded text-xs border border-amber-300 flex items-center gap-1"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-amber-800" />
                          <span>View Paper Slip / Drawing</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase border ${
                      asgn.status === 'Rework'
                        ? 'bg-red-100 text-red-900 border-red-300'
                        : isPendingChecking
                        ? 'bg-purple-100 text-purple-900 border-purple-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    {asgn.status}
                  </span>
                </div>

                {/* Glass Item & Dimensions Specification */}
                <div className="bg-surface-container/60 p-3 rounded-xl border border-outline-variant/40">
                  <span className="text-[10px] font-bold text-secondary block uppercase tracking-wider mb-0.5">
                    ITEM & DIMENSIONS
                  </span>
                  <div className="text-sm font-mono font-extrabold text-on-surface flex items-center gap-1.5">
                    {asgn.item_name} ({asgn.dimensions})
                  </div>
                </div>

                {/* Big 3 Metrics (Visible from 2ft away) */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-surface-bright border border-outline-variant/40 p-2.5 rounded-xl">
                    <span className="text-[10px] font-bold text-secondary block">
                      REQUIRED
                    </span>
                    <span className="text-2xl font-extrabold font-mono text-on-surface leading-tight block mt-0.5">
                      {asgn.required_qty}
                    </span>
                    <span className="text-[10px] text-secondary font-mono">pcs</span>
                  </div>

                  <div className="bg-amber-50 border-2 border-primary/40 p-2.5 rounded-xl">
                    <span className="text-[10px] font-extrabold text-amber-900 block">
                      DONE
                    </span>
                    <span className="text-2xl font-extrabold font-mono text-amber-900 leading-tight block mt-0.5">
                      {asgn.completed_qty}
                    </span>
                    <span className="text-[10px] font-bold text-amber-900 font-mono">pcs</span>
                  </div>

                  <div className="bg-surface-bright border border-outline-variant/40 p-2.5 rounded-xl">
                    <span className="text-[10px] font-bold text-secondary block">
                      REMAIN
                    </span>
                    <span className="text-2xl font-extrabold font-mono text-on-surface leading-tight block mt-0.5">
                      {remaining}
                    </span>
                    <span className="text-[10px] text-secondary font-mono">pcs</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary font-bold">Progress</span>
                    <span className="text-primary font-mono font-extrabold">
                      {pct}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden p-0.5 border border-outline-variant/30">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>

                {/* Shop Floor Action Buttons */}
                {!isPendingChecking ? (
                  <div className="space-y-2 pt-1">
                    <button
                      onClick={() => handleOpenUpdateModal(asgn)}
                      className="w-full h-14 rounded-xl bg-primary text-on-primary font-extrabold text-base flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all border-b-4 border-amber-900"
                    >
                      <PlusCircle className="w-6 h-6" />
                      <span>+ Update Quantity</span>
                    </button>

                    {asgn.completed_qty > 0 && (
                      <button
                        onClick={() => handleMarkComplete(asgn.id)}
                        className="w-full h-12 rounded-xl bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow hover:bg-emerald-700 active:scale-95 transition-all border-b-4 border-emerald-800"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        <span>Mark Work Complete</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-purple-50 border border-purple-300 rounded-xl text-center">
                    <p className="text-xs font-extrabold text-purple-900">
                      Sent for Checking — Pending Owner Approval
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* UPDATE QUANTITY MODAL / KEYPAD */}
      {activeAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in slide-in-from-bottom">
            <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-amber-800 uppercase block">
                  {activeAssignment.order_number}
                </span>
                <h3 className="text-sm font-extrabold text-on-surface">
                  Update Completed Quantity
                </h3>
              </div>
              <button
                onClick={() => setActiveAssignment(null)}
                className="p-1 rounded hover:bg-surface-container text-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProgress} className="p-5 space-y-4">
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-950 font-medium">
                Currently Completed: <strong>{activeAssignment.completed_qty}</strong> /{' '}
                {activeAssignment.required_qty} pcs
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-100 text-red-900 rounded-lg text-xs font-bold border border-red-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-on-surface mb-2">
                  Enter Newly Completed Pieces:
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAddQty(Math.max(1, addQty - 1))}
                    className="w-12 h-12 rounded-xl bg-surface-container font-extrabold text-xl text-on-surface border border-outline-variant/60 active:scale-95"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={activeAssignment.required_qty - activeAssignment.completed_qty}
                    required
                    value={addQty}
                    onChange={(e) => setAddQty(parseInt(e.target.value) || 1)}
                    className="w-full text-center h-12 text-2xl font-mono font-extrabold rounded-xl bg-surface-container-low border-2 border-primary text-on-surface focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setAddQty(addQty + 1)}
                    className="w-12 h-12 rounded-xl bg-surface-container font-extrabold text-xl text-on-surface border border-outline-variant/60 active:scale-95"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Quick Stepper Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[1, 5, 10, 20].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setAddQty(num)}
                    className="py-2 bg-surface-container hover:bg-surface-container-high text-xs font-extrabold text-on-surface rounded-lg border border-outline-variant/40"
                  >
                    +{num}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-12 bg-primary text-on-primary font-extrabold text-sm rounded-xl shadow-md hover:bg-amber-800 active:scale-95 transition-all"
                >
                  Save Progress
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ORDER SLIP VIEW MODAL FOR WORKERS */}
      {activeSlipUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                <h3 className="font-extrabold text-sm">Original Paper Order Slip / Drawing</h3>
              </div>
              <button
                onClick={() => setActiveSlipUrl(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto flex items-center justify-center bg-black/50 rounded-xl p-2">
              {activeSlipUrl.startsWith('data:image') ||
              activeSlipUrl.match(/\.(jpg|jpeg|png|webp|gif)($|\?)/i) ||
              activeSlipUrl.startsWith('/uploads/') ||
              activeSlipUrl.startsWith('http') ? (
                <img
                  src={activeSlipUrl}
                  alt="Order Slip"
                  className="max-h-[65vh] w-auto object-contain rounded"
                />
              ) : (
                <div className="p-6 text-center text-white space-y-3">
                  <FileText className="w-12 h-12 text-amber-500 mx-auto" />
                  <p className="font-bold text-sm">PDF / Document Attached</p>
                  <a
                    href={activeSlipUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs"
                  >
                    Open Document Link
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-2 text-xs">
              <a
                href={activeSlipUrl}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <ExternalLink className="w-4 h-4" /> Open Full Image in New Tab
              </a>
              <button
                onClick={() => setActiveSlipUrl(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
