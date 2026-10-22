import { PLAYERS, ROUND_COUNT, roundScores, scoreGame, TRUMPS } from '../../engine';
import type { GameState } from '../../engine/types';
import type { ScoreTableView } from '../../contracts';

function roundState(state: GameState, number: number): ScoreTableView['rounds'][number]['state'] {
  if (state.completedRounds.some((round) => round.number === number)) return 'done';
  if (state.round.number !== number) return 'upcoming';
  return state.phase === 'roundComplete' || state.phase === 'gameComplete' ? 'done' : 'current';
}

export function toScoreTable(state: GameState | null): ScoreTableView {
  const trumps = Array.from({ length: ROUND_COUNT }, (_, index) => TRUMPS[index] ?? null);
  if (!state) {
    return {
      players: PLAYERS.map((player) => ({
        key: player.key,
        name: player.name,
        isMe: player.isMe,
        total: 0,
        leader: false,
      })),
      rounds: trumps.map((trump, index) => ({ number: index + 1, state: 'upcoming', trump, scores: {} })),
    };
  }
  const { totals } = scoreGame(state);
  const top = Math.max(...Object.values(totals));
  const played = [...state.completedRounds, state.round];
  return {
    players: state.players.map((player) => ({
      key: player.key,
      name: player.name,
      isMe: player.isMe,
      total: totals[player.key],
      leader: top > 0 && totals[player.key] === top,
    })),
    rounds: trumps.map((trump, index) => {
      const number = index + 1;
      const round = played.find((item) => item.number === number);
      return { number, state: roundState(state, number), trump, scores: round ? roundScores(round) : {} };
    }),
  };
}
