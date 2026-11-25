# simple-rank testing setup brief

You are setting up automated testing for the simple-rank monorepo. Work
autonomously. Project rules: `AGENTS.md` in the repo root (read it first).

## Scope
1. **Backend (primary)**: create an xUnit test project under
   `~/simpleRank/simple-rank/backend/` (follow .NET naming, e.g.
   `SimpleRank.Tests/`). Cover with integration tests via
   `WebApplicationFactory<Program>` + isolated test SQLite DB:
   - Auth: SignUp, SignIn, `/api/Auth/Me` (401 without token, 200 with),
     SignOut; JWT contains expected claims
   - Ranking CRUD: CreateRanking, GetUserRankings, GetRanking, EditRanking,
     DeleteRanking, GetPublicRankings
   - Rank items: CreateRankItem, EditRankItem, DeleteRankItem,
     UpdateRankItemsPlacement
   - Share flow: GetShareableLink, GetSharedRanking, CloneSharedRanking
   - Stats: GetRankingsCount, GetUserCount, RecordView, React, Get
   - Authz: user B cannot edit/delete user A's ranking (403/404)
2. **Frontend (light)**: Vitest setup + smoke tests for the auth context and
   `src/api/client.jsx` token injection. Keep it small; do not chase coverage.
3. Wire everything so one command runs it all: `~/.dotnet/dotnet test` green,
   `npm test` green. Update `AGENTS.md` if commands change.

## Constraints
- Continue on the `migration` branch; commit per slice; never push main.
- Test-only DBs (SQLite files or in-memory); never touch real user data.
- Follow AGENTS.md naming and testing rules. Report: what is covered, what
  commands prove it, gaps left.
