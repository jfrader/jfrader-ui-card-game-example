import { SUITS, TURN_ORDER } from './constants';
import { validCard } from './deck';
import { currentPlayer, rankStrength } from './selectors';
import type { Card, GameState, PlayerKey, Suit, TrickPlay } from './types';

export function legalMoves(state: GameState, playerKey: PlayerKey): readonly Card[] {
  if (currentPlayer(state) !== playerKey) return [];
  const hand = state.round.hands[playerKey];
  const ledSuit = state.round.currentTrick.plays[0]?.card.suit;
  const following = hand.filter((card) => card.suit === ledSuit);
  return following.length > 0 ? following : [...hand];
}

export function resolveTrick(plays: readonly TrickPlay[], trump: Suit | null): PlayerKey {
  if (!Array.isArray(plays) || plays.length < 1 || plays.length > TURN_ORDER.length
    || (trump !== null && !SUITS.includes(trump))
    || Array.from(plays).some((play) => play == null || !TURN_ORDER.includes(play.playerKey) || !validCard(play.card))
    || new Set(plays.map((play) => play.playerKey)).size !== plays.length
    || new Set(plays.map((play) => play.card.id)).size !== plays.length) {
    throw new RangeError('Expected one to four distinct valid plays');
  }
  let winning = plays[0]!;
  for (const play of plays.slice(1)) {
    if ((play.card.suit === winning.card.suit && rankStrength(play.card.rank) > rankStrength(winning.card.rank))
      || (play.card.suit === trump && winning.card.suit !== trump)) winning = play;
  }
  return winning.playerKey;
}
