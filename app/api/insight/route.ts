import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// In-memory rate limiting map (IP -> timestamp)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(request: NextRequest) {
  try {
    // 1. IP-based Rate Limiting
    const ip = request.headers.get('x-forwarded-for') || request.ip || 'global-key';
    const lastRequest = rateLimitMap.get(ip) || 0;
    const now = Date.now();

    if (now - lastRequest < RATE_LIMIT_MS) {
      const remainingSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastRequest)) / 1000);
      return NextResponse.json(
        { error: `Rate limit active. Please retry in ${remainingSeconds} seconds.` },
        { status: 429 }
      );
    }

    // Update rate limit timestamp
    rateLimitMap.set(ip, now);

    // 2. Parse Request Body
    const body = await request.json();
    const { monthlyTotals, profile, topCategory, monthDelta, activeChallenges, ecoScore, level } = body;

    // 3. Fallback check for missing API Key (Mock Generator)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY environment variable is not defined. Falling back to local AI insights.');
      const localFallback = generateLocalInsight(topCategory);
      return NextResponse.json(localFallback);
    }

    // 4. Request Gemini 2.0 Flash
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      You are CarbonLens AI, a personal carbon footprint coach specializing in localized insights for Indian citizens.
      Analyze the following monthly carbon emissions data and user profile:
      - Monthly Category Totals (kg CO2): ${JSON.stringify(monthlyTotals)}
      - Onboarding Profile commute: ${profile?.transport}, diet: ${profile?.diet}, energy: ${profile?.energy}, flights: ${profile?.flights}, shopping: ${profile?.shopping}
      - Highest Emission Category: ${topCategory}
      - Percentage change vs Last Month: ${monthDelta}%
      - Currently Active Challenges: ${activeChallenges?.join(', ') || 'None'}
      - User's Eco Score: ${ecoScore}/1000
      - User's Eco Level: ${level}

      Deliver a highly localized recommendation. Refer to state CEA grid factors (e.g. coal-heavy grid in Gujarat/UP/Delhi vs cleaner hydroelectric grid in Karnataka/Kerala) and Indian-specific alternatives (e.g., local CNG autos, metro transport, Bureau of Energy Efficiency star-labeled cooling appliances, swapping beef/mutton with traditional dal/paneer).

      Format the output as a valid JSON object matching this schema exactly, with no additional text, markdown backticks, or formatting:
      {
        "observation": "One-sentence review of the user's highest emission category with specific data details.",
        "tip": "An actionable, India-specific tip (e.g. referencing state CEA factors, star ratings, local transit like Metro/CNG, or local diets).",
        "nudge": "A short, engaging motivational climate nudge.",
        "saved_potential_kg": 15
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();

    // Clean markdown code blocks if the LLM outputted them
    if (text.startsWith('```')) {
      text = text.replace(/^```json\s*/i, '').replace(/```$/, '').trim();
    }

    try {
      const parsedInsight = JSON.parse(text);
      return NextResponse.json(parsedInsight);
    } catch (parseError) {
      console.error('Gemini output was not valid JSON:', text, parseError);
      // Fallback if parse fails
      const fallback = generateLocalInsight(topCategory);
      return NextResponse.json(fallback);
    }
  } catch (error: unknown) {
    console.error('API route error in /api/insight:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// Local insight generator for offline / fallback
function generateLocalInsight(topCategory: string) {
  const responses: Record<string, { observation: string; tip: string; nudge: string; saved_potential_kg: number }> = {
    transport: {
      observation: `Your travel emissions are high this month, making transport your top carbon contributor.`,
      tip: `Substitute short solo drives with the Metro system, or carpool via local CNG options to reduce transit emissions by 60%.`,
      nudge: `Every kilometer counts. Shift to shared transport today!`,
      saved_potential_kg: 24,
    },
    food: {
      observation: `Dietary habits represent your largest carbon footprint sector this month.`,
      tip: `Integrating plant-based proteins like lentils (dal) or chickpeas (chana) rather than meat can lower your agricultural footprint substantially.`,
      nudge: `A green plate equals a green planet. Try a vegetarian day!`,
      saved_potential_kg: 35,
    },
    energy: {
      observation: `Household electricity and cooking energy dominated your footprint logs.`,
      tip: `Unplug standby appliances and run your AC at 24°C rather than 18°C to reduce electrical loads on the grid.`,
      nudge: `Conserving energy lights up a cleaner future.`,
      saved_potential_kg: 18,
    },
    shopping: {
      observation: `Manufacturing emissions from e-commerce shopping are driving up your total.`,
      tip: `Opt for refurbished gadgets and second-hand items which carry an 80% lower lifecycle manufacturing footprint.`,
      nudge: `Buy less, choose well, make it last.`,
      saved_potential_kg: 15,
    },
    travel: {
      observation: `Aviation flights are currently dominating your carbon footprint ledger.`,
      tip: `For domestic routes, consider overnight Indian railway options (like Rajdhani or Shatabdi), which release 90% less CO₂ per passenger than flying.`,
      nudge: `Enjoy the journey on the ground and save tons of sky carbon.`,
      saved_potential_kg: 92,
    },
  };

  const defaultResponse = {
    observation: `Your overall emissions are stable. Keep tracking daily activities.`,
    tip: `Review your weekly logs to find opportunities for minor emission reductions across transport and food.`,
    nudge: `Small modifications lead to massive global impact!`,
    saved_potential_kg: 10,
  };

  return responses[topCategory] || defaultResponse;
}
