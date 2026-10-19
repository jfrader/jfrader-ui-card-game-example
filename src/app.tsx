import { lazy, Suspense, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Alert, Skeleton, Stack, styled } from '@jfrader/ui';
import { AnnouncementBar } from '@jfrader/ui/announcement-bar';
import { Drawer } from '@jfrader/ui/drawer';
import { ErrorBoundary } from './app/error-boundary';
import { useGameController, type GameController } from './app/use-game-controller';
import { useMediaQuery } from './app/use-media-query';
import { AppShell } from './components/app-shell';
import { config } from './config';
import { copy } from './content/en';
import { NewGameDialog } from './panels/new-game-dialog';
import { ResultsDialog } from './panels/results-dialog';
import { RulesDialog } from './panels/rules-dialog';
import { ScoreHistory } from './panels/score-history';
import { SettingsDrawer } from './panels/settings-drawer';
import { NotFoundPage } from './pages/not-found';
import { GameBoard } from './table/game-board';
import { useTheme } from './theme';

const RulesPage = lazy(() =>
  import('./pages/rules').then((module) => ({ default: module.RulesPage })),
);

const GameArea = styled.div<{ $inline: boolean }>(({ theme, $inline }) => ({
  display: 'grid',
  gridTemplateColumns: $inline ? `minmax(0, 1fr) ${config.layout.sidebarInline}px` : 'minmax(0, 1fr)',
  gap: theme.space[6],
  alignItems: 'start',
  minInlineSize: 0,
}));

const BoardColumn = styled.div({
  minInlineSize: 0,
});

const SideColumn = styled.aside(({ theme }) => ({
  position: 'sticky',
  insetBlockStart: theme.space[4],
  minInlineSize: 0,
  '&:focus': { outline: 'none' },
}));

const Notice = styled.div(({ theme }) => ({
  marginBlockEnd: theme.space[4],
}));

const PageTitle = styled.h1({
  position: 'absolute',
  inlineSize: 1,
  blockSize: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
});

function errorMessage(error: GameController['error'], ledSuit: GameController['view']['ledSuit']): string {
  switch (error) {
    case 'must-follow-suit':
      return copy.errors.mustFollowSuit(ledSuit ? copy.suits[ledSuit] : 'the led suit');
    case 'wrong-player':
      return copy.errors.wrongTurn;
    case 'wrong-phase':
      return copy.errors.wrongPhase;
    case 'stale-action':
      return copy.errors.stale;
    case 'unknown-card':
      return copy.errors.unknownCard;
    case 'storage':
      return copy.errors.storage;
    default:
      return copy.errors.wrongPhase;
  }
}

function TableRoute({
  controller,
  inlineSidebar,
}: {
  controller: GameController;
  inlineSidebar: boolean;
}) {
  useEffect(() => {
    if (!inlineSidebar || !controller.dialogs.scores) return;
    const panel = document.getElementById('score-history');
    panel?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    panel?.focus({ preventScroll: true });
    controller.closeDialog('scores');
  }, [inlineSidebar, controller.dialogs.scores, controller.closeDialog]);

  return (
    <>
      <PageTitle>{copy.app.name}</PageTitle>
      {!controller.noticeDismissed && controller.view.phase === 'ready' && (
        <Notice>
          <AnnouncementBar
            open
            onOpenChange={(open) => {
              if (!open) controller.dismissNotice();
            }}
            messages={[
              {
                id: 'welcome',
                message: copy.announcement.message,
                action: {
                  label: copy.announcement.action,
                  onClick: () => controller.openDialog('rules'),
                },
              },
            ]}
            dismissible
            autoPlay={false}
            tone="info"
            variant="subtle"
          />
        </Notice>
      )}

      {controller.error && (
        <Notice>
          <Alert
            tone="warning"
            title={copy.errors.title}
            onDismiss={controller.clearError}
            dismissLabel={copy.common.close}
          >
            {errorMessage(controller.error, controller.view.ledSuit)}
          </Alert>
        </Notice>
      )}

      <GameArea $inline={inlineSidebar}>
        <BoardColumn>
          <GameBoard
            view={controller.view}
            selectedCardId={controller.selectedCardId}
            onSelectCard={controller.selectCard}
            onPlayCard={controller.playCard}
            onCommand={controller.handleCommand}
          />
        </BoardColumn>
        {inlineSidebar && (
          <SideColumn id="score-history" tabIndex={-1} aria-label={copy.a11y.scoreRegion}>
            <ScoreHistory view={controller.scoreHistory} now={controller.now} />
          </SideColumn>
        )}
      </GameArea>

      {!inlineSidebar && (
        <Drawer
          open={controller.dialogs.scores}
          onOpenChange={(open) => {
            if (!open) controller.closeDialog('scores');
          }}
        >
          <Drawer.Content>
            <Drawer.Panel>
              <Drawer.Header>
                <Drawer.Title>{copy.panels.scores}</Drawer.Title>
                <Drawer.Close>{copy.common.close}</Drawer.Close>
              </Drawer.Header>
              <Drawer.Body>
                <ScoreHistory view={controller.scoreHistory} now={controller.now} />
              </Drawer.Body>
            </Drawer.Panel>
          </Drawer.Content>
        </Drawer>
      )}
    </>
  );
}

function SuspenseFallback() {
  return (
    <Stack gap="sm" aria-busy="true">
      <Skeleton width="55%" height="2rem" />
      <Skeleton width="100%" height="1rem" />
      <Skeleton width="82%" height="1rem" />
    </Stack>
  );
}

export function App() {
  const themeState = useTheme();
  const controller = useGameController();
  const location = useLocation();
  const inlineSidebar = useMediaQuery(`(min-width: ${config.breakpoints.inlineSidebar}px)`);
  const previousPath = useRef(location.pathname);

  useEffect(() => {
    controller.setRoutePaused(location.pathname !== '/');
    return () => controller.setRoutePaused(false);
  }, [location.pathname, controller.setRoutePaused]);

  useEffect(() => {
    document.title =
      location.pathname === '/rules' ? `${copy.rules.title} · ${copy.app.name}` : copy.app.name;
  }, [location.pathname]);

  useEffect(() => {
    if (previousPath.current === location.pathname) return;
    previousPath.current = location.pathname;
    document.getElementById('main')?.focus();
  }, [location.pathname]);

  return (
    <ErrorBoundary>
      <AppShell
        theme={themeState.theme}
        onThemeChange={themeState.setTheme}
        onCommand={controller.handleShellCommand}
      >
        <Routes>
          <Route
            path="/"
            element={<TableRoute controller={controller} inlineSidebar={inlineSidebar} />}
          />
          <Route
            path="/rules"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <RulesPage />
              </Suspense>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/table" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>

      <SettingsDrawer
        open={controller.dialogs.settings}
        onOpenChange={(open) => {
          if (open) controller.openDialog('settings');
          else controller.closeDialog('settings');
        }}
        settings={controller.settings}
        stats={controller.stats}
        canResetStats={controller.canResetStats}
        onSettingsChange={controller.updateSettings}
        onResetStats={controller.resetStats}
      />
      <RulesDialog
        open={controller.dialogs.rules}
        onOpenChange={(open) => {
          if (open) controller.openDialog('rules');
          else controller.closeDialog('rules');
        }}
      />
      <ResultsDialog
        open={controller.dialogs.results}
        onOpenChange={(open) => {
          if (open) controller.openDialog('results');
          else controller.closeDialog('results');
        }}
        view={controller.results}
        onContinue={controller.continueGame}
        onNewGame={controller.startGame}
      />
      <NewGameDialog
        open={controller.dialogs.newGame}
        onOpenChange={(open) => {
          if (open) controller.openDialog('newGame');
          else controller.closeDialog('newGame');
        }}
        onConfirm={controller.confirmNewGame}
      />
    </ErrorBoundary>
  );
}
