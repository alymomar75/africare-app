const CACHE_NAME = 'africare-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS).catch(() => {}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).catch(() => caches.match('./index.html'));
    })
  );
});

// Notifications push (serveur)
self.addEventListener('push', (event) => {
  let data = {
    title: 'AfriCare',
    body: "Mise à jour de votre file d'attente",
    level: 'calm',
    url: './index.html'
  };
  try {
    if (event.data) data = Object.assign(data, event.data.json());
  } catch (e) {}

  const options = {
    body: data.body,
    icon: './icons/icon.svg',
    badge: './icons/icon.svg',
    tag: 'africare-queue',
    renotify: true,
    requireInteraction: data.level === 'now',
    vibrate: data.level === 'now' ? [200, 100, 200] : [100],
    data: { url: data.url || './index.html' },
    actions: [
      { action: 'open', title: 'Ouvrir AfriCare' },
      { action: 'dismiss', title: 'Fermer' }
    ]
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const target = (event.notification.data && event.notification.data.url) || './index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});

// Notifications locales (depuis la page)
self.addEventListener('message', (event) => {
  if (!event.data || event.data.type !== 'SHOW_NOTIF') return;
  const d = event.data.payload || {};
  event.waitUntil(
    self.registration.showNotification(d.title || 'AfriCare', {
      body: d.body || '',
      icon: './icons/icon.svg',
      badge: './icons/icon.svg',
      tag: 'africare-queue',
      renotify: true,
      requireInteraction: d.level === 'now',
      vibrate: d.level === 'now' ? [200, 100, 200] : [80],
      data: { url: './index.html' }
    })
  );
});
