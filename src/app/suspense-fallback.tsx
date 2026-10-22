import { Skeleton, Stack } from '@jfrader/ui';

export function SuspenseFallback() {
  return (
    <Stack gap="sm" aria-busy="true">
      <Skeleton width="55%" height="2rem" />
      <Skeleton width="100%" height="1rem" />
      <Skeleton width="82%" height="1rem" />
    </Stack>
  );
}
