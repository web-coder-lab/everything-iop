import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import {
  User,
  Shield,
  Lock,
  Bell,
  Eye,
  Smartphone,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
  Moon,
  Info,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    currentUser,
    navigate,
    isDarkMode,
    toggleDarkMode,
    setEditProfileOpen,
    logout,
    logoutAll,
    addToast,
  } = useAppStore();

  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatusVisible, setOnlineStatusVisible] = useState(true);

  return (
    <div id="settings-overview-container" className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs text-stone-500">Manage account, safety, and community appearance</p>
      </div>

      {/* Account & Profile card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-4 sm:p-5 shadow-sm space-y-3">
        <h3 className="text-xs uppercase font-bold text-stone-400">Account</h3>

        <div
          onClick={() => setEditProfileOpen(true)}
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-emerald-700" />
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-white">Edit Profile</p>
              <p className="text-[11px] text-stone-500">Avatar, name, bio, and phone</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </div>

        <div
          onClick={() => navigate('/settings/security')}
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-700" />
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-white">Security Center</p>
              <p className="text-[11px] text-stone-500">2FA authentication, active sessions, password</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </div>
      </div>

      {/* Privacy Card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-4 sm:p-5 shadow-sm space-y-3">
        <h3 className="text-xs uppercase font-bold text-stone-400">Privacy & Messaging</h3>

        <div className="flex items-center justify-between p-3 rounded-2xl">
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-emerald-700" />
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-white">Read Receipts (Blue Ticks)</p>
              <p className="text-[11px] text-stone-500">Show when you have read messages</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={readReceipts}
            onChange={(e) => {
              setReadReceipts(e.target.checked);
              addToast('Read receipts updated.', 'info');
            }}
            className="w-4 h-4 accent-emerald-700 rounded"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-2xl">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-emerald-700" />
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-white">Online Status</p>
              <p className="text-[11px] text-stone-500">Allow community contacts to see when you're online</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={onlineStatusVisible}
            onChange={(e) => {
              setOnlineStatusVisible(e.target.checked);
              addToast('Online status visibility updated.', 'info');
            }}
            className="w-4 h-4 accent-emerald-700 rounded"
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-4 sm:p-5 shadow-sm space-y-3">
        <h3 className="text-xs uppercase font-bold text-stone-400">Appearance & General</h3>

        <div
          onClick={toggleDarkMode}
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-emerald-700" />
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-white">Dark Theme</p>
              <p className="text-[11px] text-stone-500">
                {isDarkMode ? 'Currently using dark mode' : 'Currently using light mode'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700">
            {isDarkMode ? 'Active' : 'Turn On'}
          </span>
        </div>

        <div
          onClick={() => navigate('/help')}
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-emerald-700" />
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-white">Help & Community Guidelines</p>
              <p className="text-[11px] text-stone-500">Safety tips and support</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </div>

        <div
          onClick={() => navigate('/legal')}
          className="flex items-center justify-between p-3 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/60 cursor-pointer transition"
        >
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-emerald-700" />
            <div>
              <p className="text-xs font-bold text-stone-900 dark:text-white">Privacy & Terms</p>
              <p className="text-[11px] text-stone-500">Payments on Firebase, content stays private</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400" />
        </div>
      </div>

      {/* Log out options */}
      <div className="p-2 space-y-2">
        <button
          onClick={logout}
          className="w-full py-3 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-bold transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Log Out of Current Session</span>
        </button>

        <button
          onClick={logoutAll}
          className="w-full py-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 text-[11px] font-medium transition"
        >
          Revoke all devices & sessions
        </button>
      </div>
    </div>
  );
};
