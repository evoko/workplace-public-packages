import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
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
  useObjectOverlay,
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
  setBackgroundContrast,
  getBackgroundContrast,
  setBackgroundInverted,
  getBackgroundInverted,
} from '@bwp-web/canvas';
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
  const [bgContrast, setBgContrast] = useState(1);
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
      // Auto-assign data.id to any new object that doesn't have one
      c.on('object:added', (e) => {
        const obj = e.target;
        if (!obj.data?.id) {
          obj.data = { type: 'PLACE', id: crypto.randomUUID(), ...obj.data };
        }
      });

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          await loadCanvas(c, JSON.parse(stored));
          if (c.backgroundImage) {
            setHasBackground(true);
            setBgContrast(getBackgroundContrast(c));
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
              {
                onCreated: () => activateMode('select', shape),
                viewport,
                clickFactory: (c, point) =>
                  createRectangleAtPoint(c, point, {
                    width: 60,
                    height: 40,
                  }),
              },
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
                clickFactory: (c, point) =>
                  createCircleAtPoint(c, point, { size: 40 }),
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
              {
                onCreated: () => activateMode('select', shape),
                viewport,
                clickFactory: (c, point) =>
                  createPolygonAtPoint(c, point, {
                    width: 100,
                    height: 80,
                  }),
              },
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
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (typeof ev.target?.result !== 'string') return;
        await canvas.setBackground(ev.target.result);
        const c = canvas.canvasRef.current;
        if (c) {
          setBgContrast(getBackgroundContrast(c));
          setBgInverted(getBackgroundInverted(c));
        }
        setHasBackground(true);
      };
      reader.readAsDataURL(file);
    },
    [canvas.setBackground, canvas.canvasRef],
  );

  const handleContrastChange = useCallback(
    (_: Event, value: number | number[]) => {
      const v = Array.isArray(value) ? value[0] : value;
      setBgContrast(v);
      const c = canvas.canvasRef.current;
      if (c) setBackgroundContrast(c, v);
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
      setBgContrast(getBackgroundContrast(c));
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
                        Contrast: {Math.round(bgContrast * 100)}%
                      </Typography>
                      <Slider
                        value={bgContrast}
                        min={0}
                        max={2}
                        step={0.05}
                        onChange={handleContrastChange}
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

interface ObjectEntry {
  id: string;
  label: string;
  fill: string;
  stroke: string;
}

function collectObjectEntries(c: FabricCanvas): ObjectEntry[] {
  const entries: ObjectEntry[] = [];
  c.forEachObject((obj) => {
    if (!obj.data?.id) return;
    const type =
      obj.shapeType === 'circle'
        ? 'Circle'
        : obj instanceof Polygon
          ? 'Polygon'
          : obj instanceof Rect
            ? 'Rectangle'
            : 'Object';
    entries.push({
      id: obj.data.id,
      label: `${type} (${obj.data.id})`,
      fill: (obj.fill as string) ?? '',
      stroke: (obj.stroke as string) ?? '',
    });
  });
  return entries;
}

function ViewCanvasContent({
  options,
  onOptionToggle,
}: ViewCanvasContentProps) {
  const [objectEntries, setObjectEntries] = useState<ObjectEntry[]>([]);

  const canvas = useViewCanvas({
    scaledStrokes: options.scaledStrokes,
    panAndZoom: options.panZoom,
    onReady: async (c) => {
      // Prefer canvas saved from the Edit Canvas demo
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          await loadCanvas(c, JSON.parse(stored));
          setObjectEntries(collectObjectEntries(c));
          return;
        } catch {
          // fall through to demo shapes
        }
      }

      // Default demo canvas when nothing has been saved yet
      const r1 = createRectangle(c, {
        left: 120,
        top: 80,
        width: 140,
        height: 90,
      });
      r1.data = { type: 'PLACE', id: 'rect-1' };
      const r2 = createRectangle(c, {
        left: 500,
        top: 60,
        width: 100,
        height: 150,
      });
      r2.data = { type: 'PLACE', id: 'rect-2' };
      const r3 = createRectangle(c, {
        left: 350,
        top: 380,
        width: 180,
        height: 70,
      });
      r3.data = { type: 'PLACE', id: 'rect-3' };
      const p1 = createPolygon(c, {
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
      p1.data = { type: 'PLACE', id: 'poly-1' };
      const p2 = createPolygon(c, {
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
      p2.data = { type: 'PLACE', id: 'poly-2' };
      const c1 = createCircle(c, { left: 200, top: 230, size: 100 });
      c1.data = { type: 'PLACE', id: 'circle-1' };
      const c2 = createCircle(c, { left: 500, top: 390, size: 60 });
      c2.data = { type: 'PLACE', id: 'circle-2' };

      setObjectEntries(collectObjectEntries(c));
    },
  });

  const handleStyleChange = useCallback(
    (id: string, field: 'fill' | 'stroke', value: string) => {
      canvas.setObjectStyle(id, { [field]: value });
      setObjectEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
      );
    },
    [canvas.setObjectStyle],
  );

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

          {objectEntries.length > 0 && (
            <>
              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Object Styling
                </Typography>
                <Stack spacing={1.5}>
                  {objectEntries.map((entry) => (
                    <Box key={entry.id}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mb: 0.5 }}
                      >
                        {entry.label}
                      </Typography>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <Typography variant="caption" sx={{ minWidth: 28 }}>
                          Fill
                        </Typography>
                        <input
                          type="color"
                          value={entry.fill || '#000000'}
                          onChange={(e) =>
                            handleStyleChange(entry.id, 'fill', e.target.value)
                          }
                          style={{
                            width: 28,
                            height: 22,
                            padding: 0,
                            border: '1px solid #ccc',
                            borderRadius: 3,
                            cursor: 'pointer',
                          }}
                        />
                        <Typography variant="caption" sx={{ minWidth: 38 }}>
                          Stroke
                        </Typography>
                        <input
                          type="color"
                          value={entry.stroke || '#000000'}
                          onChange={(e) =>
                            handleStyleChange(
                              entry.id,
                              'stroke',
                              e.target.value,
                            )
                          }
                          style={{
                            width: 28,
                            height: 22,
                            padding: 0,
                            border: '1px solid #ccc',
                            borderRadius: 3,
                            cursor: 'pointer',
                          }}
                        />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </div>

              <Divider />
            </>
          )}

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

// ============================================================
// ObjectOverlayLabel — renders a DOM label over a canvas object
// ============================================================

function ObjectOverlayLabel({
  canvasRef,
  object,
  label,
}: {
  canvasRef: RefObject<FabricCanvas | null>;
  object: FabricObject;
  label: string;
}) {
  const overlayRef = useObjectOverlay(canvasRef, object, {
    autoScaleContent: true,
    textSelector: '.overlay-text',
    textMinScale: 0.5,
  });

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transform: 'scale(var(--overlay-scale, 1))',
          transformOrigin: 'center',
          background: 'rgba(33, 150, 243, 0.85)',
          color: '#fff',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#fff',
            flexShrink: 0,
          }}
        />
        <span className="overlay-text">{label}</span>
      </div>
    </div>
  );
}

// ============================================================
// OverlayDemoContent — useObjectOverlay + panToObject demo
// ============================================================

function OverlayDemoContent() {
  const [objects, setObjects] = useState<FabricObject[]>([]);
  const [showOverlays, setShowOverlays] = useState(true);

  const canvas = useEditCanvas({
    onReady: (c) => {
      const r1 = createRectangle(c, {
        left: 200,
        top: 150,
        width: 140,
        height: 90,
      });
      r1.data = { type: 'DESK', id: 'desk-101' };

      const r2 = createRectangle(c, {
        left: 500,
        top: 100,
        width: 120,
        height: 80,
      });
      r2.data = { type: 'DESK', id: 'desk-102' };

      const c1 = createCircle(c, { left: 350, top: 350, size: 100 });
      c1.data = { type: 'FACILITY', id: 'printer-A' };

      const p1 = createPolygon(c, {
        points: [
          { x: 0, y: 0 },
          { x: 80, y: -20 },
          { x: 120, y: 30 },
          { x: 100, y: 80 },
          { x: 20, y: 80 },
        ],
        left: 150,
        top: 350,
      });
      p1.data = { type: 'PLACE', id: 'room-A1' };

      setObjects([r1, r2, c1, p1]);
    },
  });

  return (
    <DemoLayout
      onReady={canvas.onReady}
      canvasOverlay={
        <>
          <ViewportControlToolbar
            zoom={canvas.zoom}
            viewportMode={canvas.viewport.mode}
            onModeChange={canvas.viewport.setMode}
            onZoomIn={canvas.viewport.zoomIn}
            onZoomOut={canvas.viewport.zoomOut}
            onReset={canvas.viewport.reset}
          />
          {showOverlays &&
            objects.map((obj) => (
              <ObjectOverlayLabel
                key={obj.data?.id}
                canvasRef={canvas.canvasRef}
                object={obj}
                label={obj.data?.id ?? ''}
              />
            ))}
        </>
      }
      sidebar={
        <>
          <div>
            <Typography variant="subtitle2" gutterBottom>
              Object Overlay
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={showOverlays}
                  onChange={(e) => setShowOverlays(e.target.checked)}
                />
              }
              label={<Typography variant="body2">Show Overlays</Typography>}
            />
          </div>

          <Divider />

          {objects.length > 0 && (
            <>
              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Pan to Object
                </Typography>
                <Stack spacing={0.5}>
                  {objects.map((obj) => (
                    <Button
                      key={obj.data?.id}
                      variant="outlined"
                      size="small"
                      fullWidth
                      onClick={() =>
                        canvas.viewport.panToObject(obj, { animate: true })
                      }
                    >
                      {obj.data?.id ?? 'unknown'}
                    </Button>
                  ))}
                </Stack>
              </div>

              <Divider />
            </>
          )}

          <Typography variant="body2" color="text.secondary">
            DOM overlays positioned over canvas objects using{' '}
            <code>useObjectOverlay</code>. Overlays track with pan, zoom, move,
            scale, and rotate.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Zoom in/out to see auto-scaling. Text labels hide when zoomed out
            far enough.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click &ldquo;Pan to Object&rdquo; buttons to see animated panning
            via <code>viewport.panToObject</code>.
          </Typography>
        </>
      }
    />
  );
}

// ============================================================
// ObjectOverlayDemo story
// ============================================================

/**
 * Demonstrates `useObjectOverlay` — positioning DOM elements over canvas
 * objects that stay in sync with pan, zoom, move, scale, and rotate.
 *
 * - **Toggle overlays**: switch the DOM labels on/off
 * - **Pan to object**: animated panning via `viewport.panToObject`
 * - **Auto-scale**: overlay content scales with zoom; text hides at low zoom
 * - **Drag objects**: overlays follow in real time
 */
export const ObjectOverlayDemo: Story = {
  name: 'Object Overlay',
  render: function ObjectOverlayDemoRender() {
    return <OverlayDemoContent />;
  },
};
