import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { ArrowLeft, Shield, Wallet, Database, Lock, FileText } from 'lucide-react';

export const LegalView: React.FC = () => {
  const { navigate } = useAppStore();

  return (
    <div id="privacy-terms-container" className="space-y-5 animate-fade-in max-w-3xl mx-auto pb-10">
      <button onClick={() => navigate('/home')} className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-700 transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-amber-700">EIOP</p>
        <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">Privacy & Terms</h1>
        <p className="text-sm text-stone-500 mt-1">One page for how Everything IOP stores money data, how it stores your content, and the rules for using the product.</p>
      </div>

      <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
          <Wallet className="w-5 h-5" />
          <h2>Payments live on Firebase</h2>
        </div>
        <p className="text-sm leading-7 text-stone-600 dark:text-stone-300">
          Wallet balances, checkout status, payout records, coin purchase receipts, and other payment-related records are kept on Firebase so the website and future apps can stay in sync. Firebase is used only for financial and explicitly assigned payment storage. The browser never receives Firebase Admin keys. Node.js is the only layer allowed to write those records after a payment provider webhook is verified.
        </p>
        <p className="text-sm leading-7 text-stone-600 dark:text-stone-300">
          EIOP does not treat a frontend “success” screen as proof of payment. Amount, currency, and event ID are checked on the server. Duplicate webhooks must not credit twice.
        </p>
      </section>

      <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
          <Database className="w-5 h-5" />
          <h2>Reels, videos and the rest of your data stay private</h2>
        </div>
        <p className="text-sm leading-7 text-stone-600 dark:text-stone-300">
          Posts, reels, videos, live session metadata, messages, communities, profiles, events, products, and media files are stored on EIOP’s own secured Private API and media storage. That content is not sold, rented, or handed to other platforms as a shared public dataset. It is not copied into Firebase just because a payment happened.
        </p>
        <p className="text-sm leading-7 text-stone-600 dark:text-stone-300">
          Access is scoped to the signed-in account and the permissions of each community or conversation. Other members cannot open your private messages, private communities, or hidden media by changing an ID in the URL.
        </p>
      </section>

      <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
          <Lock className="w-5 h-5" />
          <h2>Privacy rules</h2>
        </div>
        <ul className="text-sm leading-7 text-stone-600 dark:text-stone-300 list-disc pl-5 space-y-1">
          <li>Passwords are hashed. OTP codes expire and can be used once.</li>
          <li>Secrets never belong in the frontend bundle, Git, screenshots, or ordinary logs.</li>
          <li>Session devices can be reviewed and revoked from Security Center after login.</li>
          <li>2FA and Security Center pages require a signed-in session.</li>
          <li>You can request account data export and account deletion from Settings when those server jobs are configured.</li>
          <li>Search and recommendations must hide private posts, private chats, and restricted community content.</li>
        </ul>
      </section>

      <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 space-y-3">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
          <FileText className="w-5 h-5" />
          <h2>Terms of use</h2>
        </div>
        <p className="text-sm leading-7 text-stone-600 dark:text-stone-300">
          By creating an EIOP account you agree to use the product lawfully, keep your login private, and not attempt to bypass authentication, scrape private data, or interfere with payments. You are responsible for the content you publish. Harassment, scams, impersonation, and illegal material can be removed and the account can be locked.
        </p>
        <p className="text-sm leading-7 text-stone-600 dark:text-stone-300">
          Coins are a platform balance, not bank money. Wallet withdrawals and payouts only complete after server-side checks. EIOP may pause financial features when a provider is not configured. Community owners moderate their own spaces; there is no public platform-wide admin panel.
        </p>
        <p className="text-sm leading-7 text-stone-600 dark:text-stone-300">
          These terms can be updated when the product changes. Continued use after an update means you accept the current page. If a feature cannot run because Private API, Firebase, or a payment provider is not configured, EIOP will show that state instead of pretending the action succeeded.
        </p>
      </section>

      <section className="bg-emerald-50 dark:bg-emerald-950/30 rounded-3xl border border-emerald-200/70 dark:border-emerald-900 p-5 space-y-2">
        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-200 font-bold">
          <Shield className="w-5 h-5" />
          <h2>Short split</h2>
        </div>
        <p className="text-sm leading-7 text-stone-700 dark:text-stone-300">
          Money records → Firebase, so web and app can operate together.<br />
          Reels, videos, chats, communities, and files → EIOP private storage, not shared outward.<br />
          Browser → only public UI. Node.js → security and business rules.
        </p>
      </section>
    </div>
  );
};
