
import { GoogleGenAI, Type } from "@google/genai";
import { Inspiration } from "../types";

export const fetchDailyInspiration = async (): Promise<Inspiration> => {
  // Safe check for process.env.API_KEY
  const apiKey = typeof process !== 'undefined' ? process.env.API_KEY : '';
  
  if (!apiKey) {
    console.warn("API_KEY non trouvée, utilisation du mode dégradé.");
    return {
      text: "La connaissance est une lumière que Dieu place dans le cœur de qui Il veut.",
      source: "Sagesse Islamique"
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Génère une courte citation inspirante ou un hadith authentique en français lié à la paix, la connaissance ou la spiritualité, adapté pour une audience de radio coranique.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: "La citation ou le message inspirant." },
            source: { type: Type.STRING, description: "La source (ex: Hadith, Verset, Sagesse)." }
          },
          required: ["text", "source"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      text: result.text || "La connaissance est une lumière.",
      source: result.source || "Sagesse Islamique"
    };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "La connaissance est une lumière que Dieu place dans le cœur de qui Il veut.",
      source: "Sagesse Islamique"
    };
  }
};
