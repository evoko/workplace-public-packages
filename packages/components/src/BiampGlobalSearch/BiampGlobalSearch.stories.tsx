import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Typography } from '@mui/material';
import {
  BiampHeader,
  BiampHeaderTitle,
  BiampHeaderActions,
  BiampHeaderButtonList,
  BiampHeaderButton,
  BiampHeaderProfile,
} from '@bwp-web/components';
import {
  BiampGlobalSearch,
  type BiampGlobalSearchOption,
} from '@bwp-web/components';
import {
  ArrowUpRightIcon,
  CalendarIcon,
  PersonIcon,
  PinLocationIcon,
} from '@bwp-web/assets';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';

// ---------------------------------------------------------------------------
// Sample data — 5 entity types matching design requirements
// ---------------------------------------------------------------------------

const endIcon = <ArrowUpRightIcon variant="xxs" />;

const sampleOptions: BiampGlobalSearchOption[] = [
  {
    icon: <CalendarIcon variant="md" />,
    title: 'Weekly Standup',
    subtitle: 'Repeats every Monday',
    associatedItems: [
      { label: 'Parlor A' },
      { label: 'Parlor B' },
      { label: 'Lounge C' },
      { label: 'Room D' },
      { label: 'Room E' },
    ],
    endIcon,
  },
  {
    icon: <PersonIcon variant="md" />,
    title: 'Jane Doe',
    subtitle: 'jane.doe@biamp.com',
    endIcon,
  },
  {
    icon: <DevicesOutlinedIcon fontSize="small" />,
    title: 'Parlor A-1',
    subtitle: 'Parlor A · Floor 2 · Main Campus · Portland',
    endIcon,
  },
  {
    icon: <PinLocationIcon variant="md" />,
    title: 'Floor 2',
    subtitle: 'Main Campus · Portland',
    endIcon,
  },
  {
    icon: <AutorenewOutlinedIcon fontSize="small" />,
    title: 'Enterprise Plan',
    subtitle: 'Renews Nov 29, 2026',
    associatedItems: [
      { label: 'License A' },
      { label: 'License B' },
      { label: 'License C' },
      { label: 'License D' },
    ],
    endIcon,
  },
];

// ---------------------------------------------------------------------------
// Storybook meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: 'Components/BiampGlobalSearch',
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Box sx={{ width: '100%' }}>
        <Story />
      </Box>
    ),
  ],
};

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

function DefaultDemo() {
  const [inputValue, setInputValue] = useState('');

  const filtered = sampleOptions.filter(
    (o) =>
      o.title.toLowerCase().includes(inputValue.toLowerCase()) ||
      (o.subtitle?.toLowerCase().includes(inputValue.toLowerCase()) ?? false),
  );

  return (
    <BiampGlobalSearch
      options={inputValue ? filtered : sampleOptions}
      inputValue={inputValue}
      onInputChange={(_e, value) => setInputValue(value)}
      open={inputValue.length > 0}
    />
  );
}

/**
 * Default search with all 5 entity types (Calendar Events, Users, Devices,
 * Locations, Subscriptions). Hover over rows to see tooltips.
 */
export const Default: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 600 }}>
        <Story />
      </Box>
    ),
  ],
  render: () => <DefaultDemo />,
};

function InHeaderDemo() {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = sampleOptions.filter(
    (o) =>
      o.title.toLowerCase().includes(inputValue.toLowerCase()) ||
      (o.subtitle?.toLowerCase().includes(inputValue.toLowerCase()) ?? false),
  );

  return (
    <BiampHeader>
      <BiampHeaderTitle title="Workplace" subtitle="Booking" />
      <Box sx={{ px: 1.5, flexGrow: 1 }}>
        <BiampGlobalSearch
          options={inputValue ? filtered : []}
          inputValue={inputValue}
          clearOnSelect={false}
          onInputChange={(_e, value) => setInputValue(value)}
          open={open && inputValue.length > 0}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
        />
      </Box>
      <BiampHeaderActions>
        <BiampHeaderButtonList>
          <BiampHeaderButton icon={<NotificationsNoneIcon />} />
          <BiampHeaderButton icon={<SettingsOutlinedIcon />} />
        </BiampHeaderButtonList>
        <BiampHeaderProfile image="https://i.pravatar.cc/32?img=1" />
      </BiampHeaderActions>
    </BiampHeader>
  );
}

/**
 * BiampGlobalSearch placed inside a full BiampHeader composition.
 * Demonstrates the 40px height match with all 5 entity types.
 */
export const InHeader: Story = {
  render: () => <InHeaderDemo />,
};

function WithAssociatedItemsDemo() {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(true);

  return (
    <Box sx={{ maxWidth: 1200 }}>
      <BiampGlobalSearch
        options={sampleOptions}
        inputValue={inputValue}
        onInputChange={(_e, value) => setInputValue(value)}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      />
    </Box>
  );
}

/**
 * All entity types displayed with the dropdown open. Demonstrates chips
 * with overflow (`+N`), tooltips, and the external link end icon.
 */
export const WithAssociatedItems: Story = {
  render: () => <WithAssociatedItemsDemo />,
};

function EmptyStateDemo() {
  const [inputValue, setInputValue] = useState('random text');
  const [open, setOpen] = useState(true);

  return (
    <BiampGlobalSearch
      options={[]}
      inputValue={inputValue}
      onInputChange={(_e, value) => setInputValue(value)}
      noResultsText="No results found"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    />
  );
}

/**
 * Empty state when no results match the search query.
 * Displays the `noResultsText` message.
 */
export const EmptyState: Story = {
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 600 }}>
        <Story />
      </Box>
    ),
  ],
  render: () => <EmptyStateDemo />,
};

function WithNavigationDemo() {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [lastNav, setLastNav] = useState('');

  const navigationOptions: BiampGlobalSearchOption[] = [
    {
      icon: <CalendarIcon variant="md" />,
      title: 'Biamp Home',
      subtitle: 'biamp.com',
      endIcon,
      onClick: () => setLastNav('https://www.biamp.com'),
    },
    {
      icon: <PersonIcon variant="md" />,
      title: 'Biamp Support',
      subtitle: 'support.biamp.com',
      endIcon,
      onClick: () => setLastNav('https://support.biamp.com'),
    },
    {
      icon: <PinLocationIcon variant="md" />,
      title: 'Biamp Blog',
      subtitle: 'blog.biamp.com',
      endIcon,
      onClick: () => setLastNav('https://blog.biamp.com'),
    },
  ];

  const filtered = navigationOptions.filter(
    (o) =>
      o.title.toLowerCase().includes(inputValue.toLowerCase()) ||
      (o.subtitle?.toLowerCase().includes(inputValue.toLowerCase()) ?? false),
  );

  return (
    <>
      <BiampHeader>
        <BiampHeaderTitle title="Workplace" subtitle="Booking" />
        <Box sx={{ px: 1.5, flexGrow: 1 }}>
          <BiampGlobalSearch
            options={inputValue ? filtered : []}
            inputValue={inputValue}
            onInputChange={(_e, value) => setInputValue(value)}
            open={open && inputValue.length > 0}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
          />
        </Box>
        <BiampHeaderActions>
          <BiampHeaderButtonList>
            <BiampHeaderButton icon={<NotificationsNoneIcon />} />
            <BiampHeaderButton icon={<SettingsOutlinedIcon />} />
          </BiampHeaderButtonList>
          <BiampHeaderProfile image="https://i.pravatar.cc/32?img=1" />
        </BiampHeaderActions>
      </BiampHeader>
      {lastNav && (
        <Typography variant="body2" sx={{ mt: 2, px: 2 }}>
          Navigated to: <strong>{lastNav}</strong>
        </Typography>
      )}
    </>
  );
}

/**
 * Demonstrates `onClick` navigation. Selecting an option opens biamp.com
 * in a new tab and clears the search input.
 */
export const WithNavigation: Story = {
  render: () => <WithNavigationDemo />,
};

function LoadingStateDemo() {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BiampGlobalSearchOption[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!inputValue) {
      setLoading(false);
      setResults([]);
      return;
    }
    setLoading(true);
    setResults([]);
    timerRef.current = setTimeout(() => {
      setResults(
        sampleOptions.filter(
          (o) =>
            o.title.toLowerCase().includes(inputValue.toLowerCase()) ||
            (o.subtitle?.toLowerCase().includes(inputValue.toLowerCase()) ??
              false),
        ),
      );
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timerRef.current);
  }, [inputValue]);

  return (
    <BiampHeader>
      <BiampHeaderTitle title="Workplace" subtitle="Booking" />
      <Box sx={{ px: 1.5, flexGrow: 1 }}>
        <BiampGlobalSearch
          options={results}
          inputValue={inputValue}
          onInputChange={(_e, value) => setInputValue(value)}
          loading={loading}
          open={open && inputValue.length > 0}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
        />
      </Box>
      <BiampHeaderActions>
        <BiampHeaderButtonList>
          <BiampHeaderButton icon={<NotificationsNoneIcon />} />
          <BiampHeaderButton icon={<SettingsOutlinedIcon />} />
        </BiampHeaderButtonList>
        <BiampHeaderProfile image="https://i.pravatar.cc/32?img=1" />
      </BiampHeaderActions>
    </BiampHeader>
  );
}

/**
 * Simulated async search inside a BiampHeader. Typing triggers a 1s loading
 * state before results appear.
 */
export const LoadingState: Story = {
  render: () => <LoadingStateDemo />,
};
