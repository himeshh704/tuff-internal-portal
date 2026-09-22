'use client';

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { User, UserRole } from '@/lib/types';
import {
  Shield,
  HardHat,
  Phone,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  Lock,
  Mail,
  CheckCircle2,
  AlertTriangle,
  X,
  RefreshCw,
} from 'lucide-react';

interface SettingsViewProps {
  onRefresh?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRefresh }) => {
  const [users, setUsers] = useState<User[]>(db.getUsers());
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('worker');
  const [lineAssigned, setLineAssigned] = useState('Cutting Line 1');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('worker123');

  const refreshUsers = () => {
    const updatedUsers = db.getUsers();
    setUsers([...updatedUsers]);
    if (onRefresh) onRefresh();
  };

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setName('');
    setPhone('+91 98250 ');
    setRole('worker');
    setLineAssigned('Cutting Line 1');
    setEmail('');
    setPassword('worker123');
    setIsAddUserOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setPhone(u.phone);
    setRole(u.role);
    setLineAssigned(u.line_assigned || '');
    setEmail(u.name.toLowerCase().replace(/\s+/g, '') + '@ashapurituff.com');
    setPassword('worker123');
    setIsAddUserOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      alert('Please fill in Name and Phone Number');
      return;
    }

    try {
      if (editingUser) {
        db.updateUser(editingUser.id, {
          name,
          phone,
          role,
          line_assigned: lineAssigned,
        });

        // Sync to server API
        fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingUser.id,
            name,
            phone,
            role,
            password,
            line_assigned: lineAssigned,
          }),
        }).catch(() => {});

        alert(`Personnel credentials for ${name} updated successfully!`);
      } else {
        const newUser = db.addUser({
          name,
          phone,
          role,
          line_assigned: lineAssigned,
        });

        const userEmail = email || `${name.toLowerCase().replace(/\s+/g, '')}@ashapurituff.com`;

        // Sync to server API
        fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email: userEmail,
            password,
            role,
            phone,
            line_assigned: lineAssigned,
          }),
        }).catch(() => {});

        alert(`New ${role} account created for ${name}! Password: ${password}`);
      }

      setIsAddUserOpen(false);
      refreshUsers();
    } catch (err: any) {
      alert(err.message || 'Error saving user credential');
    }
  };

  const handleDeleteUser = (u: User) => {
    if (confirm(`Are you sure you want to delete worker account for ${u.name}?`)) {
      db.deleteUser(u.id);

      fetch(`/api/users?id=${u.id}`, {
        method: 'DELETE',
      }).catch(() => {});

      refreshUsers();
    }
  };

  const handleResetDataToZero = () => {
    if (
      confirm(
        'WARNING: Are you sure you want to CLEAR ALL orders, work assignments, and logs to 0? This cannot be undone.'
      )
    ) {
      db.resetToDefault();
      refreshUsers();
      alert('Factory database reset to 0 orders!');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-on-surface tracking-tight">
            Factory Personnel & User Credential Management
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Add floor workers, update user credentials, manage role permissions, and system settings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Add Worker / Personnel</span>
          </button>
        </div>
      </div>

      {/* FACTORY PROFILE */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
        <h3 className="text-xs font-extrabold text-on-surface uppercase tracking-wider border-b border-outline-variant/30 pb-2">
          Factory System & Line Specifications
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-medium">
          <div>
            <label className="block text-secondary font-bold mb-1">Factory Portal Name</label>
            <input
              type="text"
              readOnly
              value="MA Ashapuri Tuff — Factory Portal"
              className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
            />
          </div>

          <div>
            <label className="block text-secondary font-bold mb-1">Active Production Shift</label>
            <input
              type="text"
              readOnly
              value="SHIFT A (08:00 - 16:00) • Line 01"
              className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
            />
          </div>

          <div>
            <label className="block text-secondary font-bold mb-1">Auto Order Prefix</label>
            <input
              type="text"
              readOnly
              value="MAT-2026-"
              className="w-full px-3 py-2 text-xs font-mono font-extrabold text-amber-900 rounded-lg bg-amber-50 border border-amber-300"
            />
          </div>
        </div>
      </div>

      {/* WORKERS & USER CREDENTIAL DIRECTORY */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
          <h3 className="text-xs font-extrabold text-on-surface uppercase tracking-wider">
            Registered Personnel & Credential Management
          </h3>
          <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded border border-amber-300">
            {users.length} Users Enrolled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-4 rounded-xl border-2 border-outline-variant/40 bg-surface-container-lowest hover:border-amber-400 transition-colors flex items-center justify-between gap-3 text-xs shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shadow-sm ${
                    u.role === 'owner'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : u.role === 'supervisor'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                  }`}
                >
                  {u.role === 'owner' ? (
                    <Shield className="w-5 h-5 text-amber-800" />
                  ) : (
                    <HardHat className="w-5 h-5 text-emerald-800" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-sm text-on-surface">{u.name}</h4>
                    <span
                      className={`text-[9px] uppercase font-extrabold px-2 py-0.2 rounded border ${
                        u.role === 'owner'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : u.role === 'supervisor'
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>
                  <p className="text-secondary font-mono text-[11px] mt-0.5">{u.phone}</p>
                  {u.line_assigned && (
                    <p className="text-[10px] text-amber-800 font-mono font-bold mt-0.5">
                      📍 {u.line_assigned}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleOpenEditModal(u)}
                  title="Edit Personnel Credentials"
                  className="p-1.5 rounded-lg border border-outline-variant/60 bg-surface-container hover:bg-amber-100 hover:text-amber-900 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                {u.role !== 'owner' && (
                  <button
                    onClick={() => handleDeleteUser(u)}
                    title="Delete Personnel Account"
                    className="p-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DANGER ZONE: DATA RESET */}
      <div className="bg-red-50 border border-red-200 p-5 rounded-xl space-y-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-700" />
          <h3 className="text-xs font-extrabold text-red-900 uppercase tracking-wider">
            Factory System Reset
          </h3>
        </div>
        <p className="text-xs text-red-800">
          Reset orders and production tracking back to 0. Master registered personnel accounts will remain intact.
        </p>
        <button
          onClick={handleResetDataToZero}
          className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-extrabold rounded-lg text-xs shadow-sm flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reset All Order Data to 0</span>
        </button>
      </div>

      {/* ADD / EDIT USER CREDENTIAL MODAL */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-surface-container-low px-5 py-4 border-b border-outline-variant/40 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-on-surface">
                {editingUser ? 'Edit Personnel Credentials' : 'Add New Factory Worker / User'}
              </h3>
              <button
                onClick={() => setIsAddUserOpen(false)}
                className="p-1 text-secondary hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-5 space-y-4 text-xs font-medium">
              <div>
                <label className="block text-secondary font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Harish Parmar"
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-secondary font-bold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98250 12345"
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
                  />
                </div>

                <div>
                  <label className="block text-secondary font-bold mb-1">Role Permission *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
                  >
                    <option value="worker">Worker (Shop Floor)</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="owner">Owner / Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-secondary font-bold mb-1">Assigned Floor Line</label>
                <input
                  type="text"
                  value={lineAssigned}
                  onChange={(e) => setLineAssigned(e.target.value)}
                  placeholder="e.g. Cutting Line 1 / Tempering Line"
                  className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
                />
              </div>

              <div>
                <label className="block text-secondary font-bold mb-1">Login Password *</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="worker123"
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg bg-surface-container-low border border-outline-variant/60 text-on-surface"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="px-4 py-2 rounded-lg border border-outline-variant/60 text-secondary hover:bg-surface-container font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg shadow-sm"
                >
                  {editingUser ? 'Save Updates' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
