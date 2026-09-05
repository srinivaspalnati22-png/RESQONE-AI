import { supabase } from '../lib/supabaseClient.js';
import { playDisasterAlertSiren, stopDisasterAlertSiren, speakEmergencyInstruction } from './audio_service.js';
import { dispatchBackgroundPushToAll } from './push_subscription_service.js';

/**
 * Universal Disaster-Style Emergency Broadcast Service
 * 
 * Functions like National Cyclone / Disaster Early Warning Broadcasts:
 * - Broadcasts across all active tabs, PWA clients, and logged-in members.
 * - Triggers high-priority OS Screen Notifications with vibration and buzz tone even if app is backgrounded.
 * - Displays a full-screen high-urgency rescue overlay with victim details and live location.
 */

const BROADCAST_CHANNEL_NAME = 'resqone_emergency_mesh';
let meshChannel = null;
let realtimeChannel = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    meshChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch {}
}

/**
 * Request system notification permission from browser / mobile OS
 */
export const requestNotificationPermission = async () => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('[BroadcastService] Notification permission request error:', err);
    return 'default';
  }
};

export const getNotificationPermissionStatus = () => {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
};

/**
 * Send an OS system notification via ServiceWorker or Desktop Notification API
 */
export const showSystemNotification = (alertData) => {
  if (typeof window === 'undefined') return;

  const title = `🚨 CRITICAL EMERGENCY ALERT: ${alertData.victimName || 'Citizen in Distress'}`;
  const options = {
    body: `⚠️ Severe Crash at ${alertData.locationName || 'Live Highway Corridor'} (${alertData.distanceKm ? `${alertData.distanceKm}km away` : 'Nearby'}). Tap to view live location.`,
    icon: '/resqone_logo.jpg',
    badge: '/resqone_logo.jpg',
    vibrate: [800, 200, 800, 200, 1200, 300, 800],
    tag: `resqone-emergency-${alertData.id || Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      url: `/?disaster_alert=true&alert_id=${alertData.id || Date.now()}`,
      alertData
    }
  };

  // 1. Try via Service Worker (supports background & locked screens)
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_EMERGENCY_NOTIFICATION',
      payload: alertData
    });
    return;
  }

  // 2. Direct Window Notification fallback
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      const notif = new Notification(title, options);
      notif.onclick = () => {
        window.focus();
        window.dispatchEvent(new CustomEvent('resqone_disaster_alert', { detail: alertData }));
      };
    } catch {}
  }
};

/**
 * Broadcast an emergency disaster alert to all users, tabs, and installed devices
 */
export const broadcastDisasterAlert = async (alertPayload) => {
  const alertId = alertPayload.id || `alert-${Date.now()}`;
  const enrichedAlert = {
    id: alertId,
    timestamp: new Date().toISOString(),
    timeStr: new Date().toLocaleTimeString(),
    victimName: alertPayload.victimName || 'Suresh Varma',
    victimPhone: alertPayload.victimPhone || '+91 94401 23403',
    bloodGroup: alertPayload.bloodGroup || 'O+ Universal',
    relation: alertPayload.relation || 'Registered Family Member',
    locationName: alertPayload.locationName || 'National Highway 16, Vijayawada',
    lat: alertPayload.lat || 16.5068,
    lng: alertPayload.lng || 80.6561,
    severity: alertPayload.severity || 'CRITICAL_HIGH_IMPACT',
    impactG: alertPayload.impactG || 4.85,
    speedAtImpact: alertPayload.speedAtImpact || 78,
    medicalNotes: alertPayload.medicalNotes || 'Severe blunt trauma detected. Automatic CAD dispatch initiated.'
  };

  // 1. Store in localStorage for instant retrieval across sessions
  try {
    localStorage.setItem('resqone_active_disaster_alert', JSON.stringify(enrichedAlert));
  } catch {}

  // 2. Broadcast across all browser tabs via BroadcastChannel
  if (meshChannel) {
    try {
      meshChannel.postMessage({ type: 'EMERGENCY_DISASTER_ALERT', payload: enrichedAlert });
    } catch {}
  }

  // 3. Broadcast to Supabase Realtime (reaches all internet-connected devices)
  if (supabase) {
    try {
      const channel = supabase.channel('resqone_emergency_broadcast');
      channel.send({
        type: 'broadcast',
        event: 'EMERGENCY_DISASTER_ALERT',
        payload: enrichedAlert
      });
    } catch (err) {
      console.warn('[BroadcastService] Supabase Realtime broadcast exception:', err);
    }
  }

  // 4. Trigger system push notification with vibration locally
  showSystemNotification(enrichedAlert);

  // 4b. Dispatch Web Push to ALL registered devices (wakes up devices even when app is closed!)
  try {
    dispatchBackgroundPushToAll(enrichedAlert);
  } catch (pushErr) {
    console.warn('[BroadcastService] Background push dispatch exception:', pushErr);
  }

  // 5. Sound the Government EAS Disaster Siren and vibrate device
  playDisasterAlertSiren(8);

  // 6. Multilingual voice alert announcement
  const spokenText = `Critical emergency alert! High impact vehicle accident reported for ${enrichedAlert.victimName} at ${enrichedAlert.locationName}. Immediate rescue required.`;
  speakEmergencyInstruction(spokenText);

  // 7. Fire local custom window event to open Full-Screen Alert Modal
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('resqone_disaster_alert', { detail: enrichedAlert }));
  }

  return enrichedAlert;
};

/**
 * Dismiss the active disaster alert
 */
export const dismissDisasterAlert = () => {
  stopDisasterAlertSiren();
  try {
    localStorage.removeItem('resqone_active_disaster_alert');
  } catch {}

  if (meshChannel) {
    try {
      meshChannel.postMessage({ type: 'DISMISS_DISASTER_ALERT' });
    } catch {}
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('resqone_disaster_alert_dismissed'));
  }
};

/**
 * Subscribe to incoming disaster broadcasts from other devices / tabs
 */
export const subscribeToDisasterAlerts = (onAlertReceived, onDismissed) => {
  if (typeof window === 'undefined') return () => {};

  // 1. Check if there is already an active alert in localStorage
  try {
    const saved = localStorage.getItem('resqone_active_disaster_alert');
    if (saved) {
      const parsed = JSON.parse(saved);
      // If alert occurred within the last 15 minutes, show it
      const diffMin = (Date.now() - new Date(parsed.timestamp).getTime()) / (1000 * 60);
      if (diffMin < 15) {
        onAlertReceived(parsed);
      } else {
        localStorage.removeItem('resqone_active_disaster_alert');
      }
    }
  } catch {}

  // 2. Listen for BroadcastChannel events (local mesh)
  const handleMeshMessage = (event) => {
    if (event.data?.type === 'EMERGENCY_DISASTER_ALERT') {
      playDisasterAlertSiren(8);
      showSystemNotification(event.data.payload);
      onAlertReceived(event.data.payload);
    } else if (event.data?.type === 'DISMISS_DISASTER_ALERT') {
      stopDisasterAlertSiren();
      if (onDismissed) onDismissed();
    }
  };

  if (meshChannel) {
    meshChannel.addEventListener('message', handleMeshMessage);
  }

  // 3. Listen for window custom events
  const handleWindowEvent = (e) => {
    onAlertReceived(e.detail);
  };
  const handleDismissEvent = () => {
    if (onDismissed) onDismissed();
  };

  window.addEventListener('resqone_disaster_alert', handleWindowEvent);
  window.addEventListener('resqone_disaster_alert_dismissed', handleDismissEvent);

  // 4. Listen for Supabase Realtime events (cross-device cloud mesh)
  if (supabase) {
    try {
      realtimeChannel = supabase.channel('resqone_emergency_broadcast')
        .on('broadcast', { event: 'EMERGENCY_DISASTER_ALERT' }, (payload) => {
          playDisasterAlertSiren(8);
          showSystemNotification(payload.payload);
          onAlertReceived(payload.payload);
        })
        .subscribe();
    } catch {}
  }

  return () => {
    if (meshChannel) meshChannel.removeEventListener('message', handleMeshMessage);
    window.removeEventListener('resqone_disaster_alert', handleWindowEvent);
    window.removeEventListener('resqone_disaster_alert_dismissed', handleDismissEvent);
    if (realtimeChannel && supabase) {
      try { supabase.removeChannel(realtimeChannel); } catch {}
    }
  };
};

/**
 * 1-Tap Simulation of Government Disaster / Cyclone-Style Community Alert
 */
export const simulateCommunityDisasterAlert = (userCoords = [16.5068, 80.6561], victimName = 'Suresh Varma (Brother)') => {
  return broadcastDisasterAlert({
    id: `sim-disaster-${Date.now()}`,
    victimName: victimName,
    victimPhone: '+91 94401 23403',
    bloodGroup: 'O+ Universal',
    relation: 'Registered Family Member',
    locationName: 'National Highway 16, Vijayawada Bypass',
    lat: userCoords[0] + 0.008,
    lng: userCoords[1] + 0.012,
    severity: 'CRITICAL_HIGH_IMPACT',
    impactG: 5.12,
    speedAtImpact: 82,
    medicalNotes: 'Severe high-speed collision detected. Physical rollover risk. All community members and 108 responders alerted.'
  });
};
