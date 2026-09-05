const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// =====================================================
// DETECTOR LOCAL DE SEÑALES CRÍTICAS
// =====================================================

const detectarRiesgoCritico = (texto) => {
  const contenido = texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const señalesCriticas = [
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
    "me voy a matar",
    "terminar con mi vida",
  ];

  return señalesCriticas.some((señal) =>
    contenido.includes(señal)
  );
};


// =====================================================
// PROMPT
// =====================================================

const buildPrompt = (history, userMessage) => {
  const systemInstructions = `
Eres FeelSafe AI, un asistente especializado en bienestar emocional y salud mental.

OBJETIVO
Brindar apoyo emocional con empatía, respeto y claridad.

FORMA DE RESPONDER
- Habla de manera cálida, humana y cercana.
- Usa lenguaje sencillo.
- Responde de forma natural, no robótica.
- Valida las emociones del usuario sin juzgar.
- Haz preguntas abiertas cuando sea apropiado.
- Ofrece estrategias prácticas de regulación emocional cuando sean apropiadas.
- No minimices lo que la persona siente.

PUEDES AYUDAR EN
• Estrés
• Ansiedad
• Tristeza
• Baja autoestima
• Miedo
• Soledad
• Relaciones personales
• Motivación
• Manejo emocional
• Técnicas de respiración
• Mindfulness
• Hábitos saludables
• Organización personal

SEGURIDAD
- Nunca diagnostiques enfermedades.
- Nunca afirmes que alguien tiene depresión, ansiedad u otro trastorno.
- Eres un apoyo y no sustituyes a un profesional de salud mental.
- Si el usuario expresa pensamientos de suicidio, autolesión o peligro inmediato, prioriza que contacte a una persona de confianza, un profesional o servicios de emergencia.
- No describas métodos de autolesión.
- No normalices ni fomentes conductas peligrosas.

ANÁLISIS DE APOYO

Debes clasificar la situación del usuario en uno de estos niveles:

NORMAL:
El usuario puede recibir apoyo emocional general y no hay señales importantes de necesidad de ayuda humana inmediata.

APOYO:
El usuario presenta un malestar significativo, persistente, aislamiento, problemas emocionales importantes o parece beneficiarse de hablar con una persona de confianza o un profesional, pero no hay señales claras de peligro inmediato.

URGENTE:
El usuario expresa pensamientos de suicidio, autolesión, peligro inmediato, incapacidad para mantenerse seguro o una situación que requiere intervención humana inmediata.

IMPORTANTE:
No clasifiques como URGENTE solamente porque el usuario esté triste, ansioso, enojado o tenga un problema personal.

RESPONDE ÚNICAMENTE EN ESTE JSON:

{
  "respuesta": "respuesta empática para el usuario",
  "nivel": "normal",
  "recomendacion": ""
}

El campo nivel DEBE ser exactamente:
normal
apoyo
urgente

Si nivel es normal:
"recomendacion" debe ser una cadena vacía.

Si nivel es apoyo:
"recomendacion" debe explicar brevemente que podría ser beneficioso hablar con alguien de confianza o un profesional.

Si nivel es urgente:
"recomendacion" debe indicar que debe buscar apoyo humano inmediatamente.

No agregues markdown fuera del JSON.
`;

  const conversation = history
    .map((msg) => {
      const role =
        msg.sender === "user"
          ? "Usuario"
          : "Asistente";

      return `${role}: ${msg.text}`;
    })
    .join("\n");

  return `
${systemInstructions}

HISTORIAL DE LA CONVERSACIÓN:
${conversation}

MENSAJE ACTUAL DEL USUARIO:
${userMessage}

Analiza el contexto completo y responde con el JSON solicitado.
`;
};


// =====================================================
// RATE LIMITER & SEGURIDAD DE PETICIONES
// =====================================================
const MAX_REQUESTS_PER_MINUTE = 15;
const requestTimestamps = [];

const checkRateLimit = () => {
  const now = Date.now();
  while (requestTimestamps.length > 0 && requestTimestamps[0] <= now - 60000) {
    requestTimestamps.shift();
  }

  if (requestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    const waitSeconds = Math.ceil((requestTimestamps[0] + 60000 - now) / 1000);
    throw new Error(
      `Has enviado muchos mensajes seguidos. Por favor espera ${waitSeconds} segundos.`
    );
  }

  requestTimestamps.push(now);
};

const sanitizeInput = (text) => {
  if (typeof text !== "string") return "";
  return text.trim().slice(0, 2000);
};

// =====================================================
// CONSULTAR GEMINI
// =====================================================

export const queryGemini = async (
  userMessage,
  history = []
) => {
  const apiKey =
    import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "No se encontró VITE_GEMINI_API_KEY en el archivo .env"
    );
  }

  // 1. Control de Tasa (Rate Limiting)
  checkRateLimit();

  // 2. Sanitización de Entrada
  const sanitizedMessage = sanitizeInput(userMessage);
  if (!sanitizedMessage) {
    throw new Error("El mensaje no puede estar vacío.");
  }

  // ===================================================
  // SEGURIDAD LOCAL
  // ===================================================

  const historialTexto = history
    .map((msg) => msg.text || "")
    .join(" ");

  const textoCompleto =
    `${historialTexto} ${sanitizedMessage}`;

  const riesgoCritico =
    detectarRiesgoCritico(textoCompleto);

  // ===================================================
  // GEMINI
  // ===================================================

  const prompt = buildPrompt(
    history,
    sanitizedMessage
  );

  const response = await fetch(
    `${GEMINI_API_URL}?key=${apiKey}`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],

        generationConfig: {
          temperature: 0.5,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1024,

          responseMimeType:
            "application/json",
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(data);

    throw new Error(
      data.error?.message ||
        "Error al comunicarse con Gemini."
    );
  }

  const textoRespuesta =
    data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!textoRespuesta) {
    throw new Error(
      "Gemini no devolvió una respuesta válida."
    );
  }

  let resultado;

  try {
    resultado = JSON.parse(textoRespuesta);
  } catch (error) {
    console.error(
      "Respuesta JSON inválida de Gemini:",
      textoRespuesta
    );

    throw new Error(
      "La respuesta de FeelSafe AI no tuvo un formato válido."
    );
  }

  // ===================================================
  // VALIDAR NIVEL
  // ===================================================

  const nivelesValidos = [
    "normal",
    "apoyo",
    "urgente",
  ];

  if (!nivelesValidos.includes(resultado.nivel)) {
    resultado.nivel = "normal";
  }

  // ===================================================
  // SEGURIDAD:
  // EL DETECTOR LOCAL TIENE PRIORIDAD
  // ===================================================

  if (riesgoCritico) {
    resultado.nivel = "urgente";

    resultado.recomendacion =
      "Lo que estás viviendo merece apoyo humano inmediato. Busca a una persona de confianza que pueda estar contigo y considera contactar a un profesional o servicio de emergencia.";
  }

  return {
    response:
      resultado.respuesta ||
      "Gracias por compartir cómo te sientes. Estoy aquí para escucharte.",

    level: resultado.nivel,

    recommendation:
      resultado.recomendacion || "",

    showSupport:
      resultado.nivel === "apoyo" ||
      resultado.nivel === "urgente",
  };
};
