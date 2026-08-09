import React, { createContext, useContext, useState, useEffect } from 'react';

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
    text_input: "Major two-vehicle collision on Outer Ring Road near Marathahalli flyover. Passenger trapped with severe leg fracture and head trauma.",
    type: "ACCIDENT_RESCUE",
    severity: "CRITICAL",
    confidence: 96.0,
    explanation: "Multiple trauma indicators identified. ALS Ambulance dispatched with hydraulic rescue equipment and reserved ICU bed."
  },
  BLOOD_CRISIS: {
    title: "🩸 O- Negative Blood Crisis",
    text_input: "Urgent emergency blood requirement: 3 units of O- Negative blood for emergency emergency surgery patient at Victoria Hospital.",
    type: "BLOOD_CRISIS",
    severity: "HIGH",
    confidence: 91.0,
    explanation: "O- Negative universal donor search initiated across 15km radius. 4 compatible registered donors alerted."
  }
};

export const DemoProvider = ({ children }) => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueue, setOfflineQueue] = useState(() => {
    const saved = localStorage.getItem('resqone_offline_queue');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const [activeDispatch, setActiveDispatch] = useState({
    active: false,
    hospitalCoords: { lat: 16.5167, lng: 80.6500 },
    userCoords: { lat: 16.5180, lng: 80.6520 }
  });

  const toggleDemoMode = () => {
    setIsDemoMode(prev => !prev);
  };

  const queueOfflineReport = (report) => {
    const updated = [report, ...offlineQueue];
    setOfflineQueue(updated);
    localStorage.setItem('resqone_offline_queue', JSON.stringify(updated));
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
      offlineQueue,
      queueOfflineReport,
      clearOfflineQueue,
      activeDispatch,
      setActiveDispatch,
      PRESET_SCENARIOS
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => useContext(DemoContext);
