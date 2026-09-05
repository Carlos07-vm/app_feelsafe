// Archivo de configuración Firebase centralizado
// Evita duplicación de credenciales y facilita mantenimiento

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Validación de configuración
export const validateFirebaseConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missing = required.filter(key => !firebaseConfig[key]);
  
  if (missing.length > 0) {
    console.error('Firebase configuration is incomplete. Missing:', missing);
    return false;
  }
  
  return true;
};

