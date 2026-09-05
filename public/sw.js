const CACHE_NAME = 'resqone-v5';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first caching strategy
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request).then((cached) => {
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// ================= GOVERNMENT DISASTER / CYCLONE-STYLE ALERT PUSH =================

// Handle incoming Web Push events (even when app is completely closed)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: '🚨 CRITICAL RESCUE ALERT', body: event.data ? event.data.text() : 'Emergency alert reported near you!' };
  }

  const title = data.title || '🚨 RESQONE EMERGENCY DISASTER ALERT';
  const victim = data.victimName || 'Citizen in Distress';
  const location = data.locationName || 'Live GPS Corridor';
  const body = data.body || `⚠️ ${victim} requires immediate rescue at ${location}. Tap to open live navigation route.`;
  const trackingUrl = data.trackingUrl || `/?disaster_alert=true&category=${(data.category || 'accident').toLowerCase()}&alert_id=${data.alertId || Date.now()}`;

  const options = {
    body: body,
    icon: '/resqone_logo.jpg',
    badge: '/resqone_logo.jpg',
    vibrate: data.vibrate || [1000, 250, 1000, 250, 1500, 300, 1000],
    tag: `resqone-disaster-${data.alertId || Date.now()}`,
    renotify: true,
    requireInteraction: true,
    silent: false,
    timestamp: Date.now(),
    data: {
      url: trackingUrl,
      alertData: data
    },
    actions: data.actions || [
      { action: 'navigate', title: '📍 View Live Route' },
      { action: 'call', title: '📞 Call 108 Emergency' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle local broadcast messages from client windows
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_EMERGENCY_NOTIFICATION') {
    const alert = event.data.payload || {};
    const title = `🚨 RESCUE ALERT: ${alert.victimName || 'Citizen in Distress'}`;
    const options = {
      body: `CRITICAL ACCIDENT at ${alert.locationName || 'Live GPS Corridor'}. Tap to assist immediately!`,
      icon: '/resqone_logo.jpg',
      badge: '/resqone_logo.jpg',
      vibrate: [800, 200, 800, 200, 1200, 300, 800],
      tag: `resqone-disaster-${alert.id || Date.now()}`,
      renotify: true,
      requireInteraction: true,
      data: {
        url: `/?disaster_alert=true&alert_id=${alert.id || Date.now()}`,
        alertData: alert
      },
      actions: [
        { action: 'navigate', title: '📍 View Live Route' },
        { action: 'call', title: '📞 Call 108' }
      ]
    };

    self.registration.showNotification(title, options);
  }
});

// Handle notification tap / click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const action = event.action;
  const targetUrl = event.notification.data?.url || '/';

  if (action === 'call') {
    event.waitUntil(
      clients.openWindow('tel:108')
    );
    return;
  }

  // Focus existing open window or open a new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
