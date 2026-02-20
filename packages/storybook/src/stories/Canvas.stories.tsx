import React, { useCallback, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import {
  Canvas,
  useEditCanvas,
  useViewCanvas,
  createRectangle,
  createRectangleAtPoint,
  editRectangle,
  createPolygon,
  createPolygonAtPoint,
  createPolygonFromDrag,
  editPolygon,
  createCircle,
  createCircleAtPoint,
  editCircle,
  enableClickToCreate,
  enableDragToCreate,
  enableDrawToCreate,
  enableVertexEdit,
} from '@bwp-web/canvas';
import { Polygon as FabricPolygon } from 'fabric';
import type {
  Canvas as FabricCanvas,
  FabricObject,
  Polygon,
  Rect,
} from 'fabric';
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

// --- Helpers ---

function syncFields(
  obj: FabricObject,
  fields: string[],
): Record<string, number> {
  return Object.fromEntries(
    fields.map((f) => [
      f,
      Math.round((obj as unknown as Record<string, number>)[f] ?? 0),
    ]),
  );
}

// --- Rectangle Demo ---

type RectMode = 'select' | 'click' | 'drag';

const RECT_MODES: Array<{ key: RectMode; label: string }> = [
  { key: 'select', label: 'Select' },
  { key: 'click', label: 'Click to Place' },
  { key: 'drag', label: 'Drag to Draw' },
];

/**
 * Interactive demo for creating, editing, and deleting rectangles.
 *
 * - **Select mode**: Click objects to select them, then edit.
 * - **Click-to-place mode**: Click anywhere on the canvas to place a 100x80 rectangle.
 * - **Drag-to-draw mode**: Hold mouse and drag to draw a rectangle.
 */
export const RectangleDemo: Story = {
  render: function RectangleDemo() {
    const canvas = useEditCanvas();
    const [mode, setMode] = useState<RectMode>('select');
    const [editValues, setEditValues] = useState({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });

    const activateMode = useCallback(
      (newMode: RectMode) => {
        setMode(newMode);
        if (newMode === 'select') {
          canvas.setMode(null);
        } else if (newMode === 'click') {
          canvas.setMode((c, viewport) =>
            enableClickToCreate(
              c,
              (c, point) =>
                createRectangleAtPoint(c, point, {
                  width: 100,
                  height: 80,
                }),
              { onCreated: () => activateMode('select'), viewport },
            ),
          );
        } else if (newMode === 'drag') {
          canvas.setMode((c, viewport) =>
            enableDragToCreate(
              c,
              (c, bounds) =>
                createRectangle(c, {
                  left: bounds.startX + bounds.width / 2,
                  top: bounds.startY + bounds.height / 2,
                  width: bounds.width,
                  height: bounds.height,
                }),
              {
                onCreated: () => activateMode('select'),
                viewport,
                snapping: true,
              },
            ),
          );
        }
      },
      [canvas.setMode],
    );

    // Sync edit values when selection changes
    const prevSelectedRef = useRef(canvas.selected);
    if (canvas.selected !== prevSelectedRef.current) {
      prevSelectedRef.current = canvas.selected;
      if (canvas.selected.length === 1) {
        const vals = syncFields(canvas.selected[0], [
          'left',
          'top',
          'width',
          'height',
        ]);
        if (
          vals.left !== editValues.left ||
          vals.top !== editValues.top ||
          vals.width !== editValues.width ||
          vals.height !== editValues.height
        ) {
          setEditValues(vals as typeof editValues);
        }
      }
    }

    const handleEdit = useCallback(
      (field: string, value: string) => {
        const num = Number(value);
        if (isNaN(num)) return;
        setEditValues((prev) => ({ ...prev, [field]: num }));
        const c = canvas.canvasRef.current;
        if (c && canvas.selected.length === 1) {
          editRectangle(c, canvas.selected[0] as Rect, { [field]: num });
        }
      },
      [canvas.selected, canvas.canvasRef],
    );

    const handleAddProgrammatic = useCallback(() => {
      const c = canvas.canvasRef.current;
      if (!c) return;
      const rect = createRectangle(c, {
        left: 50 + Math.random() * 300,
        top: 50 + Math.random() * 200,
        width: 120,
        height: 80,
      });
      c.setActiveObject(rect);
      c.requestRenderAll();
    }, [canvas.canvasRef]);

    return (
      <DemoLayout
        onReady={canvas.onReady}
        sidebar={
          <>
            <ModeButtons
              modes={RECT_MODES}
              activeMode={mode}
              onModeChange={activateMode}
            />
            <ViewportControls
              viewportMode={canvas.viewport.mode}
              zoom={canvas.zoom}
              onModeChange={canvas.viewport.setMode}
              onReset={canvas.viewport.reset}
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
            {canvas.selected.length > 0 && (
              <>
                <Typography variant="body2" color="text.secondary">
                  {canvas.selected.length} object
                  {canvas.selected.length > 1 ? 's' : ''} selected
                </Typography>
                {canvas.selected.length === 1 && (
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
                          value={editValues[field as keyof typeof editValues]}
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

    const cleanupVertexEdit = useCallback(() => {
      vertexEditCleanupRef.current?.();
      vertexEditCleanupRef.current = null;
      setIsEditingVertices(false);
    }, []);

    const handleCanvasReady = useCallback((fabricCanvas: FabricCanvas) => {
      fabricCanvas.on('mouse:dblclick', (e) => {
        if (e.target && e.target instanceof FabricPolygon) {
          vertexEditCleanupRef.current?.();
          vertexEditCleanupRef.current = enableVertexEdit(
            fabricCanvas,
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

    const canvas = useEditCanvas({ onReady: handleCanvasReady });
    const [mode, setMode] = useState<PolygonMode>('select');
    const [editValues, setEditValues] = useState({ left: 0, top: 0 });

    const activateMode = useCallback(
      (newMode: PolygonMode) => {
        cleanupVertexEdit();
        setMode(newMode);
        if (newMode === 'select') {
          canvas.setMode(null);
        } else if (newMode === 'click') {
          canvas.setMode((c, viewport) =>
            enableClickToCreate(
              c,
              (c, point) =>
                createPolygonAtPoint(c, point, {
                  width: 100,
                  height: 80,
                }),
              { onCreated: () => activateMode('select'), viewport },
            ),
          );
        } else if (newMode === 'drag') {
          canvas.setMode((c, viewport) =>
            enableDragToCreate(
              c,
              (c, bounds) =>
                createPolygonFromDrag(
                  c,
                  { x: bounds.startX, y: bounds.startY },
                  {
                    x: bounds.startX + bounds.width,
                    y: bounds.startY + bounds.height,
                  },
                ),
              {
                onCreated: () => activateMode('select'),
                viewport,
                snapping: true,
              },
            ),
          );
        } else if (newMode === 'draw') {
          canvas.setMode((c, viewport) =>
            enableDrawToCreate(c, {
              onCreated: () => activateMode('select'),
              viewport,
              snapping: true,
            }),
          );
        }
      },
      [canvas.setMode, cleanupVertexEdit],
    );

    // Sync edit values when selection changes
    const prevSelectedRef = useRef(canvas.selected);
    if (canvas.selected !== prevSelectedRef.current) {
      prevSelectedRef.current = canvas.selected;
      if (canvas.selected.length === 1) {
        const vals = syncFields(canvas.selected[0], ['left', 'top']);
        if (vals.left !== editValues.left || vals.top !== editValues.top) {
          setEditValues(vals as typeof editValues);
        }
      }
    }

    const handleEdit = useCallback(
      (field: string, value: string) => {
        const num = Number(value);
        if (isNaN(num)) return;
        setEditValues((prev) => ({ ...prev, [field]: num }));
        const c = canvas.canvasRef.current;
        if (c && canvas.selected.length === 1) {
          editPolygon(c, canvas.selected[0] as Polygon, { [field]: num });
        }
      },
      [canvas.selected, canvas.canvasRef],
    );

    const handleAddProgrammatic = useCallback(() => {
      const c = canvas.canvasRef.current;
      if (!c) return;
      const polygon = createPolygon(c, {
        points: [
          { x: 0, y: 0 },
          { x: 80, y: -30 },
          { x: 120, y: 20 },
          { x: 100, y: 80 },
          { x: 20, y: 80 },
        ],
        left: 50 + Math.random() * 300,
        top: 50 + Math.random() * 200,
      });
      c.setActiveObject(polygon);
      c.requestRenderAll();
    }, [canvas.canvasRef]);

    return (
      <DemoLayout
        onReady={canvas.onReady}
        sidebar={
          <>
            <ModeButtons
              modes={POLYGON_MODES}
              activeMode={mode}
              onModeChange={activateMode}
            />
            <ViewportControls
              viewportMode={canvas.viewport.mode}
              zoom={canvas.zoom}
              onModeChange={canvas.viewport.setMode}
              onReset={canvas.viewport.reset}
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
            {canvas.selected.length > 0 && (
              <>
                <Typography variant="body2" color="text.secondary">
                  {canvas.selected.length} object
                  {canvas.selected.length > 1 ? 's' : ''} selected
                </Typography>
                {canvas.selected.length === 1 && (
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
                          value={editValues[field as keyof typeof editValues]}
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

// --- Circle Demo ---

type CircleMode = 'select' | 'click' | 'drag';

const CIRCLE_MODES: Array<{ key: CircleMode; label: string }> = [
  { key: 'select', label: 'Select' },
  { key: 'click', label: 'Click to Place' },
  { key: 'drag', label: 'Drag to Draw' },
];

const DEFAULT_CIRCLE_SIZE = 80;

/**
 * Interactive demo for creating, editing, and deleting circles.
 *
 * Circles are square Rects with full border-radius (`rx`/`ry` = size/2).
 *
 * - **Select mode**: Click objects to select them, then edit.
 * - **Click-to-place mode**: Click anywhere on the canvas to place an 80px circle.
 * - **Drag-to-draw mode**: Hold mouse and drag to draw a circle (constrained to 1:1).
 */
export const CircleDemo: Story = {
  render: function CircleDemoRender() {
    const canvas = useEditCanvas();
    const [mode, setMode] = useState<CircleMode>('select');
    const [editValues, setEditValues] = useState({
      left: 0,
      top: 0,
      size: 0,
    });

    const activateMode = useCallback(
      (newMode: CircleMode) => {
        setMode(newMode);
        if (newMode === 'select') {
          canvas.setMode(null);
        } else if (newMode === 'click') {
          canvas.setMode((c, viewport) =>
            enableClickToCreate(
              c,
              (c, point) =>
                createCircleAtPoint(c, point, {
                  size: DEFAULT_CIRCLE_SIZE,
                }),
              { onCreated: () => activateMode('select'), viewport },
            ),
          );
        } else if (newMode === 'drag') {
          canvas.setMode((c, viewport) =>
            enableDragToCreate(
              c,
              (c, bounds) =>
                createCircle(c, {
                  left: bounds.startX + bounds.width / 2,
                  top: bounds.startY + bounds.height / 2,
                  size: bounds.width,
                }),
              {
                onCreated: () => activateMode('select'),
                viewport,
                constrainToSquare: true,
                snapping: true,
              },
            ),
          );
        }
      },
      [canvas.setMode],
    );

    // Sync edit values when selection changes
    const prevSelectedRef = useRef(canvas.selected);
    if (canvas.selected !== prevSelectedRef.current) {
      prevSelectedRef.current = canvas.selected;
      if (canvas.selected.length === 1) {
        const vals = syncFields(canvas.selected[0], ['left', 'top', 'width']);
        if (
          vals.left !== editValues.left ||
          vals.top !== editValues.top ||
          vals.width !== editValues.size
        ) {
          setEditValues({ left: vals.left, top: vals.top, size: vals.width });
        }
      }
    }

    const handleEdit = useCallback(
      (field: string, value: string) => {
        const num = Number(value);
        if (isNaN(num)) return;
        setEditValues((prev) => ({ ...prev, [field]: num }));
        const c = canvas.canvasRef.current;
        if (c && canvas.selected.length === 1) {
          editCircle(c, canvas.selected[0] as Rect, { [field]: num });
        }
      },
      [canvas.selected, canvas.canvasRef],
    );

    const handleAddProgrammatic = useCallback(() => {
      const c = canvas.canvasRef.current;
      if (!c) return;
      const circle = createCircle(c, {
        left: 50 + Math.random() * 300,
        top: 50 + Math.random() * 200,
        size: 100,
      });
      c.setActiveObject(circle);
      c.requestRenderAll();
    }, [canvas.canvasRef]);

    return (
      <DemoLayout
        onReady={canvas.onReady}
        sidebar={
          <>
            <ModeButtons
              modes={CIRCLE_MODES}
              activeMode={mode}
              onModeChange={activateMode}
            />
            <ViewportControls
              viewportMode={canvas.viewport.mode}
              zoom={canvas.zoom}
              onModeChange={canvas.viewport.setMode}
              onReset={canvas.viewport.reset}
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
                Add Circle
              </Button>
            </div>
            {canvas.selected.length > 0 && (
              <>
                <Typography variant="body2" color="text.secondary">
                  {canvas.selected.length} object
                  {canvas.selected.length > 1 ? 's' : ''} selected
                </Typography>
                {canvas.selected.length === 1 && (
                  <div>
                    <Typography variant="subtitle2" gutterBottom>
                      Edit Selected
                    </Typography>
                    <Stack spacing={1.5}>
                      {['left', 'top', 'size'].map((field) => (
                        <TextField
                          key={field}
                          label={field.charAt(0).toUpperCase() + field.slice(1)}
                          type="number"
                          size="small"
                          value={editValues[field as keyof typeof editValues]}
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

// --- View Canvas Demo ---

/**
 * View-only demo using `useViewCanvas`.
 *
 * The canvas is pre-populated with rectangles, polygons, and circles. Objects cannot be
 * selected, created, edited, or deleted. Only panning and zooming are available.
 */
export const ViewCanvasDemo: Story = {
  render: function ViewCanvasDemoRender() {
    const canvas = useViewCanvas({
      onReady: (fabricCanvas: FabricCanvas) => {
        createRectangle(fabricCanvas, {
          left: 120,
          top: 100,
          width: 140,
          height: 90,
        });
        createRectangle(fabricCanvas, {
          left: 500,
          top: 80,
          width: 100,
          height: 160,
        });
        createRectangle(fabricCanvas, {
          left: 350,
          top: 400,
          width: 180,
          height: 70,
        });
        createPolygon(fabricCanvas, {
          points: [
            { x: 0, y: 0 },
            { x: 80, y: -30 },
            { x: 120, y: 20 },
            { x: 100, y: 80 },
            { x: 20, y: 80 },
          ],
          left: 300,
          top: 180,
        });
        createPolygon(fabricCanvas, {
          points: [
            { x: 0, y: 40 },
            { x: 40, y: 0 },
            { x: 80, y: 0 },
            { x: 120, y: 40 },
            { x: 100, y: 90 },
            { x: 20, y: 90 },
          ],
          left: 600,
          top: 320,
        });
        createPolygon(fabricCanvas, {
          points: [
            { x: 50, y: 0 },
            { x: 100, y: 35 },
            { x: 80, y: 90 },
            { x: 20, y: 90 },
            { x: 0, y: 35 },
          ],
          left: 80,
          top: 350,
        });
        createCircle(fabricCanvas, {
          left: 200,
          top: 250,
          size: 100,
        });
        createCircle(fabricCanvas, {
          left: 500,
          top: 400,
          size: 60,
        });
      },
    });

    return (
      <DemoLayout
        onReady={canvas.onReady}
        sidebar={
          <>
            <Typography variant="subtitle2">View-Only Canvas</Typography>
            <Typography variant="body2" color="text.secondary">
              This canvas uses <code>useViewCanvas</code>. Objects cannot be
              selected, created, edited, or deleted. Drag to pan, scroll to
              zoom.
            </Typography>
            <div>
              <Typography variant="subtitle2" gutterBottom>
                Viewport
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Zoom: {Math.round(canvas.zoom * 100)}%
              </Typography>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={canvas.viewport.reset}
              >
                Reset View
              </Button>
            </div>
          </>
        }
      />
    );
  },
};
