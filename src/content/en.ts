import { config } from '../config';
import type { Suit } from '../engine/types';

const pluralRules = new Intl.PluralRules(config.locale);
const word = (count: number, forms: Record<'one' | 'other', string>) =>
  pluralRules.select(count) === 'one' ? forms.one : forms.other;
const pointWord = (n: number) => word(n, { one: 'point', other: 'points' });
const cards = (n: number) => `${n} ${word(n, { one: 'card', other: 'cards' })}`;
const points = (n: number) => `${n} ${pointWord(n)}`;
const tricks = (n: number) => `${n} ${word(n, { one: 'trick', other: 'tricks' })}`;

export const copy = {
  app: {
    name: 'Fivefold',
  },
  nav: {
    label: 'Main',
    table: 'Table',
    rules: 'Rules',
  },
  commands: {
    label: 'Game commands',
    newGame: 'New game',
    settings: 'Settings',
    scores: 'Scores',
  },
  common: {
    close: 'Close',
    cancel: 'Cancel',
    done: 'Done',
  },
  table: {
    regionLabel: 'Fivefold game table',
    actionsLabel: 'Table actions',
    round: (n: number) => `Round ${n}`,
    trickOf: (n: number, total: number) => `Trick ${n} of ${total}`,
    hudRound: 'Round',
    hudTrick: 'Trick',
    trump: 'Trump',
    noTrump: 'No trump',
    dealer: 'Dealer',
    yourTurn: 'Your turn',
    playing: 'Playing',
    takesTrick: 'Wins trick',
    cards,
    points,
    pointWord,
    start: 'Start game',
    howToPlay: 'How to play',
    nextTrick: 'Next trick',
    roundResults: 'Round results',
    finalResults: 'Final results',
    pause: 'Pause',
    resume: 'Resume',
    emptyPlay: (name: string) => `${name} has not played`,
    playedCard: (name: string, card: string) => `${name} played ${card}`,
    roundCall: (round: number, trump: string) => `Round ${round} · ${trump}`,
    readyTitle: 'Fivefold',
    readyBody: 'Five rounds of five tricks against three opponents. Follow suit, take tricks, finish on top.',
  },
  status: {
    lead: 'Lead any card',
    follow: (suit: string) => `Follow ${suit} if you can`,
    waiting: (name: string) => `${name} is playing`,
    waitingDetail: 'Wait for your turn',
    youTake: 'You take the trick',
    takes: (name: string) => `${name} takes the trick`,
    tricksPlayed: (done: number, total: number) => `${done} of ${total} tricks played`,
    roundOver: (round: number) => `Round ${round} complete`,
    matchOver: 'Match complete',
    paused: 'Paused',
  },
  suits: {
    hearts: 'hearts',
    diamonds: 'diamonds',
    clubs: 'clubs',
    spades: 'spades',
  },
  suitTitles: {
    hearts: 'Hearts',
    diamonds: 'Diamonds',
    clubs: 'Clubs',
    spades: 'Spades',
  },
  ranks: {
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five',
    '6': 'six',
    '7': 'seven',
    '8': 'eight',
    '9': 'nine',
    '10': 'ten',
    J: 'jack',
    Q: 'queen',
    K: 'king',
    A: 'ace',
  },
  hand: {
    playLabel: 'Play card',
    regionLabel: 'Your hand',
  },
  settings: {
    title: 'Settings',
    gameSection: 'Game',
    statsSection: 'Local stats',
    difficulty: 'Opponents',
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    hints: 'Show legal cards',
    hintsDescription: 'Darken cards you cannot play.',
    timer: 'Turn timer (30s)',
    timerDescription: 'Play the lowest legal card when time runs out.',
    autoSort: 'Sort hand',
    autoSortDescription: 'Group by suit, low to high.',
    resetStats: 'Reset stats',
    resetStatsPending: 'Resetting',
    resetStatsSuccess: 'Stats reset',
    resetStatsError: 'Could not reset stats',
    resetStatsConfirm: 'Reset local stats? This cannot be undone.',
  },
  scores: {
    title: 'Scores',
    log: 'Log',
    caption: 'Points by round',
    player: 'Player',
    total: 'Total',
    roundHeader: (n: number) => `${n}`,
    roundHeaderLabel: (n: number) => `Round ${n}`,
    upcoming: 'Not played',
    leading: 'Leading',
    you: 'You',
    current: 'Current round',
    pendingScore: '–',
    roundLeads: 'Your rounds',
    led: 'Led',
    behind: 'Behind',
    pending: 'Upcoming',
    noHistory: 'No plays yet',
    noHistoryDescription: 'Start a game to fill the log.',
  },
  stats: {
    gamesPlayed: 'Played',
    gamesWon: 'Won',
    winRate: 'Win rate',
    localOnly: 'Stored in this browser only.',
  },
  results: {
    won: 'You win',
    lost: 'You lose',
    draw: 'Draw',
    roundEyebrow: (round: number, total: number) => `Round ${round} of ${total}`,
    roundTitle: (round: number) => `Round ${round} complete`,
    finalEyebrow: 'Match complete',
    yourTricks: (n: number) => `You took ${tricks(n)}`,
    lead: {
      sole: 'You led the round',
      joint: 'You tied for the lead',
      behind: 'Behind this round',
    },
    finalSummary: (n: number) => `You finished with ${points(n)}.`,
    winnerNames: (names: string) => `Winners: ${names}`,
    nextTrump: 'Next trump',
    dealRound: (round: number) => `Deal round ${round}`,
    playAgain: 'Play again',
    reviewScores: 'Review scores',
  },
  rules: {
    title: 'How to play Fivefold',
    intro:
      'Fivefold is a four-seat trick-taking game. You play South against Ada, Milo and Iris. Win tricks, follow suit and finish with the most points after five rounds.',
    setupTitle: 'Setup',
    setupBody:
      'Five rounds of five cards each. The dealer rotates every round: you deal first, then West, North, East and you again.',
    setupTurnOrder:
      'Turn order is South (You) → West (Ada) → North (Milo) → East (Iris) → South. “Left of the dealer” means the next seat in this order. That seat leads the first trick; later tricks are led by the previous winner.',
    setupDeal:
      'Each round uses a freshly shuffled 52-card French deck without jokers. Deal one card at a time, starting left of the dealer, for five passes. Each player receives five cards. The other 32 cards remain face down and are not used. Cards can recur in later rounds, never within a round.',
    playTitle: 'Playing a trick',
    playBody:
      'The leader plays any card. Everyone else must follow the led suit when they can. If you have no card of that suit, play anything, including trump.',
    playOrder:
      'Play continues in the same cyclic order from the leader, with one card per player. There is no obligation to trump, overtrump or beat the current winning card. Any card can lead; trump does not need to be “broken.”',
    followExample: {
      lowCard: 'Two of clubs',
      highCard: 'Ace of hearts',
      body: 'Clubs were led. If you hold the two of clubs and the ace of hearts, you must play the club—even when hearts are trump.',
    },
    winTitle: 'Winning a trick',
    winBody:
      'If any trump was played, the highest trump wins. Otherwise the highest card of the led suit wins. The winner leads the next trick.',
    winRanks:
      'Ranks run 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A. Ace is always high. Off-suit cards that are not trump cannot win; suits have no ranking of their own.',
    trumpTitle: 'Trump',
    trumpBody:
      'Rounds one to four use hearts, diamonds, clubs and spades as trump. Round five has no trump, so only the led suit can win.',
    trumpExample: {
      ledCard: 'Ace of clubs, led suit',
      trumpCard: 'Two of hearts, trump',
      body: 'Hearts are trump and clubs were led. A player with no clubs may play the two of hearts: it beats the ace of clubs. Playing trump is optional when you cannot follow suit.',
    },
    scoringTitle: 'Scoring',
    scoringBody:
      'One point per trick. The player with the most points after round five wins. A tie at the top is a draw, even if you are not one of the leaders.',
    scoringResolve:
      'The fourth card resolves the trick and awards its winner one point immediately. All four cards stay visible until you choose Next trick. After the fifth trick choose Round results, or Final results in round five. There are exactly 25 points in a match, with no bonuses or penalties.',
    scoringResults:
      'Round results show round and total scores and the next trump. Choose Deal round to continue. A sole top score wins the match; all joint leaders are named in a draw. Under Your rounds, Led means you had the highest round score, alone or tied. It awards no extra points.',
    controlsTitle: 'Controls',
    /** `{Key}` placeholders render as keyboard keys. */
    controlsKeyboard:
      'Use {Tab} and {Shift} + {Tab} to move through card buttons and controls. {Enter} or {Space} selects or clears a card. Activate Play card to commit it. {Escape} closes menus and dialogs without playing a card.',
    controlsActions:
      'In the table actions, use arrow keys, {Home} and {End} to move between actions. Pause and Resume stop and restart play.',
    settingsHints:
      'Legal-card hints dim cards you cannot play; turning hints off does not change the rules. Auto-sort changes only the order shown in your hand. Difficulty applies to the next scheduled opponent turn.',
    settingsTimer:
      'The optional 30-second turn timer is off by default. On expiry the lowest legal card is played automatically. No timer runs during trick review or results. Disabling the timer removes the deadline; enabling it starts a full timer on the next turn.',
    settingsPause:
      'Opening a dialog, visiting another page or hiding the tab pauses opponents and timers. Returning from a hidden tab requires Resume. Paused time is preserved, and no missed plays are made up.',
    privacyTitle: 'Opponents',
    privacyBody:
      'Ada, Milo and Iris play from hidden hands. Only their card counts are public until a card is played.',
    privacyStats:
      'Stats are stored only in this browser. Only completed games count; a draw is a game played, not a win. Starting a new game requires confirmation during an unfinished match. Abandoning a match does not affect stats. Reloading returns to the ready screen, not a saved hand. Stats can be reset before or after a match.',
    back: 'Back to table',
  },
  errors: {
    mustFollowSuit: (suit: string) => `Follow ${suit}.`,
    unknownCard: 'That card is not in your hand.',
    wrongTurn: 'Wait for your turn.',
    wrongPhase: 'That move is not available now.',
    stale: 'The game moved on. Try again.',
    renderTitle: 'Something went wrong',
    renderBody: 'Reload the page to start again.',
    reload: 'Reload',
  },
  a11y: {
    skipToContent: 'Skip to content',
    main: 'Main content',
    theme: 'Theme',
    scoreRegion: 'Scores',
    hudRegion: 'Round status',
    turnTime: 'Turn time left',
    cardBack: 'Face-down card',
  },
  footer: {
    builtWith: 'Built with @jfrader/ui',
    docs: 'Documentation',
    source: 'Source',
    license: 'MIT',
  },
  pause: {
    manual: 'Resume to keep playing',
    modal: 'Paused while a dialog is open',
    route: 'Paused while away from the table',
    hidden: 'Paused while the tab was hidden',
  },
  toast: {
    storageWarning: 'Settings could not be saved.',
  },
  timeline: {
    region: 'Play history',
    empty: 'No plays yet.',
    played: (name: string, card: string) => `${name} played ${card}`,
    roundStart: (round: number, trump: string) => `Round ${round} · ${trump}`,
    roundEnd: (round: number) => `Round ${round} complete`,
    autoPlayed: 'Played automatically',
  },
  notFound: {
    title: 'Page not found',
    description: 'That page does not exist.',
    action: 'Back to the table',
  },
  dialogs: {
    newGameConfirm:
      'End this match and deal a new game? The unfinished match will not count toward your stats.',
  },
} as const;

/** Visible title for a trump suit; `null` is the no-trump round. */
export function trumpLabel(trump: Suit | null): string {
  return trump ? copy.suitTitles[trump] : copy.table.noTrump;
}
