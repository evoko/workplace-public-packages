import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Stack,
  Typography,
  TextField,
} from '@mui/material';

const meta: Meta<typeof Dialog> = {
  title: 'Styles/Dialog',
  component: Dialog,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Confirmation: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Stack spacing={2}>
        <Typography variant="h3">Confirmation Dialog</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open Dialog
        </Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Confirm Action</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to proceed with this action? This cannot be
              undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(false)}
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    );
  },
};

export const DeleteConfirmation: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Stack spacing={2}>
        <Typography variant="h3">Delete Confirmation</Typography>
        <Button variant="contained" color="error" onClick={() => setOpen(true)}>
          Delete Item
        </Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Delete Item</DialogTitle>
          <DialogContent>
            <DialogContentText>
              This will permanently delete the selected item. This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpen(false)}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    );
  },
};

export const WithForm: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Stack spacing={2}>
        <Typography variant="h3">Dialog with Form</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Create New
        </Button>
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Fill in the details below to create a new item.
            </DialogContentText>
            <Stack spacing={2}>
              <TextField label="Name" placeholder="Enter name" fullWidth />
              <TextField
                label="Description"
                placeholder="Enter description"
                multiline
                rows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(false)}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    );
  },
};

export const ThreeButtonActions: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <Stack spacing={2}>
        <Typography variant="h3">Three-button Dialog</Typography>
        <Typography variant="body2" color="text.secondary">
          The theme auto-pushes the first button to the left when there are 3+
          action buttons.
        </Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Open Dialog
        </Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Review Changes</DialogTitle>
          <DialogContent>
            <DialogContentText>
              You have unsaved changes. What would you like to do?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setOpen(false)}
            >
              Discard
            </Button>
            <Button variant="outlined" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpen(false)}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    );
  },
};
