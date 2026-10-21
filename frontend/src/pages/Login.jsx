import React, { useState } from 'react';
import { Sun, Lock, Mail, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@solar.test');
  const [password, setPassword] = useState('Password123!');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await login(email, password);
    } catch (x) {
      setErr(x.message);
      setBusy(false);
    }
  };

  const setDemo = (em) => {
    setEmail(em);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="inspo-bg-pattern" />

      <div className="relative z-10 w-full max-w-md bg-white rounded-[36px] shadow-floating border border-white/80 p-8 sm:p-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mx-auto mb-4 shadow-md font-extrabold text-2xl">
            <span>S</span>
            <span className="text-amber-400">.</span>
          </div>
          <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">
            SolarGuard
          </h2>
          <p className="text-xs text-zinc-400 font-medium mt-1">
            Operations & Maintenance Management
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="installer@solar.test"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
              />
            </div>
          </div>

          {err && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-medium text-rose-700">
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-black text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            <span>{busy ? 'Signing in...' : 'Sign In to Operations'}</span>
            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Quick Demo Access Pills */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-2.5">
            Quick Demo Logins
          </span>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setDemo('admin@solar.test')}
              className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setDemo('tech1@solar.test')}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors"
            >
              Technician
            </button>
            <button
              type="button"
              onClick={() => setDemo('viewer@solar.test')}
              className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold transition-colors"
            >
              Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
