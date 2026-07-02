const GEMINI_API_URL = "https://gemini.googleapis.com/v1/models/gemini-1.5:generateText";

const buildPrompt = (history, userMessage) => {
  const systemInstructions = `Eres un asistente experto en salud mental. Responde con empatía, profesionalismo y claridad. Prioriza la seguridad emocional, ofrece apoyo práctico y sugiere herramientas respetuosas para el autocuidado. No emitas diagnósticos médicos; en su lugar, anima a buscar ayuda profesional cuando sea necesario.`;

  const conversation = history
    .map((message) => {
      const role = message.sender === "user" ? "Usuario" : "Asistente";
      return `${role}: ${message.text}`;
    })
    .join("\n");

  return `${systemInstructions}\n\n${conversation}\nUsuario: ${userMessage}\nAsistente:`;
};

export const queryGemini = async (userMessage, history = []) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "No se ha configurado la clave de Gemini. Agrega VITE_GEMINI_API_KEY a tu archivo .env."
    );
  }

  const prompt = buildPrompt(history, userMessage);

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      prompt: {
        text: prompt,
      },
      temperature: 0.7,
      maxOutputTokens: 512,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.error?.message || "Error de Gemini al generar la respuesta.";
    throw new Error(errorMessage);
  }

  return (
    data.candidates?.[0]?.output?.content?.[0]?.text ||
    data.candidates?.[0]?.content?.[0]?.text ||
    data.output?.text ||
    "Lo siento, no pude generar una respuesta en este momento."
  );
};
