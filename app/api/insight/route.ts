/**
 * @file route.ts
 * @description API route handler for processing user carbon stats and retrieving generated personal insights from Gemini.
 *
 * @module API
 * @author CarbonLens Team
 */

import { NextRequest, NextResponse } from 'next/server';
import { AI_RATE_LIMIT_MS } from '../../../lib/constants';

// Rate limiting store (IP mapped to epoch time of last request)
const rateLimitMap = new Map<string, number>();

/**
 * Handles POST requests to run AI insights on user carbon footprint logs.
 * Includes rate-limiting check and safety fallbacks.
 * @param req - The NextRequest object containing carbon logs and profile data
 * @returns NextResponse with the structured JSON insight, rate limit status, or error code
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting check
    const ip = req.headers.get('x-forwarded-for') || 'default';
    const lastCall = rateLimitMap.get(ip) || 0;
    const now = Date.now();
    
    if (now - lastCall < AI_RATE_LIMIT_MS) {
      const retryAfter = Math.ceil((AI_RATE_LIMIT_MS - (now - lastCall)) / 1000);
      return NextResponse.json(
        { error: 'Rate limited', retryAfter },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    // Parse request body safely
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Check API key exists
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('[API.POST]: GEMINI_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    // Build prompt from user data
    const {
      monthlyTotals = {},
      profile = {},
      topCategory = 'transport',
      monthDelta = 0,
      ecoScore = 0,
      level = 'Carbon Rookie'
    } = body;

    const userPrompt = `
User carbon data this month:
- Transport: ${monthlyTotals.transport || 0} kg CO2
- Food: ${monthlyTotals.food || 0} kg CO2
- Energy: ${monthlyTotals.energy || 0} kg CO2
- Shopping: ${monthlyTotals.shopping || 0} kg CO2
- Travel: ${monthlyTotals.travel || 0} kg CO2
- Total: ${Object.values(monthlyTotals).reduce((a: number, b) => a + (b as number), 0)} kg CO2
- Highest category: ${topCategory}
- Change from last month: ${monthDelta}%
- Eco Score: ${ecoScore}/1000
- Level: ${level}
- Diet: ${profile.diet || 'mixed'}
- Transport mode: ${profile.transport || 'car'}

Respond ONLY with a valid JSON object, no markdown, no backticks:
{
  "observation": "one specific sentence about their biggest emission pattern with actual numbers",
  "tip": "one actionable India-specific reduction tip under 25 words",
  "nudge": "one motivating sentence about real-world impact under 20 words",
  "saved_potential_kg": 15
}`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          }
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('[API.POST]: Gemini API error:', geminiResponse.status, errorText);
      return NextResponse.json(
        { error: `Gemini error: ${geminiResponse.status}` },
        { status: 502 }
      );
    }

    const geminiData = await geminiResponse.json();

    // Extract text from Gemini response
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!rawText) {
      console.error('[API.POST]: Empty Gemini response:', geminiData);
      return NextResponse.json(
        { error: 'Empty response from Gemini' },
        { status: 502 }
      );
    }

    // Clean and parse JSON from response
    const cleaned = rawText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    let insight;
    try {
      insight = JSON.parse(cleaned);
    } catch {
      console.error('[API.POST]: Failed to parse Gemini response as JSON:', cleaned);
      // Return a fallback insight instead of erroring
      insight = {
        observation: `Your total footprint this month is ${Object.values(monthlyTotals).reduce((a: number, b) => a + (b as number), 0).toFixed(1)} kg CO2, with ${topCategory} as your biggest source.`,
        tip: "Try taking public transport or metro for your daily commute to reduce emissions significantly.",
        nudge: "Every small action adds up — you're making a real difference for India's climate future.",
        saved_potential_kg: 12
      };
    }

    // Update rate limit timestamp
    rateLimitMap.set(ip, now);

    return NextResponse.json({ insight }, { status: 200 });

  } catch (error) {
    console.error('[API.POST]: Unexpected error during insight generation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
