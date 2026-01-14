
import { GoogleGenAI, Type } from "@google/genai";
import { Inspiration } from "../types";

export const fetchDailyInspiration = async (): Promise<Inspiration> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
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

    const result = JSON.parse(response.text);
    return result as Inspiration;
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "La connaissance est une lumière que Dieu place dans le cœur de qui Il veut.",
      source: "Sagesse Islamique"
    };
  }
};
