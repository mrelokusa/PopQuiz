import { supabase } from '../lib/supabaseClient';

// Calls /api/delete-account, which uses the service-role key server-side to
// delete the auth user + cascade their data. The client-side anon key cannot
// do this directly.
export const deleteMyAccount = async (): Promise<void> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const response = await fetch('/api/delete-account', {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error || 'Delete failed');
  }

  await supabase.auth.signOut();
};

// GDPR portability: hand the user a JSON dump of everything we have on them.
export const exportMyData = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const [profileRes, quizzesRes, resultsRes] = await Promise.all([
    supabase.from('PopQuiz_Profiles').select('*').eq('id', user.id).single(),
    supabase.from('PopQuiz_Quizzes').select('*').eq('user_id', user.id),
    supabase.from('PopQuiz_Results').select('*').eq('user_id', user.id),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    profile: profileRes.data ?? null,
    quizzes: quizzesRes.data ?? [],
    results: resultsRes.data ?? [],
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `popquiz-export-${user.id}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
