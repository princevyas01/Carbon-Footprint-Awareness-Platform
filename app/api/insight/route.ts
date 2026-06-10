import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 5 * 60 * 1000; // 5 minutes

export async function POST(req: NextRequest) {
  try {
    // Debug checks for API key
    console.log('API Key present:', !!process.env.GEMINI_API_KEY);
    console.log('API Key length:', process.env.GEMINI_API_KEY?.length || 0);

    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'default';
    const lastCall = rateLimitMap.get(ip) || 0;
    const now = Date.now();
    
    if (now - lastCall < RATE_LIMIT_MS) {
      const retryAfter = Math.ceil((RATE_LIMIT_MS - (now - lastCall)) / 1000);
      return NextResponse.json(
        { error: 'Rate limited', retryAfter },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }

    // Parse body
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
      console.error('GEMINI_API_KEY is not set');
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
      console.error('Gemini API error:', geminiResponse.status, errorText);
      return NextResponse.json(
        { error: `Gemini error: ${geminiResponse.status}` },
        { status: 502 }
      );
    }

    const geminiData = await geminiResponse.json();

    // Extract text from Gemini response
    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!rawText) {
      console.error('Empty Gemini response:', geminiData);
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
      console.error('Failed to parse Gemini response as JSON:', cleaned);
      // Return a fallback insight instead of erroring
      insight = {
        observation: `Your total footprint this month is ${Object.values(monthlyTotals).reduce((a: number, b) => a + (b as number), 0).toFixed(1)} kg CO2, with ${topCategory} as your biggest source.`,
        tip: "Try taking public transport or metro for your daily commute to reduce emissions significantly.",
        nudge: "Every small action adds up — you're making a real difference for India's climate future.",
        saved_potential_kg: 12
      };
    }

    // Update rate limit
    rateLimitMap.set(ip, now);

    return NextResponse.json({ insight }, { status: 200 });

  } catch (error) {
    console.error('Insight API unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
