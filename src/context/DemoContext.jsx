import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

const DemoContext = createContext();

export const PRESET_SCENARIOS = {
  SNAKEBITE: {
    title: "🐍 Cobra Snakebite Emergency",
    text_input: "Bit by a black snake with a distinct hood mark near Kalasipalya market. Leg is swelling rapidly, feeling dizzy and nauseous.",
    type: "SNAKEBITE",
    severity: "CRITICAL",
    confidence: 94.5,
    explanation: "Visual characteristics match Spectacled Cobra (Naja naja). High neurotoxic venom risk requiring immediate AVS hospital dispatch."
  },
  ACCIDENT: {
    title: "🚗 Highway Car Crash Rescue",
    text_input: "Major two-vehicle collision on NH-16 highway near Vijayawada bypass. Passenger trapped with severe leg fracture and head trauma.",
    type: "ACCIDENT_RESCUE",
    severity: "CRITICAL",
    confidence: 96.0,
    explanation: "Multiple trauma indicators identified. ALS Ambulance dispatched with hydraulic rescue equipment and reserved ICU bed."
  },
  BLOOD_CRISIS: {
    title: "🩸 O- Negative Blood Crisis",
    text_input: "Urgent emergency blood requirement: 3 units of O- Negative blood for emergency trauma surgery patient at Victoria Hospital.",
    type: "BLOOD_CRISIS",
    severity: "HIGH",
    confidence: 91.0,
    explanation: "O- Negative universal donor search initiated across 15km radius. 4 compatible registered blood banks & donors alerted."
  }
};

export const DemoProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  const [offlineQueue, setOfflineQueue] = useState(() => {
    try {
      const saved = localStorage.getItem('resqone_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeDispatch, setActiveDispatch] = useState({
    active: false,
    ambulanceState: 'AVAILABLE',
    hospitalCoords: { lat: 16.5167, lng: 80.6500 },
    userCoords: { lat: 16.5180, lng: 80.6520 }
  });

  // Sync queued items to Supabase
  const syncQueueToSupabase = useCallback(async () => {
    const queue = JSON.parse(localStorage.getItem('resqone_offline_queue') || '[]');
    if (queue.length === 0) return;

    setIsSyncing(true);
    let successCount = 0;

    for (const item of queue) {
      try {
        if (supabase) {
          await supabase.from('emergency_reports').insert([{
            id: item.id || `rep-${Date.now()}`,
            type: item.type || 'EMERGENCY',
            severity: item.severity || 'HIGH',
            ai_explanation: item.ai_explanation || item.reason || item.title || 'Offline Queued Emergency Sync',
            status: 'SYNCED',
            created_at: item.timestamp || new Date().toISOString()
          }]);
          successCount++;
        }
      } catch (err) {
        console.warn('[OfflineSync] Error syncing report to Supabase:', err);
      }
    }

    // Clear queue after sync attempt
    setOfflineQueue([]);
    localStorage.removeItem('resqone_offline_queue');
    setIsSyncing(false);
    setSyncFeedback(`Successfully synchronized ${queue.length} offline emergency submission(s) to cloud!`);
    setTimeout(() => setSyncFeedback(null), 5000);
  }, []);

  // Listen for online / offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync on connection restoration
      syncQueueToSupabase();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncQueueToSupabase]);

  const toggleDemoMode = () => setIsDemoMode(prev => !prev);

  const queueOfflineReport = (report) => {
    const updated = [report, ...offlineQueue];
    setOfflineQueue(updated);
    localStorage.setItem('resqone_offline_queue', JSON.stringify(updated));

    // If online, attempt immediate sync in background
    if (navigator.onLine) {
      setTimeout(() => syncQueueToSupabase(), 800);
    }
  };

  const clearOfflineQueue = () => {
    setOfflineQueue([]);
    localStorage.removeItem('resqone_offline_queue');
  };

  return (
    <DemoContext.Provider value={{
      isDemoMode,
      toggleDemoMode,
      isOnline,
      isSyncing,
      syncFeedback,
      offlineQueue,
      queueOfflineReport,
      clearOfflineQueue,
      syncQueueToSupabase,
      activeDispatch,
      setActiveDispatch,
      PRESET_SCENARIOS
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => useContext(DemoContext);
