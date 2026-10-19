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

- You are South. Nora (West), Eli (North) and Wren (East) are AI opponents with hidden hands.
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
src/table/       GameTable composition: seats, hand, trick piles, trump, round strip, mobile board
src/panels/      Scores/history, settings, rules and result dialogs
src/pages/       Rules and not-found routes
src/content/     UI copy and accessible labels
src/rules/       Shared rules prose and examples
```

The engine is deterministic given a seed or an injected five-deck fixture. The controller owns
timing, pause reasons, selection, AI scheduling and persistence; renderers only map view models to
props. App-owned styles use `styled` from `@jfrader/ui` with theme callbacks — no CSS modules.
`vite.config.ts` dedupes React and Emotion so pnpm resolves one instance of each.

## Built with `@jfrader/ui`

Game: `GameTable` (Seat, Center, Floating), `GameSeat`, `GameHand`,
`GameCard`, `GameActions`, `GameScore`, `GameRounds`, `GameResult`, `GameMarks`,
`FlipGameCard`, `DeckProvider`.

Overlays and feedback: `Dialog`, `Drawer`, `Toast`, `Alert`, `Tabs`, `Menu`, `Tooltip`, `Popover`,
`AnnouncementBar`, `CallOverlay`, `Progress`, `Skeleton`.

Data and controls: `Countdown`, `Timeline`, `MetricCard`, `SegmentedControl`, `Switch`,
`ScrollArea`, `EmptyState`, `Breadcrumbs`, `ActionButton`, `Avatar`, `ThemeSwitch`, `Kbd`.

Layout and styling: `Container`, `Flex`, `Stack`, `Card`, `Divider`, `Prose`, `Button`, `styled`,
`ThemeProvider`.

The full composition contract is in [SPEC.md](SPEC.md). Published-package gaps found while building
this example are recorded in [FINDINGS.md](FINDINGS.md).

## Library feedback

Every integration gap is classified in [FINDINGS.md](FINDINGS.md): library API, library docs, or
consumer layout. The `GameSeat` accessible hand count is fixed in
[jfrader-ui PR #395](https://github.com/jfrader/jfrader-ui/pull/395); the `GameTable` compact
four-play mode is tracked in GURI-2719 — Give GameTable a compact four-play trick layout, and the
docs/story refresh in GURI-2720 — Refresh game component docs and stories from the Fivefold
integration.

## Testing

`pnpm test` runs the pure engine and storage suites (38 tests). `pnpm test:e2e` drives the real UI in
Chromium: a completed trick, a full five-round match, four viewports (1440×900, 1280×720, 768×1024,
390×844) with the hand kept in view, and axe audits of the table (desktop and phone), rules and
settings in both palettes. The build must pass `pnpm typecheck` and
`pnpm build`; screenshots live in `docs/` and are visually reviewed.

## License

MIT. See [LICENSE](LICENSE).
