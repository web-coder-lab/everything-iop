import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { copyToClipboard } from '../../lib/utils';
import { X, Copy, Check, Share2 } from 'lucide-react';

export const QRShareModal: React.FC = () => {
  const { qrModalUser, setQrModalUser, addToast } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!qrModalUser) return null;

  const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/users/${qrModalUser.username}` : `https://everything.example/users/${qrModalUser.username}`;

  const handleCopy = async () => {
    const ok = await copyToClipboard(profileUrl);
    if (ok) {
      setCopied(true);
      addToast('Profile link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      id="profile-qr-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
    >
      <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl text-center">
        <div className="flex justify-end">
          <button
            onClick={() => setQrModalUser(null)}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-1 mb-4 flex flex-col items-center">
          <img
            src={qrModalUser.avatarUrl}
            alt={qrModalUser.fullName}
            className="w-16 h-16 rounded-full border-2 border-emerald-600 shadow-md object-cover"
          />
          <h3 className="mt-2 text-base font-bold text-stone-900 dark:text-white">
            {qrModalUser.fullName}
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400">@{qrModalUser.username}</p>
        </div>

        {/* QR Code visual box */}
        <div className="bg-stone-50 dark:bg-stone-800 p-5 rounded-2xl inline-block border border-stone-200 dark:border-stone-700 shadow-inner">
          <svg
            className="w-44 h-44 text-stone-900 dark:text-white"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            {/* Elegant SVG QR simulation */}
            <path d="M10 10 h30 v30 h-30 z M15 15 v20 h20 v-20 z M20 20 h10 v10 h-10 z" />
            <path d="M60 10 h30 v30 h-30 z M65 15 v20 h20 v-20 z M70 20 h10 v10 h-10 z" />
            <path d="M10 60 h30 v30 h-30 z M15 65 v20 h20 v-20 z M20 70 h10 v10 h-10 z" />
            <circle cx="50" cy="50" r="8" fill="#064e3b" />
            <rect x="45" y="15" width="10" height="25" rx="2" />
            <rect x="15" y="45" width="25" height="10" rx="2" />
            <rect x="55" y="55" width="12" height="12" rx="2" />
            <rect x="75" y="55" width="15" height="8" rx="2" />
            <rect x="65" y="70" width="25" height="20" rx="2" />
            <rect x="45" y="75" width="15" height="15" rx="2" />
          </svg>
        </div>

        <p className="mt-4 text-xs text-stone-500 dark:text-stone-400">
          Scan to view profile and start chatting on Everything
        </p>

        <div className="mt-5 flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-50 dark:hover:bg-stone-800 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: qrModalUser.fullName, url: profileUrl }).catch(() => {});
              } else {
                handleCopy();
              }
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};
