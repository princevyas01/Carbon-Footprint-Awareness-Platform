import { GoogleGenerativeAI } from '@google/generative-ai';

// Instantiate the SDK only if API key is present
const apiKey = process.env.GEMINI_API_KEY;

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Calls Gemini 2.0 Flash to generate a personal carbon footprint insight.
 * Only runs server-side.
 */
export async function getGeminiCarbonInsight(prompt: string): Promise<string> {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
