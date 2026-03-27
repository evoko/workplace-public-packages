import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { solarPrimitives } from '@bwp-web/styles';

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
    <Typography variant="h5" sx={{ mb: 2 }}>
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
 * Renders the full SOLAR color palette from the active MUI theme + primitives.
 */
const AllColors = () => {
  const theme = useTheme();
  const p = theme.palette;

  return (
    <Stack spacing={2}>
      {/* ---- MUI Palette: Primary / Secondary ---- */}
      <ColorGroup
        title="Primary"
        swatches={[
          { color: p.primary.main, label: 'main' },
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
          { color: p.secondary.main, label: 'main' },
          { color: p.secondary.contrastText, label: 'contrastText' },
        ]}
      />

      {/* ---- Status colors ---- */}
      <ColorGroup
        title="Error"
        swatches={[
          { color: p.error.main, label: 'main' },
          { color: p.error.light, label: 'light' },
          { color: p.error.dark, label: 'dark' },
          {
            color: p.error.contrastText,
            label: 'contrastText',
            bordered: true,
          },
        ]}
      />

      <ColorGroup
        title="Warning"
        swatches={[
          { color: p.warning.main, label: 'main' },
          { color: p.warning.light, label: 'light' },
          { color: p.warning.dark, label: 'dark' },
          {
            color: p.warning.contrastText,
            label: 'contrastText',
            bordered: true,
          },
        ]}
      />

      <ColorGroup
        title="Success"
        swatches={[
          { color: p.success.main, label: 'main' },
          { color: p.success.light, label: 'light' },
          { color: p.success.dark, label: 'dark' },
          {
            color: p.success.contrastText,
            label: 'contrastText',
            bordered: true,
          },
        ]}
      />

      <ColorGroup
        title="Info"
        swatches={[
          { color: p.info.main, label: 'main' },
          { color: p.info.light, label: 'light' },
          { color: p.info.dark, label: 'dark' },
          {
            color: p.info.contrastText,
            label: 'contrastText',
            bordered: true,
          },
        ]}
      />

      {/* ---- Primitives: Brand scale ---- */}
      <ColorGroup
        title="Brand"
        swatches={[
          { color: solarPrimitives.brand[50], label: '50', bordered: true },
          { color: solarPrimitives.brand[100], label: '100', bordered: true },
          { color: solarPrimitives.brand[200], label: '200' },
          { color: solarPrimitives.brand[300], label: '300' },
          { color: solarPrimitives.brand[400], label: '400' },
          { color: solarPrimitives.brand[500], label: '500' },
          { color: solarPrimitives.brand[600], label: '600' },
          { color: solarPrimitives.brand[700], label: '700' },
          { color: solarPrimitives.brand[800], label: '800' },
          { color: solarPrimitives.brand[900], label: '900' },
        ]}
      />

      {/* ---- Primitives: Neutral scale ---- */}
      <ColorGroup
        title="Neutral"
        swatches={[
          { color: solarPrimitives.neutral[50], label: '50', bordered: true },
          { color: solarPrimitives.neutral[100], label: '100', bordered: true },
          { color: solarPrimitives.neutral[200], label: '200', bordered: true },
          { color: solarPrimitives.neutral[300], label: '300' },
          { color: solarPrimitives.neutral[400], label: '400' },
          { color: solarPrimitives.neutral[500], label: '500' },
          { color: solarPrimitives.neutral[600], label: '600' },
          { color: solarPrimitives.neutral[700], label: '700' },
          { color: solarPrimitives.neutral[800], label: '800' },
          { color: solarPrimitives.neutral[900], label: '900' },
        ]}
      />

      {/* ---- Primitives: Feedback scales ---- */}
      <ColorGroup
        title="Red"
        swatches={[
          { color: solarPrimitives.red[50], label: '50', bordered: true },
          { color: solarPrimitives.red[100], label: '100' },
          { color: solarPrimitives.red[200], label: '200' },
          { color: solarPrimitives.red[300], label: '300' },
          { color: solarPrimitives.red[400], label: '400' },
          { color: solarPrimitives.red[500], label: '500' },
          { color: solarPrimitives.red[600], label: '600' },
          { color: solarPrimitives.red[700], label: '700' },
        ]}
      />

      <ColorGroup
        title="Orange"
        swatches={[
          { color: solarPrimitives.orange[50], label: '50', bordered: true },
          { color: solarPrimitives.orange[100], label: '100' },
          { color: solarPrimitives.orange[200], label: '200' },
          { color: solarPrimitives.orange[300], label: '300' },
          { color: solarPrimitives.orange[400], label: '400' },
          { color: solarPrimitives.orange[500], label: '500' },
          { color: solarPrimitives.orange[600], label: '600' },
          { color: solarPrimitives.orange[700], label: '700' },
        ]}
      />

      <ColorGroup
        title="Green"
        swatches={[
          { color: solarPrimitives.green[50], label: '50', bordered: true },
          { color: solarPrimitives.green[100], label: '100' },
          { color: solarPrimitives.green[200], label: '200' },
          { color: solarPrimitives.green[300], label: '300' },
          { color: solarPrimitives.green[400], label: '400' },
          { color: solarPrimitives.green[500], label: '500' },
          { color: solarPrimitives.green[600], label: '600' },
          { color: solarPrimitives.green[700], label: '700' },
        ]}
      />

      <ColorGroup
        title="Blue"
        swatches={[
          { color: solarPrimitives.blue[50], label: '50', bordered: true },
          { color: solarPrimitives.blue[100], label: '100' },
          { color: solarPrimitives.blue[200], label: '200' },
          { color: solarPrimitives.blue[300], label: '300' },
          { color: solarPrimitives.blue[400], label: '400' },
          { color: solarPrimitives.blue[500], label: '500' },
          { color: solarPrimitives.blue[600], label: '600' },
          { color: solarPrimitives.blue[700], label: '700' },
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

      {/* ---- Divider ---- */}
      <ColorGroup
        title="Divider"
        swatches={[{ color: p.divider, label: 'divider' }]}
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
};

export default meta;
type Story = StoryObj;

export const Palette: Story = {
  render: () => <AllColors />,
};
