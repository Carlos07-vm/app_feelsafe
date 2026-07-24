import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";



const firebaseConfig = {
  apiKey: "AIzaSyBdyaDgbKwMlQEE9-pL8quejQjbWP9xkcQ",
  authDomain: "feelsafe-ba317.firebaseapp.com",
  projectId: "feelsafe-ba317",
  storageBucket: "feelsafe-ba317.firebasestorage.app",
  messagingSenderId: "142737832795",
  appId: "1:142737832795:web:762463fde5170d2deeb87e",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;