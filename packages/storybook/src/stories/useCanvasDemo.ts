import { useCallback, useRef, useState } from 'react';
import {
  enablePanAndZoom,
  resetViewport,
  type ViewportController,
  type ViewportMode,
} from '@bwp-web/canvas';
import type { Canvas as FabricCanvas, FabricObject } from 'fabric';

export type ModeActivator<TMode extends string> = (ctx: {
  canvas: FabricCanvas;
  viewport: ViewportController | undefined;
  activateMode: (mode: TMode) => void;
}) => (() => void) | null;

export interface UseCanvasDemoConfig<TMode extends string> {
  defaultMode: TMode;
  editFields: string[];
  modeActivators: Record<TMode, ModeActivator<TMode>>;
  onReady?: (canvas: FabricCanvas) => void;
}

export function useCanvasDemo<TMode extends string>(
  config: UseCanvasDemoConfig<TMode>,
) {
  const canvasRef = useRef<FabricCanvas | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const viewportRef = useRef<ViewportController | null>(null);

  const [mode, setMode] = useState<TMode>(config.defaultMode);
  const [viewportMode, setViewportMode] = useState<ViewportMode>('select');
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState<FabricObject[]>([]);
  const [editValues, setEditValues] = useState<Record<string, number>>(() =>
    Object.fromEntries(config.editFields.map((f) => [f, 0])),
  );

  const syncEditValues = useCallback(
    (obj: FabricObject) => {
      setEditValues(
        Object.fromEntries(
          config.editFields.map((f) => [
            f,
            Math.round((obj as unknown as Record<string, number>)[f] ?? 0),
          ]),
        ),
      );
    },
    [config.editFields],
  );

  const activateMode = useCallback(
    (newMode: TMode) => {
      cleanupRef.current?.();
      cleanupRef.current = null;
      setMode(newMode);
      setViewportMode('select');

      const canvas = canvasRef.current;
      if (!canvas) return;

      const viewport = viewportRef.current ?? undefined;

      canvas.selection = newMode === config.defaultMode;
      canvas.forEachObject((obj) => {
        obj.selectable = newMode === config.defaultMode;
        obj.evented = newMode === config.defaultMode;
      });

      const activator = config.modeActivators[newMode];
      if (activator) {
        cleanupRef.current =
          activator({ canvas, viewport, activateMode }) ?? null;
      }
    },
    [config.defaultMode, config.modeActivators],
  );

  const handleReady = useCallback(
    (canvas: FabricCanvas) => {
      canvasRef.current = canvas;
      viewportRef.current = enablePanAndZoom(canvas);

      canvas.on('mouse:wheel', () => {
        setZoom(canvas.getZoom());
      });

      canvas.on('selection:created', (e) => {
        const objs = e.selected ?? [];
        setSelected(objs);
        if (objs.length === 1) syncEditValues(objs[0]);
      });

      canvas.on('selection:updated', (e) => {
        const objs = e.selected ?? [];
        setSelected(objs);
        if (objs.length === 1) syncEditValues(objs[0]);
      });

      canvas.on('selection:cleared', () => {
        setSelected([]);
      });

      canvas.on('object:modified', (e) => {
        if (e.target) syncEditValues(e.target);
      });

      config.onReady?.(canvas);
    },
    [syncEditValues, config.onReady],
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

  return {
    canvasRef,
    viewportRef,
    mode,
    viewportMode,
    zoom,
    selected,
    editValues,
    setEditValues,
    activateMode,
    handleReady,
    handleResetViewport,
    handleViewportMode,
  };
}
