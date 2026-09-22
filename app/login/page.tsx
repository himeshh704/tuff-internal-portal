'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Factory,
  Lock,
  Mail,
  ShieldCheck,
  UserCheck,
  HardHat,
  AlertCircle,
  ArrowRight,
  Flame,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'credentials'>('quick');

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

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail, password: demoPass }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Quick login failed');
        setLoading(false);
        return;
      }

      window.location.href = '/';
    } catch (err: any) {
      setErrorMsg('Server connection error.');
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
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-600/30">
                <Factory className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-950 leading-none">
                  MA Ashapuri Tuff
                </h1>
                <p className="text-xs font-mono font-extrabold text-amber-700 tracking-wider uppercase mt-1">
                  Factory Order & Production Portal
                </p>
              </div>
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

            {/* Header & Tab Selector */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Factory Portal Login
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Select 1-tap role access or enter your login credentials.
                </p>
              </div>
            </div>

            {/* TAB SELECTOR */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('quick');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'quick'
                    ? 'bg-white text-slate-950 shadow-sm border border-slate-300 font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>⚡ 1-Tap Quick Access</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('credentials');
                  setErrorMsg('');
                }}
                className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'credentials'
                    ? 'bg-white text-slate-950 shadow-sm border border-slate-300 font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Password Login</span>
              </button>
            </div>

            {/* ERROR BANNER */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: QUICK ROLE LOGINS */}
            {activeTab === 'quick' && (
              <div className="space-y-3">
                <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider block font-mono">
                  Select Role to Sign In:
                </span>

                {/* OWNER QUICK LOGIN */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('owner@ashapurituff.com', 'admin123')}
                  className="w-full p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 hover:border-amber-500 hover:bg-amber-100/80 transition-all text-left flex items-center justify-between group active:scale-98 shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-amber-950">
                          Rajesh Patel (Owner)
                        </h3>
                        <span className="text-[10px] font-mono font-black bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                          FULL ADMIN
                        </span>
                      </div>
                      <p className="text-xs text-amber-800 font-medium">
                        All Orders, Production, Customers, Reports & User Management
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-amber-700 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* SUPERVISOR QUICK LOGIN */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('supervisor@ashapurituff.com', 'super123')}
                  className="w-full p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-100/80 transition-all text-left flex items-center justify-between group active:scale-98 shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-blue-950">
                          Vikram Singh (Supervisor)
                        </h3>
                        <span className="text-[10px] font-mono font-black bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                          SHIFT A
                        </span>
                      </div>
                      <p className="text-xs text-blue-800 font-medium">
                        Assign Floor Workers, Approve Work & Dispatch
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-700 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* WORKER QUICK LOGIN */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('rahul@ashapurituff.com', 'worker123')}
                  className="w-full p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-100/80 transition-all text-left flex items-center justify-between group active:scale-98 shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-sm text-emerald-950">
                          Rahul Sharma (Floor Worker)
                        </h3>
                        <span className="text-[10px] font-mono font-black bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
                          CUTTING LINE
                        </span>
                      </div>
                      <p className="text-xs text-emerald-800 font-medium">
                        Locked to My Work Touch Interface
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-emerald-700 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* TAB 2: CREDENTIAL FORM */}
            {activeTab === 'credentials' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@ashapurituff.com"
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
            )}

            {/* Footer Credentials Reminder */}
            <div className="pt-2 border-t border-slate-200 text-center text-[11px] font-mono text-slate-500">
              Default Owner: <strong className="text-slate-800">owner@ashapurituff.com</strong> / Password: <strong className="text-slate-800">admin123</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
