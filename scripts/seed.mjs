#!/usr/bin/env node
// Seed the PopQuiz database with demo quizzes.
//
// Run from the repo root:
//   node scripts/seed.mjs
//
// Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from the environment.
// The service-role key bypasses RLS, which is what lets us insert quizzes
// without a real auth.users row attached.
//
// We intentionally do NOT use the anon key here — those inserts would be
// rejected by the row-level security policies (good!).

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local manually so we don't add a runtime dep on dotenv.
try {
  const envPath = resolve(__dirname, '..', '.env.local');
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
} catch {
  // .env.local is optional — env vars may already be set externally.
}

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  console.error('Set them in .env.local (and never commit the service role key).');
  process.exit(1);
}

// Pull seed data from the source file. We compile the .ts on the fly using
// a tiny eval — the file is plain data with no logic, so this is safe.
const seedSrc = readFileSync(resolve(__dirname, '..', 'data', 'seedData.ts'), 'utf8');
const SEED_DATA = (() => {
  const stripped = seedSrc
    .replace(/^import .*$/m, '')
    .replace(/export const SEED_DATA[^=]*=/, 'return ');
  // eslint-disable-next-line no-new-func
  return new Function(stripped + ';')();
})();

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rows = SEED_DATA.map((quiz) => ({
  id: randomUUID(),
  title: quiz.title,
  description: quiz.description,
  questions: quiz.questions,
  outcomes: quiz.outcomes,
  author: quiz.author,
  user_id: null, // demo content — not owned by any real user
  visibility: 'public',
  plays: Math.floor(Math.random() * 5000) + 100,
  created_at: Date.now() - Math.floor(Math.random() * 1_000_000_000),
}));

const { error } = await supabase.from('PopQuiz_Quizzes').insert(rows);

if (error) {
  console.error('Seed failed:', error);
  process.exit(1);
}

console.log(`Seeded ${rows.length} demo quizzes.`);
