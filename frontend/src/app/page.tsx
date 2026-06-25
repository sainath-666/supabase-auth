'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../lib/auth-context';
import { apiRequest } from '../lib/api';
import { supabase } from '../lib/supabase';
import { Shield, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      // Call backend to authenticate user
      const data = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.session) {
        // Set session in Supabase JS SDK on client side
        const { error: sessionError } = await supabase.auth.setSession(data.session);
        if (sessionError) throw sessionError;

        router.push('/dashboard');
      } else {
        throw new Error('Authentication response did not contain a valid session');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (signInError) throw signInError;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Sign-In failed.');
    }
  };

  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/20 via-slate-950 to-slate-950 z-0"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Cerbos Auth Demo
          </span>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-100">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Or{' '}
          <Link
            href="/signup"
            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            create a new developer account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 bg-red-950/50 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm font-semibold">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-300"
              >
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 h-5 text-slate-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-300"
              >
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 h-5 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-slate-900 px-2 text-slate-500 font-medium">Or continue with</span>
              </div>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg text-sm font-semibold text-slate-200 hover:bg-slate-900 focus:outline-none transition cursor-pointer shadow-md"
              >
                <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.827 1.145 15.055 0 12 0 7.34 0 3.327 2.673 1.345 6.573l3.921 3.192z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.273c0-.796-.068-1.636-.205-2.436H12v4.618h6.49a5.59 5.59 0 0 1-2.427 3.673l3.818 2.964c2.23-2.054 3.51-5.08 3.51-8.82z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.266 14.235 1.345 17.427A11.954 11.954 0 0 0 12 24c3.082 0 5.864-1.018 7.882-2.773l-3.818-2.964a7.123 7.123 0 0 1-4.064 1.155c-3.69 0-6.818-2.49-7.927-5.964z"
                  />
                  <path
                    fill="#34A853"
                    d="M1.345 6.573A11.95 11.95 0 0 0 0 12c0 1.945.464 3.79 1.282 5.427l4.036-3.136c-.236-.69-.364-1.427-.364-2.29 0-.828.118-1.618.327-2.31L1.345 6.573z"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-6">
            <div className="text-xs text-slate-500 space-y-2 leading-relaxed">
              <span className="font-bold text-slate-400">Quick Test Users (Password: 123456):</span>
              <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col">
                  <span className="text-indigo-400">Admin</span>
                  <span>admin@test.com</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col">
                  <span className="text-indigo-400">Manager</span>
                  <span>manager@test.com</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col">
                  <span className="text-indigo-400">Employee</span>
                  <span>employee@test.com</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800 flex flex-col">
                  <span className="text-indigo-400">Viewer</span>
                  <span>viewer@test.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
