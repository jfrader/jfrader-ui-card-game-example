import { styled } from '@jfrader/ui';
import { EmptyState } from '@jfrader/ui/empty-state';
import { Link } from 'react-router-dom';
import { config } from '../config';
import { copy } from '../content/en';

const Page = styled.div(({ theme: t }) => ({
  display: 'grid',
  placeItems: 'center',
  minBlockSize: `calc(100dvh - ${config.layout.topbarBlock}px - 2 * ${t.space[4]})`,
}));

const HomeLink = styled(Link)(({ theme: t }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  minBlockSize: t.space[10],
  color: t.color.accentText,
  fontWeight: t.fontWeight.medium,
  textUnderlineOffset: t.space[1],
  '&:focus-visible': { outline: `2px solid ${t.color.focusRing}`, outlineOffset: 2, borderRadius: t.radius.sm },
}));

export function NotFoundPage() {
  return (
    <Page>
      <EmptyState headingLevel={1} title={copy.notFound.title} description={copy.notFound.description}
        action={<HomeLink to="/">{copy.notFound.action}</HomeLink>} />
    </Page>
  );
}
