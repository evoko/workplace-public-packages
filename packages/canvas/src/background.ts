import { Canvas as FabricCanvas, FabricImage, filters } from 'fabric';
import {
  DEFAULT_VIEWPORT_PADDING,
  DEFAULT_IMAGE_MAX_SIZE,
  DEFAULT_IMAGE_MIN_SIZE,
} from './constants';

function getBackgroundImage(canvas: FabricCanvas): FabricImage | undefined {
  return canvas.backgroundImage as FabricImage | undefined;
}

/**
 * Get the source URL of the canvas background image, or `null` if no
 * background image is set.
 */
export function getBackgroundSrc(canvas: FabricCanvas): string | null {
  const bg = getBackgroundImage(canvas);
  if (!bg) return null;
  return bg.getSrc() || null;
}

// --- Viewport fitting ---

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
  const bg = getBackgroundImage(canvas);
  if (!bg) return;

  // Use scaled dimensions so any scaleX/scaleY on the image is respected.
  const bgWidth = bg.getScaledWidth();
  const bgHeight = bg.getScaledHeight();
  if (!bgWidth || !bgHeight) return;

  // getCenterPoint() returns the geometric centre of the object in canvas space,
  // reliably regardless of how left/top are stored in this Fabric version.
  // The actual top-left corner is always centre − half-size.
  const center = bg.getCenterPoint();
  const imgLeft = center.x - bgWidth / 2;
  const imgTop = center.y - bgHeight / 2;

  const padding = options?.padding ?? DEFAULT_VIEWPORT_PADDING;
  const canvasWidth = canvas.getWidth();
  const canvasHeight = canvas.getHeight();
  const availableWidth = canvasWidth * (1 - padding * 2);
  const availableHeight = canvasHeight * (1 - padding * 2);

  const scale = Math.min(availableWidth / bgWidth, availableHeight / bgHeight);

  const scaledW = bgWidth * scale;
  const scaledH = bgHeight * scale;

  // Shift so the image's top-left maps to the padded centre of the viewport.
  const offsetX = (canvasWidth - scaledW) / 2 - imgLeft * scale;
  const offsetY = (canvasHeight - scaledH) / 2 - imgTop * scale;

  canvas.setViewportTransform([scale, 0, 0, scale, offsetX, offsetY]);
  canvas.requestRenderAll();
}

// --- Contrast ---

/**
 * Set the contrast of the canvas background image.
 *
 * Value is expressed as a 0–2 scale:
 * - **0**: minimum contrast (flat grey).
 * - **1**: normal / unmodified (no filter applied).
 * - **2**: maximum contrast (darks are truly dark, lights truly light).
 *
 * Clamped to the 0–2 range.
 */
export function setBackgroundContrast(
  canvas: FabricCanvas,
  value: number,
): void {
  const bg = getBackgroundImage(canvas);
  if (!bg) return;

  // Map 0–2 scale to Fabric Contrast range -1..+1 (0 = normal)
  const contrast = Math.min(Math.max(value, 0), 2) - 1;

  const currentFilters: filters.BaseFilter<string>[] = bg.filters ?? [];
  const contrastIdx = currentFilters.findIndex(
    (f) => f instanceof filters.Contrast,
  );

  if (contrast === 0) {
    // Normal — remove filter if present
    if (contrastIdx >= 0) {
      bg.filters = currentFilters.filter(
        (f) => !(f instanceof filters.Contrast),
      );
      bg.applyFilters();
    }
  } else if (contrastIdx >= 0) {
    (currentFilters[contrastIdx] as filters.Contrast).contrast = contrast;
    bg.applyFilters();
  } else {
    bg.filters = [...currentFilters, new filters.Contrast({ contrast })];
    bg.applyFilters();
  }

  canvas.requestRenderAll();
}

/**
 * Get the current contrast of the canvas background image.
 *
 * Returns a value in the 0–2 range where 1 is normal (no filter).
 * Returns 1 if no background image is set.
 */
export function getBackgroundContrast(canvas: FabricCanvas): number {
  const bg = getBackgroundImage(canvas);
  if (!bg) return 1;

  const contrastFilter = bg.filters?.find(
    (f) => f instanceof filters.Contrast,
  ) as filters.Contrast | undefined;

  // Map Fabric -1..+1 back to 0..2 scale
  return 1 + (contrastFilter?.contrast ?? 0);
}

// --- Invert filter ---

/**
 * Add or remove the Invert filter from the canvas background image.
 */
export function setBackgroundInverted(
  canvas: FabricCanvas,
  inverted: boolean,
): void {
  const bg = getBackgroundImage(canvas);
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
  const bg = getBackgroundImage(canvas);
  if (!bg?.filters) return false;
  return bg.filters.some((f) => f instanceof filters.Invert);
}

// --- Image resizing ---

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
  const maxSize = options?.maxSize ?? DEFAULT_IMAGE_MAX_SIZE;
  const minSize = options?.minSize ?? DEFAULT_IMAGE_MIN_SIZE;

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

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = newW;
      tempCanvas.height = newH;
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get 2D context for image resize.'));
        return;
      }
      ctx.drawImage(img, 0, 0, newW, newH);
      resolve({
        url: tempCanvas.toDataURL('image/png'),
        width: newW,
        height: newH,
        wasResized: true,
      });
    };

    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

// --- Background image loading helper ---

export interface SetBackgroundImageOptions extends ResizeImageOptions {
  /** Preserve the current background contrast when replacing the image. */
  preserveContrast?: boolean;
}

/**
 * Set an image URL as the canvas background image.
 *
 * Pass options to control auto-resize (`maxSize`, `minSize`) and/or
 * preserve the current background contrast when replacing the image.
 * Omit to load the URL as-is without resizing.
 *
 * Returns the created FabricImage for further manipulation.
 */
export async function setBackgroundImage(
  canvas: FabricCanvas,
  url: string,
  options?: SetBackgroundImageOptions,
): Promise<FabricImage> {
  const prevContrast = options?.preserveContrast
    ? getBackgroundContrast(canvas)
    : undefined;

  let imageUrl = url;
  const hasResizeOptions =
    options?.maxSize !== undefined || options?.minSize !== undefined;
  if (hasResizeOptions) {
    const result = await resizeImageUrl(url, options);
    imageUrl = result.url;
  }
  const img = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
  canvas.backgroundImage = img;

  if (prevContrast !== undefined && prevContrast !== 1) {
    setBackgroundContrast(canvas, prevContrast);
  }

  canvas.requestRenderAll();
  return img;
}
