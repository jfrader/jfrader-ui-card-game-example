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
| `game-seat` / 0.9.1 | Library API + a11y | `handCount` renders a decorative `GameHand.Hidden` with `label=""` and `aria-hidden="true"`, so the public card count is not available to assistive tech. | `game-seat.tsx:62-63` documents "decorative"; `game-seat.tsx:167-168` passes the empty label. Fivefold supplies its own text `hand` instead. | Add a consumer-provided `handLabel`/`handCountLabel` and stop hiding the count when present; add a story + accessibility assertion. | Observed |
| `game-table` / 0.9.1 | Library feature | Four played cards cannot share the felt at 390: each play region is ~106.7×135px, and four of them in a 275×327 surface overlap. The table reports `insufficient-space`; the consumer needs a compact board. | Playwright geometry at 390: play regions 107×135 at four positions; 6 pairwise collisions. At 1440 the region boxes also collide even though the 32px cards do not. | Add a compact/`playCardWidth`/content-driven play footprint or a documented mobile reflow. Keep the 32px card floor. | Observed |
| `game-table` / 0.9.1 | Library docs/API | `data-layout-fit` lives on the measured inner surface, not the root, and there is no callback; a consumer needs a MutationObserver to react. | `game-table.tsx` frame/measurement code; `game-table.stories.tsx` queries the surface. | Mirror the attribute on the root or expose `onLayoutFitChange`; document the current location. | Observed |
| `game-table` / 0.9.1 | Library docs | The default 6-seat Poker story and the large fixture do not show the common 4-seat free-for-all with `teamCount={1}`, edge placement, or a phone fallback. | `game-table.stories.tsx`; the fixed 680px board with `inside` placement needs ~900px, while `edge` fits at 680. | Add a minimal 4-seat free-for-all example and a "when to switch to a compact board" recipe. | Observed |
| `game-hand` / 0.9.1 | Library docs / API discussion | No per-card `disabled`/`dimmed`; legality is whole-hand `disabled` only. The public `slots.card` + `data-hand-card` seam works, but the recipe is undocumented. | `game-hand.tsx` `GameHandCard`; `slots.card` forwards `data-hand-card`; Fivefold uses a module-level context and `aria-disabled`. | Add a story showing one illegal card, `aria-disabled`, and a blocked confirmation. Consider a typed per-card state only after that API review. | Observed |
| `game-table` / 0.9.1 | Library docs | The `GameSeat` `handCount` fan can dominate seat height and push the table into `insufficient-space`; there is no note that the count can be text instead. | Fivefold's first 1440 composition was insufficient with the fan; replacing it with a text count and using edge placement fitted the same 680px board. | Document the text-count alternative in the seat composition guide. | Observed |
| `game-rounds` / 0.9.1 | Library API/docs | Outcomes are `won/lost/pending`; a joint round lead and a game draw have no first-class representation. | `GameRoundsProps`; Fivefold maps joint lead to `won` with a different label, and the game result uses `GameResult` for the draw. | Document the mapping; consider a `draw`/`joint` outcome only with an API review. | Observed |
| `flip-game-card` / 0.9.1 | Library docs | `flipped={true}` shows the back, which reads backwards if "flipped" is taken as "revealed". | `flip-game-card.tsx` prop documentation. | Keep behavior; make "true = face down" explicit in the prop table and an example. | Observed |
| `game-hand` stories / 0.9.1 | Library docs | Story text still mentions a public `css` prop while the current public styling API is `sx`. | `game-hand.stories.tsx` usage text vs `GameHandProps` and AGENTS.md. | Correct the story text to `sx` and public slots. | Observed |
| `breadcrumbs` / 0.9.1 | Library docs | Easy `href` items are anchors; the router integration pattern is not documented. | `breadcrumbs.tsx` `BreadcrumbsEntry.href`; Fivefold uses ordinary links. | Add a React Router example or document the client-interception pattern. | Observed |

## Consumer-side fixes made in this repo (not library defects)

- The skip link, table actions, and hand are outside the measured felt; the table uses
  `seatPlacement="edge"` and a compact board under 600px. The library was not patched to force this.
- The `GameTable` `insufficient-space` observer was removed because switching the whole layout on
  and off oscillated. The compact board is a stable branch.
- The played cards use `cardWidth={theme.size.gameCardSm}`; the `GameTable` play region footprint
  stays ~107px, which is the library feature above, not a consumer CSS bug.
- The result dialog's "Review scores" closes the dialog; it does not start a new game.
