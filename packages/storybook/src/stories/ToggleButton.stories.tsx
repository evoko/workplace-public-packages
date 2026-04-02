import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Typography,
} from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';

const meta: Meta<typeof ToggleButtonGroup> = {
  title: 'Styles/ToggleButton',
  component: ToggleButtonGroup,
};

export default meta;
type Story = StoryObj<typeof ToggleButtonGroup>;

const ExclusiveDemo = () => {
  const [alignment, setAlignment] = useState<string | null>('left');
  return (
    <ToggleButtonGroup
      value={alignment}
      exclusive
      onChange={(_, val) => setAlignment(val)}
    >
      <ToggleButton value="left">
        <FormatAlignLeftIcon />
      </ToggleButton>
      <ToggleButton value="center">
        <FormatAlignCenterIcon />
      </ToggleButton>
      <ToggleButton value="right">
        <FormatAlignRightIcon />
      </ToggleButton>
      <ToggleButton value="justify">
        <FormatAlignJustifyIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const Exclusive: Story = {
  render: () => <ExclusiveDemo />,
};

const MultipleDemo = () => {
  const [formats, setFormats] = useState<string[]>(['bold', 'italic']);
  return (
    <ToggleButtonGroup value={formats} onChange={(_, val) => setFormats(val)}>
      <ToggleButton value="bold">
        <FormatBoldIcon />
      </ToggleButton>
      <ToggleButton value="italic">
        <FormatItalicIcon />
      </ToggleButton>
      <ToggleButton value="underlined">
        <FormatUnderlinedIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export const Multiple: Story = {
  render: () => <MultipleDemo />,
};

export const Sizes: Story = {
  render: () => (
    <Stack spacing={2}>
      {(['small', 'medium', 'large'] as const).map((size) => (
        <ToggleButtonGroup key={size} value="left" exclusive size={size}>
          <ToggleButton value="left">
            <FormatAlignLeftIcon />
          </ToggleButton>
          <ToggleButton value="center">
            <FormatAlignCenterIcon />
          </ToggleButton>
          <ToggleButton value="right">
            <FormatAlignRightIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      ))}
    </Stack>
  ),
};

export const Colors: Story = {
  render: () => (
    <Stack spacing={2}>
      {(
        [
          'standard',
          'primary',
          'secondary',
          'success',
          'error',
          'info',
          'warning',
        ] as const
      ).map((color) => (
        <ToggleButtonGroup key={color} value="left" exclusive color={color}>
          <ToggleButton value="left">
            <FormatAlignLeftIcon />
          </ToggleButton>
          <ToggleButton value="center">
            <FormatAlignCenterIcon />
          </ToggleButton>
          <ToggleButton value="right">
            <FormatAlignRightIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      ))}
    </Stack>
  ),
};

export const Vertical: Story = {
  render: () => (
    <ToggleButtonGroup orientation="vertical" value="left" exclusive>
      <ToggleButton value="left">
        <FormatAlignLeftIcon />
      </ToggleButton>
      <ToggleButton value="center">
        <FormatAlignCenterIcon />
      </ToggleButton>
      <ToggleButton value="right">
        <FormatAlignRightIcon />
      </ToggleButton>
    </ToggleButtonGroup>
  ),
};
