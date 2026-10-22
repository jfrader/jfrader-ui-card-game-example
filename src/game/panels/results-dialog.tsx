import type { ResultsView } from '../../contracts';
import { GameResult } from './game-result';
import { RoundResult } from './round-result';

export function ResultsDialog({
  open,
  onOpenChange,
  view,
  onContinue,
  onNewGame,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: ResultsView | null;
  onContinue: () => void;
  onNewGame: () => void;
}) {
  if (!view) return null;
  if (view.kind === 'round') {
    return <RoundResult open={open} onOpenChange={onOpenChange} view={view} onContinue={onContinue} />;
  }
  return <GameResult open={open} onOpenChange={onOpenChange} view={view} onNewGame={onNewGame} />;
}
