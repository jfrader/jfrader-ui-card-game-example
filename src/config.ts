export const config = {
  appName: 'Fivefold',
  locale: 'en',
  storage: {
    theme: 'fivefold.theme.v1',
    settings: 'fivefold.settings.v1',
    stats: 'fivefold.stats.v1',
  },
  timing: {
    aiDelayMs: Number.isFinite(Number(import.meta.env.VITE_AI_DELAY_MS))
      ? Number(import.meta.env.VITE_AI_DELAY_MS)
      : 650,
    turnDurationMs: 30_000,
    statusTickMs: 1_000,
    /** Timeline-relative labels may lag this much while no human turn timer is running. */
    idleTickMs: 30_000,
    roundCallMs: 1_400,
    trumpFlipMs: 260,
  },
  breakpoints: {
    inlineSidebar: 1_100,
    compactChrome: 600,
    /** Below these widths the phone felt cannot hold four, then two, card columns. */
    feltTwoColumns: 359,
    feltOneColumn: 239,
  },
  layout: {
    shellMaxInline: 1_440,
    sidebarInline: 312,
    topbarBlock: 56,
    /** GameCard height divided by width in @jfrader/ui; keeps the dock as tall as a card row when the hand is empty. */
    gameCardAspect: 1.4,
  },
  urls: {
    library: 'https://github.com/jfrader/jfrader-ui',
    docs: 'https://ui.jfrader.com',
    boilerplate: 'https://github.com/jfrader/jfrader-ui-boilerplate',
    source: 'https://github.com/jfrader/jfrader-ui-card-game-example',
  },
} as const;
