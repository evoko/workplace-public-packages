import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack, Typography, Box } from '@mui/material';

import {
  BreadcrumbIcon,
  CheckedIcon,
  DatePickerIcon,
  ErrorStatusIcon,
  IndeterminateIcon,
  InfoStatusIcon,
  InputCloseIcon,
  SuccessStatusIcon,
  UncheckedIcon,
  WarningStatusIcon,
} from '@bwp-web/assets';

const meta: Meta = {
  title: 'Styles/Icons',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

const IconDisplay = ({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      p: 2,
      borderRadius: 1,
      border: '1px solid',
      borderColor: 'divider',
      minWidth: 120,
    }}
  >
    <Box sx={{ '& svg': { width: 24, height: 24 } }}>{children}</Box>
    <Typography variant="caption" align="center">
      {name}
    </Typography>
  </Box>
);

export const AllIcons: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Custom Theme Icons</Typography>
      <Typography variant="body2" color="text.secondary">
        These icons are used internally by the theme for component overrides
        (alerts, checkboxes, breadcrumbs, date picker, autocomplete).
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <IconDisplay name="BreadcrumbIcon">
          <BreadcrumbIcon />
        </IconDisplay>
        <IconDisplay name="CheckedIcon">
          <CheckedIcon />
        </IconDisplay>
        <IconDisplay name="UncheckedIcon">
          <UncheckedIcon />
        </IconDisplay>
        <IconDisplay name="IndeterminateIcon">
          <IndeterminateIcon />
        </IconDisplay>
        <IconDisplay name="DatePickerIcon">
          <DatePickerIcon />
        </IconDisplay>
        <IconDisplay name="InputCloseIcon">
          <InputCloseIcon />
        </IconDisplay>
        <IconDisplay name="ErrorStatusIcon">
          <ErrorStatusIcon />
        </IconDisplay>
        <IconDisplay name="WarningStatusIcon">
          <WarningStatusIcon />
        </IconDisplay>
        <IconDisplay name="InfoStatusIcon">
          <InfoStatusIcon />
        </IconDisplay>
        <IconDisplay name="SuccessStatusIcon">
          <SuccessStatusIcon />
        </IconDisplay>
      </Box>

      <Typography variant="h3" sx={{ pt: 2 }}>
        Icons at Different Sizes
      </Typography>
      <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
        {[14, 16, 20, 24, 32, 48].map((size) => (
          <Box key={size} sx={{ textAlign: 'center' }}>
            <SuccessStatusIcon sx={{ width: size, height: size }} />
            <Typography variant="caption" display="block">
              {size}px
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  ),
};
