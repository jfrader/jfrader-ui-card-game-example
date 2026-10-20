import { styled } from '@jfrader/ui';
import { phone } from '../../ui/styles';

/** One rhythm for every dialog: header, sections, then an action row. */
export const DialogLayout = styled.div(({ theme: t }) => ({
  display: 'grid',
  gap: t.space[5],
  minInlineSize: 0,
}));

export const DialogHeader = styled.div(({ theme: t }) => ({
  display: 'grid',
  gap: t.space[1],
  '& h2': { margin: 0 },
  '& p': { margin: 0 },
}));

/** Title row with the close control beside it, so focus starts at the top of long dialogs. */
export const DialogTitleRow = styled.div(({ theme: t }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: t.space[4],
  '& h2': { margin: 0 },
}));

export const DialogActions = styled.div(({ theme: t }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'flex-end',
  gap: t.space[2],
  [phone]: { '& > *': { flex: '1 1 auto' } },
}));
