import { init, send } from "@emailjs/browser";

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

if (publicKey) {
  init(publicKey);
}

export const sendVerificationCodeEmail = async (email, code) => {
  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      "Falta configurar EmailJS en .env: VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, VITE_EMAILJS_PUBLIC_KEY"
    );
  }

  return send(
    serviceId,
    templateId,
    {
      user_email: email,
      verification_code: code,
    },
    publicKey
  );
};
