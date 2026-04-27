-- =============================================================================
-- PopQuiz baseline schema
-- =============================================================================
-- This file creates every table the application reads or writes. It is
-- intentionally portable: nothing here depends on Supabase-specific features
-- (no foreign keys to `auth.users`, no `auth.uid()`). Drop it into any
-- Postgres 14+ database and the app's data layer will work.
--
-- The Supabase-specific bits (RLS policies that reference `auth.uid()`, the
-- service-role key, etc.) live in supabase/migrations/* and are applied on
-- top of this baseline.
--
-- Run order for a fresh install:
--   1. supabase/schema.sql                                (this file)
--   2. supabase/migrations/0001_rls_and_atomic_plays.sql  (Supabase only)
--   3. supabase/migrations/0002_gemini_usage.sql          (Supabase only)
--   4. supabase/migrations/0003_results_social_proof.sql  (Supabase only)
--   5. supabase/seed.sql                                  (optional demo data)
--
-- All `create` statements are idempotent (`if not exists`) so re-running this
-- file is safe.
-- =============================================================================

-- gen_random_uuid() comes from the pgcrypto extension on vanilla Postgres.
-- Supabase has it enabled by default; this is here for portability.
create extension if not exists pgcrypto;


-- ---------- PopQuiz_Profiles -------------------------------------------------
-- One row per user. On Supabase, `id` matches the `auth.users.id` UUID.
-- On other Postgres deployments, the application is responsible for keeping
-- `id` aligned with whatever auth system is in use.

create table if not exists public."PopQuiz_Profiles" (
  id           uuid        primary key,
  username     text        not null,
  avatar_text  text        not null default '?',
  created_at   timestamptz not null default now()
);

-- One handle per person.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'popquiz_profiles_username_unique'
  ) then
    alter table public."PopQuiz_Profiles"
      add constraint popquiz_profiles_username_unique unique (username);
  end if;
end$$;


-- ---------- PopQuiz_Quizzes --------------------------------------------------
-- A quiz is fully self-contained: questions and outcomes are denormalised
-- into JSONB columns. This matches how the client builds and reads them.
-- `user_id` is nullable so that demo / seeded content can exist without
-- belonging to a real user.

create table if not exists public."PopQuiz_Quizzes" (
  id           uuid        primary key default gen_random_uuid(),
  title        text        not null,
  description  text        not null default '',
  questions    jsonb       not null default '[]'::jsonb,
  outcomes     jsonb       not null default '[]'::jsonb,
  author       text        not null default 'Anonymous',
  user_id      uuid,
  visibility   text        not null default 'public'
                  check (visibility in ('public', 'unlisted', 'private')),
  plays        integer     not null default 0,
  created_at   timestamptz not null default now()
);

-- "Quizzes I made" lookup (My Hub).
create index if not exists popquiz_quizzes_user_id_idx
  on public."PopQuiz_Quizzes" (user_id);

-- "Trending globally" lookup (landing feed): newest public first.
create index if not exists popquiz_quizzes_public_feed_idx
  on public."PopQuiz_Quizzes" (visibility, created_at desc);


-- ---------- PopQuiz_Results --------------------------------------------------
-- One row per quiz play. `user_id` is nullable for anonymous plays.
-- `outcome_id` is the string id from the parent quiz's outcomes array (e.g.
-- 'o1') — not a foreign key because outcomes live inside the quiz JSONB.

create table if not exists public."PopQuiz_Results" (
  id           bigserial   primary key,
  quiz_id      uuid        not null references public."PopQuiz_Quizzes"(id) on delete cascade,
  outcome_id   text        not null,
  user_id      uuid,
  created_at   timestamptz not null default now()
);

-- Power per-quiz stats lookups (community vibe check, recent takers).
create index if not exists popquiz_results_quiz_id_idx
  on public."PopQuiz_Results" (quiz_id, created_at desc);

-- Quick lookup of "what has this user played".
create index if not exists popquiz_results_user_id_idx
  on public."PopQuiz_Results" (user_id);


-- ---------- PopQuiz_GeminiUsage ----------------------------------------------
-- Per-user log of AI generation requests. Used by /api/generate-quiz to
-- enforce an hourly rate limit. Only the server (service role) reads or
-- writes this table; RLS in migration 0002 locks anon/authenticated out.

create table if not exists public."PopQuiz_GeminiUsage" (
  id           bigserial   primary key,
  user_id      uuid        not null,
  created_at   timestamptz not null default now()
);

create index if not exists popquiz_gemini_usage_user_created_at_idx
  on public."PopQuiz_GeminiUsage" (user_id, created_at desc);
