import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Stack, Typography } from '@mui/material';
import { solarShadows } from '@bwp-web/styles';

const meta: Meta = {
  title: 'Styles/Shadows',
};

export default meta;
type Story = StoryObj;

const ShadowSwatch = ({ name, value }: { name: string; value: string }) => (
  <Stack alignItems="center" spacing={1}>
    <Box
      sx={{
        width: 160,
        height: 80,
        borderRadius: 1,
        bgcolor: 'background.paper',
        boxShadow: value,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {name}
      </Typography>
    </Box>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ maxWidth: 160, textAlign: 'center', wordBreak: 'break-all' }}
    >
      {value}
    </Typography>
  </Stack>
);

export const AllShadows: Story = {
  name: 'Shadow tokens',
  render: () => (
    <Stack spacing={4}>
      <Typography variant="h6">Shadow tokens (solarShadows)</Typography>
      <Stack direction="row" flexWrap="wrap" gap={3}>
        {(Object.entries(solarShadows) as [string, string][]).map(
          ([name, value]) => (
            <ShadowSwatch key={name} name={name} value={value} />
          ),
        )}
      </Stack>
    </Stack>
  ),
};
