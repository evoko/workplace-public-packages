import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack, Typography } from '@mui/material';
import { SegmentedButton, SegmentedButtonGroup } from '@bwp-web/components';

const meta: Meta<typeof SegmentedButtonGroup> = {
  title: 'Components/SegmentedButton',
  component: SegmentedButtonGroup,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SegmentedButtonGroup>;

function DefaultDemo() {
  const [active, setActive] = useState(0);
  return (
    <SegmentedButtonGroup>
      <SegmentedButton active={active === 0} onClick={() => setActive(0)}>
        Option 1
      </SegmentedButton>
      <SegmentedButton active={active === 1} onClick={() => setActive(1)}>
        Option 2
      </SegmentedButton>
      <SegmentedButton active={active === 2} onClick={() => setActive(2)}>
        Option 3
      </SegmentedButton>
    </SegmentedButtonGroup>
  );
}

export const Default: Story = {
  render: () => <DefaultDemo />,
};

export const Sizes: Story = {
  render: () => {
    const options = [
      'Option 1',
      'Option 2',
      'Option 3',
      'Option 4',
      'Option 5',
      'Option 6',
    ];
    return (
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="caption">Default</Typography>
          <SegmentedButtonGroup>
            {options.map((label, i) => (
              <SegmentedButton key={i} active={i === 0}>
                {label}
              </SegmentedButton>
            ))}
          </SegmentedButtonGroup>
        </Stack>
        <Stack spacing={1}>
          <Typography variant="caption">Small</Typography>
          <SegmentedButtonGroup>
            {options.map((label, i) => (
              <SegmentedButton key={i} small active={i === 0}>
                {label}
              </SegmentedButton>
            ))}
          </SegmentedButtonGroup>
        </Stack>
      </Stack>
    );
  },
};

export const MultipleLines: Story = {
  render: () => {
    const options = [
      'Option 1',
      'Option 2',
      'Option 3',
      'Option 4',
      'Option 5',
      'Option 6',
    ];
    return (
      <Stack spacing={2}>
        {options.map((_, activeIndex) => (
          <SegmentedButtonGroup key={activeIndex}>
            {options.map((label, i) => (
              <SegmentedButton key={i} active={i === activeIndex}>
                {label}
              </SegmentedButton>
            ))}
          </SegmentedButtonGroup>
        ))}
      </Stack>
    );
  },
};
