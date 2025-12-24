
import { GoogleGenAI, Type } from "@google/genai";
import { Payment, Message, Client } from "../types";

const SYSTEM_INSTRUCTION = `Eres el Consultor de Inteligencia Inmobiliaria. 
Tu especialidad es el análisis de pagos, gestión de cobranza y optimización de ventas de lotes.
Tienes acceso a datos de 6 ubicaciones: San Rafael, Colonia Pedregal, Área Monte Bello, Unidad Lomas, Colonia Unión y Colonia Cabañas.
Cuando el usuario te pregunte sobre clientes o pagos, sé profesional, analítico y propón soluciones de flujo de caja. 
Puedes generar formatos de contratos o cartas de cobro en texto plano si te lo piden.`;

export const analyzePayments = async (payments: Payment[]) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const paymentsJson = JSON.stringify(payments);
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analiza estos pagos inmobiliarios: ${paymentsJson}. Dame un resumen ejecutivo y 3 KPIs críticos.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
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
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error en análisis:", error);
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
      model: "gemini-3-pro-preview",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION + "\n" + contextStr,
        temperature: 0.7,
      }
    });

    return response.text || "Lo siento, tuve un problema procesando tu consulta.";
  } catch (error) {
    console.error("Error en chat:", error);
    return "Error de conexión con la IA.";
  }
};
