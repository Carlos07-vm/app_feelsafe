import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import {
  firebaseConfig,
  validateFirebaseConfig,
} from "./firebaseConfig";

// =====================================================
// VALIDAR CONFIGURACIÓN DE FIREBASE
// =====================================================

if (!validateFirebaseConfig()) {
  console.error(
    "❌ Firebase configuration is incomplete. Please check your .env file."
  );
}

// =====================================================
// INICIALIZAR FIREBASE
// =====================================================

const app = initializeApp(firebaseConfig);

// =====================================================
// FIREBASE AUTH
// =====================================================

export const auth = getAuth(app);

// Mantener la sesión aunque se cierre o recargue la aplicación
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("✅ Persistencia de Firebase Auth activada");
  })
  .catch((error) => {
    console.error(
      "❌ Error configurando persistencia de Firebase Auth:",
      error
    );
  });

// =====================================================
// FIRESTORE
// =====================================================

export const db = getFirestore(app);

// =====================================================
// EXPORTACIÓN PRINCIPAL
// =====================================================

export default app;