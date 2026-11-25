# simple-rank frontend restyle spec

Goal: make the UI **more interesting but not too busy** — a confident, slightly playful
visual identity without clutter, gimmicks, or dense decoration. Visual/styling changes ONLY.

Repo: `/home/apple/simpleRank/simple-rank` (React 19 + Vite 6 + Tailwind 4 + daisyUI 5 + lucide-react).

## Verification (proven green on this box before handoff — run from repo root)

```bash
cd /home/apple/simpleRank/simple-rank
npm run build    # exit 0 (vite build + terser)
npm test         # exit 0 (vitest, 2 files / 4 tests)
```

Both must be exit 0 when you finish. Do NOT attempt to fix environment issues — if either
command fails for environment reasons, stop and report it verbatim in `deviations`.

## Hard constraints

- **Styling only.** Do not change component logic, state management, prop shapes, routing,
  or the API contract in `src/api/services.jsx`. Class-name / JSX structure tweaks for
  styling are fine; adding small presentational wrapper elements is fine.
- No new npm dependencies. Fonts may come from Google Fonts `<link>` in `index.html`
  (network available) — pick at most ONE display/heading font family plus the existing
  system stack for body.
- Keep all copy lowercase (existing voice: "my rankings", "create a new ranking").
- Respect `prefers-reduced-motion` for any animation.
- Do not touch `backend/`, do not run git commands (no commit, no branch switch, no push),
  do not edit `AGENTS.md`.
- daisyUI theme lives in `src/App.css` (`@plugin "daisyui"` + custom `mytheme`).
  `src/index.css` is untouched Vite boilerplate — reconcile the two (they currently fight:
  dark `#021727` root background + purple `#646cff` link colors vs. the light daisyUI theme).

## Current state (why it reads as bland)

- Plain default-ish light theme; `--color-secondary: F0F8FF` is an invalid value (missing
  oklch()/color function) — fix it as part of the palette work.
- `src/App.css` still has Vite scaffolding leftovers (`.logo`, `logo-spin`,
  `.read-the-docs`, centered `#root`) — remove dead rules.
- Typography is flat: default system font everywhere, `h1` at a blunt 3.2em, no type scale.
- Cards/tiles are bare (`outline-dashed` "create" tile, plain ranking cards), weak hover
  and focus states, inconsistent spacing/radius.
- Navbar is utilitarian: no separation from page content.

## Design direction — restrained, characterful

1. **Palette**: keep a light base-100 theme. Deepen `primary` (deep indigo/navy family),
   use `accent` sparingly (one accent color for small highlights only — pins, focus rings,
   hover details). Neutral greys with a slight cool cast for base-200/300. Semantic
   success/warning/error stay functional. All values valid oklch().
2. **Typography**: one display font (e.g. Space Grotesk / Sora / Plus Jakarta Sans — your
   pick) for headings and the "simple rank" wordmark; body stays system-ui. Define a small
   consistent type scale; headings get tighter tracking. Lowercase everywhere.
3. **Depth & shape**: consistent radius (theme `--radius-*` tokens), 1px subtle borders
   plus soft low-opacity shadows instead of heavy ones. One signature detail — e.g. a very
   subtle gradient or fine texture on the landing hero only — used once, not sprayed
   across every surface.
4. **Key surfaces**:
   - `Navbar`: sticky bar with backdrop blur + hairline bottom border; wordmark in the
     display font; clear hover/active states on links.
   - `LandingPage`: real hero — display-font headline, short subline, prominent primary
     CTA, restrained signature visual (the one gradient/texture allowed).
   - `Home` ranking grid: nicer cards (border + soft shadow, hover lift/translate,
     pin state visually distinct with the accent color), and the "create a new ranking"
     tile styled as an intentional dashed tile with hover fill.
   - `Rankings`, `RankItem`/`ReadOnlyRankItem`: polish spacing, hover states, numbered
     position treatment for rank order.
   - `Login`/`Signup`, modals (`ConfirmationModal`, `AddRankItemModal`,
     `EditRankDetailsModal`, `LoadingModal`): consistent card/modal styling, focus-visible
     rings.
5. **Micro-interactions**: 150–200ms transitions on hover/focus for buttons, links, cards.
   No parallax, no scroll-jacking, no animated backgrounds, no more than one subtle
   entrance treatment per page. "Not too busy" beats "impressive."
6. **Consistency pass**: unify button styles (daisyUI `btn` variants), spacing rhythm
   (Tailwind scale), and remove leftover scaffolding CSS.

## Deliverables

- Restyled `src/index.css` + `src/App.css` (theme tokens, fonts, base layer) with the two
  files reconciled (single source of truth for base styles; `index.css` should keep the
  Tailwind import and `App.css` the daisyUI plugin — or merge, your call, but no duplicate
  conflicting base rules).
- Updated className/structure across the pages/components listed above.
- `npm run build` and `npm test` both green.

## Final step (required)

1. Re-run both verification commands.
2. Enumerate every file you created or modified (`search_files`, `target='files'`,
   scoped to `src/` plus `index.html`).
3. Re-read this spec and report against `output_schema`: files_created/modified,
   spec_sections_done, deviations (anything you interpreted differently or skipped, with
   reasons — be exhaustive, silent deviations are the main failure mode).