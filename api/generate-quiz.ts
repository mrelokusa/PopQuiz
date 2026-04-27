import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// Keep this list in sync with constants/outcomeIcons.ts. We inline rather
// than import so the serverless function doesn't pull lucide-react.
const ICON_NAMES = [
  'crown','skull','ghost','bot','cat','dog','bird','fish','rabbit','rat',
  'heart','flame','zap','star','sparkles','sun','moon','cloud','mountain','anchor',
  'eye','smile','brain','drama','music','book','coffee','pizza','camera','gamepad',
  'rocket','trophy','target','compass','hammer','scissors','key','gem',
];

const SYSTEM_INSTRUCTION = `
You are a creative viral content generator.
Create fun, engaging, and slightly edgy personality quizzes.
The output must be strictly JSON matching the schema.
Ensure questions are short and answers map clearly to specific outcomes.
Include 4 distinct outcomes and 6 questions.
For each outcome, set "image" to ONE name from this list, picking the icon
that best matches the outcome's vibe: ${ICON_NAMES.join(', ')}.
Do not invent new names and do not use emojis.
`;

// Per-user hourly cap. Generous enough that real users never see it; tight
// enough that a script kiddie can't drain the Gemini budget overnight.
const HOURLY_LIMIT = 20;

const RESPONSE_SCHEMA = {
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
          image: { type: Type.STRING, description: `One icon name from: ${ICON_NAMES.join(', ')}` },
        },
        required: ['id', 'title', 'description', 'image'],
      },
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
                outcomeId: {
                  type: Type.STRING,
                  description: 'Must match one of the outcome IDs defined above',
                },
              },
              required: ['text', 'outcomeId'],
            },
          },
        },
        required: ['text', 'answers'],
      },
    },
  },
  required: ['title', 'description', 'outcomes', 'questions'],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!geminiKey || !supabaseUrl || !serviceRoleKey) {
    console.error('generate-quiz: missing env', {
      hasGeminiKey: !!geminiKey,
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceRoleKey: !!serviceRoleKey,
    });
    return res.status(500).json({ error: 'SERVER_MISCONFIGURED' });
  }

  // 1. Verify the caller is logged in. We trust Supabase to validate the JWT.
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) {
    return res.status(401).json({ error: 'NOT_AUTHENTICATED' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userResult, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userResult?.user) {
    return res.status(401).json({ error: 'NOT_AUTHENTICATED' });
  }
  const userId = userResult.user.id;

  // 2. Rate limit: count this user's calls in the last hour.
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: countError } = await supabase
    .from('PopQuiz_GeminiUsage')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo);

  if (countError) {
    console.error('generate-quiz: rate limit check failed', countError);
    return res.status(500).json({ error: 'RATE_CHECK_FAILED' });
  }

  if ((count ?? 0) >= HOURLY_LIMIT) {
    return res.status(429).json({ error: 'RATE_LIMITED', limit: HOURLY_LIMIT });
  }

  // 3. Validate the topic.
  const topic = typeof req.body?.topic === 'string' ? req.body.topic.trim() : '';
  if (!topic || topic.length > 200) {
    return res.status(400).json({ error: 'INVALID_TOPIC' });
  }

  // 4. Call Gemini.
  try {
    const ai = new GoogleGenAI({ apiKey: geminiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a viral personality quiz about: ${topic}.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    if (!response.text) {
      return res.status(502).json({ error: 'AI_EMPTY_RESPONSE' });
    }

    const data = JSON.parse(response.text);

    // Log usage AFTER a successful call. Failed calls don't count against the
    // user's quota — they didn't get a quiz, so they shouldn't pay for one.
    await supabase.from('PopQuiz_GeminiUsage').insert({ user_id: userId });

    return res.status(200).json(data);
  } catch (err: any) {
    console.error('generate-quiz: AI call failed', err?.message || err);
    return res.status(502).json({ error: 'AI_GENERATION_FAILED' });
  }
}
