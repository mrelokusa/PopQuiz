# Database

All schema lives here as plain SQL — runnable in any Postgres 14+ database, not just Supabase.

## Layout

```
supabase/
├── schema.sql                      Full CREATE TABLE definitions (the baseline)
├── seed.sql                        Optional demo quizzes + result rows
├── README.md                       This file
└── migrations/
    ├── 0001_rls_and_atomic_plays.sql      RLS policies, plays RPC, username uniqueness
    ├── 0002_gemini_usage.sql              Rate-limit table for the Gemini proxy
    └── 0003_results_social_proof.sql      Lets takers see other takers' results
```

`schema.sql` is portable and uses no Supabase-specific features. The migrations are Supabase-flavoured (they reference `auth.uid()` for RLS); on a non-Supabase Postgres you'd skip them and implement equivalent authorisation in your app layer.

## Run order — fresh install

```text
1.  schema.sql
2.  migrations/0001_rls_and_atomic_plays.sql
3.  migrations/0002_gemini_usage.sql
4.  migrations/0003_results_social_proof.sql
5.  seed.sql                        (optional)
```

In the Supabase dashboard: SQL Editor → paste each file → Run. In `psql`: `\i supabase/schema.sql`, etc.

## Run order — existing Supabase project

If your tables already exist (created via the dashboard or earlier setup), skip step 1 and run only the migrations + seed.

## Moving off Supabase

The application code only depends on:

* The four tables defined in `schema.sql`.
* The `increment_quiz_plays(uuid)` RPC defined in migration 0001.
* A way to identify the current user (Supabase uses `auth.uid()`; on Postgres you can stuff the user id into a session-local setting and reference `current_setting('app.user_id')` in your policies).

Everything else (auth, realtime, edge functions) is replaceable.
