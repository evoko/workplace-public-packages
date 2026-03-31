import React from 'react';
import { Canvas } from '@bwp-web/canvas';
import type { Canvas as FabricCanvas } from 'fabric';

export interface DemoLayoutProps {
  sidebar: React.ReactNode;
  onReady: (canvas: FabricCanvas) => void;
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
  canvasOverlay,
}: DemoLayoutProps) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div
        style={{
          width: 260,
          padding: 16,
          borderRight: '1px solid var(--solar-border-default, #e0e0e0)',
          overflow: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {sidebar}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Canvas onReady={onReady} style={{ background: '#fff' }} />
        {canvasOverlay}
      </div>
    </div>
  );
}
