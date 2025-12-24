
import { GoogleGenAI, Type } from "@google/genai";
import { Payment, Message, Client } from "../types";

const SYSTEM_INSTRUCTION = `Eres el Consultor de Inteligencia Inmobiliaria. 
Tu especialidad es el análisis de pagos, gestión de cobranza y optimización de ventas de lotes.
Tienes acceso a datos de múltiples zonas geográficas dinámicas.
Cuando el usuario te pregunte sobre clientes o pagos, sé profesional, analítico y propón soluciones de flujo de caja. 
Puedes generar formatos de contratos o cartas de cobro en texto plano si te lo piden.`;

export const analyzePayments = async (payments: Payment[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const paymentsJson = JSON.stringify(payments);
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analiza estos pagos inmobiliarios y detecta tendencias de morosidad o liquidez: ${paymentsJson}. Dame un resumen ejecutivo y 3 KPIs críticos.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 4000 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            advice: { type: Type.STRING },
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
    console.error("Error en análisis avanzado:", error);
    return null;
  }
};

export const chatWithAssistant = async (history: Message[], context: { clients: Client[] }) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contextStr = `Contexto actual: Tenemos ${context.clients.length} clientes registrados.`;
    
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\n" + contextStr,
        temperature: 0.7,
      }
    });

    return response.text || "Lo siento, tuve un problema procesando tu consulta.";
  } catch (error) {
    console.error("Error en chat dinámico:", error);
    return "Error de conexión con la IA de la Inmobiliaria.";
  }
};

export const generateLotificationImage = async (divisionName: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Create a professional 2D site plan for '${divisionName}'. Modern blueprint, clearly marked lots, asphalt streets, landscape design. CAD style.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
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
    console.error("Error generating master plan image:", error);
    return null;
  }
};
