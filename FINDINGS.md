# Library feedback

Findings from building Fivefold against the published `@jfrader/ui@0.9.1` (verified 2026-10-20). Each
row records whether the fix belongs in the library, in the consumer, or in documentation. "Observed"
means reproduced here; none of these is an upstream bug report yet.

The game stays on the published 0.9.1 package. Library `master` contains unreleased game work:
Wave 2 (`GURI-2787` — Games: control hand, pile and seat state axes) adds per-card
`disabled`/`dimmed`, `GameHand.Confirm` button props, pile disclosure and `remainingMs`; Wave 3
(`GURI-2793` — Games: size GameTable from its container) removes the private caps and fits four
plays at 390. The docs curation (`GURI-2814`) is also on master. Re-run this file after the next
library release and prune entries that no longer reproduce.

## Verified as correct

| Check | Evidence |
| --- | --- |
| `GameHand` card buttons have the right accessible name | Playwright accessibility snapshot of a hand card: `button "Seven of hearts"` with the `GameCard` image named by `GameHandCard.label`. An axe `label-content-name-mismatch` run failed only because the app's card slot added a redundant `aria-label`; removing it (the library default is sufficient) made the audit clean. |
| `GameTable` with `teamCount={1}`, `seatPlacement="edge"`, four seats and four `GameTable.Play` cards is stable at 1440×900, 1280×720 and 768×1024 | `data-layout-fit="fitted"`, no page overflow, no seat/play overlap (`tests/responsive.spec.ts`). |
| `FlipGameCard` `flipped` semantics | Source: `flipped` true shows the back; the trump flip is decorative and the trump name is text in its `Popover` trigger. |

## Findings

| Component / version | Owner | Friction | Evidence | Proposed change | Status |
| --- | --- | --- | --- | --- | --- |
| `person-avatar` / 0.9.1 | Library release | The source tree and README document `@jfrader/ui/person-avatar`, but the published package has no `./person-avatar` export. | `node_modules/@jfrader/ui/package.json` export map; `pnpm typecheck` fails on the subpath import. Fivefold uses `Avatar` for all seats. | Publish the subpath in the next release, or mark it source-only in the README until then. | Observed |
| `game-seat` / 0.9.1 | Library API + a11y | `handCount` renders a decorative `GameHand.Hidden` with `label=""` and `aria-hidden="true"`, so the public card count is not available to assistive tech. | `game-seat.tsx:62-63` documents "decorative"; `game-seat.tsx:167-168` passes the empty label. Fivefold shows the count as text in the seat's badges instead. | Fixed in `jfrader-ui` PR #395 (`GameSeat handLabel`, GURI-2718 — Add an accessible hand label to GameSeat). Fivefold keeps the text workaround until the next release. | Fixed upstream, pending release |
| `game-table` / 0.9.1 | Library feature | Four played cards cannot share the felt at phone width. The 107×135 play footprint measured earlier came from `GameCardStack`; plain `md` `GameCard`s in `GameTable.Play` size the regions to the card and fit (`data-layout-fit="fitted"`) at 1440×900, 1280×720 and 768×1024. At 390 the round felt is ~240px tall, so plays drop to the 32px floor and the table reports `insufficient-space`. | Playwright geometry in this repo's `responsive.spec.ts` (fit + zero seat/play overlap from 768 up) and the run-3 probe at 390: plays 32×47, three play/play overlaps. | Narrowed GURI-2719 — Give GameTable a compact four-play trick layout to phone widths: a compact play footprint or a documented column-board recipe. | Tracked, narrowed |
| `game-table` / 0.9.1 | Library docs | The felt's height is capped at 56% of the table container's block size, so play size depends on how much height the page gives the board, not only its width. A 448px-tall board at 1440×900 could not fit `md` plays; a 670px one could. | `layout-config.ts` `--game-table-max-height: … 56cqb …`; probes at 1440×900 before and after the stage layout. | Add to the free-for-all guide in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: give the board a definite height and keep hands/actions outside it. | Observed |
| `game-hand` / 0.9.1 | Library API | `disabled` both blocks interaction and passes `dimmed` to every `GameCard` (`opacity: 0.55`), so a hand that is only waiting for other players reads as washed out. There is no way to keep cards legible while not interactive. | `game-hand.tsx` passes `dimmed: disabled`; `game-card.tsx` `dimmedStyle = { opacity: 0.55 }`. Fivefold no longer passes `disabled`; it marks every card unavailable through the `slots.card` per-card recipe (`aria-disabled`, selection rejected by the controller). | Separate "not interactive" from "dimmed" (for example a `dimmed` prop on `GameHand`, defaulting to `disabled`). Needs an issue. | Observed |
| `game-hand` / 0.9.1 | Library API | The confirmation button is always `Button` `solid neutral`; `slotProps.confirm` is typed as `GameCardPartProps`, so a consumer cannot make "Play card" the screen's accent action without overriding styles. | `game-hand.tsx` renders `Button` with only `slotProps.confirm` spread; `GameHandProps['slotProps']['confirm']`. Fivefold keeps the default and uses the same style for its other in-dock action. | Accept `variant`/`tone`/`size` for the confirm action. Needs an issue. | Observed |
| `game-score` / 0.9.1 | Library candidate | `GameScore` lists one value per player; a per-round breakdown (players × rounds + total) has no component. | Fivefold's `src/game/panels/score-table.tsx`, used by the rail, the drawer and both result dialogs. | Consider a table layout for `GameScore` if another example needs it. | Observed |
| `game-table` / 0.9.1 | Library docs/API | `data-layout-fit` is present on both the measured root and the inner surface; there is no callback, so a consumer that needs to react still polls or observes. | `game-table.tsx` frame/measurement code; this repo's `tests/responsive.spec.ts:39` reads the root copy. | Document both locations and consider `onLayoutFitChange`; tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration. | Tracked |
| `game-table` / 0.9.1 | Library docs | The default 6-seat Poker story and the large fixture do not show the common 4-seat free-for-all with `teamCount={1}`, edge placement, or a phone fallback. | `game-table.stories.tsx`; the fixed 680px board with `inside` placement needs ~900px, while `edge` fits at 680. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: add a minimal 4-seat free-for-all example and a "when to switch to a compact board" recipe. | Tracked |
| `game-hand` / 0.9.1 | Library docs / API discussion | No per-card `disabled`/`dimmed`; legality is whole-hand `disabled` only. The public `slots.card` + `data-hand-card` seam works, but the recipe is undocumented. | `game-hand.tsx` `GameHandCard`; `slots.card` forwards `data-hand-card`; Fivefold uses a module-level context and `aria-disabled`. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: add a story showing one illegal card, `aria-disabled`, and a blocked confirmation. | Tracked |
| `game-table` / 0.9.1 | Library docs | The `GameSeat` `handCount` fan can dominate seat height and push the table into `insufficient-space`; there is no note that the count can be text instead. | Fivefold's first 1440 composition was insufficient with the fan; replacing it with a text count and using edge placement fitted the same 680px board. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: document the text-count alternative in the seat composition guide. | Tracked |
| `game-rounds` / 0.9.1 | Library API/docs | Outcomes are `won/lost/pending`; a joint round lead and a game draw have no first-class representation. | `GameRoundsProps`; Fivefold maps joint lead to `won` with a different label, and the game result uses `GameResult` for the draw. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: document the mapping; consider a `draw`/`joint` outcome only with an API review. | Tracked |
| `flip-game-card` / 0.9.1 | Library docs | `flipped={true}` shows the back, which reads backwards if "flipped" is taken as "revealed". | `flip-game-card.tsx` prop documentation. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: make "true = face down" explicit in the prop table and an example. | Tracked |
| `game-hand` stories / 0.9.1 | Library docs | Story text still mentions a public `css` prop while the current public styling API is `sx`. | `game-hand.stories.tsx` usage text vs `GameHandProps` and AGENTS.md. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: correct the story text to `sx` and public slots. | Tracked |
| `breadcrumbs` / 0.9.1 | Library docs | Easy `href` items are anchors; the router integration pattern is not documented. | `breadcrumbs.tsx` `BreadcrumbsEntry.href`; Fivefold uses ordinary links. | Tracked in GURI-2720 — Refresh game component docs and stories from the Fivefold integration: add a React Router example or document the client-interception pattern. | Tracked |
| `@emotion/react` / 0.9.1 | Library docs / consumer setup | Vite can load two `@emotion/react` instances through pnpm and warns at runtime; the published consumer guide does not mention deduping. | Dev server console: "You are loading @emotion/react when it is already loaded." Fivefold adds `resolve.dedupe` for React and Emotion. | Document `resolve.dedupe: ['react','react-dom','@emotion/react','@emotion/styled']` in the Vite consumer setup, alongside the existing tsconfig guidance. | Observed |

## Consumer-side fixes made in this repo (not library defects)

- Seat chips reserve a fixed 168×60 row footprint (100%×96 stacked) so GameTable's content-fit reserve does not move the felt when active/winner pills, points and card counts change. The page also reserves `scrollbar-gutter: stable`; `@jfrader/ui@0.9.1` still locks the document without compensating for the scrollbar, so opening Settings reflows the page. Library master already pads the scrollbar in `useScrollLock`; the CSS stays until the next release.
- The hand and its action live in a dock outside the measured felt; round, trick, trump, turn status
  and Pause are laid over the board's empty corners, so the felt gets the stage's full height. The
  stage fills the viewport below the topbar. The library was not patched to force this.
- Each play renders a plain `GameCard` in `GameTable.Play`; an unplayed seat renders a hidden
  face-down card of the same size so the geometry does not move as cards land.
- The `GameTable` `insufficient-space` observer was removed because switching the whole layout on
  and off oscillated. The phone board (under 600px) is a stable branch: four columns, each a seat
  with its card in front of it.
- The result dialog's "Review scores" closes the dialog; it does not start a new game.
- A redundant `aria-label` on the hand-card slot caused axe `label-content-name-mismatch`; the
  library's `GameCard` label already names the button, so the override was removed.

## Follow-up

- **PR #395 — `GameSeat handLabel`** (GURI-2718 — Add an accessible hand label to GameSeat): open in
  jfrader-ui, pending CI/review.
- **GURI-2719 — Give GameTable a compact four-play trick layout**: narrowed to phone widths; plain
  card plays fit from 768px up.
- **GURI-2720 — Refresh game component docs and stories from the Fivefold integration**: the
  free-for-all table example, hand legality recipe, flip semantics, rounds mapping, stale `css`
  story text and Breadcrumbs router example.
