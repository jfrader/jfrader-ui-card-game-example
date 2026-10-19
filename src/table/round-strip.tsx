import { GameRounds } from '@jfrader/ui/game-rounds';
import { Progress } from '@jfrader/ui/progress';
import type { TableView } from '../contracts';
import { copy } from '../content/en';
import { Inline, Strip } from './table.styles';

export function RoundStrip({ view, compact = false }: { view: TableView; compact?: boolean }) {
  return <Strip>
    <Inline><strong>{copy.table.round(view.roundNumber)}</strong><span>{copy.table.trick(view.trickNumber)}</span></Inline>
    {!compact && <GameRounds label={copy.table.roundsLabel} rounds={view.rounds}
      outcomeLabels={{ won: copy.table.roundLead, lost: copy.table.roundBehind, pending: copy.table.waiting }} />}
    <Progress value={view.completedTricks} max={5} label={copy.table.progressLabel(view.completedTricks, 5)}
      getValueLabel={copy.table.progressLabel} />
  </Strip>;
}
