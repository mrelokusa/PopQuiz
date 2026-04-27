import { Quiz } from '../types';
import { supabase } from '../lib/supabaseClient';

// Server-known error codes from /api/generate-quiz.
export type GenerateQuizError =
  | 'NOT_AUTHENTICATED'
  | 'RATE_LIMITED'
  | 'INVALID_TOPIC'
  | 'AI_GENERATION_FAILED'
  | 'AI_EMPTY_RESPONSE'
  | 'SERVER_MISCONFIGURED'
  | 'NETWORK_ERROR';

export class GenerateQuizException extends Error {
  code: GenerateQuizError;
  constructor(code: GenerateQuizError, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export const generateAIQuiz = async (topic: string): Promise<Partial<Quiz> | null> => {
  // Caller must be logged in — the server enforces this too, but checking
  // here lets us skip the network round-trip and surface a clearer error.
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new GenerateQuizException('NOT_AUTHENTICATED');
  }

  let response: Response;
  try {
    response = await fetch('/api/generate-quiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ topic }),
    });
  } catch {
    throw new GenerateQuizException('NETWORK_ERROR');
  }

  if (!response.ok) {
    let code: GenerateQuizError = 'AI_GENERATION_FAILED';
    try {
      const body = await response.json();
      if (typeof body?.error === 'string') code = body.error as GenerateQuizError;
    } catch {
      // Non-JSON error response — fall through with the default code.
    }
    throw new GenerateQuizException(code);
  }

  const data = await response.json();

  // Post-process to add the IDs and colour classes the UI expects. Mirrors
  // what the old client-side service used to do.
  return {
    ...data,
    id: crypto.randomUUID(),
    author: 'AI Creator',
    createdAt: Date.now(),
    plays: 0,
    outcomes: data.outcomes.map((o: any, i: number) => ({
      ...o,
      colorClass: ['bg-neo-coral', 'bg-neo-mint', 'bg-neo-lemon', 'bg-neo-periwinkle'][i % 4],
    })),
    questions: data.questions.map((q: any, i: number) => ({
      ...q,
      id: `q${i}`,
      answers: q.answers.map((a: any, j: number) => ({
        ...a,
        id: `q${i}_a${j}`,
      })),
    })),
  };
};
