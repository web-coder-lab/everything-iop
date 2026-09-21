import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { HelpCircle, ShieldCheck, MessageSquare, AlertCircle, HeartHandshake, ArrowLeft } from 'lucide-react';

export const HelpView: React.FC = () => {
  const { navigate } = useAppStore();

  return (
    <div id="help-guidelines-container" className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/home')}
        className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-700 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div>
        <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">
          Help & Community Code
        </h1>
        <p className="text-xs text-stone-500">
          How Everything protects members, fosters respectful discussion, and ensures reliability
        </p>
      </div>

      <div className="space-y-3">
        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm">
            <HeartHandshake className="w-5 h-5" />
            <h3>Respect & Civility</h3>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            Everything is built for constructive dialogue. Disagreements must remain respectful. Abuse, hate speech, defamation, and targeted harassment lead to swift account suspension.
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-5 h-5" />
            <h3>Privacy & Reporting</h3>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            When you report a post, comment, or user, your identity is never disclosed to the reported person. Community moderators review all flagged items impartially.
          </p>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm">
            <MessageSquare className="w-5 h-5" />
            <h3>WhatsApp-Style Messaging</h3>
          </div>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
            One-on-one and group messaging support double-tick delivery status (sent, delivered, read), voice notes, and media attachments. You can control read receipts and online visibility anytime under Settings.
          </p>
        </div>
      </div>
    </div>
  );
};
