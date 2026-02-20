import React, { useCallback, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  Box,
  Button,
  ButtonGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  Canvas,
  createRectangle,
  editRectangle,
  createPolygon,
  editPolygon,
  enableClickToCreate,
  enableDragToCreate,
  enablePolygonClickToCreate,
  enablePolygonDragToCreate,
  enablePolygonDrawToCreate,
  enableVertexEdit,
  enablePanAndZoom,
  resetViewport,
  type ViewportController,
  type ViewportMode,
} from '@bwp-web/canvas';
import { Polygon as FabricPolygon } from 'fabric';
import type {
  Canvas as FabricCanvas,
  Rect,
  Polygon,
  FabricObject,
} from 'fabric';

type Mode = 'select' | 'click' | 'drag';

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

/**
 * Interactive demo for creating, editing, and deleting rectangles.
 *
 * - **Select mode**: Click objects to select them, then edit.
 * - **Click-to-place mode**: Click anywhere on the canvas to place a 100x80 rectangle.
 * - **Drag-to-draw mode**: Hold mouse and drag to draw a rectangle.
 */
export const RectangleDemo: Story = {
  render: function RectangleDemo() {
    const canvasRef = useRef<FabricCanvas | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const viewportRef = useRef<ViewportController | null>(null);

    const [mode, setMode] = useState<Mode>('select');
    const [viewportMode, setViewportMode] = useState<ViewportMode>('select');
    const [selected, setSelected] = useState<Rect[]>([]);
    const [zoom, setZoom] = useState(1);
    const [editValues, setEditValues] = useState({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });

    const syncEditValues = useCallback((obj: FabricObject) => {
      setEditValues({
        left: Math.round(obj.left ?? 0),
        top: Math.round(obj.top ?? 0),
        width: Math.round(obj.width ?? 0),
        height: Math.round(obj.height ?? 0),
      });
    }, []);

    const handleReady = useCallback(
      (canvas: FabricCanvas) => {
        canvasRef.current = canvas;

        viewportRef.current = enablePanAndZoom(canvas);

        canvas.on('mouse:wheel', () => {
          setZoom(canvas.getZoom());
        });

        canvas.on('selection:created', (e) => {
          const objs = (e.selected ?? []) as Rect[];
          setSelected(objs);
          if (objs.length === 1) {
            syncEditValues(objs[0]);
          }
        });

        canvas.on('selection:updated', (e) => {
          const objs = (e.selected ?? []) as Rect[];
          setSelected(objs);
          if (objs.length === 1) {
            syncEditValues(objs[0]);
          }
        });

        canvas.on('selection:cleared', () => {
          setSelected([]);
        });

        canvas.on('object:modified', (e) => {
          if (e.target && selected.length === 1) {
            syncEditValues(e.target);
          }
        });
      },
      [syncEditValues],
    );

    const handleResetViewport = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      resetViewport(canvas);
      setZoom(1);
    }, []);

    const handleViewportMode = useCallback((newMode: ViewportMode) => {
      viewportRef.current?.setMode(newMode);
      setViewportMode(newMode);
    }, []);

    const activateMode = useCallback((newMode: Mode) => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      setMode(newMode);

      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      canvas.selection = newMode === 'select';
      canvas.forEachObject((obj) => {
        obj.selectable = newMode === 'select';
        obj.evented = newMode === 'select';
      });

      if (newMode === 'click') {
        cleanupRef.current = enableClickToCreate(
          canvas,
          {
            width: 100,
            height: 80,
            fill: 'rgba(33, 150, 243, 0.3)',
            stroke: '#2196f3',
            strokeWidth: 2,
          },
          () => {
            activateMode('select');
          },
        );
      }

      if (newMode === 'drag') {
        cleanupRef.current = enableDragToCreate(
          canvas,
          {
            fill: 'rgba(76, 175, 80, 0.3)',
            stroke: '#4caf50',
            strokeWidth: 2,
          },
          () => {
            activateMode('select');
          },
        );
      }
    }, []);

    const handleEdit = useCallback(
      (field: keyof typeof editValues, value: string) => {
        const num = Number(value);
        if (isNaN(num)) {
          return;
        }

        setEditValues((prev) => ({ ...prev, [field]: num }));

        const canvas = canvasRef.current;
        if (canvas && selected.length === 1) {
          editRectangle(canvas, selected[0], { [field]: num });
        }
      },
      [selected],
    );

    const handleAddProgrammatic = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
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
    }, []);

    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar controls */}
        <Box
          sx={{
            width: 260,
            p: 2,
            borderRight: 1,
            borderColor: 'divider',
            overflow: 'auto',
          }}
        >
          <Stack spacing={3}>
            <div>
              <Typography variant="subtitle2" gutterBottom>
                Creation Mode
              </Typography>
              <ButtonGroup orientation="vertical" fullWidth size="small">
                <Button
                  variant={mode === 'select' ? 'contained' : 'outlined'}
                  onClick={() => activateMode('select')}
                >
                  Select
                </Button>
                <Button
                  variant={mode === 'click' ? 'contained' : 'outlined'}
                  onClick={() => activateMode('click')}
                >
                  Click to Place
                </Button>
                <Button
                  variant={mode === 'drag' ? 'contained' : 'outlined'}
                  onClick={() => activateMode('drag')}
                >
                  Drag to Draw
                </Button>
              </ButtonGroup>
            </div>

            <div>
              <Typography variant="subtitle2" gutterBottom>
                Viewport
              </Typography>
              <ButtonGroup fullWidth size="small" sx={{ mb: 1 }}>
                <Button
                  variant={viewportMode === 'select' ? 'contained' : 'outlined'}
                  onClick={() => handleViewportMode('select')}
                >
                  Select
                </Button>
                <Button
                  variant={viewportMode === 'pan' ? 'contained' : 'outlined'}
                  onClick={() => handleViewportMode('pan')}
                >
                  Pan
                </Button>
              </ButtonGroup>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Zoom: {Math.round(zoom * 100)}%
              </Typography>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={handleResetViewport}
              >
                Reset View
              </Button>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: 'block' }}
              >
                Scroll to zoom.{' '}
                {viewportMode === 'select'
                  ? 'Cmd/Ctrl+drag to pan.'
                  : 'Drag to pan.'}
              </Typography>
            </div>

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

            {selected.length > 0 && (
              <>
                <Typography variant="body2" color="text.secondary">
                  {selected.length} object{selected.length > 1 ? 's' : ''}{' '}
                  selected
                </Typography>

                {selected.length === 1 && (
                  <div>
                    <Typography variant="subtitle2" gutterBottom>
                      Edit Selected
                    </Typography>
                    <Stack spacing={1.5}>
                      <TextField
                        label="Left"
                        type="number"
                        size="small"
                        value={editValues.left}
                        onChange={(e) => handleEdit('left', e.target.value)}
                      />
                      <TextField
                        label="Top"
                        type="number"
                        size="small"
                        value={editValues.top}
                        onChange={(e) => handleEdit('top', e.target.value)}
                      />
                      <TextField
                        label="Width"
                        type="number"
                        size="small"
                        value={editValues.width}
                        onChange={(e) => handleEdit('width', e.target.value)}
                      />
                      <TextField
                        label="Height"
                        type="number"
                        size="small"
                        value={editValues.height}
                        onChange={(e) => handleEdit('height', e.target.value)}
                      />
                    </Stack>
                  </div>
                )}
              </>
            )}
          </Stack>
        </Box>

        {/* Canvas area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
          }}
        >
          <Canvas
            width={800}
            height={600}
            onReady={handleReady}
            style={{ border: '1px solid #ccc', background: '#fff' }}
          />
        </Box>
      </Box>
    );
  },
};

type PolygonMode = 'select' | 'click' | 'drag' | 'draw';

/**
 * Interactive demo for creating, editing, and deleting polygons.
 *
 * - **Select mode**: Click objects to select them, then edit.
 * - **Click-to-place mode**: Click anywhere to place a rectangular polygon.
 * - **Drag-to-draw mode**: Hold mouse and drag to draw a rectangular polygon.
 * - **Draw mode**: Click to place vertices one by one. Click near the first
 *   vertex (red dot) to close the polygon.
 */
export const PolygonDemo: Story = {
  render: function PolygonDemoRender() {
    const canvasRef = useRef<FabricCanvas | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    const vertexEditCleanupRef = useRef<(() => void) | null>(null);
    const viewportRef = useRef<ViewportController | null>(null);

    const [mode, setMode] = useState<PolygonMode>('select');
    const [viewportMode, setViewportMode] = useState<ViewportMode>('select');
    const [selected, setSelected] = useState<Polygon[]>([]);
    const [zoom, setZoom] = useState(1);
    const [editValues, setEditValues] = useState({ left: 0, top: 0 });
    const [isEditingVertices, setIsEditingVertices] = useState(false);

    const syncEditValues = useCallback((obj: FabricObject) => {
      setEditValues({
        left: Math.round(obj.left ?? 0),
        top: Math.round(obj.top ?? 0),
      });
    }, []);

    const handleReady = useCallback(
      (canvas: FabricCanvas) => {
        canvasRef.current = canvas;

        viewportRef.current = enablePanAndZoom(canvas);

        canvas.on('mouse:wheel', () => {
          setZoom(canvas.getZoom());
        });

        canvas.on('selection:created', (e) => {
          const objs = (e.selected ?? []) as Polygon[];
          setSelected(objs);
          if (objs.length === 1) {
            syncEditValues(objs[0]);
          }
        });

        canvas.on('selection:updated', (e) => {
          const objs = (e.selected ?? []) as Polygon[];
          setSelected(objs);
          if (objs.length === 1) {
            syncEditValues(objs[0]);
          }
        });

        canvas.on('selection:cleared', () => {
          setSelected([]);
        });

        canvas.on('object:modified', (e) => {
          if (e.target && selected.length === 1) {
            syncEditValues(e.target);
          }
        });

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
      },
      [syncEditValues],
    );

    const handleResetViewport = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      resetViewport(canvas);
      setZoom(1);
    }, []);

    const handleViewportMode = useCallback((newMode: ViewportMode) => {
      viewportRef.current?.setMode(newMode);
      setViewportMode(newMode);
    }, []);

    const activateMode = useCallback((newMode: PolygonMode) => {
      vertexEditCleanupRef.current?.();
      vertexEditCleanupRef.current = null;
      setIsEditingVertices(false);

      cleanupRef.current?.();
      cleanupRef.current = null;
      setMode(newMode);

      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }

      canvas.selection = newMode === 'select';
      canvas.forEachObject((obj) => {
        obj.selectable = newMode === 'select';
        obj.evented = newMode === 'select';
      });

      if (newMode === 'click') {
        cleanupRef.current = enablePolygonClickToCreate(
          canvas,
          {
            width: 100,
            height: 80,
            fill: 'rgba(33, 150, 243, 0.3)',
            stroke: '#2196f3',
            strokeWidth: 2,
          },
          () => {
            activateMode('select');
          },
        );
      }

      if (newMode === 'drag') {
        cleanupRef.current = enablePolygonDragToCreate(
          canvas,
          {
            fill: 'rgba(76, 175, 80, 0.3)',
            stroke: '#4caf50',
            strokeWidth: 2,
          },
          () => {
            activateMode('select');
          },
        );
      }

      if (newMode === 'draw') {
        cleanupRef.current = enablePolygonDrawToCreate(
          canvas,
          {
            fill: 'rgba(156, 39, 176, 0.3)',
            stroke: '#9c27b0',
            strokeWidth: 2,
          },
          () => {
            activateMode('select');
          },
        );
      }
    }, []);

    const handleEdit = useCallback(
      (field: keyof typeof editValues, value: string) => {
        const num = Number(value);
        if (isNaN(num)) {
          return;
        }

        setEditValues((prev) => ({ ...prev, [field]: num }));

        const canvas = canvasRef.current;
        if (canvas && selected.length === 1) {
          editPolygon(canvas, selected[0], { [field]: num });
        }
      },
      [selected],
    );

    const handleAddProgrammatic = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) {
        return;
      }
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
    }, []);

    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Sidebar controls */}
        <Box
          sx={{
            width: 260,
            p: 2,
            borderRight: 1,
            borderColor: 'divider',
            overflow: 'auto',
          }}
        >
          <Stack spacing={3}>
            <div>
              <Typography variant="subtitle2" gutterBottom>
                Creation Mode
              </Typography>
              <ButtonGroup orientation="vertical" fullWidth size="small">
                <Button
                  variant={mode === 'select' ? 'contained' : 'outlined'}
                  onClick={() => activateMode('select')}
                >
                  Select
                </Button>
                <Button
                  variant={mode === 'click' ? 'contained' : 'outlined'}
                  onClick={() => activateMode('click')}
                >
                  Click to Place
                </Button>
                <Button
                  variant={mode === 'drag' ? 'contained' : 'outlined'}
                  onClick={() => activateMode('drag')}
                >
                  Drag to Draw
                </Button>
                <Button
                  variant={mode === 'draw' ? 'contained' : 'outlined'}
                  onClick={() => activateMode('draw')}
                >
                  Draw Polygon
                </Button>
              </ButtonGroup>
            </div>

            <div>
              <Typography variant="subtitle2" gutterBottom>
                Viewport
              </Typography>
              <ButtonGroup fullWidth size="small" sx={{ mb: 1 }}>
                <Button
                  variant={viewportMode === 'select' ? 'contained' : 'outlined'}
                  onClick={() => handleViewportMode('select')}
                >
                  Select
                </Button>
                <Button
                  variant={viewportMode === 'pan' ? 'contained' : 'outlined'}
                  onClick={() => handleViewportMode('pan')}
                >
                  Pan
                </Button>
              </ButtonGroup>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Zoom: {Math.round(zoom * 100)}%
              </Typography>
              <Button
                variant="outlined"
                size="small"
                fullWidth
                onClick={handleResetViewport}
              >
                Reset View
              </Button>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: 'block' }}
              >
                Scroll to zoom.{' '}
                {viewportMode === 'select'
                  ? 'Cmd/Ctrl+drag to pan.'
                  : 'Drag to pan.'}
              </Typography>
            </div>

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

            {selected.length > 0 && (
              <>
                <Typography variant="body2" color="text.secondary">
                  {selected.length} object{selected.length > 1 ? 's' : ''}{' '}
                  selected
                </Typography>

                {selected.length === 1 && (
                  <div>
                    <Typography variant="subtitle2" gutterBottom>
                      Edit Selected
                    </Typography>
                    <Stack spacing={1.5}>
                      <TextField
                        label="Left"
                        type="number"
                        size="small"
                        value={editValues.left}
                        onChange={(e) => handleEdit('left', e.target.value)}
                      />
                      <TextField
                        label="Top"
                        type="number"
                        size="small"
                        value={editValues.top}
                        onChange={(e) => handleEdit('top', e.target.value)}
                      />
                    </Stack>
                  </div>
                )}
              </>
            )}
          </Stack>
        </Box>

        {/* Canvas area */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'grey.100',
          }}
        >
          <Canvas
            width={800}
            height={600}
            onReady={handleReady}
            style={{ border: '1px solid #ccc', background: '#fff' }}
          />
        </Box>
      </Box>
    );
  },
};
