create table if not exists fixture_results (
  id uuid default gen_random_uuid() primary key,
  round int not null,
  home_team text not null,
  away_team text not null,
  home_score int,
  away_score int,
  date date,
  locked bool default false,
  created_at timestamptz default now(),
  unique(round, home_team, away_team)
);

alter table fixture_results enable row level security;

create policy "Public read fixture_results"
  on fixture_results for select using (true);

create policy "Public insert fixture_results"
  on fixture_results for insert with check (true);

create policy "Public update fixture_results"
  on fixture_results for update using (true);

create policy "Public delete fixture_results"
  on fixture_results for delete using (true);
