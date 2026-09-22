'use client';

import React from 'react';
import { WorkAssignment, User } from '@/lib/types';
import { CheckCircle2, HardHat } from 'lucide-react';

interface WorkerCompletedProps {
  worker: User;
  assignments: WorkAssignment[];
}

export const WorkerCompleted: React.FC<WorkerCompletedProps> = ({
  worker,
  assignments,
}) => {
  const completedAssignments = assignments.filter(
    (a) => a.worker_id === worker.id && (a.status === 'Approved' || a.completed_qty >= a.required_qty)
  );

  return (
    <div className="max-w-md mx-auto space-y-4 pb-12">
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-on-surface leading-tight">
              Completed Tasks
            </h2>
            <p className="text-xs text-secondary font-bold">
              History of finished work assignments
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-extrabold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-md border border-emerald-300">
          {completedAssignments.length} Done
        </span>
      </div>

      <div className="space-y-3">
        {completedAssignments.length === 0 ? (
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/40 text-center space-y-1">
            <p className="text-xs text-secondary">
              No completed work tasks recorded yet.
            </p>
          </div>
        ) : (
          completedAssignments.map((asgn) => (
            <div
              key={asgn.id}
              className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-mono font-bold text-tertiary bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {asgn.order_number}
                  </span>
                  <h4 className="font-bold text-sm text-on-surface mt-1">
                    {asgn.customer_name}
                  </h4>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-0.5 rounded-full uppercase">
                  Approved / Completed
                </span>
              </div>

              <div className="text-xs space-y-1 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/30">
                <span className="font-bold text-on-surface block">
                  {asgn.item_name} ({asgn.dimensions})
                </span>
                <span className="font-mono text-secondary text-[11px] block">
                  Completed: {asgn.completed_qty} / {asgn.required_qty} pcs
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
