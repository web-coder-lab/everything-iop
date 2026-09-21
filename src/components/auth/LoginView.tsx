import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, navigate } = useAppStore();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) return;
    setIsLoading(true);
    await login(usernameOrEmail, password);
    setIsLoading(false);
  };

  return (
    <div id="login-page-container" className="max-w-md mx-auto py-6 sm:py-10 animate-fade-in">
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-amber-300 font-extrabold mx-auto mb-3 shadow-md">
            E
          </div>
          <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">
            Sign In to Everything
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            One secure identity for everything you use on the platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
              Email or Username
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Enter your email or username"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                required
                className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 pl-9 pr-3 py-2.5 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 pl-9 pr-3 py-2.5 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-900 to-emerald-800 hover:from-emerald-800 hover:to-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
          >
            <span>{isLoading ? 'Signing in…' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 text-center text-xs text-stone-500">
          Don't have an account yet?{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-bold text-emerald-800 dark:text-emerald-400 hover:underline"
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
};
