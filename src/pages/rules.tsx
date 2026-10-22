import { Button, Stack, styled } from '@jfrader/ui';
import { Breadcrumbs } from '@jfrader/ui/breadcrumbs';
import { Link, useNavigate } from 'react-router-dom';
import { copy } from '../content/en';
import { RulesContent } from '../rules/content';

const Page = styled(Stack)(({ theme }) => ({
  maxInlineSize: '76ch',
  marginInline: 'auto',
  paddingBlock: theme.space[5],
  '& h1': { margin: 0 },
}));

export function RulesPage() {
  const navigate = useNavigate();
  return (
    <Page>
      <Breadcrumbs label={copy.nav.rules}>
        <Breadcrumbs.Item>
          <Link to="/">{copy.nav.table}</Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item current>{copy.nav.rules}</Breadcrumbs.Item>
      </Breadcrumbs>
      <h1 tabIndex={-1}>{copy.rules.title}</h1>
      <RulesContent />
      <Button type="button" onClick={() => navigate('/')}>
        {copy.rules.back}
      </Button>
    </Page>
  );
}
