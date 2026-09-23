'use client';

import React, { useState } from 'react';
import { User } from '@/lib/types';
import { useRouter } from 'next/navigation';
import {
  Factory,
  Search,
  Bell,
  Shield,
  HardHat,
  UserCheck,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRefresh: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  searchQuery,
  onSearchChange,
  onRefresh,
  onToggleMobileSidebar,
}) => {
  const router = useRouter();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const handleLogout = async () => {
    if (confirm('Log out from factory portal?')) {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant/40 px-3 md:px-4 py-2.5 flex items-center justify-between shadow-sm">
      {/* Brand & Mobile Menu Toggle */}
      <div className="flex items-center gap-2.5">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-secondary hover:text-on-surface hover:bg-surface-container rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="h-10 md:h-11 px-2 py-1 rounded-xl bg-white border border-slate-200 flex items-center shadow-sm overflow-hidden">
          <img
            src="/logo.jpg"
            alt="Ashapuri Tuff Logo"
            className="h-full w-auto object-contain"
          />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-black text-slate-950 text-base md:text-lg tracking-tight leading-none">
              Ashapuri Tuff
            </h1>
            <span className="text-[9px] md:text-[10px] font-mono font-black bg-amber-100 text-amber-900 border border-amber-300 px-1.5 py-0.5 rounded-full">
              PORTAL
            </span>
          </div>
          <p className="text-[9px] md:text-[10px] text-amber-700 font-extrabold uppercase tracking-wider mt-0.5">
            Strengthening Your Glass
          </p>
        </div>
      </div>

      {/* Global Search & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Bar */}
        <div className="relative hidden md:block w-64 lg:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Search Order #, Customer, Phone..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-surface-container border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-secondary font-medium"
          />
        </div>

        {/* LOGGED IN USER BADGE */}
        <div className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-surface-container border border-outline-variant/60 text-xs font-bold">
          {currentUser.role === 'owner' && <Shield className="w-4 h-4 text-amber-700" />}
          {currentUser.role === 'supervisor' && <UserCheck className="w-4 h-4 text-blue-700" />}
          {currentUser.role === 'worker' && <HardHat className="w-4 h-4 text-emerald-700" />}

          <div className="text-left hidden sm:block">
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
          className="p-1.5 sm:p-2 text-red-700 hover:bg-red-50 rounded-xl border border-red-200 transition-colors flex items-center gap-1 text-xs font-bold"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
