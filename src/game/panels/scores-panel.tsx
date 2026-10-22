import { styled } from '@jfrader/ui';
import { GameRounds } from '@jfrader/ui/game-rounds';
import type { ScoreHistoryView } from '../../contracts';
import { config } from '../../config';
import { copy } from '../../content/en';
import { visuallyHidden, VisuallyHidden } from '../../ui/styles';
import { ScoreTable } from './score-table';

const RoundLeads = styled(GameRounds)(({ theme: t }) => ({
  '& [data-ui~="game-rounds-list"]': {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
    gap: t.space[1],
  },
  '& [data-outcome="pending"] [data-ui~="game-rounds-outcome"]': visuallyHidden,
}));

export function ScoresPanel({ view }: { view: ScoreHistoryView }) {
  return (
    <>
      <ScoreTable view={view.table} />
      <RoundLeads
        surface="transparent"
        sx={{ padding: 0 }}
        locale={config.locale}
        label={copy.scores.roundLeads}
        rounds={view.roundLeads.map((round, index) => ({
          ...round,
          number: index + 1,
          current: view.table.rounds[index]?.state === 'current',
          label: <VisuallyHidden>{copy.scores.roundHeaderLabel(index + 1)}</VisuallyHidden>,
        }))}
        outcomeLabels={{ won: copy.scores.led, lost: copy.scores.behind, pending: copy.scores.pending }}
      />
    </>
  );
}
