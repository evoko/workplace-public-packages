import React from 'react';
import { Button, ButtonGroup, Typography } from '@mui/material';
import type { ViewportMode } from '@bwp-web/canvas';

export interface ViewportControlsProps {
  viewportMode: ViewportMode;
  zoom: number;
  onModeChange: (mode: ViewportMode) => void;
  onReset: () => void;
}

export function ViewportControls({
  viewportMode,
  zoom,
  onModeChange,
  onReset,
}: ViewportControlsProps) {
  return (
    <div>
      <Typography variant="subtitle2" gutterBottom>
        Viewport
      </Typography>
      <ButtonGroup fullWidth size="small" sx={{ mb: 1 }}>
        <Button
          variant={viewportMode === 'select' ? 'contained' : 'outlined'}
          onClick={() => onModeChange('select')}
        >
          Select
        </Button>
        <Button
          variant={viewportMode === 'pan' ? 'contained' : 'outlined'}
          onClick={() => onModeChange('pan')}
        >
          Pan
        </Button>
      </ButtonGroup>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Zoom: {Math.round(zoom * 100)}%
      </Typography>
      <Button variant="outlined" size="small" fullWidth onClick={onReset}>
        Reset View
      </Button>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: 'block' }}
      >
        Scroll to zoom.{' '}
        {viewportMode === 'select' ? 'Cmd/Ctrl+drag to pan.' : 'Drag to pan.'}
      </Typography>
    </div>
  );
}
