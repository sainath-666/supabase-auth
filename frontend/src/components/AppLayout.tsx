'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { DeveloperConsole } from './DeveloperConsole';
import { Shield, LogOut, Terminal, Users, User, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading, logout } = useAuth();
  const router = useRouter();
  const [showConsole, setShowConsole] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roleColors: Record<string, string> = {
    Admin: 'bg-red-500/10 text-red-400 border-red-500/20',
    Manager: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Employee: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Viewer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans flex flex-col">
      {/* Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-2">
                <div className="bg-indigo-600 p-1.5 rounded-lg">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg text-white">Cerbos Auth Demo</span>
              </Link>
              <nav className="hidden md:flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/employees"
                  className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1.5"
                >
                  <Users className="w-4 h-4" />
                  Employees
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              {/* User info card / status badge */}
              <div className="hidden sm:flex items-center gap-3 bg-slate-950/60 px-3.5 py-1.5 rounded-xl border border-slate-800">
                <User className="w-4 h-4 text-slate-400" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-300 max-w-[140px] truncate">
                    {user.email}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border mt-0.5 w-max ${roleColors[role || 'Viewer']}`}>
                    {role}
                  </span>
                </div>
              </div>

              {/* Developer Console Toggle */}
              <button
                onClick={() => setShowConsole(!showConsole)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  showConsole
                    ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-600/20'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Dev Console</span>
              </button>

              {/* Sign out */}
              <button
                onClick={logout}
                className="bg-slate-950 border border-slate-800 hover:border-red-950 text-slate-400 hover:text-red-400 p-2.5 rounded-xl transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main layout wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        <div className="flex-1">{children}</div>

        {/* Console Container */}
        {showConsole && (
          <div className="mt-auto pt-6 border-t border-slate-800/50">
            <DeveloperConsole />
          </div>
        )}
      </main>
    </div>
  );
}
