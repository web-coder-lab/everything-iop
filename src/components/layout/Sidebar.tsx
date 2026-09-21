import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import {
  Home,
  Users2,
  MessageSquare,
  Bell,
  User,
  Search,
  Bookmark,
  Settings,
  Shield,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  PenSquare,
  Compass,
  Server,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentRoute,
    navigate,
    currentUser,
    unreadMessagesCount,
    unreadNotificationsCount,
    setCreatePostModalOpen,
  } = useAppStore();

  const [isCollapsed, setIsCollapsed] = useState(false);

  const primaryItems = [
    { label: 'Home', path: '/home', icon: Home },
    { label: 'Communities', path: '/communities', icon: Users2 },
    {
      label: 'Messages',
      path: '/messages',
      icon: MessageSquare,
      badge: unreadMessagesCount,
    },
    {
      label: 'Notifications',
      path: '/notifications',
      icon: Bell,
      badge: unreadNotificationsCount,
    },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  const secondaryItems = [
    { label: 'Explore', path: '/explore', icon: Compass },
    { label: 'Search', path: '/search', icon: Search },
    { label: 'Saved', path: '/saved', icon: Bookmark },
    { label: 'Settings', path: '/settings', icon: Settings },
    { label: 'Security', path: '/settings/security', icon: Shield },
    { label: 'Help', path: '/help', icon: HelpCircle },
    { label: 'Server Status', path: '/server-status', icon: Server },
  ];


  const isActive = (path: string) => {
    if (path === '/home' && (currentRoute === '/' || currentRoute === '/home')) return true;
    return currentRoute.startsWith(path);
  };

  return (
    <aside
      id="desktop-sidebar-nav"
      className={`hidden lg:flex flex-col shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] border-r border-stone-200/80 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 backdrop-blur-md transition-all duration-300 py-4 px-3 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Create Post Action Button */}
      <div className="mb-4">
        <button
          onClick={() => setCreatePostModalOpen(true)}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-800 hover:from-emerald-800 hover:to-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-950/20 active:scale-95 transition-all ${
            isCollapsed ? 'p-3' : ''
          }`}
          title="Create new post"
        >
          <PenSquare className="w-4 h-4 text-amber-300 shrink-0" />
          {!isCollapsed && <span>Create Post</span>}
        </button>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 space-y-1">
        <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400 px-3 mb-1">
          {!isCollapsed && 'Main Menu'}
        </div>
        {primaryItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                active
                  ? 'bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-100 font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/70 dark:hover:bg-stone-800/70 hover:text-stone-900 dark:hover:text-stone-100'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
              title={item.label}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    active ? 'text-emerald-700 dark:text-emerald-300' : 'text-stone-500 group-hover:text-emerald-700'
                  }`}
                />
                {!!item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span>{item.label}</span>
                  {!!item.badge && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}

        <div className="pt-4 text-[10px] uppercase font-bold tracking-wider text-stone-400 px-3 mb-1">
          {!isCollapsed && 'Explore & Account'}
        </div>
        {secondaryItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                active
                  ? 'bg-emerald-100/80 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-100 font-bold'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100/70 dark:hover:bg-stone-800/70 hover:text-stone-900 dark:hover:text-stone-100'
              } ${isCollapsed ? 'justify-center px-2' : ''}`}
              title={item.label}
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  active ? 'text-emerald-700 dark:text-emerald-300' : 'text-stone-500 group-hover:text-emerald-700'
                }`}
              />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="pt-3 border-t border-stone-200/80 dark:border-stone-800 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 text-[11px] text-stone-500 px-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
            <span>Render Prototype Live</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-xl text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition mx-auto"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
