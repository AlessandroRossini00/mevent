const CACHE_NAME = "mevent-v1";
const OFFLINE_URL = "/offline.html";

//TODO vedere se possibile fare in typescript
self.addEventListener("install", (event) => {
  console.log("Service worker installing...");

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Setting {cache: 'reload'} in the new request ensures that
      // The browser fetches the resource from the remote server
      // without first looking in the cache, but then will update
      // the cache with the downloaded resource.
      return cache.add(new Request(OFFLINE_URL, { cache: "reload" }));
    }),
  );
  // Force the waiting service worker
  //to become the active service worker.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service worker activating...");

  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  console.log("Service worker fetching...", event.request.url);

  // Only call event.respondWith() if this is a navigation request for an HTML page.
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // First, try to use the navigation preload response if it's
          // supported.
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) {
            return preloadResponse;
          }
          // Always try the network first.
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch (error) {
          // catch is only triggered if an exception is thrown, which is
          // likely due to a network error.
          // If fetch() returns a valid HTTP response with a response code in
          // the 4xx or 5xx range, the catch() will NOT be called.
          console.log("Fetch failed; returning offline page instead.", error);
          const cache = await caches.open(CACHE_NAME);
          const cachedResponse = await cache.match(OFFLINE_URL);
          return cachedResponse;
        }
      })(),
    );
  }
});

self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();

    const options = {
      body: data.body ?? "",
      icon: data.icon ?? "/icons/icon-256.png",
      badge: data.badge ?? "/icons/icon-256.png",
      vibrate: [100, 50, 100],
      data: {
        url: data.url ?? "/",
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };

    event.waitUntil(
      self.registration.showNotification(data.title ?? "Mevent", options),
    );
  }
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received.");

  //event.notification.close();

  const url = event.notification.data?.url ?? "/";

  event.waitUntil(
    // Enumerate over all the windows/tabs to find a matching URL to focus; otherwise, open a new tab.
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            // Per andare direttamente alla chat dalla notifica
            return client.navigate(url).then(() => client.focus());
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});
