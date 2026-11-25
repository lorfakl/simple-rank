# simple-rank Slice C — single-image Docker build + one-service deploy docs

Repo: `/home/apple/simpleRank/simple-rank` (branch `migration`). Single-project
layout + strict TS are done: C# and Vite both at repo root, `npm run build` →
`wwwroot/`, `dotnet run` serves SPA + `/api` (verified: `/` 200 SPA, `/Home`
fallback, `/api/bogus` JSON 404). Goal: ONE container image, ONE Dokploy service —
replacing the old "static frontend host + API host" pair.

## Deliverables

### 1. Rewrite `Dockerfile` (root — currently the old .NET-only backend image)

Multi-stage:
- **Stage `build-client`**: `node:20-alpine`, copy `package.json` +
  `package-lock.json`, `npm ci`, copy frontend sources (`src/`, `index.html`,
  `vite.config.ts`, `tsconfig.json`, `public/`, `vite-env`/`types.d.ts` as needed),
  `npm run build` → produces `wwwroot/`.
- **Stage `build-server`**: `sdk:8.0` (match `global.json` if it pins a version —
  check it), copy csproj/sln first for layer-cached `dotnet restore`, then all C#
  sources, `dotnet publish -c Release -o /app/publish`; copy `wwwroot/` from the
  client stage into the publish output (publish may already include wwwroot if
  present at publish time — arrange order so the final image HAS wwwroot/index.html;
  verify in the running container).
- **Stage `runtime`**: `aspnet:8.0`, copy `/app/publish`, `ENV ASPNETCORE_URLS=
  http://+:8080`, `EXPOSE 8080`. Entry: the app.
- Use a non-root user if straightforward (aspnet images have `app` user); deviation
  is acceptable if it breaks wwwroot read access.

### 2. `.dockerignore` (must EXCLUDE — data/secret leakage)

`.git`, `node_modules`, `bin`, `obj`, `dist`, `wwwroot` (container builds its own),
`*.db`, `*.db-wal`, `*.db-shm`, `*.db-journal` (the dev DB with real user data MUST
never enter the image), `*.log`, `.env*` files, `SimpleRankExports` is outside the
repo anyway. State the final list in deviations.

### 3. `/health` endpoint (cutoverNote.md already promises `GET /health` →
`{"status":"healthy"}`)

Check whether one exists; if not, add the minimal `app.MapGet("/health", ...)` in
Program.cs returning that exact JSON, PLUS one xUnit test asserting it (AGENTS.md:
backend changes need coverage — put it in SimpleRank.Tests using the existing
WebApplicationFactory pattern the integration tests already use).

### 4. `~/simpleRank/deployNote.md` (camelCase, outside the repo dir but INSIDE
simpleRank/ — sibling of cutoverNote.md)

The authoritative one-service deploy doc:
- One Dokploy service built from the repo-root Dockerfile; no second static host.
- Env vars the container needs: `DatabaseProvider` (Sqlite default / Postgres),
  `ConnectionStrings__DefaultConnection`, `Jwt__Issuer`, `Jwt__Audience`,
  `Jwt__Key`; note `VITE_API_BASE_URL` is BUILD-time only and must stay empty for
  same-origin serving (never bake an absolute localhost URL).
- Health check URL `/health`, port 8080 inside the container.
- Data note: image ships WITHOUT data (dockerignore excludes db files); SQLite is
  dev-only, production uses Postgres per cutoverNote.md — reference it, don't
  duplicate its rollback/DNS sections.
- One paragraph at the top stating this doc supersedes cutoverNote.md's
  "deploy frontend + deploy backend" two-host steps (cutoverNote stays as history).
- Update `cutoverNote.md` minimally: add a one-line pointer at the top to
  deployNote.md (that file lives at `~/simpleRank/cutoverNote.md` — editing it is
  allowed ONLY for this pointer line).

## Verification (run it all yourself — a green build with no run is not enough)

```bash
cd /home/apple/simpleRank/simple-rank
~/.dotnet/dotnet test simpleRank.sln     # exit 0 (incl. new /health test)
npm run build && npx tsc --noEmit        # exit 0 — frontend untouched but prove it
docker build -t simplerank:slicec .       # exit 0 (FIRST pull may take minutes; this box has docker, you are allowed to run it)
docker run -d --rm -p 18080:8080 --name slicec-probe simplerank:slicec \
  -e Jwt__Issuer=test -e Jwt__Audience=test -e Jwt__Key=thisisatleast32characterslongtestkey00000
curl http://localhost:18080/health               # {"status":"healthy"}
curl http://localhost:18080/                     # SPA html (title simple rank) — proves wwwroot made it in
curl http://localhost:18080/Home                 # same index.html (fallback)
curl http://localhost:18080/api/Statistic/GetRankingsCount   # 200 JSON (empty db is fine, any count)
docker rm -f slicec-probe                         # STOP the container when done
```

If a base image pull fails for network reasons, report verbatim in deviations —
do not substitute a fake result. The local dev servers (5033/5173) keep running;
do not touch them.

## Hard constraints

No git commits (status reporting read-only). No new npm/NuGet deps. No Dokploy
API calls, no pushes, no DNS. Styling/`src/` untouched (except nothing — src is
read-only this slice; only allowed src touch is none). `AGENTS.md` untouched.
Port 8080 in-container mapped to 18080 only for the probe.

## Final step (required)

Re-run the verification block, enumerate changed/created files
(`git status --porcelain`), re-read this spec, report per output_schema:
files, docker build/run evidence (actual curl outputs), test results,
exhaustive deviations.