import { lazy, Suspense, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Skeleton, Stack, styled } from '@jfrader/ui';
import { Drawer } from '@jfrader/ui/drawer';
import { ErrorBoundary } from './error-boundary';
import { useGameController, type GameController } from './use-game-controller';
import { useMediaQuery } from '../ui/use-media-query';
import { AppShell } from '../shell/app-shell';
import { config } from '../config';
import { copy } from '../content/en';
import { NewGameDialog } from '../game/panels/new-game-dialog';
import { ResultsDialog } from '../game/panels/results-dialog';
import { RulesDialog } from '../game/panels/rules-dialog';
import { Scoreboard } from '../game/panels/scoreboard';
import { SettingsDrawer } from '../game/panels/settings-drawer';
import { useSheetSide } from '../game/panels/sheet-side';
import { NotFoundPage } from '../pages/not-found';
import { VisuallyHidden } from '../ui/styles';
import { GameBoard } from '../game/board/game-board';
import { useTheme } from './theme';

const RulesPage = lazy(() => import('../pages/rules').then((module) => ({ default: module.RulesPage })));

const GameArea = styled.div<{ $inline: boolean }>(({ theme: t, $inline }) => ({
  display: 'grid',
  gridTemplateColumns: $inline ? `minmax(0, 1fr) ${config.layout.sidebarInline}px` : 'minmax(0, 1fr)',
  gap: t.space[4],
  minInlineSize: 0,
}));

const Rail = styled.aside(({ theme: t }) => ({
  minInlineSize: 0,
  minBlockSize: 0,
  overflowY: 'auto',
  padding: t.space[4],
  border: `1px solid ${t.color.border}`,
  borderRadius: t.radius.lg,
  backgroundColor: t.color.surface,
  '&:focus': { outline: 'none' },
}));

function TableRoute({ controller, inlineSidebar }: { controller: GameController; inlineSidebar: boolean }) {
  const side = useSheetSide();
  useEffect(() => {
    if (!inlineSidebar || !controller.dialogs.scores) return;
    document.getElementById('score-rail')?.focus();
    controller.closeDialog('scores');
  }, [inlineSidebar, controller.dialogs.scores, controller.closeDialog]);

  return (
    <>
      <VisuallyHidden as="h1">{copy.app.name}</VisuallyHidden>
      <GameArea $inline={inlineSidebar}>
        <GameBoard
          view={controller.view}
          stats={controller.stats}
          showScores={!inlineSidebar}
          selectedCardId={controller.selectedCardId}
          onSelectCard={controller.selectCard}
          onPlayCard={controller.playCard}
          onCommand={controller.handleCommand}
          onDifficultyChange={(difficulty) =>
            controller.updateSettings({ ...controller.settings, difficulty })
          }
        />
        {inlineSidebar && (
          <Rail id="score-rail" tabIndex={-1} aria-label={copy.a11y.scoreRegion}>
            <Scoreboard view={controller.scoreHistory} now={controller.now} />
          </Rail>
        )}
      </GameArea>

      {!inlineSidebar && (
        <Drawer
          side={side}
          draggable={side === 'bottom'}
          open={controller.dialogs.scores}
          onOpenChange={(open) => {
            if (!open) controller.closeDialog('scores');
          }}
        >
          <Drawer.Content>
            <Drawer.Panel>
              <Drawer.Header>
                <Drawer.Title>{copy.scores.title}</Drawer.Title>
                <Drawer.Close>{copy.common.close}</Drawer.Close>
              </Drawer.Header>
              <Drawer.Body>
                <Scoreboard view={controller.scoreHistory} now={controller.now} />
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
          <Route path="/" element={<TableRoute controller={controller} inlineSidebar={inlineSidebar} />} />
          <Route
            path="/rules"
            element={
              <Suspense fallback={<SuspenseFallback />}>
                <RulesPage />
              </Suspense>
            }
          />
          <Route path="/table" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
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
