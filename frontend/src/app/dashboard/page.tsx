'use client';

import React from 'react';
import { AppLayout } from '../../components/AppLayout';
import { useAuth } from '../../lib/auth-context';
import { Shield, Sparkles, User, Key, KeyRound, Server, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, role, permissions } = useAuth();

  const roleColors: Record<string, string> = {
    Admin: 'bg-red-500/10 text-red-400 border-red-500/20',
    Manager: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Employee: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    Viewer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };

  const roleDescriptions: Record<string, string> = {
    Admin: 'Full access to create, read, update, and delete all records. Ideal for administrators.',
    Manager: 'Can create, read, update and list records. Cannot delete records.',
    Employee: 'Can read records, and can only update records they created themselves.',
    Viewer: 'Can only view records. No edit or create privileges.',
  };

  return (
    <AppLayout>
      <div className="space-y-8 font-sans">
        {/* Banner */}
        <div className="bg-[linear-gradient(135deg,_var(--tw-gradient-stops))] from-indigo-900/40 via-indigo-950/20 to-transparent border border-indigo-500/10 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              Welcome to Cerbos Auth Demo <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              This dashboard provides a complete architectural demonstration of Supabase Authentication (JWT handling) coordinating with Cerbos Authorization policies.
            </p>
          </div>
          <Link
            href="/employees"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/20 transition w-max cursor-pointer"
          >
            Manage Employees
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600/10 p-2.5 rounded-xl">
                <User className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">Current User Card</h3>
            </div>
            <div className="space-y-3.5 text-xs">
              <div>
                <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Email Address</span>
                <span className="text-slate-200 font-medium break-all">{user?.email}</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Auth Provider</span>
                <span className="text-slate-200 font-medium">Supabase Auth (JWT)</span>
              </div>
              <div>
                <span className="text-slate-500 font-semibold block uppercase text-[10px] tracking-wider">Unique User ID (sub)</span>
                <span className="text-slate-400 font-mono block truncate mt-1 bg-slate-950 p-2 rounded border border-slate-800 text-[10px]">
                  {user?.id}
                </span>
              </div>
            </div>
          </div>

          {/* Role Status Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600/10 p-2.5 rounded-xl">
                <Key className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">Cerbos Role Profile</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Role</span>
                <span className={`text-xs px-2.5 py-1 rounded font-bold border ${roleColors[role || 'Viewer']}`}>
                  {role}
                </span>
              </div>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-400 text-xs leading-relaxed">
                {roleDescriptions[role || 'Viewer']}
              </div>
            </div>
          </div>

          {/* Permission Quick Overview Badge */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600/10 p-2.5 rounded-xl">
                <Shield className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-bold text-slate-100 text-base">Employee Actions Matrix</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {permissions ? (
                Object.entries(permissions.employee).map(([action, allowed]) => (
                  <div
                    key={action}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-400 capitalize">{action}</span>
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        allowed ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50' : 'bg-red-500 shadow-lg shadow-red-500/50'
                      }`}
                      title={allowed ? 'Allowed' : 'Denied'}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-4 text-slate-500 italic">
                  Loading authorizations...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Integration Architecture Explanation */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-md font-bold text-slate-100 flex items-center gap-2">
            <Server className="w-5 h-5 text-indigo-400" />
            Under the Hood: Flow details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400 leading-relaxed pt-2">
            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-indigo-900 text-indigo-300 flex items-center justify-center font-sans font-bold">1</div>
                Supabase Auth JWT
              </div>
              <p>
                When you log in, Supabase issues an encrypted JWT containing user identity and custom roles inside <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300">user_metadata</code>.
              </p>
            </div>
            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-indigo-900 text-indigo-300 flex items-center justify-center font-sans font-bold">2</div>
                API Request Interceptor
              </div>
              <p>
                The frontend attaches this JWT as a Bearer Token. The Express API parses, validates, and extracts user variables securely (never bypassing backend controls).
              </p>
            </div>
            <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800/80">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-indigo-900 text-indigo-300 flex items-center justify-center font-sans font-bold">3</div>
                Cerbos Decisions
              </div>
              <p>
                The backend queries the Cerbos Engine with the principal role, action, and resource attributes (such as record owner checks) to deny/approve requests dynamically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
