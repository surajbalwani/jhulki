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
connection, since the code path ignores them. This is flagged as a known issue
below rather than silently worked around.

## Known Issue: Database connection is broken

`GET /api/products` on the deployed backend currently returns:

```
500 { "error": "\nInvalid `prisma.product.findMany()` invocation:\n\nError querying the database: FATAL: (ENOTFOUND) tenant/user postgres.oejbnxhrxfrwppozaphg not found" }
```

Diagnosis:
- The Supabase project (`oejbnxhrxfrwppozaphg`) itself is alive — its REST endpoint
  (`https://oejbnxhrxfrwppozaphg.supabase.co/rest/v1/`) returns a normal 401
  (missing API key), not a "project paused" page.
- The failure is specific to the Postgres **connection pooler** hostname hardcoded
  in `prisma.ts`: `aws-0-ap-south-1.pooler.supabase.com`. "Tenant or user not
  found" from Supabase's pooler is almost always caused by hitting the **wrong
  region's pooler** for that project ref.
- This is inherited from the original repo, not introduced by this fork — the
  original author's own deployment is presumably hitting the same error, which
  explains the failed troubleshooting commit spree.

**This blocks real functionality**: signup/login/products/cart/orders all touch
the database, so they will 500 until this is fixed. Static pages and routing work
fine.

**Fix requires access to the Supabase project itself** (to read the actual region
under Project Settings → Database → Connection pooling) — something only Utsav
can check, since it's his Supabase account. Once the correct pooler region (or a
regenerated connection string) is known, update `VERIFIED_POOLER_URL` in
`nextjs-backend/src/lib/prisma.ts` and push — both Vercel projects redeploy
automatically on push to `main`.

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
- ❌ Any endpoint touching the database 500s due to a broken Supabase pooler
  connection string inherited from upstream — needs Utsav to confirm the
  correct region/connection string from his Supabase dashboard.
