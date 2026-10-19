import { Button, Flex, Stack, styled } from '@jfrader/ui';
import { Dialog } from '@jfrader/ui/dialog';
import { GameResult } from '@jfrader/ui/game-result';
import { GameScore } from '@jfrader/ui/game-score';
import { GameRounds } from '@jfrader/ui/game-rounds';
import { MetricCard } from '@jfrader/ui/metric-card';
import type { ResultsView } from '../contracts';
import { copy } from '../content/en';
import { config } from '../config';
import { Celebration } from './celebration';

const Metrics = styled.div(({ theme }) => ({ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: theme.space[3] }));

export function ResultsDialog({ open, onOpenChange, view, onContinue, onNewGame }: {
  open: boolean; onOpenChange: (open: boolean) => void; view: ResultsView | null;
  onContinue: () => void; onNewGame: () => void;
}) {
  if (!view) return null;
  const humanPoints = view.rows.find((row) => row.key === 'south')?.value ?? 0;
  const roundLeaders = view.rows.filter((row) => row.value === Math.max(...view.rows.map((row) => row.value)));
  const humanLeads = roundLeaders.some((row) => row.key === 'south');
  const continueGame = () => { onOpenChange(false); onContinue(); };
  return <Dialog open={open} onOpenChange={onOpenChange}><Dialog.Content><Dialog.Panel><Stack>
    <Dialog.Title>{view.kind === 'round' ? copy.results.roundEyebrow(view.roundNumber) : copy.results.finalEyebrow}</Dialog.Title>
    {view.kind === 'round' ? <>
      <Dialog.Description>{copy.results.roundSummary(humanPoints)}</Dialog.Description>
      <GameScore label={copy.table.round(view.roundNumber)} rows={view.rows} locale={config.locale} />
      <GameScore label={copy.panels.totalColumn} rows={view.totals} locale={config.locale} />
      <GameRounds label={copy.panels.roundColumn} rounds={[{ key: view.roundNumber, label: copy.table.round(view.roundNumber), outcome: humanLeads ? 'won' : 'lost' }]} outcomeLabels={{ won: roundLeaders.length > 1 ? copy.table.jointRoundLead : copy.table.roundLead, lost: copy.table.roundBehind, pending: copy.table.waiting }} />
      <p>{copy.results.nextTrump}: {view.nextTrump ? copy.suits[view.nextTrump] : copy.table.noTrump}</p>
      <Button type="button" onClick={continueGame}>{copy.results.dealRound(view.roundNumber + 1)}</Button>
    </> : <>
      <GameResult outcome={view.outcome} celebration={view.outcome === 'won' ? <Celebration /> : undefined} title={copy.results[view.outcome]} summary={<Stack gap="sm"><span>{copy.results.finalSummary(humanPoints)}</span><span>{copy.results.winnerNames(new Intl.ListFormat(config.locale, { style: 'long', type: 'conjunction' }).format(view.winnerNames))}</span></Stack>} actions={<Flex gap="sm" wrap><Button type="button" onClick={() => { onOpenChange(false); onNewGame(); }}>{copy.results.playAgain}</Button><Button type="button" onClick={() => onOpenChange(false)}>{copy.results.reviewScores}</Button></Flex>} />
      <GameScore label={copy.panels.totalColumn} rows={view.rows} locale={config.locale} />
      <Metrics><MetricCard label={copy.stats.gamesPlayed} value={view.stats.gamesPlayed} locale={config.locale} /><MetricCard label={copy.stats.gamesWon} value={view.stats.gamesWon} locale={config.locale} /></Metrics>
    </>}
    <Dialog.Close>{copy.common.close}</Dialog.Close>
  </Stack></Dialog.Panel></Dialog.Content></Dialog>;
}
