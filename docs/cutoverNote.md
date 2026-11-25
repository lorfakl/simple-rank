> **Superseded for deployment:** the "deploy frontend + deploy backend" two-host steps below are replaced by the one-service flow in `deployNote.md` (same directory) — this note stays as history (rollback/DNS sections still apply).

# simple-rank cutover note

Date: 2026-10-29

## Environment variables and config

Frontend (`simple-rank/.env.*`)
- `VITE_API_BASE_URL`
  - local dev: `http://localhost:5033`
  - production: set to deployed API URL

Backend (`simple-rank/backend/appsettings*.json` or env overrides)
- `DatabaseProvider`
  - `Sqlite` (default local)
  - `Postgres` (hosting/prod)
- `ConnectionStrings__DefaultConnection`
  - SQLite example: `Data Source=simpleRank.dev.db`
  - Postgres example: `Host=...;Port=5432;Database=...;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Jwt__Key` (must be strong and private in production)

## Hosting options (free-tier practical)

Backend API (ASP.NET Core)
- Render (free web service tier)
- Fly.io
- Railway

Frontend (Vite static)
- Cloudflare Pages (good fit)
- Render static site also works

SQLite note
- SQLite is suitable for local/dev and small single-instance setups.
- For production and horizontal scaling, use Postgres and set `DatabaseProvider=Postgres`.

## DNS and domain (human decision required)

- `simplerank.app` is on GoDaddy and currently parked.
- Renewal/payment/repoint is a human money/ownership decision and was NOT changed.
- No deploy, no DNS update, no registrar change was performed in this migration.

## Exact flip-over steps (no live action taken here)

1) Prepare production secrets/config
- Choose backend host.
- Set backend env:
  - `DatabaseProvider=Postgres`
  - `ConnectionStrings__DefaultConnection=<managed postgres connection string>`
  - `Jwt__Issuer`, `Jwt__Audience`, `Jwt__Key`

2) Deploy backend
- Build/deploy `simple-rank/backend` as ASP.NET Core app.
- Confirm health endpoint: `GET /health` returns `{ "status": "healthy" }`.
- Smoke-test auth and ranking routes via host URL.

3) Deploy frontend
- Build/deploy `simple-rank` static app.
- Set `VITE_API_BASE_URL` to deployed backend URL.
- Verify login/signup and ranking CRUD in deployed frontend.

4) DNS cutover (human-owned)
- In GoDaddy DNS for `simplerank.app`:
  - Point apex/www to frontend host target (per host instructions).
  - If using dedicated API subdomain, add `api` record to backend host target.
- Wait for propagation.

5) Post-cutover checks
- Open `https://simplerank.app` and verify landing loads.
- Create account, create ranking, edit, reorder, share link, delete.
- Confirm stats counters and auth-protected routes behave as expected.

6) Rollback plan
- If new stack fails, revert DNS records to previous known-good target (or parking as fallback).
- Revert frontend env to previous API base URL if needed.
- Keep DB snapshot/backups at host before major schema/config updates.
