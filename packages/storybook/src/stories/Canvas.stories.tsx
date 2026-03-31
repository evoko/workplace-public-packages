import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Polygon, Rect } from 'fabric';
import type { Canvas as FabricCanvas, FabricObject } from 'fabric';
import {
  Canvas,
  useEditCanvas,
  useViewCanvas,
  useCanvasTooltip,
  ObjectOverlay,
  OverlayContent,
  FixedSizeContent,
  OverlayBadge,
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

// --- Shared inline style helpers ---

const sidebarSubtitle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 600,
  marginBottom: 4,
  color: 'var(--solar-text-default, #212121)',
};

const bodyText: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--solar-text-default, #212121)',
};

const secondaryText: React.CSSProperties = {
  fontSize: 14,
  color: 'var(--solar-text-secondary, #666)',
};

const captionText: React.CSSProperties = {
  fontSize: 12,
  color: 'var(--solar-text-secondary, #666)',
};

const btnOutlined: React.CSSProperties = {
  width: '100%',
  padding: '4px 10px',
  fontSize: 13,
  cursor: 'pointer',
  border: '1px solid var(--solar-border-default, #bdbdbd)',
  backgroundColor: 'transparent',
  color: 'var(--solar-text-default, #212121)',
  borderRadius: 4,
};

const btnContained: React.CSSProperties = {
  ...btnOutlined,
  backgroundColor: 'var(--solar-surface-primary, #1976d2)',
  color: '#fff',
  border: '1px solid var(--solar-surface-primary, #1976d2)',
};

const btnError: React.CSSProperties = {
  ...btnOutlined,
  color: '#d32f2f',
  borderColor: '#d32f2f',
};

function ToggleGroupBtn({
  active,
  label,
  onClick,
  style,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 10px',
        fontSize: 13,
        cursor: 'pointer',
        border: '1px solid var(--solar-border-default, #bdbdbd)',
        backgroundColor: active
          ? 'var(--solar-surface-primary, #1976d2)'
          : 'transparent',
        color: active ? '#fff' : 'var(--solar-text-default, #212121)',
        flex: 1,
        ...style,
      }}
    >
      {label}
    </button>
  );
}

function VerticalToggleBtn({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '4px 10px',
        fontSize: 13,
        cursor: 'pointer',
        border: '1px solid var(--solar-border-default, #bdbdbd)',
        backgroundColor: active
          ? 'var(--solar-surface-primary, #1976d2)'
          : 'transparent',
        color: active ? '#fff' : 'var(--solar-text-default, #212121)',
        width: '100%',
        marginTop: -1,
      }}
    >
      {label}
    </button>
  );
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
    history: true,
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
    (e: ChangeEvent<HTMLInputElement>) => {
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
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = Number(e.target.value);
      setBgContrast(v);
      const c = canvas.canvasRef.current;
      if (c) setBackgroundContrast(c, v);
    },
    [canvas.canvasRef],
  );

  const handleInvertChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
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
            onZoomToFit={() => {
              const c = canvas.canvasRef.current;
              if (!c) return;
              const target = c.getActiveObject() ?? c.getObjects()[0];
              if (target) {
                canvas.viewport.zoomToFit(target);
              }
            }}
          />
        }
        sidebar={
          <>
            {/* Features */}
            <div>
              <span style={sidebarSubtitle}>Features</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {FEATURE_TOGGLES.map(({ key, label, hint }) => (
                  <label
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      padding: '2px 0',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={options[key]}
                      onChange={(e) => onOptionToggle(key, e.target.checked)}
                    />
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        gap: 4,
                      }}
                    >
                      <span style={bodyText}>{label}</span>
                      <span
                        style={{
                          ...captionText,
                          color:
                            hint === 'live'
                              ? '#2e7d32'
                              : 'var(--solar-text-disabled, #9e9e9e)',
                        }}
                      >
                        ({hint})
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <hr
              style={{
                border: 'none',
                borderTop: '1px solid var(--solar-border-default, #e0e0e0)',
              }}
            />

            {/* Draw Tools */}
            <div>
              <span style={sidebarSubtitle}>Shape</span>
              <div style={{ display: 'flex', marginBottom: 16 }}>
                {(['rectangle', 'circle', 'polygon'] as ShapeType[]).map(
                  (s) => (
                    <ToggleGroupBtn
                      key={s}
                      active={activeShape === s}
                      label={s[0].toUpperCase() + s.slice(1)}
                      onClick={() => handleShapeChange(s)}
                    />
                  ),
                )}
              </div>
              <span style={sidebarSubtitle}>Mode</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {availableModes.map((m) => (
                  <VerticalToggleBtn
                    key={m.key}
                    active={creationMode === m.key}
                    label={m.label}
                    onClick={() => handleModeChange(m.key)}
                  />
                ))}
              </div>
            </div>

            {/* Status: vertex editing */}
            {canvas.isEditingVertices && (
              <div
                style={{
                  padding: 12,
                  backgroundColor: '#e3f2fd',
                  borderRadius: 4,
                }}
              >
                <span style={{ ...bodyText, color: '#01579b' }}>
                  Editing vertices — drag handles to reshape.
                  <br />
                  Press <strong>Esc</strong> or click canvas to exit.
                </span>
              </div>
            )}

            {/* Status: selection & edit */}
            {canvas.selected.length > 0 && !canvas.isEditingVertices && (
              <div>
                <p style={{ ...secondaryText, marginBottom: 4 }}>
                  {canvas.selected.length} object
                  {canvas.selected.length > 1 ? 's' : ''} selected
                  {options.keyboardShortcuts ? ' \u00b7 Del to remove' : ''}
                </p>
                {selectedObj && editFields.length > 0 && (
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                  >
                    {editFields.map((field) => (
                      <div
                        key={field}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            ...captionText,
                            minWidth: 44,
                            textTransform: 'uppercase',
                            flexShrink: 0,
                          }}
                        >
                          {field}
                        </span>
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
                      </div>
                    ))}
                    {selectedObj instanceof Polygon && options.vertexEdit && (
                      <span style={captionText}>
                        Double-click to edit vertices.
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            <hr
              style={{
                border: 'none',
                borderTop: '1px solid var(--solar-border-default, #e0e0e0)',
              }}
            />

            {/* Undo / Redo */}
            <div>
              <span style={sidebarSubtitle}>History</span>
              <div style={{ display: 'flex' }}>
                <button
                  onClick={() => canvas.undo()}
                  disabled={!canvas.canUndo}
                  style={{ ...btnOutlined, flex: 1 }}
                >
                  Undo
                </button>
                <button
                  onClick={() => canvas.redo()}
                  disabled={!canvas.canRedo}
                  style={{ ...btnOutlined, flex: 1, marginLeft: -1 }}
                >
                  Redo
                </button>
              </div>
            </div>

            <hr
              style={{
                border: 'none',
                borderTop: '1px solid var(--solar-border-default, #e0e0e0)',
              }}
            />

            {/* Background Image */}
            <div>
              <span style={sidebarSubtitle}>Background Image</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  style={btnOutlined}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Image
                </button>
                {hasBackground && (
                  <>
                    <div>
                      <span style={captionText}>
                        Contrast: {Math.round(bgContrast * 100)}%
                      </span>
                      <input
                        type="range"
                        value={bgContrast}
                        min={0}
                        max={2}
                        step={0.05}
                        onChange={handleContrastChange}
                        style={{ width: '100%' }}
                      />
                    </div>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={bgInverted}
                        onChange={handleInvertChange}
                      />
                      <span style={bodyText}>Invert</span>
                    </label>
                    <button style={btnError} onClick={handleClearBackground}>
                      Clear Background
                    </button>
                  </>
                )}
              </div>
            </div>

            <hr
              style={{
                border: 'none',
                borderTop: '1px solid var(--solar-border-default, #e0e0e0)',
              }}
            />

            {/* Canvas Actions */}
            <div>
              <span style={sidebarSubtitle}>Canvas</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button style={btnContained} onClick={handleSave}>
                  Save
                </button>
                <button
                  style={btnOutlined}
                  onClick={handleLoad}
                  disabled={!hasSaved}
                >
                  Load
                </button>
                <button style={btnError} onClick={handleClear}>
                  Clear
                </button>
              </div>
              {savedCharCount !== null && (
                <span
                  style={{ ...captionText, marginTop: 4, display: 'block' }}
                >
                  Saved: {savedCharCount} chars &middot; ViewCanvas will use
                  this
                </span>
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
function EditCanvasDemoWrapper() {
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
}

export const EditCanvasDemo: Story = {
  name: 'Edit Canvas',
  render: () => <EditCanvasDemoWrapper />,
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
          onZoomToFit={() => {
            const c = canvas.canvasRef.current;
            if (!c) return;
            const target = c.getActiveObject() ?? c.getObjects()[0];
            if (target) {
              canvas.viewport.zoomToFit(target);
            }
          }}
        />
      }
      sidebar={
        <>
          <div>
            <span style={sidebarSubtitle}>Features</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {(
                [
                  { key: 'scaledStrokes', label: 'Scaled Strokes' },
                  { key: 'panZoom', label: 'Pan & Zoom' },
                ] as Array<{ key: keyof ViewCanvasOptions; label: string }>
              ).map(({ key, label }) => (
                <label
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    padding: '2px 0',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={options[key]}
                    onChange={(e) => onOptionToggle(key, e.target.checked)}
                  />
                  <span
                    style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}
                  >
                    <span style={bodyText}>{label}</span>
                    <span
                      style={{
                        ...captionText,
                        color: 'var(--solar-text-disabled, #9e9e9e)',
                      }}
                    >
                      (remounts)
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <hr
            style={{
              border: 'none',
              borderTop: '1px solid var(--solar-border-default, #e0e0e0)',
            }}
          />

          {objectEntries.length > 0 && (
            <>
              <div>
                <span style={sidebarSubtitle}>Object Styling</span>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  {objectEntries.map((entry) => (
                    <div key={entry.id}>
                      <span
                        style={{
                          ...captionText,
                          display: 'block',
                          marginBottom: 4,
                        }}
                      >
                        {entry.label}
                      </span>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span style={{ ...captionText, minWidth: 28 }}>
                          Fill
                        </span>
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
                        <span style={{ ...captionText, minWidth: 38 }}>
                          Stroke
                        </span>
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
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <hr
                style={{
                  border: 'none',
                  borderTop: '1px solid var(--solar-border-default, #e0e0e0)',
                }}
              />
            </>
          )}

          <span style={sidebarSubtitle}>View-Only Canvas</span>
          <p style={secondaryText}>
            Uses <code>useViewCanvas</code>. Objects cannot be selected,
            created, edited, or deleted. Drag to pan, scroll to zoom.
          </p>
          <p style={secondaryText}>
            If a canvas has been saved from the <em>Edit Canvas</em> demo, it is
            loaded here automatically. Otherwise a default demo canvas is shown.
          </p>
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
function ViewCanvasDemoWrapper() {
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
}

export const ViewCanvasDemo: Story = {
  name: 'View Canvas',
  render: () => <ViewCanvasDemoWrapper />,
};

// ============================================================
// ViewCanvasTooltipDemo — useViewCanvas + useCanvasTooltip
// ============================================================

/**
 * View-only canvas with a hover tooltip using `useCanvasTooltip`.
 *
 * Hover over any shape to see a "Hello World" tooltip with an info icon.
 */
function ViewCanvasTooltipContent() {
  const canvas = useViewCanvas({
    scaledStrokes: true,
    panAndZoom: true,
    onReady: async (c) => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          await loadCanvas(c, JSON.parse(stored));
          return;
        } catch {
          // fall through to demo shapes
        }
      }

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
      const c1 = createCircle(c, { left: 200, top: 230, size: 100 });
      c1.data = { type: 'PLACE', id: 'circle-1' };
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
    },
  });

  const tooltip = useCanvasTooltip(canvas.canvasRef, {
    getContent: (obj) => (obj.data?.id ? { id: obj.data.id as string } : null),
  });

  return (
    <DemoLayout
      onReady={canvas.onReady}
      canvasOverlay={
        <>
          <ViewportControlToolbar
            zoom={canvas.zoom}
            viewportMode="pan"
            onModeChange={() => {}}
            onZoomIn={canvas.viewport.zoomIn}
            onZoomOut={canvas.viewport.zoomOut}
            onReset={canvas.viewport.reset}
          />
          {tooltip.visible && tooltip.content && (
            <div
              ref={tooltip.ref}
              style={{
                position: 'absolute',
                left: tooltip.position.x,
                top: tooltip.position.y,
                transform: 'translate(-50%, -100%)',
                paddingLeft: 12,
                paddingRight: 12,
                paddingTop: 6,
                paddingBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
                backgroundColor: 'var(--solar-surface-default, #fff)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                borderRadius: 4,
              }}
            >
              <span
                style={{
                  fontSize: 16,
                  color: 'var(--solar-surface-primary, #1976d2)',
                }}
              >
                &#9432;
              </span>
              <span style={bodyText}>Hello World — {tooltip.content.id}</span>
            </div>
          )}
        </>
      }
      sidebar={
        <p style={secondaryText}>Hover over any shape to see the tooltip.</p>
      }
    />
  );
}

export const ViewCanvasTooltipDemo: Story = {
  name: 'View Canvas — Tooltip',
  render: () => <ViewCanvasTooltipContent />,
};

// ============================================================
// OverlayDemoContent — ObjectOverlay + OverlayContent demo
// ============================================================

/** Subtitles for overlay objects — keyed by `data.id`. */
const OVERLAY_SUBTITLES: Record<string, string> = {
  'desk-102': 'Floor 3 \u00b7 Building A',
  'printer-A': 'Available',
  'room-A1': 'Conference',
};

/** Badge colors for overlay objects — keyed by `data.id`. */
const OVERLAY_BADGES: Record<string, string> = {
  'super duper uber long desk name': '#4caf50',
  'desk-102': '#f44336',
  'printer-A': '#ff9800',
  'room-A1': '#2196f3',
};

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
      r1.data = { type: 'DESK', id: 'super duper uber long desk name' };

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
            onZoomToFit={() => {
              const c = canvas.canvasRef.current;
              if (!c) return;
              const target = c.getActiveObject() ?? c.getObjects()[0];
              if (target) {
                canvas.viewport.zoomToFit(target);
              }
            }}
          />
          {showOverlays &&
            objects.map((obj) => (
              <ObjectOverlay
                key={obj.data?.id}
                canvasRef={canvas.canvasRef}
                object={obj}
              >
                <OverlayContent>
                  {/* Icon scales with OverlayContent */}
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      flexShrink: 0,
                    }}
                  />
                  {/* Text stays at fixed size via FixedSizeContent */}
                  <FixedSizeContent>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {obj.data?.id ?? ''}
                    </span>
                    {obj.data?.id && OVERLAY_SUBTITLES[obj.data.id] && (
                      <span
                        style={{
                          fontSize: 10,
                          whiteSpace: 'nowrap',
                          color: 'var(--solar-text-secondary, #666)',
                          display: 'block',
                        }}
                      >
                        {OVERLAY_SUBTITLES[obj.data.id]}
                      </span>
                    )}
                  </FixedSizeContent>
                </OverlayContent>
                {obj.data?.id && OVERLAY_BADGES[obj.data.id] && (
                  <OverlayBadge
                    circular={obj.shapeType === 'circle'}
                    top={obj.shapeType === 'circle' ? 0 : -6}
                    right={obj.shapeType === 'circle' ? 0 : -6}
                  >
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: OVERLAY_BADGES[obj.data.id],
                        border: '1.5px solid white',
                      }}
                    />
                  </OverlayBadge>
                )}
              </ObjectOverlay>
            ))}
        </>
      }
      sidebar={
        <>
          <div>
            <span style={sidebarSubtitle}>Object Overlay</span>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={showOverlays}
                onChange={(e) => setShowOverlays(e.target.checked)}
              />
              <span style={bodyText}>Show Overlays</span>
            </label>
          </div>

          <hr
            style={{
              border: 'none',
              borderTop: '1px solid var(--solar-border-default, #e0e0e0)',
            }}
          />

          {objects.length > 0 && (
            <>
              <div>
                <span style={sidebarSubtitle}>Pan to Object</span>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  {objects.map((obj) => (
                    <button
                      key={obj.data?.id}
                      style={btnOutlined}
                      onClick={() =>
                        canvas.viewport.panToObject(obj, { animate: true })
                      }
                    >
                      {obj.data?.id ?? 'unknown'}
                    </button>
                  ))}
                </div>
              </div>

              <hr
                style={{
                  border: 'none',
                  borderTop: '1px solid var(--solar-border-default, #e0e0e0)',
                }}
              />
            </>
          )}

          <p style={secondaryText}>
            DOM overlays positioned over canvas objects using{' '}
            <code>ObjectOverlay</code> + <code>OverlayContent</code>. The icon
            scales to fill the object bounds, while labels wrapped in{' '}
            <code>FixedSizeContent</code> stay at a constant size and auto-hide
            when the overlay gets too small. Some objects show a subtitle (10px)
            below the name (12px) to demonstrate multi-line fixed-size text.{' '}
            <code>OverlayBadge</code> adds status dots anchored to the top-right
            corner with independent scaling.
          </p>
          <p style={secondaryText}>
            Click &ldquo;Pan to Object&rdquo; buttons to see animated panning
            via <code>viewport.panToObject</code>.
          </p>
        </>
      }
    />
  );
}

// ============================================================
// ObjectOverlayDemo story
// ============================================================

/**
 * Demonstrates `ObjectOverlay` + `OverlayContent` + `FixedSizeContent` —
 * positioning scaled DOM elements over canvas objects that stay in sync with
 * pan, zoom, move, scale, and rotate.
 *
 * - **Mixed scaling**: the icon scales with `OverlayContent` to fill the
 *   object bounds, while text labels stay at a constant 12px via
 *   `FixedSizeContent` (auto-hides when the overlay is too small).
 * - **Toggle overlays**: switch the DOM labels on/off
 * - **Pan to object**: animated panning via `viewport.panToObject`
 * - **Drag objects**: overlays follow in real time
 */
export const ObjectOverlayDemo: Story = {
  name: 'Object Overlay',
  render: function ObjectOverlayDemoRender() {
    return <OverlayDemoContent />;
  },
};

// ============================================================
// StressTest — 200 polygons with overlays
// ============================================================

const STRESS_OBJECT_COUNT = 200;
const GRID_COLS = 20;
const CELL_SIZE = 120;
const SHAPE_SIZE = 80;

const BADGE_COLORS = ['#4caf50', '#f44336', '#ff9800', '#2196f3', '#9c27b0'];

function StressTestContent() {
  const [objects, setObjects] = useState<FabricObject[]>([]);
  const [showOverlays, setShowOverlays] = useState(true);

  const canvas = useViewCanvas({
    scaledStrokes: true,
    panAndZoom: true,
    onReady: (c: FabricCanvas) => {
      const created: FabricObject[] = [];
      for (let i = 0; i < STRESS_OBJECT_COUNT; i++) {
        const col = i % GRID_COLS;
        const row = Math.floor(i / GRID_COLS);
        const left = col * CELL_SIZE + CELL_SIZE / 2;
        const top = row * CELL_SIZE + CELL_SIZE / 2;

        const poly = createPolygon(c, {
          points: [
            { x: 0, y: 0 },
            { x: SHAPE_SIZE, y: 0 },
            { x: SHAPE_SIZE, y: SHAPE_SIZE },
            { x: 0, y: SHAPE_SIZE },
          ],
          left,
          top,
        });
        poly.data = { type: 'DESK', id: `desk-${i + 1}` };
        created.push(poly);
      }
      setObjects(created);
    },
  });

  return (
    <DemoLayout
      onReady={canvas.onReady}
      canvasOverlay={
        <>
          <ViewportControlToolbar
            zoom={canvas.zoom}
            viewportMode="pan"
            onModeChange={() => {}}
            onZoomIn={canvas.viewport.zoomIn}
            onZoomOut={canvas.viewport.zoomOut}
            onReset={canvas.viewport.reset}
          />
          {showOverlays &&
            objects.map((obj, i) => (
              <ObjectOverlay
                key={obj.data?.id}
                canvasRef={canvas.canvasRef}
                object={obj}
              >
                <OverlayContent>
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      flexShrink: 0,
                    }}
                  />
                  <FixedSizeContent>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {obj.data?.id}
                    </span>
                  </FixedSizeContent>
                </OverlayContent>
                <OverlayBadge top={-6} right={-6}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: BADGE_COLORS[i % BADGE_COLORS.length],
                      border: '1.5px solid white',
                    }}
                  />
                </OverlayBadge>
              </ObjectOverlay>
            ))}
        </>
      }
      sidebar={
        <>
          <div>
            <span style={sidebarSubtitle}>Stress Test</span>
            <p style={{ ...secondaryText, marginBottom: 4 }}>
              {STRESS_OBJECT_COUNT} polygons with DOM overlays (icon + name +
              badge each).
            </p>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={showOverlays}
                onChange={(e) => setShowOverlays(e.target.checked)}
              />
              <span style={bodyText}>Show Overlays</span>
            </label>
          </div>

          <hr
            style={{
              border: 'none',
              borderTop: '1px solid var(--solar-border-default, #e0e0e0)',
            }}
          />

          <p style={secondaryText}>
            Pan (drag) and zoom (scroll) to stress test overlay positioning and
            rendering performance with a large number of objects. Toggle
            overlays off to compare canvas-only rendering speed.
          </p>
        </>
      }
    />
  );
}

/**
 * Stress test with {STRESS_OBJECT_COUNT} square polygons arranged in a grid,
 * each with a DOM overlay containing an icon, name label, and status badge.
 *
 * Use this to benchmark overlay rendering performance at scale. Toggle overlays
 * on/off to compare. Pan and zoom to exercise the per-frame update path.
 */
export const StressTest: Story = {
  name: 'Stress Test (200 Overlays)',
  render: function StressTestRender() {
    return <StressTestContent />;
  },
};
