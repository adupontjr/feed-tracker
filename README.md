# 🍼 Nibble

A simple baby **feed tracker** — log breast/bottle/formula/solids feeds and see recent history.
Built with **Next.js (App Router) + TypeScript**, ready to deploy on **Vercel**.

Repo: <https://github.com/adupontjr/feed-tracker>

## Stack

- Next.js 15 (App Router, React 18, TypeScript)
- API routes under `app/api/*` (serverless functions on Vercel)
- Zero-config Vercel deploy (framework auto-detected)

## Project structure

```
feed-tracker/
├── app/
│   ├── api/
│   │   └── feeds/route.ts   # GET (list) + POST (create) feed logs
│   ├── globals.css
│   ├── layout.tsx           # root layout + metadata
│   └── page.tsx             # home page
├── components/
│   └── FeedForm.tsx         # client component: add + list feeds
├── lib/
│   └── types.ts             # Feed data model
├── .env.example
├── next.config.mjs
├── package.json
└── tsconfig.json
```

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

## Deploy to Vercel (via GitHub)

1. Push this folder to the repo:
   ```bash
   git push -u origin main
   ```
2. Go to <https://vercel.com/new>, **Import** the `adupontjr/feed-tracker` repo.
3. Vercel auto-detects Next.js — no build settings needed. Click **Deploy**.
4. Add any env vars (see `.env.example`) under Project → Settings → Environment Variables.

Every push to `main` then auto-deploys to production; PRs get preview URLs.

## Important: persistence

The `app/api/feeds` route currently uses an **in-memory array** so the app runs end-to-end.
Serverless functions are stateless on Vercel — **data won't persist** between requests or deploys.
Before real use, swap it for a database, e.g.:

- **Vercel Postgres** / **Neon** (SQL)
- **Supabase** (Postgres + auth)
- **Vercel KV** (Redis) for simple key/value

Set `DATABASE_URL` in `.env.local` (and in Vercel env vars) when you wire one up.
