import type { Meta, StoryObj } from '@storybook/react-vite';
import { SpeedDial, SpeedDialAction, SpeedDialIcon, Box } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';

const meta: Meta<typeof SpeedDial> = {
  title: 'Styles/SpeedDial',
  component: SpeedDial,
};

export default meta;
type Story = StoryObj<typeof SpeedDial>;

const actions = [
  { icon: <FileCopyIcon />, name: 'Copy' },
  { icon: <SaveIcon />, name: 'Save' },
  { icon: <PrintIcon />, name: 'Print' },
  { icon: <ShareIcon />, name: 'Share' },
];

export const Basic: Story = {
  render: () => (
    <Box sx={{ height: 320, position: 'relative' }}>
      <SpeedDial
        ariaLabel="SpeedDial"
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            slotProps={{ tooltip: { title: action.name } }}
          />
        ))}
      </SpeedDial>
    </Box>
  ),
};

export const Directions: Story = {
  render: () => (
    <Box sx={{ height: 400, position: 'relative' }}>
      {(['up', 'right', 'down', 'left'] as const).map((direction, i) => (
        <SpeedDial
          key={direction}
          ariaLabel={`SpeedDial ${direction}`}
          sx={{
            position: 'absolute',
            ...(direction === 'up' && { bottom: 16, right: 16 }),
            ...(direction === 'down' && { top: 16, right: 16 }),
            ...(direction === 'left' && { bottom: 16, right: 200 }),
            ...(direction === 'right' && { top: 16, left: 16 }),
          }}
          icon={<SpeedDialIcon />}
          direction={direction}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              slotProps={{ tooltip: { title: action.name } }}
            />
          ))}
        </SpeedDial>
      ))}
    </Box>
  ),
};
