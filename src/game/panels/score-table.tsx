import { styled } from '@jfrader/ui';
import { GameScore, type GameScoreTableSlotProps } from '@jfrader/ui/game-score';
import { SuitIcon } from '../../ui/suit-icon';
import type { ScoreTableView } from '../../contracts';
import { config } from '../../config';
import { copy } from '../../content/en';
import { VisuallyHidden } from '../../ui/styles';

const RoundLabel = styled.span({ display: 'grid', justifyItems: 'center' });

const SLOT_PROPS: GameScoreTableSlotProps = {
  table: { sx: { '& > thead th': { whiteSpace: 'nowrap' } } },
  round: { sx: (t) => ({ paddingInline: t.space[1] }) },
  cell: {
    sx: (t) => ({
      paddingInline: t.space[1],
      '&[data-state="upcoming"]': { color: t.color.textMuted },
    }),
  },
  total: { sx: (t) => ({ paddingInline: t.space[1] }) },
};

export function ScoreTable({ view }: { view: ScoreTableView }) {
  return (
    <GameScore.Table
      surface="transparent"
      sx={{ padding: 0 }}
      tabIndex={0}
      role="region"
      aria-label={copy.scores.caption}
      slotProps={SLOT_PROPS}
      caption={copy.scores.caption}
      locale={config.locale}
      rounds={view.rounds.map((round) => ({
        key: String(round.number),
        state: round.state === 'done' ? 'complete' : round.state,
        label: (
          <RoundLabel>
            <SuitIcon suit={round.trump} size={12} />
            <VisuallyHidden>{copy.scores.roundHeaderLabel(round.number)}</VisuallyHidden>
            <span aria-hidden="true">{round.number}</span>
          </RoundLabel>
        ),
      }))}
      players={view.players.map((player) => ({
        ...player,
        label: player.name,
        scores: Object.fromEntries(
          view.rounds.map((round) => [
            String(round.number),
            round.state === 'upcoming' ? undefined : (round.scores[player.key] ?? 0),
          ]),
        ),
      }))}
      labels={{
        player: copy.scores.player,
        total: copy.scores.total,
        me: copy.scores.you,
        leader: copy.scores.leading,
        current: copy.scores.current,
        upcoming: copy.scores.upcoming,
        pending: copy.scores.pendingScore,
      }}
    />
  );
}
