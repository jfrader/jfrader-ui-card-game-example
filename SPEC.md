# Fivefold

Fivefold is a small, polished, genuinely playable four-seat trick-taking game and a public reference application for composing `@jfrader/ui`. Play five short rounds against Nora, Eli and Wren, follow suit, use the rotating trump to win tricks, and finish with the highest score. The table, not a component catalogue, is the product: every included component supports playing, understanding or reviewing the game. Ship a standalone MIT-licensed React application with no account, server or paid service.

## Goals and non-goals

- Complete a game in one sitting, with understandable decisions, explicit card confirmation, readable feedback and a useful final result.
- Demonstrate all specified game components and at least 35 distinct library component families across real user flows; providers and compound parts do not inflate that count.
- Support mouse, touch and keyboard; light/dark themes; desktop, tablet and phone.
- Keep rules independent of React, browser clocks, artwork, storage and animation. Make every match reproducible in tests.
- Reuse the sibling boilerplate's theme bootstrap, Inter imports, styled shell and token conventions, not its placeholder branding.
- Non-goals: multiplayer, accounts, matchmaking, betting, chat, partnerships, bidding, undo, saved-match recovery, replay controls, leaderboards, custom decks, audio, monetization, analytics or sophisticated search-based AI.
- This document is the only deliverable of the specification pass. Application scaffolding and dependency installation belong to implementation.

## Game rules

1. Seats and turn order are fixed: South = You (`south`, human), West = Nora (`west`), North = Eli (`north`), East = Wren (`east`). The cyclic order is South → West → North → East → South. “Left of dealer” means the next seat in this order; include this definition in the rules rather than relying on spatial terminology.
2. You deal round 1. Dealers for rounds 1–5 are South, West, North, East, South. The first leaders are respectively West, North, East, South, West. After the first trick of a round, its winner leads the next trick. Play always continues in the same cyclic order from that leader.
3. Use a French deck of 52 unique cards, no jokers. Rank order is 2 < 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A. Ace is always high. Suits have no ranking for trick resolution.
4. Independently shuffle a complete deck for each round. Deal one card at a time, starting left of the dealer and continuing in turn order for five passes. Each seat receives five cards; the remaining 32 are unused, inaccessible and face down. Never carry leftover cards into the next round. Cards may recur between rounds, never within a round.
5. There are exactly five rounds and five tricks per round. Trump schedule: hearts, diamonds, clubs, spades, then no trump (`null`). There is no “breaking trump” restriction; any card may lead.
6. A lead establishes the led suit. A player holding any card of that suit must play one of them. Otherwise any held card is legal, including trump. There is no obligation to trump, overtrump or beat the current winning card.
7. Each trick has exactly one card from each seat, in cyclic order. If any trump was played, the highest trump wins; otherwise the highest card in the led suit wins. Off-suit non-trumps cannot win. No equal-card tie is possible with a valid deck. In no-trump, only led-suit cards can win.
8. Award one point immediately when the fourth card resolves the trick. Keep all four cards visible until the human activates “Next trick”; AI does not dismiss this review state. After trick 5, the button reads “Round results” (or “Final results” in round 5). A round therefore awards exactly five points, a game exactly 25. No bonuses or penalties.
9. Round results show each player's round points and cumulative points, plus the next trump. “Deal round N” advances rounds 1–4. After round 5, highest total wins; two or more joint highest totals make the match a draw, regardless of whether You are among them. A sole AI winner means a human loss; a sole South winner means a human win. List every joint leader on a draw.
10. Round-strip semantics are explicitly human-relative: `won` means South was joint or sole highest in that completed round, `lost` means below its highest score, `pending` means unfinished or future. Text distinguishes “Joint round lead” from “Round lead”; this is not a bonus or a game win.
11. AI cards are never exposed before play, including accessible names, DOM attributes, logs or result panels. Counts are public. This is presentation privacy, not anti-cheat: a local app cannot hide its memory from its owner.
12. Optional timing is 30 seconds per active turn, off by default. On expiry play the lowest legal card, with the same deterministic comparator used by normal AI. AI normally plays sooner. Timer events never bypass rule validation. There are no timers during trick review, round results or final results.
13. Pause freezes all AI and turn timers. Opening a modal, leaving `/`, hiding the document or pressing Pause adds a pause reason; resume only when all reasons clear. Returning from a hidden tab requires explicit Resume. No catch-up plays. Preserve remaining time rather than resetting it; disabling the timer removes the deadline, enabling starts a full duration on the next turn.
14. Hints never change legality. Auto-sort changes display order only. Difficulty changes take effect on the next scheduled AI turn, canceling and rescheduling any pending AI callback. New game requires confirmation if an unfinished game exists; abandoning does not affect stats. Reload starts at the ready screen, not a restored match.
15. Invalid card ID, wrong actor, duplicate/stale turn request, invalid phase and failure to follow suit leave state unchanged with a typed error. Bad deck input fails before a game is started. Double-clicks and racing timer/manual requests cannot play twice.

## Experience and routes

| Route/state | Experience |
| --- | --- |
| `/`, ready | Table-shaped composition with named seats, empty trick space, “Start game”, difficulty summary and local games/wins metrics. No invented loading delay or AI network status. |
| `/`, playing | Table is primary; selected card and explicit Play card control in the human hand; turn name, round/trick, trump and scores remain available. |
| `/`, trickComplete | Four revealed cards, named winner, one-point feedback, persistent Next trick action. |
| `/`, roundComplete | Dialog with round and total scores, next trump and Deal round N. Closing it leaves a “View round results” action; it does not deal automatically. |
| `/`, gameComplete | GameResult with winner/draw, final GameScore, local stats, Play again and Review scores. Result can be dismissed and reopened. |
| `/rules` | Shareable full rules page with Breadcrumbs, Prose, examples of following suit and trump, keyboard instructions and Return to table. Reuses the same rules content as the quick-rules dialog. |
| unmatched route | EmptyState “Page not found” and router link to `/`. No full reload for navigation. |

Global AppShell contains skip link, compact Topbar (Fivefold wordmark/home link, Rules link, ThemeSwitch, game menu), main landmark and Footer (MIT/source link from configured site metadata). Keep active game/controller above route outlet so visiting rules does not discard a hand. Use BrowserRouter; document static-host SPA fallback for direct `/rules` navigation. Route changes update title and focus the page heading/main, without automatically moving focus during turns.

First visit: nonblocking, dismissible AnnouncementBar: “Five rounds. Follow suit. Most tricks wins.” with Rules action. Persist dismissal. Start is always explicit. No onboarding tour.

Settings Drawer uses difficulty SegmentedControl and switches for legal-card hints, timer and auto-sort. Defaults: normal, hints on, timer off, auto-sort on. It also contains local stats and a confirmed Reset stats ActionButton. Apply settings immediately with the timing exceptions above; a failed persistence write leaves usable in-memory settings and a single warning Toast.

Quick-rules Dialog opens from the table without route navigation. Separate score/history Drawer below desktop; desktop uses an inline side panel with Tabs for Scores and History. Never mount duplicate interactive panel instances. Menu holds Settings, Rules, New game and local Stats (opens settings); Pause/Resume is directly available through GameActions.

Empty/loading/errors: history EmptyState before the first play; real Suspense fallback with Skeleton for lazy `/rules` only; storage Alert/Toast on failed reads or writes; recoverable invalid-play Alert near the hand; top-level render error boundary with Alert and Reload button. Do not pretend local dealing or AI requires a spinner. Keep the loading fallback out of the live table and preserve the shell.

Mobile keeps all primary actions reachable below the board, using vertical page scrolling when needed. Scores/history move to a drawer; menus and dialogs remain above table clipping. No hover-only instructions. There is no orientation lock.

## Component coverage

Imports below name the published entry point. Compound parts share their family's entry point. “Core” participates directly in the match; “support” is a real auxiliary flow. Coverage is across reachable states, not simultaneous rendering. `styled`, hooks and providers are not counted as rendered families.

| Component | Import path | Where / why | Key props or composition | Role |
| --- | --- | --- | --- | --- |
| GameTable | `@jfrader/ui/game-table` | Responsive four-seat board | `players={4}`, `seats`, `teamCount={1}`, `turnDirection="clockwise"`, `surface="match"`, region parts | Core |
| GameSeat | `@jfrader/ui/game-seat` | Names, dealer/turn badges, score and hidden counts | `name`, `avatar`, `badges`, `points`, `handCount`, optional `turn` | Core |
| GameHand | `@jfrader/ui/game-hand` | Human selection and confirm; Hidden for AI | `cards`, `playLabel`, `value`, `onValueChange`, `onPlayIntent`, `disabled`, `slots.card`; Hidden `count`, `label` | Core |
| GameCard | `@jfrader/ui/game-card` | Printed played cards and rules examples | `value`, `label`, `face="print"`, `size`, `dimmed` | Core |
| GameCardStack | `@jfrader/ui/game-card-stack` | Current trick pile at each play position | `piles`, `maxCards={1}`, `placement="grid"`, controlled inspection | Core |
| GameActions | `@jfrader/ui/game-actions` | Pause, continue and panel actions | `actions`, `label`, `size`, `orientation` | Core |
| GameScore | `@jfrader/ui/game-score` | Live, round and final scoreboard | `label`, `rows` with `key`, `label`, `value`, `stage` | Core |
| GameRounds | `@jfrader/ui/game-rounds` | Five-round progress/outcomes | `label`, `rounds`, `outcomeLabels` | Core |
| GameResult | `@jfrader/ui/game-result` | Match conclusion | `outcome`, `title`, `summary`, `actions`, `celebration` | Core |
| GameMarks | `@jfrader/ui/game-marks` | Tricks won this round per player | `label`, `count`, `mark`, `maxPerRow={5}`, `layout="rows"` | Core |
| FlipGameCard | `@jfrader/ui/flip-game-card` | Reveal the next round's trump indicator | custom `front` and `back`, `flipped`, `size="sm"` | Core |
| DeckProvider | `@jfrader/ui/deck` | Resolve French artwork for all cards | `default="french"`, `backLabel="Face-down card"` | Core provider |
| Dialog | `@jfrader/ui/dialog` | Rules, results and destructive confirmation | `open`, `onOpenChange`; Content → Panel → Title/Description, Close | Support |
| Drawer | `@jfrader/ui/drawer` | Settings and compact scores/history | `open`, `onOpenChange`; Content/Panel/Header/Body/Footer/Title/Close | Support |
| Toast | `@jfrader/ui/toast` | Storage warning and successful reset | Provider `viewport="default"`; `useToast().toast({title, description, tone})` | Support |
| Alert | `@jfrader/ui/alert` | Persistence or invalid-play recovery | `tone`, `title`, `onDismiss`, `dismissLabel` | Support |
| Tabs | `@jfrader/ui/tabs` | Scores / History panel | `label`, `value`, `onValueChange`; List/Tab/Panel | Support |
| Menu | `@jfrader/ui/menu` | Secondary commands in Topbar | Trigger/Content/Item/Separator | Support |
| Tooltip | `@jfrader/ui/tooltip` | Icon-only theme/menu affordance where needed | Trigger/Content; never sole accessible name | Support |
| Popover | `@jfrader/ui/popover` | Trump badge explains current trump/no-trump | `triggerLabel`, `label`, `content` | Support |
| AnnouncementBar | `@jfrader/ui/announcement-bar` | Dismissible first-run rule summary | `messages`, controlled `open`, `dismissible`, `autoPlay={false}` | Support |
| CallOverlay | `@jfrader/ui/call-overlay` | Brief trick-winner announcement | `label`, controlled `open`, `onOpenChange`, `tone` | Core |
| Countdown | `@jfrader/ui/countdown` | Optional active turn countdown | `target`, `variant="compact"`, `units={['seconds']}`, `label`, `announceCompletion={false}` | Core |
| Timeline | `@jfrader/ui/timeline` | Public play/trick history | `events`, `now`, `maxHeight`, `scrollToNew` | Support |
| MetricCard | `@jfrader/ui/metric-card` | Games played and won in ready/settings/result | `label`, numeric `value`, `formatOptions` | Support |
| SegmentedControl | `@jfrader/ui/segmented-control` | Difficulty | `options`, `value`, `onValueChange`, `label` | Support |
| Switch | `@jfrader/ui/switch` | Hints, timer and sort | `label`, `checked`, `onCheckedChange` | Support |
| Progress | `@jfrader/ui/progress` | Completed tricks in current round | `value`, `max={5}`, `label`, `getValueLabel` | Core |
| Skeleton | `@jfrader/ui/skeleton` | Actual lazy rules fallback | `width`, `height`, `radius` | Support |
| Kbd | `@jfrader/ui/kbd` | Rules keyboard reference | native children: Tab, Enter, Space, Escape | Support |
| ScrollArea | `@jfrader/ui/scroll-area` | Hand overflow/history | `orientation`, `fade`, `scrollbars`, `maxBlockSize` | Core/support |
| EmptyState | `@jfrader/ui/empty-state` | No history; unknown route | `title`, `description`, `action`, `headingLevel` | Support |
| Breadcrumbs | `@jfrader/ui/breadcrumbs` | Rules navigation hierarchy | `items`, `label`; router-backed links via verified customization or ordinary link interception | Support |
| ActionButton | `@jfrader/ui/action-button` | Confirmed local-stat reset | `label`, `pendingLabel`, `successLabel`, `errorLabel`, `onAction` | Support |
| Avatar | `@jfrader/ui/avatar` | Human and AI seat identities; initials keep every seat readable | `name`, `size`, `status` | Core |
| ThemeSwitch | `@jfrader/ui/theme-switch` | Global palette selection | `label`, `iconOnly`, `value`, `onValueChange` | Support |
| Container | `@jfrader/ui` | Shell width bounds | `size="xl"`, `paddingInline` | Support |
| Flex | `@jfrader/ui` | Topbar/action rows | children; token-based styling | Support |
| Stack | `@jfrader/ui` | Settings and result groups | children; token-based styling | Support |
| Card | `@jfrader/ui` | Score panel and rule examples | compound content or children | Support |
| Divider | `@jfrader/ui` | Settings sections and Footer | native/declared props only | Support |
| Prose | `@jfrader/ui` | Rules text | semantic heading/list children | Support |
| Button | `@jfrader/ui` | Start, close, deal, retry | children, `onClick`, `type`, declared visual props | Core/support |
| ThemeProvider | `@jfrader/ui` | Typed styled theme context | children; no palette prop assumed | Support provider |

Deliberately omitted: PersonAvatar (exists in the source tree and README, but is absent from the published `@jfrader/ui@0.9.1` export map; use Avatar and record the package gap), UserMenu (no user/account), chat widgets (no chat), network/presence widgets (local opponents never go offline), CardFlights (not needed to teach selection/play; avoids a second animation subsystem), rewards/store/payment components (no economy), form libraries and data grids (no corresponding workflow). Do not add them to reach a quota. GameSeat `offline` and `chat` are unused; `turned` is not a turn flag. Do not count library internals toward the coverage target.

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

Use versioned keys: `fivefold.settings.v1`, `fivefold.stats.v1`, `fivefold.notice.v1`; palette key `fivefold.theme.v1` is duplicated deliberately in pre-paint bootstrap and `theme.ts`, with a test asserting equality. Store settings/stats as validated JSON, theme as `light`/`dark`, notice as `dismissed`. Invalid, absent, unavailable or corrupt data falls back independently; never clear unrelated keys. Stats are local to this browser. No match/deck/hand persistence.

Stats increment only upon the single transition into `gameComplete`: games played +1; games won +1 only for a sole South victory. Draws are played but not won. Store `lastCountedGameId` with counters and guard effects against StrictMode duplicates. Reset is permitted only in ready/gameComplete to avoid counting the current completion again. Storage failure must not stop play. Cross-tab write reconciliation is out of scope; document that last writer wins.

## File map and parallel ownership

Paths are relative to the repository root. Ownership is exclusive, including tests. Primary creates/finalizes shared contracts before the three writers start. Writers may read other sets but must not edit them or add undeclared shared files.

| Owner | Exact files |
| --- | --- |
| Engine writer | `src/engine/types.ts`, `src/engine/constants.ts`, `src/engine/deck.ts`, `src/engine/rules.ts`, `src/engine/ai.ts`, `src/engine/reducer.ts`, `src/engine/selectors.ts`, `src/engine/index.ts`, `src/engine/deck.test.ts`, `src/engine/rules.test.ts`, `src/engine/ai.test.ts`, `src/engine/reducer.test.ts` |
| Table UI writer | `src/table/game-board.tsx`, `src/table/player-seat.tsx`, `src/table/seat-pile.tsx`, `src/table/player-hand.tsx`, `src/table/trump-indicator.tsx`, `src/table/round-strip.tsx`, `src/table/table.styles.ts` |
| Shell/panels/rules writer | `src/components/app-shell.tsx`, `src/components/topbar.tsx`, `src/components/footer.tsx`, `src/panels/score-history.tsx`, `src/panels/settings-drawer.tsx`, `src/panels/rules-dialog.tsx`, `src/panels/results-dialog.tsx`, `src/panels/new-game-dialog.tsx`, `src/pages/rules.tsx`, `src/pages/not-found.tsx`, `src/rules/content.tsx` |
| Primary integration | `package.json`, `pnpm-lock.yaml`, `index.html`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `LICENSE`, `README.md`, `src/main.tsx`, `src/app.tsx`, `src/theme.ts`, `src/config.ts`, `src/content/en.ts`, `src/contracts.ts`, `src/app/use-game-controller.ts`, `src/app/presentation.ts`, `src/app/storage.ts`, `src/app/storage.test.ts`, `src/app/error-boundary.tsx`, `tests/game.spec.ts`, `tests/accessibility.spec.ts`, `tests/responsive.spec.ts`, `tests/fixtures.ts` |

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

AI acts only in playing with its own active seat and no pause reason. Controller schedules one named `AI_DELAY_MS = 650` callback per turn, with current game ID/revision captured. This is a thinking pause, not a simulated server. Cancellation on settings change, pause, route change, new game or unmount is mandatory.

- **Easy:** uniformly choose an index from deterministically sampled, lowest-comparator-sorted legal cards. Seed formula is defined above.
- **Normal:** lowest legal card, with rank-first comparator. “Follow suit” is enforced by legalMoves, not a second AI rule.
- **Hard:** on a fresh trick lead the lowest non-trump, or lowest legal card when all cards are trump. On a partial trick, find candidates for which `resolveTrick([...plays, candidate], trump)` returns this player. If any winning non-trump exists, play its lowest; otherwise play lowest winning trump (possible only while void in a non-trump led suit, or when following a trump lead). If no card can win, dump lowest non-trump when available, otherwise lowest legal. Following a trump lead may require trump even when losing. “Win” here means beat the current public trick, not guarantee the final outcome. Do not inspect opponents' hands or search future plays.
- Ties in strategic candidate groups use the exact stable comparator; no extra randomness on normal/hard.
- Timer expiry always uses `lowestLegalCard`, regardless of difficulty or player kind, and logs `automatic: true`. AI normal scheduled plays are also automatic; user-confirmed plays are false.

## Table UI

Root provider: `<DeckProvider default="french" backLabel="Face-down card">` wraps the app's card-bearing content, including portals/rules. It supplies art, not shuffle/rules. Every card value explicitly uses `deck: 'french'` so standalone examples are safe.

Use a sized BoardFrame containing `GameTable` with `players={4}`, seats ordered South/West/North/East, `teamCount={1}`, `turnDirection="clockwise"`, `surface="match"`, `seatPlacement="inside"`, and a small token-based `clearance`. Source geometry puts index 0 south and index 1 west; clockwise preserves supplied order. Do not rely on default direction (it is counterclockwise) or default team count (2).

Direct child structure (children of each region may be ordinary app components):

```tsx
<GameTable players={4} seats={view.seats} teamCount={1}
  turnDirection="clockwise" surface="match" seatPlacement="inside">
  <GameTable.Header><RoundStrip /></GameTable.Header>
  <GameTable.Seat><PlayerSeat /></GameTable.Seat>
  <GameTable.Play><SeatPile /></GameTable.Play>
  <GameTable.Center><TrumpIndicator /></GameTable.Center>
  <GameTable.Dock><PlayerHand /></GameTable.Dock>
  <GameTable.Footer><TableActions /></GameTable.Footer>
  <GameTable.Floating><TrickAnnouncement /></GameTable.Floating>
</GameTable>
```

TableActions/TrickAnnouncement may be private functions in game-board.tsx, not new ownership files. No opaque wrapper goes between GameTable and a region part. Seat and Play each repeat once per place; their children read `useGameTableSeat<SeatView>()` and null-check player. Never manually duplicate a second set of four regions on top of this repetition. `GameTable.SeatChrome` may be nested inside a Seat to position compact badges, not used as another direct region. GameTable has no active-turn prop or keyboard model.

Seat: GameSeat `name`, human Avatar/AI PersonAvatar, text badges “Dealer” and “Your turn”/“Playing”, `points` as formatted total. Use `handCount` for opponents with an explicit public “N cards” label; source's default Hidden rendering is decorative, so supply an accessible count in seat text. Where an explicit `GameHand.Hidden` is used, pass only count/label/playerKey, never card values; do not render it twice alongside handCount. Human seat shows count/points but the actual hand lives only in Dock. Active seat styling is app-owned `data-active`; omit `turned` and offline. `turn` is supplied only for a running timed active seat (`deadline`, `durationMs: 30000`, sampled `now`); remove it during pause.

SeatPile: read that seat's public play, build a single-element piles array (`playerKey`, `label`, `revealed: true`, zero or one `cards` entry with stable ID/value/label/order). Use one GameCardStack in each repeated GameTable.Play. Provide a wrapper with explicit card-sized inline/block size inherited from table card variables; the stack root is 100% × 100%, so it cannot size an empty parent. Use grid placement for this local one-pile stack; do not apply seat geometry a second time. Controlled inspection is optional for one card, but keep keyboard inspection functional if enabled. Clear piles only on continue, not when winner feedback fades.

Hand: `cards` maps only human cards; `value` is selectedCardId; `onValueChange` accepts only legal IDs or null; `onPlayIntent` delegates ID to controller. `disabled` when not human turn, paused or not playing. Always validate again on confirmation. Clear selection after play, new turn, new round and new game; preserve selection through sort/hint/theme changes if it remains legal.

**Verified API gap and supported adapter:** GameHand has no per-card `disabled`/`dimmed` field or card render callback. Use its public `slots.card` replacement, declared at module scope. It receives native button props including `data-hand-card`. Read a small hand-render context of legal IDs/hint setting, forward ref/className/style/children and every existing handler, add `aria-disabled` and an accessible illegal reason, and intercept activation with preventDefault for illegal IDs. Apply token-based dimming to the wrapper only when hints are on; never hide illegal cards. Do not replace GameHand's internal GameCard, reach into private imports or invent `cards[].disabled`. Legal guards remain active when hints are off. Illegal buttons remain discoverable by keyboard. On blocked intent announce “Follow [suit].” from the engine-derived led-suit view; this feedback may instead be provided as the card's description. Do not dim the entire hand merely because one card is illegal.

Header: round/trick labels, GameRounds and compact Progress. Center: small trump indicator + Popover explaining current trump. FlipGameCard custom front/back represents the trump rule, not a card removed from the deck; for no-trump its front says “No trump”. Source semantics: `flipped={true}` shows back, false shows front. New round briefly reveals back → front, with no blocking delay; reduced motion shows front immediately. Do not display a fake ace that could be mistaken for a dealt card.

Footer: GameActions for Pause/Resume, Next trick/results, Rules and compact Scores. No redundant second Play button; GameHand owns explicit confirmation. Floating: centered noninteractive CallOverlay with winner text, controlled independently from game phase. It is transient; winner remains readable outside it. GameScore/GameMarks live in score/results panels, GameResult at match end. GameRounds never invents an unsupported `draw` outcome.

## Responsive layout

Sizing constants live in config/table.styles. All grid children have `minInlineSize: 0`; shell uses `minBlockSize: 100dvh`. Do not set body overflow hidden to conceal failures. Table's parent must supply real inline and block size; `height: 100%` on an auto-sized ancestor is not sufficient. Header/hand/footer consume board space, so measure the complete composition, not an empty felt.

| Viewport | Required arrangement |
| --- | --- |
| 1440×900 | Shell bounded to approximately 1360px; two-column game area `minmax(0, 1fr) 280px`, gap from tokens. BoardFrame at least 680px block size; shell top/footer remain compact. Scores/history inline. Human hand medium, AI avatars/names/backs visible. |
| 768×1024 | Single-column board, approximately 760px block size, medium/small hand as measured. Scores/history in modal drawer via direct action. Four seat names/counts visible; avoid large seat badges or secondary chrome. |
| 390×844 | Single column with compact topbar, narrow padding, 700px minimum BoardFrame and vertical page scrolling. Small hand cards inside a horizontal ScrollArea with adequate focus/selection padding. Compact seats show name, count, score and active/dealer text; suppress decorative avatar/hidden-back fan if needed, never names or counts. Rules/settings/results outside the board in viewport-bound overlays. |

Use breakpoint 1100px for inline sidebar and 600px for compact chrome, as named constants. Hand scroll belongs inside its region, not the page; focus scrolls selected buttons into view. Do not shrink interactive targets below 24×24 CSS px; aim for 44px controls. Library small hand exposes 32px selection strips, so ensure adequate vertical target area and nonoverlapping focus outlines.

Observe the table surface's documented `data-layout-fit` attribute with a scoped MutationObserver/ref and cleanup (the attribute is on the measured inner surface, not necessarily root). `measuring` is a normal transient state; reserve space, no blocking spinner. `insufficient-space` is not success: first use compact seats and move header/action strips outside the measured table while preserving normal page order; move the hand to an external sized dock in this emergency layout. Grow BoardFrame vertically (e.g. 900px) and permit page scroll. Re-measure; do not scale the whole UI below the library's card floor. If still insufficient, retain the board as a visual summary and expose the full human hand, legal actions and public trick as a stacked accessible fallback outside it, with no duplicate interactive IDs. A small persistent “Compact table” label identifies fallback. Never clip the only Play button or ask the player to rotate the phone to continue. Geometry tests must detect collisions rather than trusting the attribute alone.

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
8. Settings/theme/notice persistence, malformed JSON, invalid enum/counters, unavailable storage and reset success/failure. A reset confirmation is keyboard operable.
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
