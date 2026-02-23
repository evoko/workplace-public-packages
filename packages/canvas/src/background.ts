import { Canvas as FabricCanvas, FabricImage, filters } from 'fabric';

// ─── Viewport fitting ────────────────────────────────────────────────────────

export interface FitViewportOptions {
  /**
   * Fraction of the canvas to leave as empty margin around the image.
   * Default: 0.05 (5% on each side).
   */
  padding?: number;
}

/**
 * Adjust the canvas viewport transform so the background image fills the
 * canvas with an optional padding margin.
 *
 * Does nothing if no background image is set.
 */
export function fitViewportToBackground(
  canvas: FabricCanvas,
  options?: FitViewportOptions,
): void {
  const bg = canvas.backgroundImage as FabricImage | undefined;
  if (!bg) return;

  const bgWidth = bg.width;
  const bgHeight = bg.height;
  if (!bgWidth || !bgHeight) return;

  const padding = options?.padding ?? 0.05;
  const availableWidth = canvas.getWidth() * (1 - padding * 2);
  const availableHeight = canvas.getHeight() * (1 - padding * 2);

  const scale = Math.min(availableWidth / bgWidth, availableHeight / bgHeight);

  const scaledW = bgWidth * scale;
  const scaledH = bgHeight * scale;
  const offsetX = (canvas.getWidth() - scaledW) / 2;
  const offsetY = (canvas.getHeight() - scaledH) / 2;

  canvas.setViewportTransform([scale, 0, 0, scale, offsetX, offsetY]);
  canvas.requestRenderAll();
}

// ─── Opacity ─────────────────────────────────────────────────────────────────

/**
 * Set the opacity of the canvas background image.
 * Value is clamped to the 0–1 range.
 */
export function setBackgroundOpacity(
  canvas: FabricCanvas,
  opacity: number,
): void {
  const bg = canvas.backgroundImage as FabricImage | undefined;
  if (!bg) return;
  bg.set('opacity', Math.min(1, Math.max(0, opacity)));
  canvas.requestRenderAll();
}

/**
 * Get the current opacity of the canvas background image.
 * Returns 1 if no background image is set.
 */
export function getBackgroundOpacity(canvas: FabricCanvas): number {
  const bg = canvas.backgroundImage as FabricImage | undefined;
  return bg?.opacity ?? 1;
}

// ─── Invert filter ───────────────────────────────────────────────────────────

/**
 * Add or remove the Invert filter from the canvas background image.
 */
export function setBackgroundInverted(
  canvas: FabricCanvas,
  inverted: boolean,
): void {
  const bg = canvas.backgroundImage as FabricImage | undefined;
  if (!bg) return;

  const currentFilters: filters.BaseFilter<string>[] = bg.filters ?? [];
  const hasInvert = currentFilters.some((f) => f instanceof filters.Invert);

  if (inverted && !hasInvert) {
    bg.filters = [...currentFilters, new filters.Invert()];
    bg.applyFilters();
  } else if (!inverted && hasInvert) {
    bg.filters = currentFilters.filter((f) => !(f instanceof filters.Invert));
    bg.applyFilters();
  }

  canvas.requestRenderAll();
}

/**
 * Returns whether the canvas background image currently has an Invert filter.
 */
export function getBackgroundInverted(canvas: FabricCanvas): boolean {
  const bg = canvas.backgroundImage as FabricImage | undefined;
  if (!bg?.filters) return false;
  return bg.filters.some((f) => f instanceof filters.Invert);
}

// ─── Image resizing ───────────────────────────────────────────────────────────

export interface ResizeResult {
  /** The (possibly new) image URL. Same as input URL if no resize was needed. */
  url: string;
  /** Final image width in pixels. */
  width: number;
  /** Final image height in pixels. */
  height: number;
  /** Whether the image was actually downscaled. */
  wasResized: boolean;
}

export interface ResizeImageOptions {
  /**
   * Maximum dimension (width or height) in pixels.
   * Images larger than this are downscaled while maintaining aspect ratio.
   * Default: 4096.
   */
  maxSize?: number;
  /**
   * Minimum dimension (width or height) in pixels.
   * Images smaller than this are rejected with an error.
   * Default: 480.
   */
  minSize?: number;
}

/**
 * Load an image from a URL and downscale it if either dimension exceeds
 * `maxSize`. The resulting image is returned as a new blob URL (PNG).
 *
 * Rejects if the image fails to load, or if both dimensions are smaller
 * than `minSize`.
 *
 * @example
 * ```ts
 * const result = await resizeImageUrl(uploadedUrl, { maxSize: 4096 });
 * await canvas.setBackgroundImage(new FabricImage(result.url), canvas.renderAll.bind(canvas));
 * ```
 */
export function resizeImageUrl(
  url: string,
  options?: ResizeImageOptions,
): Promise<ResizeResult> {
  const maxSize = options?.maxSize ?? 4096;
  const minSize = options?.minSize ?? 480;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;

      if (w < minSize && h < minSize) {
        reject(
          new Error(
            `Image is too small (${w}×${h}). Minimum size is ${minSize}px on either dimension.`,
          ),
        );
        return;
      }

      const needsResize = w > maxSize || h > maxSize;
      if (!needsResize) {
        resolve({ url, width: w, height: h, wasResized: false });
        return;
      }

      const scale = Math.min(maxSize / w, maxSize / h);
      const newW = Math.round(w * scale);
      const newH = Math.round(h * scale);

      const offscreen = new OffscreenCanvas(newW, newH);
      const ctx = offscreen.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get 2D context for image resize.'));
        return;
      }
      ctx.drawImage(img, 0, 0, newW, newH);

      offscreen.convertToBlob({ type: 'image/png' }).then((blob) => {
        resolve({
          url: URL.createObjectURL(blob),
          width: newW,
          height: newH,
          wasResized: true,
        });
      }, reject);
    };

    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

// ─── Background image loading helper ─────────────────────────────────────────

/**
 * Set an image URL as the canvas background image.
 * Returns the created FabricImage for further manipulation.
 */
export async function setBackgroundImage(
  canvas: FabricCanvas,
  url: string,
): Promise<FabricImage> {
  const img = await FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
  canvas.backgroundImage = img;
  canvas.requestRenderAll();
  return img;
}
