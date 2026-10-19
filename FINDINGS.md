# Library feedback

Findings from building Fivefold against the published `@jfrader/ui@0.9.1`. Each row records whether
the fix belongs in the library, in the consumer, or in documentation. "Observed" means reproduced
here; none of these is an upstream bug report yet.

## Verified as correct

| Check | Evidence |
| --- | --- |
| `GameHand` card buttons have the right accessible name | Playwright accessibility snapshot of a hand card: `button "Seven of hearts"` with the `GameCard` image named by `GameHandCard.label`. An axe `label-content-name-mismatch` run failed only because the app's card slot added a redundant `aria-label`; removing it (the library default is sufficient) made the audit clean. |
| `GameTable` with `teamCount={1}`, `seatPlacement="edge"` and four seats is stable at 1440/768 | `data-layout-fit="fitted"`, no page overflow, seats and plays readable. |
| `FlipGameCard` `flipped` semantics | Source: `flipped` true shows the back; the app labels the reveal explicitly and keeps the accessible name on the nearby `Pill`. |

## Findings

| Component / version | Owner | Friction | Evidence | Proposed change | Status |
| --- | --- | --- | --- | --- | --- |
| `person-avatar` / 0.9.1 | Library release | The source tree and README document `@jfrader/ui/person-avatar`, but the published package has no `./person-avatar` export. | `node_modules/@jfrader/ui/package.json` export map; `pnpm typecheck` fails on the subpath import. Fivefold uses `Avatar` for all seats. | Publish the subpath in the next release, or mark it source-only in the README until then. | Observed |
| `game-seat` / 0.9.1 | Library API + a11y | `handCount` renders a decorative `GameHand.Hidden` with `label=""` and `aria-hidden="true"`, so the public card count is not available to assistive tech. | `game-seat.tsx:62-63` documents "decorative"; `game-seat.tsx:167-168` passes the empty label. Fivefold supplies its own text `hand` instead. | Fixed in `jfrader-ui` PR #395 (`GameSeat handLabel`, GURI-2718 — Add an accessible hand label to GameSeat). Fivefold keeps the text workaround until the next release. | Fixed upstream, pending release |
| `game-table` / 0.9.1 | Library feature | Four played cards cannot share the felt at 390: each play region is ~106.7×135px, and four of them in a 275×327 surface overlap. The table reports `insufficient-space`; the consumer needs a compact board. | Playwright geometry at 390: play regions 107×135 at four positions; 6 pairwise collisions. At 1440 the region boxes also collide even though the 32px cards do not. | Tracked as GURI-2719 — Give GameTable a compact four-play trick layout. Add a compact/content-driven play footprint or a documented mobile reflow; keep the 32px card floor. | Tracked |
| `game-table` / 0.9.1 | Library docs/API | `data-layout-fit` lives on the measured inner surface, not the root, and there is no callback; a consumer needs a MutationObserver to react. | `game-table.tsx` frame/measurement code; `game-table.stories.tsx` queries the surface. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: mirror the attribute on the root or expose `onLayoutFitChange`; document the current location. | Tracked |
| `game-table` / 0.9.1 | Library docs | The default 6-seat Poker story and the large fixture do not show the common 4-seat free-for-all with `teamCount={1}`, edge placement, or a phone fallback. | `game-table.stories.tsx`; the fixed 680px board with `inside` placement needs ~900px, while `edge` fits at 680. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: add a minimal 4-seat free-for-all example and a "when to switch to a compact board" recipe. | Tracked |
| `game-hand` / 0.9.1 | Library docs / API discussion | No per-card `disabled`/`dimmed`; legality is whole-hand `disabled` only. The public `slots.card` + `data-hand-card` seam works, but the recipe is undocumented. | `game-hand.tsx` `GameHandCard`; `slots.card` forwards `data-hand-card`; Fivefold uses a module-level context and `aria-disabled`. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: add a story showing one illegal card, `aria-disabled`, and a blocked confirmation. | Tracked |
| `game-table` / 0.9.1 | Library docs | The `GameSeat` `handCount` fan can dominate seat height and push the table into `insufficient-space`; there is no note that the count can be text instead. | Fivefold's first 1440 composition was insufficient with the fan; replacing it with a text count and using edge placement fitted the same 680px board. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: document the text-count alternative in the seat composition guide. | Tracked |
| `game-rounds` / 0.9.1 | Library API/docs | Outcomes are `won/lost/pending`; a joint round lead and a game draw have no first-class representation. | `GameRoundsProps`; Fivefold maps joint lead to `won` with a different label, and the game result uses `GameResult` for the draw. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: document the mapping; consider a `draw`/`joint` outcome only with an API review. | Tracked |
| `flip-game-card` / 0.9.1 | Library docs | `flipped={true}` shows the back, which reads backwards if "flipped" is taken as "revealed". | `flip-game-card.tsx` prop documentation. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: make "true = face down" explicit in the prop table and an example. | Tracked |
| `game-hand` stories / 0.9.1 | Library docs | Story text still mentions a public `css` prop while the current public styling API is `sx`. | `game-hand.stories.tsx` usage text vs `GameHandProps` and AGENTS.md. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: correct the story text to `sx` and public slots. | Tracked |
| `breadcrumbs` / 0.9.1 | Library docs | Easy `href` items are anchors; the router integration pattern is not documented. | `breadcrumbs.tsx` `BreadcrumbsEntry.href`; Fivefold uses ordinary links. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: add a React Router example or document the client-interception pattern. | Tracked |
| `@emotion/react` / 0.9.1 | Library docs / consumer setup | Vite can load two `@emotion/react` instances through pnpm and warns at runtime; the published consumer guide does not mention deduping. | Dev server console: "You are loading @emotion/react when it is already loaded." Fivefold adds `resolve.dedupe` for React and Emotion. | Document `resolve.dedupe: ['react','react-dom','@emotion/react','@emotion/styled']` in the Vite consumer setup, alongside the existing tsconfig guidance. | Observed |

## Consumer-side fixes made in this repo (not library defects)

- The skip link, table actions, and hand are outside the measured felt; the table uses
  `seatPlacement="edge"` and a compact board under 600px. The library was not patched to force this.
- The `GameTable` `insufficient-space` observer was removed because switching the whole layout on
  and off oscillated. The compact board is a stable branch.
- The four plays render in one `TrickTray` inside `GameTable.Center` (and in the phone board)
  instead of `GameTable.Play` + `GameCardStack`: the play region footprint stays ~107px and the
  regions collide, which is the library feature above, not a consumer CSS bug. Revisit when the
  compact four-play layout lands.
- The result dialog's "Review scores" closes the dialog; it does not start a new game.
- A redundant `aria-label` on the hand-card slot caused axe `label-content-name-mismatch`; the
  library's `GameCard` label already names the button, so the override was removed.

## Follow-up

- **PR #395 — `GameSeat handLabel`** (GURI-2718 — Add an accessible hand label to GameSeat): open in
  jfrader-ui, pending CI/review.
- **GURI-2719 — Give GameTable a compact four-play trick layout**: the structural play-footprint
  issue, with the 390/1440 measurements.
- **GURI-2720 — Refresh game component docs and stories from the Fivefold integration**: the
  free-for-all table example, hand legality recipe, flip semantics, rounds mapping, stale `css`
  story text and Breadcrumbs router example.
