# simple-rank migration plan

Date: 2026-10-29

## Supabase feature replacement map

1) Supabase Auth client (`supabase.auth.*`) -> first-party C# auth endpoints + JWT

- Frontend calls now target:
  - `POST /api/Auth/SignUp`
  - `POST /api/Auth/SignIn`
  - `GET /api/Auth/Me`
  - `POST /api/Auth/SignOut`
- JWT bearer token is still stored in `localStorage.auth_token` and injected by
  `src/api/client.jsx` into `Authorization: Bearer ...`.
- Session/user shape is preserved for frontend call sites:
  - `session.access_token`
  - `session.user.id`
  - `session.user.user_metadata.full_name`
  - `session.user.user_metadata.avatar_url`
- `POST /api/User/SetUserMetadata` remains and is called after auth session set.

2) Supabase PostgREST data access -> EF Core data layer

- Replaced `_supabase.From<T>()` service calls with EF Core entities + DbContext.
- Local dev default DB: SQLite (`simpleRank.dev.db`).
- Postgres-ready retained via config switch:
  - `DatabaseProvider=Postgres`
  - `ConnectionStrings:DefaultConnection=<postgres connection string>`

3) Supabase-specific infra coupling (Key Vault/Supabase env keys) -> appsettings-driven local config

- Local dev no longer requires Supabase URL/key/jwt or Azure Key Vault values.
- Runtime config for auth/database now comes from `appsettings*.json` and env overrides.

4) OAuth (Google/Discord)

- In this migration slice, OAuth UI remains visible as disabled buttons with explicit message.
- Email/password auth is fully operational and used for local verification.
- OAuth can be added later as a follow-on slice (provider app registration + callback handling).

## Merged repo layout (target)

- `~/simpleRank/simple-rank/` (single repo)
  - `src/` React frontend
  - `backend/` ASP.NET Core API (in-repo, no submodule)
    - `Program.cs`
    - `NewApp/Controllers/*`
    - `NewApp/Data/AppDbContext.cs`
    - `NewApp/Models/*`
    - `NewApp/DTOs/*`
    - `NewApp/Services/TokenService.cs`
- `.gitmodules` removed; `backend` is normal tracked source.

## Slice-by-slice implementation order

Slice 1: merge backend into mono-repo and remove submodule plumbing
- Copy backend code into `simple-rank/backend/`.
- Remove `.gitmodules` declaration for `backend` gitlink.
- Keep branch isolated (`migration`).

Slice 2: backend runtime migration (Supabase -> EF/SQLite + JWT auth)
- Introduce EF Core DbContext/entities/controllers under `backend/NewApp`.
- Add JWT auth endpoints and bearer validation.
- Preserve frontend API route contract used in `src/api/services.jsx`.
- Default dev DB provider to SQLite; keep Postgres config path.

Slice 3: frontend auth swap
- Replace SupabaseContext with neutral provider.
- Replace UserContext Supabase auth calls with API auth calls.
- Keep localStorage token semantics unchanged for API client.
- Re-enable email auth form in login/signup flow.

Slice 4: verification and docs
- Build backend with .NET 8.
- Build frontend with Vite (after `npm install-scripts approve esbuild @swc/core` constraints handled).
- Run end-to-end API flow: signup/login, metadata, ranking CRUD, share link, stats.
- Publish cutover note (`cutoverNote.md`) and final migration report.
