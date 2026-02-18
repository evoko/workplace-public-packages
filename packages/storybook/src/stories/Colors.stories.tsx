import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Stack, Typography, useTheme } from '@mui/material';

/**
 * Helper: a single color swatch with label + hex value.
 */
const Swatch = ({
  color,
  label,
  bordered,
}: {
  color: string;
  label: string;
  bordered?: boolean;
}) => (
  <Stack alignItems="center" spacing={0.5} sx={{ width: 100 }}>
    <Box
      sx={{
        width: 64,
        height: 64,
        borderRadius: 1,
        backgroundColor: color,
        border: bordered ? '1px solid' : 'none',
        borderColor: 'divider',
      }}
    />
    <Typography variant="caption" fontWeight={600}>
      {label}
    </Typography>
    <Typography variant="caption" color="text.secondary">
      {color}
    </Typography>
  </Stack>
);

/**
 * A labelled row of swatches.
 */
const ColorGroup = ({
  title,
  swatches,
}: {
  title: string;
  swatches: { color: string; label: string; bordered?: boolean }[];
}) => (
  <Box sx={{ mb: 4 }}>
    <Typography variant="h2" sx={{ mb: 2 }}>
      {title}
    </Typography>
    <Stack direction="row" flexWrap="wrap" gap={2}>
      {swatches.map((s) => (
        <Swatch key={s.label} {...s} />
      ))}
    </Stack>
  </Box>
);

/**
 * Renders the full color palette pulled from the active MUI theme.
 */
const AllColors = () => {
  const theme = useTheme();
  const p = theme.palette;

  return (
    <Stack spacing={2}>
      {/* ---- Primary / Secondary ---- */}
      <ColorGroup
        title="Primary"
        swatches={[
          { color: p.primary.main, label: 'main' },
          { color: p.primary.light, label: 'light' },
          { color: p.primary.dark, label: 'dark' },
          {
            color: p.primary.contrastText,
            label: 'contrastText',
            bordered: true,
          },
        ]}
      />

      <ColorGroup
        title="Secondary"
        swatches={[
          { color: p.secondary.main, label: 'main', bordered: true },
          { color: p.secondary.light, label: 'light', bordered: true },
          { color: p.secondary.dark, label: 'dark', bordered: true },
          { color: p.secondary.contrastText, label: 'contrastText' },
        ]}
      />

      {/* ---- Status colors ---- */}
      <ColorGroup
        title="Success"
        swatches={[
          { color: p.success.main, label: 'main' },
          { color: p.success.light, label: 'light' },
          { color: p.success.dark, label: 'dark' },
          { color: p.background.success, label: 'background' },
        ]}
      />

      <ColorGroup
        title="Warning"
        swatches={[
          { color: p.warning.main, label: 'main' },
          { color: p.warning.light, label: 'light' },
          { color: p.warning.dark, label: 'dark' },
          { color: p.background.warning, label: 'background' },
        ]}
      />

      <ColorGroup
        title="Error"
        swatches={[
          { color: p.error.main, label: 'main' },
          { color: p.error.light, label: 'light' },
          { color: p.error.dark, label: 'dark' },
          { color: p.background.error, label: 'background' },
        ]}
      />

      <ColorGroup
        title="Info"
        swatches={[
          { color: p.info.main, label: 'main' },
          { color: p.info.light, label: 'light' },
          { color: p.info.dark, label: 'dark' },
          { color: p.background.info, label: 'background' },
        ]}
      />

      {/* ---- Custom brand colors ---- */}
      <ColorGroup
        title="Biamp"
        swatches={[
          { color: p.biamp.main, label: 'main' },
          { color: p.biamp.light, label: 'light' },
          { color: p.biamp.dark, label: 'dark' },
        ]}
      />

      <ColorGroup
        title="Purple"
        swatches={[
          { color: p.purple.main, label: 'main' },
          { color: p.purple.light, label: 'light' },
          { color: p.purple.dark, label: 'dark' },
        ]}
      />

      <ColorGroup
        title="Blue"
        swatches={[
          { color: p.blue.main, label: 'main' },
          { color: p.blue.light, label: 'light' },
          { color: p.blue.dark, label: 'dark' },
        ]}
      />

      {/* ---- Grey scale ---- */}
      <ColorGroup
        title="Grey"
        swatches={[
          { color: p.grey[50], label: '50', bordered: true },
          { color: p.grey[100], label: '100', bordered: true },
          { color: p.grey[200], label: '200', bordered: true },
          { color: p.grey[300], label: '300' },
          { color: p.grey[400], label: '400' },
          { color: p.grey[500], label: '500' },
          { color: p.grey[600], label: '600' },
          { color: p.grey[700], label: '700' },
          { color: p.grey[800], label: '800' },
          { color: p.grey[900], label: '900' },
        ]}
      />

      {/* ---- Common ---- */}
      <ColorGroup
        title="Common"
        swatches={[
          { color: p.common.black, label: 'black' },
          { color: p.common.white, label: 'white', bordered: true },
        ]}
      />

      {/* ---- Text ---- */}
      <ColorGroup
        title="Text"
        swatches={[
          { color: p.text.primary, label: 'primary' },
          { color: p.text.secondary, label: 'secondary' },
          { color: p.text.disabled, label: 'disabled' },
        ]}
      />

      {/* ---- Background ---- */}
      <ColorGroup
        title="Background"
        swatches={[
          { color: p.background.default, label: 'default', bordered: true },
          { color: p.background.paper, label: 'paper', bordered: true },
        ]}
      />

      {/* ---- Dividers ---- */}
      <ColorGroup
        title="Dividers"
        swatches={[
          { color: p.divider, label: 'divider' },
          { color: p.dividers.primary, label: 'primary' },
          { color: p.dividers.secondary, label: 'secondary' },
        ]}
      />

      {/* ---- Action ---- */}
      <ColorGroup
        title="Action"
        swatches={[
          { color: p.action.disabled, label: 'disabled' },
          { color: p.action.disabledBackground, label: 'disabledBg' },
        ]}
      />
    </Stack>
  );
};

const meta: Meta = {
  title: 'Styles/Colors',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Palette: Story = {
  render: () => <AllColors />,
};
