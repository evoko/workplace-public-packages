import React from 'react';
import { Box, Stack } from '@mui/material';
import { Canvas } from '@bwp-web/canvas';
import type { Canvas as FabricCanvas } from 'fabric';

export interface DemoLayoutProps {
  sidebar: React.ReactNode;
  onReady: (canvas: FabricCanvas) => void;
  canvasWidth?: number;
  canvasHeight?: number;
  /**
   * Content to render overlaid on the canvas, positioned absolutely relative
   * to the canvas element. Use this for floating toolbars, e.g.:
   *
   * ```tsx
   * canvasOverlay={<ViewportControlToolbar ... />}
   * ```
   */
  canvasOverlay?: React.ReactNode;
}

export function DemoLayout({
  sidebar,
  onReady,
  canvasWidth = 800,
  canvasHeight = 600,
  canvasOverlay,
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
        <Box sx={{ position: 'relative', display: 'inline-block' }}>
          <Canvas
            width={canvasWidth}
            height={canvasHeight}
            onReady={onReady}
            style={{ border: '1px solid #ccc', background: '#fff' }}
          />
          {canvasOverlay}
        </Box>
      </Box>
    </Box>
  );
}
