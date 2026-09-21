import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { Home, Users2, PlusCircle, MessageSquare, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const {
    currentRoute,
    navigate,
    unreadMessagesCount,
    setCreatePostModalOpen,
  } = useAppStore();

  const isCurrent = (path: string) => {
    if (path === '/home' && (currentRoute === '/' || currentRoute === '/home')) return true;
    return currentRoute.startsWith(path);
  };

  return (
    <nav
      id="mobile-bottom-nav"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200/80 dark:border-stone-800 pb-safe transition-colors"
    >
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">
        <button
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
            isCurrent('/home') ? 'text-emerald-800 dark:text-emerald-300 font-bold' : 'text-stone-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        <button
          onClick={() => navigate('/communities')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
            isCurrent('/communities') ? 'text-emerald-800 dark:text-emerald-300 font-bold' : 'text-stone-500'
          }`}
        >
          <Users2 className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Communities</span>
        </button>

        {/* Center Create Action */}
        <button
          onClick={() => setCreatePostModalOpen(true)}
          className="flex flex-col items-center justify-center -mt-4 bg-gradient-to-tr from-emerald-900 to-emerald-700 text-amber-300 rounded-full w-12 h-12 shadow-lg shadow-emerald-950/30 active:scale-95 transition-transform"
          aria-label="Create Post"
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          onClick={() => navigate('/messages')}
          className={`relative flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
            isCurrent('/messages') ? 'text-emerald-800 dark:text-emerald-300 font-bold' : 'text-stone-500'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 py-0.2 bg-emerald-600 text-white text-[9px] font-bold rounded-full">
                {unreadMessagesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Messages</span>
        </button>

        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center justify-center min-w-[56px] py-1 transition-all ${
            isCurrent('/profile') ? 'text-emerald-800 dark:text-emerald-300 font-bold' : 'text-stone-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Profile</span>
        </button>
      </div>
    </nav>
  );
};
