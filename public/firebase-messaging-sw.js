importScripts(
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js"
);

firebase.initializeApp({

    
  apiKey: "AIzaSyBdyaDgbKwMlQEE9-pL8quejQjbWP9xkcQ",
  authDomain: "feelsafe-ba317.firebaseapp.com",
  projectId: "feelsafe-ba317",
  storageBucket: "feelsafe-ba317.firebasestorage.app",
  messagingSenderId: "142737832795",
  appId: "1:142737832795:web:762463fde5170d2deeb87e",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Mensaje recibido:",
    payload
  );

  const title =
    payload.notification?.title || "FeelSafe";

  const options = {
    body:
      payload.notification?.body ||
      "Tienes una nueva notificación.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: payload.data || {},
  };

  self.registration.showNotification(title, options);
});

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
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});