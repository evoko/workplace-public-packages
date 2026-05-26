import { Button, Divider } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import {
  OrganizationItem,
  OrganizationItemList,
  OrganizationSelector,
  OrganizationSelectorPopover,
} from './OrganizationSelector';

const meta: Meta<typeof OrganizationSelector> = {
  title: 'Components/OrganizationSelector',
  component: OrganizationSelector,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof OrganizationSelector>;

const sharedOrgs = [
  {
    id: 'acme-001',
    name: 'Acme Corporation',
    logo: 'https://picsum.photos/seed/acme/80',
    region: 'EU',
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
    region: 'EU',
  },
  {
    id: 'umbrella-004',
    name: 'Umbrella Co',
    logo: 'https://picsum.photos/seed/umbrella/80',
  },
];

const privateOrgs = [{ id: 'me-personal', name: 'Personal workspace' }];

function SelectorBody({
  currentOrgId,
  onSelect,
}: {
  currentOrgId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <OrganizationItemList label="Private organizations">
        {privateOrgs.map((org) => (
          <OrganizationItem
            key={org.id}
            primaryText={org.name}
            isCurrent={org.id === currentOrgId}
            onClick={() => onSelect(org.id)}
          />
        ))}
      </OrganizationItemList>
      <OrganizationItemList maxHeight={300}>
        {sharedOrgs.map((org) => (
          <OrganizationItem
            key={org.id}
            primaryText={org.name}
            secondaryText={`ID: ${org.id}`}
            logo={org.logo}
            meta={org.region === 'EU' ? 'EU region' : undefined}
            isCurrent={org.id === currentOrgId}
            onClick={() => onSelect(org.id)}
          />
        ))}
      </OrganizationItemList>
      <Divider sx={{ pt: 1, userSelect: 'none' }}>or</Divider>
      <Button variant="outlined" sx={{ mt: 1 }}>
        Manage organizations
      </Button>
    </>
  );
}

/** Inline variant — embed inside a sheet, drawer, or any container. */
export const Inline: Story = {
  name: 'Inline',
  render: function InlineDemo() {
    const [currentOrgId, setCurrentOrgId] = useState('acme-001');
    return (
      <OrganizationSelector>
        <SelectorBody currentOrgId={currentOrgId} onSelect={setCurrentOrgId} />
      </OrganizationSelector>
    );
  },
};

/** Loading state — shows a centered spinner instead of children. */
export const Loading: Story = {
  name: 'Loading',
  render: () => <OrganizationSelector loading />,
};

/** Popover variant — anchored below-right of the trigger by default. */
export const Popover: Story = {
  name: 'Popover',
  render: function PopoverDemo() {
    const [currentOrgId, setCurrentOrgId] = useState('acme-001');
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement>(null);

    return (
      <>
        <Button
          ref={anchorRef}
          variant="outlined"
          onClick={() => setOpen((o) => !o)}
        >
          Open organization selector
        </Button>
        <OrganizationSelectorPopover
          open={open}
          anchorEl={anchorRef.current}
          onClose={() => setOpen(false)}
        >
          <SelectorBody
            currentOrgId={currentOrgId}
            onSelect={(id) => {
              setCurrentOrgId(id);
              setOpen(false);
            }}
          />
        </OrganizationSelectorPopover>
      </>
    );
  },
};
