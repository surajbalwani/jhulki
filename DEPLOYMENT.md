# Deployment Notes — Jhulki Fork

This documents the Vercel configuration applied when forking `utsavpal/jhulki` to
`surajbalwani/jhulki` and deploying it. Written 2026-09-11.

## Repository

- Forked from `utsavpal/jhulki` → `surajbalwani/jhulki` (GitHub fork, public).
- Monorepo layout: `frontend/` (Angular 21) and `nextjs-backend/` (Next.js 15 + Prisma).

## Vercel Projects Created

Two separate Vercel projects were created against the same GitHub repo, each scoped
to a different root directory (Vercel monorepo pattern — one project cannot serve
both an Angular SPA and a Next.js API cleanly).

| Project | Root Directory | Production URL | Project ID |
|---|---|---|---|
| `jhulki-backend` | `nextjs-backend` | https://jhulki-backend-psi.vercel.app | `prj_NtZRG2wCJhqGgVwLh8qLk2QbO4AH` |
| `jhulki-frontend` | `frontend` | https://jhulki-frontend.vercel.app | `prj_F49WhbkxmjzTZ3xwl30M8VJbKEOE` |

Both projects live under the Vercel team `Suraj Balwani's projects`
(`team_naMObOXtAYcA0mH1mzdX4gPi`), auto-deploying from the `main` branch. Build
settings (build command, output directory, framework detection) were picked up
automatically from each directory's `vercel.json` / `angular.json` — no manual
overrides were needed there.

Note: `jhulki-backend.vercel.app` was already claimed (presumably by the original
author's own deployment), so Vercel assigned `jhulki-backend-psi.vercel.app`
instead. The frontend's hardcoded backend URL was updated to match (see below).

## Environment Variables

**No environment variables were set in either Vercel project.** This is deliberate,
not an oversight: the backend code does not actually read `DATABASE_URL` or
`JWT_SECRET` from the environment at runtime —

- `nextjs-backend/src/lib/prisma.ts` hardcodes a `VERIFIED_POOLER_URL` constant and
  force-overwrites `process.env.DATABASE_URL` with it before constructing the
  Prisma client.
- `nextjs-backend/src/lib/jwt.ts` falls back to a hardcoded literal
  (`'jhulki-luxury-secret-key-2026'`) when `process.env.JWT_SECRET` is unset.

Both of these were introduced by the original author (`utsavpal`) in a rapid
sequence of commits shortly before the fork (10 commits in ~12 minutes, all titled
`fix(prisma): ...`), evidently while debugging a Vercel/Supabase connection issue.
Setting Vercel project env vars would currently have **no effect** on the database
connection, since the code path ignores them.

## Resolved Issue: Database connection (was broken, now fixed)

`GET /api/products` and any Prisma-backed route (`/api/auth/login`, etc.)
originally returned:

```
500 { "error": "\nInvalid `prisma.product.findMany()` invocation:\n\nError querying the database: FATAL: (ENOTFOUND) tenant/user postgres.oejbnxhrxfrwppozaphg not found" }
```

Diagnosis: the Supabase project (`oejbnxhrxfrwppozaphg`) itself was alive — its
REST endpoint returned a normal 401 (missing API key), not a "project paused"
page. The failure was specific to the Postgres **connection pooler** region
hardcoded in `prisma.ts`: `aws-0-ap-south-1.pooler.supabase.com`. This is
inherited from the original repo (the last 10 commits before the fork were all
`fix(prisma): ...` attempts at this exact error, none of which worked).

**Fix**: Utsav confirmed the actual pooler connection string from his Supabase
dashboard (Project Settings → Database → Connection pooling) — the correct region
is `ap-northeast-2`, not `ap-south-1`. Updated `VERIFIED_POOLER_URL` in
`nextjs-backend/src/lib/prisma.ts` accordingly (commit `1caf2af`) and pushed to
`main`, which triggered an automatic redeploy.

**Verified working** post-fix: `GET https://jhulki-backend-psi.vercel.app/api/products`
returns 200 with real seeded product data (Jhulki's actual catalog). Signup/login
routes also route correctly (no more DB tenant errors).

## Frontend → Backend wiring

`frontend/src/app/services/auth.service.ts` hardcoded the production API base URL
to `https://jhulki-backend.vercel.app/api` (the original author's project name,
via `getApiUrl()`), which does not exist under this fork's Vercel account. Fixed
to point to `https://jhulki-backend-psi.vercel.app/api` and pushed to `main`
(commit `e24c1ec`), which triggered an automatic redeploy of the frontend project.
CORS is already permissive on the backend (`Access-Control-Allow-Origin: *` in
`nextjs-backend/vercel.json`), so no CORS changes were needed.

## Security note (unresolved, flagged to the user separately)

The repo's root `README.md` commits the live Supabase DB password and a JWT
secret in plaintext, and the code hardcodes the same values as a fallback. These
are already public (repo is public). Recommendation: Utsav should rotate the
Supabase database password and change `JWT_SECRET` to a real secret sourced from
an environment variable, not a source-controlled literal.

## Summary of what works right now

- ✅ Fork created, both apps deployed and reachable.
- ✅ Frontend serves correctly (200, Angular shell renders).
- ✅ Frontend now points at the correct backend URL for this fork.
- ✅ CORS allows cross-origin requests from frontend to backend.
- ✅ Database connection fixed (correct Supabase pooler region) — `/api/products`
  confirmed returning real data end-to-end.
