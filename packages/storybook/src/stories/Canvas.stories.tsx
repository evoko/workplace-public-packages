import React, { useCallback, useMemo, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import {
  Canvas,
  createRectangle,
  createRectangleAtPoint,
  editRectangle,
  createPolygon,
  createPolygonAtPoint,
  createPolygonFromDrag,
  editPolygon,
  enableClickToCreate,
  enableDragToCreate,
  enableDrawToCreate,
  enableVertexEdit,
} from '@bwp-web/canvas';
import { Polygon as FabricPolygon } from 'fabric';
import type { Canvas as FabricCanvas, Polygon, Rect } from 'fabric';
import { useCanvasDemo, type ModeActivator } from './useCanvasDemo';
import { ModeButtons } from './canvas/ModeButtons';
import { ViewportControls } from './canvas/ViewportControls';
import { DemoLayout } from './canvas/DemoLayout';

const meta: Meta<typeof Canvas> = {
  title: 'Canvas/Canvas',
  component: Canvas,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    noPadding: true,
  },
};

export default meta;
type Story = StoryObj<typeof Canvas>;

// --- Rectangle Demo ---

type RectMode = 'select' | 'click' | 'drag';

const RECT_MODES: Array<{ key: RectMode; label: string }> = [
  { key: 'select', label: 'Select' },
  { key: 'click', label: 'Click to Place' },
  { key: 'drag', label: 'Drag to Draw' },
];

const RECT_CLICK_STYLE = {
  fill: 'rgba(33, 150, 243, 0.3)',
  stroke: '#2196f3',
  strokeWidth: 2,
};

const RECT_DRAG_STYLE = {
  fill: 'rgba(76, 175, 80, 0.3)',
  stroke: '#4caf50',
  strokeWidth: 2,
};

/**
 * Interactive demo for creating, editing, and deleting rectangles.
 *
 * - **Select mode**: Click objects to select them, then edit.
 * - **Click-to-place mode**: Click anywhere on the canvas to place a 100x80 rectangle.
 * - **Drag-to-draw mode**: Hold mouse and drag to draw a rectangle.
 */
export const RectangleDemo: Story = {
  render: function RectangleDemo() {
    const modeActivators = useMemo<Record<RectMode, ModeActivator<RectMode>>>(
      () => ({
        select: () => null,
        click: ({ canvas, viewport, activateMode }) =>
          enableClickToCreate(
            canvas,
            (c, point) =>
              createRectangleAtPoint(c, point, {
                width: 100,
                height: 80,
                ...RECT_CLICK_STYLE,
              }),
            { onCreated: () => activateMode('select'), viewport },
          ),
        drag: ({ canvas, viewport, activateMode }) =>
          enableDragToCreate(
            canvas,
            (c, bounds) =>
              createRectangle(c, {
                left: bounds.startX + bounds.width / 2,
                top: bounds.startY + bounds.height / 2,
                width: bounds.width,
                height: bounds.height,
                ...RECT_DRAG_STYLE,
              }),
            {
              onCreated: () => activateMode('select'),
              viewport,
              previewStyle: RECT_DRAG_STYLE,
            },
          ),
      }),
      [],
    );

    const demo = useCanvasDemo<RectMode>({
      defaultMode: 'select',
      editFields: ['left', 'top', 'width', 'height'],
      modeActivators,
    });

    const handleEdit = useCallback(
      (field: string, value: string) => {
        const num = Number(value);
        if (isNaN(num)) return;

        demo.setEditValues((prev) => ({ ...prev, [field]: num }));

        const canvas = demo.canvasRef.current;
        if (canvas && demo.selected.length === 1) {
          editRectangle(canvas, demo.selected[0] as Rect, { [field]: num });
        }
      },
      [demo.selected, demo.canvasRef, demo.setEditValues],
    );

    const handleAddProgrammatic = useCallback(() => {
      const canvas = demo.canvasRef.current;
      if (!canvas) return;
      const rect = createRectangle(canvas, {
        left: 50 + Math.random() * 300,
        top: 50 + Math.random() * 200,
        width: 120,
        height: 80,
        fill: 'rgba(255, 152, 0, 0.3)',
        stroke: '#ff9800',
        strokeWidth: 2,
      });
      canvas.setActiveObject(rect);
      canvas.requestRenderAll();
    }, [demo.canvasRef]);

    return (
      <DemoLayout
        onReady={demo.handleReady}
        sidebar={
          <>
            <ModeButtons
              modes={RECT_MODES}
              activeMode={demo.mode}
              onModeChange={demo.activateMode}
            />
            <ViewportControls
              viewportMode={demo.viewportMode}
              zoom={demo.zoom}
              onModeChange={demo.handleViewportMode}
              onReset={demo.handleResetViewport}
            />
            <div>
              <Typography variant="subtitle2" gutterBottom>
                Programmatic
              </Typography>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={handleAddProgrammatic}
              >
                Add Rectangle
              </Button>
            </div>
            {demo.selected.length > 0 && (
              <>
                <Typography variant="body2" color="text.secondary">
                  {demo.selected.length} object
                  {demo.selected.length > 1 ? 's' : ''} selected
                </Typography>
                {demo.selected.length === 1 && (
                  <div>
                    <Typography variant="subtitle2" gutterBottom>
                      Edit Selected
                    </Typography>
                    <Stack spacing={1.5}>
                      {['left', 'top', 'width', 'height'].map((field) => (
                        <TextField
                          key={field}
                          label={field.charAt(0).toUpperCase() + field.slice(1)}
                          type="number"
                          size="small"
                          value={demo.editValues[field]}
                          onChange={(e) => handleEdit(field, e.target.value)}
                        />
                      ))}
                    </Stack>
                  </div>
                )}
              </>
            )}
          </>
        }
      />
    );
  },
};

// --- Polygon Demo ---

type PolygonMode = 'select' | 'click' | 'drag' | 'draw';

const POLYGON_MODES: Array<{ key: PolygonMode; label: string }> = [
  { key: 'select', label: 'Select' },
  { key: 'click', label: 'Click to Place' },
  { key: 'drag', label: 'Drag to Draw' },
  { key: 'draw', label: 'Draw Polygon' },
];

const POLYGON_CLICK_STYLE = {
  fill: 'rgba(33, 150, 243, 0.3)',
  stroke: '#2196f3',
  strokeWidth: 2,
};

const POLYGON_DRAG_STYLE = {
  fill: 'rgba(76, 175, 80, 0.3)',
  stroke: '#4caf50',
  strokeWidth: 2,
};

const POLYGON_DRAW_STYLE = {
  fill: 'rgba(156, 39, 176, 0.3)',
  stroke: '#9c27b0',
  strokeWidth: 2,
};

/**
 * Interactive demo for creating, editing, and deleting polygons.
 *
 * - **Select mode**: Click objects to select them, then edit.
 * - **Click-to-place mode**: Click anywhere to place a rectangular polygon.
 * - **Drag-to-draw mode**: Hold mouse and drag to draw a rectangular polygon.
 * - **Draw mode**: Click to place vertices one by one. Click near the first
 *   vertex (red dot) to close the polygon.
 * - Double-click a selected polygon to edit its vertices.
 */
export const PolygonDemo: Story = {
  render: function PolygonDemoRender() {
    const vertexEditCleanupRef = useRef<(() => void) | null>(null);
    const [isEditingVertices, setIsEditingVertices] = useState(false);

    const handleCanvasReady = useCallback((canvas: FabricCanvas) => {
      canvas.on('mouse:dblclick', (e) => {
        if (e.target && e.target instanceof FabricPolygon) {
          vertexEditCleanupRef.current?.();
          vertexEditCleanupRef.current = enableVertexEdit(
            canvas,
            e.target as Polygon,
            {
              handleRadius: 6,
              handleFill: '#ffffff',
              handleStroke: '#1976d2',
              handleStrokeWidth: 2,
            },
            () => {
              vertexEditCleanupRef.current = null;
              setIsEditingVertices(false);
            },
          );
          setIsEditingVertices(true);
        }
      });
    }, []);

    const cleanupVertexEdit = useCallback(() => {
      vertexEditCleanupRef.current?.();
      vertexEditCleanupRef.current = null;
      setIsEditingVertices(false);
    }, []);

    const modeActivators = useMemo<
      Record<PolygonMode, ModeActivator<PolygonMode>>
    >(
      () => ({
        select: () => {
          cleanupVertexEdit();
          return null;
        },
        click: ({ canvas, viewport, activateMode }) => {
          cleanupVertexEdit();
          return enableClickToCreate(
            canvas,
            (c, point) =>
              createPolygonAtPoint(c, point, {
                width: 100,
                height: 80,
                ...POLYGON_CLICK_STYLE,
              }),
            { onCreated: () => activateMode('select'), viewport },
          );
        },
        drag: ({ canvas, viewport, activateMode }) => {
          cleanupVertexEdit();
          return enableDragToCreate(
            canvas,
            (c, bounds) =>
              createPolygonFromDrag(
                c,
                { x: bounds.startX, y: bounds.startY },
                {
                  x: bounds.startX + bounds.width,
                  y: bounds.startY + bounds.height,
                },
                POLYGON_DRAG_STYLE,
              ),
            {
              onCreated: () => activateMode('select'),
              viewport,
              previewStyle: POLYGON_DRAG_STYLE,
            },
          );
        },
        draw: ({ canvas, viewport, activateMode }) => {
          cleanupVertexEdit();
          return enableDrawToCreate(canvas, {
            style: POLYGON_DRAW_STYLE,
            onCreated: () => activateMode('select'),
            viewport,
          });
        },
      }),
      [cleanupVertexEdit],
    );

    const demo = useCanvasDemo<PolygonMode>({
      defaultMode: 'select',
      editFields: ['left', 'top'],
      modeActivators,
      onReady: handleCanvasReady,
    });

    const handleEdit = useCallback(
      (field: string, value: string) => {
        const num = Number(value);
        if (isNaN(num)) return;

        demo.setEditValues((prev) => ({ ...prev, [field]: num }));

        const canvas = demo.canvasRef.current;
        if (canvas && demo.selected.length === 1) {
          editPolygon(canvas, demo.selected[0] as Polygon, { [field]: num });
        }
      },
      [demo.selected, demo.canvasRef, demo.setEditValues],
    );

    const handleAddProgrammatic = useCallback(() => {
      const canvas = demo.canvasRef.current;
      if (!canvas) return;
      const polygon = createPolygon(canvas, {
        points: [
          { x: 0, y: 0 },
          { x: 80, y: -30 },
          { x: 120, y: 20 },
          { x: 100, y: 80 },
          { x: 20, y: 80 },
        ],
        left: 50 + Math.random() * 300,
        top: 50 + Math.random() * 200,
        fill: 'rgba(255, 152, 0, 0.3)',
        stroke: '#ff9800',
        strokeWidth: 2,
      });
      canvas.setActiveObject(polygon);
      canvas.requestRenderAll();
    }, [demo.canvasRef]);

    return (
      <DemoLayout
        onReady={demo.handleReady}
        sidebar={
          <>
            <ModeButtons
              modes={POLYGON_MODES}
              activeMode={demo.mode}
              onModeChange={demo.activateMode}
            />
            <ViewportControls
              viewportMode={demo.viewportMode}
              zoom={demo.zoom}
              onModeChange={demo.handleViewportMode}
              onReset={demo.handleResetViewport}
            />
            <div>
              <Typography variant="subtitle2" gutterBottom>
                Programmatic
              </Typography>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={handleAddProgrammatic}
              >
                Add Polygon
              </Button>
            </div>
            {demo.selected.length > 0 && (
              <>
                <Typography variant="body2" color="text.secondary">
                  {demo.selected.length} object
                  {demo.selected.length > 1 ? 's' : ''} selected
                </Typography>
                {demo.selected.length === 1 && (
                  <div>
                    <Typography variant="subtitle2" gutterBottom>
                      Edit Selected
                    </Typography>
                    <Stack spacing={1.5}>
                      {['left', 'top'].map((field) => (
                        <TextField
                          key={field}
                          label={field.charAt(0).toUpperCase() + field.slice(1)}
                          type="number"
                          size="small"
                          value={demo.editValues[field]}
                          onChange={(e) => handleEdit(field, e.target.value)}
                        />
                      ))}
                    </Stack>
                  </div>
                )}
              </>
            )}
          </>
        }
      />
    );
  },
};
