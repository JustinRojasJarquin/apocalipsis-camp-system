import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'gpt-4o-mini';

export async function generarExplicacionEstado(data: {
  estado: string;
  cargo: string;
}) {

  const completion =
    await client.chat.completions.create({

      model: OPENROUTER_MODEL,

      messages: [
        {
          role: 'system',
          content:
            'Eres una IA de gestión de supervivientes.'
        },

        {
          role: 'user',
          content: `
          Explica brevemente por qué una persona
          con cargo ${data.cargo}
          tiene estado físico ${data.estado}.

          Máximo 2 líneas.
          `
        }
      ]
    });

  return completion.choices[0].message?.content ?? "";
}

export async function recomendacionEvaluacionIngresoPorIA(data: {
  persona: string;
  campamento: string;
}) {
  const completion = await client.chat.completions.create({
    model: OPENROUTER_MODEL,
    messages: [
      {
        role: "system",
        content: "Eres una IA de gestión de supervivientes.",
      },
      {
        role: "user",
        content: `
        Evalúa la viabilidad de ingreso de esta persona al campamento.

        Persona: ${data.persona}
        Campamento: ${data.campamento}

        Devuelve solo un JSON válido con los campos:
        {
          "recomendacion_ia": "ACEPTAR" | "RECHAZAR",
          "motivo": "<razón breve>"
        }

        Usa la información disponible y responde en español.
        `,
      },
    ],
  });

  return completion.choices[0].message?.content ?? "";
}

export async function recomendarCargoPorIA(data: {
  persona: string;
  estado?: string;
  cargoActual?: string | null;
  campamento?: string;
  cargosDisponibles: string[];
}) {
  const completion = await client.chat.completions.create({
    model: OPENROUTER_MODEL,
    messages: [
      {
        role: 'system',
        content: 'Eres una IA de gestión de supervivientes.',
      },
      {
        role: 'user',
        content: `
        Recomienda un cargo para esta persona usando los cargos disponibles.

        Persona: ${data.persona}
        Estado: ${data.estado ?? "No disponible"}
        Cargo actual: ${data.cargoActual ?? "Ninguno"}
        Campamento: ${data.campamento ?? "No disponible"}

        Cargos disponibles:
        ${data.cargosDisponibles.map((cargo) => `- ${cargo}`).join("\n")}

        Responde solo con un JSON válido y nada más. Debe contener:
        {
          "recommendedCargoId": <id_cargo>,
          "recommendedCargoName": "<nombre del cargo>",
          "reason": "<motivo breve>"
        }
        `,
      },
    ],
  });

  return completion.choices[0].message?.content ?? "";
}