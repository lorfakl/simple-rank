# Simple Rank — inventory (step 1 of card t_3bd80b5a)

Date: 2026-10-28. Sources: live probes of the deployed endpoints + full read of
`github.com/lorfakl/simple-rank` (cloned to `~/simpleRank/simple-rank`).

## Current state — verified live

| Thing | Status | Evidence |
|---|---|---|
| `simplerank.app` | **DEAD — GoDaddy parking lander** | `/` returns a 114-byte JS redirect to `/lander`; `/lander` is GoDaddy parking (`window.LANDER_SYSTEM="PW"`, `_trfd.push({ap:"parking"})`, `img1.wsimg.com/signing/parking-lander`). NS = `ns27/ns28.domaincontrol.com` |
| `simplerank.io` | same parking lander | identical 114-byte redirect body |
| Backend `simple-rank-backend-komz4.kinsta.app` | **DEAD** | 502 Bad Gateway on `/`, then connection timeouts on 6 retries over 2 min |
| Frontend host | **not found** | no GH Pages / vercel / netlify / pages.dev deployment responds |
| `lorfakl/simple-rank-backend` (private) | **inaccessible to the agent** | gh token is fine-grained PAT without `Contents` → 403 `Resource not accessible by personal access token`; no SSH key on this machine |

The resume/cover letters point recruiters at `simplerank.app` — today that link
shows a domain-parking page. That is the actual damage.

## Architecture (from the frontend source)

Frontend: React 19 + Vite 6 + Tailwind 4 + daisyUI, react-router 7, axios,
`@hello-pangea/dnd`, `vite-plugin-pwa` (it's a PWA), no TypeScript.
3,866 lines of JSX across `src/pages`, `src/components`, `src/contexts`, `src/api`.

### What Supabase is actually used for: AUTH ONLY

`src/contexts/SupabaseContext.jsx` creates the client from `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY`. Every call in the codebase is `supabase.auth.*`:

- `getSession()` / `onAuthStateChange` (UserContext)
- `signInWithPassword`, `signUp`, `signInWithOAuth` (Google + Discord), `signOut`

There are **zero** `supabase.from()`, `.rpc()`, `.insert()`, storage or realtime
calls anywhere. The `//*Supabase Operations*//` comments in CreateRank /
ViewRanking / SharedRank are **stale lies** — those functions call the C# API.

**Therefore "migrate off Supabase" = replace auth, not data.** Ranking data never
lived in Supabase; it lived in Postgres behind the .NET API.

### What the C# API owns (the real contract, `src/api/services.jsx`)

- `Rank`: CreateRanking, EditRanking/{id}, DeleteRanking/{id},
  GetUserRankings/{user_id}, GetRanking/{id}, GetPublicRankings,
  GetRankingByName (search), GetShareableLink/{id}, GetRankingMetadata/{id},
  PinRanking/{rankingId}, CreateRankItem, EditRankItem/{id}, DeleteRankItem,
  UpdateRankItemsPlacement/{rankingId}, GetSharedRanking/{sharedId},
  CloneSharedRanking/{sharedId}
- `Statistic`: RecordView/{id}, React/{id}, Get/{id}, GetShared/{id},
  GetUserCount, GetRankingsCount  ← the landing page's "40 rankings / 51 tyrants"
- `user`: `/api/users/{id}` CRUD, `POST /api/user/SetUserMetadata`

Auth to the API: `Authorization: Bearer <token>` from `localStorage.auth_token`
plus `withCredentials` (`src/api/client.jsx`).

### Repo shape

`simple-rank/.gitmodules` already declares `path = backend` →
`simple-rank-backend.git`, but the gitlink was never populated (empty dir).
So the "one repo" half of the goal is scaffolded already — it needs the backend
subtree dropped in and the submodule removed.

`.env.production` → `VITE_API_BASE_URL=https://simple-rank-backend-komz4.kinsta.app`
`.env.development` → `http://localhost:5033`
Neither env file contains the Supabase keys — those live only on the old host.

## Toolchain now on this machine

- `~/.dotnet` — .NET SDK 8.0.427 (installed 2026-10-28, not on PATH by default)
- node v26.7.0 / npm 12.0.2; `npm install` done in `~/simpleRank/simple-rank`
  (esbuild + @swc/core postinstall scripts are blocked by npm allowlist — run
  `npm install-scripts approve esbuild @swc/core` before `npm run build`)

## Blockers that need a human

1. **GitHub `Contents` permission** on the fine-grained PAT
   (`github.com/settings/personal-access-tokens`) → lets the agent clone
   `simple-rank-backend`. Until then the backend must be rebuilt from the
   contract above instead of restored.
2. **GoDaddy**: is `simplerank.app` expired or just parked? Renewal/repoint is
   money → Class A decision.
3. **Backend host**: Kinsta site is gone; needs a new host (free tier options:
   Render / Fly.io / Railway, or Cloudflare-adjacent for the static frontend).

## Backend (step 1b)

Date: 2026-10-29. Source: full read of `~/simpleRank/simple-rank-backend`.

### Data model currently implemented (`TableModels/`)

- `Ranking` (`Ranking` table): `ranking_id` PK, `owner`, `ranking_name`,
  `ranking_desc`, `item_count`, `last_updated`, `created_date`, `pinned_time`,
  `is_public`, `is_shared`, `is_pinned`, `item_place` (dictionary), plus refs
  to `RankItems` and `SharedLinks`.
- `RankingItems` (`RankItems`): `id` PK, `ranking_id` FK, `item_name`,
  `item_description`, `order` (rank).
- `UserMetadata` (`UserMetadata`): `user_id`, `display_name`, `avatar_url`,
  optional `data_encryption_key`.
- `ShareableLink` (`SharedLinks`): `shared_id` PK, `ranking_id` FK.
- `Stats` (`Stats`): event-style rows for reactions/views (`name`, `value`,
  `ranking_id`, `user_id`).
- `Statistics` (`Statistics`): aggregate/stat snapshot row with columns like
  `views`, `clones`, `*_reactions`, `last_update`.
- `ReactionHistory` (`ReactionHistory`): anti-abuse/ip record for reactions.
- `TotalRankings` (`TotalRankings`): append-only rows used for total count.
- `Heartbeat` (`HeartBeat`): periodic heartbeat writes.
- `DataEncryptionKey` (`DataEncryptionKeys`): per-user DEK metadata.

### DB/ORM layer as implemented today

- The backend does **not** use EF Core. It uses the Supabase C# client
  (`Supabase.Postgrest`) as the data access layer against Postgres.
- Reads/writes are performed through `_supabase.From<TableModel>()` and
  `.Insert/.Update/.Delete/.Upsert/.Count/.Rpc` calls inside services.
- There is no `DbContext`, no migrations, and no local SQLite path in the
  current codebase.

### Auth as implemented today

- API auth is JWT bearer validation configured in `Program.cs`.
- Token validation currently expects Supabase-issued tokens:
  - signing key = `SupabaseJwt` secret
  - issuer = `${SupabaseUrl}/auth/v1`
  - audience = `authenticated`
- Controllers rely on `ClaimTypes.NameIdentifier` for owner checks.
- There are no first-party API signup/login endpoints in the current backend;
  frontend auth is done via Supabase Auth client, then its bearer token is sent
  to this API.

### Runtime dependencies / coupling in current backend

- Hard dependency on env secrets (`SecretManager.LoadEnvironmentVariables`) for
  Supabase, Azure Key Vault, Sentry, API URL.
- Registers Supabase client and a `SupabaseBackgroundService` heartbeat writer.
- CORS allowlist includes localhost + historical simpleRank domains.

### Inventory blocker status update (stale section corrected)

- The old blocker "backend repo inaccessible" is no longer true.
- `simple-rank-backend` is now available and cloned locally at
  `~/simpleRank/simple-rank-backend`; migration can proceed from real source
  instead of contract-only reconstruction.