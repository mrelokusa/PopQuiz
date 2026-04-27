-- =============================================================================
-- PopQuiz demo seed
-- =============================================================================
-- Inserts six demo quizzes and a believable distribution of "play" results
-- so the global feed and Vibe Check stats look populated.
--
-- Safe to run multiple times (each run adds another batch of six quizzes
-- with fresh random ids — doesn't touch existing rows).
--
-- Prerequisites:
--   * supabase/schema.sql has been applied
--   * The session running this has insert rights on the tables
--     (the Supabase SQL editor uses the service role automatically;
--     RLS is bypassed)
-- =============================================================================


-- ---------- Helper ----------------------------------------------------------
-- Generates N anonymous plays for one quiz, biased toward p_trending_outcome
-- so the Vibe Check shows a clear "most common" result. Defined first so the
-- DO block below can `perform` it.

create or replace function pg_temp.seed_results(
  p_quiz_id          uuid,
  p_count            integer,
  p_trending_outcome text
) returns void language plpgsql as $func$
declare
  outcome_ids text[] := array['o1','o2','o3','o4'];
  pick text;
  i int;
begin
  for i in 1..p_count loop
    if random() < 0.4 then
      pick := p_trending_outcome;
    else
      pick := outcome_ids[1 + floor(random() * 4)::int];
    end if;
    insert into public."PopQuiz_Results" (quiz_id, outcome_id, user_id, created_at)
    values (p_quiz_id, pick, null, now() - (random() * interval '30 days'));
  end loop;
end
$func$;


-- ---------- Insert ----------------------------------------------------------

do $do$
declare
  q_office     uuid := gen_random_uuid();
  q_genz       uuid := gen_random_uuid();
  q_bread      uuid := gen_random_uuid();
  q_redflag    uuid := gen_random_uuid();
  q_cursed     uuid := gen_random_uuid();
  q_corporate  uuid := gen_random_uuid();
begin

insert into public."PopQuiz_Quizzes" (id, title, description, questions, outcomes, author, user_id, visibility, plays, created_at) values

(q_office,
 'Which "The Office" Character Matches Your Energy?',
 'Are you the World''s Best Boss or just here for pretzel day? Find out now.',
 $json$[
   {"id":"q1","text":"It's 5:00 PM on Friday. What are you doing?","answers":[
     {"id":"a1","text":"Inviting everyone to my condo for a party!","outcomeId":"o1"},
     {"id":"a2","text":"Checking the perimeter security one last time.","outcomeId":"o2"},
     {"id":"a3","text":"Gossiping in the annex.","outcomeId":"o3"},
     {"id":"a4","text":"I left at 4:58 PM.","outcomeId":"o4"}]},
   {"id":"q2","text":"What is your management style?","answers":[
     {"id":"a1","text":"Somehow I Manage.","outcomeId":"o1"},
     {"id":"a2","text":"Dictatorship.","outcomeId":"o2"},
     {"id":"a3","text":"Branding and personal image.","outcomeId":"o3"},
     {"id":"a4","text":"Do not speak to me.","outcomeId":"o4"}]},
   {"id":"q3","text":"Pick a survival item.","answers":[
     {"id":"a1","text":"A magic set.","outcomeId":"o1"},
     {"id":"a2","text":"Nun-chucks.","outcomeId":"o2"},
     {"id":"a3","text":"My phone.","outcomeId":"o3"},
     {"id":"a4","text":"Crossword puzzles.","outcomeId":"o4"}]}
 ]$json$::jsonb,
 $json$[
   {"id":"o1","title":"Michael Scott","description":"Chaotic, needy, but ultimately full of love. You want people to be afraid of how much they love you.","image":"crown","colorClass":"bg-neo-blue"},
   {"id":"o2","title":"Dwight Schrute","description":"Intense, loyal, and prepared for the apocalypse. You are the Assistant (to the) Regional Manager.","image":"eye","colorClass":"bg-neo-lemon"},
   {"id":"o3","title":"Kelly Kapoor","description":"You have a lot of questions. Number one: how dare you?","image":"sparkles","colorClass":"bg-neo-coral"},
   {"id":"o4","title":"Stanley Hudson","description":"You are done. You have been done since 9am. Did I stutter?","image":"coffee","colorClass":"bg-neo-mint"}
 ]$json$::jsonb,
 'DunderMifflinAdmin', null, 'public', 0, now() - interval '14 days'),

(q_genz,
 'What is Your Actual Gen Z Aesthetic?',
 'Forget your zodiac sign. Are you Cottagecore, Dark Academia, or Y2K Chaos?',
 $json$[
   {"id":"q1","text":"Pick a weekend activity.","answers":[
     {"id":"a1","text":"Reading poetry in a cemetery.","outcomeId":"o1"},
     {"id":"a2","text":"Gardening and jam making.","outcomeId":"o2"},
     {"id":"a3","text":"Editing TikToks.","outcomeId":"o3"},
     {"id":"a4","text":"Rotting in bed.","outcomeId":"o4"}]},
   {"id":"q2","text":"Choose a beverage.","answers":[
     {"id":"a1","text":"Black coffee.","outcomeId":"o1"},
     {"id":"a2","text":"Herbal tea with honey.","outcomeId":"o2"},
     {"id":"a3","text":"Energy drink.","outcomeId":"o3"},
     {"id":"a4","text":"Whatever is in the fridge.","outcomeId":"o4"}]},
   {"id":"q3","text":"Pick a shoe.","answers":[
     {"id":"a1","text":"Loafers.","outcomeId":"o1"},
     {"id":"a2","text":"Bare feet.","outcomeId":"o2"},
     {"id":"a3","text":"Platform boots.","outcomeId":"o3"},
     {"id":"a4","text":"Crocs.","outcomeId":"o4"}]}
 ]$json$::jsonb,
 $json$[
   {"id":"o1","title":"Dark Academia","description":"Tweed blazers, rainy days, and secret societies. You romanticize studying.","image":"book","colorClass":"bg-neo-black text-white"},
   {"id":"o2","title":"Cottagecore","description":"Baking bread, frolicking in meadows, and rejecting modernity.","image":"flame","colorClass":"bg-neo-mint"},
   {"id":"o3","title":"Y2K Cyber","description":"Chrome, neon, fast internet, and faster sunglasses. You are living in 2003.","image":"gamepad","colorClass":"bg-neo-periwinkle"},
   {"id":"o4","title":"Goblin Mode","description":"Comfort over everything. Snacks in bed. Feral energy.","image":"skull","colorClass":"bg-neo-coral"}
 ]$json$::jsonb,
 'VibeChecker', null, 'public', 0, now() - interval '11 days'),

(q_bread,
 'Which Bread Are You?',
 'The most important scientific question of our time.',
 $json$[
   {"id":"q1","text":"How do you handle stress?","answers":[
     {"id":"a1","text":"I ferment in my feelings.","outcomeId":"o1"},
     {"id":"a2","text":"I get tough.","outcomeId":"o2"},
     {"id":"a3","text":"I crumble immediately.","outcomeId":"o3"},
     {"id":"a4","text":"I stay soft.","outcomeId":"o4"}]},
   {"id":"q2","text":"Pick a best friend.","answers":[
     {"id":"a1","text":"Avocado.","outcomeId":"o1"},
     {"id":"a2","text":"Cream Cheese.","outcomeId":"o2"},
     {"id":"a3","text":"Chocolate.","outcomeId":"o3"},
     {"id":"a4","text":"Peanut Butter.","outcomeId":"o4"}]},
   {"id":"q3","text":"What's your vibe?","answers":[
     {"id":"a1","text":"Hipster.","outcomeId":"o1"},
     {"id":"a2","text":"New Yorker.","outcomeId":"o2"},
     {"id":"a3","text":"Parisian.","outcomeId":"o3"},
     {"id":"a4","text":"Suburban.","outcomeId":"o4"}]}
 ]$json$::jsonb,
 $json$[
   {"id":"o1","title":"Sourdough","description":"High maintenance, tangy, and universally loved. You have a lot of culture.","image":"star","colorClass":"bg-neo-lemon"},
   {"id":"o2","title":"Bagel","description":"Thick, tough exterior, soft interior. You are versatile but dense.","image":"anchor","colorClass":"bg-neo-blue"},
   {"id":"o3","title":"Croissant","description":"Flaky, messy, and expensive. You fall apart easily but look good doing it.","image":"sparkles","colorClass":"bg-neo-coral"},
   {"id":"o4","title":"White Bread","description":"Classic, reliable, maybe a bit boring. You get the job done.","image":"smile","colorClass":"bg-neo-paper"}
 ]$json$::jsonb,
 'CarbLoader', null, 'public', 0, now() - interval '8 days'),

(q_redflag,
 'The Red Flag Detector',
 'We all have one. Let''s find out what makes you un-dateable.',
 $json$[
   {"id":"q1","text":"They haven't texted back in 3 hours. You:","answers":[
     {"id":"a1","text":"Forget they exist.","outcomeId":"o1"},
     {"id":"a2","text":"Call the police.","outcomeId":"o2"},
     {"id":"a3","text":"Analyze the timestamp data.","outcomeId":"o3"},
     {"id":"a4","text":"Post a thirst trap.","outcomeId":"o4"}]},
   {"id":"q2","text":"First date idea?","answers":[
     {"id":"a1","text":"Something vague I can bail on.","outcomeId":"o1"},
     {"id":"a2","text":"Meeting my parents.","outcomeId":"o2"},
     {"id":"a3","text":"Escape room to test their IQ.","outcomeId":"o3"},
     {"id":"a4","text":"Watching me perform karaoke.","outcomeId":"o4"}]},
   {"id":"q3","text":"Why did your last relationship end?","answers":[
     {"id":"a1","text":"I stopped replying.","outcomeId":"o1"},
     {"id":"a2","text":"I loved too hard.","outcomeId":"o2"},
     {"id":"a3","text":"Scheduling conflicts.","outcomeId":"o3"},
     {"id":"a4","text":"They didn't appreciate my genius.","outcomeId":"o4"}]}
 ]$json$::jsonb,
 $json$[
   {"id":"o1","title":"The Ghost","description":"You avoid conflict by simply vanishing from existence. Spooky.","image":"ghost","colorClass":"bg-neo-black text-white"},
   {"id":"o2","title":"The Clinger","description":"You have sent 45 texts in the last hour. Put the phone down.","image":"heart","colorClass":"bg-neo-coral"},
   {"id":"o3","title":"The Project Manager","description":"You treat relationships like a job. Where is the spreadsheet?","image":"target","colorClass":"bg-neo-blue"},
   {"id":"o4","title":"The Main Character","description":"It is your world, we are just NPCs living in it.","image":"crown","colorClass":"bg-neo-lemon"}
 ]$json$::jsonb,
 'DatingPolice', null, 'public', 0, now() - interval '5 days'),

(q_cursed,
 'Which Cursed Object Are You?',
 'Forget spirit animals. We''re doing haunted items.',
 $json$[
   {"id":"q1","text":"What is your best quality?","answers":[
     {"id":"a1","text":"My smile.","outcomeId":"o1"},
     {"id":"a2","text":"My honesty.","outcomeId":"o2"},
     {"id":"a3","text":"I'm helpful.","outcomeId":"o3"},
     {"id":"a4","text":"I'm memorable.","outcomeId":"o4"}]},
   {"id":"q2","text":"How do you get revenge?","answers":[
     {"id":"a1","text":"Psychological warfare.","outcomeId":"o1"},
     {"id":"a2","text":"Showing them the truth.","outcomeId":"o2"},
     {"id":"a3","text":"Irony.","outcomeId":"o3"},
     {"id":"a4","text":"A phone call.","outcomeId":"o4"}]},
   {"id":"q3","text":"Where do you live?","answers":[
     {"id":"a1","text":"A nursery.","outcomeId":"o1"},
     {"id":"a2","text":"An antique shop.","outcomeId":"o2"},
     {"id":"a3","text":"A dusty box.","outcomeId":"o3"},
     {"id":"a4","text":"A well.","outcomeId":"o4"}]}
 ]$json$::jsonb,
 $json$[
   {"id":"o1","title":"Annabelle Doll","description":"You look innocent but you thrive on chaos. Do not open the glass case.","image":"smile","colorClass":"bg-neo-coral"},
   {"id":"o2","title":"Haunted Mirror","description":"You reflect people's insecurities back at them. Brutally honest.","image":"eye","colorClass":"bg-neo-periwinkle"},
   {"id":"o3","title":"Monkey's Paw","description":"You give people what they want, but in the worst way possible.","image":"key","colorClass":"bg-neo-mint"},
   {"id":"o4","title":"Video Tape from The Ring","description":"You are viral, toxic, and people only have 7 days to deal with you.","image":"skull","colorClass":"bg-neo-black text-white"}
 ]$json$::jsonb,
 'OccultWeekly', null, 'public', 0, now() - interval '3 days'),

(q_corporate,
 'What is Your Corporate Personality?',
 'Are you a circle-back or a deep-dive?',
 $json$[
   {"id":"q1","text":"The meeting could have been an email. You:","answers":[
     {"id":"a1","text":"Nod enthusiastically.","outcomeId":"o1"},
     {"id":"a2","text":"Turn off camera and mute.","outcomeId":"o2"},
     {"id":"a3","text":"Circle back to the action items.","outcomeId":"o3"},
     {"id":"a4","text":"Cry silently.","outcomeId":"o4"}]},
   {"id":"q2","text":"Your inbox is:","answers":[
     {"id":"a1","text":"Inbox Zero.","outcomeId":"o1"},
     {"id":"a2","text":"Unread (4,502).","outcomeId":"o2"},
     {"id":"a3","text":"Color coded labels.","outcomeId":"o3"},
     {"id":"a4","text":"A source of trauma.","outcomeId":"o4"}]},
   {"id":"q3","text":"Favorite office snack?","answers":[
     {"id":"a1","text":"Whatever the boss likes.","outcomeId":"o1"},
     {"id":"a2","text":"I eat lunch in my car.","outcomeId":"o2"},
     {"id":"a3","text":"Protein bar for optimization.","outcomeId":"o3"},
     {"id":"a4","text":"Stale donuts.","outcomeId":"o4"}]}
 ]$json$::jsonb,
 $json$[
   {"id":"o1","title":"The Sycophant","description":"You agree with everything. \"Great point!\" is your catchphrase.","image":"smile","colorClass":"bg-neo-blue"},
   {"id":"o2","title":"The Ghost Employee","description":"You are on payroll but nobody knows what you actually do.","image":"ghost","colorClass":"bg-neo-paper"},
   {"id":"o3","title":"The Buzzword King","description":"We need to leverage our synergy to drill down on the low hanging fruit.","image":"rocket","colorClass":"bg-neo-lemon"},
   {"id":"o4","title":"The Burnout","description":"You are hanging on by a thread and a dry shampoo.","image":"flame","colorClass":"bg-neo-coral"}
 ]$json$::jsonb,
 'LinkedInInfluencer', null, 'public', 0, now() - interval '1 day');


-- Result rows: anonymous plays distributed across outcomes per quiz.
perform pg_temp.seed_results(q_office,    180, 'o1');
perform pg_temp.seed_results(q_genz,      240, 'o4');
perform pg_temp.seed_results(q_bread,      95, 'o1');
perform pg_temp.seed_results(q_redflag,   310, 'o1');
perform pg_temp.seed_results(q_cursed,    140, 'o3');
perform pg_temp.seed_results(q_corporate, 205, 'o4');

-- Sync the cached `plays` count to the actual number of result rows.
update public."PopQuiz_Quizzes" q
   set plays = sub.cnt
  from (
    select quiz_id, count(*)::int as cnt
      from public."PopQuiz_Results"
     where quiz_id in (q_office, q_genz, q_bread, q_redflag, q_cursed, q_corporate)
     group by quiz_id
  ) sub
 where q.id = sub.quiz_id;

end
$do$;
