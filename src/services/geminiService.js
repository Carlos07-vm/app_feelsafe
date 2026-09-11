import { auth } from "./firebase";

const GEMINI_API_URL = import.meta.env.VITE_GEMINI_API_URL || "/api/gemini";

const CRITICAL_SIGNALS = [
  "quiero suicidarme",
  "me quiero suicidar",
  "quiero matarme",
  "quiero morir",
  "quiero quitarme la vida",
  "voy a suicidarme",
  "voy a matarme",
  "no quiero vivir",
  "no quiero seguir viviendo",
  "hacerme daño",
  "hacerme mucho daño",
  "lastimarme",
  "autolesion",
  "terminar con mi vida",
];

const sanitizeInput = (value, maxLength) =>
  typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, maxLength)
    : "";

const detectCriticalRisk = (text) => {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return CRITICAL_SIGNALS.some((signal) =>
    normalized.includes(signal.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
  );
};

export const queryGemini = async (userMessage, history = []) => {
  const message = sanitizeInput(userMessage, 2000);
  if (!message) {
    throw new Error("El mensaje no puede estar vacío.");
  }

  const safeHistory = Array.isArray(history)
    ? history.slice(-12).map((item) => ({
        sender: item?.sender === "user" ? "user" : "bot",
        text: sanitizeInput(item?.text, 2000),
      }))
    : [];

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 25_000);

  try {
    const token = await auth.currentUser?.getIdToken();
    if (!token) {
      throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
    }

    const response = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, history: safeHistory }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "No se pudo conectar con FeelSafe AI.");
    }

    const level = ["normal", "apoyo", "urgente"].includes(data.level)
      ? data.level
      : "normal";
    const critical = detectCriticalRisk(
      `${safeHistory.map((item) => item.text).join(" ")} ${message}`
    );

    return {
      response: sanitizeInput(data.response, 4000) || "Gracias por compartir cómo te sientes. Estoy aquí para escucharte.",
      level: critical ? "urgente" : level,
      recommendation: critical
        ? "Busca apoyo humano inmediato. Contacta a una persona de confianza, un profesional o los servicios de emergencia de tu localidad."
        : sanitizeInput(data.recommendation, 1000),
      showSupport: critical || level !== "normal",
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("La respuesta tardó demasiado. Inténtalo de nuevo.");
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
};
