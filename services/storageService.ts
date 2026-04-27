import { Quiz, QuizResult } from "../types";
import { supabase } from "../lib/supabaseClient";
import { getCurrentUser } from "./authService";
import { MOCK_QUIZ } from "../constants";

const TABLE_QUIZZES = 'PopQuiz_Quizzes';
const TABLE_RESULTS = 'PopQuiz_Results';

// Helper to handle various date formats from DB (bigint number, stringified number, or ISO string)
const parseCreatedAt = (val: any): number => {
    if (!val) return Date.now();
    if (typeof val === 'number') return val;
    // If it's a string consisting only of digits, treat as timestamp
    if (typeof val === 'string' && /^\d+$/.test(val)) {
        return parseInt(val, 10);
    }
    // Fallback for ISO strings
    return new Date(val).getTime();
};

// --- Quizzes ---

export const PAGE_SIZE = 12;

export const getQuizzes = async (
  scope: 'global' | 'local',
  userId?: string,
  options?: { offset?: number; limit?: number }
): Promise<Quiz[]> => {
  try {
    const limit = options?.limit ?? PAGE_SIZE;
    const offset = options?.offset ?? 0;

    let query = supabase
      .from(TABLE_QUIZZES)
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (scope === 'local' && userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('visibility', 'public');
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase fetch error:", error);
      throw new Error(error.message || "Failed to load quizzes");
    }

    return data.map((item: any) => ({
      ...item,
      createdAt: parseCreatedAt(item.created_at)
    }));

  } catch (e: any) {
    console.error("Storage error", e);
    throw e;
  }
};

export const saveQuiz = async (quiz: Quiz): Promise<boolean> => {
  try {
    // Strictly sanitize payload to ensure no extra properties (like from AI raw data) are sent
    // And ensure correct types for DB columns
    const payload = {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        questions: quiz.questions,
        outcomes: quiz.outcomes,
        author: quiz.author,
        user_id: quiz.user_id || null, 
        plays: quiz.plays || 0,
        visibility: quiz.visibility || 'public', // Default to public
        // Ensure created_at is a number (bigint in DB)
        created_at: typeof quiz.createdAt === 'number' ? quiz.createdAt : Date.now()
    };

    const { error } = await supabase
      .from(TABLE_QUIZZES)
      .insert([payload]);

    if (error) throw error;
    return true;
  } catch (e: any) {
    console.error("Save error details:", e);
    
    let errorMessage = "Unknown error occurred";
    
    // Robust error message extraction
    if (e?.message && typeof e.message === 'string') {
        errorMessage = e.message;
    } else if (e?.details && typeof e.details === 'string') {
        errorMessage = e.details;
    } else if (typeof e === 'string') {
        errorMessage = e;
    } else {
        try {
            errorMessage = JSON.stringify(e);
        } catch {
            errorMessage = "Unserializable error object";
        }
    }

    // Simple error fallback for now - will be handled by calling component
    console.error(`Save failed: ${errorMessage}`);
    return false;
  }
};

export const updateQuiz = async (quiz: Quiz): Promise<boolean> => {
  try {
    // Mirrors the strict payload from saveQuiz. RLS guarantees only the
    // owner can update, so we don't need to check user_id here.
    const payload = {
      title: quiz.title,
      description: quiz.description,
      questions: quiz.questions,
      outcomes: quiz.outcomes,
      visibility: quiz.visibility || 'public',
    };

    const { error } = await supabase
      .from(TABLE_QUIZZES)
      .update(payload)
      .eq('id', quiz.id);

    if (error) throw error;
    return true;
  } catch (e: any) {
    console.error('Update error:', e);
    return false;
  }
};

export const deleteQuiz = async (quizId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(TABLE_QUIZZES)
      .delete()
      .eq('id', quizId);
    if (error) throw error;
    return true;
  } catch (e: any) {
    console.error('Delete error:', e);
    return false;
  }
};

export const getQuizById = async (id: string): Promise<Quiz | undefined> => {
  try {
    if (id === MOCK_QUIZ.id) return MOCK_QUIZ;

    const { data, error } = await supabase
      .from(TABLE_QUIZZES)
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return undefined;

    const quiz = {
      ...data,
      createdAt: parseCreatedAt(data.created_at)
    };

    // Check visibility for private/unlisted quizzes
    const user = await getCurrentUser();
    if (quiz.visibility === 'private' && quiz.user_id !== user?.id) {
      return undefined; // Don't return private quizzes to other users
    }

    return quiz;
  } catch {
    return undefined;
  }
};

// --- Results (Social) ---

export const saveResult = async (quizId: string, outcomeId: string, userId?: string) => {
    try {
        await supabase.from(TABLE_RESULTS).insert([{
            quiz_id: quizId,
            outcome_id: outcomeId,
            user_id: userId || null
        }]);

        // Atomic + RLS-safe. The RPC runs as security definer so non-owners
        // can still bump the play count without owning the quiz row.
        await supabase.rpc('increment_quiz_plays', { quiz_id_in: quizId });

    } catch(e) {
        console.error("Error saving result", e);
    }
}

export const getQuizOutcomeStats = async (quizId: string): Promise<Record<string, number>> => {
    try {
        const { data, error } = await supabase
            .from(TABLE_RESULTS)
            .select('outcome_id')
            .eq('quiz_id', quizId);
        
        if (error || !data) return {};
        
        const counts: Record<string, number> = {};
        data.forEach((row: any) => {
            counts[row.outcome_id] = (counts[row.outcome_id] || 0) + 1;
        });
        return counts;
    } catch(e) {
        console.error("Stats error", e);
        return {};
    }
}

// Recent takers for a single quiz, used as social proof on the result screen.
// Visible to anyone who can read the quiz (RLS: see migration 0003).
export const getRecentResultsForQuiz = async (
  quizId: string,
  limit = 8
): Promise<QuizResult[]> => {
  try {
    const { data, error } = await supabase
      .from(TABLE_RESULTS)
      .select(`
        id, quiz_id, user_id, outcome_id, created_at,
        PopQuiz_Profiles ( username, avatar_text )
      `)
      .eq('quiz_id', quizId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];

    // We need the outcome title + image — fetch the parent quiz once.
    const quiz = await getQuizById(quizId);
    const outcomes = quiz?.outcomes ?? [];

    return data.map((r: any) => {
      const outcome = outcomes.find((o: any) => o.id === r.outcome_id);
      const taker = r.PopQuiz_Profiles;
      return {
        id: r.id,
        quiz_id: r.quiz_id,
        user_id: r.user_id,
        outcome_id: r.outcome_id,
        created_at: parseCreatedAt(r.created_at),
        outcome_title: outcome?.title || 'Unknown',
        outcome_image: outcome?.image || '?',
        taker_username: taker?.username || 'Anonymous',
        taker_avatar: taker?.avatar_text || '?',
      };
    });
  } catch (e) {
    console.error('Recent results error', e);
    return [];
  }
};

// Get results for quizzes I created (to see what friends got)
export const getMyQuizActivity = async (myUserId: string): Promise<QuizResult[]> => {
    try {
        // 1. Get IDs of quizzes I created
        const { data: myQuizzes } = await supabase.from(TABLE_QUIZZES).select('id').eq('user_id', myUserId);
        if (!myQuizzes || myQuizzes.length === 0) return [];

        const quizIds = myQuizzes.map(q => q.id);

        // 2. Get results for those quizzes
        const { data: results } = await supabase
            .from(TABLE_RESULTS)
            .select(`
                *,
                PopQuiz_Profiles (username, avatar_text),
                PopQuiz_Quizzes (title, outcomes)
            `)
            .in('quiz_id', quizIds)
            .order('created_at', { ascending: false })
            .limit(20);

        if (!results) return [];

        // 3. Map to simple structure
        return results.map((r: any) => {
            const quiz = r.PopQuiz_Quizzes;
            const outcome = quiz.outcomes.find((o: any) => o.id === r.outcome_id);
            const taker = r.PopQuiz_Profiles;

            return {
                id: r.id,
                quiz_id: r.quiz_id,
                user_id: r.user_id,
                outcome_id: r.outcome_id,
                created_at: parseCreatedAt(r.created_at),
                quiz_title: quiz.title,
                outcome_title: outcome?.title || 'Unknown',
                outcome_image: outcome?.image || '?',
                taker_username: taker?.username || 'Anonymous'
            };
        });

    } catch(e) {
        console.error("Activity error", e);
        return [];
    }
}

// Seeding lives in scripts/seed.mjs and runs server-side with the service-role
// key. It is intentionally NOT importable from the browser bundle.