const GEMINI_MODEL = "gemini-2.5-flash";
const MAX_REQUESTS_PER_MINUTE = 15;
const requestLog = new Map();

const SYSTEM_INSTRUCTIONS = `
Eres FeelSafe AI, un asistente de bienestar emocional.

Responde con empatía, lenguaje sencillo y sin juzgar. Puedes ofrecer escucha,
orientación general, respiración, relajación, autocuidado y recursos de apoyo.
No diagnostiques, no prescribas y no sustituyas a un profesional.
Si la persona expresa suicidio, autolesión, peligro inmediato o que no puede
mantenerse segura, prioriza buscar apoyo humano inmediato, una persona de
confianza, un profesional o emergencias. Nunca describas métodos peligrosos.

Clasifica la situación como exactamente una de estas opciones:
normal: apoyo general sin señales importantes de ayuda humana inmediata.
apoyo: malestar significativo que podría beneficiarse de hablar con alguien.
urgente: peligro inmediato, suicidio, autolesión o incapacidad para mantenerse segura.

Responde únicamente con este JSON válido:
{"respuesta":"...","nivel":"normal|apoyo|urgente","recomendacion":"..."}
`;

const normalizeText = (value, maxLength) =>
  typeof value === "string"
    ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, maxLength)
    : "";

const hasCriticalSignal = (text) => {
  const normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return [
    "quiero suicidarme",
    "me quiero suicidar",
    "quiero matarme",
    "quiero morir",
    "quiero quitarme la vida",
    "voy a suicidarme",
    "voy a matarme",
    "no quiero vivir",
    "no quiero seguir viviendo",
    "hacerme dano",
    "hacerme mucho dano",
    "lastimarme",
    "autolesion",
    "terminar con mi vida",
  ].some((signal) => normalized.includes(signal));
};

const getClientId = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  return (forwarded ? forwarded.split(",")[0] : req.socket?.remoteAddress) || "unknown";
};

const checkRateLimit = (clientId) => {
  const now = Date.now();
  const current = (requestLog.get(clientId) || []).filter(
    (timestamp) => timestamp > now - 60_000
  );

  if (current.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  current.push(now);
  requestLog.set(clientId, current);
  return true;
};

const verifyFirebaseToken = async (req) => {
  const authorization = req.headers.authorization || req.headers.Authorization || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7).trim()
    : "";
  const apiKey = process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY;

  if (!apiKey) return { configured: false, valid: false };
  if (!token) return { configured: true, valid: false };

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );

    if (!response.ok) return { configured: true, valid: false };
    const data = await response.json();
    return { configured: true, valid: Array.isArray(data.users) && data.users.length > 0 };
  } catch {
    return { configured: true, valid: false };
  }
};

const parseModelResponse = (text) => {
  const cleaned = text.replace(/```json|```/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const json = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  const result = JSON.parse(json);
  const level = ["normal", "apoyo", "urgente"].includes(result.nivel)
    ? result.nivel
    : "normal";

  return {
    response: normalizeText(result.respuesta, 4000) || "Gracias por compartir cómo te sientes. Estoy aquí para escucharte.",
    level,
    recommendation: normalizeText(result.recomendacion, 1000),
  };
};

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = [
    process.env.CORS_ORIGIN,
    "capacitor://localhost",
    "http://localhost",
    "https://localhost",
  ].filter(Boolean);

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido." });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(503).json({ error: "La asistencia de IA no está configurada." });
  }

  const authResult = await verifyFirebaseToken(req);
  if (!authResult.configured) {
    return res.status(503).json({ error: "La autenticación de IA no está configurada." });
  }
  if (!authResult.valid) {
    return res.status(401).json({ error: "Debes iniciar sesión para usar la asistencia de IA." });
  }

  if (!checkRateLimit(getClientId(req))) {
    return res.status(429).json({ error: "Demasiadas solicitudes. Espera un momento." });
  }

  let body = req.body || {};
  if (typeof req.body === "string") {
    try {
      body = JSON.parse(req.body);
    } catch {
      return res.status(400).json({ error: "El cuerpo de la solicitud no es válido." });
    }
  }
  const message = normalizeText(body.message, 2000);
  const history = Array.isArray(body.history)
    ? body.history
        .slice(-12)
        .map((item) => ({
          sender: item?.sender === "user" ? "Usuario" : "Asistente",
          text: normalizeText(item?.text, 2000),
        }))
        .filter((item) => item.text)
    : [];

  if (!message) {
    return res.status(400).json({ error: "El mensaje no puede estar vacío." });
  }

  const conversation = history
    .map((item) => `${item.sender}: ${item.text}`)
    .join("\n");
  const prompt = `${SYSTEM_INSTRUCTIONS}\n\nHISTORIAL:\n${conversation || "Sin historial"}\n\nMENSAJE ACTUAL:\n${message}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            topP: 0.9,
            maxOutputTokens: 1024,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      return res.status(502).json({ error: "No se pudo obtener una respuesta de la IA." });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return res.status(502).json({ error: "La IA no devolvió una respuesta válida." });
    }

    const result = parseModelResponse(text);
    if (hasCriticalSignal(`${conversation} ${message}`)) {
      result.level = "urgente";
      result.recommendation = "Busca apoyo humano inmediato. Contacta a una persona de confianza, un profesional o los servicios de emergencia de tu localidad.";
    }

    return res.status(200).json({ ...result, showSupport: result.level !== "normal" });
  } catch {
    return res.status(502).json({ error: "No se pudo procesar la respuesta de la IA." });
  }
}
