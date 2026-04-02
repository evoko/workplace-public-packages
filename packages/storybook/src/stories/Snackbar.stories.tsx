import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Snackbar, Button, Alert, Stack, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const meta: Meta<typeof Snackbar> = {
  title: 'Styles/Snackbar',
  component: Snackbar,
};

export default meta;
type Story = StoryObj<typeof Snackbar>;

const SimpleSnackbarDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Open Snackbar
      </Button>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        message="Note archived"
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={() => setOpen(false)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </>
  );
};

export const Simple: Story = {
  render: () => <SimpleSnackbarDemo />,
};

const AlertSnackbarDemo = () => {
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState<
    'success' | 'error' | 'info' | 'warning'
  >('success');
  return (
    <>
      <Stack direction="row" spacing={2}>
        {(['success', 'error', 'info', 'warning'] as const).map((s) => (
          <Button
            key={s}
            variant="outlined"
            onClick={() => {
              setSeverity(s);
              setOpen(true);
            }}
          >
            {s}
          </Button>
        ))}
      </Stack>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
      >
        <Alert
          onClose={() => setOpen(false)}
          severity={severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          This is a {severity} alert snackbar!
        </Alert>
      </Snackbar>
    </>
  );
};

export const WithAlert: Story = {
  render: () => <AlertSnackbarDemo />,
};
