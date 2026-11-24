# simple-rank — agent project rules

Single project at the repo root: ASP.NET Core API (Program.cs, Controllers/,
NewApp/, SimpleRank.Tests/ — all at root) + React frontend (`src/`). Vite builds
into `wwwroot/`, which `dotnet run` serves together with `/api` — one process,
one deployable. Migration context: `~/simpleRank/migrationPlan.md`,
`~/simpleRank/Inventory.md`, `~/simpleRank/cutoverNote.md`,
`~/simpleRank/singleProjectSpec.md`. Supabase is GONE — auth is first-party JWT
(`api/Auth/*`), data layer is EF Core (SQLite `simpleRank.dev.db` in local dev,
Postgres via `DatabaseProvider=Postgres` + `ConnectionStrings:DefaultConnection`).

## Commands
- Dev (both processes): `npm run dev` (concurrently: `dotnet run` + vite)
- Backend build: `~/.dotnet/dotnet build simpleRank.sln` (SDK 8 lives at `~/.dotnet`, not on PATH; bare `dotnet build` fails MSB1011 — always name the .sln, sln and csproj share the root)
- Backend run: `~/.dotnet/dotnet run` → http://localhost:5033 (Swagger at /swagger)
- Backend tests: `~/.dotnet/dotnet test simpleRank.sln` (from repo root)
- Frontend build: `npm run build` → emits `wwwroot/` (first time: `npm install-scripts approve esbuild @swc/core`)
- Frontend tests: `npm test`
- Production/single process: `npm run build` then `~/.dotnet/dotnet run` serves the SPA (wwwroot, client-route fallback) + `/api`; unknown `/api/*` returns JSON 404, never index.html

## Testing rules
- Backend changes need xUnit coverage; integration tests use
  `WebApplicationFactory` against the real Program.cs with a test SQLite DB.
- Never claim a change done without running
  `~/.dotnet/dotnet test backend/simpleRank.sln` green (and `npm test` if
  frontend code changed).

## Conventions
- Docs/dirs/scripts I create: camelCase, no spaces (e.g. `migrationPlan.md`).
  Code files follow language/framework conventions (PascalCase .net, etc.).
- Git: work on the `migration` branch. Commit per slice. NEVER push `main`,
  never deploy, never touch DNS — cutover is a human decision.
- Frontend API contract lives in `src/api/services.jsx`; session shape
  (`session.access_token`, `session.user.*`) must stay stable for call sites.
