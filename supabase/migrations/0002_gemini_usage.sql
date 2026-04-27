-- =============================================================================
-- Gemini usage log for server-side rate limiting
-- =============================================================================
-- The /api/generate-quiz Vercel function inserts one row per AI generation
-- request, and rejects new requests if a user has exceeded the hourly cap.
-- Only the server (using SUPABASE_SERVICE_ROLE_KEY) needs access — RLS is
-- enabled with no policies so the anon key cannot read or write this table.
-- =============================================================================

create table if not exists public."PopQuiz_GeminiUsage" (
  id          bigserial primary key,
  user_id     uuid not null,
  created_at  timestamptz not null default now()
);

-- Cheap lookup for "how many calls did this user make in the last hour".
create index if not exists popquiz_gemini_usage_user_created_at_idx
  on public."PopQuiz_GeminiUsage" (user_id, created_at desc);

alter table public."PopQuiz_GeminiUsage" enable row level security;
-- No policies on purpose: only the service_role bypasses RLS. The anon and
-- authenticated roles cannot select, insert, update, or delete.
