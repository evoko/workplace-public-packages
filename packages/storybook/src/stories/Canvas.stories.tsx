import { useCallback, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Button,
  FormControlLabel,
  Slider,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
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
  enableScaledStrokes,
  serializeCanvas,
  loadCanvas,
  fitViewportToBackground,
  setBackgroundOpacity,
  getBackgroundOpacity,
  setBackgroundInverted,
  getBackgroundInverted,
  setBackgroundImage,
} from '@bwp-web/canvas';
import type {
  Canvas as FabricCanvas,
  FabricObject,
  Polygon,
  Rect,
} from 'fabric';
import { ModeButtons } from './canvas/ModeButtons';
import { DemoLayout } from './canvas/DemoLayout';
import { ViewportControlToolbar } from './canvas/ViewportControlToolbar';

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

// A simple SVG grid pattern used as a placeholder background image in demos.
const GRID_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
  <rect width="400" height="300" fill="#f8f8f8"/>
  <path d="M 0 0 L 400 0 M 0 50 L 400 50 M 0 100 L 400 100 M 0 150 L 400 150 M 0 200 L 400 200 M 0 250 L 400 250 M 0 300 L 400 300" stroke="#ddd" stroke-width="1"/>
  <path d="M 0 0 L 0 300 M 50 0 L 50 300 M 100 0 L 100 300 M 150 0 L 150 300 M 200 0 L 200 300 M 250 0 L 250 300 M 300 0 L 300 300 M 350 0 L 350 300 M 400 0 L 400 300" stroke="#ddd" stroke-width="1"/>
  <text x="200" y="155" text-anchor="middle" fill="#bbb" font-size="14" font-family="sans-serif">Background Image</text>
</svg>`;
const GRID_BG_URL = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(GRID_SVG)}`;

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
    const [alignmentEnabled, setAlignmentEnabled] = useState(true);
    const canvas = useEditCanvas({ enableAlignment: alignmentEnabled });
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
        canvasOverlay={
          <ViewportControlToolbar
            zoom={canvas.zoom}
            viewportMode={canvas.viewport.mode}
            onModeChange={canvas.viewport.setMode}
            onZoomIn={canvas.viewport.zoomIn}
            onZoomOut={canvas.viewport.zoomOut}
            onReset={canvas.viewport.reset}
          />
        }
        sidebar={
          <>
            <FormControlLabel
              control={
                <Switch
                  checked={alignmentEnabled}
                  onChange={(e) => setAlignmentEnabled(e.target.checked)}
                />
              }
              label="Enable Alignment"
            />
            <ModeButtons
              modes={RECT_MODES}
              activeMode={mode}
              onModeChange={activateMode}
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
 * - **Angle snapping**: While editing vertices, hold **Shift** to snap the
 *   dragged vertex to 15° angle intervals relative to the previous vertex.
 */
export const PolygonDemo: Story = {
  render: function PolygonDemoRender() {
    const [alignmentEnabled, setAlignmentEnabled] = useState(true);
    const canvas = useEditCanvas({ enableAlignment: alignmentEnabled });
    const [mode, setMode] = useState<PolygonMode>('select');
    const [editValues, setEditValues] = useState({ left: 0, top: 0 });

    const activateMode = useCallback(
      (newMode: PolygonMode) => {
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
              },
            ),
          );
        } else if (newMode === 'draw') {
          canvas.setMode((c, viewport) =>
            enableDrawToCreate(c, {
              onCreated: () => activateMode('select'),
              viewport,
            }),
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
        canvasOverlay={
          <ViewportControlToolbar
            zoom={canvas.zoom}
            viewportMode={canvas.viewport.mode}
            onModeChange={canvas.viewport.setMode}
            onZoomIn={canvas.viewport.zoomIn}
            onZoomOut={canvas.viewport.zoomOut}
            onReset={canvas.viewport.reset}
          />
        }
        sidebar={
          <>
            <FormControlLabel
              control={
                <Switch
                  checked={alignmentEnabled}
                  onChange={(e) => setAlignmentEnabled(e.target.checked)}
                />
              }
              label="Enable Alignment"
            />
            <ModeButtons
              modes={POLYGON_MODES}
              activeMode={mode}
              onModeChange={activateMode}
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
            {canvas.isEditingVertices && (
              <Typography variant="body2" color="info.main">
                Vertex edit active — hold <strong>Shift</strong> to snap to 15°
                angles.
              </Typography>
            )}
            {canvas.selected.length > 0 && !canvas.isEditingVertices && (
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
    const [alignmentEnabled, setAlignmentEnabled] = useState(true);
    const canvas = useEditCanvas({ enableAlignment: alignmentEnabled });
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
        canvasOverlay={
          <ViewportControlToolbar
            zoom={canvas.zoom}
            viewportMode={canvas.viewport.mode}
            onModeChange={canvas.viewport.setMode}
            onZoomIn={canvas.viewport.zoomIn}
            onZoomOut={canvas.viewport.zoomOut}
            onReset={canvas.viewport.reset}
          />
        }
        sidebar={
          <>
            <FormControlLabel
              control={
                <Switch
                  checked={alignmentEnabled}
                  onChange={(e) => setAlignmentEnabled(e.target.checked)}
                />
              }
              label="Enable Alignment"
            />
            <ModeButtons
              modes={CIRCLE_MODES}
              activeMode={mode}
              onModeChange={activateMode}
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
        canvasOverlay={
          <ViewportControlToolbar
            zoom={canvas.zoom}
            viewportMode="pan"
            onModeChange={() => {}}
            onZoomIn={canvas.viewport.zoomIn}
            onZoomOut={canvas.viewport.zoomOut}
            onReset={canvas.viewport.reset}
          />
        }
        sidebar={
          <>
            <Typography variant="subtitle2">View-Only Canvas</Typography>
            <Typography variant="body2" color="text.secondary">
              This canvas uses <code>useViewCanvas</code>. Objects cannot be
              selected, created, edited, or deleted. Drag to pan, scroll to
              zoom.
            </Typography>
          </>
        }
      />
    );
  },
};

// --- Background Image Demo ---

/**
 * Demonstrates background image management utilities.
 *
 * - Set/change the background image
 * - Adjust opacity with a slider
 * - Toggle invert filter
 * - Fit the viewport to the background image
 *
 * Draw shapes on top of the background to see how they interact.
 */
export const BackgroundDemo: Story = {
  render: function BackgroundDemoRender() {
    const canvas = useEditCanvas();
    const [opacity, setOpacity] = useState(1);
    const [inverted, setInverted] = useState(false);

    const handleSetBackground = useCallback(async () => {
      const c = canvas.canvasRef.current;
      if (!c) return;
      await setBackgroundImage(c, GRID_BG_URL);
      setOpacity(getBackgroundOpacity(c));
      setInverted(getBackgroundInverted(c));
    }, [canvas.canvasRef]);

    const handleOpacityChange = useCallback(
      (_: Event, value: number | number[]) => {
        const v = Array.isArray(value) ? value[0] : value;
        setOpacity(v);
        const c = canvas.canvasRef.current;
        if (c) setBackgroundOpacity(c, v);
      },
      [canvas.canvasRef],
    );

    const handleInvertChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setInverted(e.target.checked);
        const c = canvas.canvasRef.current;
        if (c) setBackgroundInverted(c, e.target.checked);
      },
      [canvas.canvasRef],
    );

    const handleFitViewport = useCallback(() => {
      const c = canvas.canvasRef.current;
      if (c) fitViewportToBackground(c);
    }, [canvas.canvasRef]);

    const handleClearBackground = useCallback(() => {
      const c = canvas.canvasRef.current;
      if (!c) return;
      c.backgroundImage = undefined;
      c.requestRenderAll();
    }, [canvas.canvasRef]);

    return (
      <DemoLayout
        onReady={canvas.onReady}
        canvasOverlay={
          <ViewportControlToolbar
            zoom={canvas.zoom}
            viewportMode={canvas.viewport.mode}
            onModeChange={canvas.viewport.setMode}
            onZoomIn={canvas.viewport.zoomIn}
            onZoomOut={canvas.viewport.zoomOut}
            onReset={canvas.viewport.reset}
          />
        }
        sidebar={
          <>
            <div>
              <Typography variant="subtitle2" gutterBottom>
                Background Image
              </Typography>
              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={handleSetBackground}
                >
                  Load Grid Background
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={handleClearBackground}
                >
                  Clear Background
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={handleFitViewport}
                >
                  Fit to Viewport
                </Button>
              </Stack>
            </div>

            <div>
              <Typography variant="subtitle2" gutterBottom>
                Opacity: {Math.round(opacity * 100)}%
              </Typography>
              <Slider
                value={opacity}
                min={0}
                max={1}
                step={0.05}
                onChange={handleOpacityChange}
                size="small"
              />
            </div>

            <FormControlLabel
              control={
                <Switch checked={inverted} onChange={handleInvertChange} />
              }
              label="Invert"
            />

            <Typography variant="body2" color="text.secondary">
              Click <em>Load Grid Background</em> first, then adjust opacity and
              invert. Use <em>Fit to Viewport</em> to center and scale the image
              in the canvas.
            </Typography>
          </>
        }
      />
    );
  },
};

// --- Serialization Demo ---

/**
 * Demonstrates canvas serialization and loading.
 *
 * - Zoom-independent stroke widths via `enableScaledStrokes` — strokes
 *   maintain their visual weight at any zoom level.
 * - **Save**: serializes the canvas to JSON (stroke widths are restored to
 *   their base values in the saved data).
 * - **Clear**: removes all objects.
 * - **Load**: restores the canvas from the last saved JSON.
 *
 * Zoom in/out with the toolbar after placing shapes to confirm stroke widths
 * remain visually consistent.
 */
export const SerializationDemo: Story = {
  render: function SerializationDemoRender() {
    const [savedJson, setSavedJson] = useState<object | null>(null);
    const [charCount, setCharCount] = useState(0);

    const canvas = useEditCanvas({
      onReady: (fabricCanvas) => {
        // Enable zoom-independent stroke widths
        enableScaledStrokes(fabricCanvas);

        // Pre-populate with a few shapes
        createRectangle(fabricCanvas, {
          left: 80,
          top: 80,
          width: 160,
          height: 100,
        });
        createPolygon(fabricCanvas, {
          points: [
            { x: 0, y: 60 },
            { x: 60, y: 0 },
            { x: 120, y: 60 },
            { x: 100, y: 120 },
            { x: 20, y: 120 },
          ],
          left: 320,
          top: 120,
        });
        createCircle(fabricCanvas, {
          left: 560,
          top: 100,
          size: 90,
        });
      },
    });

    const handleSave = useCallback(() => {
      const c = canvas.canvasRef.current;
      if (!c) return;
      const json = serializeCanvas(c);
      setSavedJson(json);
      setCharCount(JSON.stringify(json).length);
    }, [canvas.canvasRef]);

    const handleClear = useCallback(() => {
      const c = canvas.canvasRef.current;
      if (!c) return;
      c.clear();
      c.requestRenderAll();
    }, [canvas.canvasRef]);

    const handleLoad = useCallback(async () => {
      const c = canvas.canvasRef.current;
      if (!c || !savedJson) return;
      await loadCanvas(c, savedJson);
      // Re-enable scaled strokes for restored objects
      enableScaledStrokes(c);
    }, [canvas.canvasRef, savedJson]);

    return (
      <DemoLayout
        onReady={canvas.onReady}
        canvasOverlay={
          <ViewportControlToolbar
            zoom={canvas.zoom}
            viewportMode={canvas.viewport.mode}
            onModeChange={canvas.viewport.setMode}
            onZoomIn={canvas.viewport.zoomIn}
            onZoomOut={canvas.viewport.zoomOut}
            onReset={canvas.viewport.reset}
          />
        }
        sidebar={
          <>
            <div>
              <Typography variant="subtitle2" gutterBottom>
                Serialization
              </Typography>
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  onClick={handleSave}
                >
                  Save Canvas
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={handleClear}
                >
                  Clear Canvas
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={handleLoad}
                  disabled={!savedJson}
                >
                  Load Canvas
                </Button>
              </Stack>
            </div>

            {savedJson && (
              <Box
                sx={{
                  p: 1.5,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  fontSize: 12,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Saved snapshot: {charCount} chars
                </Typography>
              </Box>
            )}

            <Typography variant="body2" color="text.secondary">
              Zoom in/out to confirm strokes remain visually consistent
              (zoom-independent stroke widths are active). Save captures the
              base stroke width — not the scaled one.
            </Typography>
          </>
        }
      />
    );
  },
};
