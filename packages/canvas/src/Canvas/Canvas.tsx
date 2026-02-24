import { Canvas as FabricCanvas } from 'fabric';
import { type CSSProperties, useEffect, useRef } from 'react';
import { enableKeyboardShortcuts } from '../keyboard';

export interface CanvasProps {
  /**
   * Canvas width in pixels. When both `width` and `height` are provided,
   * the canvas uses fixed dimensions. When omitted, the canvas auto-fills
   * its parent container and resizes with it.
   */
  width?: number;
  /**
   * Canvas height in pixels. When both `width` and `height` are provided,
   * the canvas uses fixed dimensions. When omitted, the canvas auto-fills
   * its parent container and resizes with it.
   */
  height?: number;
  className?: string;
  style?: CSSProperties;
  onReady?: (canvas: FabricCanvas) => void;
}

export function Canvas({
  width,
  height,
  className,
  style,
  onReady,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isFixedSize = width !== undefined && height !== undefined;

  useEffect(() => {
    const el = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!el || !wrapper) return;

    const initialWidth = isFixedSize ? width : wrapper.clientWidth || 800;
    const initialHeight = isFixedSize ? height : wrapper.clientHeight || 600;

    const fabricCanvas = new FabricCanvas(el, {
      width: initialWidth,
      height: initialHeight,
    });

    onReady?.(fabricCanvas);

    const cleanupShortcuts = enableKeyboardShortcuts(fabricCanvas);

    let observer: ResizeObserver | undefined;
    let rafId = 0;

    if (!isFixedSize) {
      let currentWidth = initialWidth;
      let currentHeight = initialHeight;

      observer = new ResizeObserver((entries) => {
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const entry = entries[0];
          if (!entry) return;
          const { width: newWidth, height: newHeight } = entry.contentRect;
          if (
            newWidth > 0 &&
            newHeight > 0 &&
            (newWidth !== currentWidth || newHeight !== currentHeight)
          ) {
            currentWidth = newWidth;
            currentHeight = newHeight;
            fabricCanvas.setDimensions({ width: newWidth, height: newHeight });
          }
        });
      });
      observer.observe(wrapper);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer?.disconnect();
      cleanupShortcuts();
      fabricCanvas.dispose();
    };
    // onReady is intentionally excluded — we only want to initialise once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const wrapperStyle: CSSProperties = isFixedSize
    ? { ...style }
    : { width: '100%', height: '100%', ...style };

  return (
    <div ref={wrapperRef} className={className} style={wrapperStyle}>
      <canvas ref={canvasRef} />
    </div>
  );
}
