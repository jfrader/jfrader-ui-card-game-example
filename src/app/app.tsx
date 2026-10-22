import { lazy, Suspense, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ErrorBoundary } from './error-boundary';
import { useGameController } from './use-game-controller';
import { dialogBinding } from './use-dialogs';
import { TableRoute } from './table-route';
import { SuspenseFallback } from './suspense-fallback';
import { useMediaQuery } from '../ui/use-media-query';
import { AppShell } from '../shell/app-shell';
import { config } from '../config';
import { copy } from '../content/en';
import { NewGameDialog } from '../game/panels/new-game-dialog';
import { ResultsDialog } from '../game/panels/results-dialog';
import { RulesDialog } from '../game/panels/rules-dialog';
import { SettingsDrawer } from '../game/panels/settings-drawer';
import { NotFoundPage } from '../pages/not-found';
import { useTheme } from './theme';

const RulesPage = lazy(() => import('../pages/rules').then((module) => ({ default: module.RulesPage })));

export function App() {
  const themeState = useTheme();
  const controller = useGameController();
  const location = useLocation();
  const inlineSidebar = useMediaQuery(`(min-width: ${config.breakpoints.inlineSidebar}px)`);
  const previousPath = useRef(location.pathname);
  const binding = (key: Parameters<typeof dialogBinding>[1]) => dialogBinding(controller, key);

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
        {...binding('settings')}
        settings={controller.settings}
        stats={controller.stats}
        canResetStats={controller.canResetStats}
        onSettingsChange={controller.updateSettings}
        onResetStats={controller.resetStats}
      />
      <RulesDialog {...binding('rules')} />
      <ResultsDialog
        {...binding('results')}
        view={controller.results}
        onContinue={controller.continueGame}
        onNewGame={controller.startGame}
      />
      <NewGameDialog {...binding('newGame')} onConfirm={controller.confirmNewGame} />
    </ErrorBoundary>
  );
}
