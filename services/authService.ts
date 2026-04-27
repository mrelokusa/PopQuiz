import { supabase } from "../lib/supabaseClient";
import { UserProfile } from "../types";

// Derives a single-character avatar from a username. Carries the same
// design language as the A/B/C/D answer buttons — bold serif initials.
export const avatarTextFromUsername = (username: string): string => {
  const trimmed = (username ?? '').trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
};

export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user || null;
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('PopQuiz_Profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) return null;
  return data;
};

export const createProfile = async (userId: string, username: string, avatar: string) => {
  const { error } = await supabase
    .from('PopQuiz_Profiles')
    .insert([
      { id: userId, username, avatar_text: avatar }
    ]);
  
  if (error) throw error;
};

export const ensureUserProfile = async (user: any) => {
    if (!user) return;
    
    // Check if profile exists
    const profile = await getUserProfile(user.id);
    if (!profile) {
        // Create it now using metadata or defaults
        const username = user.user_metadata?.username || user.email?.split('@')[0] || 'Anon';
        try {
            await createProfile(user.id, username, avatarTextFromUsername(username));
        } catch (e) {
            console.error("Failed to auto-create profile", e);
        }
    }
}

export const signOut = async () => {
  await supabase.auth.signOut();
};