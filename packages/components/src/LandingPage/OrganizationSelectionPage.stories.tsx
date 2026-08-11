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
import { Box, Stack, Typography } from '@mui/material';
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
import { OrganizationRow, OrganizationsPanel } from './OrganizationsPanel';

const meta: Meta = {
  title: 'Pages/OrganizationSelection',
  parameters: {
    layout: 'fullscreen',
    // Opt out of the preview decorator's padding — this is a full-bleed page.
    noPadding: true,
  },
};

export default meta;
type Story = StoryObj;

const user = { id: 'user-001', name: 'Jane Doe' };

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

/**
 * Transparent toolbar sitting over the background photo: app title on the
 * left, app launcher / theme toggle / profile on the right.
 */
function SelectionHeader() {
  const [appsAnchorEl, setAppsAnchorEl] = useState<HTMLElement | null>(null);
  // The real screen drives this from the app's color scheme; the showcase
  // only swaps the icon. Use Storybook's Color Mode toolbar to see the page
  // itself in light and dark.
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

function OrganizationSelectionPage() {
  const [search, setSearch] = useState('');

  const matches = (name: string) =>
    name.toLowerCase().includes(search.toLowerCase());

  const visibleShared = sharedOrgs.filter((org) => matches(org.name));

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/*
        The real page pins this with `position: fixed; z-index: -1`. Inside the
        Storybook canvas a negative z-index would slide behind the preview
        decorator's opaque background, so it is anchored to the page container
        instead and the content is lifted above it.
      */}
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
          Select organization
        </Typography>
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
                    secondaryText={
                      org.pending ? 'Awaiting approval' : undefined
                    }
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
  render: () => <OrganizationSelectionPage />,
};
