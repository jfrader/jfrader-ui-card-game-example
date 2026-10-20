import { Container, Divider, Flex, styled } from '@jfrader/ui';
import { config } from '../config';
import { copy } from '../content/en';

const Root = styled.footer(({ theme }) => ({ color: theme.color.textMuted, fontSize: theme.textSize.sm }));
const Content = styled(Container)(({ theme }) => ({ maxInlineSize: config.layout.shellMaxInline, paddingBlock: theme.space[4] }));
const Row = styled(Flex)(({ theme }) => ({ flexWrap: 'wrap', justifyContent: 'space-between', gap: theme.space[3], '& a': { color: 'inherit', textUnderlineOffset: theme.space[1] } }));

export function Footer() {
  return <Root><Content size="xl" paddingInline="md"><Divider /><Row>
    <a href={config.urls.library}>{copy.footer.builtWith}</a>
    <Flex gap="md"><a href={config.urls.docs}>{copy.footer.docs}</a><a href={config.urls.source}>{copy.footer.source}</a><a href={`${config.urls.source}/blob/master/LICENSE`}>{copy.footer.license}</a></Flex>
  </Row></Content></Root>;
}
