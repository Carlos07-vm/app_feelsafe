import { db } from "./firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

const normalizeKey = (value) => encodeURIComponent(value.trim().toLowerCase());

// generar código de 6 dígitos
export const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// guardar código usando email como clave
export const saveCodeByEmail = async (email, code) => {
  await setDoc(doc(db, "emailCodes", normalizeKey(email)), {
    code,
    createdAt: Date.now(),
  });
};

// verificar código usando email como clave
export const verifyCodeByEmail = async (email, inputCode) => {
  const ref = doc(db, "emailCodes", normalizeKey(email));
  const snap = await getDoc(ref);

  if (!snap.exists()) return false;

  return snap.data().code === inputCode;
};