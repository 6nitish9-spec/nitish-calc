import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

// Initialize Gemini Client
// IMPORTANT: Expects process.env.API_KEY to be available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const solveMathWithGemini = async (prompt: string): Promise<AIResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are an advanced mathematical assistant designed to act as a calculator backend. 
        Analyze the user's natural language input or complex mathematical expression.
        1. Solve the problem accurately.
        2. Provide the numeric result (or short string result if it's not purely numeric).
        3. Provide a brief, step-by-step explanation or the formula used.
        4. If the input is invalid or cannot be solved, set isError to true.`,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            result: { type: Type.STRING, description: "The final answer." },
            steps: { type: Type.STRING, description: "Brief explanation of steps or formula." },
            isError: { type: Type.BOOLEAN, description: "True if the request could not be processed." },
          },
          required: ["result", "steps", "isError"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as AIResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      result: "Error",
      steps: "Failed to connect to AI service.",
      isError: true,
    };
  }
};