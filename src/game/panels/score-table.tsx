import { Crown } from 'lucide-react';
import { styled } from '@jfrader/ui';
import { SuitIcon } from '../../ui/suit-icon';
import type { ScoreTableView } from '../../contracts';
import { config } from '../../config';
import { copy } from '../../content/en';
import { VisuallyHidden } from '../../ui/styles';

const Table = styled.table(({ theme: t }) => ({
  inlineSize: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  fontSize: t.textSize.sm,
  fontVariantNumeric: 'tabular-nums',
  '& th, & td': {
    paddingBlock: t.space[2],
    paddingInline: t.space[1],
    textAlign: 'center',
    borderBlockEnd: `1px solid ${t.color.border}`,
  },
  '& tbody tr:last-of-type > *': { borderBlockEnd: 0 },
  '& thead th': {
    color: t.color.textMuted,
    fontSize: t.textSize.xs,
    fontWeight: t.fontWeight.medium,
    verticalAlign: 'bottom',
  },
  '& th[scope="row"]': {
    textAlign: 'start',
    paddingInlineStart: 0,
    fontWeight: t.fontWeight.medium,
    whiteSpace: 'nowrap',
  },
  '& thead th:first-of-type': { textAlign: 'start', paddingInlineStart: 0 },
  '& [data-total]': {
    paddingInlineEnd: 0,
    textAlign: 'end',
    fontSize: t.textSize.md,
    fontWeight: t.fontWeight.semibold,
  },
  '& thead [data-total]': { fontSize: t.textSize.xs, fontWeight: t.fontWeight.medium },
  '& [data-state="current"]': { backgroundColor: t.color.surfaceHover },
  '& thead [data-state="current"]': { color: t.color.accentText, borderTopLeftRadius: t.radius.sm, borderTopRightRadius: t.radius.sm },
  '& tbody tr:last-of-type [data-state="current"]': { borderBottomLeftRadius: t.radius.sm, borderBottomRightRadius: t.radius.sm },
  '& [data-state="upcoming"]': { color: t.color.textSubtle },
  '& tr[data-me="true"] th[scope="row"]': { color: t.color.accentText },
}));

const RoundHead = styled.span(({ theme: t }) => ({
  display: 'grid',
  justifyItems: 'center',
  gap: t.space[1],
  '& svg': { inlineSize: t.space[3], blockSize: t.space[3] },
}));

const Leader = styled(Crown)(({ theme: t }) => ({
  inlineSize: t.space[3],
  blockSize: t.space[3],
  marginInlineStart: t.space[1],
  color: t.color.warning,
  verticalAlign: 'baseline',
}));

const NUMBERS = new Intl.NumberFormat(config.locale);

export function ScoreTable({ view }: { view: ScoreTableView }) {
  return (
    <Table>
      <VisuallyHidden as="caption">{copy.scores.caption}</VisuallyHidden>
      <thead>
        <tr>
          <th scope="col">{copy.scores.player}</th>
          {view.rounds.map((round) => (
            <th key={round.number} scope="col" data-state={round.state}>
              <RoundHead>
                <SuitIcon suit={round.trump} />
                <span><VisuallyHidden>{copy.scores.roundHeaderLabel(round.number)}</VisuallyHidden><span aria-hidden="true">{round.number}</span></span>
              </RoundHead>
            </th>
          ))}
          <th scope="col" data-total="">{copy.scores.total}</th>
        </tr>
      </thead>
      <tbody>
        {view.players.map((player) => (
          <tr key={player.key} data-me={player.isMe}>
            <th scope="row">
              {player.name}
              {player.leader && <><Leader aria-hidden="true" /><VisuallyHidden>{`, ${copy.scores.leading}`}</VisuallyHidden></>}
            </th>
            {view.rounds.map((round) => (
              <td key={round.number} data-state={round.state}>
                {round.state === 'upcoming'
                  ? <><span aria-hidden="true">–</span><VisuallyHidden>{copy.scores.upcoming}</VisuallyHidden></>
                  : NUMBERS.format(round.scores[player.key] ?? 0)}
              </td>
            ))}
            <td data-total="">{NUMBERS.format(player.total)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
