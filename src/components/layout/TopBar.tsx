import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { Search, Bell, MessageSquare, Moon, Sun, Shield, LogOut, User, Sparkles } from 'lucide-react';

export const TopBar: React.FC = () => {
  const {
    currentUser,
    currentRoute,
    navigate,
    unreadNotificationsCount,
    unreadMessagesCount,
    isDarkMode,
    toggleDarkMode,
    logout,
  } = useAppStore();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate('/search', { q: searchInput.trim() });
    }
  };

  return (
    <header
      id="global-topbar"
      className="sticky top-0 z-30 w-full bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200/80 dark:border-stone-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-2.5 focus:outline-none group text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 flex items-center justify-center text-amber-300 font-bold shadow-sm shadow-emerald-950/20 group-hover:scale-105 transition-transform">
              <span className="text-sm font-black tracking-tight">PF</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-extrabold tracking-tight text-emerald-950 dark:text-emerald-100 font-['Outfit']">
                Everything
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 dark:text-amber-400 -mt-1">
                Community
              </span>
            </div>
          </button>
        </div>

        {/* Global Search bar (desktop and tablet) */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex flex-1 max-w-md mx-4 items-center relative"
        >
          <Search className="w-4 h-4 text-stone-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search communities, people, topics..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full h-9 pl-9 pr-4 text-xs rounded-xl bg-stone-100/80 dark:bg-stone-800/80 border border-transparent focus:border-emerald-600 focus:bg-white dark:focus:bg-stone-900 text-stone-900 dark:text-stone-100 placeholder-stone-500 focus:outline-none transition-all shadow-inner"
          />
        </form>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800 transition"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Messages icon on mobile/tablet */}
          <button
            onClick={() => navigate('/messages')}
            className="relative p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition"
            aria-label="Messages"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadMessagesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
            )}
          </button>

          {/* Notifications icon */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
          </button>

          {/* User profile dropdown */}
          {currentUser ? (
            <div className="relative ml-1">
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 p-0.5 rounded-full border border-stone-200 dark:border-stone-700 hover:ring-2 hover:ring-emerald-700 transition"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-7 h-7 rounded-full object-cover"
                />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-xl py-1.5 z-50 animate-fade-in"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800">
                    <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                      {currentUser.fullName}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">@{currentUser.username}</p>
                  </div>

                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                  >
                    <User className="w-4 h-4 text-emerald-700" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => navigate('/settings/security')}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                  >
                    <Shield className="w-4 h-4 text-emerald-700" />
                    <span>Security Center</span>
                  </button>

                  <div className="border-t border-stone-100 dark:border-stone-800 my-1" />

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="px-3.5 py-1.5 bg-emerald-900 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              Log in
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
