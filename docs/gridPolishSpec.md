# simple-rank home grid polish spec

User feedback: *"the grid items are just kind of there boring little squares with a
slight shadow, anything we can add to the background?"*

Repo: `/home/apple/simpleRank/simple-rank` (React 19 + Vite 6 + Tailwind 4 + daisyUI 5 + lucide-react).
Surfaces: `src/pages/Home.jsx` (page + grid + create tile), `src/components/Rankings.jsx`
(card), tokens in `src/App.css`.

A dev backend + frontend are already running — do NOT start/stop/kill any process; just
edit files.

## Verification (proven green on this box — run from repo root)

```bash
cd /home/apple/simpleRank/simple-rank
npm run build    # exit 0 (vite build + terser)
npm test         # exit 0 (vitest, 2 files / 4 tests)
```

Both must be exit 0 when you finish. If either fails for environment reasons, stop and
report it verbatim in `deviations`.

## Hard constraints

- **Styling/presentational changes only.** No component logic, state, prop-shape, routing
  or API changes (`src/api/services.jsx` untouched). Class-name tweaks, presentational
  wrapper elements, and render-time formatting of existing props (e.g. sorting a copy of
  `rankItems` for display) are fine.
- No new npm dependencies; no git commands; do not touch `backend/`, `.env*`,
  `vite.config.js`, or `AGENTS.md`.
- All copy stays lowercase (existing voice: "my rankings", "create a new ranking").
- Space Grotesk stays the only display font (Google Fonts link in `index.html` unchanged).
- Respect `prefers-reduced-motion` for every transform/animation.
- No busy patterns: no noise/texture, no per-card gradients — see budget in (4).

## Required changes

### 1. Subtle full-page background wash on Home

- Add one page-level wash (`.home-wash` in `src/App.css`) and apply it to a single
  full-width wrapper (`w-full min-h-svh`) around the Home content: the "my rankings"
  header, the loading state, and the grid. Delete modal stays outside the wrapper.
- It must belong to the same family as the landing's existing `.hero-glow`: one soft
  radial built only from `--color-primary` tints at low alpha over `--color-base-100`,
  strongest near the top/center and essentially gone by the lower page so card text stays
  on a light ground. Different section, softer/own geometry (hero-glow keeps 16%/7% at
  `140% 105% at 50% -8%` — the Home wash must be its own, gentler values), **no new
  colors**, no texture, no second gradient, no animated background.
- `.hero-glow` on the landing page stays untouched.

### 2. Richer card treatment (`Rankings.jsx` + `.card-tile` CSS)

- **Title**: stays display-font (Space Grotesk); give it a `.card-title` hook so hover
  shifts it to `--color-primary` with the standard 170ms ease-out transition.
- **Chips under the title**: one row (`flex flex-wrap`, `min-w-0`, gap on the Tailwind
  scale) containing:
  - an item-count chip reusing the existing `.rank-chip` pill, reading the existing copy
    `rank items: {n}` from `rankItems.length`;
  - up to **3 top-3 name chips** (`.top-chip`) — position number in the display font with
    `tabular-nums` in primary, plus the item's name, truncated with a `title` attribute.
    Derived at render time for presentation only: a copy of `rankItems` sorted ascending
    by rank (`rank`/`Rank`, fall back to array order if absent), first 3, fewer when the
    ranking has fewer items, none when empty. Handle both `name`/`Name` field casing.
  - The old `rank items: {n}` text moves into this chip; the `creator:` line stays.
- **Pin state with accent**: `.card-pinned` keeps the accent border and gains the one
  allowed subtle per-card tint — a flat `color-mix` of `--color-accent` into base-100
  (no gradient). The accent Pin icon + `click to unpin` copy already exist and stay.
- **Stronger hover affordance**: deeper low-opacity shadow, border mixing more primary,
  title → primary, and the existing `-4px` lift kept inside
  `@media (prefers-reduced-motion: no-preference)`.
- Drop the `lg:aspect-square` fixed box so added chip content can never overflow the
  card; grid rows still equalize by normal `stretch` alignment.

### 3. More inviting create tile (`tile-dashed`)

- Keep it an intentional dashed tile with `--radius-box` and its existing copy.
- At rest: faint flat primary tint background (single color-mix, no gradient).
- On hover/focus-visible: primary border, slightly stronger tint, label → primary, and
  the plus badge fills `--color-primary` with `--color-primary-content` icon and a small
  scale-up — the scale lives in CSS behind `@media (prefers-reduced-motion: no-preference)`.
- No new copy, no icons added.

### 4. Consistency budget

- Same tokens everywhere: radius from `--radius-box`/`rounded-box`, 1px hairline borders
  (`--border` / `--color-base-300`), depth from the existing soft low-opacity shadow
  recipe, 170ms ease-out transitions.
- Decoration budget: **exactly one page-level wash** (`.home-wash`) on Home, plus **at
  most one subtle per-card tint** (the pinned state). No gradients on individual cards,
  no patterns/noise, nothing sprayed across every surface.

### 5. Responsive grid

- Columns must remain 1 / 2 / 4: base and `sm` = 1 col, `md` = 2, `lg` = 4
  (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`, `px-8` gutters kept).
- Chips wrap instead of widening rows; names truncate with `min-width: 0`; no fixed pixel
  widths on tiles; hover uses transform only — **no horizontal scroll at any width**.

## Deliverables

- `src/App.css`: `.home-wash`, chip styles, card/create-tile refinements (all inside the
  existing `@layer components`, all motion guarded).
- `src/pages/Home.jsx`: wash wrapper, chip-friendly grid markup, create-tile class hooks.
- `src/components/Rankings.jsx`: chip row + `.card-title` hook + `lg:aspect-square` removed.
- `npm run build` and `npm test` both green.

## Final step (required)

1. Re-run both verification commands.
2. Enumerate every file created/modified (`search_files`, `target='files'`, scoped to
   `src/` plus `index.html`).
3. Re-read this spec and report against `output_schema`: files_created, files_modified,
   spec_sections_done, deviations (anything interpreted differently or skipped, with
   reasons — be exhaustive; silent deviations are the main failure mode).