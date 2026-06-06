-- Players
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  goals integer not null default 0,
  player_of_day_count integer not null default 0,
  goalie_count integer not null default 0,
  active boolean not null default true,
  notes text,
  created_at timestamptz default now()
);

-- Matches
create table if not exists matches (
  id uuid primary key default gen_random_uuid(),
  date date,
  round integer,
  opponent text,
  home_away text check (home_away in ('H', 'A')),
  result text check (result in ('W', 'L', 'D', 'X', 'A', 'BYE')),
  our_score integer,
  their_score integer,
  scorers jsonb default '[]'::jsonb,
  goalie_1 text,
  goalie_2 text,
  player_of_day text,
  coach_rostered text,
  notes text,
  created_at timestamptz default now()
);

-- Training sessions
create table if not exists training_sessions (
  id uuid primary key default gen_random_uuid(),
  day_of_week text not null,
  start_time text,
  title text not null,
  detail text,
  created_at timestamptz default now()
);

-- News
create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  tag text default 'Announcement',
  created_at timestamptz default now()
);

-- Standings
create table if not exists standings (
  id uuid primary key default gen_random_uuid(),
  team text not null,
  played integer not null default 0,
  won integer not null default 0,
  drawn integer not null default 0,
  lost integer not null default 0,
  points integer not null default 0,
  gf integer not null default 0,
  ga integer not null default 0
);

-- Settings
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value text
);

-- Enable RLS but allow all for anon (public app)
alter table players enable row level security;
alter table matches enable row level security;
alter table training_sessions enable row level security;
alter table news enable row level security;
alter table standings enable row level security;
alter table settings enable row level security;

create policy "Public read players" on players for select using (true);
create policy "Public write players" on players for all using (true);
create policy "Public read matches" on matches for select using (true);
create policy "Public write matches" on matches for all using (true);
create policy "Public read training" on training_sessions for select using (true);
create policy "Public write training" on training_sessions for all using (true);
create policy "Public read news" on news for select using (true);
create policy "Public write news" on news for all using (true);
create policy "Public read standings" on standings for select using (true);
create policy "Public write standings" on standings for all using (true);
create policy "Public read settings" on settings for select using (true);
create policy "Public write settings" on settings for all using (true);
