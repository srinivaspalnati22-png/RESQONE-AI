import React from 'react';
import { useDemo } from '../context/DemoContext';
import { WifiOff, CheckCircle2, RefreshCw } from 'lucide-react';

export const OfflineIndicator = () => {
  const { isOnline, offlineQueue, clearOfflineQueue } = useDemo();

  if (isOnline && offlineQueue.length === 0) return null;

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 px-4 py-2 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        
        {!isOnline && (
          <div className="flex items-center space-x-2 text-amber-400 font-medium">
            <WifiOff className="w-4 h-4 animate-bounce" />
            <span>Operating in Offline Mesh Mode — Local Emergency Sync Active</span>
          </div>
        )}

        {offlineQueue.length > 0 && (
          <div className="flex items-center space-x-3 text-slate-300">
            <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded text-[11px] font-semibold border border-amber-500/30">
              {offlineQueue.length} Pending Emergency Report{offlineQueue.length > 1 ? 's' : ''} Queued
            </span>
            {isOnline && (
              <button
                onClick={clearOfflineQueue}
                className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync to Supabase Now</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
