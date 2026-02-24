import React from 'react';
import {
  Box,
  IconButton,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CropFreeIcon from '@mui/icons-material/CropFree';
import PanToolIcon from '@mui/icons-material/PanTool';
import NearMeIcon from '@mui/icons-material/NearMe';
import type { ViewportMode } from '@bwp-web/canvas';

export interface ViewportControlToolbarProps {
  zoom: number;
  viewportMode: ViewportMode;
  onModeChange: (mode: ViewportMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

/**
 * A compact floating toolbar overlaid on the canvas.
 *
 * Render this as the `canvasOverlay` prop of `DemoLayout`:
 *
 * ```tsx
 * <DemoLayout
 *   canvasOverlay={
 *     <ViewportControlToolbar
 *       zoom={canvas.zoom}
 *       viewportMode={canvas.viewport.mode}
 *       onModeChange={canvas.viewport.setMode}
 *       onZoomIn={canvas.viewport.zoomIn}
 *       onZoomOut={canvas.viewport.zoomOut}
 *       onReset={canvas.viewport.reset}
 *     />
 *   }
 * />
 * ```
 */
export function ViewportControlToolbar({
  zoom,
  viewportMode,
  onModeChange,
  onZoomIn,
  onZoomOut,
  onReset,
}: ViewportControlToolbarProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      {/* Mode toggle */}
      <ToggleButtonGroup
        value={viewportMode}
        exclusive
        size="small"
        onChange={(_, value) => value && onModeChange(value as ViewportMode)}
        sx={{ mr: 0.5 }}
      >
        <Tooltip title="Select mode">
          <ToggleButton value="select" sx={{ px: 1 }}>
            <NearMeIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="Pan mode">
          <ToggleButton value="pan" sx={{ px: 1 }}>
            <PanToolIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>

      {/* Zoom controls */}
      <Tooltip title="Zoom out">
        <IconButton size="small" onClick={() => onZoomOut()}>
          <RemoveIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Typography
        variant="caption"
        sx={{
          minWidth: 40,
          textAlign: 'center',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {Math.round(zoom * 100)}%
      </Typography>

      <Tooltip title="Zoom in">
        <IconButton size="small" onClick={() => onZoomIn()}>
          <AddIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      {/* Reset viewport */}
      <Tooltip title="Reset viewport">
        <IconButton size="small" onClick={onReset} sx={{ ml: 0.5 }}>
          <CropFreeIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Paper>
  );
}
