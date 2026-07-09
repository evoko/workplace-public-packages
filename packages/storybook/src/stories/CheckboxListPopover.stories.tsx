import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  BiampCheckboxListPopover,
  type BiampCheckboxListItem,
} from '@bwp-web/components';
import { Button, Stack, Typography } from '@mui/material';

const meta: Meta<typeof BiampCheckboxListPopover> = {
  title: 'Components/CheckboxListPopover',
  component: BiampCheckboxListPopover,
};

export default meta;
type Story = StoryObj<typeof BiampCheckboxListPopover>;

const OPTIONS = [
  'Name',
  'Status',
  'Model',
  'Firmware',
  'IP address',
  'Location',
  'Last seen',
  'Owner',
  'Serial number',
  'Tags',
];

function CheckboxListDemo({
  heading,
  showSelectAll,
}: {
  heading: string;
  showSelectAll?: boolean;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(OPTIONS.map((o) => [o, true])),
  );

  const items: BiampCheckboxListItem[] = OPTIONS.map((option) => ({
    id: option,
    label: option,
    checked: Boolean(checked[option]),
  }));

  const selectedCount = OPTIONS.filter((o) => checked[o]).length;

  return (
    <Stack spacing={2} sx={{ p: 4 }}>
      <Typography variant="h3">{heading}</Typography>
      <Typography variant="body2" color="text.secondary">
        {selectedCount} of {OPTIONS.length} selected.
      </Typography>
      <Button
        ref={anchorRef}
        variant="contained"
        onClick={() => setOpen(true)}
        sx={{ alignSelf: 'flex-start' }}
      >
        Open
      </Button>

      <BiampCheckboxListPopover
        anchorEl={anchorRef.current}
        open={open}
        onClose={() => setOpen(false)}
        showSelectAll={showSelectAll}
        items={items}
        onToggleItem={(id) =>
          setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
        }
        onToggleAll={(next) =>
          setChecked(Object.fromEntries(OPTIONS.map((o) => [o, next])))
        }
      />
    </Stack>
  );
}

/** Default look — "Show all" toggle, checkbox list, scrolls past maxHeight. */
export const Default: Story = {
  render: () => <CheckboxListDemo heading="Checkbox list popover" />,
};

/** Without the "select all" row. */
export const WithoutSelectAll: Story = {
  render: () => (
    <CheckboxListDemo heading="No select-all row" showSelectAll={false} />
  ),
};
