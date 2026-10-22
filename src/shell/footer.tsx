import { Container, Divider, Flex, styled } from '@jfrader/ui';
import { config } from '../config';
import { copy } from '../content/en';

const Page = styled.footer(({ theme }) => ({ color: theme.color.textMuted, fontSize: theme.textSize.sm }));
const PageContent = styled(Container)(({ theme }) => ({
  maxInlineSize: config.layout.shellMaxInline,
  paddingBlock: theme.space[4],
}));
const Rail = styled.footer(({ theme }) => ({
  display: 'grid',
  gap: theme.space[2],
  padding: theme.space[4],
  borderBlockStart: `1px solid ${theme.color.border}`,
  color: theme.color.textMuted,
  fontSize: theme.textSize.xs,
}));
const Links = styled(Flex)(({ theme }) => ({
  flexWrap: 'wrap',
  justifyContent: 'space-between',
  gap: theme.space[3],
  '& a': { color: 'inherit', textUnderlineOffset: theme.space[1] },
}));

export function Footer({ variant = 'page' }: { variant?: 'page' | 'rail' }) {
  const links = (
    <Links>
      <a href={config.urls.library}>{copy.footer.builtWith}</a>
      <Flex gap="md">
        <a href={config.urls.docs}>{copy.footer.docs}</a>
        <a href={config.urls.source}>{copy.footer.source}</a>
        <a href={`${config.urls.source}/blob/master/LICENSE`}>{copy.footer.license}</a>
      </Flex>
    </Links>
  );

  if (variant === 'rail') return <Rail>{links}</Rail>;
  return (
    <Page>
      <PageContent size="xl" paddingInline="md">
        <Divider />
        {links}
      </PageContent>
    </Page>
  );
}
