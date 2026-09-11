importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

let messaging = null;

// Recibir configuración de Firebase desde la ventana principal
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "INIT_FIREBASE_MESSAGING") {
    const firebaseConfig = event.data.config;
    
    if (!firebaseConfig || !firebaseConfig.apiKey) {
      console.error("[SW] Invalid Firebase configuration received");
      return;
    }

    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      messaging = firebase.messaging();
      messaging.onBackgroundMessage((payload) => {
        handleBackgroundMessage(payload);
      });
      console.log("[SW] Firebase Messaging initialized successfully");
    } catch (error) {
      console.error("[SW] Error initializing Firebase:", error);
    }
  }
});

self.addEventListener("install", () => {
  self.skipWaiting();
});

function handleBackgroundMessage(payload) {
  const title =
    payload.notification?.title || payload.data?.title || "FeelSafe";

  const options = {
    body:
      payload.notification?.body ||
      payload.data?.body ||
      "Tienes una nueva notificación en FeelSafe.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: payload.data?.tag || "feelsafe-notification",
    data: payload.data || {},
  };

  self.registration.showNotification(title, options);
}

// Manejar clicks en notificaciones
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    event.notification?.data?.url || "/";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true,
    }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          if (url && url !== "/" && "navigate" in client) {
            client.navigate(url);
          }
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
