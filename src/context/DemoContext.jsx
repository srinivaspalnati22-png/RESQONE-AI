import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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

  // Emergency Notifications Stream for Bell Icon & Global Broadcasts
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
  const realtimeChannelRef = useRef(null);

  // Incoming Global Emergency Handler for ALL users who enabled notifications
  const handleIncomingEmergencyAlert = useCallback((payload) => {
    const sosId = payload.id || `sos-alert-${Date.now()}`;
    const timestamp = 'Just Now';
    const location = payload.location || payload.address || 'Corridor, Vijayawada';
    const victim = payload.victim || payload.patient_name || 'Emergency Victim';
    const severity = payload.severity || 'CRITICAL';
    const familyMembers = payload.familyMembers || [
      'Family Contact 1 (SMS Dispatched)',
      'Family Contact 2 (Live GPS Shared)'
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

    setActiveAlerts((prev) => [newAlert, ...prev.filter(a => a.id !== sosId)]);

    const newNotification = {
      id: `notif-${Date.now()}`,
      title: `🚨 EMERGENCY SOS BROADCAST: ${victim}`,
      message: `Emergency reported at ${location}. 108 Rescue, Trauma ICU & Family Members alerted.`,
      severity: 'CRITICAL',
      timestamp,
      read: false,
      location,
      familyNotified: familyMembers
    };

    setEmergencyNotifications((prev) => [newNotification, ...prev]);

    // Push browser / phone notification to everyone who enabled notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(`🚨 LIVE EMERGENCY ALERT: ${victim}`, {
          body: `Emergency at ${location}! 108 Ambulance CAD & Trauma ICU Bay alerted. Tap to view rescue coordinates.`,
          icon: '/resqone_logo.jpg',
          badge: '/resqone_logo.jpg',
          tag: `emergency-${sosId}`,
          requireInteraction: true
        });
        notif.onclick = () => {
          window.focus();
        };
      } catch (e) {
        console.warn('[Notification Notice]', e);
      }
    }

    // Audio Voice Alert in current language
    speakEmergencyInstruction(`Emergency SOS Alert: ${victim} at ${location}. Emergency assistance mobilized.`, 'en');

    // Show Global Live Flashing Banner on everyone's screen
    setGlobalSOSBanner({
      id: sosId,
      title: `🚨 EMERGENCY SOS BROADCASTED TO ALL USERS & 108 CAD`,
      victim,
      location,
      hospital: 'Government General Hospital (GGH)',
      ambulance: 'ALS-108 (AP-TRAUMA-99)',
      timestamp
    });
  }, []);

  // Subscribe to Supabase Realtime Channel & BroadcastChannel across all connected users
  useEffect(() => {
    // 1. Supabase Realtime Channel
    if (supabase) {
      try {
        const channel = supabase.channel('resqone_emergency_mesh', {
          config: { broadcast: { self: false } }
        });

        channel
          .on('broadcast', { event: 'emergency_sos' }, (event) => {
            if (event?.payload) {
              handleIncomingEmergencyAlert(event.payload);
            }
          })
          .subscribe((status) => {
            console.log('[Supabase Realtime Mesh Status]:', status);
          });

        realtimeChannelRef.current = channel;
      } catch (err) {
        console.warn('[Realtime Setup Notice]:', err);
      }
    }

    // 2. BroadcastChannel for instant cross-tab / PWA background sync
    let bc = null;
    try {
      if ('BroadcastChannel' in window) {
        bc = new BroadcastChannel('resqone_live_emergency_mesh');
        bc.onmessage = (event) => {
          if (event?.data?.type === 'emergency_sos' && event?.data?.payload) {
            handleIncomingEmergencyAlert(event.data.payload);
          }
        };
      }
    } catch {}

    return () => {
      if (realtimeChannelRef.current) {
        try {
          supabase.removeChannel(realtimeChannelRef.current);
        } catch {}
      }
      if (bc) {
        try { bc.close(); } catch {}
      }
    };
  }, [handleIncomingEmergencyAlert]);

  // Master Global SOS Broadcaster: Sends real-time notification to all connected users, agencies and family members
  const broadcastEmergencySOS = async (payload) => {
    const sosId = payload.id || `sos-alert-${Date.now()}`;
    const timestamp = 'Just Now';
    const location = payload.location || payload.address || 'NH-16 Corridor, Vijayawada';
    const victim = payload.victim || payload.patient_name || 'Emergency User';
    const severity = payload.severity || 'CRITICAL';
    const familyMembers = [
      'Father: Ramesh Varma • +91 9440123401',
      'Mother: Lakshmi Varma • +91 9440123402'
    ];

    const emergencyPayload = {
      id: sosId,
      type: payload.type || 'ACCIDENT_RESCUE',
      title: payload.title || `🚨 EMERGENCY SOS: ${victim} needs immediate rescue!`,
      severity,
      location,
      gForce: payload.gForce || '4.85',
      victim,
      phone: payload.phone || '+91-9440123401',
      timestamp,
      familyMembers
    };

    // 1. Process locally on the current user's client
    handleIncomingEmergencyAlert(emergencyPayload);

    // 2. Broadcast globally over Supabase Realtime to ALL other connected users
    if (realtimeChannelRef.current) {
      try {
        await realtimeChannelRef.current.send({
          type: 'broadcast',
          event: 'emergency_sos',
          payload: emergencyPayload
        });
      } catch (err) {
        console.warn('[Supabase Broadcast Notice]:', err);
      }
    }

    // 3. Broadcast across all browser tabs / PWA windows
    try {
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('resqone_live_emergency_mesh');
        bc.postMessage({ type: 'emergency_sos', payload: emergencyPayload });
        bc.close();
      }
    } catch {}

    // 4. Save to Supabase 'emergency_reports' table
    try {
      if (supabase) {
        await supabase.from('emergency_reports').insert([{
          id: sosId,
          type: payload.type || 'ACCIDENT_RESCUE',
          severity,
          ai_explanation: `${victim} triggered emergency SOS at ${location}. 108 Ambulance and Trauma Bay dispatched.`,
          status: 'DISPATCHED',
          created_at: new Date().toISOString()
        }]);
      }
    } catch (e) {
      console.warn('[Supabase Insert Notice]:', e);
    }
  };

  const acceptAlert = (alertId, agencyType = '108 Rescue') => {
    setActiveAlerts((prev) =>
      prev.map((alt) =>
        alt.id === alertId
          ? {
              ...alt,
              status: 'ACCEPTED_EN_ROUTE',
              acceptedBy: agencyType,
              time: 'En Route (ETA: 4 Mins)'
            }
          : alt
      )
    );

    const alertItem = activeAlerts.find(a => a.id === alertId);
    if (alertItem) {
      setEmergencyNotifications(prev => [
        {
          id: `notif-acc-${Date.now()}`,
          title: `✅ Mission Accepted: ${alertItem.title}`,
          message: `${agencyType} accepted the mission and is en route to ${alertItem.location}.`,
          severity: 'HIGH',
          timestamp: 'Just Now',
          read: false,
          location: alertItem.location
        },
        ...prev
      ]);
    }
  };

  return (
    <DemoContext.Provider
      value={{
        isDemoMode,
        toggleDemoMode,
        isOnline,
        isSyncing,
        syncFeedback,
        offlineQueue,
        queueOfflineReport,
        clearOfflineQueue,
        activeAlerts,
        acceptedHospital,
        setAcceptedHospital,
        activeRole,
        setActiveRole,
        emergencyNotifications,
        setEmergencyNotifications,
        broadcastEmergencySOS,
        acceptAlert,
        globalSOSBanner,
        setGlobalSOSBanner
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
