# Implementation Plan: simple-rank open-issue triage (deploy-first)

## Overview
Eleven issues are open across `lorfakl/simple-rank` (10) and `lorfakl/simple-rank-backend` (1).
A public deploy is imminent (single-image Docker build already landed on `migration`), so the
plan runs **launch blockers first** (auth redirects, logging, pen test), then **correctness
bugs**, then **UX features**, then **encryption**, with the large architectural issues explicitly
deferred. Stale parts of issues that still assume Supabase are re-scoped — the migration to
first-party JWT + EF Core is done, so "supabase redirect URL" items are obsolete, while their
still-real parts (401/403 redirects) stay in scope.

Verified state of the code before planning:
- `src/api/client.tsx` has **no** 401/403 handling → #10 second checkbox is genuinely open.
- No Sentry/OTel/console-error aggregation anywhere in frontend or backend → #4 open.
- `SupabaseContext.tsx` still exists as a name but wraps the first-party auth API → rename is
  cosmetic, tracked separately from #10.
- Repo rules (AGENTS.md): branch `migration`, commit per slice, never push `main`,
  never deploy/DNS without a human.

## Architecture Decisions
- **Security/observability before features.** Deploy is the forcing function; a pen test after
  launch is just a bug report.
- **Minimal-but-real logging at launch** (Serilog + request timing + frontend error boundary
  posting to one endpoint), not the full APM dashboard #4 describes — that stays open.
- **#14 is a decision, not a build** — it is cheap and gates the encryption work (Channels /
  concurrency policy), so it runs immediately before Phase 4.
- **#11 and #12 share a component** — hyperlinks land first, the rank-item redesign consumes it.
- **Deferred (not urgent, kept open):** #13 edit history, #15 caching/eventual consistency,
  #16 trending landing page, #4's full dashboard scope.

## Task List

### Phase 1: Launch blockers

#### Task 1: 401/403 interceptor + login redirect (#10)
**Description:** Add a single response interceptor in the API client: on 401, clear the stored
session and redirect to `/login` (preserving `returnTo`); on 403, surface a friendly
"not authorized" state instead of a dead UI. Refresh-or-expire semantics decided here.
**Acceptance criteria:**
- [ ] Expired/invalid JWT on any API call ends at `/login` with return path preserved, exactly once (no redirect loop)
- [ ] 403 shows an in-app state, never a blank screen or console-only failure
- [ ] Unit tests cover 401, 403, and 200 paths in `src/api/client.test.tsx`
**Verification:** `npm run build` exits 0; `npm test` exits 0; manual: forge an expired token, load a protected page.
**Dependencies:** None
**Files likely touched:** `src/api/client.tsx`, `src/api/client.test.tsx`, `src/App.tsx` (route guard), `src/contexts/SupabaseContext.tsx`
**Scope:** S

#### Task 2: Redirect URL correctness + stale-Supabase cleanup (#10 first checkbox)
**Description:** Confirm every auth redirect uses the site's own origin (no project-id or
localhost URLs leaking into provider/redirect flows), and rename `SupabaseContext` →
`AuthContext` so the legacy name stops misleading readers.
**Acceptance criteria:**
- [ ] Grep shows zero `*.supabase.co` / project-id URLs in redirect construction
- [ ] Login → protected page → login round-trip lands on the site's own domain
- [ ] `SupabaseContext` renamed with all imports updated; no behavior change
**Verification:** `npm run build`, `npm test`; grep for `supabase.co` returns nothing in `src/`.
**Dependencies:** Task 1 (same redirect path)
**Files likely touched:** `src/contexts/SupabaseContext.tsx`, `src/pages/Login.tsx`, `src/pages/Signup.tsx`, `src/api/services.tsx`
**Scope:** S

#### Task 3: Logging baseline (#4, launch scope)
**Description:** Backend: Serilog with console JSON output (fits `docker logs`), request
middleware logging method/path/status/elapsed. Frontend: global error boundary + `window.onerror`
handler POSTing to a new `POST /api/Logs/client` endpoint with rate limiting. The full APM
dashboard in #4 stays open.
**Acceptance criteria:**
- [ ] Every backend request emits one structured log line with status + elapsed ms
- [ ] An uncaught frontend error produces a server-side log entry within 5s
- [ ] Client log endpoint is rate-limited and rejects oversized/HTML payloads
**Verification:** `~/.dotnet/dotnet test` green; `npm test` green; run container, trigger a 500 and a JS error, both visible in `docker logs`.
**Dependencies:** None
**Files likely touched:** `backend/Program.cs`, `backend/*` (middleware + controller), frontend error boundary file, `package.json`
**Scope:** M

#### Task 4: Auth hardening review (#14 in backend repo, #7 part 1)
**Description:** Manual + automated check of the auth surface before the pen test: JWT signing
key handling in the container (no default/dev secrets), auth on every mutating endpoint
(authorz tests exist for rankings — extend to stats/share/clone), CORS locked to the site
origin, rate limiting on `api/Auth/*`, `WWW-Authenticate`/security headers, SQLite file
permissions in the image.
**Acceptance criteria:**
- [ ] No dev/default secret can start the container in production mode (fails fast instead)
- [ ] Every mutating endpoint has a 401/403 test; new gaps get tests
- [ ] CORS config lists explicit origins; wildcard rejected
- [ ] Findings list written with severity + fix status
**Verification:** `~/.dotnet/dotnet test` green; findings list attached to this plan.
**Dependencies:** Task 1 (redirect behavior tested against real 401s)
**Files likely touched:** `backend/Program.cs`, `backend/appsettings*.json`, test project, `Dockerfile`
**Scope:** M

#### Task 5: ZAP baseline pen test (#7, launch scope)
**Description:** Run the ZAP baseline + active scan against a locally running container
(ZAP docker image, ~30–60 min). Triage every ALERT/WARNING; fix Highs before deploy, log
Mediums/Lows into GitHub issues.
**Acceptance criteria:**
- [ ] ZAP baseline report generated and stored
- [ ] Zero unfixed High-risk findings
- [ ] Mediums/Lows filed as new GitHub issues with evidence
**Dependencies:** Tasks 1–4
**Verification:** ZAP report file + issue links listed here.
**Scope:** M (mostly runtime, little code)
**Files likely touched:** findings report, occasional fixes in `backend/`

### Checkpoint: Launch-ready
- [ ] `npm run build`, `npm test`, `~/.dotnet/dotnet test` all exit 0
- [ ] Container dry run: signup → create ranking → share link → edit → logout → login works
- [ ] Human reviews findings before deploy

### Phase 2: Correctness bugs (#18)

#### Task 6: Duplicate API calls investigation (#18 second bullet)
**Description:** Reproduce on a production build (not dev — dev double-calls via StrictMode):
network log every page load and idle period; determine whether duplicates come from StrictMode,
refetch-on-focus, an unclosed subscription, or the old Supabase lib hypothesis (now stale —
the lib is gone). Fix root cause or document why it is benign.
**Acceptance criteria:**
- [ ] Production-build network trace captured for home + a ranking page
- [ ] Each logical fetch fires exactly once per trigger
- [ ] Root cause written up as a comment on #18
**Verification:** `npm run build` + preview; trace shows no duplicate pairs.
**Dependencies:** None
**Files likely touched:** `src/App.tsx`, `src/contexts/*`, possibly `src/api/services.tsx`
**Scope:** S–M

#### Task 7: Drag-to-speed-scroll only works upward (#18 first bullet)
**Description:** Reported only on phone, not reproducible in dev. Timeboxed: attempt repro via
browser devtools mobile emulation + touch emulation on the built app; if the autoscroll
implementation is direction-asymmetric in code, fix it; if no repro after the timebox, comment
findings on #18 and close as cannot-reproduce.
**Acceptance criteria:**
- [ ] Code path for drag autoscroll audited for direction symmetry
- [ ] Either a fix with before/after evidence, or a documented cannot-repro close-out
**Verification:** Emulated touch drag both directions on the ranking list.
**Dependencies:** None (independent of Task 6)
**Files likely touched:** rank list / drag hook component
**Scope:** S (hard cap: 2h, then close-out)

### Phase 3: Rank item UX (#11 + #12)

#### Task 8: Hyperlinks in text (#11)
**Description:** Render links in ranking/item text in display mode. Research → small sanitizer +
linkifier component (no new npm deps — AGENTS.md constraint), `rel="noopener noreferrer"`,
`javascript:`/`data:` URLs stripped, autolink `http(s)://` and explicit `[text](url)` if chosen.
**Acceptance criteria:**
- [ ] Links open in a new tab, sandboxed correctly
- [ ] `javascript:alert(1)` in item text renders as inert text (test proves it)
- [ ] Plain text with no links renders unchanged
**Verification:** `npm run build`, `npm test` (add sanitizer unit tests).
**Dependencies:** None
**Files likely touched:** new `src/components/LinkifiedText.tsx` + test, call sites in ranking components
**Scope:** S

#### Task 9: Rank item component redesign (#12)
**Description:** Rework the rank item component: optional image background (with fallback +
lazy loading), description edited in a `<textarea>`, display mode uses Task 8's link rendering.
Styling-only relative to data model — no API shape changes.
**Acceptance criteria:**
- [ ] Item with image shows background image; item without shows current default styling
- [ ] Description field is a textarea, preserves existing save behavior
- [ ] Display mode renders links via Task 8 component
**Verification:** `npm run build`, `npm test`; visual check on home + ranking pages.
**Dependencies:** Task 8
**Files likely touched:** `src/components/RankingDetails.jsx` (→ `.tsx`), rank item component, `src/App.css`
**Scope:** M

### Checkpoint: UX
- [ ] Build + tests green, no regressions in ranking create/edit/share flows

### Phase 4: Encryption (backend #1)

#### Task 10: Concurrency decision (#14)
**Description:** Read the linked concurrency prompt collection, decide the house policy
(Channels vs `ConcurrentDictionary`+locks vs `SemaphoreSlim` per key) for background work in
this app, and record the decision in `AGENTS.md` so later tasks follow it.
**Acceptance criteria:**
- [ ] Decision written with one-line rationale and when-to-use-what table
- [ ] Applies to Task 11's DEK-creation channel
**Verification:** AGENTS.md updated; user acknowledges the decision.
**Dependencies:** None (must precede Task 11)
**Scope:** XS

#### Task 11: User DEKs on login (backend #1 part 1)
**Description:** `UserSecret` model + EF migration; BackgroundService consuming a Channel of
"user needs a DEK" events fired at login; DEK creation via the Secret Client service; `UserSecret`
event type.
**Acceptance criteria:**
- [ ] Login by a user without a secret results in exactly one DEK created (no duplicates under concurrent logins)
- [ ] Migration applies cleanly on SQLite and Postgres
- [ ] Unit/integration tests cover create-once and idempotency
**Verification:** `~/.dotnet/dotnet test` green.
**Dependencies:** Task 10 (channel policy)
**Files likely touched:** `backend/Models/`, `backend/Services/`, `backend/Migrations/`, tests
**Scope:** M

#### Task 12: Encryption service at the ranking service (backend #1 part 2)
**Description:** Encrypt/decrypt ranking names + descriptions and rank-item names + descriptions
only; public rankings stay plaintext; reflection-based field mapping with results cached in a
concurrent dictionary; applied inside the ranking service so controllers stay unchanged.
**Acceptance criteria:**
- [ ] Encrypted fields are ciphertext at rest; public rankings readable unencrypted
- [ ] All existing ranking CRUD + share tests pass unchanged
- [ ] Reflection cache hit path covered by a test (no per-call reflection cost)
**Verification:** `~/.dotnet/dotnet test` green; direct SQLite inspection shows ciphertext.
**Dependencies:** Task 11
**Files likely touched:** `backend/Services/EncryptionService.cs`, ranking service, tests
**Scope:** M
**Open question (needs human):** existing rows must be re-encrypted — one-off migration script?
and where do master keys live (Key Vault vs appsettings-sealed secret)?

### Checkpoint: Encryption
- [ ] Both repos green; back up DB before running the backfill

### Deferred (kept open, no tasks yet)
- **#13 ranking edit history** — new table + API; schedule after encryption settles the schema.
- **#15 caching / eventual consistency** — indexeddb offline-first is a redesign, not a launch item.
- **#16 trending landing page** — needs reactions/comments first; a feature milestone of its own.
- **#4 full APM** — dashboard, per-user tracing, frontend page metrics; extends Task 3 later.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Pen test uncovers authz holes requiring schema/API changes | High | Runs early (Task 5) with a fix buffer before deploy; checkpoint gates deploy |
| Encryption backfill corrupts existing rankings | High | Backup DB first; run in a transaction; keep old plaintext copy until tests pass |
| Task 7 never reproduces (phone-only bug) | Low | Hard 2h timebox, then documented close-out on #18 |
| No-new-npm-deps constraint blocks link rendering/sanitizing | Medium | Hand-roll a small linkifier; sanitizer logic covered by unit tests |
| Redirect work in Tasks 1–2 collides with auth contexts in two pages | Medium | Both tasks land as one vertical slice, single commit |

## Open Questions
- Where do master encryption keys live — Key Vault, or a production-only env var injected into the container? (blocks Task 11/12)
- Should expired-JWT handling attempt a silent refresh, or is redirect-to-login acceptable UX?
- Is Task 7's phone-only scroll bug still reproducible on your device today?
