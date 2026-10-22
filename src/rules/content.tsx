import type { ReactNode } from 'react';
import { Card, Flex, Prose, Stack, styled } from '@jfrader/ui';
import { Kbd } from '@jfrader/ui/kbd';
import { GameCard } from '@jfrader/ui/game-card';
import { copy } from '../content/en';

const Details = styled(Prose)(({ theme }) => ({
  minInlineSize: 0,
  '& h2': { marginBlockStart: theme.space[6] },
}));
const Example = styled(Card)(({ theme }) => ({
  padding: theme.space[4],
  marginBlock: theme.space[4],
  minInlineSize: 0,
}));

const KEY_PLACEHOLDER = /\{(\w+)\}/;

/** Renders the `{Key}` placeholders of a copy string as <Kbd>, one placeholder per recursion. */
function renderKeys(text: string): ReactNode {
  const match = KEY_PLACEHOLDER.exec(text);
  if (!match) return text;
  const before = text.slice(0, match.index);
  const after = text.slice(match.index + match[0].length);
  return (
    <>
      {before}
      <Kbd>{match[1]}</Kbd>
      {renderKeys(after)}
    </>
  );
}

export function RulesContent({ compact = false }: { compact?: boolean }) {
  return (
    <Details>
      <p>{copy.rules.intro}</p>
      <h2>{copy.rules.setupTitle}</h2>
      <p>{copy.rules.setupBody}</p>
      <p>{copy.rules.setupTurnOrder}</p>
      <p>{copy.rules.setupDeal}</p>
      <h2>{copy.rules.playTitle}</h2>
      <p>{copy.rules.playBody}</p>
      <p>{copy.rules.playOrder}</p>
      <Example>
        <Stack gap="sm">
          <strong>{copy.rules.playTitle}</strong>
          <Flex gap="md" wrap>
            <GameCard
              value={{ deck: 'french', suit: 'clubs', rank: '2' }}
              label={copy.rules.followExample.lowCard}
              face="print"
              size="md"
            />
            <GameCard
              value={{ deck: 'french', suit: 'hearts', rank: 'A' }}
              label={copy.rules.followExample.highCard}
              face="print"
              size="md"
            />
          </Flex>
          <p>{copy.rules.followExample.body}</p>
        </Stack>
      </Example>
      <h2>{copy.rules.winTitle}</h2>
      <p>{copy.rules.winBody}</p>
      <p>{copy.rules.winRanks}</p>
      <h2>{copy.rules.trumpTitle}</h2>
      <p>{copy.rules.trumpBody}</p>
      <Example>
        <Stack gap="sm">
          <strong>{copy.rules.trumpTitle}</strong>
          <Flex gap="md" wrap>
            <GameCard
              value={{ deck: 'french', suit: 'clubs', rank: 'A' }}
              label={copy.rules.trumpExample.ledCard}
              face="print"
              size="md"
            />
            <GameCard
              value={{ deck: 'french', suit: 'hearts', rank: '2' }}
              label={copy.rules.trumpExample.trumpCard}
              face="print"
              size="md"
            />
          </Flex>
          <p>{copy.rules.trumpExample.body}</p>
        </Stack>
      </Example>
      <h2>{copy.rules.scoringTitle}</h2>
      <p>{copy.rules.scoringBody}</p>
      <p>{copy.rules.scoringResolve}</p>
      <p>{copy.rules.scoringResults}</p>
      <h2>{copy.rules.controlsTitle}</h2>
      <p>{renderKeys(copy.rules.controlsKeyboard)}</p>
      <p>{renderKeys(copy.rules.controlsActions)}</p>
      {!compact && (
        <>
          <h2>{copy.settings.title}</h2>
          <p>{copy.rules.settingsHints}</p>
          <p>{copy.rules.settingsTimer}</p>
          <p>{copy.rules.settingsPause}</p>
          <h2>{copy.rules.privacyTitle}</h2>
          <p>{copy.rules.privacyBody}</p>
          <p>{copy.rules.privacyStats}</p>
        </>
      )}
    </Details>
  );
}
