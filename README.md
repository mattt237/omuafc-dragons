# OMUAFC Dragons

Team app for the OMUAFC Dragons — Grade 7 youth football, Auckland NZ. Season 2025.

## Setup

### 1. Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once created, go to **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### 2. Run the SQL Migration

In your Supabase project, go to **SQL Editor** and run the two migration files in order:

1. `supabase/migrations/001_schema.sql` — creates all tables and policies
2. `supabase/migrations/002_seed.sql` — seeds players, matches, standings, and training

### 3. Anthropic API Key

Get an API key from [console.anthropic.com](https://console.anthropic.com) and add it as `VITE_ANTHROPIC_API_KEY`.

Note: The AI features call the Anthropic API directly from the browser. For production, consider proxying through a backend to keep your key secure.

### 4. Local Development

```bash
cp .env.example .env
# Fill in your values in .env

npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### 5. Admin Panel

Visit `/admin` — password is `dragons2025`.

### 6. Deploy to Vercel

1. Push to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Add your three environment variables in the Vercel project settings.
4. Deploy. Done.

## Team

- **Matt Thompson** — Co-Coach — 021 292 2022
- **Ben Thompson** — Co-Coach — 0274 567 551
- **Sharnie Warren** — Manager — 021 242 3375
