import {
  AddIcon,
  AppsIcon,
  AppsIconFilled,
  BiampLogo,
  BuildingIcon,
  LandingPageBackground,
  LoginIcon,
} from '@bwp-web/assets';
import { DarkMode, LightMode } from '@mui/icons-material';
import { Box, Button, MenuItem, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MouseEvent, useState } from 'react';
import { AppPopoverContent } from '../BiampHeader/BiampHeader.storyhelpers';
import {
  BiampAppPopover,
  BiampHeader,
  BiampHeaderActions,
  BiampHeaderButton,
  BiampHeaderButtonList,
  BiampHeaderProfile,
  BiampHeaderTitle,
} from '../BiampHeader';
import { UserInitialsIcon } from '../UserInitialsIcon';
import {
  LandingFormActions,
  LandingFormCheckbox,
  LandingFormField,
  LandingFormPanel,
} from './LandingFormPanel';
import {
  OrganizationRow,
  OrganizationsEmptyState,
  OrganizationsPanel,
} from './OrganizationsPanel';

const meta: Meta = {
  title: 'Pages/OrganizationSelectorLandingPage',
  parameters: {
    layout: 'fullscreen',
    // Opt out of the preview decorator's padding — this is a full-bleed page.
    noPadding: true,
  },
};

export default meta;
type Story = StoryObj;

const user = { id: 'user-001', name: 'Jane Doe' };

const personalOrg = {
  id: 'me-personal',
  name: 'Personal workspace',
  lastOpened: 'Last opened 20m ago',
};

const regions = [
  { value: 'eu', label: 'Europe' },
  { value: 'us', label: 'North America' },
  { value: 'apac', label: 'Asia Pacific' },
];

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

function SelectionHeader() {
  const [appsAnchorEl, setAppsAnchorEl] = useState<HTMLElement | null>(null);
  // The showcase only swaps the icon; use Storybook's Color Mode toolbar.
  const [lightMode, setLightMode] = useState(true);

  const handleAppsClick = (event: MouseEvent<HTMLElement>) => {
    setAppsAnchorEl(event.currentTarget);
  };

  return (
    <BiampHeader sx={{ bgcolor: 'transparent' }}>
      <BiampHeaderTitle
        title="Workplace"
        sx={{ '& .MuiTypography-root': { color: '#ffffff' } }}
      />
      <BiampHeaderActions>
        <BiampHeaderButtonList>
          <BiampHeaderButton
            icon={<AppsIcon sx={{ color: 'text.secondary' }} />}
            selectedIcon={<AppsIconFilled sx={{ color: 'text.secondary' }} />}
            selected={Boolean(appsAnchorEl)}
            onClick={handleAppsClick}
          />
          <BiampHeaderButton
            icon={
              lightMode ? (
                <LightMode sx={{ color: 'text.secondary' }} />
              ) : (
                <DarkMode sx={{ color: 'text.secondary' }} />
              )
            }
            onClick={() => setLightMode((previous) => !previous)}
          />
          <BiampHeaderProfile sx={{ borderRadius: 999 }}>
            <UserInitialsIcon
              name={user.name}
              id={user.id}
              width={32}
              height={32}
              borderRadius={999}
            />
          </BiampHeaderProfile>
        </BiampHeaderButtonList>
      </BiampHeaderActions>
      <BiampAppPopover
        open={Boolean(appsAnchorEl)}
        anchorEl={appsAnchorEl}
        onClose={() => setAppsAnchorEl(null)}
      >
        <AppPopoverContent />
      </BiampAppPopover>
    </BiampHeader>
  );
}

function OrganizationSelectorLandingPage() {
  const [search, setSearch] = useState('');
  // Which flow the panel's action rows opened, and each flow's field state.
  const [flow, setFlow] = useState<'join' | 'create' | null>(null);
  const [joinDomain, setJoinDomain] = useState('');
  const [createRegion, setCreateRegion] = useState('');
  const [createName, setCreateName] = useState('');
  const [createDomain, setCreateDomain] = useState('');
  const [createDiscoverable, setCreateDiscoverable] = useState(false);

  const matches = (name: string) =>
    name.toLowerCase().includes(search.toLowerCase());

  const visibleShared = sharedOrgs.filter((org) => matches(org.name));
  const visiblePersonal = matches(personalOrg.name);

  // Computed app-side — see `OrganizationsPanel`'s `empty` prop.
  const noMatches =
    search.trim().length > 0 && !visiblePersonal && visibleShared.length === 0;

  const openFlow = (next: 'join' | 'create') => {
    setJoinDomain('');
    setCreateRegion('');
    setCreateName('');
    setCreateDomain('');
    setCreateDiscoverable(false);
    setFlow(next);
  };

  const heading =
    flow === 'join'
      ? 'Join organization'
      : flow === 'create'
        ? 'Create organization'
        : 'Select organization';

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* The real page pins this with `position: fixed; z-index: -1`; a negative
          z-index would hide behind Storybook's preview decorator. */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url("${LandingPageBackground}")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <SelectionHeader />
      </Box>
      <Stack
        flex={1}
        alignItems="center"
        justifyContent="center"
        gap={2.5}
        py={4}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Typography variant="h2" color="text.sidebar">
          {heading}
        </Typography>
        {/* The flows take the panel's place rather than overlaying it. */}
        {flow === 'join' ? (
          <LandingFormPanel onSubmit={() => setFlow(null)}>
            <LandingFormField
              label="Organization domain"
              value={joinDomain}
              onChange={(event) => setJoinDomain(event.target.value)}
              placeholder="acme.com"
            />
            <LandingFormActions>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFlow(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={joinDomain.trim().length === 0}
              >
                Ask to Join
              </Button>
            </LandingFormActions>
          </LandingFormPanel>
        ) : flow === 'create' ? (
          <LandingFormPanel onSubmit={() => setFlow(null)}>
            <LandingFormField
              select
              label="Data Region"
              value={createRegion}
              onChange={(event) => setCreateRegion(event.target.value)}
              slotProps={{
                select: {
                  displayEmpty: true,
                  // Stands in for a placeholder, which a select has no room for.
                  renderValue: () =>
                    regions.find((option) => option.value === createRegion)
                      ?.label ?? (
                      <Box component="span" sx={{ color: 'text.secondary' }}>
                        Select a region
                      </Box>
                    ),
                },
              }}
            >
              {regions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </LandingFormField>
            <LandingFormField
              label="Organization name"
              value={createName}
              onChange={(event) => setCreateName(event.target.value)}
              placeholder="Acme Corporation"
            />
            <LandingFormField
              label="Organization domain"
              value={createDomain}
              onChange={(event) => setCreateDomain(event.target.value)}
              placeholder="acme.com"
            />
            <LandingFormCheckbox
              checked={createDiscoverable}
              onChange={(_event, checked) => setCreateDiscoverable(checked)}
              label="Let anyone with this domain find and join this organization"
            />
            <LandingFormActions>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFlow(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={
                  createRegion === '' ||
                  createName.trim().length === 0 ||
                  createDomain.trim().length === 0
                }
              >
                Create
              </Button>
            </LandingFormActions>
          </LandingFormPanel>
        ) : (
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
            // Custom-node form of `empty`; pass `empty={noMatches}` for defaults.
            empty={
              noMatches && (
                <OrganizationsEmptyState
                  title="No organizations found"
                  description="Join an existing one, or create your own below"
                />
              )
            }
            joinAction={
              <OrganizationRow
                primaryText="Join organization"
                logo={<LoginIcon sx={{ color: 'text.primary' }} />}
                logoBackground={false}
                onClick={() => openFlow('join')}
              />
            }
            createAction={
              <OrganizationRow
                primaryText="Create organization"
                logo={<AddIcon sx={{ color: 'text.primary' }} />}
                logoBackground={false}
                onClick={() => openFlow('create')}
              />
            }
          />
        )}
      </Stack>
      <Stack
        alignItems="center"
        gap={1}
        py={2}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <BiampLogo style={{ width: 76, height: 'auto', color: '#ffffff' }} />
        <Typography variant="caption" color="text.secondary">
          {`© ${new Date().getFullYear()} Biamp Systems LLC.`}
        </Typography>
      </Stack>
    </Box>
  );
}

export const Default: Story = {
  render: () => <OrganizationSelectorLandingPage />,
};
