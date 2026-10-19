import type { ReactNode } from 'react';
import { theme } from '@jfrader/ui';
import { GameCard } from '@jfrader/ui/game-card';
import type { TableView } from '../contracts';
import { EmptySlot, PlayEnter, TrickCell, TrickGrid } from './table.styles';

const CARD_SIZE = { md: theme.size.gameCardMd, lg: theme.size.gameCardLg } as const;

export interface TrickTrayProps {
  view: TableView;
  size: keyof typeof CARD_SIZE;
  surface?: 'felt';
  children?: ReactNode;
}

export function TrickTray({ view, size, surface, children }: TrickTrayProps) {
  return (
    <TrickGrid data-surface={surface}>
      {view.seats.map((seat) => {
        const play = view.plays.find((entry) => entry.playerKey === seat.key);
        return (
          <TrickCell key={seat.key}>
            <span>{seat.name}</span>
            {play ? (
              <PlayEnter data-from={seat.key}>
                <GameCard size={size} label={`${seat.name} · ${play.card.label}`} value={play.card.value} />
              </PlayEnter>
            ) : (
              <EmptySlot $size={CARD_SIZE[size]} aria-hidden="true" />
            )}
          </TrickCell>
        );
      })}
      {children}
    </TrickGrid>
  );
}
