'use client';

import React, { useState } from 'react';
import { Customer, Order } from '@/lib/types';
import { db } from '@/lib/db';
import { Users, UserPlus, Phone, MapPin, Search, Package, Plus, X, MessageSquare, Trash2 } from 'lucide-react';
import { formatPhoneForWhatsApp, openWhatsApp } from '@/lib/whatsapp';

interface CustomersViewProps {
  customers: Customer[];
  orders: Order[];
  onRefresh: () => void;
  onSelectOrder: (order: Order) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  orders,
  onRefresh,
  onSelectOrder,
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCust, setSelectedCust] = useState<Customer | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please fill Name and Phone number');
      return;
    }

    db.addCustomer(name, phone, address, notes);
    alert('Customer record created successfully!');
    setShowAddModal(false);
    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight">
            Customer Directory
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Internal client records for order history and phone contacts.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-lg shadow hover:bg-amber-800 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Customer</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
        <input
          type="text"
          placeholder="Search customer name, phone, or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-surface-container-lowest border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary text-on-surface font-medium"
        />
      </div>

      {/* CUSTOMER DIRECTORY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const custOrders = orders.filter((o) => o.customer_id === cust.id || o.customer_name === cust.name);

          return (
            <div
              key={cust.id}
              className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                  <h3 className="font-extrabold text-sm text-on-surface">{cust.name}</h3>
                  <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded">
                    {custOrders.length} Orders
                  </span>
                </div>

                <div className="space-y-1 text-xs text-secondary font-medium">
                  <p className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span className="font-mono text-on-surface font-bold">{cust.phone}</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{cust.address || 'No address specified'}</span>
                  </p>
                  {cust.notes && (
                    <p className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded border border-amber-200 mt-2">
                      {cust.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-outline-variant/30 flex items-center gap-2">
                <button
                  onClick={() => {
                    const cleanPhone = formatPhoneForWhatsApp(cust.phone);
                    openWhatsApp(`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(cust.name)}%2C%20greeting%20from%20Ashapuri%20Tuff%20Processing%20Unit.`);
                  }}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-xs rounded-lg border border-emerald-300 flex items-center gap-1 transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-700" />
                  <span>WhatsApp</span>
                </button>

                <button
                  onClick={() => setSelectedCust(cust)}
                  className="flex-1 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Package className="w-3.5 h-3.5 text-primary" />
                  <span>Orders ({custOrders.length})</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete customer "${cust.name}"?`)) {
                      db.deleteCustomer(cust.id);
                      fetch(`/api/customers/${cust.id}`, { method: 'DELETE' }).catch(() => {});
                      onRefresh();
                    }
                  }}
                  className="px-2 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-lg transition-all flex items-center gap-1"
                  title="Delete Customer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant/40 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-on-surface">Add Customer Record</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-secondary mb-1">Customer / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sharma Glass Works"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-secondary mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98250 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
                />
              </div>

              <div>
                <label className="block font-bold text-secondary mb-1">Address / Site Location</label>
                <input
                  type="text"
                  placeholder="Plot 42, GIDC Phase 2, Rajkot"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
                />
              </div>

              <div>
                <label className="block font-bold text-secondary mb-1">Internal Notes</label>
                <textarea
                  rows={2}
                  placeholder="Special instructions or preferences..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-bold rounded-lg border border-outline-variant/60 text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-extrabold rounded-lg bg-primary text-on-primary shadow-md"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOMER ORDER HISTORY MODAL */}
      {selectedCust && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-secondary uppercase block">
                  Customer History
                </span>
                <h3 className="text-sm font-extrabold text-on-surface">{selectedCust.name}</h3>
              </div>
              <button onClick={() => setSelectedCust(null)} className="p-1 rounded text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-96 overflow-y-auto">
              {orders
                .filter((o) => o.customer_id === selectedCust.id || o.customer_name === selectedCust.name)
                .map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      setSelectedCust(null);
                      onSelectOrder(ord);
                    }}
                    className="p-3 rounded-lg border border-outline-variant/40 hover:border-primary/60 bg-surface-container-low/40 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-xs text-tertiary bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {ord.order_number}
                      </span>
                      <p className="text-xs text-secondary font-mono mt-1">
                        Date: {ord.order_date} • {ord.items.length} items
                      </p>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full border bg-amber-50 text-amber-900 border-amber-300">
                      {ord.status}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
