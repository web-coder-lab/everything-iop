import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { Users, MessageSquare, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const WelcomeView: React.FC = () => {
  const { navigate } = useAppStore();

  return (
    <div id="welcome-page-container" className="max-w-xl mx-auto py-8 sm:py-16 px-4 text-center animate-fade-in">
      {/* Brand Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs font-semibold mb-6">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Official Community Platform</span>
      </div>

      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white tracking-tight leading-tight mb-4">
        Everything <span className="text-emerald-800 dark:text-emerald-400">Community</span>
      </h1>

      <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-md mx-auto mb-8 leading-relaxed">
        A real, modern social community and WhatsApp-style messaging platform built for trusted connections and authentic discussions.
      </p>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto mb-8 text-left">
        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-2">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-stone-900 dark:text-white">Communities</h3>
          <p className="text-[11px] text-stone-500 mt-0.5">Topic circles, verified channels & events</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-2">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-stone-900 dark:text-white">Real-Time Chat</h3>
          <p className="text-[11px] text-stone-500 mt-0.5">WhatsApp-style delivery status & voice notes</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-stone-900 dark:text-white">Safety & Security</h3>
          <p className="text-[11px] text-stone-500 mt-0.5">Two-factor auth, session audit & reports</p>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
        <button
          id="welcome-create-account-btn"
          onClick={() => navigate('/register')}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition shadow-md active:scale-95"
        >
          <span>Create Account</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          id="welcome-signin-btn"
          onClick={() => navigate('/login')}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-xs transition active:scale-95"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
