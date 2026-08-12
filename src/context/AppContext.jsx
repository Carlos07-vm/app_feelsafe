import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const AppContext = createContext();

const defaultUserData = {
  currentMood: "Neutral",
  wellbeing: 72,
  streak: 0,
  notes: [],
  emotions: [],
  description: "Comparte algo sobre ti y personaliza tu perfil.",
  profile: {},
};

const mergeUserData = (firebaseUser, userData) => ({
  uid: firebaseUser.uid,
  displayName: firebaseUser.displayName || userData?.nombre || "Usuario",
  email: firebaseUser.email || userData?.correo || "",
  photoURL: userData?.photoURL || userData?.foto || firebaseUser.photoURL || "",
  foto: userData?.foto || userData?.photoURL || firebaseUser.photoURL || "",
  provider: firebaseUser.providerData?.[0]?.providerId || userData?.proveedor || "",
  currentMood: userData?.currentMood || defaultUserData.currentMood,
  wellbeing: userData?.wellbeing ?? defaultUserData.wellbeing,
  streak: userData?.streak ?? defaultUserData.streak,
  notes: userData?.notes || defaultUserData.notes,
  emotions: userData?.emotions || defaultUserData.emotions,
  description: userData?.description || defaultUserData.description,
  profile: userData?.profile || defaultUserData.profile,
  ...userData,
});

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUser = (firebaseUser) => {
    const userRef = doc(db, "usuarios", firebaseUser.uid);
    const unsubscribe = onSnapshot(
      userRef,
      async (userSnap) => {
        try {
          if (userSnap.exists()) {
            setUser(mergeUserData(firebaseUser, userSnap.data()));
          } else {
            const newUser = mergeUserData(firebaseUser, {});
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              nombre: firebaseUser.displayName || "",
              correo: firebaseUser.email || "",
              photoURL: firebaseUser.photoURL || "",
              foto: firebaseUser.photoURL || "",
              proveedor: firebaseUser.providerData?.[0]?.providerId || "",
              createdAt: new Date().toISOString(),
              ...defaultUserData,
            });
            setUser(newUser);
          }
        } catch (error) {
          console.error("Error al sincronizar usuario:", error);
          setUser(null);
        }
      },
      (error) => {
        console.error("Error en la escucha del usuario:", error);
      }
    );

    return unsubscribe;
  };

  const updateUserProfile = async (updates) => {
    if (!user?.uid) return;
    const userRef = doc(db, "usuarios", user.uid);
    const nextUser = {
      ...user,
      ...updates,
    };
    setUser(nextUser);
    try {
      await setDoc(userRef, updates, { merge: true });
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
    }
  };

  useEffect(() => {
    let unsubscribeUser = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        unsubscribeUser = syncUser(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUser();
    };
  }, []);

  return (
    <AppContext.Provider value={{ user, setUser, loading, updateUserProfile }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);