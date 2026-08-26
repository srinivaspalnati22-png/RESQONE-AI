import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { speakEmergencyInstruction } from '../services/audio_service';

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
  const [isDemoMode, setIsDemoMode] = useState(false);
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

  // Global Emergency Broadcast Notifications (Visible to all users, family, and agencies)
  const [emergencyNotifications, setEmergencyNotifications] = useState([
    {
      id: 'notif-init-1',
      title: '🚨 CRITICAL: High-Speed Crash on NH-16 Corridor',
      message: 'Multi-vehicle collision detected. 108 ALS unit dispatched. 2 Family members alerted via SMS.',
      severity: 'CRITICAL',
      timestamp: '2 mins ago',
      read: false,
      location: 'NH-16 Corridor, Vijayawada',
      familyNotified: ['Ramesh Varma (Father)', 'Lakshmi Varma (Mother)']
    },
    {
      id: 'notif-init-2',
      title: '🩸 Urgent O- Blood Courier En Route',
      message: 'Cold-chain blood courier dispatched from Red Cross to GGH Trauma ICU.',
      severity: 'HIGH',
      timestamp: '6 mins ago',
      read: false,
      location: 'Hanumanpet, Vijayawada',
      familyNotified: []
    }
  ]);

  const [globalSOSBanner, setGlobalSOSBanner] = useState(null);

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

    setOfflineQueue([]);
    localStorage.removeItem('resqone_offline_queue');
    setIsSyncing(false);
    setSyncFeedback(`Successfully synchronized ${queue.length} offline emergency submission(s) to cloud!`);
    setTimeout(() => setSyncFeedback(null), 5000);
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
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

    if (navigator.onLine) {
      setTimeout(() => syncQueueToSupabase(), 800);
    }
  };

  const clearOfflineQueue = () => {
    setOfflineQueue([]);
    localStorage.removeItem('resqone_offline_queue');
  };

  // Multi-Role Global Alerts Feed for Missions
  const [activeAlerts, setActiveAlerts] = useState([
    {
      id: 'alt-crash-101',
      type: 'ACCIDENT_RESCUE',
      title: 'Severe Vehicle Collision on NH-16 Gollapudi',
      severity: 'CRITICAL',
      location: 'NH-16 Bypass, Vijayawada',
      gForce: '4.85G',
      victim: 'Srinivas Palnati (O- Blood)',
      phone: '+91-9440123401',
      time: 'Just Now',
      status: 'PENDING_ACCEPTANCE',
      acceptedHospital: 'Government General Hospital (GGH Vijayawada)',
      acceptedAmbulance: 'ALS-108 (AP-TRAUMA-99)',
      familyAlerted: ['Father: Ramesh Varma (+91 9440123401)', 'Mother: Lakshmi Varma (+91 9440123402)'],
      acceptedBy: null
    },
    {
      id: 'alt-blood-102',
      type: 'BLOOD_SOS',
      title: 'Urgent 2 Units O- Negative Blood Required',
      severity: 'HIGH',
      location: 'GGH Regional Trauma Center, Vijayawada',
      victim: 'Trauma Emergency Patient #4401',
      phone: '+91-866-2472777',
      time: '2m ago',
      status: 'PENDING_ACCEPTANCE',
      familyAlerted: ['Emergency Guardian (+91 9440123403)'],
      acceptedBy: null
    },
    {
      id: 'alt-snake-103',
      type: 'SNAKEBITE',
      title: 'Spectacled Cobra Envenomation — AVS Needed',
      severity: 'CRITICAL',
      location: 'Gunadala Agricultural Belt, Vijayawada',
      victim: 'Farmer (Neurotoxic Symptoms)',
      phone: '+91-9440555002',
      time: '5m ago',
      status: 'PENDING_ACCEPTANCE',
      familyAlerted: ['Family Relative (+91 9440123404)'],
      acceptedBy: null
    },
    {
      id: 'alt-vol-104',
      type: 'VOLUNTEER_CPR',
      title: 'CPR & High-Water First Responder Request',
      severity: 'HIGH',
      location: 'MG Road Junction, Vijayawada',
      victim: 'Elderly Citizen (Cardiac Distress)',
      phone: '+91-9440555001',
      time: '9m ago',
      status: 'PENDING_ACCEPTANCE',
      familyAlerted: ['Spouse (+91 9440123405)'],
      acceptedBy: null
    }
  ]);

  const [acceptedHospital, setAcceptedHospital] = useState({
    name: 'Government General Hospital (GGH Vijayawada)',
    distance: '1.8 km',
    eta: '3.5 Mins',
    icuBed: 'Bay #4 Reserved',
    ambulance: 'ALS-108 (AP-TRAUMA-99)'
  });

  const [activeRole, setActiveRole] = useState('user'); // 'user' | 'hospital' | 'rescue' | 'donor' | 'volunteer'

  // Master Global SOS Broadcaster: Sends real-time notification to all agencies and family members
  const broadcastEmergencySOS = (payload) => {
    const sosId = payload.id || `sos-alert-${Date.now()}`;
    const timestamp = 'Just Now';
    const location = payload.location || payload.address || 'NH-16 Corridor, Vijayawada';
    const victim = payload.victim || payload.patient_name || 'Emergency User';
    const severity = payload.severity || 'CRITICAL';
    const familyMembers = [
      'Ramesh Varma (Father) • +91 9440123401',
      'Lakshmi Varma (Mother) • +91 9440123402'
    ];

    const newAlert = {
      id: sosId,
      type: payload.type || 'ACCIDENT_RESCUE',
      title: payload.title || `🚨 EMERGENCY SOS: ${victim} needs immediate rescue!`,
      severity,
      location,
      gForce: payload.gForce ? `${payload.gForce}G` : '4.85G',
      victim,
      phone: payload.phone || '+91-9440123401',
      time: timestamp,
      status: 'PENDING_ACCEPTANCE',
      acceptedHospital: 'Government General Hospital (GGH Vijayawada)',
      acceptedAmbulance: 'ALS-108 (AP-TRAUMA-99)',
      familyAlerted: familyMembers,
      acceptedBy: null
    };

    setActiveAlerts((prev) => [newAlert, ...prev]);

    const newNotification = {
      id: `notif-${Date.now()}`,
      title: `🚨 EMERGENCY SOS BROADCAST: ${victim}`,
      message: `Emergency SOS triggered at ${location}. 108 Ambulance, Trauma ICU, and 2 Family Members alerted with live GPS tracking.`,
      severity: 'CRITICAL',
      timestamp,
      read: false,
      location,
      familyNotified: familyMembers
    };

    setEmergencyNotifications((prev) => [newNotification, ...prev]);

    // Fire real browser notification if supported and granted
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`🚨 RESQONE EMERGENCY ALERT: ${victim}`, {
          body: `Emergency at ${location}. 108 Rescue CAD & Trauma ICU Bay alerted. Family SMS dispatched.`,
          icon: '/favicon.svg',
          tag: 'resqone-emergency-broadcast'
        });
      } catch (e) {
        console.warn('[Notification Error]', e);
      }
    }

    // Show Global Live Banner
    setGlobalSOSBanner({
      id: sosId,
      title: `🚨 EMERGENCY SOS BROADCASTED TO ALL AGENCIES & FAMILY`,
      victim,
      location,
      familyCount: familyMembers.length
    });

    setTimeout(() => {
      setGlobalSOSBanner(null);
    }, 10000);

    return newAlert;
  };

  const acceptAlert = (alertId, role, details = {}) => {
    setActiveAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id === alertId) {
          const updated = {
            ...alert,
            status: 'ACCEPTED',
            acceptedBy: role,
            acceptedAt: new Date().toLocaleTimeString(),
            ...details
          };
          if (details.hospitalName) {
            setAcceptedHospital((h) => ({
              ...h,
              name: details.hospitalName,
              status: 'ACCEPTED & DISPATCHED'
            }));
          }
          return updated;
        }
        return alert;
      })
    );
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
      PRESET_SCENARIOS,
      activeAlerts,
      setActiveAlerts,
      acceptedHospital,
      setAcceptedHospital,
      activeRole,
      setActiveRole,
      acceptAlert,
      emergencyNotifications,
      setEmergencyNotifications,
      globalSOSBanner,
      setGlobalSOSBanner,
      broadcastEmergencySOS
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => useContext(DemoContext);
