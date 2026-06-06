-- Players
insert into players (first_name, last_name, goals, player_of_day_count, goalie_count, active) values
  ('Charlie', 'Brant', 0, 0, 1, true),
  ('Finn', 'Hamilton', 3, 0, 1, true),
  ('Levi', 'Hill', 2, 0, 1, true),
  ('Kingston', 'Tafolo', 8, 0, 1, true),
  ('Jaiaan', 'Thompson', 3, 1, 0, true),
  ('Eddie', 'Warren', 8, 1, 1, true),
  ('Tristan', 'Folau', 0, 0, 1, true),
  ('James', 'Thompson', 0, 0, 1, true),
  ('Callum', 'Casse', 1, 1, 1, true),
  ('Noah', 'Nannepaga', 0, 1, 0, true);

-- Matches
insert into matches (date, round, opponent, home_away, result, our_score, their_score, scorers, goalie_1, goalie_2, player_of_day, coach_rostered, notes) values
  ('2025-05-02', 1, 'OM8 Jaguars', 'H', 'W', 6, 0,
   '[{"player":"Finn Hamilton","goals":1},{"player":"Levi Hill","goals":1},{"player":"Kingston Tafolo","goals":2},{"player":"Jaiaan Thompson","goals":1},{"player":"Eddie Warren","goals":1}]'::jsonb,
   'Tristan Folau', 'Eddie Warren', 'Jaiaan Thompson', 'Ben', null),

  ('2025-05-09', 2, null, null, 'BYE', null, null, '[]'::jsonb, null, null, null, null, 'Bye week'),

  ('2025-05-16', 3, 'OS8 Rhinos', 'H', 'L', 2, 5,
   '[{"player":"Kingston Tafolo","goals":1},{"player":"Eddie Warren","goals":1}]'::jsonb,
   'Kingston Tafolo', 'Levi Hill', 'Eddie Warren', null, 'Coaches away'),

  ('2025-05-23', 4, 'OS8 Gunners', 'H', 'A', 17, 0,
   '[{"player":"Finn Hamilton","goals":2},{"player":"Levi Hill","goals":1},{"player":"Kingston Tafolo","goals":5},{"player":"Jaiaan Thompson","goals":2},{"player":"Eddie Warren","goals":6},{"player":"Callum Casse","goals":1}]'::jsonb,
   'Charlie Brant', 'Finn Hamilton', 'Callum Casse', 'Ben', 'Match abandoned. Score recorded as 17-0 in sheet.'),

  ('2025-06-06', 6, 'OM8 Pumas', 'A', 'W', 8, 4,
   '[]'::jsonb,
   'Callum Casse', 'James Thompson', 'Noah Nannepaga', null, 'Individual scorers not recorded.');

-- Training sessions
insert into training_sessions (day_of_week, start_time, title, detail) values
  ('Wednesday', '5:00pm', 'Wednesday Training', 'OMUAFC Ground, Mangere. Please arrive in full kit with boots and a water bottle. Session details confirmed by coaches each week.'),
  ('Saturday', 'Match time varies', 'Match Day', 'Arrive 30 minutes before kickoff for warm-up. Check the Matches tab for your fixture details. Wear full kit and bring water.');

-- League standings (after Round 4 / Round 6)
insert into standings (team, played, won, drawn, lost, points, gf, ga) values
  ('OS Rhinos', 5, 4, 0, 1, 12, 0, 0),
  ('OM Red Devils', 5, 3, 0, 2, 9, 0, 0),
  ('OM Pumas', 5, 2, 0, 3, 6, 0, 0),
  ('OM Dragons', 5, 2, 0, 1, 6, 31, 9),
  ('OS Gunners', 5, 1, 1, 3, 4, 0, 0),
  ('OM Jaguars', 5, 1, 0, 4, 3, 0, 0),
  ('OM Lions', 5, 1, 0, 4, 3, 0, 0),
  ('OM Pink Tigers', 5, 0, 2, 3, 2, 0, 0),
  ('OM Football Ferns', 5, 0, 1, 4, 1, 0, 0);
