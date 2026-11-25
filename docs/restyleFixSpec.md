# simple-rank restyle fix — hero glow full-bleed + responsive polish

Follow-up to `restyleSpec.md` (same repo, same hard constraints). Two user-reported
issues after reviewing the first restyle live:

Repo: `/home/apple/simpleRank/simple-rank` (React 19 + Vite 6 + Tailwind 4 + daisyUI 5).
A dev server may be running — do NOT start/stop servers; just edit files.

## Verification (proven green on this box)

```bash
cd /home/apple/simpleRank/simple-rank
npm run build    # exit 0
npm test         # exit 0 (vitest, 2 files / 4 tests)
```

Both must be exit 0 when you finish. If they fail for environment reasons, stop and
report verbatim in `deviations`.

## Issue 1 — hero-glow is a floating island (user: "sits in the middle, bottom and
sides are default and bland")

`.hero-glow` (src/App.css, applied in src/pages/LandingPage.jsx) renders its gradient
only inside the centered hero card, so the card floats on flat white. Fix by making
the treatment full-bleed:

- Move/extend the ambient gradient to the full-width hero SECTION (or the landing
  page container) so background tint spans edge to edge — behind the card, down past
  the footer text, top to bottom of the landing viewport. The card should sit ON a
  tinted backdrop, not be the only tinted thing.
- Keep it restrained: one soft radial/linear wash from primary tints (oklch 0.37
  0.085 265 at low alpha), fading to base-100 — no extra colors, no second gradient,
  no noise/texture. Slightly stronger at the top/center, essentially gone by the
  bottom edge so footer text stays readable on light background.
- Consider a very subtle base tint for the whole landing page background (e.g.
  base-100 → a hair of primary in the corners) so nothing reads as default-white —
  but keep contrast: body text must stay clearly readable (content token on light bg).
- The signed-in pages (Home etc.) do NOT need the wash — keep them clean; only fix
  the landing's flat surround.

## Issue 2 — responsive pass (user: "doesn't look responsive")

Screenshots at 390px and 768px show no overflow, but audit and tighten anyway:

- Check `src/index.css` / `src/App.css` for fixed widths, `3.2em`-style sizes, or
  px values that don't scale; use clamp()/responsive Tailwind steps where needed.
- Navbar at <640px: hamburger + centered wordmark + sign-in must not collide at
  320–390px (wordmark font-size step down if needed).
- Landing hero at 320px: logo+wordmark row, CTA button, stats columns — make sure
  stats stack or shrink gracefully; CTA must not overflow.
- Home grid: daisyUI grid `lg:grid-cols-4` — confirm the create-tile and cards look
  right at 1 col (mobile), 2 col (md), 4 col (lg); cards' hover-lift must not cause
  horizontal scroll.
- Modals (`ConfirmationModal`, `AddRankItemModal`, `EditRankDetailsModal`): max-width
  + margins so they never exceed viewport width on phones.
- RankItem/Rankings rows: long titles must wrap or ellipsize, not push layout wide.
- Verify mentally against Tailwind breakpoints; you cannot screenshot (browser tool
  is unavailable to you) — be conservative and prefer fluid units.

## Hard constraints (same as before)

Styling only — no logic/prop/routing/API changes; no new npm deps; no git commands;
don't touch backend/ or AGENTS.md; lowercase copy; one display font (Space Grotesk);
respect prefers-reduced-motion.

## Final step (required)

Re-run both verification commands, enumerate modified files with search_files
(target='files', scope src/ + index.html), re-read this spec, and report per
output_schema with exhaustive deviations.