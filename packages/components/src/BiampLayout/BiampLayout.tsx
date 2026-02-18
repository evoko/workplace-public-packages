import { Stack, StackProps } from '@mui/material';
import React from 'react';

type BiampLayoutProps = StackProps & {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
};

export function BiampLayout({
  header,
  sidebar,
  children,
  sx,
  ...props
}: BiampLayoutProps) {
  return (
    <Stack direction="column" height="100vh" sx={{ ...sx }} {...props}>
      {header}
      <Stack
        direction="row"
        height="100%"
        gap={{ xs: 1.5, md: 2.5 }}
        px={{ xs: 1.5, md: 2.5 }}
        pb={{ xs: 1.5, md: 2.5 }}
        pt={{ xs: header ? 0 : 1.5, md: header ? 0 : 2.5 }}
      >
        {sidebar}
        {children}
      </Stack>
    </Stack>
  );
}
