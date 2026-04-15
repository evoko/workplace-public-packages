import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Stack, Typography, Paper, Box, Skeleton } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ImageIcon from '@mui/icons-material/Image';
import { DynamicSvgIcon } from '@bwp-web/components';

// ---------------------------------------------------------------------------
// SVG data-URL helpers for demos (fetch-compatible, no network needed)
// ---------------------------------------------------------------------------
const svgUrl = (svg: string) =>
  `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;

const ICONS = {
  home: svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  ),
  star: svgUrl(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`,
  ),
};

const INVALID_URL = 'https://invalid.example.test/does-not-exist.svg';
const FALLBACK = <BrokenImageIcon />;

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------
const meta: Meta<typeof DynamicSvgIcon> = {
  title: 'Components/DynamicSvgIcon',
  component: DynamicSvgIcon,
  argTypes: {
    url: { control: 'text' },
    width: { control: 'number' },
    height: { control: 'number' },
    skeletonVariant: {
      control: 'select',
      options: ['circular', 'rectangular', 'rounded'],
    },
    skeletonAnimation: {
      control: 'select',
      options: ['pulse', 'wave', false],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DynamicSvgIcon>;

// ---------------------------------------------------------------------------
// 1. Playground
// ---------------------------------------------------------------------------
/**
 * Interactive playground — adjust all props via the controls panel.
 */
export const Playground: Story = {
  args: {
    url: ICONS.home,
    width: 48,
    height: 48,
    skeletonVariant: 'circular',
    skeletonAnimation: 'pulse',
    fallback: <ErrorOutlineIcon />,
  },
};

// ---------------------------------------------------------------------------
// 2. Sizes
// ---------------------------------------------------------------------------
/**
 * Square icons at various sizes.
 */
export const Sizes: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="subtitle2">
        <code>width</code> and <code>height</code> enforce consistent dimensions
        across all states
      </Typography>
      <Stack direction="row" spacing={3} alignItems="flex-end">
        {[16, 24, 32, 48, 64, 96].map((s) => (
          <Stack key={s} alignItems="center" spacing={0.5}>
            <DynamicSvgIcon
              url={ICONS.star}
              width={s}
              height={s}
              fallback={FALLBACK}
            />
            <Typography variant="caption">{s}px</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  ),
};

// ---------------------------------------------------------------------------
// 3. Non-Square Dimensions
// ---------------------------------------------------------------------------
/**
 * `width` and `height` can be set independently.
 */
export const NonSquareDimensions: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="subtitle2">
        Different <code>width</code> and <code>height</code> values
      </Typography>
      <Stack direction="row" spacing={4} alignItems="center">
        {[
          { w: 48, h: 24 },
          { w: 24, h: 48 },
          { w: 64, h: 32 },
          { w: 32, h: 64 },
        ].map(({ w, h }) => (
          <Stack key={`${w}x${h}`} alignItems="center" spacing={0.5}>
            <Box sx={{ border: '1px dashed', borderColor: 'divider' }}>
              <DynamicSvgIcon
                url={ICONS.star}
                width={w}
                height={h}
                fallback={FALLBACK}
              />
            </Box>
            <Typography variant="caption">
              {w}&times;{h}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  ),
};

// ---------------------------------------------------------------------------
// 4. States Overview
// ---------------------------------------------------------------------------
/**
 * Side-by-side view of loading skeleton, error fallback, and loaded icon.
 */
export const StatesOverview: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="subtitle2">
        All three states rendered at 48&times;48
      </Typography>
      <Stack direction="row" spacing={4} alignItems="center">
        <Stack alignItems="center" spacing={1}>
          <Skeleton variant="circular" sx={{ width: 48, height: 48 }} />
          <Typography variant="caption">Loading (Skeleton)</Typography>
        </Stack>

        <Stack alignItems="center" spacing={1}>
          <DynamicSvgIcon
            url={INVALID_URL}
            width={48}
            height={48}
            fallback={FALLBACK}
          />
          <Typography variant="caption">Error (Fallback)</Typography>
        </Stack>

        <Stack alignItems="center" spacing={1}>
          <DynamicSvgIcon
            url={ICONS.home}
            width={48}
            height={48}
            fallback={FALLBACK}
          />
          <Typography variant="caption">Loaded (Icon)</Typography>
        </Stack>
      </Stack>
    </Stack>
  ),
};

// ---------------------------------------------------------------------------
// 5. Skeleton Variants
// ---------------------------------------------------------------------------
/**
 * The skeleton shape can be circular (default), rectangular, or rounded.
 */
export const SkeletonVariants: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2">
        Skeleton shapes during loading
      </Typography>
      <Stack direction="row" spacing={4} alignItems="center">
        {(['circular', 'rectangular', 'rounded'] as const).map((variant) => (
          <Stack key={variant} alignItems="center" spacing={0.5}>
            <Skeleton variant={variant} sx={{ width: 48, height: 48 }} />
            <Typography variant="caption">{variant}</Typography>
          </Stack>
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Set via the <code>skeletonVariant</code> prop
      </Typography>
    </Stack>
  ),
};

// ---------------------------------------------------------------------------
// 6. Skeleton Animations
// ---------------------------------------------------------------------------
/**
 * Three animation modes: pulse (default), wave, and disabled.
 */
export const SkeletonAnimations: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2">Skeleton animation types</Typography>
      <Stack direction="row" spacing={4} alignItems="center">
        {(
          [
            ['pulse', 'pulse'],
            ['wave', 'wave'],
            [false, 'none'],
          ] as const
        ).map(([animation, label]) => (
          <Stack key={String(label)} alignItems="center" spacing={0.5}>
            <Skeleton
              variant="circular"
              animation={animation}
              sx={{ width: 48, height: 48 }}
            />
            <Typography variant="caption">{label}</Typography>
          </Stack>
        ))}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        Set via the <code>skeletonAnimation</code> prop
      </Typography>
    </Stack>
  ),
};

// ---------------------------------------------------------------------------
// 7. Fallback Types
// ---------------------------------------------------------------------------
/**
 * When the URL fails, the fallback is displayed at the same dimensions.
 * Any ReactNode can serve as a fallback.
 */
export const FallbackTypes: Story = {
  render: () => (
    <Stack spacing={2}>
      <Typography variant="subtitle2">
        Various fallback types on a broken URL
      </Typography>
      <Stack direction="row" spacing={4} alignItems="center">
        <Stack alignItems="center" spacing={0.5}>
          <DynamicSvgIcon
            url={INVALID_URL}
            width={48}
            height={48}
            fallback={<BrokenImageIcon />}
          />
          <Typography variant="caption">MUI Icon</Typography>
        </Stack>

        <Stack alignItems="center" spacing={0.5}>
          <DynamicSvgIcon
            url={INVALID_URL}
            width={48}
            height={48}
            fallback={<HelpOutlineIcon color="warning" />}
          />
          <Typography variant="caption">Colored MUI Icon</Typography>
        </Stack>

        <Stack alignItems="center" spacing={0.5}>
          <DynamicSvgIcon
            url={INVALID_URL}
            width={48}
            height={48}
            fallback={
              <Typography variant="h6" color="text.secondary">
                ?
              </Typography>
            }
          />
          <Typography variant="caption">Text fallback</Typography>
        </Stack>

        <Stack alignItems="center" spacing={0.5}>
          <DynamicSvgIcon
            url={INVALID_URL}
            width={48}
            height={48}
            fallback={<ImageIcon color="disabled" />}
          />
          <Typography variant="caption">Disabled icon</Typography>
        </Stack>
      </Stack>
    </Stack>
  ),
};

// ---------------------------------------------------------------------------
// 8. Callback Props
// ---------------------------------------------------------------------------
function CallbackDemo() {
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) =>
    setLog((prev) => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`]);

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2">
        <code>onLoad</code> and <code>onError</code> callbacks
      </Typography>
      <Stack direction="row" spacing={3} alignItems="center">
        <Stack alignItems="center" spacing={0.5}>
          <DynamicSvgIcon
            url={ICONS.home}
            width={40}
            height={40}
            fallback={FALLBACK}
            onLoad={() => addLog('home icon loaded')}
            onError={(e) => addLog(`home error: ${e}`)}
          />
          <Typography variant="caption">Valid URL</Typography>
        </Stack>
        <Stack alignItems="center" spacing={0.5}>
          <DynamicSvgIcon
            url={INVALID_URL}
            width={40}
            height={40}
            fallback={<BrokenImageIcon />}
            onLoad={() => addLog('broken icon loaded')}
            onError={(e) => addLog(`broken error: ${e}`)}
          />
          <Typography variant="caption">Invalid URL</Typography>
        </Stack>
      </Stack>
      <Paper
        variant="outlined"
        sx={{ p: 1.5, maxHeight: 140, overflow: 'auto' }}
      >
        {log.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            Callback log will appear here...
          </Typography>
        ) : (
          log.map((entry, i) => (
            <Typography
              key={i}
              variant="caption"
              display="block"
              fontFamily="monospace"
            >
              {entry}
            </Typography>
          ))
        )}
      </Paper>
    </Stack>
  );
}

/**
 * Shows the `onLoad` and `onError` callback props firing in real time.
 */
export const Callbacks: Story = {
  render: () => <CallbackDemo />,
};
