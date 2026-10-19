export const config = {
  appName: 'Fivefold',
  locale: 'en',
  storage: {
    theme: 'fivefold.theme.v1',
    settings: 'fivefold.settings.v1',
    stats: 'fivefold.stats.v1',
    notice: 'fivefold.notice.v1',
  },
  timing: {
    aiDelayMs: Number.isFinite(Number(import.meta.env.VITE_AI_DELAY_MS))
      ? Number(import.meta.env.VITE_AI_DELAY_MS)
      : 650,
    turnDurationMs: 30_000,
    statusTickMs: 1_000,
    trickAnnouncementMs: 1_400,
  },
  breakpoints: {
    inlineSidebar: 1_100,
    compactChrome: 600,
  },
  layout: {
    shellMaxInline: 1_360,
    sidebarInline: 280,
    tableMinBlock: 360,
    tableMaxBlock: 640,
    tableChromeBlock: 450,
    phoneTableBlock: 700,
  },
  urls: {
    library: 'https://github.com/jfrader/jfrader-ui',
    docs: 'https://ui.jfrader.com',
    boilerplate: 'https://github.com/jfrader/jfrader-ui-boilerplate',
    source: 'https://github.com/jfrader/jfrader-ui-card-game-example',
  },
} as const;
