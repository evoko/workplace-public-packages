import React from 'react';
import type { ViewportMode } from '@bwp-web/canvas';

export interface ViewportControlToolbarProps {
  zoom: number;
  viewportMode: ViewportMode;
  onModeChange: (mode: ViewportMode) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  /** Optional callback to zoom-to-fit the first object on the canvas. */
  onZoomToFit?: () => void;
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
  onZoomToFit,
}: ViewportControlToolbarProps) {
  const iconBtnStyle: React.CSSProperties = {
    padding: 4,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    borderRadius: 4,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 16,
    color: 'var(--solar-text-default, #424242)',
  };

  const toggleBtnStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 8px',
    border: '1px solid var(--solar-border-default, #bdbdbd)',
    background: active
      ? 'var(--solar-surface-primary, #1976d2)'
      : 'transparent',
    color: active ? '#fff' : 'var(--solar-text-default, #424242)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 8,
        paddingRight: 8,
        paddingTop: 4,
        paddingBottom: 4,
        borderRadius: 8,
        backgroundColor: 'var(--solar-surface-default, #fff)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}
    >
      {/* Mode toggle */}
      <div style={{ display: 'inline-flex', marginRight: 4 }}>
        <button
          title="Select mode"
          onClick={() => onModeChange('select')}
          style={toggleBtnStyle(viewportMode === 'select')}
        >
          ↖
        </button>
        <button
          title="Pan mode"
          onClick={() => onModeChange('pan')}
          style={{
            ...toggleBtnStyle(viewportMode === 'pan'),
            marginLeft: -1,
          }}
        >
          ✋
        </button>
      </div>

      {/* Zoom controls */}
      <button title="Zoom out" onClick={() => onZoomOut()} style={iconBtnStyle}>
        −
      </button>

      <span
        style={{
          minWidth: 40,
          textAlign: 'center',
          fontVariantNumeric: 'tabular-nums',
          fontSize: 12,
          color: 'var(--solar-text-default, #424242)',
        }}
      >
        {Math.round(zoom * 100)}%
      </span>

      <button title="Zoom in" onClick={() => onZoomIn()} style={iconBtnStyle}>
        +
      </button>

      {/* Reset viewport */}
      <button
        title="Reset viewport"
        onClick={onReset}
        style={{ ...iconBtnStyle, marginLeft: 4 }}
      >
        ⊡
      </button>

      {/* Zoom to fit */}
      {onZoomToFit && (
        <button title="Zoom to Fit" onClick={onZoomToFit} style={iconBtnStyle}>
          ⊞
        </button>
      )}
    </div>
  );
}
