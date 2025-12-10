import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the image and suggests a professional watermark text.
 */
export const suggestWatermarkText = async (imageFile: File): Promise<string> => {
  try {
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64String = btoa(
      new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    const model = 'gemini-2.5-flash';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64String
            }
          },
          {
            text: "Analyze this image and generate a short, professional watermark text that describes the vibe or content. For example 'Sunset Photography', 'Urban Architecture', 'Candid Moments'. Keep it under 4 words. Do not add quotes."
          }
        ]
      }
    });

    return response.text?.trim() || "Copyright 2024";
  } catch (error) {
    console.error("Error generating watermark suggestion:", error);
    return "Copyright 2024";
  }
};