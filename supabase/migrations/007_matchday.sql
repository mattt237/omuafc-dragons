-- Add scorers column to matches (may already exist)
alter table matches add column if not exists scorers jsonb default '[]';

-- Add player_minutes column (may already exist from 006)
alter table matches add column if not exists player_minutes jsonb default '[]';

-- Add appearances tracking to players
alter table players add column if not exists appearances int default 0;

-- Add date and locked to fixture_results (created in 005 without these)
alter table fixture_results add column if not exists date date;
alter table fixture_results add column if not exists locked boolean default false;

-- Upsert non-Dragons fixture_results for rounds 6-9 with dates
-- Dragons results come from matches table directly (not here)
insert into fixture_results (round, home_team, away_team, date) values
  (6, 'OS Gunners',        'OM Pumas',           '2026-06-13'),
  (6, 'OM Lions',          'OM Football Ferns',   '2026-06-13'),
  (6, 'OM Jaguars',        'OM Red Devils',       '2026-06-13'),
  (7, 'OM Football Ferns', 'OS Gunners',          '2026-06-20'),
  (7, 'OM Pink Tigers',    'OM Jaguars',          '2026-06-20'),
  (7, 'OM Red Devils',     'OM Pumas',            '2026-06-20'),
  (8, 'OM Red Devils',     'OS Gunners',          '2026-06-27'),
  (8, 'OM Pink Tigers',    'OM Pumas',            '2026-06-27'),
  (8, 'OM Lions',          'OM Jaguars',          '2026-06-27'),
  (9, 'OM Pink Tigers',    'OM Lions',            '2026-07-04'),
  (9, 'OM Football Ferns', 'OM Pumas',            '2026-07-04'),
  (9, 'OS Gunners',        'OM Jaguars',          '2026-07-04')
on conflict (round, home_team, away_team) do update set date = excluded.date;
