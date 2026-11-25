# simple-rank single-project migration — ASP.NET Core + React/Vite/TypeScript

Repo: `/home/apple/simpleRank/simple-rank` (branch `migration`). Goal: collapse the
"two paths" (root React app + `backend/` ASP.NET project, two deployables) into ONE
project at the repo root: C# at root beside the React app, Vite builds into `wwwroot`,
one process serves SPA + API, one deploy artifact.

Decisions already made with the user (do not re-litigate):
- Architecture: ASP.NET Core serves the Vite React SPA (NOT a Blazor rewrite).
- TypeScript: FULL strict conversion of all 39 .jsx files, no `allowJs` bridge.

This spec covers **Slice A (restructure)** first. Later slices (strict TS conversion,
Dockerfile/deploy) get their own specs — do not do them now.

## Slice A — restructure to one project

### Target layout (repo root = single project)

```
simple-rank/                 <- repo root, ONE csproj lives here
  simple-rank-backend.csproj (keep filename for now; sln/tests reference it)
  Program.cs, Controllers/, NewApp/, Models/, DTOs/, ...   (everything from backend/)
  Properties/launchSettings.json                           (port 5033 preserved)
  SimpleRank.Tests/
  simpleRank.sln            (paths updated to root + SimpleRank.Tests/)
  package.json, vite.config.js, index.html, src/, public/  (frontend: DOES NOT MOVE)
  wwwroot/                  (vite build output — gitignored)
  AGENTS.md                 (commands section MUST be updated to match reality)
```

Move the C# project contents from `backend/` to the repo root (`git mv`), merging
`backend/.gitignore` rules into the root `.gitignore` (root already has bin/, *.db;
add obj/, .vs/, *.db-wal, *.db-shm, *.db-journal, wwwroot/ if missing — check first,
don't duplicate).

### Non-negotiable gotchas (each was a real failure mode here)

1. **SQLite data must survive.** EF uses relative `Data Source=simpleRank.dev.db`,
   so the content root moving from `backend/` to root would silently create a NEW
   empty DB and lose the imported legacy data + the user's login. Move the files:
   `git mv` is not applicable (gitignored) — plain `mv simpleRank.dev.db* <root>/`
   BEFORE the first `dotnet run` from the new location. Verify row counts after:
   Users=75, Rankings=43, RankItems=187.
2. **Vite watch ignore must follow the folder away.** `vite.config.js` currently
   ignores `**/backend/**` (added because WAL churn caused a full-reload loop —
   do NOT regress this). After the move the DB sits at repo root, so change the
   watch ignore to target the files instead: `['**/node_modules/**','**/dist/**',
   '**/wwwroot/**','**/*.db','**/*.db-wal','**/*.db-shm','**/*.db-journal','**/obj/**','**/bin/**']`.
   A file-change inside a DB file must produce ZERO `page reload` log lines.
3. **Dev flow stays two processes (that's dev tooling, not a deploy path).**
   `npm run dev` = concurrently `dotnet` + vite. Update the `server` script
   (`cd backend && ...` no longer exists) to run dotnet at the root. The vite
   `/api` proxy target stays `http://localhost:5033`.
4. **Ports/env unchanged:** backend http://localhost:5033 (launchSettings moved
   along), vite 5173, `VITE_API_BASE_URL` stays empty (relative — never reintroduce
   an absolute localhost URL; remote browsers would break again).

### Program.cs — production serving (the point of the migration)

- Keep existing MapControllers/CORS/auth wiring untouched (dev CORS for the vite
  origin stays; it is harmless in prod).
- Add: `app.UseDefaultFiles()` + `app.UseStaticFiles()` serving `wwwroot`
  (only meaningful when wwwroot exists; guard so a bare `dotnet run` without a
  frontend build doesn't crash — e.g. condition on Directory.Exists or
  UseStaticFiles with FileProvider — your call, note it in deviations).
- Add SPA fallback: `app.MapFallbackToFile(...)` (or explicit endpoint) so
  client routes (`/Home`, `/Login`, `/ranking/:id`, `/share/:id`) serve
  `index.html`, but requests under `/api/` that match no controller must return
  404 JSON, NOT index.html. Register controller endpoints before the fallback.
- No `AddSpaStaticFiles` magic needed for prod; dev continues via the vite proxy
  as today. Do NOT add a SpaProxy package unless you actually wire it.
- Do not change auth/JWT/EF service registration.

### vite.config.js

- Add/confirm `build.outDir: 'wwwroot'` (replaces `dist`).
- Keep PWA plugin, proxy, terser/drop_console behavior.
- Apply gotcha #2 (watch ignore).
- `wwwroot` added to .gitignore.

### package.json

- `build` stays `vite build` (now outputs wwwroot).
- `server` script fixed per gotcha #3.
- `dev` keeps concurrently; order: backend first or parallel is fine.
- `test` unchanged. Do not add or remove dependencies in this slice.

### AGENTS.md

Commands section must reflect the new reality (this is explicitly allowed and
required in this slice): backend build/test/run from repo root with
`~/.dotnet/dotnet`, `npm run build` → wwwroot, dev = `npm run dev`, single
process prod = `dotnet run` after `npm run build`. Keep the git rules
(migration branch, never push main, no deploy/DNS) verbatim.

### Solution/tests

- `simpleRank.sln`: update the backend project path (now root-level) and keep
  `SimpleRank.Tests` (its ProjectReference to `../simple-rank-backend.csproj` or
  similar must be corrected — open the test csproj and fix relative paths).
- Old `backend/` directory must end up fully gone (empty dir removed).

## Verification (all must pass; first three proven green on this box already)

```bash
cd /home/apple/simpleRank/simple-rank
~/.dotnet/dotnet build                 # exit 0
~/.dotnet/dotnet test simpleRank.sln   # exit 0 (xUnit suite green)
npm run build                          # exit 0, emits wwwroot/index.html
npm test                               # exit 0 (vitest 2 files / 4 tests)
```

Plus a live single-process check YOU must run yourself:
1. `mv` the db files first (gotcha #1).
2. Start `npm run build` then `~/.dotnet/dotnet run` on a scratch log
   (tracked background, port 5033; if 5033 is busy with the existing dev
   backend, note it and instead run with `ASPNETCORE_URLS=http://localhost:5034`
   for your probe, then STOP the process you started).
3. `GET http://localhost:<port>/` → 200 with the SPA html (title "simple rank").
   `GET .../Home` → 200 index.html (SPA fallback). `GET .../api/Statistic/GetRankingsCount`
   → 200 JSON with `totalCount` 43. `GET .../api/bogus-nopath` must NOT return index.html.
4. Row counts Users=75 / Rankings=43 unchanged.
5. Stop any process you started; leave pre-existing dev servers alone.

## Hard constraints

- Branch `migration`, NO git push, NO deploy, NO DNS, NO Dokploy API calls.
- No new npm or NuGet dependencies in this slice.
- Styling/design untouched: do not edit anything under `src/` except NONE — the
  frontend does not move or change in Slice A (vite.config.js and package.json are
  the only frontend files you may touch, plus AGENTS.md, .gitignore).
- `backend/` must no longer exist afterward.
- Keep API route contract identical (`api/[controller]/[action]` untouched).

## Final step (required)

Re-run ALL four verification commands + the live probe, enumerate changed files
(`git status --porcelain` is legitimate READ-ONLY git usage for this report; no
commits), re-read this spec, report per output_schema: files moved/modified,
verification outputs, db row counts before/after, exhaustive deviations.