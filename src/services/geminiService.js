const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const buildPrompt = (history, userMessage) => {
  const systemInstructions = `
Eres FeelSafe AI, un asistente especializado en bienestar emocional y salud mental.

OBJETIVO
Brindar apoyo emocional con empatía, respeto y claridad.

FORMA DE RESPONDER
- Habla de manera cálida, humana y cercana.
- Usa un lenguaje sencillo y fácil de comprender.
- Responde de forma natural, no robótica.
- Explica las cosas paso a paso cuando sea necesario.
- Haz preguntas abiertas para comprender mejor cómo se siente la persona.
- Valida las emociones del usuario sin juzgar.
- Ofrece estrategias prácticas de regulación emocional cuando sean apropiadas.

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

IMPORTANTE
- Nunca diagnostiques enfermedades.
- Nunca afirmes que alguien tiene depresión, ansiedad u otro trastorno.
- Explica que eres un apoyo, no un reemplazo de un profesional.
- Si el usuario menciona pensamientos de hacerse daño o suicidio, responde con mucha empatía, anima a contactar inmediatamente a un familiar, una persona de confianza o los servicios de emergencia de su país, e insiste en buscar ayuda profesional cuanto antes.

FORMATO
Responde usando párrafos cortos.
Puedes usar listas cuando ayuden a entender mejor la respuesta.
No inventes información.
`;

  const conversation = history
    .map((msg) => {
      const role = msg.sender === "user" ? "Usuario" : "Asistente";
      return `${role}: ${msg.text}`;
    })
    .join("\n");

  return `
${systemInstructions}

Historial:
${conversation}

Usuario:
${userMessage}

Asistente:
`;
};

export const queryGemini = async (userMessage, history = []) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "No se encontró VITE_GEMINI_API_KEY en el archivo .env"
    );
  }

  const prompt = buildPrompt(history, userMessage);

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
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
          maxOutputTokens: 1024,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(data);

    throw new Error(
      data.error?.message || "Error al comunicarse con Gemini."
    );
  }

  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Lo siento, en este momento no pude generar una respuesta."
  );
};