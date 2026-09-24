'use client';

import React, { useState } from 'react';
import { Customer, PriorityLevel } from '@/lib/types';
import { db } from '@/lib/db';
import {
  X,
  Plus,
  Trash2,
  Upload,
  FileText,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const customers = db.getCustomers();

  const [selectedCustId, setSelectedCustId] = useState<string>('');
  const [isNewCust, setIsNewCust] = useState<boolean>(false);

  // New Customer Fields
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');

  // Order Fields
  const [expectedDelivery, setExpectedDelivery] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [priority, setPriority] = useState<PriorityLevel>('Normal');
  const [notes, setNotes] = useState('');

  // File Upload State
  const [slipUrl, setSlipUrl] = useState<string>('');
  const [slipFileName, setSlipFileName] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);

  // Items
  const [items, setItems] = useState<
    {
      item_name: string;
      dimensions: string;
      thickness: string;
      required_qty: number;
    }[]
  >([
    {
      item_name: '',
      dimensions: '',
      thickness: '5mm',
      required_qty: 1,
    },
  ]);

  if (!isOpen) return null;

  const handleSelectCustomer = (id: string) => {
    setSelectedCustId(id);
    if (id === 'NEW') {
      setIsNewCust(true);
      setCustName('');
      setCustPhone('');
      setCustAddress('');
    } else {
      setIsNewCust(false);
      const c = customers.find((cust) => cust.id === id);
      if (c) {
        setCustName(c.name);
        setCustPhone(c.phone);
        setCustAddress(c.address);
      }
    }
  };

  const handleAddItemRow = () => {
    setItems([
      ...items,
      {
        item_name: '',
        dimensions: '',
        thickness: '5mm',
        required_qty: 1,
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  // REAL FILE UPLOAD HANDLER
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setSlipFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Fallback to local Base64 URL preview if API fails
        const reader = new FileReader();
        reader.onload = (event) => {
          setSlipUrl(event.target?.result as string);
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } else {
        setSlipUrl(data.url);
        setUploading(false);
      }
    } catch (err) {
      // Fallback to FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        setSlipUrl(event.target?.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveSlip = () => {
    setSlipUrl('');
    setSlipFileName('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let targetCustId = selectedCustId;
    let finalCustName = custName;
    let finalCustPhone = custPhone;

    if (isNewCust || !targetCustId) {
      if (!custName || !custPhone) {
        alert('Please enter Customer Name and Phone Number');
        return;
      }
      const newC = db.addCustomer(custName, custPhone, custAddress);
      targetCustId = newC.id;
      finalCustName = newC.name;
      finalCustPhone = newC.phone;
    }

    if (items.length === 0) {
      alert('Please add at least one glass item to the order');
      return;
    }

    const orderPayload = {
      customer_id: targetCustId,
      customer_name: finalCustName,
      customer_phone: finalCustPhone,
      expected_delivery: expectedDelivery,
      priority,
      notes,
      slip_url: slipUrl,
      items,
    };

    // Save to local reactive store
    const createdOrder = db.createOrder(orderPayload);

    // Sync to server API in background with exact created order object
    fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createdOrder),
    }).catch((err) => console.error('Server sync error:', err));

    onOrderCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-surface-container-low px-6 py-4 border-b border-outline-variant/40 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest block">
              Order Processing Form
            </span>
            <h3 className="text-lg font-extrabold text-on-surface tracking-tight">
              Create New Factory Order
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container text-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* SECTION 1: CUSTOMER DETAILS */}
          <div className="space-y-3 bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/30">
            <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wider">
              1. Customer Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">
                  Select Customer
                </label>
                <select
                  value={selectedCustId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-surface-container-lowest border border-outline-variant/60 focus:ring-2 focus:ring-primary text-on-surface"
                >
                  <option value="">-- Choose Existing Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                  <option value="NEW">+ Add New Customer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+91 98250 XXXXX"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold font-mono rounded-lg bg-surface-container-lowest border border-outline-variant/60 focus:ring-2 focus:ring-primary text-on-surface"
                />
              </div>
            </div>

            {(isNewCust || !selectedCustId) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharma Glass Works"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-surface-container-lowest border border-outline-variant/60 focus:ring-2 focus:ring-primary text-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary mb-1">
                    Address / Site Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Plot 42, GIDC Phase 2, Rajkot"
                    value={custAddress}
                    onChange={(e) => setCustAddress(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-surface-container-lowest border border-outline-variant/60 focus:ring-2 focus:ring-primary text-on-surface"
                  />
                </div>
              </div>
            )}
          </div>

          {/* SECTION 2: ORDER SCHEDULE & PRIORITY */}
          <div className="space-y-3 bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/30">
            <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wider">
              2. Order Schedule & Priority
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-secondary mb-1">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  required
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono font-semibold rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary mb-1">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High Priority</option>
                  <option value="Urgent">Urgent (Immediate Line Slot)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: GLASS ITEMS & SPECIFICATIONS */}
          <div className="space-y-3 bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/30">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wider">
                3. Glass Items & Specifications
              </h4>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container-lowest p-3 rounded-lg border border-outline-variant/40 space-y-3 relative"
                >
                  <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
                    <span className="text-[11px] font-bold text-secondary font-mono">
                      Item #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(idx)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-secondary mb-1">
                        Glass Type / Description *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 5mm Clear Toughened Glass"
                        value={item.item_name}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].item_name = e.target.value;
                          setItems(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-semibold rounded bg-surface-container-low border border-outline-variant/60 text-on-surface"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-secondary mb-1">
                        Dimensions (W × H mm) <span className="font-normal text-outline/70">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 914 × 1828 mm"
                        value={item.dimensions}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].dimensions = e.target.value;
                          setItems(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded bg-surface-container-low border border-outline-variant/60 text-on-surface"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-secondary mb-1">
                        Qty (Pcs) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.required_qty}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].required_qty = parseInt(e.target.value) || 1;
                          setItems(updated);
                        }}
                        className="w-full px-2.5 py-1.5 text-xs font-mono font-extrabold rounded bg-surface-container-low border border-outline-variant/60 text-on-surface"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: REAL ORDER SLIP UPLOAD & NOTES */}
          <div className="space-y-3 bg-surface-container-low/40 p-4 rounded-xl border border-outline-variant/30">
            <h4 className="text-xs font-extrabold text-on-surface uppercase tracking-wider">
              4. Original Order Slip File Attachment & Notes
            </h4>

            <div>
              <label className="block text-xs font-bold text-secondary mb-1">
                Attach Original Order Slip (Photo / PDF)
              </label>

              {!slipUrl ? (
                <div className="relative border-2 border-dashed border-outline-variant/80 hover:border-primary rounded-xl p-4 text-center bg-surface-container-lowest transition-colors">
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-1">
                    {uploading ? (
                      <Loader2 className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-primary" />
                    )}
                    <span className="text-xs font-bold text-on-surface">
                      {uploading ? 'Uploading slip...' : 'Click or drop order slip image / PDF here'}
                    </span>
                    <span className="text-[10px] text-secondary font-mono">
                      PNG, JPG, WEBP, or PDF up to 10MB
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-surface-container-lowest border border-outline-variant/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-mono font-bold text-on-surface truncate">
                        {slipFileName || 'Uploaded Order Slip'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveSlip}
                      className="text-red-600 hover:text-red-800 p-1 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>

                  {/* Thumbnail Preview */}
                  {slipUrl.startsWith('data:image') || slipUrl.endsWith('.jpg') || slipUrl.endsWith('.png') || slipUrl.startsWith('/uploads/') ? (
                    <div className="w-full h-32 rounded-lg overflow-hidden border border-outline-variant/40 bg-black/5 relative group">
                      <img
                        src={slipUrl}
                        alt="Slip Preview"
                        className="w-full h-full object-cover"
                      />
                      <a
                        href={slipUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold gap-1 transition-opacity"
                      >
                        <ExternalLink className="w-4 h-4" /> Open Full Image
                      </a>
                    </div>
                  ) : (
                    <div className="p-2 bg-emerald-50 text-emerald-900 rounded text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>Document Attached Successfully</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary mb-1">
                Factory Production Notes
              </label>
              <textarea
                rows={2}
                placeholder="Add special edge grinding, hole drilling, or handling instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-on-surface"
              ></textarea>
            </div>
          </div>

          {/* FOOTER ACTIONS */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-outline-variant/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-outline-variant/60 text-secondary hover:bg-surface-container font-bold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-amber-800 font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
