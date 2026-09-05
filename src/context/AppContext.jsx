import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import {
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  arrayUnion,
  collection,
  query,
  where,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../services/firebase";

import {
  obtenerTokenFCM,
  escucharMensajesFCM,
  reproducirSonidoNotificacion,
  mostrarNotificacionNativa,
  solicitarPermisoNotificaciones,
} from "../services/messaging";

import NotificationToast from "../components/NotificationToast";

const AppContext = createContext();

const defaultUserData = {
  currentMood: "Neutral",
  wellbeing: 72,
  streak: 0,
  notes: [],
  emotions: [],
  description:
    "Comparte algo sobre ti y personaliza tu perfil.",
  profile: {},
};

const buildUser = (
  firebaseUser,
  data = {},
  tipoCuenta = "usuario"
) => {

  return {
    uid: firebaseUser.uid,

    displayName:
      firebaseUser.displayName ||
      data.nombre ||
      data.nombreCompleto ||
      data.name ||
      data.correo ||
      firebaseUser.email ||
      "Usuario",

    email:
      firebaseUser.email ||
      data.correo ||
      "",

    photoURL:
      data.photoURL ||
      data.fotoPerfil ||
      data.foto ||
      firebaseUser.photoURL ||
      "",

    foto:
      data.foto ||
      data.fotoPerfil ||
      data.photoURL ||
      firebaseUser.photoURL ||
      "",

    provider:
      firebaseUser.providerData?.[0]?.providerId ||
      data.proveedor ||
      "",

    // IMPORTANTE
    tipoCuenta,

    accountType: tipoCuenta,

    rol:
      data.rol ||
      tipoCuenta,

    especialidad:
      data.especialidad ||
      "",

    experiencia:
      data.experiencia ?? 0,

    telefono:
      data.telefono ||
      "",

    descripcion:
      data.descripcion ||
      data.description ||
      defaultUserData.description,

    estado:
      data.estado ||
      "Activo",

    disponible:
      data.disponible ?? true,

    correoVerificado:
      data.correoVerificado ??
      firebaseUser.emailVerified ??
      false,

    currentMood:
      data.currentMood ||
      defaultUserData.currentMood,

    wellbeing:
      data.wellbeing ??
      defaultUserData.wellbeing,

    streak:
      data.streak ??
      defaultUserData.streak,

    notes:
      data.notes ||
      defaultUserData.notes,

    emotions:
      data.emotions ||
      defaultUserData.emotions,

    profile:
      data.profile ||
      defaultUserData.profile,

    ...data,

    // Nunca permitir que Firestore
    // cambie estos valores
    uid: firebaseUser.uid,

    tipoCuenta,

    accountType: tipoCuenta,

    rol:
      data.rol ||
      tipoCuenta,
  };
};

// =========================================
// REGISTRAR DISPOSITIVO PARA NOTIFICACIONES (ÁMBITO DE MÓDULO)
// =========================================
const registrarNotificaciones = async (
  firebaseUser,
  tipoCuenta
) => {
  try {
    if (!firebaseUser?.uid) {
      return;
    }

    const token = await obtenerTokenFCM();
    if (!token) {
      console.warn("⚠️ No se pudo obtener token FCM.");
      return;
    }

    const collectionName =
      tipoCuenta === "especialista"
        ? "specialists"
        : "usuarios";

    const userRef = doc(
      db,
      collectionName,
      firebaseUser.uid
    );

    await setDoc(
      userRef,
      {
        fcmTokens: arrayUnion(token),
        notificacionesPush: true,
      },
      {
        merge: true,
      }
    );
  } catch (error) {
    // Token FCM no pudo registrarse
  }
};

export function AppProvider({ children }) {
  const [user, setUserState] = useState(() => {
    try {
      const cached = localStorage.getItem("feelsafe_cached_user");
      return cached ? JSON.parse(cached) : null;
    } catch (e) {
      return null;
    }
  });

  const setUser = useCallback((newUser) => {
    setUserState(newUser);
    try {
      if (newUser) {
        localStorage.setItem("feelsafe_cached_user", JSON.stringify(newUser));
      } else {
        localStorage.removeItem("feelsafe_cached_user");
      }
    } catch (e) {}
  }, []);

  const [loading, setLoading] = useState(() => {
    return !localStorage.getItem("feelsafe_cached_user");
  });

  // =========================================
  // ESTADOS DE TEMA E IDIOMA (INICIALIZACIÓN PEREZOSA)
  // =========================================
  const [theme, setTheme] = useState(
    () => localStorage.getItem("feelsafe_theme") || "light"
  );
  const [language, setLanguage] = useState(
    () => localStorage.getItem("feelsafe_language") || "es"
  );

  // Efecto para aplicar el tema al HTML automáticamente
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('feelsafe_theme', theme);
  }, [theme]);

  // Efecto para guardar el idioma
  useEffect(() => {
    localStorage.setItem('feelsafe_language', language);
  }, [language]);

  // Funciones para alternar que usaremos en los botones
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const toggleLanguage = () => {
    setLanguage((prevLang) => (prevLang === 'es' ? 'en' : 'es'));
  };
  // =========================================

  useEffect(() => {

    let unsubscribeProfile = null;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        async (firebaseUser) => {

          console.log(
            "================================="
          );

          console.log(
            "AUTH STATE"
          );

          console.log(
            "UID:",
            firebaseUser?.uid
          );

          console.log(
            "EMAIL:",
            firebaseUser?.email
          );

          console.log(
            "================================="
          );

          // =========================================
          // NO HAY SESIÓN
          // =========================================

          if (!firebaseUser) {

            setUser(null);
            setLoading(false);

            return;
          }

          try {

            setLoading(true);

            // =========================================
            // BUSCAR ESPECIALISTA
            // =========================================

            const specialistRef =
              doc(
                db,
                "specialists",
                firebaseUser.uid
              );

            const specialistSnap =
              await getDoc(
                specialistRef
              );

            // =========================================
            // ESPECIALISTA
            // =========================================

            if (
              specialistSnap.exists()
            ) {

              const specialistData =
                specialistSnap.data();

              console.log(
                "🩺 CUENTA ESPECIALISTA"
              );

              console.log(
                specialistData
              );

              const specialistUser =
                buildUser(
                  firebaseUser,
                  specialistData,
                  "especialista"
                );

              setUser(
                specialistUser
              );

              setLoading(false);
              registrarNotificaciones(
              firebaseUser,
              "especialista"
            );

              unsubscribeProfile =
                onSnapshot(
                  specialistRef,
                  (snapshot) => {

                    if (
                      snapshot.exists()
                    ) {

                      setUser(
                        buildUser(
                          firebaseUser,
                          snapshot.data(),
                          "especialista"
                        )
                      );

                    }

                  },
                  (error) => {

                    console.error(
                      "Error escuchando especialista:",
                      error
                    );

                  }
                );

              return;
            }

            // =========================================
            // USUARIO NORMAL
            // =========================================

            const userRef =
              doc(
                db,
                "usuarios",
                firebaseUser.uid
              );

            const userSnap =
              await getDoc(
                userRef
              );

            if (
              userSnap.exists()
            ) {

              const userData =
                userSnap.data();

              console.log(
                "👤 CUENTA USUARIO"
              );

              console.log(
                userData
              );

              const normalUser =
                buildUser(
                  firebaseUser,
                  userData,
                  "usuario"
                );

              setUser(
                normalUser
              );

              setLoading(false);

              registrarNotificaciones(
              firebaseUser,
              "usuario"
            );

              unsubscribeProfile =
                onSnapshot(
                  userRef,
                  (snapshot) => {

                    if (
                      snapshot.exists()
                    ) {

                      setUser(
                        buildUser(
                          firebaseUser,
                          snapshot.data(),
                          "usuario"
                        )
                      );

                    }

                  },
                  (error) => {

                    console.error(
                      "Error escuchando usuario:",
                      error
                    );

                  }
                );

              return;
            }

            // =========================================
            // CREAR PERFIL DE USUARIO SI NO EXISTE
            // =========================================

            console.log(
              "⚠️ No existe perfil. Creando usuario..."
            );

            const newUser =
              buildUser(
                firebaseUser,
                {},
                "usuario"
              );

            await setDoc(
              userRef,
              {
                uid:
                  firebaseUser.uid,

                nombre:
                  firebaseUser.displayName ||
                  "",

                correo:
                  firebaseUser.email ||
                  "",

                photoURL:
                  firebaseUser.photoURL ||
                  "",

                foto:
                  firebaseUser.photoURL ||
                  "",

                proveedor:
                  firebaseUser.providerData?.[0]
                    ?.providerId ||
                  "",

                tipoCuenta:
                  "usuario",

                accountType:
                  "usuario",

                rol:
                  "usuario",

                estado:
                  "Activo",

                createdAt:
                  new Date().toISOString(),

                ...defaultUserData,
              },
              {
                merge: true,
              }
            );

            setUser(
              newUser
            );

            setLoading(false);

            registrarNotificaciones(
            firebaseUser,
            "usuario"
          );

          } catch (error) {

            console.error(
              "❌ Error cargando perfil:",
              error
            );

            setUser(null);
            setLoading(false);
          }
        }
      );

    return () => {

      unsubscribeAuth();

      if (unsubscribeProfile) {
        unsubscribeProfile();
      }

    };

  }, []);

  // =========================================
  // GESTIÓN DE NOTIFICACIONES Y RECORDATORIOS (IN-APP Y PUSH)
  // =========================================
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerNotification = useCallback(
    ({
      type = "info", // "message", "reminder", "quote", "wellness", "alert", "info"
      title = "FeelSafe",
      body = "",
      url = null,
      actionLabel = null,
      duration = 6000,
      sound = true,
      force = false,
      onClick = null,
    }) => {
      // 1. Validar preferencias de usuario
      if (!force) {
        if (type === "message" && localStorage.getItem("notif_messages") === "false") {
          return;
        }
        if (type === "reminder" && localStorage.getItem("notif_emotions") === "false") {
          return;
        }
        if (type === "quote" && localStorage.getItem("notif_daily_quotes") === "false") {
          return;
        }
      }

      // 2. Reproducir sonido agradable si está activo
      if (sound) {
        reproducirSonidoNotificacion(type);
      }

      // 3. Notificación nativa del sistema/navegador
      mostrarNotificacionNativa({
        title,
        body,
        onClick: onClick || (url ? () => (window.location.href = url) : null),
      });

      // 4. Agregar Toast interactivo en pantalla
      const newToast = {
        id: Date.now() + Math.random().toString(36).substr(2, 4),
        type,
        title,
        body,
        url,
        actionLabel,
        duration,
        onClick,
      };

      setToasts((prev) => [newToast, ...prev.slice(0, 3)]); // Máximo 4 en pantalla
    },
    []
  );

  // Probar sistema de notificaciones
  const testNotificationSystem = async () => {
    const perm = await solicitarPermisoNotificaciones();
    triggerNotification({
      type: "reminder",
      title: language === "es" ? "🔔 ¡Sistema de Notificaciones Activo!" : "🔔 Notification System Active!",
      body: language === "es"
        ? "Las notificaciones, sonidos y recordatorios de FeelSafe están funcionando correctamente."
        : "FeelSafe notifications, audio and reminders are working properly.",
      url: "/dashboard",
      actionLabel: language === "es" ? "Excelente" : "Great",
      duration: 7000,
      force: true,
    });
    return perm;
  };

  // =========================================
  // ESCUCHAR NOTIFICACIONES FCM EN PRIMER PLANO
  // =========================================
  useEffect(() => {
    let unsubscribe = null;

    const iniciarEscucha = async () => {
      try {
        unsubscribe = await escucharMensajesFCM((payload) => {


          const titulo =
            payload.notification?.title ||
            payload.data?.title ||
            "FeelSafe";

          const mensaje =
            payload.notification?.body ||
            payload.data?.body ||
            "Tienes una nueva notificación.";

          const url = payload.data?.url || null;
          const type = payload.data?.type || "message";

          triggerNotification({
            type,
            title: titulo,
            body: mensaje,
            url,
            actionLabel: language === "es" ? "Ver" : "View",
          });
        });
      } catch (error) {
        console.error("❌ Error iniciando escucha FCM:", error);
      }
    };

    iniciarEscucha();

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [triggerNotification, language]);

  // =========================================
  // ESCUCHA DE MENSAJES DE CHAT EN TIEMPO REAL (NOTIFICAR NUEVOS MENSAJES)
  // =========================================
  useEffect(() => {
    if (!user?.uid) return;

    const isSpecialist =
      user.tipoCuenta === "especialista" || user.rol === "especialista";
    const fieldToQuery = isSpecialist ? "especialistaId" : "usuarioId";

    const q = query(
      collection(db, "conversaciones_especialistas"),
      where(fieldToQuery, "==", user.uid)
    );

    let isInitialMount = true;
    const lastKnownMessages = new Map();

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (isInitialMount) {
          snapshot.docs.forEach((docSnap) => {
            const data = docSnap.data();
            lastKnownMessages.set(docSnap.id, data.ultimoMensaje || "");
          });
          isInitialMount = false;
          return;
        }

        snapshot.docChanges().forEach((change) => {
          if (change.type === "modified" || change.type === "added") {
            const data = change.doc.data();
            const prevMsg = lastKnownMessages.get(change.doc.id);
            const currentMsg = data.ultimoMensaje;

            // Notificar solo si el mensaje es nuevo y fue enviado por la otra persona
            if (
              currentMsg &&
              currentMsg !== prevMsg &&
              data.ultimoEmisorId &&
              data.ultimoEmisorId !== user.uid
            ) {
              lastKnownMessages.set(change.doc.id, currentMsg);

              const senderName = isSpecialist
                ? data.usuarioNombre || "Paciente"
                : data.especialistaNombre || "Especialista";

              const chatUrl = isSpecialist
                ? `/specialist-chat/${change.doc.id}`
                : `/chat-room`;

              triggerNotification({
                type: "message",
                title: `💬 ${senderName}`,
                body: currentMsg,
                url: chatUrl,
                actionLabel: isSpecialist
                  ? language === "es" ? "Responder" : "Reply"
                  : language === "es" ? "Ver Chat" : "View Chat",
              });
            } else if (currentMsg) {
              lastKnownMessages.set(change.doc.id, currentMsg);
            }
          }
        });
      },
      (err) => {
        console.warn("Listener de mensajes para notificaciones:", err);
      }
    );

    return () => unsubscribe();
  }, [user?.uid, user?.tipoCuenta, triggerNotification, language]);

  // =========================================
  // MOTOR DE RECORDATORIOS AUTOMÁTICOS BASADOS EN FUNCIONES
  // =========================================
  useEffect(() => {
    if (!user?.uid || user.tipoCuenta === "especialista") return;

    // Timeout inicial suave después de que la app cargue (3.5 segundos)
    const initialTimer = setTimeout(() => {
      ejecutarRecordatorios();
    }, 3500);

    // Chequeo periódico cada hora
    const intervalTimer = setInterval(() => {
      ejecutarRecordatorios();
    }, 60 * 60 * 1000);

    function ejecutarRecordatorios() {
      const todayStr = new Date().toISOString().split("T")[0];
      const nowHour = new Date().getHours();

      // 1. Recordatorio de Registro Diario de Emociones
      const notifEmotions = localStorage.getItem("notif_emotions") !== "false";
      const lastCheckinReminder = localStorage.getItem("last_notif_checkin");

      if (notifEmotions && lastCheckinReminder !== todayStr) {
        // Verificar si el usuario ya registró alguna emoción hoy
        const hasLoggedToday =
          Array.isArray(user.emotions) &&
          user.emotions.some(
            (em) =>
              em.fecha === todayStr ||
              (typeof em.date === "string" && em.date.startsWith(todayStr))
          );

        if (!hasLoggedToday) {
          localStorage.setItem("last_notif_checkin", todayStr);
          triggerNotification({
            type: "reminder",
            title:
              language === "es"
                ? "⏰ ¿Cómo te sientes hoy?"
                : "⏰ How are you feeling today?",
            body:
              language === "es"
                ? "Tómate 1 minuto para registrar tu emoción del día y fortalecer tu racha de bienestar."
                : "Take 1 minute to log your daily emotion and strengthen your streak.",
            url: "/mood",
            actionLabel: language === "es" ? "Registrar ahora" : "Log now",
          });
          return;
        }
      }

      // 2. Frase y Reto Matutino
      const notifQuotes =
        localStorage.getItem("notif_daily_quotes") !== "false";
      const lastQuoteReminder = localStorage.getItem("last_notif_quote");

      if (notifQuotes && lastQuoteReminder !== todayStr && nowHour >= 6) {
        localStorage.setItem("last_notif_quote", todayStr);
        triggerNotification({
          type: "quote",
          title:
            language === "es"
              ? "🌟 Inspiración del Día"
              : "🌟 Daily Inspiration",
          body:
            language === "es"
              ? "«Cada nuevo día es una oportunidad para empezar de nuevo con calma.» Descubre tu reto de hoy."
              : "«Every new day is a chance to start fresh with calm.» Check today's challenge.",
          url: "/resources",
          actionLabel: language === "es" ? "Ver Reto" : "View Challenge",
        });
        return;
      }

      // 3. Pausa de respiración / autocuidado si el bienestar es bajo
      const wellbeing = user.wellbeing ?? 72;
      const lastWellnessReminder = localStorage.getItem("last_notif_wellness");
      if (wellbeing < 50 && lastWellnessReminder !== todayStr) {
        localStorage.setItem("last_notif_wellness", todayStr);
        triggerNotification({
          type: "wellness",
          title:
            language === "es"
              ? "🧘 Pausa de Calma"
              : "🧘 Calm Break",
          body:
            language === "es"
              ? "Detectamos días de alta intensidad. Te invitamos a una pausa de respiración guiada de 2 minutos."
              : "We noticed high intensity days. Take a 2-minute guided breathing session.",
          url: "/resources",
          actionLabel: language === "es" ? "Respirar" : "Breathe",
        });
      }
    }

    return () => {
      clearTimeout(initialTimer);
      clearInterval(intervalTimer);
    };
  }, [user?.uid, user?.wellbeing, user?.emotions, language, triggerNotification]);

  // =========================================
  // ACTUALIZAR PERFIL (SANITIZADO Y PROTEGIDO)
  // =========================================

  const updateUserProfile = async (updates) => {
    if (!user?.uid) {
      return;
    }

    // Filtrar estrictamente campos inmutables por seguridad
    const {
      uid: _uid,
      tipoCuenta: _tipoCuenta,
      accountType: _accountType,
      rol: _rol,
      email: _email,
      correo: _correo,
      createdAt: _createdAt,
      fechaRegistro: _fechaRegistro,
      ...safeUpdates
    } = updates || {};

    const collectionName =
      user.tipoCuenta === "especialista"
        ? "specialists"
        : "usuarios";

    const userRef = doc(
      db,
      collectionName,
      user.uid
    );

    const nextUser = {
      ...user,
      ...safeUpdates,
      // Garantizar inmutabilidad
      uid: user.uid,
      tipoCuenta: user.tipoCuenta,
      rol: user.rol || user.tipoCuenta,
    };

    setUser(nextUser);

    try {
      await setDoc(
        userRef,
        safeUpdates,
        {
          merge: true,
        }
      );
    } catch (error) {
      console.error(
        "Error actualizando perfil:",
        error
      );
    }
  };

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      loading,
      updateUserProfile,
      theme,
      toggleTheme,
      language,
      toggleLanguage,
      toasts,
      triggerNotification,
      dismissToast,
      testNotificationSystem,
    }),
    [
      user,
      loading,
      theme,
      language,
      toasts,
      triggerNotification,
      dismissToast,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () =>
  useContext(AppContext);
