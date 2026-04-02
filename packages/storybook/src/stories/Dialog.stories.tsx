import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stack,
  TextField,
} from '@mui/material';

const meta: Meta<typeof Dialog> = {
  title: 'Styles/Dialog',
  component: Dialog,
};

export default meta;
type Story = StoryObj<typeof Dialog>;

const SimpleDialogDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Open Dialog
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Dialog Title</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This is a simple dialog with some content text. You can put any
            content here.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpen(false)} variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const Simple: Story = {
  render: () => <SimpleDialogDemo />,
};

const FormDialogDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Open Form Dialog
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Subscribe</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter your email address to subscribe to this newsletter.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => setOpen(false)}>Subscribe</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const FormDialog: Story = {
  render: () => <FormDialogDemo />,
};

const FullWidthDialogDemo = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        Full Width Dialog
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Full Width</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This dialog takes the full width of its max-width container.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const FullWidth: Story = {
  render: () => <FullWidthDialogDemo />,
};

const SizesDemo = () => {
  const [open, setOpen] = useState<false | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>(
    false,
  );
  return (
    <>
      <Stack direction="row" spacing={2}>
        {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
          <Button key={size} variant="outlined" onClick={() => setOpen(size)}>
            {size}
          </Button>
        ))}
      </Stack>
      <Dialog
        open={!!open}
        onClose={() => setOpen(false)}
        maxWidth={open || 'sm'}
        fullWidth
      >
        <DialogTitle>Max Width: {open}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Dialog content at {open} max width.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const Sizes: Story = {
  render: () => <SizesDemo />,
};
