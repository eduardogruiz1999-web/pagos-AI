
import { GoogleGenAI, Type } from "@google/genai";
import { Payment, Message, Client } from "../types";

const SYSTEM_INSTRUCTION = `Eres el Consultor Senior de Inteligencia Inmobiliaria y Analista Financiero. 
Tu especialidad es el análisis de flujos de caja, detección de patrones de morosidad y optimización de carteras de preventa.
Tienes acceso a datos de lotificaciones dinámicas.
Cuando analices pagos, proporciona:
1. Resumen ejecutivo de liquidez.
2. Identificación de riesgos (morosidad proyectada).
3. Sugerencias estratégicas para acelerar la cobranza.
Mantén siempre un tono profesional, ejecutivo y basado en datos reales de la operación.`;

export const analyzePayments = async (payments: Payment[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const paymentsJson = JSON.stringify(payments);
    
    // Usamos Gemini 3 Pro con thinkingBudget para análisis crítico
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Realiza un análisis profundo del siguiente conjunto de transacciones: ${paymentsJson}. 
      Detecta cuellos de botella en la cobranza y sugiere estrategias de reinversión.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 16000 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Resumen ejecutivo de la situación actual." },
            advice: { type: Type.STRING, description: "Consejo estratégico basado en el análisis." },
            kpis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING }
                },
                required: ["label", "value"]
              }
            }
          },
          required: ["summary", "advice", "kpis"]
        }
      }
    });
    
    return JSON.parse(response.text?.trim() || '{}');
  } catch (error) {
    console.error("Error en análisis avanzado de IA:", error);
    return null;
  }
};

export const chatWithAssistant = async (history: Message[], context: { clients: Client[] }) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const summaryContext = `Hay ${context.clients.length} clientes en sistema con un valor de cartera total de $${context.clients.reduce((s, c) => s + c.totalAmount, 0).toLocaleString()}.`;
    
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Usamos Flash para mayor velocidad en el chat interactivo
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\n" + summaryContext,
        temperature: 0.8,
        topP: 0.9,
      }
    });

    return response.text || "Disculpa, no pude procesar la respuesta en este momento.";
  } catch (error) {
    console.error("Error en chat interactivo:", error);
    return "Error en la conexión con el núcleo de inteligencia.";
  }
};

export const generateLotificationImage = async (divisionName: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High-resolution architectural site plan for real estate project '${divisionName}'. Modern urbanization, numbered lots, paved streets, green areas, minimalist CAD style, white background.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
};
