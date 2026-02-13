import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Typography,
  Checkbox,
} from '@mui/material';

const meta: Meta<typeof Table> = {
  title: 'Styles/Table',
  component: Table,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Table>;

const rows = [
  { id: 1, name: 'Conference Room A', status: 'Available', capacity: 12 },
  { id: 2, name: 'Conference Room B', status: 'Occupied', capacity: 8 },
  { id: 3, name: 'Meeting Room 1', status: 'Available', capacity: 4 },
  { id: 4, name: 'Meeting Room 2', status: 'Maintenance', capacity: 6 },
  { id: 5, name: 'Board Room', status: 'Available', capacity: 20 },
];

export const Default: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Table</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Room Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Capacity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell align="right">{row.capacity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  ),
};

export const WithSelection: Story = {
  render: () => (
    <Stack spacing={3}>
      <Typography variant="h3">Table with Selection</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox />
              </TableCell>
              <TableCell>Room Name</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Capacity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id} selected={index === 1}>
                <TableCell padding="checkbox">
                  <Checkbox checked={index === 1} />
                </TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell align="right">{row.capacity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  ),
};
