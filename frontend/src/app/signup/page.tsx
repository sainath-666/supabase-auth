'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '../../lib/api';
import { Shield, Mail, Lock, Loader2, ArrowRight, UserPlus, UserCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Employee');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await apiRequest('/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError(null);
    try {
      localStorage.setItem('google_oauth_role', role);
      const { error: signInError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (signInError) throw signInError;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Sign-Up failed.');
    }
  };

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
          Create your developer account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Or{' '}
          <Link
            href="/"
            className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            log in to existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          {success && (
            <div className="mb-4 bg-emerald-950/50 border border-emerald-800 text-emerald-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 font-semibold">
              <UserCheck className="w-5 h-5" />
              <span>Signup successful! Redirecting to login...</span>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-950/50 border border-red-800 text-red-400 px-4 py-3 rounded-lg text-sm font-semibold">
              {error}
            </div>
          )}

          {!success && (
            <React.Fragment>
              <form className="space-y-6" onSubmit={handleSignup}>
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
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-semibold text-slate-300 mb-2.5"
                  >
                    Choose Cerbos Authorization Role
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Admin', 'Manager', 'Employee', 'Viewer'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer text-center ${
                          role === r
                            ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-slate-500 leading-relaxed">
                    Note: The role is stored directly inside the Supabase user identity metadata. This ensures clean separation of authentication and authorization.
                  </p>
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Sign Up
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
                    onClick={handleGoogleSignUp}
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
                    Sign up with Google
                  </button>
                </div>
              </div>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}
