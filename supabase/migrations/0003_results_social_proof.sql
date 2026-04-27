-- =============================================================================
-- Allow quiz takers to see who else has played the same quiz.
-- =============================================================================
-- Until now, only the quiz owner could read result rows for their quizzes
-- (results_select_quiz_owner). To power the "Friends who played this" strip
-- on the result screen, we need anyone who can READ a quiz to also be able
-- to read its result rows.
--
-- Privacy implication: usernames + outcomes of takers become visible to any
-- other taker of the same quiz. This is fine for public/unlisted quizzes
-- (the whole point of the share). Private quizzes are unaffected — they
-- are only readable by the owner anyway, so this policy returns nothing
-- for non-owners on private quizzes.
-- =============================================================================

drop policy if exists "results_select_visible_quizzes" on public."PopQuiz_Results";
create policy "results_select_visible_quizzes"
  on public."PopQuiz_Results"
  for select
  using (
    exists (
      select 1 from public."PopQuiz_Quizzes" q
      where q.id = "PopQuiz_Results".quiz_id
        and (
          q.visibility = 'public'
          or q.visibility = 'unlisted'
          or q.user_id = auth.uid()
        )
    )
  );

-- The previous owner-only policy is now a strict subset of the new one,
-- but Postgres OR-combines policies for the same role/operation, so leaving
-- both in place is harmless. Drop it for clarity.
drop policy if exists "results_select_quiz_owner" on public."PopQuiz_Results";
