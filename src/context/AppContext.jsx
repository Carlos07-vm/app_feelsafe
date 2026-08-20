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
} from "firebase/firestore";

import {
  auth,
  db,
} from "../services/firebase";


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

    uid:
      firebaseUser.uid,

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

    tipoCuenta:
      data.tipoCuenta ||
      tipoCuenta,

    accountType:
      data.tipoCuenta ||
      tipoCuenta,

    especialidad:
      data.especialidad ||
      "",

    experiencia:
      data.experiencia ??
      0,

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
      data.disponible ??
      true,

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

    // Siempre conservar el UID real
    uid:
      firebaseUser.uid,

    tipoCuenta:
      data.tipoCuenta ||
      tipoCuenta,

    accountType:
      data.tipoCuenta ||
      tipoCuenta,

  };

};


export function AppProvider({
  children,
}) {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  // =====================================================
  // CARGAR PERFIL DESPUÉS DE AUTH
  // =====================================================

  useEffect(() => {

    let unsubscribeProfile =
      null;


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


          // ==========================================
          // CERRÓ SESIÓN
          // ==========================================

          if (!firebaseUser) {

            setUser(null);

            setLoading(false);

            return;

          }


          try {

            setLoading(true);


            // ==========================================
            // 1. BUSCAR ESPECIALISTA
            // ==========================================

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


            // ==========================================
            // ESPECIALISTA ENCONTRADO
            // ==========================================

            if (
              specialistSnap.exists()
            ) {

              const specialistData =
                specialistSnap.data();


              console.log(
                "================================="
              );

              console.log(
                "ESPECIALISTA ENCONTRADO"
              );

              console.log(
                "UID:",
                firebaseUser.uid
              );

              console.log(
                "Nombre:",
                specialistData.nombre
              );

              console.log(
                "Correo:",
                specialistData.correo
              );

              console.log(
                "================================="
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


              // ========================================
              // ESCUCHAR CAMBIOS DEL ESPECIALISTA
              // ========================================

              unsubscribeProfile =
                onSnapshot(

                  specialistRef,

                  (snapshot) => {

                    if (
                      snapshot.exists()
                    ) {

                      const updatedData =
                        snapshot.data();


                      setUser(
                        buildUser(
                          firebaseUser,
                          updatedData,
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


            // ==========================================
            // 2. SI NO ES ESPECIALISTA → USUARIO
            // ==========================================

            console.log(
              "No existe especialista con este UID."
            );


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


            // ==========================================
            // USUARIO EXISTENTE
            // ==========================================

            if (
              userSnap.exists()
            ) {

              const userData =
                userSnap.data();


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


            // ==========================================
            // CREAR USUARIO
            // ==========================================

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


          } catch (error) {

            console.error(
              "Error cargando perfil:",
              error
            );

            setUser(null);

            setLoading(false);

          }

        }

      );


    return () => {

      unsubscribeAuth();

      if (
        unsubscribeProfile
      ) {

        unsubscribeProfile();

      }

    };

  }, []);


  // =====================================================
  // ACTUALIZAR PERFIL
  // =====================================================

  const updateUserProfile =
    async (updates) => {

      if (!user?.uid) {
        return;
      }


      const collectionName =
        user.tipoCuenta ===
        "especialista"

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


      setUser(
        nextUser
      );


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

      }}

    >

      {children}

    </AppContext.Provider>

  );

}


export const useApp = () =>
  useContext(AppContext);