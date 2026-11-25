# simple-rank deploy note — ONE service, ONE image (authoritative)

> **This doc supersedes `cutoverNote.md`'s "deploy frontend + deploy backend"
> two-host steps.** That flow (separate static-host + API-host) is obsolete: the
> repo now builds a single Docker image that contains both the Vite SPA
> (`wwwroot/`) and the ASP.NET Core API, and it runs as a single Dokploy
> service. `cutoverNote.md` stays as history — its rollback plan and DNS
> sections remain the reference there and are not duplicated here.

## What gets deployed

- **One Dokploy service**, built from the **repo-root `Dockerfile`** (build
  context = repo root, no build arguments required). No second static host, no
  Cloudflare Pages, no separate API deployment.
- Multi-stage build: `node:20-alpine` (`npm ci` + `npm run build` →
  `wwwroot/`) → `mcr.microsoft.com/dotnet/sdk:8.0` (`dotnet publish -c
  Release`) → `mcr.microsoft.com/dotnet/aspnet:8.0` runtime.
- The runtime image serves the SPA **and** `/api` from one process:
  `dotnet simple-rank-backend.dll`, `ASPNETCORE_URLS=http://+:8080`,
  `EXPOSE 8080`, running as the built-in non-root `app` user.
- `.dockerignore` keeps `.git`, `node_modules`, `bin`/`obj`, `dist`,
  `wwwroot`, `*.db*` (incl. WAL/SHM/journal), `*.log`, `logs/` and `.env*`
  out of the build context.

## Environment variables (set these in Dokploy)

| Name | Purpose | Notes |
|------|---------|-------|
| `DatabaseProvider` | `Sqlite` (default) or `Postgres` | Production → `Postgres` |
| `ConnectionStrings__DefaultConnection` | DB connection | Postgres example: `Host=...;Port=5432;Database=...;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true` |
| `Jwt__Issuer` | JWT issuer | Required in production |
| `Jwt__Audience` | JWT audience | Required in production |
| `Jwt__Key` | JWT signing key | Must be strong and private (≥ 32 chars) |

### `VITE_API_BASE_URL` — build-time only, must stay EMPTY

- This is a **Vite build-time** variable, not a runtime env var: setting it on
  the running container does nothing.
- For same-origin serving (SPA and API in one service) it must be **empty /
  unset at build time**, so `src/api/client.tsx` keeps a relative base URL.
- **Never bake an absolute URL** (e.g. `http://localhost:5033` or a stale host)
  into the image. `.env*` files are excluded from the Docker build context, and
  the Dockerfile's `ARG VITE_API_BASE_URL` defaults to empty — do not pass a
  value for it unless you deliberately want an off-origin API.

## Health check

- Endpoint: **`GET /health`** → `{"status":"healthy"}` (HTTP 200, JSON).
- Port inside the container: **8080** (`ASPNETCORE_URLS=http://+:8080`).
- In Dokploy, set the health-check path to `/health` (no scheme/port override
  needed beyond the service port 8080).

## Data — the image ships WITHOUT data

- `.dockerignore` excludes `*.db`, `*.db-wal`, `*.db-shm`, `*.db-journal`
  (globs at repo root and nested), so the local dev database
  `simpleRank.dev.db` — real user data — can never enter the image. Verified:
  the running container starts with no `*.db` file in `/app`.
- SQLite (`DatabaseProvider=Sqlite`) is **dev-only**: in-container SQLite is
  ephemeral (an empty file created at startup, lost when the container is
  replaced).
- **Production uses Postgres** — connection string and provider switch are per
  `cutoverNote.md` (see its env-var and rollback/DNS sections; not repeated
  here).

## Rollout checklist

1. Create one Dokploy service from the repo root Dockerfile.
2. Set the env vars above (`DatabaseProvider=Postgres`, Postgres connection
   string, the three `Jwt__*` values). Leave `VITE_API_BASE_URL` unset/empty.
3. Health-check path `/health`, container port 8080.
4. After deploy: `GET /health` → `{"status":"healthy"}`, then smoke-test
   login/signup and ranking CRUD on the single host.
5. DNS cutover and rollback → `cutoverNote.md` (unchanged, human-owned).

## Local verification evidence (slice C)

- `~/.dotnet/dotnet test simpleRank.sln` → 6/6 passed (incl. the new
  `HealthTests.Health_ReturnsHealthyJsonPayload`), exit 0.
- `npm run build` and `npx tsc --noEmit` → exit 0.
- `docker build -t simplerank:slicec .` → exit 0; probe container on
  `18080→8080` answered `/health` with `{"status":"healthy"}`, `/` and `/Home`
  with the SPA `index.html` (`<title>simple rank</title>`), and
  `/api/Statistic/GetRankingsCount` with `{"totalCount":0}` on the empty
  in-image DB. Probe container removed afterwards.