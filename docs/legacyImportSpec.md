# simple-rank legacy data import — Dokploy Supabase dump → local EF Core SQLite

Goal: make the redesigned app show REAL legacy data behind login, locally, without
touching anything on Dokploy.

## Context

- Source data (read-only!): `/home/apple/SimpleRankExports/` — pg_dump files from the
  old Supabase app, later restored to Dokploy-hosted Postgres. Work ONLY from these
  local files; you do not need (and must not use) the Dokploy API, Postgres at
  100.89.243.13, or any network DB. Never write to any Postgres.
- The new backend's EF Core model (authoritative: `backend/NewApp/Data/AppDbContext.cs`
  + `backend/NewApp/Models/*.cs`) uses different table/column names than the dump, so
  the backend cannot point at the old DB directly. Target: the local SQLite dev DB
  `backend/simpleRank.dev.db` (already created by the running backend; EF tables exist).

## Mapping (old → new)

| Source (local file) | Target table (EF/SQLite) | Column mapping |
|---|---|---|
| `Ranking_rows.sql` `INSERT INTO public."Ranking" (owner, ranking_id, ranking_name, ranking_desc, item_count, last_updated, is_public, is_shared, item_place, created_date, is_pinned, pinned_time)` | `Rankings` | Id←ranking_id, OwnerId←owner, Title←ranking_name, Description←ranking_desc (NULL→''), IsPublic←is_public, IsShared←is_shared, IsPinned←is_pinned, CreatedDate←created_date, LastUpdated←last_updated, PinnedTime←pinned_time (dump uses '0001-01-01...' for none → store NULL) |
| `RankItems_rows.sql` (id, ranking_id, item_name, item_description, "order") | `RankItems` | ItemId←id, RankingId←ranking_id, Name←item_name, Description←item_description (NULL→''), Rank←"order" |
| `SharedLinks_rows.sql` | `ShareableLinks` | SharedId← its id/shared id column, RankingId←ranking_id (inspect actual columns first) |
| `UserMetadata_rows.sql` | `UserMetadata` | UserId←user id column, DisplayName← name/full_name column, AvatarUrl← avatar column, LastUpdated← updated column (inspect actual columns first) |
| `users_rows.csv` (Supabase auth.users, 71 users + header) | `Users` | Id←id, Email←email (NULL→skip row), PasswordHash←encrypted_password verbatim (''→keep empty string), CreatedAt←created_at (inspect and use best equivalents; `raw_user_meta_data` JSON is NOT imported — metadata comes from UserMetadata file) |
| `Statistics_rows.sql`, `Stats_rows.sql`, `TotalRankings_rows.sql`, `ReactionHistory_rows.sql`, `Metadata_rows.sql`, `HeartBeat_rows.sql`, `DataEncryptionKeys_rows.sql` | — | Inspect columns; import ONLY if a clean lossless mapping to `StatisticEvents`/`ReactionHistory` exists, otherwise SKIP and record in deviations. These are the lowest priority — do not invent mappings. |

Rules:
- First inspect EVERY source file's actual INSERT column list (they may differ from the
  sketch above — trust the files over this spec) and the target schema via
  `sqlite3 backend/simpleRank.dev.db '.schema <table>'` (or PRAGMA table_info). Report
  any mapping you had to decide yourself in `deviations`.
- Parse pg_dump INSERT statements with your own parser (python3 stdlib only — no pip
  installs): handle multi-row VALUES, `''` string escapes, `E'...'` if present, NULL,
  booleans, numbers, timestamps, and quoted identifiers. Verify parse fidelity by
  asserting row counts and spot-checking 3 known rows against the source text.
- FK consistency: every Rankings.OwnerId should exist in Users — report orphans (import
  them anyway; do not fabricate users). Every RankItems.RankingId in Rankings, every
  ShareableLinks.RankingId in Rankings, every UserMetadata.UserId in Users — report.
- Idempotency: script must be safely re-runnable (skip/dedupe on PK conflict).
- Do NOT modify, delete, or rewrite any file in `/home/apple/SimpleRankExports/`.
- Do NOT touch the frontend (`src/`, `index.html`) — another worker owns those files.
- Do NOT run git commands. Do NOT touch `AGENTS.md`.
- Store the script at `/home/apple/SimpleRank/importLegacyData.py` (camelCase filename).

## Backend restart procedure (you must do this around the import)

SQLite is held open by the running backend, so:
1. Stop it: `pkill -f 'dotnet run'` (this ONLY matches the simple-rank backend; do not
   kill anything else — a Vite dev server and other workers must keep running).
2. Run the import: `python3 /home/apple/simpleRank/importLegacyData.py`
3. Restart: `cd /home/apple/simpleRank/simple-rank/backend && nohup /home/apple/.dotnet/dotnet run > /home/apple/.hermes/cache/scratch/simpleRankBackend.log 2>&1 &`
   — wait ~10s, then `curl -s -o /dev/null -w '%{http_code}' http://localhost:5033/health`
   expecting 200 (if the route differs, use `/swagger/index.html` or the log's
   "Now listening" line as the health signal).
   If nohup/background wrappers are rejected by your terminal tool, use whatever
   tracked-background mechanism it offers — the end state must be: backend listening
   on 5033 after your run.

## Verification (required before reporting)

1. Backend health OK on 5033 after restart.
2. Row counts: `sqlite3` counts for Users, Rankings, RankItems, ShareableLinks,
   UserMetadata vs source counts (INSERT tuple counts) — report both numbers side by
   side; they must match (minus explicitly-reported skips).
3. End-to-end auth+data probe WITHOUT using any real user's password: sign up a fresh
   throwaway account via `POST /api/Auth/SignUp` (base http://localhost:5033, inspect
   `backend/NewApp/Controllers/AuthController.cs` for exact payload), then confirm
   `POST /api/Auth/SignIn` returns a token, and (if an unauthenticated stats endpoint
   exists) that it now returns non-zero counts. The throwaway account is acceptable
   and expected — list its email in deviations.
4. Frontend still builds (another worker is editing `src/` concurrently — if
   `npm run build` fails ONLY in files under `src/`, report that verbatim in
   deviations as owned-by-other-worker instead of fixing it):
   `cd /home/apple/simpleRank/simple-rank && npm test` (run this at minimum).

## Final step

Report per output_schema: files_created, source-vs-target counts, mappings you decided,
deviations (exhaustive), verification results.