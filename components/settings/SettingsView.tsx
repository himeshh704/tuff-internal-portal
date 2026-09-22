'use client';

import React from 'react';
import { db, DEFAULT_USERS } from '@/lib/db';
import { Settings, Shield, HardHat, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const users = db.getUsers();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/40 shadow-sm">
        <h2 className="text-xl font-extrabold text-on-surface tracking-tight">
          Factory Settings & User Directory
        </h2>
        <p className="text-xs text-secondary mt-0.5">
          System parameters, shift lines, and role configurations.
        </p>
      </div>

      {/* FACTORY INFORMATION */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-on-surface uppercase tracking-wider border-b border-outline-variant/30 pb-2">
          Factory Profile & Shift Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
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
        </div>
      </div>

      {/* WORKERS & USER ROLES LIST */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
        <h3 className="text-sm font-extrabold text-on-surface uppercase tracking-wider border-b border-outline-variant/30 pb-2">
          Factory Registered Personnel & Roles
        </h3>

        <div className="space-y-3">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-3.5 rounded-xl border border-outline-variant/40 bg-surface-container-low/40 flex items-center justify-between gap-4 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {u.role === 'owner' ? (
                    <Shield className="w-5 h-5 text-amber-700" />
                  ) : (
                    <HardHat className="w-5 h-5 text-emerald-700" />
                  )}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-on-surface">{u.name}</h4>
                  <span className="text-secondary font-mono text-[11px]">{u.phone}</span>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`text-[10px] uppercase font-extrabold px-2.5 py-1 rounded-full border ${
                    u.role === 'owner'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : u.role === 'supervisor'
                      ? 'bg-blue-100 text-blue-900 border-blue-300'
                      : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                >
                  {u.role}
                </span>
                {u.line_assigned && (
                  <p className="text-[10px] text-secondary font-mono mt-1">
                    {u.line_assigned}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
