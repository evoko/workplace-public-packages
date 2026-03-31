import React from 'react';
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
  const btnBase: React.CSSProperties = {
    padding: '4px 10px',
    fontSize: 13,
    cursor: 'pointer',
    border: '1px solid var(--solar-border-default, #bdbdbd)',
    flex: 1,
  };

  return (
    <div>
      <span
        style={{
          display: 'block',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 4,
          color: 'var(--solar-text-default, #212121)',
        }}
      >
        Viewport
      </span>
      <div style={{ display: 'flex', marginBottom: 8 }}>
        <button
          onClick={() => onModeChange('select')}
          style={{
            ...btnBase,
            backgroundColor:
              viewportMode === 'select'
                ? 'var(--solar-surface-primary, #1976d2)'
                : 'transparent',
            color:
              viewportMode === 'select'
                ? '#fff'
                : 'var(--solar-text-default, #212121)',
          }}
        >
          Select
        </button>
        <button
          onClick={() => onModeChange('pan')}
          style={{
            ...btnBase,
            marginLeft: -1,
            backgroundColor:
              viewportMode === 'pan'
                ? 'var(--solar-surface-primary, #1976d2)'
                : 'transparent',
            color:
              viewportMode === 'pan'
                ? '#fff'
                : 'var(--solar-text-default, #212121)',
          }}
        >
          Pan
        </button>
      </div>
      <p
        style={{
          fontSize: 14,
          color: 'var(--solar-text-secondary, #666)',
          marginBottom: 4,
        }}
      >
        Zoom: {Math.round(zoom * 100)}%
      </p>
      <button
        onClick={onReset}
        style={{
          width: '100%',
          padding: '4px 10px',
          fontSize: 13,
          cursor: 'pointer',
          border: '1px solid var(--solar-border-default, #bdbdbd)',
          backgroundColor: 'transparent',
          color: 'var(--solar-text-default, #212121)',
        }}
      >
        Reset View
      </button>
      <span
        style={{
          display: 'block',
          marginTop: 8,
          fontSize: 12,
          color: 'var(--solar-text-secondary, #666)',
        }}
      >
        Scroll to zoom.{' '}
        {viewportMode === 'select' ? 'Cmd/Ctrl+drag to pan.' : 'Drag to pan.'}
      </span>
    </div>
  );
}
