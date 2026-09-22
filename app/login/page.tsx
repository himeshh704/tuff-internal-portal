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
  Sparkles,
  CheckCircle2,
  Flame,
  Layers,
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
        setErrorMsg(data.error || 'Invalid credentials');
        setLoading(false);
        return;
      }

      // Hard redirect to root page ensuring cookie is attached to HTTP headers
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
    <div className="min-h-screen bg-[#070d18] text-white flex items-center justify-center p-4 lg:p-8 font-sans relative overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* Background Industrial Grid & Glow Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* LEFT COLUMN: BRAND HERO & INDUSTRIAL SPECS */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono">
            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Morbi-Rajkot Industrial Line 01 • Active</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-black flex items-center justify-center font-black text-2xl shadow-xl shadow-amber-500/20">
                <Factory className="w-7 h-7 text-black" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-white leading-none">
                  MA Ashapuri Tuff
                </h1>
                <p className="text-xs font-mono font-bold text-amber-500 tracking-wider uppercase mt-1">
                  Factory Order & Production System
                </p>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed pt-2">
              High-utility digital shop-floor portal for toughened glass processing, line worker assignment, real-time quantity tracking, and quality dispatch.
            </p>
          </div>

          {/* Industrial Features List */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Order Workflow
              </span>
              <p className="text-xs font-extrabold text-white">
                New → Production → Checking → Dispatch
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">
                Shop Floor Ergonomics
              </span>
              <p className="text-xs font-extrabold text-amber-400">
                Large Tactile Touch Targets
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PREMIUM LOGIN CARD */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl backdrop-blur-xl space-y-6 relative overflow-hidden">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-blue-600"></div>

            {/* Header & Tab Selector */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  Portal Login
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your login mode to proceed
                </p>
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
                <button
                  onClick={() => setActiveTab('quick')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'quick'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Quick Roles
                </button>
                <button
                  onClick={() => setActiveTab('credentials')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'credentials'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Credentials
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 bg-red-950/80 border border-red-700/60 text-red-200 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: QUICK TAP ROLE ACCOUNTS */}
            {activeTab === 'quick' && (
              <div className="space-y-3">
                <p className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider">
                  Tap Any Role to Log In Instantly:
                </p>

                {/* Owner Login */}
                <button
                  onClick={() =>
                    handleQuickLogin('owner@ashapurituff.com', 'admin123')
                  }
                  disabled={loading}
                  className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/60 text-left transition-all group flex items-center justify-between active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white group-hover:text-amber-400 transition-colors">
                          Rajesh Patel
                        </span>
                        <span className="text-[10px] font-bold font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                          OWNER / ADMIN
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 block mt-0.5">
                        owner@ashapurituff.com
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Supervisor Login */}
                <button
                  onClick={() =>
                    handleQuickLogin('supervisor@ashapurituff.com', 'super123')
                  }
                  disabled={loading}
                  className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/60 text-left transition-all group flex items-center justify-between active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/40 flex items-center justify-center font-bold">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white group-hover:text-blue-400 transition-colors">
                          Vikram Singh
                        </span>
                        <span className="text-[10px] font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                          SUPERVISOR
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 block mt-0.5">
                        supervisor@ashapurituff.com
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Worker Rahul Login */}
                <button
                  onClick={() =>
                    handleQuickLogin('rahul@ashapurituff.com', 'worker123')
                  }
                  disabled={loading}
                  className="w-full p-4 rounded-2xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/60 text-left transition-all group flex items-center justify-between active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                      <HardHat className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-white group-hover:text-emerald-400 transition-colors">
                          Rahul Sharma
                        </span>
                        <span className="text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                          WORKER • CUTTING
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 block mt-0.5">
                        rahul@ashapurituff.com
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </button>
              </div>
            )}

            {/* TAB 2: MANUAL EMAIL & PASSWORD FORM */}
            {activeTab === 'credentials' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="owner@ashapurituff.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-xs font-mono font-semibold rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-xs font-mono font-bold rounded-xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-sm rounded-xl shadow-xl hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* Footer ISO certification badge */}
            <div className="pt-2 text-center border-t border-slate-800/80">
              <span className="text-[10px] font-mono text-slate-500 font-bold">
                MA Ashapuri Tuff • ISO 9001:2015 Certified Manufacturing Line
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
