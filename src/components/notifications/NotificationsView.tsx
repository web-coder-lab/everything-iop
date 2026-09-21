import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import {
  Bell,
  Heart,
  MessageCircle,
  AtSign,
  Users2,
  Shield,
  CheckCheck,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { Notification, NotificationCategory } from '../../types';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    pushSubscribed,
    togglePushNotifications,
    navigate,
  } = useAppStore();

  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filtered = notifications.filter((n) => {
    if (activeCategory === 'all') return true;
    return n.category === activeCategory;
  });

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'reactions':
        return <Heart className="w-3.5 h-3.5 text-rose-500" />;
      case 'comments':
        return <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />;
      case 'mentions':
        return <AtSign className="w-3.5 h-3.5 text-amber-500" />;
      case 'community':
        return <Users2 className="w-3.5 h-3.5 text-indigo-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-stone-500" />;
    }
  };

  const handleItemClick = (notif: Notification) => {
    markNotificationRead(notif.id);
    if (notif.targetUrl) {
      navigate(notif.targetUrl);
    }
  };

  return (
    <div id="notifications-view-container" className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      {/* Header & Batch actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-3xl p-4 sm:p-5 shadow-sm">
        <div>
          <h1 className="text-lg font-black text-stone-900 dark:text-white tracking-tight">
            Notifications
          </h1>
          <p className="text-xs text-stone-500">
            Real-time updates across communities, mentions, and conversations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Push Web Subscription Toggle */}
          <button
            onClick={togglePushNotifications}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
              pushSubscribed
                ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : 'bg-stone-50 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100'
            }`}
          >
            {pushSubscribed ? '🔔 Push Enabled' : '🔕 Enable Web Push'}
          </button>

          <button
            onClick={markAllNotificationsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'all', label: 'All' },
          { id: 'mentions', label: 'Mentions' },
          { id: 'comments', label: 'Comments' },
          { id: 'reactions', label: 'Reactions' },
          { id: 'community', label: 'Circles' },
          { id: 'system', label: 'System' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              activeCategory === cat.id
                ? 'bg-emerald-900 text-white'
                : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="bg-white dark:bg-stone-900 rounded-3xl border border-stone-200/80 dark:border-stone-800 overflow-hidden divide-y divide-stone-100 dark:divide-stone-800/60 shadow-sm">
        {filtered.length > 0 ? (
          filtered.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleItemClick(notif)}
              className={`p-3.5 sm:p-4 flex items-start gap-3.5 cursor-pointer transition select-none ${
                notif.isRead
                  ? 'hover:bg-stone-50 dark:hover:bg-stone-800/40'
                  : 'bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
              }`}
            >
              {/* Avatar + Category badge */}
              <div className="relative shrink-0">
                <img
                  src={notif.actor?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={notif.actor?.fullName || 'User'}
                  className="w-10 h-10 rounded-full object-cover border border-stone-200 dark:border-stone-700"
                />
                <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-stone-900 shadow">
                  {getCategoryIcon(notif.category)}
                </div>
              </div>

              {/* Text info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-stone-800 dark:text-stone-200 leading-snug">
                  {notif.actor && (
                    <strong className="font-bold text-stone-900 dark:text-white mr-1">
                      {notif.actor.fullName}
                    </strong>
                  )}
                  {notif.body || notif.message || notif.title}
                </p>
                <span className="text-[10px] text-stone-400 mt-1 block">{notif.time}</span>
              </div>

              {/* Unread dot */}
              {!notif.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 self-center" />
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-stone-400">
            No notifications in this category.
          </div>
        )}
      </div>
    </div>
  );
};
