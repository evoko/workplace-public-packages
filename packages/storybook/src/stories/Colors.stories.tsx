import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Stack, Typography, useTheme } from '@mui/material';
import { solarPalette } from '@bwp-web/styles';

const Swatch = ({
  color,
  label,
  bordered,
}: {
  color: string;
  label: string;
  bordered?: boolean;
}) => (
  <Stack alignItems="center" spacing={0.5} sx={{ width: 90 }}>
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: 1,
        backgroundColor: color,
        border: bordered ? '1px solid' : 'none',
        borderColor: 'divider',
      }}
    />
    <Typography variant="caption" fontWeight={600}>
      {label}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
      {color}
    </Typography>
  </Stack>
);

const ColorGroup = ({
  title,
  swatches,
}: {
  title: string;
  swatches: { color: string; label: string; bordered?: boolean }[];
}) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" sx={{ mb: 1 }}>
      {title}
    </Typography>
    <Stack direction="row" flexWrap="wrap" gap={1.5}>
      {swatches.map((s) => (
        <Swatch key={`${s.label}-${s.color}`} {...s} />
      ))}
    </Stack>
  </Box>
);

const PrimitivePalette = () => {
  const p = solarPalette;
  return (
    <Stack spacing={1}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Primitive Colors
      </Typography>

      <ColorGroup
        title="Neutral"
        swatches={Object.entries(p.neutral).map(([k, v]) => ({
          label: k,
          color: v,
          bordered: Number(k) < 200,
        }))}
      />
      <ColorGroup
        title="Red"
        swatches={Object.entries(p.red).map(([k, v]) => ({
          label: k,
          color: v,
        }))}
      />
      <ColorGroup
        title="Green"
        swatches={Object.entries(p.green).map(([k, v]) => ({
          label: k,
          color: v,
        }))}
      />
      <ColorGroup
        title="Orange"
        swatches={Object.entries(p.orange).map(([k, v]) => ({
          label: k,
          color: v,
        }))}
      />
      <ColorGroup
        title="Blue"
        swatches={Object.entries(p.blue).map(([k, v]) => ({
          label: k,
          color: v,
        }))}
      />
      <ColorGroup
        title="Turquoise"
        swatches={Object.entries(p.turquoise).map(([k, v]) => ({
          label: k,
          color: v,
        }))}
      />
      <ColorGroup
        title="Yellow"
        swatches={Object.entries(p.yellow).map(([k, v]) => ({
          label: k,
          color: v,
        }))}
      />
      <ColorGroup
        title="Purple"
        swatches={Object.entries(p.purple).map(([k, v]) => ({
          label: k,
          color: v,
        }))}
      />
      <ColorGroup
        title="Brand"
        swatches={[
          { label: 'red', color: p.brand.red },
          { label: 'black', color: p.brand.black },
          { label: 'white', color: p.brand.white, bordered: true },
        ]}
      />
    </Stack>
  );
};

const SemanticPalette = () => {
  const theme = useTheme();
  const p = theme.palette;

  return (
    <Stack spacing={1}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Semantic Colors (Theme)
      </Typography>

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
          { color: p.secondary.main, label: 'main' },
          { color: p.secondary.light, label: 'light' },
          { color: p.secondary.dark, label: 'dark' },
          {
            color: p.secondary.contrastText,
            label: 'contrastText',
            bordered: true,
          },
        ]}
      />
      <ColorGroup
        title="Error"
        swatches={[
          { color: p.error.main, label: 'main' },
          { color: p.error.light, label: 'light', bordered: true },
          { color: p.error.dark, label: 'dark' },
        ]}
      />
      <ColorGroup
        title="Warning"
        swatches={[
          { color: p.warning.main, label: 'main' },
          { color: p.warning.light, label: 'light', bordered: true },
          { color: p.warning.dark, label: 'dark' },
        ]}
      />
      <ColorGroup
        title="Success"
        swatches={[
          { color: p.success.main, label: 'main' },
          { color: p.success.light, label: 'light', bordered: true },
          { color: p.success.dark, label: 'dark' },
        ]}
      />
      <ColorGroup
        title="Info"
        swatches={[
          { color: p.info.main, label: 'main' },
          { color: p.info.light, label: 'light', bordered: true },
          { color: p.info.dark, label: 'dark' },
        ]}
      />
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
      <ColorGroup
        title="Text"
        swatches={[
          { color: p.text.primary, label: 'primary' },
          { color: p.text.secondary, label: 'secondary' },
          { color: p.text.disabled, label: 'disabled' },
        ]}
      />
      <ColorGroup
        title="Background"
        swatches={[
          { color: p.background.default, label: 'default', bordered: true },
          { color: p.background.paper, label: 'paper', bordered: true },
        ]}
      />
      <ColorGroup
        title="Divider"
        swatches={[{ color: p.divider, label: 'divider' }]}
      />
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

export const Primitives: Story = {
  render: () => <PrimitivePalette />,
};

export const Semantic: Story = {
  render: () => <SemanticPalette />,
};
