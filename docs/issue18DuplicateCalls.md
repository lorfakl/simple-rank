# issue #18 root cause and fix evidence

## what was dev-only (StrictMode) vs genuine

1. dev-only duplicate calls (expected):
   - evidence: `src/main.tsx` wraps app in `<StrictMode>`.
   - evidence: regression test `src/pages/Home.test.tsx` test case `double-invokes fetch in StrictMode dev mounts` asserts `getUserRankings` is called 2 times for a single StrictMode mount in the test environment.

2. genuine duplicate calls in normal app behavior:
   - root cause: `Home.tsx` and `ViewRanking.tsx` data-fetch effects were tied to unstable dependencies (`session` object identity and callback identity coupled to list length), so ordinary session object/token refreshes or local state churn could re-run fetches.
   - evidence: old Home effect depended on `[session]`; fix now depends on `session?.user?.id` + stale-request invalidation, so token/session object churn no longer re-fetches the same user.
   - evidence: regression test `does not refetch rankings when only session object/token changes for same user id` passes, proving no second fetch for same user id.

## why data looked like it was not retained while page remained open

- each re-fetch flipped loading and re-applied server payload, so the UI could appear to "drop" locally visible state while open.
- stale request results could win race conditions and overwrite newer state.

## fixes applied

- request invalidation/cleanup using `activeRequestId` in `Home.tsx` and `ViewRanking.tsx`.
- retention-aware loading behavior:
  - first load shows spinner;
  - subsequent refreshes keep existing in-memory data instead of blanking UX.
- stable fetch triggers:
  - Home fetches by `session?.user?.id` (not whole session object).
  - ViewRanking fetches by route id.

## drag-to-speed-scroll-bottom bug repro attempt

- attempted repro in this environment with desktop/browser test tooling.
- could not reproduce the "drag-hold only scrolls upward" behavior here.
- this likely needs real touch-device validation (issue report also notes phone behavior differs). no speculative fix was applied without a reproducible case.
