# Fivefold

Fivefold is a small, polished, genuinely playable four-seat trick-taking game and a public reference application for composing `@jfrader/ui`. Play five short rounds against Ada, Milo and Iris, follow suit, use the rotating trump to win tricks, and finish with the highest score. The table, not a component catalogue, is the product: every included component supports playing, understanding or reviewing the game. Ship a standalone MIT-licensed React application with no account, server or paid service.

## Goals and non-goals

- Complete a game in one sitting, with understandable decisions, explicit card confirmation, readable feedback and a useful final result.
- Demonstrate all specified game components and at least 35 distinct library component families across real user flows; providers and compound parts do not inflate that count.
- Support mouse, touch and keyboard; light/dark themes; desktop, tablet and phone.
- Keep rules independent of React, browser clocks, artwork, storage and animation. Make every match reproducible in tests.
- Reuse the sibling boilerplate's theme bootstrap, Inter imports, styled shell and token conventions, not its placeholder branding.
- Non-goals: multiplayer, accounts, matchmaking, betting, chat, partnerships, bidding, undo, saved-match recovery, replay controls, leaderboards, custom decks, audio, monetization, analytics or sophisticated search-based AI.
- This document is the only deliverable of the specification pass. Application scaffolding and dependency installation belong to implementation.

## Game rules

1. Seats and turn order are fixed: South = You (`south`, human), West = Ada (`west`), North = Milo (`north`), East = Iris (`east`). Names avoid the initials N, E, S and W, which seat avatars would otherwise show at the wrong compass points. The cyclic order is South → West → North → East → South. “Left of dealer” means the next seat in this order; include this definition in the rules rather than relying on spatial terminology.
2. You deal round 1. Dealers for rounds 1–5 are South, West, North, East, South. The first leaders are respectively West, North, East, South, West. After the first trick of a round, its winner leads the next trick. Play always continues in the same cyclic order from that leader.
3. Use a French deck of 52 unique cards, no jokers. Rank order is 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A. Ace is always high. Suits have no ranking for trick resolution.
4. Independently shuffle a complete deck for each round. Deal one card at a time, starting left of the dealer and continuing in turn order for five passes. Each seat receives five cards; the remaining 32 are unused, inaccessible and face down. Never carry leftover cards into the next round. Cards may recur between rounds, never within a round.
5. There are exactly five rounds and five tricks per round. Trump schedule: hearts, diamonds, clubs, spades, then no trump (`null`). There is no “breaking trump” restriction; any card may lead.
6. A lead establishes the led suit. A player holding any card of that suit must play one of them. Otherwise any held card is legal, including trump. There is no obligation to trump, overtrump or beat the current winning card.
7. Each trick has exactly one card from each seat, in cyclic order. If any trump was played, the highest trump wins; otherwise the highest card in the led suit wins. Off-suit non-trumps cannot win. No equal-card tie is possible with a valid deck. In no-trump, only led-suit cards can win.
8. Award one point immediately when the fourth card resolves the trick. Keep all four cards visible until the human activates “Next trick”; AI does not dismiss this review state. After trick 5, the button reads “Round results” (or “Final results” in round 5). A round therefore awards exactly five points, a game exactly 25. No bonuses or penalties.
9. Round results show each player's round points and cumulative points, plus the next trump. “Deal round N” advances rounds 1–4. After round 5, highest total wins; two or more joint highest totals make the match a draw, regardless of whether You are among them. A sole AI winner means a human loss; a sole South winner means a human win. List every joint leader on a draw.
10. Round-strip semantics are explicitly human-relative: `won` means South was joint or sole highest in that completed round, `lost` means below its highest score, `pending` means unfinished or future. The round chips under Your rounds read “Led” or “Behind”; the round result names a sole or joint lead. This is not a bonus or a game win.
11. AI cards are never exposed before play, including accessible names, DOM attributes, logs or result panels. Counts are public. This is presentation privacy, not anti-cheat: a local app cannot hide its memory from its owner.
12. Optional timing is 30 seconds per active turn, off by default. On expiry play the lowest legal card, with the same deterministic comparator used by normal AI. AI normally plays sooner. Timer events never bypass rule validation. There are no timers during trick review, round results or final results.
13. Pause freezes all AI and turn timers. Opening a modal, leaving `/`, hiding the document or pressing Pause adds a pause reason; resume only when all reasons clear. Returning from a hidden tab requires explicit Resume. No catch-up plays. Preserve remaining time rather than resetting it; disabling the timer removes the deadline, enabling starts a full duration on the next turn.
14. Hints never change legality. Auto-sort changes display order only. Difficulty changes take effect on the next scheduled AI turn, canceling and rescheduling any pending AI callback. New game requires confirmation if an unfinished game exists; abandoning does not affect stats. Reload starts at the ready screen, not a restored match.
15. Invalid card ID, wrong actor, duplicate/stale turn request, invalid phase and failure to follow suit leave state unchanged with a typed error. Bad deck input fails before a game is started. Double-clicks and racing timer/manual requests cannot play twice.

## Experience and routes

| Route/state | Experience |
| --- | --- |
| `/`, ready | The stage shows a felt hero: card fan, title, one-line rules, difficulty control, Start game and How to play, and local played/won/win rate after the first match. No invented loading delay or AI network status. |
| `/`, playing | One stage fills the viewport: round/trick and trump in the board's top corners, turn status and Pause at the bottom, each play in front of its seat, the hand and Play card in the dock. |
| `/`, trickComplete | Four revealed cards; the winner's card and seat are ringed and labelled; Next trick takes Play card's place in the dock. |
| `/`, roundComplete | Dialog with the score table, your lead state, next trump and Deal round N. Closing it leaves Round results in the dock; it does not deal automatically. |
| `/`, gameComplete | GameResult with winner/draw, the final score table, local stats, Play again and Review scores. Result can be dismissed and reopened from the dock. |
| `/rules` | Shareable full rules page with Breadcrumbs, Prose, examples of following suit and trump, keyboard instructions and Return to table. Reuses the same rules content as the quick-rules dialog. |
| unmatched route | EmptyState “Page not found” and router link to `/`. No full reload for navigation. |

Global AppShell contains skip link, Topbar (Fivefold mark and home link, Table and Rules links, New game and Settings commands, ThemeSwitch), main landmark and Footer (MIT/source link from configured site metadata). Keep active game/controller above route outlet so visiting rules does not discard a hand. Use BrowserRouter; document static-host SPA fallback for direct `/rules` navigation. Route changes update title and focus the page heading/main, without automatically moving focus during turns.

First visit: the ready screen carries the one-line rules and How to play. Start is always explicit. No onboarding tour or first-run banner.

Settings Drawer uses difficulty SegmentedControl and switches for legal-card hints, timer and auto-sort. Defaults: normal, hints on, timer off, auto-sort on. It also contains local stats and a confirmed Reset stats ActionButton. Apply settings immediately with the timing exceptions above; a failed persistence write leaves usable in-memory settings and a single warning Toast.

Quick-rules Dialog opens from the ready screen without route navigation; the Rules link opens the full page and pauses the match. Below 1100px Scores opens a Drawer (from the bottom on phones); at 1100px and up an inline rail beside the stage holds Tabs for Scores and Log. Never mount duplicate interactive panel instances. Pause/Resume and (below 1100px) Scores are GameActions in the board's bottom corner.

Empty/loading/errors: log EmptyState before the first play; real Suspense fallback with Skeleton for lazy `/rules` only; a warning Toast on failed storage writes and on an illegal or out-of-turn card (one at a time, cleared by your next valid move); top-level render error boundary with Alert and Reload button. Do not pretend local dealing or AI requires a spinner. Keep the loading fallback out of the live table and preserve the shell.

Mobile (under 600px) uses a column board: four columns, each a seat with its card in front of it, then the status row and the hand with its action. Below 360px the columns go two by two. Scores and settings open as bottom sheets; dialogs remain above table clipping. No hover-only instructions. There is no orientation lock.

## Component coverage

Imports below name the published entry point. Compound parts share their family's entry point. “Core” participates directly in the match; “support” is a real auxiliary flow. Coverage is across reachable states, not simultaneous rendering. `styled`, hooks and providers are not counted as rendered families.

| Component | Import path | Where / why | Key props or composition | Role |
| --- | --- | --- | --- | --- |
| GameTable | `@jfrader/ui/game-table` | Four-seat board from 600px up; seats on the felt edge, plays in front of them | `players={4}`, `seats`, `teamCount={1}`, `turnDirection="clockwise"`, `surface="match"`, `seatPlacement="edge"`; Seat, Play, Floating parts | Core |
| GameSeat | `@jfrader/ui/game-seat` | Seat chip: name, dealer or turn badge, card count, total points, turn timer ring | `name`, `avatar`, `badges`, `points`, optional `turn` | Core |
| GameHand | `@jfrader/ui/game-hand` | Human selection and confirm | `cards`, `playLabel`, `value`, `onValueChange`, `onPlayIntent`, per-card availability through `slots.card` (no whole-hand `disabled`) | Core |
| GameCard | `@jfrader/ui/game-card` | Played cards, the trump flip back, the ready fan and rules examples | `value`, `label`, `face`, `size` | Core |
| GameActions | `@jfrader/ui/game-actions` | Pause/Resume and, below 1100px, Scores | `actions`, `label`, `size`, `variant` | Core |
| GameRounds | `@jfrader/ui/game-rounds` | Your rounds: led or behind per round | `label`, `rounds`, `outcomeLabels` | Core |
| GameResult | `@jfrader/ui/game-result` | Match conclusion | `outcome`, `title`, `summary`, `actions`, `celebration` | Core |
| FlipGameCard | `@jfrader/ui/flip-game-card` | Trump reveal in the HUD at each new round | custom `front` and `back`, `flipped`, `size="sm"` | Core |
| CallOverlay | `@jfrader/ui/call-overlay` | Round start call on the empty felt | `label`, controlled `open`, `onOpenChange`, `tone` | Core |
| Countdown | `@jfrader/ui/countdown` | Seconds left on your turn when the timer is on | `target`, `variant="compact"`, `units={['seconds']}`, `label={null}`, `aria-label`, `announceCompletion={false}` | Core |
| DeckProvider | `@jfrader/ui/deck` | Resolve French artwork for all cards | `default="french"`, `backLabel="Face-down card"` | Core provider |
| Dialog | `@jfrader/ui/dialog` | Rules, results and destructive confirmation | `open`, `onOpenChange`; Content → Panel → Title/Description, Close | Support |
| Drawer | `@jfrader/ui/drawer` | Settings and, below 1100px, scores; from the bottom on phones | `open`, `onOpenChange`, `side`, `draggable`; Content/Panel/Header/Body/Footer/Title/Close | Support |
| Toast | `@jfrader/ui/toast` | Illegal or out-of-turn card; storage warnings | Provider `viewport="default"`; `useToast().toast({title, tone})`, `dismiss` | Support |
| Alert | `@jfrader/ui/alert` | Render error boundary | `tone`, `title` | Support |
| Tabs | `@jfrader/ui/tabs` | Scores / Log | `value`, `onValueChange`; List/Tab/Panel | Support |
| Popover | `@jfrader/ui/popover` | Trump badge explains current trump/no-trump | `triggerLabel`, `label`, `content` | Support |
| Pill | `@jfrader/ui/pill` | Seat turn and trick-winner badges; round lead in the round result | `tone`, children | Core |
| Timeline | `@jfrader/ui/timeline` | Public play/trick log | `events`, `now`, `maxHeight`, `scrollToNew` | Support |
| SegmentedControl | `@jfrader/ui/segmented-control` | Difficulty on the ready screen and in settings | `options`, `value`, `onValueChange`, `label` | Support |
| Switch | `@jfrader/ui/switch` | Hints, timer and sort | `label`, `description`, `checked`, `onCheckedChange` | Support |
| ScrollArea | `@jfrader/ui/scroll-area` | Hand fan overflow on narrow screens and high zoom | `orientation="horizontal"`, `scrollbars="native"`, `fade={0}` | Core |
| Skeleton | `@jfrader/ui/skeleton` | Actual lazy rules fallback | `width`, `height` | Support |
| Kbd | `@jfrader/ui/kbd` | Rules keyboard reference | native children: Tab, Enter, Space, Escape | Support |
| EmptyState | `@jfrader/ui/empty-state` | Empty log; unknown route | `title`, `description`, `action`, `headingLevel` | Support |
| Breadcrumbs | `@jfrader/ui/breadcrumbs` | Rules navigation hierarchy | compound items with router links | Support |
| ActionButton | `@jfrader/ui/action-button` | Confirmed local-stat reset | `label`, `pendingLabel`, `successLabel`, `errorLabel`, `onAction` | Support |
| Avatar | `@jfrader/ui/avatar` | Seat identity; hosts the turn timer ring | `name`, `size` | Core |
| ThemeSwitch | `@jfrader/ui/theme-switch` | Global palette selection | `label`, `iconOnly`, `value`, `onValueChange` | Support |
| Container | `@jfrader/ui` | Shell and topbar width bounds | `size="xl"`, `paddingInline` | Support |
| Flex | `@jfrader/ui` | Rules example rows and footer links | children; token-based styling | Support |
| Stack | `@jfrader/ui` | Rules examples and the lazy fallback | children; token-based styling | Support |
| Card | `@jfrader/ui` | Rule examples | children | Support |
| Divider | `@jfrader/ui` | Footer | native/declared props only | Support |
| Prose | `@jfrader/ui` | Rules text | semantic heading/list children | Support |
| Button | `@jfrader/ui` | Start, How to play, topbar commands, Next trick/results, deal, play again, done, reload | children, `onClick`, `type`, `variant`, `tone`, `size`, `startIcon` | Core/support |
| ThemeProvider | `@jfrader/ui` | Typed styled theme context | children; no palette prop assumed | Support provider |

Deliberately omitted: PersonAvatar (exists in the source tree and README, but is absent from the published `@jfrader/ui@0.9.1` export map; use Avatar and record the package gap), UserMenu (no user/account), chat widgets (no chat), network/presence widgets (local opponents never go offline), CardFlights (not needed to teach selection/play; avoids a second animation subsystem), rewards/store/payment components (no economy), form libraries and data grids (no corresponding workflow). Retired in the run-3 redesign: GameCardStack (its fixed play footprint collides on the felt; plain GameCards in `GameTable.Play` fit), GameScore (totals only; the per-round score table is app code), GameMarks (repeated per-round rows; the table carries the same numbers), MetricCard (one compact stats row is used everywhere), Menu and Tooltip (the topbar shows its commands), AnnouncementBar (the ready screen carries the rules line), Progress (the HUD shows Trick n/5). Do not add them to reach a quota. GameSeat `offline` and `chat` are unused; `turned` is not a turn flag. Do not count library internals toward the coverage target.

## Architecture

### Runtime and tooling

Use pnpm with a committed lockfile, ESM, strict TypeScript and Node `>=22.12.0`. Baseline versions read from the sibling boilerplate: React/react-dom `^19.3.1`, `@jfrader/ui` and `@jfrader/tokens` `^0.9.1`, `@fontsource/inter` `^5.3.0`; Vite `^8.3.4`, plugin-react `^6.1.2`, TypeScript `^7.0.2`, React types `^19.3.0`. Add react-router-dom `^7.18.4`, lucide-react `^1.59.0`, Vitest `^5.0.3`, `@playwright/test` `^1.64.1` (router/icons/Playwright registry versions checked during specification). These are a compatible baseline to verify at implementation, not permission to install prereleases. Pin resolved versions in the lockfile. Published package exports/types must pass the smoke build; source-checkout APIs may be ahead of the published artifact. No `file:` dependencies in the public repository.

No additional runtime dependency, state library, backend, auth or analytics. Tests use the listed dev dependencies. Run axe through a pinned audit script injected by the Playwright QA runner or the axe browser extension; do not silently add `@axe-core/playwright`/`axe-core` to the manifest. Record axe version and results. An automated vendored runner is an explicit future dependency decision, not required scaffolding.

### Boundaries

- `src/engine` owns legal moves, rank comparison, turn order, scoring, AI decisions and game transitions. No React, `@jfrader/ui`, browser APIs, storage, clocks, random globals or localized copy.
- `src/app/use-game-controller.ts` owns scheduling, pause reasons, effect cleanup, selected-card state, guarded dispatch, runtime clock and persistence coordination. It calls the engine; it does not reimplement rules.
- `src/app/presentation.ts` maps engine results to localized labels and library-compatible view data. Human hand sorting calls engine `sortHand`; legal IDs come only from `legalMoves`.
- `src/table` and `src/panels` are controlled renderers. Neither schedules turns, reads storage nor mutates a match. They consume shared view contracts and callbacks.
- `src/app.tsx` composes the controller, router, shell and overlays. Theme and match state outlive route elements. Use built-in React state/reducer/context only where genuinely shared.
- `src/content/en.ts` owns all UI strings, rank/suit names and accessible labels. `src/config.ts` owns locale (`en` initially), number/date formatting configuration, timer/AI delay, layout breakpoints, source URL and storage keys. Use `Intl.NumberFormat`, `Intl.DateTimeFormat` and `Intl.PluralRules`; never hand-roll locale/date data. Rules prose is centralized in `src/rules/content.tsx`.
- Style with `styled` from `@jfrader/ui`, module-level definitions and `({ theme }) => …`. No CSS modules, global app stylesheet, direct Emotion imports or invented token names. Use logical properties, semantic tokens and explicit responsive sizing constants. No dynamic creation of styled components inside render.

### Persistence

Use versioned keys: `fivefold.settings.v1`, `fivefold.stats.v1`; palette key `fivefold.theme.v1` is duplicated deliberately in pre-paint bootstrap and `theme.ts`, with a test asserting equality. Store settings/stats as validated JSON, theme as `light`/`dark`. Invalid, absent, unavailable or corrupt data falls back independently; never clear unrelated keys. Stats are local to this browser. No match/deck/hand persistence.

Stats increment only upon the single transition into `gameComplete`: games played +1; games won +1 only for a sole South victory. Draws are played but not won. Store `lastCountedGameId` with counters and guard effects against StrictMode duplicates. Reset is permitted only in ready/gameComplete to avoid counting the current completion again. Storage failure must not stop play. Cross-tab write reconciliation is out of scope; document that last writer wins.

## File map and parallel ownership

Paths are relative to the repository root. Ownership is exclusive, including tests. Primary creates/finalizes shared contracts before the three writers start. Writers may read other sets but must not edit them or add undeclared shared files.

| Owner | Exact files |
| --- | --- |
| Engine writer | `src/engine/constants.ts`, `src/engine/deck.ts`, `src/engine/rules.ts`, `src/engine/ai.ts`, `src/engine/reducer.ts`, `src/engine/selectors.ts`, `src/engine/index.ts`, `src/engine/deck.test.ts`, `src/engine/rules.test.ts`, `src/engine/ai.test.ts`, `src/engine/reducer.test.ts` |
| Table UI writer | `src/table/game-board.tsx`, `src/table/compact-board.tsx`, `src/table/ready-screen.tsx`, `src/table/hud.tsx`, `src/table/turn-bar.tsx`, `src/table/seat-chip.tsx`, `src/table/seat-play.tsx`, `src/table/round-call.tsx`, `src/table/player-hand.tsx`, `src/table/table.styles.ts` |
| Shell/panels/rules writer | `src/components/app-shell.tsx`, `src/components/topbar.tsx`, `src/components/footer.tsx`, `src/components/stat-record.tsx`, `src/components/suit-icon.tsx`, `src/components/difficulty-control.tsx`, `src/styles.ts`, `src/panels/score-table.tsx`, `src/panels/scoreboard.tsx`, `src/panels/sheet-side.ts`, `src/panels/dialog.styles.ts`, `src/panels/celebration.tsx`, `src/panels/settings-drawer.tsx`, `src/panels/rules-dialog.tsx`, `src/panels/results-dialog.tsx`, `src/panels/new-game-dialog.tsx`, `src/pages/rules.tsx`, `src/pages/not-found.tsx`, `src/rules/content.tsx` |
| Primary integration | `package.json`, `pnpm-lock.yaml`, `index.html`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `LICENSE`, `README.md`, `src/main.tsx`, `src/app.tsx`, `src/theme.ts`, `src/config.ts`, `src/content/en.ts`, `src/contracts.ts`, `src/engine/types.ts` (frozen), `src/app/use-game-controller.ts`, `src/app/use-media-query.ts`, `src/app/presentation.ts`, `src/app/storage.ts`, `src/app/storage.test.ts`, `src/app/error-boundary.tsx`, `tests/game.spec.ts`, `tests/accessibility.spec.ts`, `tests/responsive.spec.ts`, `tests/fixtures.ts` |

`SPEC.md` remains the approved contract; changes require primary coordination. There is no separate scaffold ownership for the three writers.

Import graph and component entry contracts:

- `engine/index.ts` exports every domain type and public function listed below, plus `TURN_ORDER`, `TRUMPS`, `rankStrength`, `sortHand`, `currentPlayer`, `roundScores`, `roundOutcomes`, `lowestLegalCard`, `gameReducer`. Internal engine imports stay inside `engine/`.
- Primary imports only `../engine` from its controller/presentation modules. Engine selectors, not renderers, compute scores, legal IDs and outcomes.
- Table imports `../contracts`, `../content/en`, `../config`, library entry points and its own files. Domain types may be imported type-only via contracts; no engine runtime calls in table renderers.
- Panels/shell import the same contracts/content/config, theme types and their own files, never table/controller internals. Rules content is shared only within this ownership set.
- Primary imports `GameBoard` from `src/table/game-board.tsx`; `AppShell`, `SettingsDrawer`, `RulesDialog`, `ResultsDialog`, `NewGameDialog`, `ScoreHistory`, and route pages from their named paths. Use named exports, except a React.lazy adapter may turn `RulesPage` into a default dynamically.
- `GameBoard({ view, selectedCardId, onSelectCard, onPlayCard, onCommand })`; `view: TableView`, callbacks `(id: string | null) => void`, `(id: string) => void`, `(command: TableCommand) => void` respectively. `TableCommand = 'start' | 'pause' | 'resume' | 'continue' | 'results' | 'scores' | 'rules' | 'settings'`.
- `ScoreHistory({ view, now })` receives `ScoreHistoryView` and epoch milliseconds. `SettingsDrawer({ open, onOpenChange, settings, stats, canResetStats, onSettingsChange, onResetStats })`; reset callback returns `Promise<void>` and may reject. `RulesDialog({ open, onOpenChange })`. `NewGameDialog({ open, onOpenChange, onConfirm })`. `ResultsDialog({ open, onOpenChange, view, onContinue, onNewGame })`, with round/game discriminant in `view`.
- `AppShell({ theme, onThemeChange, onCommand, children })`; shell command union is `'rules' | 'settings' | 'new-game'`; `/rules` navigation uses Router links, quick rules uses the callback. `RulesPage` and `NotFoundPage` have no match props.

Primary freezes these view shapes in `contracts.ts` before delegation: `CardView = { id: string; label: string; value: { deck: 'french'; suit: Suit; rank: Rank }; legal: boolean }`; `SeatView = { key: PlayerKey; name: string; isMe: boolean; handCount: number; totalPoints: number; roundPoints: number; dealer: boolean; active: boolean }`; `TableView` contains `phase: 'ready' | GameState['phase']`, `seats: readonly SeatView[]`, `hand: readonly CardView[]`, `plays: readonly { playerKey: PlayerKey; card: CardView; order: number }[]`, `roundNumber: number`, `trickNumber: number`, `completedTricks: number`, `trump: Suit | null`, `rounds: readonly { key: string; label: string; outcome: 'won' | 'lost' | 'pending' }[]`, `paused: boolean`, `pauseLabel: string | null`, `deadline: number | null`, `now: number`, `winnerLabel: string | null`, `canPlay: boolean`, `settings: Settings`.

`TableView` also requires `ledSuit: Suit | null` (current trick's first card suit, otherwise null) for accessible follow-suit feedback; the presenter supplies it, the hand does not infer rules. `ScoreHistoryView = { totals: readonly { key: PlayerKey; label: string; value: number; stage?: string }[]; rounds: readonly { roundNumber: number; scores: Scores }[]; events: readonly { id: string; at: number; actor?: string; title: string; detail?: string }[] }`. `ResultsView` is `{ kind: 'round'; roundNumber: number; rows: ScoreHistoryView['totals']; totals: ScoreHistoryView['totals']; nextTrump: Suit | null } | { kind: 'game'; outcome: 'won' | 'lost' | 'draw'; winnerNames: readonly string[]; rows: ScoreHistoryView['totals']; stats: Stats }`. All properties are required except those explicitly marked optional; ready values are empty collections except the four seats and five pending rounds, zero progress and round 1 preview. Ready is controller state `game === null`, not an invented engine phase.

## Domain model

The following is the exact engine contract, not library card types. Arrays/records are immutable by convention and readonly types; engine operations allocate replacements. String ranks deliberately match French artwork keys.

```ts
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';
export type PlayerKey = 'south' | 'west' | 'north' | 'east';
export type Difficulty = 'easy' | 'normal' | 'hard';
export type Scores = Readonly<Record<PlayerKey, number>>;
export interface Card { readonly id: string; readonly suit: Suit; readonly rank: Rank }
export interface Player {
  readonly key: PlayerKey;
  readonly name: string;
  readonly isMe: boolean;
  readonly kind: 'human' | 'ai';
}
export interface TrickPlay { readonly playerKey: PlayerKey; readonly card: Card }
export interface Trick {
  readonly number: number;
  readonly leader: PlayerKey;
  readonly plays: readonly TrickPlay[];
  readonly winner: PlayerKey | null;
}
export interface RoundState {
  readonly number: number;
  readonly dealer: PlayerKey;
  readonly trump: Suit | null;
  readonly hands: Readonly<Record<PlayerKey, readonly Card[]>>;
  readonly undealt: readonly Card[];
  readonly completedTricks: readonly Trick[];
  readonly currentTrick: Trick;
}
export type GamePhase = 'playing' | 'trickComplete' | 'roundComplete' | 'gameComplete';
export interface GameState {
  readonly id: string;
  readonly seed: number;
  readonly revision: number;
  readonly phase: GamePhase;
  readonly players: readonly Player[];
  readonly decks: readonly (readonly Card[])[];
  readonly completedRounds: readonly RoundState[];
  readonly round: RoundState;
  readonly log: readonly LogEvent[];
}
export interface Settings {
  readonly difficulty: Difficulty;
  readonly showLegalHints: boolean;
  readonly turnTimer: boolean;
  readonly autoSortHand: boolean;
}
export interface Stats {
  readonly gamesPlayed: number;
  readonly gamesWon: number;
  readonly lastCountedGameId: string | null;
}
export type LogEvent = {
  readonly id: string;
  readonly at: number;
  readonly roundNumber: number;
} & (
  | { readonly kind: 'round-start'; readonly dealer: PlayerKey; readonly trump: Suit | null }
  | { readonly kind: 'card-played'; readonly playerKey: PlayerKey; readonly card: Card; readonly automatic: boolean }
  | { readonly kind: 'trick-won'; readonly playerKey: PlayerKey; readonly trickNumber: number }
  | { readonly kind: 'round-end'; readonly scores: Scores }
  | { readonly kind: 'game-end'; readonly winners: readonly PlayerKey[]; readonly scores: Scores }
);
export interface CreateGameOptions {
  readonly id: string;
  readonly seed: number;
  readonly at: number;
  readonly decks?: readonly (readonly Card[])[];
}
export type GameAction =
  | { readonly type: 'PLAY_CARD'; readonly gameId: string; readonly expectedRevision: number;
      readonly playerKey: PlayerKey; readonly cardId: string; readonly at: number; readonly automatic: boolean }
  | { readonly type: 'CONTINUE_TRICK'; readonly gameId: string; readonly expectedRevision: number; readonly at: number }
  | { readonly type: 'ADVANCE_ROUND'; readonly gameId: string; readonly expectedRevision: number; readonly at: number };
export type RuleError = 'stale-action' | 'wrong-phase' | 'wrong-player' | 'unknown-card' | 'must-follow-suit';
export type Transition = { readonly ok: true; readonly state: GameState }
  | { readonly ok: false; readonly state: GameState; readonly error: RuleError };
export interface GameScoreResult {
  readonly totals: Scores;
  readonly winners: readonly PlayerKey[];
  readonly outcome: 'won' | 'lost' | 'draw';
  readonly final: boolean;
}
```

Card IDs are `${suit}-${rank}`. A round is numbered 1–5; a trick 1–5. `completedTricks` includes a resolved `currentTrick` during review, identified by number; selectors sum `completedTricks` only, never add the display copy again. While playing, current trick is not in that array. At roundComplete/gameComplete the final trick remains visible and is already in completedTricks. Completed rounds exclude the current round. `currentPlayer` is derived from leader + plays length and returns null outside playing; never store a second turn counter. A completed trick has four plays and a non-null winner. All scores are derived, not duplicated in mutable state.

## Engine

### Public functions

```ts
createGame(options: CreateGameOptions): GameState
legalMoves(state: GameState, playerKey: PlayerKey): readonly Card[]
playCard(state: GameState, action: Extract<GameAction, { type: 'PLAY_CARD' }>): Transition
resolveTrick(plays: readonly TrickPlay[], trump: Suit | null): PlayerKey
advanceRound(state: GameState, action: Extract<GameAction, { type: 'ADVANCE_ROUND' }>): Transition
chooseAiCard(state: GameState, playerKey: PlayerKey, difficulty: Difficulty): Card | null
scoreGame(state: GameState): GameScoreResult
gameReducer(state: GameState, action: GameAction): Transition
currentPlayer(state: GameState): PlayerKey | null
roundScores(round: RoundState): Scores
roundOutcomes(state: GameState): readonly ('won' | 'lost' | 'pending')[]
sortHand(cards: readonly Card[]): readonly Card[]
lowestLegalCard(state: GameState, playerKey: PlayerKey): Card | null
rankStrength(rank: Rank): number
```

`legalMoves` returns empty for wrong player or non-playing phases. `resolveTrick` is the pure comparison primitive for 1–4 distinct valid plays, returning the currently winning player; it throws RangeError on an empty/invalid list. This allows hard AI to ask whether appending a legal card beats the current winner without duplicating rules. At four plays, playCard resolves, appends the trick once, logs card + winner and enters trickComplete in one atomic successful transition.

`CONTINUE_TRICK` only accepts trickComplete: if fewer than five completed tricks, create an empty next trick with winner as leader and enter playing; after the fifth, log round-end and enter roundComplete, or gameComplete plus game-end for round 5. `ADVANCE_ROUND` only accepts roundComplete and rounds 1–4: archive round, deal next prepared deck, rotate dealer, reset per-round state, log round-start. No action after gameComplete succeeds. New game is a controller replacement with `createGame`, not a reducer action accepting arbitrary replacement state. Pause/settings/tick/selection are not engine actions.

All accepted actions increment revision once; rejected actions retain the exact previous reference and revision. Validate gameId and expectedRevision before phase or card checks. The reducer may use an exhaustive discriminant switch. The controller stores error feedback separately and commits only successful transitions.

### Determinism and shuffle

- `createGame` accepts a finite unsigned 32-bit seed, nonempty game ID and supplied timestamp; validates them. UI obtains ID/seed from Web Crypto outside the engine. `at` is epoch milliseconds supplied by the controller and merely labels logs; rules never depend on it.
- Canonical deck order is suits hearts, diamonds, clubs, spades, each with ranks 2 through A. Generate five independent shuffled copies with Fisher–Yates using one local Mulberry32 generator initialized from seed, consuming the sequence continuously across the five shuffles. Specify standard Mulberry32 unsigned 32-bit arithmetic (`state += 0x6D2B79F5`, integer multiply/xor mixing, unsigned result divided by 2^32); lock known seed/deck snapshots in tests. No new random dependency is necessary for a non-cryptographic game shuffle.
- Optional `decks` bypasses shuffle entirely and must contain exactly five complete ordered permutations of the canonical 52 cards. Validate suit/rank/ID consistency, missing/duplicate cards and length. Copy input; no mutation and no partial acceptance. This is the principal fixture seam.
- Easy AI samples deterministically from sorted legal cards using a fresh Mulberry32 value seeded with `(state.seed ^ Math.imul(state.revision + 1, 0x9E3779B9)) >>> 0`; multiply by legal count and floor. Repeating a query yields the same answer and does not mutate state. No promise of cryptographic fairness or uniform complete-deck coverage across all 32-bit seeds.
- Stable “lowest” comparator is rank strength ascending, then suit order hearts/diamonds/clubs/spades; card IDs break malformed ties only after validation. Display sort uses suit order first, then rank. Neither mutates the actual hand/deal order.
- Event IDs combine game ID, revision and within-action event ordinal; create event uses revision zero. Restarting cannot collide when UI supplies a new game ID. Events include only played cards, not deals.

### Invariants and required unit cases

Within a round: remaining hands + cards in completed tricks + unresolved current-trick cards + undealt = exactly 52 unique cards. The review copy of currentTrick is excluded from this count. Hands shrink exactly once per successful play. Sum of scores equals resolved-trick count across rounds. No UI dependency or ambient randomness/clock appears in engine imports.

1. Canonical deck contains all 52 valid unique IDs; input decks are copied.
2. Same seed/options/actions yield deeply equal state/log; different supplied timestamps affect only event times.
3. Golden seeded shuffle/deal snapshot; five cards each, 32 unused.
4. Reject duplicate, missing, inconsistent and incorrectly sized supplied decks.
5. Round 1 dealer South and first leader West; deal order starts West.
6. Empty trick allows every held card.
7. Follow suit restricts legal moves even when a trump could win.
8. Void in led suit permits any held card.
9. Highest led-suit card beats all off-suit non-trumps.
10. Lowest trump beats highest led-suit non-trump; highest of several trumps wins.
11. No-trump ignores suit hierarchy and ace is high.
12. Subsequent actor is cyclic from actual trick leader; winner leads next trick.
13. Fourth play resolves/scores once and locks play until continuation.
14. All five dealer/first-leader/trump rotations are correct, including round 5 no-trump.
15. Fifth trick → review → roundComplete; advance deals fresh hands/reset round points, keeps totals.
16. Fifth round → gameComplete; 25 points total; no sixth round.
17. Sole human winner, sole AI winner and 2/3/4-way top ties, including draw without South.
18. Wrong actor, absent card, off-suit while holding suit and duplicate card requests reject without mutation.
19. Stale revision/game ID callbacks reject after play/restart; repeated continue/advance cannot duplicate scores/logs.
20. All AI difficulties return only legal moves across seeded full games; out-of-turn returns null.
21. Easy AI repeatability; normal lowest legal comparator; hard cheapest current winner/lowest losing discard/non-trump preference.
22. Hard AI cannot see future or opponent hands: changing unseen hands without changing its legal options/public trick does not affect its choice.
23. Completed-trick conservation and point invariants checked after every action in many seeded full matches.
24. Freeze prior input state and assert every public operation is nonmutating.
25. Round-strip joint-lead outcome and game draw semantics differ intentionally; future rounds remain pending.
26. `resolveTrick` partial-trick comparison and invalid-input rejection; ordinary rules and hard AI share it.

## AI

AI acts only in playing with its own active seat and no pause reason. Controller schedules one named `AI_DELAY_MS = 650` callback per turn, with current game ID/revision captured. This is a thinking pause, not a simulated server. Cancellation on settings change, pause, route change, new game or unmount is mandatory. A watchdog fires at `AI_DELAY_MS + 1200` and plays `lowestLegalCard` if the main callback was lost or its card was rejected; `settled` prevents a double play. The E2E knob `VITE_AI_DELAY_MS` only exists for the Playwright web server.

- **Easy:** uniformly choose an index from deterministically sampled, lowest-comparator-sorted legal cards. Seed formula is defined above.
- **Normal:** lowest legal card, with rank-first comparator. “Follow suit” is enforced by legalMoves, not a second AI rule.
- **Hard:** on a fresh trick lead the lowest non-trump, or lowest legal card when all cards are trump. On a partial trick, find candidates for which `resolveTrick([...plays, candidate], trump)` returns this player. If any winning non-trump exists, play its lowest; otherwise play lowest winning trump (possible only while void in a non-trump led suit, or when following a trump lead). If no card can win, dump lowest non-trump when available, otherwise lowest legal. Following a trump lead may require trump even when losing. “Win” here means beat the current public trick, not guarantee the final outcome. Do not inspect opponents' hands or search future plays.
- Ties in strategic candidate groups use the exact stable comparator; no extra randomness on normal/hard.
- Timer expiry always uses `lowestLegalCard`, regardless of difficulty or player kind, and logs `automatic: true`. AI normal scheduled plays are also automatic; user-confirmed plays are false.

## Table UI

Root provider: `<DeckProvider default="french" backLabel="Face-down card">` wraps the app's card-bearing content, including portals/rules. It supplies art, not shuffle/rules. Every card value explicitly uses `deck: 'french'` so standalone examples are safe.

From 600px up, a `Stage` fills the viewport below the topbar. Its `Board` holds `GameTable` with `players={4}`, seats ordered South/West/North/East, `teamCount={1}`, `turnDirection="clockwise"`, `surface="match"` and `seatPlacement="edge"`. Source geometry puts index 0 south and index 1 west; clockwise preserves supplied order. Do not rely on default direction (it is counterclockwise) or default team count (2).

The felt's height is capped at 56% of the table container's block size, so the board must get the stage's height: the hand and its action sit in a dock below the board, and the HUD (round, trick, trump, turn status, Pause) is laid over the board's empty corners outside the felt ellipse. A 448px-tall board at 1440×900 could not fit `md` plays; the stage's board fits them at 1440×900, 1280×720 and 768×1024.

```tsx
<Stage>
  <Board>
    <BoardBar $edge="start"><RoundStats /><TrumpBadge /></BoardBar>
    <GameTable players={4} seats={view.seats} teamCount={1}
      turnDirection="clockwise" surface="match" seatPlacement="edge">
      <GameTable.Seat><TableSeat /></GameTable.Seat>
      <GameTable.Play><TablePlay /></GameTable.Play>
      <GameTable.Floating><RoundCall /></GameTable.Floating>
    </GameTable>
    <BoardBar $edge="end"><TurnStatus /><TableActions /></BoardBar>
  </Board>
  <Dock><PlayerHand /></Dock>
</Stage>
```

The phone branch lives in `src/table/compact-board.tsx` and reuses the same pieces (`RoundStats`, `TrumpBadge`, `SeatChip`, `PlayedCard`, `TurnStatus`, `TableActions`, `PlayerHand`). No opaque wrapper goes between GameTable and a region part. Seat and Play each repeat once per place; their children read `useGameTableSeat<SeatView>()` and null-check player. Never manually duplicate a second set of four regions on top of this repetition. GameTable has no active-turn prop or keyboard model.

Seat: `SeatChip` restyles GameSeat into a horizontal chip (a stacked one on phones): `Avatar` for every seat (the published 0.9.1 package has no `person-avatar` subpath), `badges` with “Your turn”/“Playing” or “Wins trick”, otherwise “Dealer” and the card count as text, and `points` as the total with a visually hidden unit. Do not use `handCount`: its hidden fan is decorative and contributes to seat height. Active and winner states are `data-state` with a ring, plus the badge text. `turn` is supplied only for your running timed turn (`deadline`, `durationMs: 30000`, sampled `now`); remove it during pause.

Play: `PlayedCard` renders a plain `md` GameCard named “Name played Card”, entering from its seat's side; an unplayed seat renders a hidden face-down card of the same size so the geometry does not move as cards land. The trick winner's card is ringed and raised in place. Clear plays only on continue.

Hand: `cards` maps only human cards; `value` is selectedCardId; `onValueChange` passes the request to the controller, which rejects illegal or out-of-turn cards with a toast; `onPlayIntent` delegates the ID to the controller. Do not pass `disabled`: it dims every card. Mark unavailable cards through `slots.card` (`aria-disabled`, `aria-describedby` to the turn status); with hints on, illegal cards darken and drop on your turn only. Always validate again on confirmation. Clear selection after play, new turn, new round and new game; preserve selection through sort/hint/theme changes if it remains legal.

**Verified API gap and supported adapter:** GameHand has no per-card `disabled`/`dimmed` field or card render callback. Use its public `slots.card` replacement, declared at module scope. It receives native button props including `data-hand-card`. Read a small hand-render context of legal IDs, labels and hint setting, forward ref/className/style/children and every existing handler, add `aria-label` from the card label, `aria-disabled` and an accessible illegal reason. Apply token-based dimming to the wrapper only when hints are on; never hide illegal cards. Do not replace GameHand's internal GameCard, reach into private imports or invent `cards[].disabled`. Legal guards remain active when hints are off. Illegal buttons remain discoverable by keyboard. On blocked intent announce “Follow [suit].” from the engine-derived led-suit view; this feedback may instead be provided as the card's description. Do not dim the entire hand merely because one card is illegal.

HUD: round and trick (`n/5`) in the board's top-start corner and the trump badge in the top-end corner, laid over the board outside the felt ellipse. The trump badge is a Popover trigger with a decorative FlipGameCard: a suit glyph on the front, the deck back on the back; no-trump shows a crossed circle. Source semantics: `flipped={true}` shows back, false shows front. A new round briefly shows back → front, with no blocking delay; reduced motion shows the front immediately. Do not display a fake ace that could be mistaken for a dealt card.

Bottom corners: turn status (title, detail, and the Countdown chip when the timer runs) and GameActions for Pause/Resume and compact Scores. Dock: the hand and its one action; Next trick or results replaces Play card in the same place. No redundant second Play button; GameHand owns explicit confirmation. Plays: each `GameTable.Play` holds a plain GameCard in front of its seat; the trick winner's card is ringed and raised and its seat shows a badge. Floating: a noninteractive CallOverlay announces each new round on the empty felt. GameResult closes the match; GameRounds never invents an unsupported `draw` outcome.

## Responsive layout

Sizing constants live in config/table.styles. All grid children have `minInlineSize: 0`; shell uses `minBlockSize: 100dvh`. Do not set body overflow hidden to conceal failures. Table's parent must supply real inline and block size; `height: 100%` on an auto-sized ancestor is not sufficient. Header/hand/footer consume board space, so measure the complete composition, not an empty felt.

| Viewport | Required arrangement |
| --- | --- |
| 1440×900 | Shell bounded to 1440px; game area `minmax(0, 1fr) 312px`. One stage fills the viewport below the topbar: board with HUD corners, then the dock. `GameTable` fits `md` plays (`data-layout-fit="fitted"`), as it does at 1280×720. Score rail inline at stage height. |
| 768×1024 | Single column; the same stage, fitted with `md` plays. Scores in a drawer from the end edge via the Scores action. |
| 390×844 | Compact board, not `GameTable`: HUD row, four felt columns (seat chip above its card), status row, then the hand with its action. Two by two below 360px. Scores and settings as bottom sheets. |

Use breakpoint 1100px for the inline sidebar and 600px for the mobile board, as named constants. Hand scroll belongs inside its region, not the page; focus scrolls selected buttons into view. Do not shrink interactive targets below 24×24 CSS px; aim for 44px controls. Library small hand exposes 32px selection strips, so ensure adequate vertical target area and nonoverlapping focus outlines.

Do not switch the whole composition on and off from `data-layout-fit`: that oscillates between felt and fallback as the content changes the measurement. Use the stable `<600px` mobile board branch. At `>=600px`, `data-layout-fit="insufficient-space"` is possible with four play regions even when the rendered 32px cards are readable; do not hide content or claim a fitted table. Use edge placement, text hand counts, and the mobile board as the final fallback. Record the library-side gap in FINDINGS rather than scaling the whole UI below the card floor.

## Accessibility

- One h1, main landmark, skip link, labelled table region, named overlays and meaningful button/link text. Cards are named “Ace of hearts”, not “A ♥”; played cards include actor and trick context. Hidden hands expose count only.
- Keyboard: Tab/Shift+Tab traverse hand card buttons then confirm. Enter/Space selects or clears a card; only activation of Play card commits. No global single-letter shortcut or invented GameHand arrow navigation. GameActions uses its native roving focus (arrow keys/Home/End as supported); retain its implementation. Escape closes menus/popovers/modals, not a card play or the match. Kbd instructions reflect these actual behaviors.
- Illegal cards stay inspectable but `aria-disabled`; confirmation cannot submit illegal state. `aria-pressed` denotes selection, not legality. Hints have text/accessible descriptions as well as dimming. Active player and dealer have text, not color alone.
- On modal open focus its sensible first control/title according to library behavior; preserve a real triggering element for focus return. Closing result UI restores its results action. On round deal focus the hand region heading; on human play restore stable confirm/hand focus, not a removed card. Never steal focus on AI turns. Suppress turn announcements while a modal is open; summarize when it closes.
- A polite, atomic status announces whose turn and any automatic play. CallOverlay already owns a polite status role: let it announce trick wins, avoiding a duplicate live-region message. Persistent winner text is not another live region. Scores/history update without announcing every row. No per-second speech; timer announces once at ten seconds and once on expiry via controller status. Countdown completion announcements are disabled and are not the source of gameplay expiry.
- Timer is off by default, can be disabled, and a directly reachable Pause/Resume works throughout active play. Store remaining milliseconds when paused; render a static remaining-time label instead of a running Countdown. Modal/route/visibility pauses freeze AI too. Effects depend on game ID/revision and clean up on StrictMode replay. Background timer callbacks cannot auto-play after a pause.
- Reduced motion disables app flips/transitions and result celebration; no animation completion controls rules. Library motion preferences remain intact. Contrast AA in both themes, visible token focus rings, forced-colors checks and no important information exclusively in artwork.
- Validate at 200% zoom and with long localized labels even though initial copy is English. Include manual screen-reader traversal of a complete trick, settings and final result.

## Theming

Copy the boilerplate's `index.html` pre-paint palette logic and `theme.ts` hook, changing storage key and title to Fivefold. Set both `document.documentElement.dataset.theme` and `style.colorScheme`; guarded localStorage read precedes first paint, system light preference is the fallback. Only `light` and `dark` are accepted. ThemeSwitch controls the app hook, not an assumed ThemeProvider palette prop.

`main.tsx` imports Inter Latin 400/500/600, `@jfrader/tokens/tokens.css`, then `@jfrader/tokens/base.css`, and mounts StrictMode → ThemeProvider → application providers/router. Keep the boilerplate's root-element check. Reuse AppShell/Topbar/Footer structure, replacing Acme and irrelevant navigation. Table route uses tighter main padding than the boilerplate landing page.

Use `styled.div(({ theme }) => ({ … }))`, `styled(Container)(…)` and semantic `theme.color`, `theme.space`, `theme.radius`, `theme.textSize`, `theme.fontWeight`, `theme.lineHeight` entries verified in the boilerplate. Use tokens for borders, surfaces, muted copy, accent and focus; no raw brand color literals. Layout measurements are named constants, not invented design tokens. Style overrides attach through public className/styled or documented `sx`, never the library-private Emotion `css` prop. Do not import internal library files. Portal theme inheritance must be verified with drawer/dialog/toast in both modes. No CSS modules or handwritten alternate token stylesheet.

## Testing and QA

Implement these scripts: `pnpm dev` = Vite; `pnpm typecheck` = `tsc -p tsconfig.json --noEmit`; `pnpm test` = `vitest run`; `pnpm test:watch` = `vitest`; `pnpm test:e2e` = `playwright test`; `pnpm build` = typecheck then `vite build`; `pnpm preview` = `vite preview`. Vitest includes engine and storage tests only, excludes browser tests. Playwright webServer starts/stops its own Vite instance and uses isolated browser contexts; never use a shared MCP browser session. No process left running after verification.

Test fixtures inject five deterministic decks/seed through a narrowly gated test bootstrap (`import.meta.env.MODE === 'test'`), read before controller creation. Do not expose a production cheat menu or mutable window game state. Browser tests play through accessible UI rather than dispatching hidden actions. Use Playwright clock controls for AI and expiry; do not rely on real 30-second sleeps. Network/page-error listeners fail tests on uncaught errors.

Browser scenarios:

1. Ready → start → select (no play) → confirm; enforce follow-suit and verify exactly one card disappears.
2. Entire five-round game, next-trick/result gates, winner and 25-point total; AI values absent from DOM until played.
3. Preset human victory, AI victory and draw (including AI-only tied leaders); stats increment once under StrictMode, then survive reload.
4. Easy/normal/hard controls; legal hints off cannot enable illegal play; sort preserves selected identity.
5. Optional timer expiry chooses lowest legal, manual/timeout race accepts only one, Pause freezes remaining time, Resume preserves it, modal/route/visibility pauses prevent AI and expiry.
6. Restart confirm/cancel; old callbacks cannot affect new game. Abandon does not count as played.
7. `/rules` direct load and back-to-table preserve paused state; not-found navigation; rules lazy fallback uses real deferred loading.
8. Settings/theme persistence, malformed JSON, invalid enum/counters, unavailable storage and reset success/failure. A reset confirmation is keyboard operable.
9. Keyboard-only complete trick, roving actions, illegal button behavior, dialog focus containment/return, menu Escape and skip link.
10. Light/dark, reduced motion, forced colors and the three target viewports; open every overlay, full five-card hand, last trick/result states and emergency insufficient-space path. Assert page `scrollWidth <= clientWidth`, visible action/focus bounds, no seat/stack collision and no clipped dialogs.
11. Capture evidence for ready, playing, trick winner, settings and result at 1440×900, 768×1024 and 390×844; inspect actual screenshots, not just screenshot existence. Cover a 320px width/200% zoom stress case as fallback QA.
12. Run axe WCAG 2.0–2.2 AA/best-practice audit on ready, active human turn, rules, settings, round and final dialogs in both palettes using the external pinned runner/extension described above. Record zero serious/critical violations and investigate all remaining findings. Manually verify screen-reader behavior and contrast; axe is not a replacement.

Build/typecheck must verify all public imports and adapter types against installed published packages, including slot props/ref forwarding. Completion gate: unit tests, browser tests, production build, accessibility evidence and manual visual review. Report any unavailable axe/browser tooling as a gate not yet satisfied, never as a passing audit.

## Acceptance criteria

- [ ] Public standalone repository installs from its lockfile with no sibling paths, private packages or backend credentials; MIT license and correct Fivefold metadata.
- [ ] A human can complete all 25 tricks against three hidden-hand AI opponents using only keyboard or touch.
- [ ] Follow-suit, rank/trump/no-trump resolution, dealer/leader rotation, scoring and draw semantics match this spec and tests.
- [ ] Every asynchronous play is revision guarded; no duplicate trick, score, stats increment or post-restart action under StrictMode.
- [ ] All specified game families are meaningfully used; at least 35 distinct rendered families are exercised in QA without counting providers, parts or accidental nested internals.
- [ ] Difficulty, hints, timer, sort, palette and local stats behave/persist as specified; storage failure is recoverable.
- [ ] Human confirmation is explicit; illegal moves cannot pass with hints off; opponent values never enter visible/accessible UI before play.
- [ ] No horizontal page overflow or inaccessible primary action at the three viewports; insufficient-space has a tested playable fallback.
- [ ] Modal focus, keyboard play, reduced motion, AA contrast and timer pause/disable work; documented axe/manual accessibility gates pass.
- [ ] Vitest, Playwright, typecheck and production build pass; screenshot evidence has been visually reviewed.
- [ ] Engine has no UI/browser dependency, ambient clock/randomness or mutable input side effect; all ownership sets integrate through the frozen contract.
- [ ] README explains running, rules, components, tests, architecture, limitations and static-host `/rules` fallback; library friction is recorded with evidence, not silently patched in the library.

## Risks, open questions and decisions

Decisions fixed for implementation: clockwise supplied seat order; no partnerships; human first dealer; ace high; game-wide tie means draw; joint round lead counts as won only for round-strip presentation; explicit trick continuation; no match persistence; modal/route/visibility pause; browser-local stats; per-card GameHand adapter rather than library edits. These are refinements of the brief, not scope additions.

Verified source findings: French keys are `hearts/diamonds/clubs/spades` and `A/J/Q/K` (numeric strings 2–10); GameTable default direction and team count are unsuitable here; Seat/Play repeat automatically; its overflow is hidden and its measured inner surface exposes layout fit; GameHand has no per-card legality prop but forwards `data-hand-card` to its card slot; FlipGameCard true means face down; GameSeat `turn` is timer geometry, not turn ownership. Stories also contain stale references to public `css`; source and declared installed types take precedence.

Risks/gates, not permission to guess APIs:

- Source tree and published `0.9.1` may differ. Smoke build against the installed release before delegation; if required exports are missing, report the exact version gap and choose a published compatible release with the primary, never edit the library or depend on its source checkout.
- Dense board composition may hit minimum-size floors even at a supported viewport. Verify real content geometry; compact/fallback behavior above is mandatory, not `overflow-x: hidden` camouflage.
- The card slot adapter relies on the forwarded `data-hand-card` attribute observed in source. Add a browser contract test and record this integration seam in the feedback log.
- Breadcrumbs easy `href` links are verified; a Router-specific replacement seam was not inspected. Safe baseline: ordinary `/rules` page breadcrumb anchor back to `/` with a handler intercepting only unmodified same-origin left clicks to router navigation, preserving modified clicks. Do not invent `asChild`.
- Automated axe package is not in the dependency allowlist. External pinned QA execution is the specified baseline; additional test dependency approval remains separate.
- Browser measurements, actual installed export compatibility and axe execution are implementation verification, not claimed results of this document.

No unresolved game-rule or product choice blocks implementation. No new library feature is a prerequisite if the published package matches the inspected source.

## Library feedback log

Keep findings in this section during implementation (primary owns amendments), then summarize actionable findings in the README/issue links once published. Inspect per-card legality and ref/handler forwarding, repeated seat/play composition, measured minima and insufficient-space recovery, hidden-hand count semantics, card-stack intrinsic sizing, timer pause rendering, GameRounds tie limitations, portal palette inheritance and stale story prop documentation. Do not edit the library during app work.

Finding format:

| Field | Required content |
| --- | --- |
| Component/version | Public component and installed package version |
| Friction | One concrete integration problem, not a preference disguised as a defect |
| Evidence | Source/story location, minimal reproduction, viewport/theme and screenshot or failing test |
| Proposed change | Small API/docs fix and compatibility implications; distinguish app solution from library proposal |
| Docs/story gap | Missing or inaccurate example/contract and a proposed acceptance test |
| Status | Observed / reproduced / reported / resolved; public issue link if one exists |

Initial observations, not reproduced app defects:

- **Published package gap — PersonAvatar.** `person-avatar` exists in `packages/ui/src/components/person-avatar` and the README, but `@jfrader/ui@0.9.1` has no `./person-avatar` export (checked `node_modules/@jfrader/ui/package.json`). The example uses `Avatar` for all four seats. Proposed fix: publish the subpath or document that it is source-only until the next release.
- GameHand: no per-card disabled/dimmed API. Evidence: `packages/ui/src/components/game-hand/game-hand.tsx`, GameHandCard/slots.card and `data-hand-card` forwarding. App workaround is a public card slot. Proposed library discussion: documented legal-card customization example or future typed per-card state seam; add keyboard/confirm tests before requesting API expansion.
- GameTable: direct parts and a real block size are essential. Evidence: `game-table.tsx` region validation, hidden overflow, layout-fit attribute and `game-table.stories.tsx` sized viewport fixtures. Proposed docs example: four-player free-for-all with explicit direction/teamCount and phone fallback.
- FlipGameCard: true shows back, unlike “flipped means revealed” assumptions. Evidence: `flip-game-card.tsx` prop documentation. Keep the reference example explicit.
- GameHand stories mention a public `css` root prop while current library instructions specify `sx`. Evidence: `game-hand.stories.tsx` usage text versus public types. Proposed docs correction, not an app compatibility workaround.

## README outline

1. Fivefold: one sentence, real screenshot, public demo URL only when deployed.
2. Play: concise rules, seat/dealer order, trump schedule, scoring/ties and controls.
3. Run locally: Node/pnpm prerequisites, install, dev, build and preview commands.
4. Settings and privacy: AI levels, hints/timer/sort, pause behavior, browser-only persistence and reload limitation.
5. Built with `@jfrader/ui`: small composition excerpt, meaningful component map and link to the library; not a duplicate prop catalogue.
6. Architecture: pure engine/controller/presentation boundary, deterministic fixtures and folder map.
7. Testing: unit/browser/typecheck/build commands, viewport and accessibility QA, external axe setup/version.
8. Theming and accessibility: tokens, pre-paint palette, Inter, keyboard and reduced motion.
9. Deploy: static output, SPA fallback for `/rules`, configurable base/source URL; no backend/env secrets.
10. Known limitations and library feedback links, accurately scoped to the released example.
11. MIT license, author/source and third-party attribution where required.
