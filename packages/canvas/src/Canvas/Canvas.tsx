import { Canvas as FabricCanvas } from 'fabric';
import { CSSProperties, useEffect, useRef } from 'react';

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

    return () => {
      fabricCanvas.dispose();
    };
    // onReady is intentionally excluded — we only want to initialise once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={style}
    />
  );
}
