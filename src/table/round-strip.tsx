import { GameRounds } from '@jfrader/ui/game-rounds';
import { Pill } from '@jfrader/ui/pill';
import { Progress } from '@jfrader/ui/progress';
import type { TableView } from '../contracts';
import { copy } from '../content/en';
import { Inline, StatusRow, Strip } from './table.styles';

export function RoundStrip({ view, compact = false }: { view: TableView; compact?: boolean }) {
  const progress = <Progress value={view.completedTricks} max={5} label={copy.table.progressLabel(view.completedTricks, 5)}
    getValueLabel={copy.table.progressLabel} />;
  if (compact) {
    return <Strip>
      <Inline>
        <strong>{copy.table.round(view.roundNumber)}</strong>
        <span>{copy.table.trick(view.trickNumber)}</span>
        <Pill tone="accent">{view.trump ? copy.table.trumpIs(copy.suits[view.trump]) : copy.table.noTrump}</Pill>
      </Inline>
      {progress}
    </Strip>;
  }
  return <StatusRow>
    <div><strong>{copy.table.round(view.roundNumber)}</strong><span>{copy.table.trick(view.trickNumber)}</span></div>
    <GameRounds label={copy.table.roundsLabel} rounds={view.rounds}
      outcomeLabels={{ won: copy.table.roundLead, lost: copy.table.roundBehind, pending: copy.table.waiting }} />
    {progress}
  </StatusRow>;
}
