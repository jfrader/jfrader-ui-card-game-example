# Fivefold

A four-seat trick-taking card game and a reference application for composing
[`@jfrader/ui`](https://github.com/jfrader/jfrader-ui). Five rounds, five cards, five tricks: follow
suit, use the rotating trump and finish with the most points. The table is the product; every
component in it supports playing or understanding the game.

> Part of the `@jfrader/ui` examples: the [starter boilerplate](https://github.com/jfrader/jfrader-ui-boilerplate)
> and the [component library](https://github.com/jfrader/jfrader-ui).

| Desktop | Phone |
| --- | --- |
| ![Fivefold table on desktop](docs/screenshot.png) | ![Fivefold compact board on a phone](docs/screenshot-phone.png) |

## Play

- You are South. Ada (West), Milo (North) and Iris (East) are AI opponents with hidden hands.
- Each round deals five cards. The dealer rotates South → West → North → East → South.
- Follow the led suit if you can; otherwise play anything. Highest trump wins, otherwise the
  highest card of the led suit. The winner leads the next trick.
- Trump rotates hearts → diamonds → clubs → spades. Round five has no trump.
- One point per trick. Highest total after five rounds wins; a tie at the top is a draw.

Select a card and confirm with **Play card**. The optional 30-second timer auto-plays the lowest
legal card when it expires. Settings and stats live in this browser only.

## Run

```sh
pnpm install
pnpm dev
```

| Command | What it does |
| --- | --- |
| `pnpm dev` | Vite dev server |
| `pnpm typecheck` | TypeScript, no emit |
| `pnpm build` | Typecheck, then production build |
| `pnpm preview` | Serve `dist/` locally |
| `pnpm test` | Vitest engine and storage tests |
| `pnpm test:e2e` | Playwright browser scenarios |

## Architecture

```
src/engine/      Pure rules, deck, AI, reducer and selectors (no React, DOM, clock or storage)
src/app/         Controller, presentation mapping, persistence and the error boundary
src/table/       The stage: GameTable with seats and plays, HUD, turn status, hand dock, phone board, ready screen
src/panels/      Score table and scoreboard, settings, rules and result dialogs
src/components/  App shell, topbar and small shared pieces (stats, suit icon, difficulty)
src/pages/       Rules and not-found routes
src/content/     UI copy and accessible labels
src/rules/       Shared rules prose and examples
src/styles.ts    Shared style keys: breakpoints, reduced motion, forced colors, visually hidden, eyebrow
```

The engine is deterministic given a seed or an injected five-deck fixture. The controller owns
timing, pause reasons, selection, AI scheduling and persistence; renderers only map view models to
props. App-owned styles use `styled` from `@jfrader/ui` with theme callbacks — no CSS modules.
`vite.config.ts` dedupes React and Emotion so pnpm resolves one instance of each.

## Layout

From 768px up, one stage fills the viewport below the topbar. Round, trick and trump sit in the
board's top corners; turn status and Pause in the bottom corners; each played card lands in front of
its seat through `GameTable.Play`; the hand and its single action (Play card, Next trick or results)
sit in the dock. At 1100px and up the score rail sits beside the stage; below that, Scores opens a
drawer (a bottom sheet on phones). On phones `GameTable` leaves room only for 32px plays, so the
board is four columns, each a seat with its card in front of it.

## Built with `@jfrader/ui`

Game: `GameTable` (Seat, Play, Floating), `GameSeat`, `GameHand` (per-card state through
`slots.card`), `GameCard`, `FlipGameCard`, `GameActions`, `GameRounds`, `GameResult`, `CallOverlay`,
`DeckProvider`.

Overlays and feedback: `Dialog`, `Drawer`, `Toast`, `Alert`, `Tabs`, `Popover`, `Pill`, `Skeleton`.

Data and controls: `Timeline`, `SegmentedControl`, `Switch`, `EmptyState`, `Breadcrumbs`,
`ActionButton`, `Avatar`, `ThemeSwitch`, `Kbd`.

Layout and styling: `Container`, `Flex`, `Stack`, `Card`, `Divider`, `Prose`, `Button`, `styled`,
`ThemeProvider`.

The per-round score table is app code (`src/panels/score-table.tsx`): `GameScore` lists totals only.

The full composition contract is in [SPEC.md](SPEC.md). Published-package gaps found while building
this example are recorded in [FINDINGS.md](FINDINGS.md).

## Library feedback

Every integration gap is classified in [FINDINGS.md](FINDINGS.md): library API, library docs, or
consumer layout. The `GameSeat` accessible hand count is fixed in
[jfrader-ui PR #395](https://github.com/jfrader/jfrader-ui/pull/395); the phone-width four-play
gap is tracked in GURI-2719 — Give GameTable a compact four-play trick layout, and the docs/story
refresh in GURI-2720 — Refresh game component docs and stories from the Fivefold integration.

## Testing

`pnpm test` runs the pure engine and storage suites (37 tests). `pnpm test:e2e` drives the real UI in
Chromium on its own Vite server (port 4319): a completed trick, a hand that stays at full strength
when it is not your turn, a full five-round match, four viewports (1440×900, 1280×720, 768×1024,
390×844) with the hand kept in view, a fitted table with no seat/play overlap from 768px up, and axe
audits of the table (desktop and phone), rules and settings in both palettes. The build must pass
`pnpm typecheck` and `pnpm build`; screenshots live in `docs/` and are visually reviewed.

## License

MIT. See [LICENSE](LICENSE).
