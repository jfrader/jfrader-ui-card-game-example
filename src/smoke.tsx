/* Temporary scaffold check: every public import the game will use must resolve. */
import {
  ActionButton,
  Alert,
  Avatar,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Countdown,
  Divider,
  Dialog,
  Drawer,
  EmptyState,
  Flex,
  Kbd,
  Menu,
  MetricCard,
  Popover,
  Progress,
  Prose,
  ScrollArea,
  SegmentedControl,
  Skeleton,
  Stack,
  Switch,
  Tabs,
  ThemeProvider,
  ThemeSwitch,
  Timeline,
  Tooltip,
  styled,
} from '@jfrader/ui';
import { AnnouncementBar } from '@jfrader/ui/announcement-bar';
import { CallOverlay } from '@jfrader/ui/call-overlay';
import { DeckProvider } from '@jfrader/ui/deck';
import { Toast, useToast } from '@jfrader/ui/toast';
import { FlipGameCard } from '@jfrader/ui/flip-game-card';
import { GameActions } from '@jfrader/ui/game-actions';
import { GameCard } from '@jfrader/ui/game-card';
import { GameCardStack } from '@jfrader/ui/game-card-stack';
import { GameHand } from '@jfrader/ui/game-hand';
import { GameMarks } from '@jfrader/ui/game-marks';
import { GameResult } from '@jfrader/ui/game-result';
import { GameRounds } from '@jfrader/ui/game-rounds';
import { GameScore } from '@jfrader/ui/game-score';
import { GameSeat } from '@jfrader/ui/game-seat';
import { GameTable } from '@jfrader/ui/game-table';

const smoke = [
  ActionButton,
  Alert,
  Avatar,
  Breadcrumbs,
  Button,
  CallOverlay,
  Card,
  Container,
  Countdown,
  Divider,
  Dialog,
  Drawer,
  EmptyState,
  Flex,
  Kbd,
  Menu,
  MetricCard,
  Popover,
  Progress,
  Prose,
  ScrollArea,
  SegmentedControl,
  Skeleton,
  Stack,
  Switch,
  Tabs,
  ThemeProvider,
  ThemeSwitch,
  Timeline,
  Tooltip,
  styled,
  AnnouncementBar,
  DeckProvider,
  Toast,
  useToast,
  FlipGameCard,
  GameActions,
  GameCard,
  GameCardStack,
  GameHand,
  GameMarks,
  GameResult,
  GameRounds,
  GameScore,
  GameSeat,
  GameTable,
];

export const smokeCount = smoke.length;
