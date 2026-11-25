# simple-rank migration brief (kanban card t_3bd80b5a)

You are executing a migration mission. Work autonomously through the deliverables
below. Do not stop for confirmation except where a deliverable explicitly says so.

## Context — read these first
- `~/simpleRank/Inventory.md` — step 1 inventory (already done). NOTE: its
  "Blockers" section is partially stale — the backend repo is NOW PUBLIC and
  cloned to `~/simpleRank/simple-rank-backend`. Update the inventory as you go.
- `~/simpleRank/simple-rank/` — React frontend (React 19 + Vite 6 + Tailwind 4,
  daisyUI, react-router 7, PWA, no TypeScript). `src/api/services.jsx` is the
  authoritative C# API contract.
- `~/simpleRank/simple-rank-backend/` — the C# ASP.NET Core backend (Controllers,
  DTOs, Models, TableModels). Ranking data lives in Postgres behind this API.
  Supabase was used for AUTH ONLY (zero data/storage/realtime calls).

## Goal
One repo: the existing React frontend + the C# backend merged in at
`~/simpleRank/simple-rank/backend/` (the `.gitmodules` gitlink path is already
declared — drop the real code in and remove the submodule declaration). Stack:
ASP.NET Core + EF Core + SQLite for local dev (keep Postgres-ready via config),
existing React front end unchanged except the auth swap.

## Deliverables, in order
1. **Backend inventory update**: read the backend source; document data models
   (TableModels/), the EF/DB setup, and auth as implemented. Append a
   "Backend (step 1b)" section to `~/simpleRank/Inventory.md`.
2. **Target proposal** at `~/simpleRank/migrationPlan.md`: name the replacement
   for each Supabase feature (auth → the C# API's JWT auth matching the frontend
   contract in `src/api/client.jsx` + `SupabaseContext.jsx` call sites), the
   merged repo layout, and the slice-by-slice implementation order.
3. **Implement in slices** behind a local dev setup. Verify by running end to end
   (API serving, frontend talking to it, auth flow working, ranking CRUD working).
   Toolchain: .NET SDK 8.0.427 at `~/.dotnet` (NOT on PATH — export
   `PATH=$PATH:~/.dotnet` or use the full path); node v26.7.0 / npm 12.0.2;
   run `npm install-scripts approve esbuild @swc/core` in the frontend dir before
   `npm run build`. The old Supabase keys are GONE (they lived on the dead host) —
   the auth replacement must not depend on them.
4. **Cutover note** at `~/simpleRank/cutoverNote.md`: env vars, hosting options
   (free tier: Render / Fly.io / Railway; frontend could go Cloudflare Pages),
   DNS steps (simplerank.app is on GoDaddy and currently parked — renewal/repoint
   is a human money decision, list it as such), and exact flip-over steps.
   **Do NOT touch any live deployment. No deploys, no DNS changes.**

## Constraints
- File/dir naming: camelCase, no spaces (e.g. `migrationPlan.md`).
- Git: work on a `migration` branch in the merged repo. Commit per slice with
  clear messages. Push the branch to GitHub is fine; NEVER push to main and
  never deploy.
- Report at the end: slices completed, what is verified running locally, what
  remains.
