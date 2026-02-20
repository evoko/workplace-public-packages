import React from 'react';
import { Box, Stack } from '@mui/material';
import { Canvas, type CanvasProps } from '@bwp-web/canvas';
import type { Canvas as FabricCanvas } from 'fabric';

export interface DemoLayoutProps {
  sidebar: React.ReactNode;
  onReady: (canvas: FabricCanvas) => void;
  canvasWidth?: number;
  canvasHeight?: number;
}

export function DemoLayout({
  sidebar,
  onReady,
  canvasWidth = 800,
  canvasHeight = 600,
}: DemoLayoutProps) {
  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Box
        sx={{
          width: 260,
          p: 2,
          borderRight: 1,
          borderColor: 'divider',
          overflow: 'auto',
        }}
      >
        <Stack spacing={3}>{sidebar}</Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
        }}
      >
        <Canvas
          width={canvasWidth}
          height={canvasHeight}
          onReady={onReady}
          style={{ border: '1px solid #ccc', background: '#fff' }}
        />
      </Box>
    </Box>
  );
}
