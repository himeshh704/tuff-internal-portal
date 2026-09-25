'use client';

import React, { useState } from 'react';
import { Order } from '@/lib/types';
import { FileBarChart, Download, Printer, Calendar, FileSpreadsheet } from 'lucide-react';

interface ReportsViewProps {
  orders: Order[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ orders }) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    const yr = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    return `${yr}-${mo}`;
  });

  const filteredOrders = orders.filter((o) => {
    return o.order_date.startsWith(selectedMonth);
  });

  const getItemCompletedQty = (item: any, orderStatus: string) => {
    if (orderStatus === 'Completed' || orderStatus === 'Ready') {
      return Math.max(item.completed_qty || 0, item.required_qty);
    }
    return item.completed_qty || 0;
  };

  const totalRequired = filteredOrders.reduce(
    (acc, o) => acc + o.items.reduce((iAcc, item) => iAcc + item.required_qty, 0),
    0
  );

  const totalCompleted = filteredOrders.reduce(
    (acc, o) => acc + o.items.reduce((iAcc, item) => iAcc + getItemCompletedQty(item, o.status), 0),
    0
  );

  const handleExportCSV = () => {
    let csv = 'Order Number,Customer,Order Date,Expected Delivery,Items,Required Qty,Completed Qty,Workers,Status,Dispatch Date\n';

    filteredOrders.forEach((o) => {
      const itemsStr = o.items.map((i) => i.item_name).join('; ');
      const workersStr = o.items.map((i) => i.assigned_worker_name || 'Unassigned').join('; ');
      const req = o.items.reduce((acc, i) => acc + i.required_qty, 0);
      const comp = o.items.reduce((acc, i) => acc + getItemCompletedQty(i, o.status), 0);

      csv += `"${o.order_number}","${o.customer_name}","${o.order_date}","${o.expected_delivery}","${itemsStr}",${req},${comp},"${workersStr}","${o.status}","${o.dispatched_at || 'N/A'}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ashapuri_Tuff_Report_${selectedMonth}.csv`;
    a.click();
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight">
            Factory Production Reports
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Select a month to generate, view, and export production records.
          </p>
        </div>

        {/* Month Selector & Export Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-surface-container-low px-3 py-1.5 rounded-lg border border-outline-variant/60 text-xs font-bold">
            <Calendar className="w-4 h-4 text-primary" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-on-surface font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-3 py-2 bg-primary hover:bg-amber-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE REPORT SHEET */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/40 shadow-sm space-y-6 print:p-0 print:border-none">
        {/* Printable Header */}
        <div className="border-b border-outline-variant/40 pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-on-surface">ASHAPURI TUFF</h1>
            <p className="text-xs font-bold text-secondary">
              Internal Factory Order & Production Report
            </p>
            <p className="text-xs text-secondary font-mono mt-1">
              Month Period: <strong>{selectedMonth}</strong> • Generated:{' '}
              {new Date().toLocaleDateString()}
            </p>
          </div>

          <div className="text-right text-xs font-mono">
            <p className="font-extrabold text-on-surface">Total Orders: {filteredOrders.length}</p>
            <p className="text-primary font-bold">
              Total Required: {totalRequired} pcs • Completed: {totalCompleted} pcs
            </p>
          </div>
        </div>

        {/* REPORT TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/60 font-bold uppercase text-[10px] text-secondary">
                <th className="p-2.5">Order #</th>
                <th className="p-2.5">Customer</th>
                <th className="p-2.5">Order Date</th>
                <th className="p-2.5">Glass Item & Specs</th>
                <th className="p-2.5 text-center">Req / Completed</th>
                <th className="p-2.5">Assigned Worker</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Dispatch Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30 font-medium">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-secondary">
                    No order records found for month {selectedMonth}.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const req = ord.items.reduce((acc, i) => acc + i.required_qty, 0);
                  const comp = ord.items.reduce((acc, i) => acc + getItemCompletedQty(i, ord.status), 0);
                  const workersStr = Array.from(
                    new Set(ord.items.map((i) => i.assigned_worker_name).filter(Boolean))
                  ).join(', ');

                  return (
                    <tr key={ord.id} className="hover:bg-surface-container-low/40">
                      <td className="p-2.5 font-mono font-bold text-tertiary">
                        {ord.order_number}
                      </td>
                      <td className="p-2.5 font-bold text-on-surface">{ord.customer_name}</td>
                      <td className="p-2.5 font-mono text-secondary">{ord.order_date}</td>
                      <td className="p-2.5 max-w-xs">
                        {ord.items.map((i) => (
                          <div key={i.id} className="text-[11px]">
                            {i.item_name} ({i.dimensions})
                          </div>
                        ))}
                      </td>
                      <td className="p-2.5 text-center font-mono font-extrabold">
                        {comp} / {req} pcs
                      </td>
                      <td className="p-2.5 text-secondary">{workersStr || 'Unassigned'}</td>
                      <td className="p-2.5 font-bold">{ord.status}</td>
                      <td className="p-2.5 font-mono text-secondary">
                        {ord.dispatched_at
                          ? new Date(ord.dispatched_at).toLocaleDateString()
                          : 'N/A'}
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
