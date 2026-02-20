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
  deleteObjects,
  enableClickToCreate,
  enableDragToCreate,
} from '@bwp-web/canvas';
import type { Canvas as FabricCanvas, Rect, FabricObject } from 'fabric';

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
 * - **Select mode**: Click objects to select them, then edit or delete.
 * - **Click-to-place mode**: Click anywhere on the canvas to place a 100x80 rectangle.
 * - **Drag-to-draw mode**: Hold mouse and drag to draw a rectangle.
 */
export const Demo: Story = {
  render: () => {
    const canvasRef = useRef<FabricCanvas | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);

    const [mode, setMode] = useState<Mode>('select');
    const [selected, setSelected] = useState<Rect | null>(null);
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

        canvas.on('selection:created', (e) => {
          const obj = e.selected?.[0];
          if (obj) {
            setSelected(obj as Rect);
            syncEditValues(obj);
          }
        });

        canvas.on('selection:updated', (e) => {
          const obj = e.selected?.[0];
          if (obj) {
            setSelected(obj as Rect);
            syncEditValues(obj);
          }
        });

        canvas.on('selection:cleared', () => {
          setSelected(null);
        });

        canvas.on('object:modified', (e) => {
          if (e.target) {
            syncEditValues(e.target);
          }
        });
      },
      [syncEditValues],
    );

    const activateMode = useCallback(
      (newMode: Mode) => {
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
      },
      [],
    );

    const handleEdit = useCallback(
      (field: keyof typeof editValues, value: string) => {
        const num = Number(value);
        if (isNaN(num)) {
          return;
        }

        setEditValues((prev) => ({ ...prev, [field]: num }));

        const canvas = canvasRef.current;
        if (canvas && selected) {
          editRectangle(canvas, selected, { [field]: num });
        }
      },
      [selected],
    );

    const handleDelete = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || !selected) {
        return;
      }
      deleteObjects(canvas, selected);
      setSelected(null);
    }, [selected]);

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

            {selected && (
              <>
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

                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  fullWidth
                  onClick={handleDelete}
                >
                  Delete Selected
                </Button>
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
