import {
  createContext,
  useContext,
  useState,
  useEffect,
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
} from "firebase/firestore";

import {
  auth,
  db,
} from "../services/firebase";

import {
  obtenerTokenFCM,
  escucharMensajesFCM,
} from "../services/messaging";
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

export function AppProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  // =========================================
// REGISTRAR DISPOSITIVO PARA NOTIFICACIONES
// =========================================

const registrarNotificaciones = async (
  firebaseUser,
  tipoCuenta
) => {
  try {
    if (!firebaseUser?.uid) {
      return;
    }

    // Obtener token FCM
    const token = await obtenerTokenFCM();

    if (!token) {
      console.warn(
        "⚠️ No se pudo obtener token FCM."
      );

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

    // Guardamos el token sin eliminar tokens anteriores
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

    console.log(
      "✅ Token FCM guardado correctamente."
    );

  } catch (error) {
    console.error(
      "❌ Error registrando notificaciones:",
      error
    );
  }
};
  // =========================================
  // NUEVO: ESTADOS DE TEMA E IDIOMA
  // =========================================
  const [theme, setTheme] = useState(localStorage.getItem('feelsafe_theme') || 'light');
  const [language, setLanguage] = useState(localStorage.getItem('feelsafe_language') || 'es');

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
  // ESCUCHAR NOTIFICACIONES FCM
  // =========================================

  useEffect(() => {
    let unsubscribe = null;

    const iniciarEscucha = async () => {
      try {
        unsubscribe = await escucharMensajesFCM(
          (payload) => {
            console.log(
              "🔔 NOTIFICACIÓN RECIBIDA EN FEELSAFE:",
              payload
            );

            const titulo =
              payload.notification?.title ||
              "FeelSafe";

            const mensaje =
              payload.notification?.body ||
              "Tienes una nueva notificación.";

            console.log("Título:", titulo);
            console.log("Mensaje:", mensaje);
          }
        );
      } catch (error) {
        console.error(
          "❌ Error iniciando escucha FCM:",
          error
        );
      }
    };

    iniciarEscucha();

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, []);

  // =========================================
  // ACTUALIZAR PERFIL
  // =========================================

  const updateUserProfile =
    async (updates) => {

      if (!user?.uid) {
        return;
      }

      const collectionName =
        user.tipoCuenta === "especialista"
          ? "specialists"
          : "usuarios";

      const userRef =
        doc(
          db,
          collectionName,
          user.uid
        );

      const nextUser = {
        ...user,
        ...updates,
      };

      setUser(nextUser);

      try {

        await setDoc(
          userRef,
          updates,
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

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        loading,
        updateUserProfile,
        // Exponemos el tema y el idioma a toda la app
        theme,
        toggleTheme,
        language,
        toggleLanguage
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () =>
  useContext(AppContext);