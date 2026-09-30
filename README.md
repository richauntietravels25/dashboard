# Daily board

Next.js 14 (App Router) + Neon Postgres. Tasks with priority/due dates, and a 7-day habit tracker.
Tables are created automatically on first load.

## Deploy
1. Push this folder to a GitHub repo and import it in Vercel.
2. Add a Neon database: Vercel > Storage > Neon (sets `DATABASE_URL`), or paste a connection string from neon.tech.
3. Add env vars: `DASHBOARD_PASSWORD` (required; the site is locked behind it, any username works) and optionally `APP_TIMEZONE` (default `America/New_York`).
4. Deploy.

## Local
```
npm install
cp .env.example .env.local   # fill in values
npm run dev
```
live love laugh
