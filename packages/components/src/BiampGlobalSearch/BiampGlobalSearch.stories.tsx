import { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
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

const iconLabel = (text: string, filled = false) => (
  <span
    style={{
      fontSize: 11,
      fontWeight: filled ? 700 : 400,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 24,
      height: 24,
    }}
  >
    {text}
  </span>
);

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
    icon: iconLabel('Dev'),
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
    icon: iconLabel('Sync'),
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
  decorators: [
    (Story) => (
      <div style={{ width: '100%' }}>
        <Story />
      </div>
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
      <div style={{ maxWidth: 600 }}>
        <Story />
      </div>
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
      <div style={{ padding: '0 12px', flexGrow: 1 }}>
        <BiampGlobalSearch
          options={inputValue ? filtered : []}
          inputValue={inputValue}
          clearOnSelect={false}
          onInputChange={(_e, value) => setInputValue(value)}
          open={open && inputValue.length > 0}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
        />
      </div>
      <BiampHeaderActions>
        <BiampHeaderButtonList>
          <BiampHeaderButton icon={iconLabel('Bell')} />
          <BiampHeaderButton icon={iconLabel('Set')} />
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
    <div style={{ maxWidth: 1200 }}>
      <BiampGlobalSearch
        options={sampleOptions}
        inputValue={inputValue}
        onInputChange={(_e, value) => setInputValue(value)}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
      />
    </div>
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
      <div style={{ maxWidth: 600 }}>
        <Story />
      </div>
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
        <div style={{ padding: '0 12px', flexGrow: 1 }}>
          <BiampGlobalSearch
            options={inputValue ? filtered : []}
            inputValue={inputValue}
            onInputChange={(_e, value) => setInputValue(value)}
            open={open && inputValue.length > 0}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
          />
        </div>
        <BiampHeaderActions>
          <BiampHeaderButtonList>
            <BiampHeaderButton icon={iconLabel('Bell')} />
            <BiampHeaderButton icon={iconLabel('Set')} />
          </BiampHeaderButtonList>
          <BiampHeaderProfile image="https://i.pravatar.cc/32?img=1" />
        </BiampHeaderActions>
      </BiampHeader>
      {lastNav && (
        <p
          style={{
            marginTop: 16,
            paddingLeft: 16,
            paddingRight: 16,
            fontSize: 14,
          }}
        >
          Navigated to: <strong>{lastNav}</strong>
        </p>
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
      <div style={{ padding: '0 12px', flexGrow: 1 }}>
        <BiampGlobalSearch
          options={results}
          inputValue={inputValue}
          onInputChange={(_e, value) => setInputValue(value)}
          loading={loading}
          open={open && inputValue.length > 0}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
        />
      </div>
      <BiampHeaderActions>
        <BiampHeaderButtonList>
          <BiampHeaderButton icon={iconLabel('Bell')} />
          <BiampHeaderButton icon={iconLabel('Set')} />
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
