import { 
    createContext,
    useContext,
    useState,
    useEffect,
 } from "react";

 import { onAuthStateChanged } from "firebase/auth";
 import { doc, getDoc } from "firebase/firestore";
 import { auth, db } from "../services/firebase";



const AppContext=createContext();

export function AppProvider({children}){
 const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
         if (firebaseUser) {
            try {
                const userRef = doc(db, "users", firebaseUser.uid);
                const userSnap = await getDoc(userRef);

                   if (userSnap.exists()) {

                        setUser({
                           uid: firebaseUser.uid,
                           ...userSnap.data(),
                           

                           photoURL:
                           userSnap.data().photoURL ||
                           firebaseUser.photoURL || "",

                           foto:
                              userSnap.data().foto ||
                              firebaseUser.photoURL ||
                              "",

                           displayName: firebaseUser.displayName || "",
                           email: firebaseUser.email,
                        });

                     
                } else {
                     setUser({
                        uid: firebaseUser.uid,
                        nombre: firebaseUser.displayName || "",
                        correo: firebaseUser.email,
                        foto: firebaseUser.photoURL || "",
                         photoURL: firebaseUser.photoURL || "",
                         displayName: firebaseUser.displayName || "",
                        proveedor: firebaseUser.providerData[0]?.providerId || "",
                        });
                 }
                 } catch (error) {
                    console.error("Error al obtener usuario:", error);
                 }
                 } else {
                    setUser(null);
                 }
                 setLoading(false);
            });

              return () => unsubscribe();
         }, []);

return(

<AppContext.Provider
value={{
user,
setUser,
loading,
}}
>

{children}

</AppContext.Provider>

);

}

export const useApp=()=>useContext(AppContext);