'use client';

import React, { useState } from 'react';
import { User, UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  Factory,
  Search,
  Bell,
  RotateCcw,
  CheckCircle2,
  Shield,
  HardHat,
  UserCheck,
  LogOut,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  onRefresh,
}) => {
  const router = useRouter();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const handleLogout = async () => {
    if (confirm('Log out from factory portal?')) {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant/40 px-4 py-3 flex items-center justify-between shadow-sm">
      {/* Brand & Factory Emblem */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold shadow-sm">
          <Factory className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-on-surface text-lg tracking-tight leading-tight">
              MA Ashapuri Tuff
            </h1>
            <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
              FACTORY PORTAL
            </span>
          </div>
          <p className="text-xs text-secondary flex items-center gap-1.5 font-medium mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Floor Line 01 • Active Shift A (08:00 - 16:00)
          </p>
        </div>
      </div>

      {/* Global Search & Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search Order #, Customer, Phone, Worker..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-surface-container border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-secondary font-medium"
          />
        </div>

        {/* LOGGED IN USER BADGE */}
        <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-surface-container border border-outline-variant/60 text-xs font-bold">
          {currentUser.role === 'owner' && <Shield className="w-4 h-4 text-amber-700" />}
          {currentUser.role === 'supervisor' && <UserCheck className="w-4 h-4 text-blue-700" />}
          {currentUser.role === 'worker' && <HardHat className="w-4 h-4 text-emerald-700" />}

          <div className="text-left">
            <span className="block text-[9px] text-secondary font-semibold uppercase leading-none">
              {currentUser.role}
            </span>
            <span className="block text-on-surface font-extrabold leading-tight">
              {currentUser.name}
            </span>
          </div>
        </div>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 text-red-700 hover:bg-red-50 rounded-xl border border-red-200 transition-colors flex items-center gap-1 text-xs font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
