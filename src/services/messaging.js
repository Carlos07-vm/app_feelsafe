import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";

import app from "./firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// =====================================================
// Registrar Service Worker
// =====================================================
export const registrarServiceWorker = async () => {
  try {
    if (!("serviceWorker" in navigator)) {
      console.warn("❌ Este navegador no soporta Service Workers.");
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js"
    );

    console.log(
      "✅ Firebase Messaging Service Worker registrado:",
      registration.scope
    );

    return registration;
  } catch (error) {
    console.error(
      "❌ Error registrando Service Worker:",
      error
    );

    return null;
  }
};

// =====================================================
// Comprobar soporte
// =====================================================
export const messagingSoportado = async () => {
  try {
    return await isSupported();
  } catch (error) {
    console.error(
      "❌ Error comprobando soporte de FCM:",
      error
    );

    return false;
  }
};

// =====================================================
// Obtener token FCM
// =====================================================
export const obtenerTokenFCM = async () => {
  try {
    const soportado = await messagingSoportado();

    if (!soportado) {
      console.warn(
        "⚠️ Este navegador no soporta Firebase Cloud Messaging."
      );

      return null;
    }

    const registration = await registrarServiceWorker();

    if (!registration) {
      return null;
    }

    // Solicitar permiso
    const permiso = await Notification.requestPermission();

    console.log(
      "🔔 Permiso de notificaciones:",
      permiso
    );

    if (permiso !== "granted") {
      console.warn(
        "⚠️ El usuario no concedió permiso para notificaciones."
      );

      return null;
    }

    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn(
        "❌ Firebase no devolvió ningún token FCM."
      );

      return null;
    }

    console.log("=================================");
    console.log("✅ TOKEN FCM OBTENIDO");
    console.log(token);
    console.log("=================================");

    return token;

  } catch (error) {
    console.error(
      "❌ Error obteniendo token FCM:",
      error
    );

    return null;
  }
};

// =====================================================
// Escuchar mensajes con la app abierta
// =====================================================
export const escucharMensajesFCM = async (callback) => {
  try {
    const soportado = await messagingSoportado();

    if (!soportado) {
      return () => {};
    }

    const messaging = getMessaging(app);

    const unsubscribe = onMessage(
      messaging,
      (payload) => {
        console.log(
          "📩 Notificación FCM recibida:",
          payload
        );

        if (callback) {
          callback(payload);
        }
      }
    );

    return unsubscribe;

  } catch (error) {
    console.error(
      "❌ Error escuchando mensajes FCM:",
      error
    );

    return () => {};
  }
};