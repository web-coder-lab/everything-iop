import React from 'react';
import { useAppStore } from '../../stores/appStore';
import {
  ArrowLeft, HelpCircle, Home, Users2, ShieldCheck, Wallet, Video, MessageSquare,
  Bell, Lock, Smartphone, Search, Flag, Settings, Database
} from 'lucide-react';

const Block: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <section className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-sm space-y-2">
    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm">
      {icon}
      <h3>{title}</h3>
    </div>
    <div className="text-sm leading-7 text-stone-600 dark:text-stone-300 space-y-2">{children}</div>
  </section>
);

export const HelpView: React.FC = () => {
  const { navigate } = useAppStore();

  return (
    <div id="help-guidelines-container" className="space-y-4 animate-fade-in max-w-3xl mx-auto pb-12">
      <button onClick={() => navigate('/home')} className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-700 transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest text-amber-700">EIOP Help Center</p>
        <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight">Help, safety and how Everything IOP works</h1>
        <p className="text-sm text-stone-500 mt-1">
          This page is the long guide. Read it when you want to know what a button does, why login is required, where money data lives, and where your videos stay.
        </p>
      </div>

      <Block icon={<HelpCircle className="w-5 h-5" />} title="What is Everything IOP?">
        <p>Everything IOP (EIOP) is one account for feed, communities, messages, reels, videos, live, store, events, coins, wallet, creator tools, business tools and developer apps. There is no separate public admin website. Community owners use Community Control. Creators use Creator Studio. Sellers use Seller Center.</p>
        <p>The website and the Node server deploy together. The browser talks only to EIOP Node. Node talks to the Private API for content and to Firebase only for payment records.</p>
      </Block>

      <Block icon={<Home className="w-5 h-5" />} title="Home">
        <p>Home is the feed inside the normal EIOP shell: stories, For You / Following / Latest, and the post composer when you are signed in. Tapping Home does not open a second product skin. If a session is missing, Home asks you to log in the same way Communities does.</p>
      </Block>

      <Block icon={<Users2 className="w-5 h-5" />} title="Communities">
        <p>Communities can be public, private or invite-only. Joining a private space may sit as pending until an owner or moderator accepts you. Roles include owner, admin, moderator, verified, VIP, member and guest. Buttons that hide a control in the UI are not permission. The server still checks every change.</p>
      </Block>

      <Block icon={<MessageSquare className="w-5 h-5" />} title="Messages">
        <p>Direct and group chats support text, media, voice notes, replies, reactions and delivery states. You cannot join another person’s conversation by guessing an ID. Socket rooms are authorized on the server. Read receipts and online status can be changed in Settings after login.</p>
      </Block>

      <Block icon={<Video className="w-5 h-5" />} title="Reels, videos and live">
        <p>Short video, long video and live belong to the real owner ID returned by the Private API. Coin messages send surface type, surface id, amount and text only. The server finds the owner. Live recordings follow MAX_STREAM_STORAGE_HOURS (default 6). Media files stay on private storage, not on Firebase payment tables.</p>
      </Block>

      <Block icon={<Wallet className="w-5 h-5" />} title="Coins, wallet and payments">
        <p>Coins are platform balance. Wallet is money movement. The client never sends a trusted balance, ownerId or payment_success flag. Checkout is created by Node. Confirmation comes from a signed webhook. Payment records are stored in Firebase so web and a future app can both read the same financial state.</p>
        <p>If a payment provider is not configured, EIOP shows NOT_CONFIGURED instead of a fake success.</p>
      </Block>

      <Block icon={<Database className="w-5 h-5" />} title="Where data lives">
        <p>Financial records: Firebase, server-side only.</p>
        <p>Everything else — profiles, posts, reels, videos, messages, communities, events, products, files — stays on EIOP private storage and is not shared as an open dataset with other companies.</p>
      </Block>

      <Block icon={<Lock className="w-5 h-5" />} title="Login, sessions and 2FA">
        <p>Signup uses email, OTP, profile and password. Login creates a server session. Security Center, 2FA, password change and session revoke require that session. Opening /settings/security without login now sends you to the login page.</p>
        <p>Use Logout this device or Revoke all sessions if a phone is lost. Do not put tokens in URLs.</p>
      </Block>

      <Block icon={<Bell className="w-5 h-5" />} title="Notifications">
        <p>In-app and optional web push. Push payloads only carry an event id. The app then loads details over HTTPS. Security alerts stay high priority even if other categories are quiet.</p>
      </Block>

      <Block icon={<Search className="w-5 h-5" />} title="Search and links">
        <p>Search covers people, posts, communities, events and products you are allowed to see. Private items stay hidden. Internal links such as /post/:id stay inside EIOP. Unknown addresses show a 404 instead of silently opening Home.</p>
      </Block>

      <Block icon={<Flag className="w-5 h-5" />} title="Report, block, mute">
        <p>Report a post, comment, message, user or community. The reported person does not see who reported them. Block and mute are account controls. Community owners can ban, timeout and manage roles inside their own space.</p>
      </Block>

      <Block icon={<Settings className="w-5 h-5" />} title="Settings, Help, Privacy & Terms">
        <p>Settings holds profile, appearance, messaging privacy and logout. Help is this page. Privacy & Terms is one combined page that explains Firebase payments versus private content storage. Server Status is not shown in navigation.</p>
      </Block>

      <Block icon={<Smartphone className="w-5 h-5" />} title="If something fails">
        <p>Check the connection banner, try again, and stay on the same page. Do not assume a coin spend or payout worked because the screen moved. If Private API or Firebase is down, EIOP should say the service is unavailable and keep the rest of the app from crashing.</p>
        <p>Need the legal split in one place? Open Privacy &amp; Terms from the sidebar.</p>
      </Block>

      <Block icon={<ShieldCheck className="w-5 h-5" />} title="Community code">
        <p>Be respectful. Do not scam, impersonate, harass, or post illegal content. EIOP can lock an account and revoke sessions. Community rules can be stricter than the global code. When rules conflict, the stricter safe rule wins inside that community.</p>
      </Block>
    </div>
  );
};
