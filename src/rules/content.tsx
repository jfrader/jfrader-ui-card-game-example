import { Card, Flex, Prose, Stack, styled } from '@jfrader/ui';
import { Kbd } from '@jfrader/ui/kbd';
import { GameCard } from '@jfrader/ui/game-card';
import { copy } from '../content/en';

const Details = styled(Prose)(({ theme }) => ({ minInlineSize: 0, '& h2': { marginBlockStart: theme.space[6] } }));
const Example = styled(Card)(({ theme }) => ({ padding: theme.space[4], marginBlock: theme.space[4], minInlineSize: 0 }));
const examples = {
  follow: 'Clubs were led. If you hold the two of clubs and the ace of hearts, you must play the club—even when hearts are trump.',
  trump: 'Hearts are trump and clubs were led. A player with no clubs may play the two of hearts: it beats the ace of clubs. Playing trump is optional when you cannot follow suit.',
};

export function RulesContent({ compact = false }: { compact?: boolean }) {
  return <Details>
    <p>{copy.rules.intro}</p>
    <h2>{copy.rules.setupTitle}</h2><p>{copy.rules.setupBody}</p>
    <p>Turn order is South (You) → West (Nora) → North (Eli) → East (Wren) → South. “Left of the dealer” means the next seat in this order. That seat leads the first trick; later tricks are led by the previous winner.</p>
    <p>Each round uses a freshly shuffled 52-card French deck without jokers. Deal one card at a time, starting left of the dealer, for five passes. Each player receives five cards. The other 32 cards remain face down and are not used. Cards can recur in later rounds, never within a round.</p>
    <h2>{copy.rules.playTitle}</h2><p>{copy.rules.playBody}</p>
    <p>Play continues in the same cyclic order from the leader, with one card per player. There is no obligation to trump, overtrump or beat the current winning card. Any card can lead; trump does not need to be “broken.”</p>
    <Example><Stack gap="sm"><strong>{copy.rules.playTitle}</strong><Flex gap="md" wrap><GameCard value={{ deck: 'french', suit: 'clubs', rank: '2' }} label="Two of clubs" face="print" size="md" /><GameCard value={{ deck: 'french', suit: 'hearts', rank: 'A' }} label="Ace of hearts" face="print" size="md" /></Flex><p>{examples.follow}</p></Stack></Example>
    <h2>{copy.rules.winTitle}</h2><p>{copy.rules.winBody}</p>
    <p>Ranks run 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A. Ace is always high. Off-suit cards that are not trump cannot win; suits have no ranking of their own.</p>
    <h2>{copy.rules.trumpTitle}</h2><p>{copy.rules.trumpBody}</p>
    <Example><Stack gap="sm"><strong>{copy.rules.trumpTitle}</strong><Flex gap="md" wrap><GameCard value={{ deck: 'french', suit: 'clubs', rank: 'A' }} label="Ace of clubs, led suit" face="print" size="md" /><GameCard value={{ deck: 'french', suit: 'hearts', rank: '2' }} label="Two of hearts, trump" face="print" size="md" /></Flex><p>{examples.trump}</p></Stack></Example>
    <h2>{copy.rules.scoringTitle}</h2><p>{copy.rules.scoringBody}</p>
    <p>The fourth card resolves the trick and awards its winner one point immediately. All four cards stay visible until you choose Next trick. After the fifth trick choose Round results, or Final results in round five. There are exactly 25 points in a match, with no bonuses or penalties.</p>
    <p>Round results show round and total scores and the next trump. Choose Deal round to continue. A sole top score wins the match; all joint leaders are named in a draw. A round marked Round lead or Joint round lead means you had the highest round score, alone or tied. It awards no extra points.</p>
    <h2>{copy.rules.controlsTitle}</h2>
    <p>Use <Kbd>Tab</Kbd> and <Kbd>Shift</Kbd> + <Kbd>Tab</Kbd> to move through card buttons and controls. <Kbd>Enter</Kbd> or <Kbd>Space</Kbd> selects or clears a card. Activate Play card to commit it. <Kbd>Escape</Kbd> closes menus and dialogs without playing a card.</p>
    <p>In the table action bar, use arrow keys, <Kbd>Home</Kbd> and <Kbd>End</Kbd> to move between actions. Pause and Resume stop and restart play.</p>
    {!compact && <>
      <h2>{copy.settings.title}</h2>
      <p>Legal-card hints dim cards you cannot play; turning hints off does not change the rules. Auto-sort changes only the order shown in your hand. Difficulty applies to the next scheduled opponent turn.</p>
      <p>The optional 30-second turn timer is off by default. On expiry the lowest legal card is played automatically. No timer runs during trick review or results. Disabling the timer removes the deadline; enabling it starts a full timer on the next turn.</p>
      <p>Opening a dialog, visiting another page or hiding the tab pauses opponents and timers. Returning from a hidden tab requires Resume. Paused time is preserved, and no missed plays are made up.</p>
      <h2>{copy.rules.privacyTitle}</h2><p>{copy.rules.privacyBody}</p>
      <p>Stats are stored only in this browser. Only completed games count; a draw is a game played, not a win. Starting a new game requires confirmation during an unfinished match. Abandoning a match does not affect stats. Reloading returns to the ready screen, not a saved hand. Stats can be reset before or after a match.</p>
    </>}
  </Details>;
}
