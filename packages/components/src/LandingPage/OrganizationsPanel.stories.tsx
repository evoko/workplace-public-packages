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

const personalOrg = { id: 'me-personal', name: 'Personal workspace' };

const sharedOrgs = [
  {
    id: 'acme-001',
    name: 'Acme Corporation',
    logo: 'https://picsum.photos/seed/acme/80',
  },
  {
    id: 'globex-002',
    name: 'Globex Industries',
    logo: 'https://picsum.photos/seed/globex/80',
  },
  {
    id: 'initech-003',
    name: 'Initech Systems',
    logo: 'https://picsum.photos/seed/initech/80',
  },
  {
    id: 'umbrella-004',
    name: 'Umbrella Co',
    logo: 'https://picsum.photos/seed/umbrella/80',
    pending: true,
  },
];

function PanelDemo() {
  const [search, setSearch] = useState('');

  const matches = (name: string) =>
    name.toLowerCase().includes(search.toLowerCase());

  const visibleShared = sharedOrgs.filter((org) => matches(org.name));

  return (
    <OrganizationsPanel
      search={{
        value: search,
        onChange: (event) => setSearch(event.target.value),
        placeholder: 'Search...',
      }}
      personalOrgItem={
        matches(personalOrg.name) ? (
          <OrganizationRow
            primaryText={personalOrg.name}
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
                secondaryText={org.pending ? 'Awaiting approval' : undefined}
                disabled={org.pending}
                logo={org.logo}
              />
            ))
          : undefined
      }
      orLabel="or"
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
