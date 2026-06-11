-- Fix match years from 2025 to 2026
update matches set date = '2026-05-02' where round = 1;
update matches set date = '2026-05-09' where round = 2;
update matches set date = '2026-05-16' where round = 3;
update matches set date = '2026-05-23' where round = 4;

-- Fix Game 1: was HOME vs OM8 Jaguars → AWAY vs OM Jaguars, add venue
update matches set
  opponent = 'OM Jaguars',
  home_away = 'A',
  venue = 'Mangere Mountain 1C',
  kickoff_time = '9:15am'
where round = 1;

-- Fix Game 2: BYE week
update matches set
  opponent = 'BYE',
  home_away = null,
  result = 'BYE',
  venue = null,
  kickoff_time = null,
  notes = null
where round = 2;

-- Fix Game 3: add venue
update matches set
  venue = 'Mangere Mountain 1C',
  kickoff_time = '9:15am'
where round = 3;

-- Fix Game 4: fix result to W, add venue
update matches set
  result = 'W',
  venue = 'Mangere Mountain 1C',
  kickoff_time = '9:15am'
where round = 4;

-- Fix Game 5 (was round 6, Pumas): renumber to 5, add venue
update matches set
  round = 5,
  venue = 'Mangere Mountain 1B',
  kickoff_time = '8:30am'
where round = 6 and result is not null;

-- Fix upcoming fixtures (renumber + correct dates)
-- round 7 → round 6, date Jun 13
update matches set round = 6, date = '2026-06-13', kickoff_time = '9:15am'
where round = 7;

-- round 8 → round 7, date Jun 20
update matches set round = 7, date = '2026-06-20'
where round = 8;

-- round 9 → round 8, date Jun 27
update matches set round = 8, date = '2026-06-27'
where round = 9;

-- round 10 → round 9, date Jul 4
update matches set round = 9, date = '2026-07-04', home_away = 'H', opponent = 'OM Red Devils'
where round = 10;
