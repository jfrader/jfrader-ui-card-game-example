import { copy } from '../../content/en';
import type { Card, GameState, PlayerKey } from '../../engine/types';

export function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function cardLabel(card: Card): string {
  return `${capitalize(copy.ranks[card.rank])} of ${copy.suits[card.suit]}`;
}

export function playerName(state: GameState, key: PlayerKey): string {
  return state.players.find((player) => player.key === key)?.name ?? key;
}

export function trickWinnerText(state: GameState, winner: PlayerKey | null): string {
  if (!winner) return '';
  return winner === 'south' ? copy.status.youTake : copy.status.takes(playerName(state, winner));
}
