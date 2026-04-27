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

// Postgres unique-violation code. We retry the insert with a numeric suffix
// when this comes back, so a colliding username doesn't block sign-up.
const PG_UNIQUE_VIOLATION = '23505';
const MAX_USERNAME_RETRIES = 5;

export const createProfile = async (
  userId: string,
  username: string,
  avatar: string
): Promise<{ username: string }> => {
  // Try the requested username first, then username4, username82, etc. on
  // unique-constraint collisions. Limited retries so we don't spin forever.
  let attempt = username;
  for (let i = 0; i < MAX_USERNAME_RETRIES; i++) {
    const { error } = await supabase
      .from('PopQuiz_Profiles')
      .insert([{ id: userId, username: attempt, avatar_text: avatar }]);

    if (!error) return { username: attempt };

    // Anything other than a username collision is a hard failure — bubble it.
    if (error.code !== PG_UNIQUE_VIOLATION) {
      console.error('createProfile failed:', error);
      throw new Error(error.message || 'Could not create profile');
    }

    // Username taken — append a 2- or 3-digit suffix and try again.
    const suffix = Math.floor(Math.random() * 900) + 10;
    attempt = `${username}${suffix}`;
  }

  throw new Error('Username unavailable. Please pick a different name.');
};

export const ensureUserProfile = async (user: any): Promise<void> => {
    if (!user) return;

    const profile = await getUserProfile(user.id);
    if (profile) return;

    const baseUsername = user.user_metadata?.username || user.email?.split('@')[0] || 'Anon';
    try {
        await createProfile(user.id, baseUsername, avatarTextFromUsername(baseUsername));
    } catch (e: any) {
        // Don't swallow: the rest of the app behaves badly without a profile,
        // and silent failure here is what makes account creation seem broken.
        console.error('ensureUserProfile: profile creation failed', e?.message || e);
        throw e;
    }
}

export const signOut = async () => {
  await supabase.auth.signOut();
};