# simple-rank issue triage — task list

Plan: `docs/plan.md` · branch `migration` · commit per slice · never push `main`.
Verification baseline for every slice: `npm run build`, `npm test`, `~/.dotnet/dotnet test`.

## Phase 1 — Launch blockers
- [ ] Task 1: 401/403 interceptor + login redirect (simple-rank #10)
- [ ] Task 2: Redirect URL correctness + rename SupabaseContext → AuthContext (simple-rank #10)
- [ ] Task 3: Logging baseline — Serilog + request middleware + client error endpoint (simple-rank #4, launch scope)
- [ ] Task 4: Auth hardening review — secrets, authz tests, CORS, rate limits (simple-rank-backend #14 area, #7 part 1)
- [ ] Task 5: ZAP baseline pen test, fix Highs, file the rest (simple-rank #7)

### Checkpoint: Launch-ready
- [ ] All builds/tests green; container dry run of signup → ranking → share → edit → logout → login
- [ ] Human reviews findings before deploy

## Phase 2 — Correctness bugs (#18)
- [ ] Task 6: Duplicate API calls — prod-build network trace, fix or document (simple-rank #18)
- [ ] Task 7: Drag-to-speed-scroll direction bug — 2h timebox, fix or cannot-repro close-out (simple-rank #18)

## Phase 3 — Rank item UX
- [ ] Task 8: Hyperlinks in text, sanitized linkifier, no new deps (simple-rank #11)
- [ ] Task 9: Rank item redesign — image background, textarea, links in display (simple-rank #12)

### Checkpoint: UX
- [ ] Build + tests green; create/edit/share flows unchanged

## Phase 4 — Encryption (simple-rank-backend #1)
- [ ] Task 10: Concurrency decision recorded in AGENTS.md (simple-rank #14)
- [ ] Task 11: UserSecret model + DEK-on-login channel (backend #1)
- [ ] Task 12: Encryption service in ranking service + backfill script (backend #1)

### Checkpoint: Encryption
- [ ] DB backed up before backfill; both repos green

## Deferred (issues stay open, no tasks yet)
- [ ] #13 ranking edit history (after encryption settles schema)
- [ ] #15 caching / eventual consistency (redesign-scale)
- [ ] #16 trending landing page (needs reactions/comments first)
- [ ] #4 full APM dashboard (extends Task 3 later)
