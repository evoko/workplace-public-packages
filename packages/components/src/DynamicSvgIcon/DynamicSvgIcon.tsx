import { SvgIcon, Skeleton, Box } from '@mui/material';
import type { SvgIconProps } from '@mui/material';
import { useEffect, useState } from 'react';

interface SvgCacheEntry {
  innerContent: string;
  viewBox: string | null;
}

const svgCache = new Map<string, SvgCacheEntry>();

/** Clear the internal SVG fetch cache. Useful for testing or forcing a refetch. */
export function clearDynamicSvgIconCache() {
  svgCache.clear();
}

/**
 * Replace all fill/stroke attribute values (except "none" and "currentColor")
 * with "currentColor" so the SVG inherits its color from CSS.
 */
function applyCurrentColor(svg: string): string {
  return svg
    .replace(/fill="(?!none|currentColor)[^"]*"/g, 'fill="currentColor"')
    .replace(/stroke="(?!none|currentColor)[^"]*"/g, 'stroke="currentColor"');
}

export interface UseDynamicSvgIconOptions {
  /**
   * When `true`, all `fill` and `stroke` attribute values (except `"none"` and
   * `"currentColor"`) are replaced with `"currentColor"`.  This makes the SVG
   * fully themeable via the CSS `color` property or MUI's `sx={{ color }}`.
   *
   * @default false
   */
  replaceColors?: boolean;
  /** Called when the SVG loads successfully */
  onLoad?: () => void;
  /** Called when loading fails */
  onError?: (error: string) => void;
}

export interface UseDynamicSvgIconResult {
  /** Whether the SVG is currently being fetched */
  loading: boolean;
  /** Error message if fetching failed, null otherwise */
  error: string | null;
  /** The inner SVG content (paths, groups, etc.) */
  svgContent: string | null;
  /** The viewBox extracted from the source SVG */
  svgViewBox: string | null;
}

/**
 * Hook that fetches an SVG from a URL and returns the parsed content.
 * The SVG is rendered as-is by default. Pass `replaceColors: true` to replace
 * all fill/stroke colors with `currentColor` for full theming support.
 * Results are cached in-memory so subsequent renders with the same URL are instant.
 *
 * @param url - URL of the SVG to fetch (supports any URL that `fetch` can handle, including data URLs)
 * @param options - Optional callbacks for load/error events
 * @returns Object with `loading`, `error`, `svgContent`, and `svgViewBox` fields
 *
 * @example
 * ```tsx
 * const { loading, error, svgContent, svgViewBox } = useDynamicSvgIcon(
 *   'https://example.com/icon.svg',
 *   { onError: (msg) => console.warn(msg) },
 * );
 * ```
 */
export function useDynamicSvgIcon(
  url: string,
  options: UseDynamicSvgIconOptions = {},
): UseDynamicSvgIconResult {
  const { replaceColors = false, onLoad, onError } = options;

  const transform = replaceColors ? applyCurrentColor : (s: string) => s;

  const [svgContent, setSvgContent] = useState<string | null>(() => {
    const cached = svgCache.get(url);
    return cached ? transform(cached.innerContent) : null;
  });
  const [svgViewBox, setSvgViewBox] = useState<string | null>(() => {
    const cached = svgCache.get(url);
    return cached?.viewBox ?? null;
  });
  const [loading, setLoading] = useState(() => !svgCache.has(url));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      setError('No URL provided');
      setSvgContent(null);
      setSvgViewBox(null);
      return;
    }

    let cancelled = false;

    const cached = svgCache.get(url);
    if (cached) {
      setSvgContent(transform(cached.innerContent));
      setSvgViewBox(cached.viewBox);
      setLoading(false);
      setError(null);
      onLoad?.();
      return;
    }

    setLoading(true);
    setError(null);
    setSvgContent(null);
    setSvgViewBox(null);

    (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(
            `Failed to fetch SVG: ${response.status} ${response.statusText}`,
          );
        }

        const contentType = response.headers.get('content-type') ?? '';
        const text = await response.text();

        if (!text.includes('<svg') && !contentType.includes('svg')) {
          throw new Error('Response is not an SVG');
        }

        const viewBoxMatch = text.match(/viewBox="([^"]*)"/);
        const viewBox = viewBoxMatch ? viewBoxMatch[1] : null;

        const svgMatch = text.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
        const innerContent = svgMatch ? svgMatch[1] : text;

        svgCache.set(url, { innerContent, viewBox });

        if (!cancelled) {
          setSvgContent(transform(innerContent));
          setSvgViewBox(viewBox);
          setLoading(false);
          onLoad?.();
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load SVG';
          setError(message);
          setLoading(false);
          onError?.(message);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  return { loading, error, svgContent, svgViewBox };
}

const DEFAULT_SIZE = 24;

export interface DynamicSvgIconProps extends Omit<
  SvgIconProps,
  'children' | 'onLoad' | 'onError' | 'width' | 'height'
> {
  /** URL of the SVG to load */
  url: string;
  /** Fallback element shown when loading fails */
  fallback: React.ReactNode;
  /** Width in pixels — applied to icon, skeleton, and fallback (default: 24) */
  width?: number;
  /** Height in pixels — applied to icon, skeleton, and fallback (default: 24) */
  height?: number;
  /**
   * Replace all fill/stroke colors (except `"none"` and `"currentColor"`) with
   * `"currentColor"`, making the icon fully themeable via CSS `color`.
   * Set to `false` to preserve the SVG's original colors.
   *
   * @default false
   */
  replaceColors?: boolean;
  /** Skeleton shape shown during loading (default: 'circular') */
  skeletonVariant?: 'circular' | 'rectangular' | 'rounded';
  /** Skeleton animation type (default: 'pulse') */
  skeletonAnimation?: 'pulse' | 'wave' | false;
  /** Called when the SVG loads successfully */
  onLoad?: () => void;
  /** Called when loading fails */
  onError?: (error: string) => void;
}

/**
 * Renders an SVG icon fetched from a URL with a MUI Skeleton placeholder during
 * loading and a required fallback on error. The `width` and `height` props
 * control the dimensions of all three states (skeleton, icon, fallback).
 *
 * The SVG is rendered as-is — fill, stroke, and viewBox are preserved from the
 * source. Paths without an explicit fill will inherit `currentColor` from MUI
 * SvgIcon's CSS. Set `replaceColors` to force **all** fills and strokes to
 * `"currentColor"`, making the icon fully themeable via CSS `color`.
 *
 * Fetched SVGs are cached in-memory; the same URL will only be fetched once
 * per page session. Use {@link clearDynamicSvgIconCache} to force a refetch.
 *
 * @example
 * ```tsx
 * <DynamicSvgIcon
 *   url="https://example.com/icon.svg"
 *   width={32}
 *   height={32}
 *   fallback={<BrokenImageIcon />}
 *   onError={(msg) => console.warn(msg)}
 * />
 * ```
 */
export function DynamicSvgIcon({
  url,
  fallback,
  width = DEFAULT_SIZE,
  height = DEFAULT_SIZE,
  replaceColors,
  skeletonVariant = 'circular',
  skeletonAnimation = 'pulse',
  onLoad,
  onError,
  sx,
  ...svgIconProps
}: DynamicSvgIconProps) {
  const { loading, error, svgContent, svgViewBox } = useDynamicSvgIcon(url, {
    replaceColors,
    onLoad,
    onError,
  });

  if (loading) {
    return (
      <Skeleton
        variant={skeletonVariant}
        animation={skeletonAnimation}
        sx={{ width, height }}
      />
    );
  }

  if (error || !svgContent) {
    return (
      <Box
        sx={{
          width,
          height,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          flexShrink: 0,
          '& > svg, & > .MuiSvgIcon-root': {
            width: '100%',
            height: '100%',
          },
        }}
      >
        {fallback}
      </Box>
    );
  }

  return (
    <SvgIcon
      {...svgIconProps}
      {...(svgViewBox && { viewBox: svgViewBox })}
      sx={{
        ...(typeof sx === 'object' && sx !== null && !Array.isArray(sx)
          ? sx
          : undefined),
        width,
        height,
      }}
    >
      <g dangerouslySetInnerHTML={{ __html: svgContent }} />
    </SvgIcon>
  );
}
