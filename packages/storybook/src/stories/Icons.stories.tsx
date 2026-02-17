import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Stack, Typography, Box } from '@mui/material';

import {
  AppsIcon,
  AppsIconFilled,
  BiampLogoIcon,
  BreadcrumbIcon,
  CheckedIcon,
  DatePickerIcon,
  ErrorStatusIcon,
  IndeterminateIcon,
  InfoStatusIcon,
  InputCloseIcon,
  SearchIcon,
  SuccessStatusIcon,
  UncheckedIcon,
  WarningStatusIcon,
  BiampRedLogo,
  BookingApp,
  CommandApp,
  ConnectApp,
  DesignerApp,
  WorkplaceApp,
} from '@bwp-web/assets';

const meta: Meta = {
  title: 'Assets/Icons',
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

/**
 * All icons and images exported by `@bwp-web/assets`, organised by category.
 */
export const AllIcons: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Component Icons</Typography>
      <Typography variant="body2" color="text.secondary">
        Icons used directly in Biamp Workplace components (header, sidebar, app
        launcher).
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <IconDisplay name="BiampLogoIcon">
          <BiampLogoIcon />
        </IconDisplay>
        <IconDisplay name="SearchIcon">
          <SearchIcon />
        </IconDisplay>
        <IconDisplay name="AppsIcon">
          <AppsIcon />
        </IconDisplay>
        <IconDisplay name="AppsIconFilled">
          <AppsIconFilled />
        </IconDisplay>
      </Box>

      <Typography variant="h3" sx={{ pt: 2 }}>
        Theme Icons
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Icons used internally by the theme for component overrides (alerts,
        checkboxes, breadcrumbs, date picker, autocomplete).
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
        Images
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Static image assets exported as data URLs.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
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
          <Box
            component="img"
            src={BiampRedLogo}
            alt="Biamp Red Logo"
            sx={{ width: 24, height: 24 }}
          />
          <Typography variant="caption" align="center">
            BiampRedLogo
          </Typography>
        </Box>
      </Box>

      <Typography variant="h3" sx={{ pt: 2 }}>
        App Images
      </Typography>
      <Typography variant="body2" color="text.secondary">
        PNG images for the app-launcher dialog tiles. Each export is a data URL
        string.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {[
          { src: BookingApp, name: 'BookingApp' },
          { src: CommandApp, name: 'CommandApp' },
          { src: ConnectApp, name: 'ConnectApp' },
          { src: DesignerApp, name: 'DesignerApp' },
          { src: WorkplaceApp, name: 'WorkplaceApp' },
        ].map((img) => (
          <Box
            key={img.name}
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
            <Box
              component="img"
              src={img.src}
              alt={img.name}
              sx={{ width: 54, height: 54, objectFit: 'contain' }}
            />
            <Typography variant="caption" align="center">
              {img.name}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  ),
};

/**
 * Icons rendered at multiple sizes to verify they scale correctly.
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Icons at Different Sizes</Typography>
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
