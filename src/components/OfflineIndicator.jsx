import React from 'react';
import { useDemo } from '../context/DemoContext';
import { WifiOff, CheckCircle2, RefreshCw, Wifi, Cloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OfflineIndicator = () => {
  const { isOnline, isSyncing, syncFeedback, offlineQueue, syncQueueToSupabase } = useDemo();

  if (isOnline && offlineQueue.length === 0 && !syncFeedback) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="w-full bg-[#0B1220] border-b border-slate-800 px-4 py-2.5 text-xs relative z-40"
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          {/* Offline Warning Banner */}
          {!isOnline && (
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <WifiOff className="w-4 h-4 animate-bounce" />
              <span>Offline Mesh Active — Submissions will automatically sync to Supabase once reconnected.</span>
            </div>
          )}

          {/* Sync Success Notification */}
          {syncFeedback && (
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>{syncFeedback}</span>
            </div>
          )}

          {/* Pending Queue Count & Manual Trigger */}
          {offlineQueue.length > 0 && (
            <div className="flex items-center space-x-3 text-slate-300">
              <span className="bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border border-amber-500/30">
                {offlineQueue.length} Emergency Action{offlineQueue.length > 1 ? 's' : ''} Queued
              </span>
              
              {isOnline && (
                <button
                  onClick={syncQueueToSupabase}
                  disabled={isSyncing}
                  className="flex items-center space-x-1.5 text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing to Supabase...' : 'Sync Now'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
