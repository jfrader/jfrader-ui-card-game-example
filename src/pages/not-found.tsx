import { styled } from '@jfrader/ui';
import { EmptyState } from '@jfrader/ui/empty-state';
import { Link } from 'react-router-dom';
import { copy } from '../content/en';

const HomeLink = styled(Link)(({ theme }) => ({ display: 'inline-flex', alignItems: 'center', minBlockSize: theme.space[12], color: theme.color.text, textUnderlineOffset: theme.space[1] }));

export function NotFoundPage() {
  return <EmptyState headingLevel={1} title={copy.notFound.title} description={copy.notFound.description} action={<HomeLink to="/">{copy.notFound.action}</HomeLink>} />;
}
