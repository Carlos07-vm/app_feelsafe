import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import { arrayRemove, doc, updateDoc } from "firebase/firestore";

import app, { db } from "./firebase";
import { firebaseConfig, vapidKey } from "./firebaseConfig";

const VAPID_KEY = vapidKey || import.meta.env.VITE_FIREBASE_VAPID_KEY;

// =====================================================
// 1. REPRODUCIR SONIDO SUAVE DE NOTIFICACIÓN (Web Audio API)
// Sin dependencias de archivos externos
// =====================================================
export const reproducirSonidoNotificacion = (tipo = "info") => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";

    if (tipo === "alerta" || tipo === "warning" || tipo === "danger") {
      // Tono de alerta suave: 440Hz -> 660Hz
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    } else if (tipo === "mensaje" || tipo === "message") {
      // Doble tono para mensajes: 523.25Hz -> 783.99Hz
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.31);
    } else {
      // Tono suave de campana / recordatorio: 587.33Hz (D5) -> 880Hz (A5)
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.41);
    }
  } catch (err) {
    console.debug("Audio de notificación no disponible:", err);
  }
};

// =====================================================
// 2. REGISTRAR SERVICE WORKER
// =====================================================
// 2. REGISTRAR SERVICE WORKER
// =====================================================
export const registrarServiceWorker = async () => {
  try {
    if (!("serviceWorker" in navigator)) {
      console.warn("⚠️ Este navegador no soporta Service Workers.");
      return null;
    }

    const registration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
      { scope: "/" }
    );

    // Enviar configuración de Firebase al Service Worker
    if (registration.active) {
      registration.active.postMessage({
        type: "INIT_FIREBASE_MESSAGING",
        config: firebaseConfig,
      });
    } else if (registration.installing) {
      registration.installing.postMessage({
        type: "INIT_FIREBASE_MESSAGING",
        config: firebaseConfig,
      });
    }

    // Firebase Messaging Service Worker registrado

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
// 3. COMPROBAR SOPORTE FCM
// =====================================================
export const messagingSoportado = async () => {
  try {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }
    return await isSupported();
  } catch (error) {
    console.warn("⚠️ FCM no soportado en este entorno:", error);
    return false;
  }
};

// =====================================================
// 4. SOLICITAR PERMISOS DE NOTIFICACIÓN NATIVA
// =====================================================
export const solicitarPermisoNotificaciones = async () => {
  try {
    if (!("Notification" in window)) {
      return "unsupported";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error solicitando permisos de notificación:", error);
    return "denied";
  }
};

// =====================================================
// 5. MOSTRAR NOTIFICACIÓN NATIVA DEL NAVEGADOR
// =====================================================
export const mostrarNotificacionNativa = ({
  title = "FeelSafe",
  body = "",
  icon = "/favicon.ico",
  tag = "feelsafe-notif",
  onClick = null,
}) => {
  try {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return null;
    }

    const notif = new Notification(title, {
      body,
      icon,
      tag,
      badge: "/favicon.ico",
    });

    if (onClick) {
      notif.onclick = () => {
        window.focus();
        onClick();
        notif.close();
      };
    }

    return notif;
  } catch (err) {
    console.warn("No se pudo mostrar notificación nativa:", err);
    return null;
  }
};

// =====================================================
// 6. OBTENER TOKEN FCM
// =====================================================
export const obtenerTokenFCM = async () => {
  try {
    const soportado = await messagingSoportado();

    if (!soportado) {
      console.warn("⚠️ FCM no soportado en este navegador.");
      return null;
    }

    const registration = await registrarServiceWorker();
    if (!registration) {
      return null;
    }

    // Solicitar permiso
    const permiso = await solicitarPermisoNotificaciones();
    if (permiso !== "granted") {
      console.warn("⚠️ Permiso de notificaciones no concedido:", permiso);
      return null;
    }

    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      return null;
    }

    return token;
  } catch (error) {
    console.error("❌ Error obteniendo token FCM:", error);
    return null;
  }
};

export const retirarTokenFCM = async (user) => {
  try {
    if (!user?.uid || typeof Notification === "undefined" || Notification.permission !== "granted") {
      return;
    }

    const soportado = await messagingSoportado();
    if (!soportado) return;

    const registration = await registrarServiceWorker();
    if (!registration) return;

    const token = await getToken(getMessaging(app), {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return;

    await Promise.allSettled(
      ["usuarios", "specialists"].map((collectionName) =>
        updateDoc(doc(db, collectionName, user.uid), {
          fcmTokens: arrayRemove(token),
        })
      )
    );
  } catch (error) {
    console.warn("No se pudo retirar el dispositivo de notificaciones.", error?.code || "unknown");
  }
};

// =====================================================
// 7. ESCUCHAR MENSAJES FCM EN PRIMER PLANO
// =====================================================
export const escucharMensajesFCM = async (callback) => {
  try {
    const soportado = await messagingSoportado();
    if (!soportado) {
      return () => {};
    }

    const messaging = getMessaging(app);

    const unsubscribe = onMessage(messaging, (payload) => {
      if (callback) {
        callback(payload);
      }
    });

    return unsubscribe;
  } catch (error) {
    console.error("❌ Error escuchando mensajes FCM:", error);
    return () => {};
  }
};

