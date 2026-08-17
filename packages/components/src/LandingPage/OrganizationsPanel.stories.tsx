import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { AddIcon, BuildingIcon, LoginIcon } from '@bwp-web/assets';
import { OrganizationRow, OrganizationsPanel } from './OrganizationsPanel';

const meta: Meta<typeof OrganizationsPanel> = {
  title: 'Components/OrganizationsPanel',
  component: OrganizationsPanel,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof OrganizationsPanel>;

const personalOrg = {
  id: 'me-personal',
  name: 'Personal workspace',
  lastOpened: 'Last opened 20m ago',
};

const sharedOrgs = [
  {
    id: 'acme-001',
    name: 'Acme Corporation',
    logo: 'https://picsum.photos/seed/acme/80',
    lastOpened: 'Last opened 2h ago',
  },
  {
    id: 'globex-002',
    name: 'Globex Industries',
    logo: 'https://picsum.photos/seed/globex/80',
    lastOpened: 'Last opened 6h ago',
    pending: true,
  },
  {
    id: 'initech-003',
    name: 'Initech Systems',
    logo: 'https://picsum.photos/seed/initech/80',
    lastOpened: 'Last opened 3 days ago',
  },
  {
    id: 'umbrella-004',
    name: 'Umbrella Co',
    logo: 'https://picsum.photos/seed/umbrella/80',
    lastOpened: 'Last opened 2 weeks ago',
  },
];

function PanelDemo({ initialSearch = '' }: { initialSearch?: string }) {
  const [search, setSearch] = useState(initialSearch);

  const matches = (name: string) =>
    name.toLowerCase().includes(search.toLowerCase());

  const visibleShared = sharedOrgs.filter((org) => matches(org.name));
  const visiblePersonal = matches(personalOrg.name);

  // The app owns this — the panel never guesses.
  const noMatches =
    search.trim().length > 0 && !visiblePersonal && visibleShared.length === 0;

  return (
    <OrganizationsPanel
      search={{
        value: search,
        onChange: (event) => setSearch(event.target.value),
        placeholder: 'Search...',
      }}
      personalOrgItem={
        visiblePersonal ? (
          <OrganizationRow
            primaryText={personalOrg.name}
            secondaryText={personalOrg.lastOpened}
            logo={<BuildingIcon sx={{ width: 20, height: 20 }} />}
          />
        ) : undefined
      }
      organizationsLabel="My organizations"
      organizationItems={
        visibleShared.length > 0
          ? visibleShared.map((org) => (
              <OrganizationRow
                key={org.id}
                primaryText={org.name}
                secondaryText={
                  org.pending ? 'Awaiting approval' : org.lastOpened
                }
                disabled={org.pending}
                logo={org.logo}
              />
            ))
          : undefined
      }
      orLabel="or"
      empty={noMatches}
      joinAction={
        <OrganizationRow
          primaryText="Join organization"
          logo={<LoginIcon sx={{ color: 'text.primary' }} />}
          logoBackground={false}
        />
      }
      createAction={
        <OrganizationRow
          primaryText="Create organization"
          logo={<AddIcon sx={{ color: 'text.primary' }} />}
          logoBackground={false}
        />
      }
    />
  );
}

export const Default: Story = {
  render: () => <PanelDemo />,
};

/**
 * A search term matching nothing: the "or" divider gives way to a short
 * no-results message, while the join and create actions stay put.
 */
export const NoSearchResults: Story = {
  render: () => <PanelDemo initialSearch="zzz" />,
};
