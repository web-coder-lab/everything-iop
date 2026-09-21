import React from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { ServerHealthBanner } from '../common/ServerHealthBanner';
import { OfflineIndicator } from '../common/OfflineIndicator';
import { GlobalPopupHost } from '../common/GlobalPopupHost';
import { ToastContainer } from '../common/ToastContainer';
import { ReportModal } from '../moderation/ReportModal';
import { QRShareModal } from '../profile/QRShareModal';
import { EditProfileModal } from '../profile/EditProfileModal';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Server Health Status Banner */}
      <ServerHealthBanner />

      {/* Top Application Bar */}
      <TopBar />

      {/* Main Structural Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Collapsible Sidebar */}
        <Sidebar />

        {/* Primary Content Area */}
        <main className="flex-1 w-full min-w-0 pb-20 lg:pb-8">
          <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Modals & Notifications */}
      <ReportModal />
      <QRShareModal />
      <EditProfileModal />
      <ToastContainer />
      <OfflineIndicator />
      <GlobalPopupHost />
    </div>
  );
};
