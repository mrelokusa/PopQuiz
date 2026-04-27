import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Deletes the caller's account and all of their data.
// The client cannot do this directly: deleting from auth.users requires the
// service-role key, and cascading deletes on app tables run server-side here
// because we cannot rely on the DB schema having ON DELETE CASCADE configured.

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'SERVER_MISCONFIGURED' });
  }

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

  // Delete in dependency order. Errors are logged but not fatal — we still
  // try to delete the auth user so the account is at least gone.
  const tables: Array<{ table: string; column: string }> = [
    { table: 'PopQuiz_GeminiUsage', column: 'user_id' },
    { table: 'PopQuiz_Results', column: 'user_id' },
    { table: 'PopQuiz_Quizzes', column: 'user_id' },
    { table: 'PopQuiz_Profiles', column: 'id' },
  ];

  for (const { table, column } of tables) {
    const { error } = await supabase.from(table).delete().eq(column, userId);
    if (error) console.error(`delete-account: failed to clear ${table}`, error);
  }

  const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId);
  if (deleteAuthError) {
    console.error('delete-account: auth.deleteUser failed', deleteAuthError);
    return res.status(500).json({ error: 'DELETE_FAILED' });
  }

  return res.status(200).json({ ok: true });
}
