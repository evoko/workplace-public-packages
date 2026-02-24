import { Canvas as FabricCanvas } from 'fabric';
import { CSSProperties, useEffect, useRef } from 'react';
import { enableKeyboardShortcuts } from '../keyboard';

export interface CanvasProps {
  width?: number;
  height?: number;
  className?: string;
  style?: CSSProperties;
  onReady?: (canvas: FabricCanvas) => void;
}

export function Canvas({
  width = 800,
  height = 600,
  className,
  style,
  onReady,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvasRef.current;
    if (!el) {
      return;
    }

    const fabricCanvas = new FabricCanvas(el, { width, height });
    onReady?.(fabricCanvas);

    const cleanupShortcuts = enableKeyboardShortcuts(fabricCanvas);

    return () => {
      cleanupShortcuts();
      fabricCanvas.dispose();
    };
    // onReady is intentionally excluded — we only want to initialise once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={className} style={style}>
      <canvas ref={canvasRef} />
    </div>
  );
}
