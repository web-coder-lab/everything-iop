import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import {
  Shield,
  KeyRound,
  Smartphone,
  Laptop,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ArrowLeft,
} from 'lucide-react';
import type { Session, SecurityEvent } from '../../types';

export const SecurityCenterView: React.FC = () => {
  const { navigate, addToast } = useAppStore();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: 'sess_1',
      sessionId: 'sess_1',
      device: 'Chrome on Windows 11',
      ip: '182.185.142.12',
      ipAddress: '182.185.142.12',
      location: 'Lahore, Pakistan',
      lastActive: 'Active now',
      isCurrent: true,
    },
    {
      id: 'sess_2',
      sessionId: 'sess_2',
      device: 'Mobile Safari on iPhone 15',
      ip: '39.40.112.5',
      ipAddress: '39.40.112.5',
      location: 'Karachi, Pakistan',
      lastActive: '2 hours ago',
      isCurrent: false,
    },
  ]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    addToast('Password updated securely.', 'success');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    addToast('Session revoked.', 'info');
  };

  return (
    <div id="security-center-container" className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/settings')}
        className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Settings</span>
      </button>

      <div>
        <h1 className="text-xl font-black text-stone-900 dark:text-white tracking-tight">
          Security Center
        </h1>
        <p className="text-xs text-stone-500">Protect your account, monitor logins, and configure 2FA</p>
      </div>

      {/* Two-Factor Authentication card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-stone-900 dark:text-white">
                Two-Factor Authentication (2FA)
              </h3>
              <p className="text-[11px] text-stone-500">
                Requires an authenticator code (TOTP) or SMS token on new logins
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setTwoFactorEnabled(!twoFactorEnabled);
              addToast(twoFactorEnabled ? '2FA disabled.' : '2FA activated successfully!', 'success');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
              twoFactorEnabled
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-emerald-900 text-white'
            }`}
          >
            {twoFactorEnabled ? 'Disable' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* Password Change card */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-stone-900 dark:text-white">Change Password</h3>
        <form onSubmit={handleChangePassword} className="space-y-2.5">
          <input
            type="password"
            placeholder="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
          <input
            type="password"
            placeholder="New Strong Password (min 8 chars)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full text-xs rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 p-2.5 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
          />
          <button
            type="submit"
            disabled={!currentPassword || !newPassword}
            className="px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition disabled:opacity-40"
          >
            Update Password
          </button>
        </form>
      </div>

      {/* Active Sessions list */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-stone-900 dark:text-white">Active Device Sessions</h3>
        <div className="space-y-2">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 text-xs"
            >
              <div className="flex items-center gap-3">
                {sess.device.includes('iPhone') ? (
                  <Smartphone className="w-5 h-5 text-emerald-700" />
                ) : (
                  <Laptop className="w-5 h-5 text-emerald-700" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 dark:text-white">{sess.device}</span>
                    {sess.isCurrent && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                        This Device
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {sess.location} • {sess.ip} • {sess.lastActive}
                  </p>
                </div>
              </div>

              {!sess.isCurrent && (
                <button
                  onClick={() => handleRevokeSession(sess.id || sess.sessionId || '')}
                  className="p-1.5 text-stone-400 hover:text-rose-600 transition"
                  title="Revoke session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
