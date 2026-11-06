'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Dedicated Staff / Administrator Login Route (/login)
 * Not linked anywhere in the public visitor navigation bar.
 */
export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-hoops-navy px-4">
      <div className="max-w-md w-full bg-hoops-charcoal border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div>
          <span className="px-2.5 py-1 rounded bg-hoops-orange/20 text-hoops-orange text-xs font-bold uppercase">
            Restricted Staff Portal
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-2">
            WNBA Hoops News — Editorial Login
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            This login page is restricted to authorized administrators and editors. Ordinary visitors cannot access /admin.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Admin Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="editor@wnbahoopsnews.com"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-hoops-orange hover:bg-orange-600 text-white font-bold transition"
          >
            {loading ? 'Verifying Credentials...' : 'Sign In to /admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
