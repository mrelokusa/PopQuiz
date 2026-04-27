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

// Build quiz rows with the play count we'll later back up with real result
// rows so the Vibe Check stats look believable.
const quizRows = SEED_DATA.map((quiz) => {
  const playCount = Math.floor(Math.random() * 400) + 50; // 50–450 per quiz
  return {
    id: randomUUID(),
    title: quiz.title,
    description: quiz.description,
    questions: quiz.questions,
    outcomes: quiz.outcomes,
    author: quiz.author,
    user_id: null, // demo content — not owned by any real user
    visibility: 'public',
    plays: playCount,
    created_at: Date.now() - Math.floor(Math.random() * 1_000_000_000),
    _playCount: playCount,
  };
});

// Insert the quizzes (strip the helper field).
const { error: quizError } = await supabase
  .from('PopQuiz_Quizzes')
  .insert(quizRows.map(({ _playCount: _, ...row }) => row));

if (quizError) {
  console.error('Seed failed (quizzes):', quizError);
  process.exit(1);
}

// For each quiz, generate _playCount result rows distributed across outcomes
// with a slight bias toward one "trending" outcome so the stats screen
// shows a clear most-common result.
const resultRows = [];
for (const quiz of quizRows) {
  const outcomes = quiz.outcomes;
  if (!outcomes?.length) continue;
  const trendingIdx = Math.floor(Math.random() * outcomes.length);

  for (let i = 0; i < quiz._playCount; i++) {
    // 40% chance trending outcome, 60% spread across the rest.
    const pickTrending = Math.random() < 0.4;
    const outcome = pickTrending
      ? outcomes[trendingIdx]
      : outcomes[Math.floor(Math.random() * outcomes.length)];

    resultRows.push({
      quiz_id: quiz.id,
      outcome_id: outcome.id,
      user_id: null, // anonymous demo plays
      created_at: new Date(quiz.created_at + Math.floor(Math.random() * 1_000_000_000)).toISOString(),
    });
  }
}

// Insert in chunks to stay under any payload limits.
const CHUNK = 500;
for (let i = 0; i < resultRows.length; i += CHUNK) {
  const chunk = resultRows.slice(i, i + CHUNK);
  const { error: resErr } = await supabase.from('PopQuiz_Results').insert(chunk);
  if (resErr) {
    console.error(`Seed failed (results chunk ${i}):`, resErr);
    process.exit(1);
  }
}

console.log(`Seeded ${quizRows.length} quizzes and ${resultRows.length} result rows.`);
