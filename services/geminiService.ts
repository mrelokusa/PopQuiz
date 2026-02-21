import { GoogleGenAI, Type } from "@google/genai";
import { Quiz } from "../types";

const SYSTEM_INSTRUCTION = `
You are a creative viral content generator. 
Create fun, engaging, and slightly edgy personality quizzes.
The output must be strictly JSON matching the schema.
Ensure questions are short and answers map clearly to specific outcomes.
Include 4 distinct outcomes and 6 questions.
`;

// Helper to safely get the API key in various environments (Node, Vite, Browser)
const getApiKey = (): string | undefined => {
  // 1. Try standard process.env (Works in this preview environment & some bundlers)
  try {
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    // Ignore ReferenceError if process is not defined
  }

  // 2. Try Vite standard (Works in Vercel deployments)
  try {
    // @ts-ignore - import.meta is valid in modern browsers/Vite
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      // Standard Vite (Most likely to work if configured correctly)
      // @ts-ignore
      if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
      
      // User fallback attempts (Might work depending on bundler config)
      // @ts-ignore
      if (import.meta.env.vite_api_key) return import.meta.env.vite_api_key;
      // @ts-ignore
      if (import.meta.env.API_KEY) return import.meta.env.API_KEY;
      // @ts-ignore
      if (import.meta.env.NEXT_PUBLIC_API_KEY) return import.meta.env.NEXT_PUBLIC_API_KEY;
    }
  } catch (e) {
    // Ignore if import.meta is not defined
  }

  return undefined;
};

export const generateAIQuiz = async (topic: string): Promise<Partial<Quiz> | null> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
        throw new Error("MISSING_API_KEY");
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: `Create a viral personality quiz about: ${topic}.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            outcomes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  image: { type: Type.STRING, description: "A single emoji representing this outcome" },
                },
                required: ["id", "title", "description", "image"]
              }
            },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  answers: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        text: { type: Type.STRING },
                        outcomeId: { type: Type.STRING, description: "Must match one of the outcome IDs defined above" }
                      },
                      required: ["text", "outcomeId"]
                    }
                  }
                },
                required: ["text", "answers"]
              }
            }
          },
          required: ["title", "description", "outcomes", "questions"]
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Post-process to ensure IDs and structure match what our app expects
      return {
        ...data,
        id: crypto.randomUUID(),
        author: 'AI Creator',
        createdAt: Date.now(),
        plays: 0,
        // Assign default colors to outcomes since AI might not pick valid Tailwind classes
        outcomes: data.outcomes.map((o: any, i: number) => ({
           ...o,
           colorClass: ['bg-neo-coral', 'bg-neo-mint', 'bg-neo-lemon', 'bg-neo-periwinkle'][i % 4]
        })),
        questions: data.questions.map((q: any, i: number) => ({
          ...q,
          id: `q${i}`,
          answers: q.answers.map((a: any, j: number) => ({
            ...a,
            id: `q${i}_a${j}`
          }))
        }))
      };
    }
    return null;

  } catch (error: any) {
    // Re-throw specific error for UI handling
    if (error.message === "MISSING_API_KEY" || error.message?.includes("API Key")) {
        throw new Error("MISSING_API_KEY");
    }
    console.error("AI Generation failed:", error);
    return null;
  }
};