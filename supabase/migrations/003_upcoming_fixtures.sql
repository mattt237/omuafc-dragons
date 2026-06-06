-- Add venue and kickoff_time columns to matches
alter table matches add column if not exists venue text;
alter table matches add column if not exists kickoff_time text;

-- Insert upcoming fixtures (result = NULL = upcoming)
insert into matches (date, round, opponent, home_away, result, venue, kickoff_time, scorers, notes) values
  ('2026-05-30', 7,  'OM Pink Tigers',    'A', null, 'Mangere Mountain 1D', '9:15am',  '[]', 'Kings Birthday Weekend'),
  ('2026-06-06', 8,  'OM Lions',          'A', null, 'Mangere Mountain 1C', '8:30am',  '[]', 'Kings Birthday Weekend'),
  ('2026-06-13', 9,  'OM Football Ferns', 'A', null, 'Mangere Mountain 1D', '8:30am',  '[]', null),
  ('2026-06-20', 10, 'OM Red Devils',     'H', null, 'Mangere Mountain 1D', '8:30am',  '[]', null);
