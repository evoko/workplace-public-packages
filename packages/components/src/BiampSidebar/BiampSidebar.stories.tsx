import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Stack, Typography, Divider } from '@mui/material';
import {
  BiampSidebar,
  BiampSidebarIcon,
  BiampSidebarIconList,
  BiampSidebarComponent,
} from '@bwp-web/components';
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PeopleIcon from '@mui/icons-material/People';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import ApartmentIcon from '@mui/icons-material/Apartment';

const meta: Meta<typeof BiampSidebar> = {
  title: 'Components/BiampSidebar',
  component: BiampSidebar,
  decorators: [
    (Story) => (
      <Box sx={{ height: '100vh' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof BiampSidebar>;

const navItems = [
  { name: 'Home', icon: <HomeOutlinedIcon />, selectedIcon: <HomeIcon /> },
  {
    name: 'Dashboard',
    icon: <DashboardOutlinedIcon />,
    selectedIcon: <DashboardIcon />,
  },
  {
    name: 'People',
    icon: <PeopleOutlinedIcon />,
    selectedIcon: <PeopleIcon />,
  },
  {
    name: 'Settings',
    icon: <SettingsOutlinedIcon />,
    selectedIcon: <SettingsIcon />,
  },
];

function DefaultDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <BiampSidebar sx={{ height: 600 }} bottomLogoText="Biamp LLC. v.1.2-b-fd">
      {navItems.map((item, i) => (
        <BiampSidebarIcon
          key={i}
          selected={selectedIndex === i}
          icon={item.icon}
          selectedIcon={item.selectedIcon}
          name={item.name}
          onClick={() => setSelectedIndex(i)}
        />
      ))}
    </BiampSidebar>
  );
}

/**
 * The default sidebar with selectable navigation icons.
 * Click any icon to select it. Click the arrow button at the bottom to
 * expand the sidebar to 240px and reveal each item's `name` next to its icon.
 * Pass `bottomLogoText` to render a copyright/version caption next to the
 * Biamp logo when the sidebar is expanded — the component automatically
 * prepends `© [current year]` to the value.
 */
export const Default: Story = {
  render: () => <DefaultDemo />,
};

function ExpandableDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <Stack direction="row" spacing={4}>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Expandable (default)
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 320 }}>
          The sidebar is expandable by default. Click the arrow button to toggle
          between the collapsed (48px) and expanded (240px) widths. Each{' '}
          <code>BiampSidebarIcon</code>&apos;s <code>name</code> appears to the
          right of its icon when expanded.
        </Typography>
        <Box sx={{ height: 500 }}>
          <BiampSidebar>
            <BiampSidebarIconList>
              {navItems.map((item, i) => (
                <BiampSidebarIcon
                  key={i}
                  selected={selectedIndex === i}
                  icon={item.icon}
                  selectedIcon={item.selectedIcon}
                  name={item.name}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}
            </BiampSidebarIconList>
          </BiampSidebar>
        </Box>
      </Box>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Default expanded
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 320 }}>
          Pass <code>defaultExpanded</code> to start in the expanded state. The
          arrow rotates to indicate the &quot;Collapse menu&quot; action.
        </Typography>
        <Box sx={{ height: 500 }}>
          <BiampSidebar defaultExpanded>
            <BiampSidebarIconList>
              {navItems.map((item, i) => (
                <BiampSidebarIcon
                  key={i}
                  selected={selectedIndex === i}
                  icon={item.icon}
                  selectedIcon={item.selectedIcon}
                  name={item.name}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}
            </BiampSidebarIconList>
          </BiampSidebar>
        </Box>
      </Box>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Not expandable
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 320 }}>
          Pass <code>expandable=&#123;false&#125;</code> to hide the toggle
          button. The sidebar stays at 48px and item names never appear.
        </Typography>
        <Box sx={{ height: 500 }}>
          <BiampSidebar expandable={false}>
            <BiampSidebarIconList>
              {navItems.map((item, i) => (
                <BiampSidebarIcon
                  key={i}
                  selected={selectedIndex === i}
                  icon={item.icon}
                  selectedIcon={item.selectedIcon}
                  name={item.name}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}
            </BiampSidebarIconList>
          </BiampSidebar>
        </Box>
      </Box>
    </Stack>
  );
}

/**
 * The sidebar can expand from 48px to 240px (min-width 240px so long names
 * push it wider). The toggle button is rendered between the children and the
 * bottom logo, styled as a `BiampSidebarIcon` with the label
 * &quot;Collapse menu&quot;. Set `expandable={false}` to disable it, or use
 * `defaultExpanded` / the controlled `expanded` + `onExpandedChange` props
 * to drive the state from outside.
 */
export const Expandable: Story = {
  render: () => <ExpandableDemo />,
};

function ControlledExpansionDemo() {
  const [expanded, setExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <Stack direction="row" spacing={4}>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Controlled expansion
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 320 }}>
          Pass <code>expanded</code> and <code>onExpandedChange</code> to
          control the expansion state from a parent component. State:{' '}
          <strong>{expanded ? 'expanded' : 'collapsed'}</strong>.
        </Typography>
        <Box sx={{ height: 500 }}>
          <BiampSidebar expanded={expanded} onExpandedChange={setExpanded}>
            <BiampSidebarIconList>
              {navItems.map((item, i) => (
                <BiampSidebarIcon
                  key={i}
                  selected={selectedIndex === i}
                  icon={item.icon}
                  selectedIcon={item.selectedIcon}
                  name={item.name}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}
            </BiampSidebarIconList>
          </BiampSidebar>
        </Box>
      </Box>
    </Stack>
  );
}

/**
 * Use `expanded` + `onExpandedChange` to drive expansion from a parent.
 * Useful when expansion needs to coordinate with other UI (e.g. resizing
 * a content area).
 */
export const ControlledExpansion: Story = {
  name: 'Controlled Expansion',
  render: () => <ControlledExpansionDemo />,
};

function CustomLogoDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const items = navItems.slice(0, 3);

  return (
    <Stack direction="row" spacing={4}>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Default logo
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
          The Biamp logo is rendered at the bottom when no{' '}
          <code>bottomLogoIcon</code> prop is provided.
        </Typography>
        <Box sx={{ height: 400 }}>
          <BiampSidebar>
            {items.map((item, i) => (
              <BiampSidebarIcon
                key={i}
                selected={selectedIndex === i}
                icon={item.icon}
                selectedIcon={item.selectedIcon}
                name={item.name}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
          </BiampSidebar>
        </Box>
      </Box>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Custom logo
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
          Any JSX element can be passed as the <code>bottomLogoIcon</code> prop
          to replace the default Biamp logo.
        </Typography>
        <Box sx={{ height: 400 }}>
          <BiampSidebar
            bottomLogoIcon={
              <ApartmentIcon
                sx={{ width: '48px', height: '24px', alignSelf: 'center' }}
              />
            }
          >
            {items.map((item, i) => (
              <BiampSidebarIcon
                key={i}
                selected={selectedIndex === i}
                icon={item.icon}
                selectedIcon={item.selectedIcon}
                name={item.name}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
          </BiampSidebar>
        </Box>
      </Box>
    </Stack>
  );
}

/**
 * Pass a custom `logo` prop to replace the default Biamp logo at the
 * bottom of the sidebar. When omitted, the Biamp logo is rendered automatically.
 */
export const CustomLogo: Story = {
  name: 'Custom Logo',
  render: () => <CustomLogoDemo />,
};

function WithSelectedIconsDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <Stack direction="row" spacing={4}>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          With selectedIcon
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
          The icon changes from outlined to filled when selected.
        </Typography>
        <Box sx={{ height: 400 }}>
          <BiampSidebar>
            <BiampSidebarIcon
              selected={selectedIndex === 0}
              icon={<HomeOutlinedIcon />}
              selectedIcon={<HomeIcon />}
              name="Home"
              onClick={() => setSelectedIndex(0)}
            />
            <BiampSidebarIcon
              selected={selectedIndex === 1}
              icon={<SettingsOutlinedIcon />}
              selectedIcon={<SettingsIcon />}
              name="Settings"
              onClick={() => setSelectedIndex(1)}
            />
          </BiampSidebar>
        </Box>
      </Box>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Without selectedIcon
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
          When no selectedIcon is provided, the same icon is used for both
          states.
        </Typography>
        <Box sx={{ height: 400 }}>
          <BiampSidebar>
            <BiampSidebarIcon
              selected={selectedIndex === 0}
              icon={<HomeIcon />}
              name="Home"
              onClick={() => setSelectedIndex(0)}
            />
            <BiampSidebarIcon
              selected={selectedIndex === 1}
              icon={<SettingsIcon />}
              name="Settings"
              onClick={() => setSelectedIndex(1)}
            />
          </BiampSidebar>
        </Box>
      </Box>
    </Stack>
  );
}

/**
 * When `selectedIcon` is provided, the sidebar icon swaps between
 * the `icon` (unselected) and `selectedIcon` (selected) automatically.
 * This is useful for showing filled vs outlined icon variants.
 */
export const WithSelectedIcons: Story = {
  name: 'With Selected Icons',
  render: () => <WithSelectedIconsDemo />,
};

/**
 * Individual `BiampSidebarIcon` states shown side by side.
 * Each icon is a `ListItemButton` under the hood, so it supports
 * `selected`, `disabled`, and `onClick` props. The optional `name`
 * prop is only rendered when the surrounding `BiampSidebar` is expanded.
 */
export const IconStates: Story = {
  name: 'Icon States',
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">BiampSidebarIcon States</Typography>
      <Stack direction="row" spacing={3} alignItems="flex-start">
        <Stack alignItems="center" spacing={1}>
          <BiampSidebarIcon icon={<HomeOutlinedIcon />} />
          <Typography variant="caption">Default</Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <BiampSidebarIcon selected icon={<HomeOutlinedIcon />} />
          <Typography variant="caption">Selected</Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <BiampSidebarIcon
            selected
            icon={<HomeOutlinedIcon />}
            selectedIcon={<HomeIcon />}
          />
          <Typography variant="caption">
            Selected (with selectedIcon)
          </Typography>
        </Stack>
        <Stack alignItems="center" spacing={1}>
          <BiampSidebarIcon icon={<HomeOutlinedIcon />} disabled />
          <Typography variant="caption">Disabled</Typography>
        </Stack>
      </Stack>
      <Divider />
      <Typography variant="h3">Extends ListItemButton</Typography>
      <Typography variant="body2" sx={{ maxWidth: 500 }}>
        BiampSidebarIcon extends MUI&apos;s ListItemButtonProps, so you can pass
        any prop that ListItemButton accepts, such as <code>disabled</code>,{' '}
        <code>onClick</code>, <code>sx</code>, and more.
      </Typography>
    </Stack>
  ),
};

function WithIconListDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  return (
    <Stack direction="row" spacing={4}>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          With BiampSidebarIconList
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
          Icons are wrapped in <code>BiampSidebarIconList</code> which adds
          standardised 4px gaps between each item.
        </Typography>
        <Box sx={{ height: 400 }}>
          <BiampSidebar>
            <BiampSidebarIconList>
              {navItems.map((item, i) => (
                <BiampSidebarIcon
                  key={i}
                  selected={selectedIndex === i}
                  icon={item.icon}
                  selectedIcon={item.selectedIcon}
                  name={item.name}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}
            </BiampSidebarIconList>
          </BiampSidebar>
        </Box>
      </Box>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Without BiampSidebarIconList
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 300 }}>
          Without the list wrapper, icons stack with no gap between them.
        </Typography>
        <Box sx={{ height: 400 }}>
          <BiampSidebar>
            {navItems.map((item, i) => (
              <BiampSidebarIcon
                key={i}
                selected={selectedIndex === i}
                icon={item.icon}
                selectedIcon={item.selectedIcon}
                name={item.name}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
          </BiampSidebar>
        </Box>
      </Box>
    </Stack>
  );
}

/**
 * `BiampSidebarIconList` provides a standardised vertical list layout for
 * `BiampSidebarIcon` items with consistent 4px gaps between each icon.
 * Use it inside `BiampSidebar` to get properly-spaced icon groups.
 */
export const WithIconList: Story = {
  name: 'With Icon List',
  render: () => <WithIconListDemo />,
};

function ScrollableIconListDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const overflowItems = Array.from({ length: 20 }, (_, i) => {
    const baseIcons = [
      { icon: <HomeOutlinedIcon />, selectedIcon: <HomeIcon /> },
      { icon: <DashboardOutlinedIcon />, selectedIcon: <DashboardIcon /> },
      { icon: <PeopleOutlinedIcon />, selectedIcon: <PeopleIcon /> },
      { icon: <SettingsOutlinedIcon />, selectedIcon: <SettingsIcon /> },
    ];
    const base = baseIcons[i % baseIcons.length];
    return {
      name: `Item ${i + 1}`,
      icon: base.icon,
      selectedIcon: base.selectedIcon,
    };
  });

  return (
    <Stack direction="row" spacing={4}>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Scrollable list (collapsed)
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 320 }}>
          When the icon list is taller than the available space, only{' '}
          <code>BiampSidebarIconList</code> scrolls vertically. The
          expand/collapse toggle and the bottom logo stay pinned in place.
        </Typography>
        <Box sx={{ height: 360 }}>
          <BiampSidebar>
            <BiampSidebarIconList>
              {overflowItems.map((item, i) => (
                <BiampSidebarIcon
                  key={i}
                  selected={selectedIndex === i}
                  icon={item.icon}
                  selectedIcon={item.selectedIcon}
                  name={item.name}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}
            </BiampSidebarIconList>
          </BiampSidebar>
        </Box>
      </Box>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Scrollable list (expanded)
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 320 }}>
          The same scroll behavior applies when expanded — names render next to
          each icon and the list still scrolls independently of the toggle
          button below.
        </Typography>
        <Box sx={{ height: 360 }}>
          <BiampSidebar defaultExpanded>
            <BiampSidebarIconList>
              {overflowItems.map((item, i) => (
                <BiampSidebarIcon
                  key={i}
                  selected={selectedIndex === i}
                  icon={item.icon}
                  selectedIcon={item.selectedIcon}
                  name={item.name}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}
            </BiampSidebarIconList>
          </BiampSidebar>
        </Box>
      </Box>
    </Stack>
  );
}

/**
 * `BiampSidebarIconList` flex-grows to fill the remaining vertical space in
 * `BiampSidebar` and scrolls (`overflowY: auto`) when its content exceeds
 * that space. Sibling content in the sidebar — such as the expand/collapse
 * toggle and the bottom logo — stays anchored and does not scroll.
 */
export const ScrollableIconList: Story = {
  name: 'Scrollable Icon List',
  render: () => <ScrollableIconListDemo />,
};

function WithSidebarComponentDemo() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const items = navItems.slice(0, 3);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" sx={{ mb: 2 }}>
          BiampSidebarComponent
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, maxWidth: 500 }}>
          Use <code>BiampSidebarComponent</code> to embed arbitrary content in
          the sidebar. It provides the same 48×48px rounded-box dimensions as{' '}
          <code>BiampSidebarIcon</code>, but renders a plain <code>Box</code>{' '}
          instead of a button.
        </Typography>
      </Box>
      <Box sx={{ height: 500 }}>
        <BiampSidebar>
          <BiampSidebarIconList>
            <BiampSidebarComponent
              sx={{
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'primary.contrastText', fontWeight: 'bold' }}
              >
                AV
              </Typography>
            </BiampSidebarComponent>
            {items.map((item, i) => (
              <BiampSidebarIcon
                key={i}
                selected={selectedIndex === i}
                icon={item.icon}
                selectedIcon={item.selectedIcon}
                name={item.name}
                onClick={() => setSelectedIndex(i)}
              />
            ))}
            <BiampSidebarComponent
              sx={{
                bgcolor: 'grey.300',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                42
              </Typography>
            </BiampSidebarComponent>
          </BiampSidebarIconList>
        </BiampSidebar>
      </Box>
    </Stack>
  );
}

/**
 * `BiampSidebarComponent` renders a 48×48px rounded box that matches the
 * dimensions and shape of `BiampSidebarIcon`. Use it to place arbitrary
 * content (avatars, status indicators, custom widgets, etc.) in the sidebar
 * alongside icon buttons while maintaining a consistent visual rhythm.
 */
export const WithSidebarComponent: Story = {
  name: 'With Sidebar Component',
  render: () => <WithSidebarComponentDemo />,
};
