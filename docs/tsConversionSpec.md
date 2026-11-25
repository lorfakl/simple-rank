# simple-rank Slice B — full strict TypeScript conversion

Repo: `/home/apple/simpleRank/simple-rank` (branch `migration`, single-project layout
already landed: C# + Vite at root, build → wwwroot). User decision: FULL strict
conversion now — no allowJs bridge, no `any` escapes.

## Scope

- Rename every `src/**/*.jsx` (39 files) to `.tsx` (including `*.test.jsx`),
  `vite.config.js` → `vite.config.ts`, `src/main.jsx` → `src/main.tsx`
  (update the `index.html` script src accordingly).
- Add `tsconfig.json` at repo root: `strict: true` (all strict family flags on:
  noImplicitAny, strictNullChecks, noUncheckedIndexedAccess if tolerable —
  if it cascades unreasonably, note in deviations), `jsx: "react-jsx"`,
  `moduleResolution: "bundler"`, `module/moduleTarget` modern, `target: ES2022`,
  `noEmit: true`, `include: ["src", "vite.config.ts"]`, `types` covering
  vite/client + vitest globals as needed. If vite.config.ts needs a separate
  tsconfig.node.json (standard template split), that's fine.
- Add npm script `"typecheck": "tsc --noEmit"`.

## Typing rules

- REAL types, not `any`/`as unknown as` escape hatches: define prop interfaces
  for every component (Navbar, Rankings, RankItem, ReadOnlyRankItem, ProtoRank,
  modals, inputs, Reaction*, IconSwap, LimitedText*, ToggleTextInput,
  EmailAuthenticationForm, AuthenticationOptions, RankingDetails, LoadingModal,
  exampledata…), typed contexts (User/Session shape per the API contract:
  `session.access_token`, `session.user.id`, `session.user.user_metadata.*`),
  typed `api/services.jsx` (request/response shapes matching the .NET DTOs —
  read `NewApp/DTOs/*.cs` and controllers for the wire shapes), typed
  react-router usage, typed helper functions.
- The API contract in `src/api/services.jsx` (now .tsx/ts) must keep exact same
  routes and session shape — types describe it, never change it.
- JSX ambiguities to handle properly: index signatures for style objects,
  event handler types (React.FormEvent, React.ChangeEvent), ref types
  (useRef<HTMLDivElement>(null)), drag-drop callbacks from
  @hello-pangea/dnd, lucide icon props.
- Existing tests (UserContext.test, client.test) convert to .tsx and keep
  passing unchanged in behavior.
- ZERO runtime behavior changes: this is types + filenames + config only.
  No logic edits, no styling edits, no renames of exports/routes.
- If a library lacks types: check first — @hello-pangea/dnd, lucide-react,
  axios, react-router ship their own; only if genuinely absent may you add ONE
  `declare module` in a `src/types.d.ts` (deviation-worthy) — no `@types/*`
  installs except `@types/react`/`@types/react-dom` which are required and
  explicitly allowed. `typescript` itself is allowed as devDependency.
  React 19: use @types/react v19.
- ESLint: `npm run lint` must not regress. If the current eslint setup can't
  parse TS without new packages, you may add `typescript-eslint` + parser as
  devDependencies (allowed), or minimally scope the lint script — note choice.

## Do NOT touch

`Program.cs`, any C# file, `simpleRank.sln`, `*.csproj`, `.env*`, `AGENTS.md`
(except nothing — leave it), `wwwroot/` (regenerated), Dokploy/deploy anything.
No git commits (staging status reporting OK). Do not kill the running dev
backend (port 5033) or vite (5173) processes.

## Verification (all proven green pre-migration except typecheck which is new)

```bash
cd /home/apple/simpleRank/simple-rank
npx tsc --noEmit        # exit 0, ZERO errors (or npm run typecheck)
npm test                # exit 0 (vitest)
npm run build           # exit 0, wwwroot/index.html emitted
~/\.dotnet/dotnet test simpleRank.sln   # exit 0 (untouched C# — sanity)
```

Live sanity: `curl -s -o /dev/null -w '%{http_code}' http://localhost:5173/` → 200
(dev server serves the renamed entry — if vite needs a restart to pick up
main.tsx/index.html changes it will do it itself; if the page 404s or the
module graph breaks, fix the wiring, don't leave it broken).

## Final step (required)

Re-run ALL four commands + the live curl, enumerate renamed/changed files
(`git status --porcelain` read-only), re-read this spec, report per
output_schema: counts (files renamed, interfaces/types added), verification
outputs, exhaustive deviations (every place you relaxed a type and why —
the deviations array is where strictness debt gets audited).