# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

**Nibble** — a baby feed tracker. Next.js 15 (App Router) + TypeScript, deployed on Vercel from
the GitHub repo `adupontjr/feed-tracker`.

## Conventions

- App Router under `app/`. Server components by default; mark client components with `"use client"`.
- API handlers live in `app/api/<resource>/route.ts` and export `GET`/`POST`/etc.
- Shared types in `lib/types.ts`. Path alias `@/*` maps to the project root.
- Keep secrets in `.env.local` (gitignored); reference via `process.env`. Mirror keys in `.env.example`.

## Data / persistence

- `app/api/feeds/route.ts` uses an in-memory array as a placeholder — **not persistent** on
  serverless. Replace with a real DB (Vercel Postgres / Neon / Supabase / Vercel KV) before relying
  on stored data. Use `DATABASE_URL` from env.

## Deploy

- Vercel auto-detects Next.js; pushes to `main` deploy to production, PRs get preview URLs.
- Don't commit `.env`, `.vercel`, or `node_modules` (see `.gitignore`).
