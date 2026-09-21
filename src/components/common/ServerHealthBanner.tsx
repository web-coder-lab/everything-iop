import React from 'react';
import { useAppStore } from '../../stores/appStore';
import { RefreshCw, WifiOff, CheckCircle2 } from 'lucide-react';

export const ServerHealthBanner: React.FC = () => {
  const { serverStatus, serverMessage, checkServerHealth } = useAppStore();

  if (serverStatus === 'ok') {
    return null;
  }

  return (
    <div
      id="server-health-status-banner"
      className={`w-full px-4 py-2 text-xs font-medium transition-colors flex items-center justify-between z-40 ${
        serverStatus === 'waking' || serverStatus === 'checking'
          ? 'bg-emerald-900/90 text-emerald-100 border-b border-emerald-800'
          : 'bg-amber-900/90 text-amber-100 border-b border-amber-800'
      }`}
    >
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
        {serverStatus === 'checking' || serverStatus === 'waking' ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-300 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">{serverMessage}</span>
              <span className="ml-2 opacity-80 hidden sm:inline">
                Waking community server on Render. This takes a brief moment.
              </span>
            </div>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">{serverMessage}</span>
              <span className="ml-2 opacity-80 hidden sm:inline">
                Could not reach community backend. You can explore cached community content or retry.
              </span>
            </div>
            <button
              id="retry-health-check-btn"
              onClick={checkServerHealth}
              className="ml-2 px-2.5 py-1 bg-amber-800 hover:bg-amber-700 text-white rounded font-medium text-xs transition"
            >
              Retry
            </button>
          </>
        )}
      </div>
    </div>
  );
};
