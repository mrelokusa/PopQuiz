-- =============================================================================
-- PopQuiz security baseline
-- =============================================================================
-- Run this in the Supabase SQL editor (or via `supabase db push` if you set up
-- the CLI). It is idempotent — safe to re-run.
--
-- What it does:
--   1. Enables Row-Level Security on all three app tables.
--   2. Defines policies so the database — not the client — enforces who can
--      read and write each row.
--   3. Adds an atomic `increment_quiz_plays` RPC to replace the read-then-write
--      currently in storageService.ts.
--   4. Adds a unique constraint on PopQuiz_Profiles.username.
-- =============================================================================


-- ---------- PopQuiz_Quizzes --------------------------------------------------

alter table public."PopQuiz_Quizzes" enable row level security;

-- SELECT: public quizzes are visible to everyone (incl. anon).
--         Owners can also see their own private/unlisted quizzes.
drop policy if exists "quizzes_select_public_or_own" on public."PopQuiz_Quizzes";
create policy "quizzes_select_public_or_own"
  on public."PopQuiz_Quizzes"
  for select
  using (
    visibility = 'public'
    or visibility = 'unlisted'  -- unlisted = readable if you have the link
    or user_id = auth.uid()
  );

-- INSERT: must be authed and the row must belong to you.
drop policy if exists "quizzes_insert_own" on public."PopQuiz_Quizzes";
create policy "quizzes_insert_own"
  on public."PopQuiz_Quizzes"
  for insert
  with check (auth.uid() is not null and user_id = auth.uid());

-- UPDATE / DELETE: only the owner.
drop policy if exists "quizzes_update_own" on public."PopQuiz_Quizzes";
create policy "quizzes_update_own"
  on public."PopQuiz_Quizzes"
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "quizzes_delete_own" on public."PopQuiz_Quizzes";
create policy "quizzes_delete_own"
  on public."PopQuiz_Quizzes"
  for delete
  using (user_id = auth.uid());


-- ---------- PopQuiz_Results --------------------------------------------------

alter table public."PopQuiz_Results" enable row level security;

-- SELECT: only the quiz author can see who took their quiz and what they got.
--         (Powers Friend Results in My Hub.)
drop policy if exists "results_select_quiz_owner" on public."PopQuiz_Results";
create policy "results_select_quiz_owner"
  on public."PopQuiz_Results"
  for select
  using (
    exists (
      select 1 from public."PopQuiz_Quizzes" q
      where q.id = "PopQuiz_Results".quiz_id
        and q.user_id = auth.uid()
    )
  );

-- INSERT: anyone (incl. anonymous players) can record a result.
--         If a user_id is supplied it must match the caller.
drop policy if exists "results_insert_anyone" on public."PopQuiz_Results";
create policy "results_insert_anyone"
  on public."PopQuiz_Results"
  for insert
  with check (
    user_id is null or user_id = auth.uid()
  );

-- No UPDATE / DELETE policies: results are immutable from the client.


-- ---------- PopQuiz_Profiles -------------------------------------------------

alter table public."PopQuiz_Profiles" enable row level security;

-- SELECT: profiles are public (so we can show "QuizMaster99 got Result X").
drop policy if exists "profiles_select_all" on public."PopQuiz_Profiles";
create policy "profiles_select_all"
  on public."PopQuiz_Profiles"
  for select
  using (true);

-- INSERT: only on signup, only your own row.
drop policy if exists "profiles_insert_own" on public."PopQuiz_Profiles";
create policy "profiles_insert_own"
  on public."PopQuiz_Profiles"
  for insert
  with check (id = auth.uid());

-- UPDATE: only your own row.
drop policy if exists "profiles_update_own" on public."PopQuiz_Profiles";
create policy "profiles_update_own"
  on public."PopQuiz_Profiles"
  for update
  using (id = auth.uid())
  with check (id = auth.uid());


-- ---------- Atomic plays counter --------------------------------------------
-- Replaces the read-then-write in storageService.ts:148-151. Race-safe and
-- unaffected by RLS because it runs as the function owner.

create or replace function public.increment_quiz_plays(quiz_id_in uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public."PopQuiz_Quizzes"
     set plays = coalesce(plays, 0) + 1
   where id = quiz_id_in;
end;
$$;

-- Allow both anon and authed users to call it (recording a play does not
-- require login).
grant execute on function public.increment_quiz_plays(uuid) to anon, authenticated;


-- ---------- Username uniqueness ---------------------------------------------
-- Prevents two users from claiming the same handle. Wrapped in a DO block so
-- re-running is safe.

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'popquiz_profiles_username_unique'
  ) then
    alter table public."PopQuiz_Profiles"
      add constraint popquiz_profiles_username_unique unique (username);
  end if;
end$$;
