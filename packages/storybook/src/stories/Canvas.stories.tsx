import { useCallback, useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Button,
  ButtonGroup,
  Divider,
  FormControlLabel,
  Slider,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { Polygon, Rect } from 'fabric';
import type { Canvas as FabricCanvas, FabricObject } from 'fabric';
import {
  Canvas,
  useEditCanvas,
  useViewCanvas,
  createRectangle,
  createRectangleAtPoint,
  editRectangle,
  createCircle,
  createCircleAtPoint,
  editCircle,
  createPolygon,
  createPolygonAtPoint,
  createPolygonFromDrag,
  editPolygon,
  enableClickToCreate,
  enableDragToCreate,
  enableDrawToCreate,
  serializeCanvas,
  loadCanvas,
  setBackgroundOpacity,
  getBackgroundOpacity,
  setBackgroundInverted,
  getBackgroundInverted,
  setBackgroundImage,
} from '@bwp-web/canvas';
import { DemoLayout } from './canvas/DemoLayout';
import { ViewportControlToolbar } from './canvas/ViewportControlToolbar';

// The canvas package augments fabric's FabricObject with `shapeType` in its source.
// Re-declare it here since the dist doesn't re-export that ambient augmentation.
declare module 'fabric' {
  interface FabricObject {
    shapeType?: 'circle';
  }
}

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

// localStorage key for cross-story canvas sharing
const STORAGE_KEY = 'canvas-stories-saved';

// --- Types ---

type ShapeType = 'rectangle' | 'circle' | 'polygon';
type CreationMode = 'select' | 'click' | 'drag' | 'draw';

interface EditCanvasOptions {
  alignmentEnabled: boolean;
  scaledStrokes: boolean;
  keyboardShortcuts: boolean;
  vertexEdit: boolean;
  panZoom: boolean;
}

interface ViewCanvasOptions {
  scaledStrokes: boolean;
  panZoom: boolean;
}

// --- Shape helpers ---

function isCircle(obj: FabricObject): obj is Rect {
  return obj.shapeType === 'circle';
}

function getEditFields(obj: FabricObject): string[] {
  if (obj instanceof Polygon) return ['left', 'top'];
  if (isCircle(obj)) return ['left', 'top', 'size'];
  if (obj instanceof Rect) return ['left', 'top', 'width', 'height'];
  return ['left', 'top'];
}

function getFieldValue(obj: FabricObject, field: string): number {
  if (field === 'size') return Math.round((obj as Rect).width ?? 0);
  return Math.round((obj as unknown as Record<string, number>)[field] ?? 0);
}

function applyEdit(
  c: FabricCanvas,
  obj: FabricObject,
  field: string,
  value: number,
): void {
  if (obj instanceof Polygon) {
    editPolygon(c, obj, { [field]: value });
  } else if (isCircle(obj)) {
    editCircle(c, obj as Rect, { [field]: value });
  } else if (obj instanceof Rect) {
    editRectangle(c, obj, { [field]: value });
  }
}

// ============================================================
// EditCanvasContent — all editing features in one component
// ============================================================

interface EditCanvasContentProps {
  options: EditCanvasOptions;
  onOptionToggle: (key: keyof EditCanvasOptions, value: boolean) => void;
}

function EditCanvasContent({
  options,
  onOptionToggle,
}: EditCanvasContentProps) {
  const [creationMode, setCreationMode] = useState<CreationMode>('select');
  const [activeShape, setActiveShape] = useState<ShapeType>('rectangle');
  const [bgOpacity, setBgOpacity] = useState(1);
  const [bgInverted, setBgInverted] = useState(false);
  const [hasBackground, setHasBackground] = useState(false);
  const [hasSaved, setHasSaved] = useState(
    () => !!localStorage.getItem(STORAGE_KEY),
  );
  const [savedCharCount, setSavedCharCount] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Record<string, number>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canvas = useEditCanvas({
    enableAlignment: options.alignmentEnabled,
    scaledStrokes: options.scaledStrokes,
    keyboardShortcuts: options.keyboardShortcuts,
    vertexEdit: options.vertexEdit,
    panAndZoom: options.panZoom,
    onReady: async (c) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          await loadCanvas(c, JSON.parse(stored));
          if (c.backgroundImage) {
            setHasBackground(true);
            setBgOpacity(getBackgroundOpacity(c));
            setBgInverted(getBackgroundInverted(c));
          }
          setHasSaved(true);
        } catch {
          // ignore corrupted saved data
        }
      }
    },
  });

  // Auto-save canvas to localStorage when unmounting (happens when non-reactive
  // options change and the key forces a remount). This preserves canvas state
  // across option toggles.
  useEffect(() => {
    return () => {
      const c = canvas.canvasRef.current;
      if (c) {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serializeCanvas(c)));
        } catch {
          // ignore serialization errors during teardown
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync edit fields when selection changes
  const prevSelectedRef = useRef(canvas.selected);
  if (canvas.selected !== prevSelectedRef.current) {
    prevSelectedRef.current = canvas.selected;
    if (canvas.selected.length === 1) {
      const obj = canvas.selected[0];
      const fields = getEditFields(obj);
      setEditValues(
        Object.fromEntries(fields.map((f) => [f, getFieldValue(obj, f)])),
      );
    }
  }

  // --- Creation modes ---

  const activateMode = useCallback(
    (mode: CreationMode, shape: ShapeType = activeShape) => {
      setCreationMode(mode);
      if (mode === 'select') {
        canvas.setMode(null);
      } else if (mode === 'click') {
        canvas.setMode((c, viewport) => {
          if (shape === 'rectangle') {
            return enableClickToCreate(
              c,
              (c, point) =>
                createRectangleAtPoint(c, point, { width: 100, height: 80 }),
              { onCreated: () => activateMode('select', shape), viewport },
            );
          } else if (shape === 'circle') {
            return enableClickToCreate(
              c,
              (c, point) => createCircleAtPoint(c, point, { size: 80 }),
              { onCreated: () => activateMode('select', shape), viewport },
            );
          } else {
            return enableClickToCreate(
              c,
              (c, point) =>
                createPolygonAtPoint(c, point, { width: 100, height: 80 }),
              { onCreated: () => activateMode('select', shape), viewport },
            );
          }
        });
      } else if (mode === 'drag') {
        canvas.setMode((c, viewport) => {
          if (shape === 'rectangle') {
            return enableDragToCreate(
              c,
              (c, bounds) =>
                createRectangle(c, {
                  left: bounds.startX + bounds.width / 2,
                  top: bounds.startY + bounds.height / 2,
                  width: bounds.width,
                  height: bounds.height,
                }),
              { onCreated: () => activateMode('select', shape), viewport },
            );
          } else if (shape === 'circle') {
            return enableDragToCreate(
              c,
              (c, bounds) =>
                createCircle(c, {
                  left: bounds.startX + bounds.width / 2,
                  top: bounds.startY + bounds.height / 2,
                  size: bounds.width,
                }),
              {
                onCreated: () => activateMode('select', shape),
                viewport,
                constrainToSquare: true,
              },
            );
          } else {
            return enableDragToCreate(
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
              { onCreated: () => activateMode('select', shape), viewport },
            );
          }
        });
      } else if (mode === 'draw' && shape === 'polygon') {
        canvas.setMode((c, viewport) =>
          enableDrawToCreate(c, {
            onCreated: () => activateMode('select', shape),
            viewport,
          }),
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canvas.setMode, activeShape],
  );

  const handleShapeChange = useCallback(
    (shape: ShapeType) => {
      setActiveShape(shape);
      // 'draw' mode is polygon-only; fall back to select for other shapes
      if (creationMode === 'draw' && shape !== 'polygon') {
        activateMode('select', shape);
      } else if (creationMode !== 'select') {
        activateMode(creationMode, shape);
      }
    },
    [creationMode, activateMode],
  );

  const handleModeChange = useCallback(
    (mode: CreationMode) => activateMode(mode, activeShape),
    [activateMode, activeShape],
  );

  // --- Edit fields ---

  const handleEditField = useCallback(
    (field: string, raw: string) => {
      const num = Number(raw);
      if (isNaN(num)) return;
      setEditValues((prev) => ({ ...prev, [field]: num }));
      const c = canvas.canvasRef.current;
      if (c && canvas.selected.length === 1) {
        applyEdit(c, canvas.selected[0], field, num);
      }
    },
    [canvas.selected, canvas.canvasRef],
  );

  // --- Background ---

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const c = canvas.canvasRef.current;
        if (!c || typeof ev.target?.result !== 'string') return;
        await setBackgroundImage(c, ev.target.result);
        canvas.viewport.reset();
        setBgOpacity(getBackgroundOpacity(c));
        setBgInverted(getBackgroundInverted(c));
        setHasBackground(true);
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    },
    [canvas.canvasRef],
  );

  const handleOpacityChange = useCallback(
    (_: Event, value: number | number[]) => {
      const v = Array.isArray(value) ? value[0] : value;
      setBgOpacity(v);
      const c = canvas.canvasRef.current;
      if (c) setBackgroundOpacity(c, v);
    },
    [canvas.canvasRef],
  );

  const handleInvertChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setBgInverted(e.target.checked);
      const c = canvas.canvasRef.current;
      if (c) setBackgroundInverted(c, e.target.checked);
    },
    [canvas.canvasRef],
  );

  const handleClearBackground = useCallback(() => {
    const c = canvas.canvasRef.current;
    if (!c) return;
    c.backgroundImage = undefined;
    c.requestRenderAll();
    setHasBackground(false);
  }, [canvas.canvasRef]);

  // --- Serialization ---

  const handleSave = useCallback(() => {
    const c = canvas.canvasRef.current;
    if (!c) return;
    const json = serializeCanvas(c);
    const jsonStr = JSON.stringify(json);
    localStorage.setItem(STORAGE_KEY, jsonStr);
    setHasSaved(true);
    setSavedCharCount(jsonStr.length);
  }, [canvas.canvasRef]);

  const handleLoad = useCallback(async () => {
    const c = canvas.canvasRef.current;
    if (!c) return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    await loadCanvas(c, JSON.parse(stored));
    if (c.backgroundImage) {
      setHasBackground(true);
      setBgOpacity(getBackgroundOpacity(c));
      setBgInverted(getBackgroundInverted(c));
    }
    canvas.viewport.reset();
  }, [canvas.canvasRef, canvas.viewport]);

  const handleClear = useCallback(() => {
    const c = canvas.canvasRef.current;
    if (!c) return;
    c.clear();
    c.requestRenderAll();
    setHasBackground(false);
  }, [canvas.canvasRef]);

  // --- Derived ---

  const availableModes: Array<{ key: CreationMode; label: string }> = [
    { key: 'select', label: 'Select' },
    { key: 'click', label: 'Click to Create' },
    { key: 'drag', label: 'Drag to Draw' },
    ...(activeShape === 'polygon'
      ? [{ key: 'draw' as const, label: 'Draw Polygon' }]
      : []),
  ];

  const selectedObj = canvas.selected.length === 1 ? canvas.selected[0] : null;
  const editFields = selectedObj ? getEditFields(selectedObj) : [];

  const FEATURE_TOGGLES: Array<{
    key: keyof EditCanvasOptions;
    label: string;
    hint: string;
  }> = [
    { key: 'alignmentEnabled', label: 'Alignment Guidelines', hint: 'live' },
    {
      key: 'vertexEdit',
      label: 'Vertex Edit (dbl-click polygon)',
      hint: 'remounts',
    },
    { key: 'scaledStrokes', label: 'Scaled Strokes', hint: 'remounts' },
    { key: 'keyboardShortcuts', label: 'Keyboard Shortcuts', hint: 'remounts' },
    { key: 'panZoom', label: 'Pan & Zoom', hint: 'remounts' },
  ];

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
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
            {/* Features */}
            <div>
              <Typography variant="subtitle2" gutterBottom>
                Features
              </Typography>
              <Stack>
                {FEATURE_TOGGLES.map(({ key, label, hint }) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Switch
                        checked={options[key]}
                        onChange={(e) => onOptionToggle(key, e.target.checked)}
                      />
                    }
                    label={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 0.5,
                        }}
                      >
                        <Typography variant="body2">{label}</Typography>
                        <Typography
                          variant="caption"
                          color={
                            hint === 'live' ? 'success.main' : 'text.disabled'
                          }
                        >
                          ({hint})
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Stack>
            </div>

            <Divider />

            {/* Draw Tools */}
            <div>
              <Typography variant="subtitle2" gutterBottom>
                Shape
              </Typography>
              <ButtonGroup fullWidth size="small" sx={{ mb: 2 }}>
                {(['rectangle', 'circle', 'polygon'] as ShapeType[]).map(
                  (s) => (
                    <Button
                      key={s}
                      variant={activeShape === s ? 'contained' : 'outlined'}
                      onClick={() => handleShapeChange(s)}
                    >
                      {s[0].toUpperCase() + s.slice(1)}
                    </Button>
                  ),
                )}
              </ButtonGroup>
              <Typography variant="subtitle2" gutterBottom>
                Mode
              </Typography>
              <ButtonGroup orientation="vertical" fullWidth size="small">
                {availableModes.map((m) => (
                  <Button
                    key={m.key}
                    variant={creationMode === m.key ? 'contained' : 'outlined'}
                    onClick={() => handleModeChange(m.key)}
                  >
                    {m.label}
                  </Button>
                ))}
              </ButtonGroup>
            </div>

            {/* Status: vertex editing */}
            {canvas.isEditingVertices && (
              <Box sx={{ p: 1.5, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ color: 'info.contrastText' }}>
                  Editing vertices — drag handles to reshape.
                  <br />
                  Press <strong>Esc</strong> or click canvas to exit.
                </Typography>
              </Box>
            )}

            {/* Status: selection & edit */}
            {canvas.selected.length > 0 && !canvas.isEditingVertices && (
              <div>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {canvas.selected.length} object
                  {canvas.selected.length > 1 ? 's' : ''} selected
                  {options.keyboardShortcuts ? ' · Del to remove' : ''}
                </Typography>
                {selectedObj && editFields.length > 0 && (
                  <Stack spacing={0.75}>
                    {editFields.map((field) => (
                      <Box
                        key={field}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            minWidth: 44,
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                            flexShrink: 0,
                          }}
                        >
                          {field}
                        </Typography>
                        <input
                          type="number"
                          value={editValues[field] ?? 0}
                          onChange={(e) =>
                            handleEditField(field, e.target.value)
                          }
                          style={{
                            width: '100%',
                            padding: '3px 6px',
                            border: '1px solid #ccc',
                            borderRadius: 4,
                            fontSize: 13,
                          }}
                        />
                      </Box>
                    ))}
                    {selectedObj instanceof Polygon && options.vertexEdit && (
                      <Typography variant="caption" color="text.secondary">
                        Double-click to edit vertices.
                      </Typography>
                    )}
                  </Stack>
                )}
              </div>
            )}

            <Divider />

            {/* Background Image */}
            <div>
              <Typography variant="subtitle2" gutterBottom>
                Background Image
              </Typography>
              <Stack spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Image
                </Button>
                {hasBackground && (
                  <>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Opacity: {Math.round(bgOpacity * 100)}%
                      </Typography>
                      <Slider
                        value={bgOpacity}
                        min={0}
                        max={1}
                        step={0.05}
                        onChange={handleOpacityChange}
                        size="small"
                      />
                    </Box>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={bgInverted}
                          onChange={handleInvertChange}
                        />
                      }
                      label={<Typography variant="body2">Invert</Typography>}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      fullWidth
                      color="error"
                      onClick={handleClearBackground}
                    >
                      Clear Background
                    </Button>
                  </>
                )}
              </Stack>
            </div>

            <Divider />

            {/* Canvas Actions */}
            <div>
              <Typography variant="subtitle2" gutterBottom>
                Canvas
              </Typography>
              <Stack spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  onClick={handleSave}
                >
                  Save
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  onClick={handleLoad}
                  disabled={!hasSaved}
                >
                  Load
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth
                  color="error"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </Stack>
              {savedCharCount !== null && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.5, display: 'block' }}
                >
                  Saved: {savedCharCount} chars · ViewCanvas will use this
                </Typography>
              )}
            </div>
          </>
        }
      />
    </>
  );
}

// ============================================================
// EditCanvasDemo story
// ============================================================

/**
 * Comprehensive `useEditCanvas` demo — all features available out of the box.
 *
 * - **Shape + Mode**: choose a shape (rectangle, circle, polygon) and a
 *   creation mode (select, click-to-create, drag-to-draw, draw-polygon).
 * - **Vertex editing**: double-click any polygon to enter vertex edit mode.
 *   Hold **Shift** while dragging a handle to snap to 15° angles.
 * - **Background image**: upload any image, adjust opacity, toggle invert,
 *   fit the viewport to it, or clear it.
 * - **Save / Load / Clear**: serializes canvas to `localStorage`; the
 *   ViewCanvas story will load this data automatically.
 * - **Feature toggles**: all `useEditCanvas` options are exposed. Options
 *   marked **(live)** take effect immediately; options marked **(remounts)**
 *   auto-save and reload the canvas with the new setting.
 */
export const EditCanvasDemo: Story = {
  name: 'Edit Canvas',
  render: function EditCanvasDemoRender() {
    const [options, setOptions] = useState<EditCanvasOptions>({
      alignmentEnabled: true,
      scaledStrokes: true,
      keyboardShortcuts: true,
      vertexEdit: true,
      panZoom: true,
    });

    // Key from non-reactive options — changes force EditCanvasContent to remount.
    // The component auto-saves to localStorage on unmount and auto-loads on mount,
    // so canvas state is preserved across option changes.
    const nonReactiveKey = `${options.scaledStrokes}-${options.keyboardShortcuts}-${options.vertexEdit}-${options.panZoom}`;

    const handleOptionToggle = useCallback(
      (key: keyof EditCanvasOptions, value: boolean) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
      },
      [],
    );

    return (
      <EditCanvasContent
        key={nonReactiveKey}
        options={options}
        onOptionToggle={handleOptionToggle}
      />
    );
  },
};

// ============================================================
// ViewCanvasContent — view-only canvas
// ============================================================

interface ViewCanvasContentProps {
  options: ViewCanvasOptions;
  onOptionToggle: (key: keyof ViewCanvasOptions, value: boolean) => void;
}

function ViewCanvasContent({
  options,
  onOptionToggle,
}: ViewCanvasContentProps) {
  const canvas = useViewCanvas({
    scaledStrokes: options.scaledStrokes,
    panAndZoom: options.panZoom,
    onReady: async (c) => {
      // Prefer canvas saved from the Edit Canvas demo
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          await loadCanvas(c, JSON.parse(stored));
          return;
        } catch {
          // fall through to demo shapes
        }
      }

      // Default demo canvas when nothing has been saved yet
      createRectangle(c, { left: 120, top: 80, width: 140, height: 90 });
      createRectangle(c, { left: 500, top: 60, width: 100, height: 150 });
      createRectangle(c, { left: 350, top: 380, width: 180, height: 70 });
      createPolygon(c, {
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
      createPolygon(c, {
        points: [
          { x: 50, y: 0 },
          { x: 100, y: 35 },
          { x: 80, y: 90 },
          { x: 20, y: 90 },
          { x: 0, y: 35 },
        ],
        left: 80,
        top: 320,
      });
      createCircle(c, { left: 200, top: 230, size: 100 });
      createCircle(c, { left: 500, top: 390, size: 60 });
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
          <div>
            <Typography variant="subtitle2" gutterBottom>
              Features
            </Typography>
            <Stack>
              {(
                [
                  { key: 'scaledStrokes', label: 'Scaled Strokes' },
                  { key: 'panZoom', label: 'Pan & Zoom' },
                ] as Array<{ key: keyof ViewCanvasOptions; label: string }>
              ).map(({ key, label }) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Switch
                      checked={options[key]}
                      onChange={(e) => onOptionToggle(key, e.target.checked)}
                    />
                  }
                  label={
                    <Box
                      sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}
                    >
                      <Typography variant="body2">{label}</Typography>
                      <Typography variant="caption" color="text.disabled">
                        (remounts)
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </Stack>
          </div>

          <Divider />

          <Typography variant="subtitle2">View-Only Canvas</Typography>
          <Typography variant="body2" color="text.secondary">
            Uses <code>useViewCanvas</code>. Objects cannot be selected,
            created, edited, or deleted. Drag to pan, scroll to zoom.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            If a canvas has been saved from the <em>Edit Canvas</em> demo, it is
            loaded here automatically. Otherwise a default demo canvas is shown.
          </Typography>
        </>
      }
    />
  );
}

// ============================================================
// ViewCanvasDemo story
// ============================================================

/**
 * View-only demo using `useViewCanvas`.
 *
 * Loads the canvas saved by the **Edit Canvas** story (via `localStorage`)
 * if one exists — otherwise shows a pre-populated demo canvas. Objects
 * cannot be selected, created, edited, or deleted. Only panning and
 * zooming are available.
 *
 * Toggle **Scaled Strokes** and **Pan & Zoom** to see how those options
 * affect the view experience (both remount the canvas, restoring the same
 * content).
 */
export const ViewCanvasDemo: Story = {
  name: 'View Canvas',
  render: function ViewCanvasDemoRender() {
    const [options, setOptions] = useState<ViewCanvasOptions>({
      scaledStrokes: true,
      panZoom: true,
    });

    const canvasKey = `${options.scaledStrokes}-${options.panZoom}`;

    const handleOptionToggle = useCallback(
      (key: keyof ViewCanvasOptions, value: boolean) => {
        setOptions((prev) => ({ ...prev, [key]: value }));
      },
      [],
    );

    return (
      <ViewCanvasContent
        key={canvasKey}
        options={options}
        onOptionToggle={handleOptionToggle}
      />
    );
  },
};
