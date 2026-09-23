'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Flame,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Invalid email or password');
        setLoading(false);
        return;
      }

      window.location.href = '/';
    } catch (err: any) {
      setErrorMsg('Failed to connect to authentication server.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F4] text-slate-900 flex items-center justify-center p-4 lg:p-8 font-sans relative selection:bg-amber-500 selection:text-white">
      {/* Background Subtle Industrial Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* LEFT COLUMN: BRAND & INDUSTRIAL HERO */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold font-mono">
            <Flame className="w-4 h-4 text-amber-600 animate-pulse" />
            <span>Morbi-Rajkot Industrial Line 01 • Live</span>
          </div>

          <div className="space-y-3">
            <div className="bg-white p-3 rounded-2xl border-2 border-slate-200 shadow-md inline-block max-w-sm">
              <img
                src="/logo.jpg"
                alt="Ashapuri Tuff — Strengthening Your Glass"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-950 leading-none">
                Ashapuri Tuff
              </h1>
              <p className="text-xs font-mono font-black text-amber-700 tracking-wider uppercase">
                Strengthening Your Glass • Factory Portal
              </p>
            </div>

            <p className="text-slate-600 text-xs md:text-sm leading-relaxed pt-2 font-medium">
              Real-time digital shop-floor management for toughened glass processing, line worker assignment, quantity tracking, and quality dispatch.
            </p>
          </div>

          {/* Key System Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
                Shop Floor Ergonomics
              </span>
              <p className="text-xs font-extrabold text-slate-900">
                Oversized Touch Targets for Operators
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
                Security Architecture
              </span>
              <p className="text-xs font-extrabold text-amber-700">
                Strict Role JWT Cookie Auth
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CRISP WHITE LOGIN CARD */}
        <div className="lg:col-span-6">
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xl space-y-6 relative overflow-hidden">
            {/* Top Industrial Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-amber-600"></div>

            {/* Header */}
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Factory Portal Login
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Enter your registered credentials to access your portal.
              </p>
            </div>

            {/* ERROR BANNER */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CREDENTIAL FORM */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Email / Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikash@ashapurituff.com or supervisor1"
                    className="w-full pl-10 pr-4 py-3 text-xs font-mono font-semibold rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 text-xs font-mono font-bold rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-600/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 active:scale-98 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating Credentials...</span>
                ) : (
                  <>
                    <span>Sign In to Factory System</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* System Info */}
            <div className="pt-3 border-t border-slate-200 text-center text-[11px] font-mono text-slate-500">
              Ashapuri Tuff Industrial Portal • Morvi Glass Hub
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

