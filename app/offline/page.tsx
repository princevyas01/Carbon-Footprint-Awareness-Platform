'use client';

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 bg-white/5 border border-border flex items-center justify-center rounded-full text-muted animate-pulse">
        <WifiOff className="h-8 w-8 text-coral" />
      </div>

      <div className="space-y-2 max-w-sm">
        <h1 className="font-display text-xl md:text-2xl font-bold text-frost">
          Grid Connection Lost
        </h1>
        <p className="font-body text-xs text-muted leading-relaxed">
          CarbonLens is running in offline mode. You can still access your cached statistics, 
          challenges, and logs, but live AI coaching and network sync are paused.
        </p>
      </div>

      <button
        onClick={handleRetry}
        className="px-5 py-2.5 bg-green hover:bg-green-dim text-void rounded-xl font-display text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
        aria-label="Retry connection"
      >
        <RefreshCw className="h-4 w-4" /> Reconnect to Grid
      </button>
    </div>
  );
}
