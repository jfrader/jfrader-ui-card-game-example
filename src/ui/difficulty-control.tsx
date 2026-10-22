import { SegmentedControl } from '@jfrader/ui/segmented-control';
import { copy } from '../content/en';
import { DIFFICULTIES, isDifficulty } from '../engine';
import type { Difficulty } from '../engine/types';

export function DifficultyControl({
  value,
  onValueChange,
}: {
  value: Difficulty;
  onValueChange: (value: Difficulty) => void;
}) {
  return (
    <SegmentedControl
      label={copy.settings.difficulty}
      value={value}
      options={DIFFICULTIES.map((difficulty) => ({ value: difficulty, label: copy.settings[difficulty] }))}
      onValueChange={(next) => {
        if (isDifficulty(next)) onValueChange(next);
      }}
    />
  );
}
