import { useEffect, useRef } from 'react';
import { styled } from '@jfrader/ui';
import { Drawer } from '@jfrader/ui/drawer';
import type { GameController } from './use-game-controller';
import { dialogBinding } from './use-dialogs';
import { config } from '../config';
import { copy } from '../content/en';
import { Scoreboard } from '../game/panels/scoreboard';
import { useSheetSide } from '../game/panels/sheet-side';
import { VisuallyHidden } from '../ui/styles';
import { GameBoard } from '../game/board/game-board';

const GameArea = styled.div<{ $inline: boolean }>(({ theme: t, $inline }) => ({
  display: 'grid',
  gridTemplateColumns: $inline ? `minmax(0, 1fr) ${config.layout.sidebarInline}px` : 'minmax(0, 1fr)',
  gap: t.space[4],
  minInlineSize: 0,
}));

const Rail = styled.aside(({ theme: t }) => ({
  minInlineSize: 0,
  minBlockSize: 0,
  overflowY: 'auto',
  padding: t.space[4],
  border: `1px solid ${t.color.border}`,
  borderRadius: t.radius.lg,
  backgroundColor: t.color.surface,
  '&:focus': { outline: 'none' },
}));

export function TableRoute({
  controller,
  inlineSidebar,
}: {
  controller: GameController;
  inlineSidebar: boolean;
}) {
  const side = useSheetSide();
  const previousScores = useRef(controller.dialogs.scores);
  useEffect(() => {
    if (inlineSidebar && previousScores.current) document.getElementById('score-rail')?.focus();
    previousScores.current = controller.dialogs.scores;
  }, [inlineSidebar, controller.dialogs.scores]);

  return (
    <>
      <VisuallyHidden as="h1">{copy.app.name}</VisuallyHidden>
      <GameArea $inline={inlineSidebar}>
        <GameBoard
          view={controller.view}
          stats={controller.stats}
          showScores={!inlineSidebar}
          selectedCardId={controller.selectedCardId}
          onSelectCard={controller.selectCard}
          onPlayCard={controller.playCard}
          onCommand={controller.handleCommand}
          onDifficultyChange={(difficulty) =>
            controller.updateSettings({ ...controller.settings, difficulty })
          }
        />
        {inlineSidebar && (
          <Rail id="score-rail" tabIndex={-1} aria-label={copy.a11y.scoreRegion}>
            <Scoreboard view={controller.scoreHistory} now={controller.now} />
          </Rail>
        )}
      </GameArea>
      {!inlineSidebar && (
        <Drawer side={side} draggable={side === 'bottom'} {...dialogBinding(controller, 'scores')}>
          <Drawer.Content>
            <Drawer.Panel>
              <Drawer.Header>
                <Drawer.Title>{copy.scores.title}</Drawer.Title>
                <Drawer.Close>{copy.common.close}</Drawer.Close>
              </Drawer.Header>
              <Drawer.Body>
                <Scoreboard view={controller.scoreHistory} now={controller.now} />
              </Drawer.Body>
            </Drawer.Panel>
          </Drawer.Content>
        </Drawer>
      )}
    </>
  );
}
