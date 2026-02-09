import { Quiz, QuizResult } from "../types";
import { supabase } from "../lib/supabaseClient";
import { MOCK_QUIZ } from "../constants";
import { SEED_DATA } from "../data/seedData";

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

export const getQuizzes = async (scope: 'global' | 'local', userId?: string): Promise<Quiz[]> => {
  try {
    let query = supabase
      .from(TABLE_QUIZZES)
      .select('*')
      .order('created_at', { ascending: false });

    // If Local scope, only show quizzes created by the user
    if (scope === 'local' && userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase fetch error:", error);
      return [];
    }

    return data.map((item: any) => ({
      ...item,
      createdAt: parseCreatedAt(item.created_at)
    }));

  } catch (e) {
    console.error("Storage error", e);
    return [];
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
    
    // Import toast dynamically to avoid circular dependencies
    const { useToast } = await import('../contexts/ToastContext');
    
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

    // Create a temporary toast container for this error
    const toastDiv = document.createElement('div');
    toastDiv.className = 'fixed top-4 right-4 z-50 bg-neo-coral text-white border-2 border-black px-4 py-3 rounded-lg shadow-neo-md font-bold text-sm max-w-[400px]';
    toastDiv.textContent = `Save failed: ${errorMessage}`;
    document.body.appendChild(toastDiv);
    
    setTimeout(() => {
        document.body.removeChild(toastDiv);
    }, 5000);
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

    return {
      ...data,
      createdAt: parseCreatedAt(data.created_at)
    };
  } catch (e) {
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
            // We let DB handle created_at default here, likely now() or current timestamp
        }]);
        
        // Increment play count
        const { data } = await supabase.from(TABLE_QUIZZES).select('plays').eq('id', quizId).single();
        if (data) {
            await supabase.from(TABLE_QUIZZES).update({ plays: data.plays + 1 }).eq('id', quizId);
        }

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
                outcome_image: outcome?.image || '❓',
                taker_username: taker?.username || 'Anonymous'
            };
        });

    } catch(e) {
        console.error("Activity error", e);
        return [];
    }
}

// --- Seed ---

export const seedDatabase = async (): Promise<void> => {
  try {
    const quizzesToInsert = SEED_DATA.map(quiz => ({
       // Explicitly map properties to avoid extra data issues in seed too
       id: crypto.randomUUID(), // Generate new IDs for seed data
       title: quiz.title,
       description: quiz.description,
       questions: quiz.questions,
       outcomes: quiz.outcomes,
       author: quiz.author,
       plays: Math.floor(Math.random() * 5000) + 100,
       created_at: Date.now() - Math.floor(Math.random() * 1000000000)
    }));

    const { error } = await supabase
      .from(TABLE_QUIZZES)
      .insert(quizzesToInsert);

    if (error) {
        console.error("Seed error:", error);
        const toastDiv = document.createElement('div');
        toastDiv.className = 'fixed top-4 right-4 z-50 bg-neo-coral text-white border-2 border-black px-4 py-3 rounded-lg shadow-neo-md font-bold text-sm max-w-[400px]';
        toastDiv.textContent = "Seed failed: " + error.message;
        document.body.appendChild(toastDiv);
        setTimeout(() => document.body.removeChild(toastDiv), 5000);
    } else {
        const toastDiv = document.createElement('div');
        toastDiv.className = 'fixed top-4 right-4 z-50 bg-neo-mint text-black border-2 border-black px-4 py-3 rounded-lg shadow-neo-md font-bold text-sm max-w-[400px]';
        toastDiv.textContent = `Database seeded successfully with ${quizzesToInsert.length} viral quizzes!`;
        document.body.appendChild(toastDiv);
        setTimeout(() => {
            document.body.removeChild(toastDiv);
            window.location.reload();
        }, 2000);
    }
  } catch (e) {
      console.error("Seed exception", e);
      alert("Seed failed see console");
  }
};