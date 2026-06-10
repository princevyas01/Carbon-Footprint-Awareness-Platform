/**
 * @file gemini.ts
 * @description Server-side utility for interacting with the Google Gemini generative AI model.
 *
 * @module AI
 * @author CarbonLens Team
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Instantiate the SDK only if API key is present
const apiKey = process.env.GEMINI_API_KEY;

export const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Calls Gemini generative model to generate a personal carbon footprint insight.
 * Only runs server-side.
 * @param prompt - The detailed prompt string containing user data and constraints
 * @returns Raw string output from the Gemini model (JSON format)
 * @throws {Error} If Gemini API key is missing or model call fails
 */
export async function getGeminiCarbonInsight(prompt: string): Promise<string> {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash', // Use stable flash model
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('[getGeminiCarbonInsight] Failed to generate AI content:', error);
    throw new Error(`[getGeminiCarbonInsight] failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
