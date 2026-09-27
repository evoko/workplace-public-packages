/**
 * The Inspect dialog's preview (InspectDialog.tsx): the variant in view drawn large (scaled to fit
 * its pane), by the renderer the Variants page draws its tiles with (solar.tsx `VariantStage`),
 * the selected layer outlined, and a click on a part of it choosing that part's layer. While the
 * service regenerates the component, it says so.
 *
 * The component is drawn inert: it takes no pointer, focus or keys (a hover would redraw it in
 * another state than the one in view), so a click lands on the stage around it, which finds the
 * deepest element of the component under the pointer by its box and asks pick.ts `layerAt` which
 * layer that is. The outline is an element of its own over the layer's element (found as pick.ts
 * `layerElement` finds it: by the recipe's selector, the root by the component's own element), its
 * border box the layer's box, measured again whenever the stage or the component changes (a resize,
 * a regeneration). A layer the preview has no element for is named under it instead.
 */

import Typography from '@mui/material/Typography';
import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import type { StageProps } from '../variant-stage.js';
import type { Inspection } from './client.js';
import { layerAt, layerElement } from './pick.js';

/** Draws the component's oracle variant `index` in an element with the stage's props. */
export type DrawVariant = (index: number, stage: StageProps) => ReactNode;

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** The deepest element under (x, y), from `el` down, by the boxes of its children, last on top. */
function deepestAt(el: Element, x: number, y: number): Element {
  const children = [...el.children].reverse();
  for (const child of children) {
    const r = child.getBoundingClientRect();
    if (
      r.width > 0 &&
      r.height > 0 &&
      x >= r.left &&
      x <= r.right &&
      y >= r.top &&
      y <= r.bottom
    )
      return deepestAt(child, x, y);
  }
  return el;
}

const same = (a: Box | null, b: Box | null) =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.left === b.left &&
    a.top === b.top &&
    a.width === b.width &&
    a.height === b.height);

/** How far the preview enlarges a small component, at most. */
const MOST = 4;

export function Preview({
  inspection,
  layer,
  drawVariant,
  regenerating,
  onPoint,
}: {
  inspection: Inspection;
  /** The layer selected, which the outline sits on. */
  layer: string;
  drawVariant: DrawVariant;
  /** An action runs: the component is being regenerated. */
  regenerating: boolean;
  /** A click on a part of the component: its layer. Not given where the dialog is read-only. */
  onPoint?: (layer: string) => void;
}) {
  const area = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const selected = useMemo(
    () =>
      inspection.layers.find((l) => l.name === layer) ?? {
        name: layer,
        className: null,
      },
    [inspection, layer],
  );

  // The component scaled to fit the pane, and the outline over the layer's element, measured after
  // the scaling, both again on every change of the pane or of the component in it.
  useLayoutEffect(() => {
    const around = area.current;
    const drawn = stage.current;
    if (!around || !drawn) return undefined;
    const find = () => {
      const root = drawn.firstElementChild;
      return root ? layerElement(root, selected) : null;
    };
    const fit = () => {
      const cs = getComputedStyle(around);
      const width =
        around.clientWidth -
        parseFloat(cs.paddingLeft) -
        parseFloat(cs.paddingRight);
      const height =
        around.clientHeight -
        parseFloat(cs.paddingTop) -
        parseFloat(cs.paddingBottom);
      const own = [drawn.offsetWidth, drawn.offsetHeight];
      if (!own[0] || !own[1] || width <= 0 || height <= 0) return;
      const scale = Math.min(MOST, width / own[0], height / own[1]);
      const transform = `scale(${scale})`;
      if (drawn.style.transform !== transform)
        drawn.style.transform = transform;
    };
    const measure = () => {
      fit();
      const el = find();
      const r = el?.getBoundingClientRect();
      if (!r || !r.width || !r.height) {
        setBox((b) => (b === null ? b : null));
        return;
      }
      const o = around.getBoundingClientRect();
      const next = {
        left: r.left - o.left - around.clientLeft + around.scrollLeft,
        top: r.top - o.top - around.clientTop + around.scrollTop,
        width: r.width,
        height: r.height,
      };
      setBox((b) => (same(b, next) ? b : next));
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(around);
    resize.observe(drawn);
    const el = find();
    if (el) resize.observe(el);
    const mutation = new MutationObserver(measure);
    mutation.observe(drawn, {
      subtree: true,
      childList: true,
      attributes: true,
      characterData: true,
    });
    window.addEventListener('resize', measure);
    return () => {
      resize.disconnect();
      mutation.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [selected]);

  const point = (event: MouseEvent<HTMLDivElement>) => {
    const drawn = stage.current;
    const root = drawn?.firstElementChild;
    if (!onPoint || !drawn || !root) return;
    event.preventDefault();
    const target = deepestAt(drawn, event.clientX, event.clientY);
    onPoint(layerAt(target, root, inspection.layers));
  };
  const hidden = inspection.layers.find((l) => l.name === layer)?.hidden;

  return (
    <div style={column}>
      {/* A pointer's alternative: the tree beside it selects every layer the preview does. */}
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div ref={area} style={surface} onClick={point}>
        {drawVariant(inspection.variant, {
          ref: stage,
          inert: true,
          'aria-label': 'Preview',
          style: drawnStyle,
        })}
        {box && (
          <div
            aria-label="Selected layer outline"
            style={{ ...outline, ...box }}
          />
        )}
      </div>
      {regenerating && (
        <Typography variant="bodyXsRegular" aria-live="polite" style={primary}>
          Regenerating…
        </Typography>
      )}
      <Typography variant="bodyXsRegular" style={secondary}>
        {layer}
        {hidden
          ? ' · not drawn in this variant'
          : box
            ? ''
            : ' · not found in the preview'}
      </Typography>
    </div>
  );
}

const column = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 'var(--solar-stack-xs)',
  minHeight: 0,
  flex: 1,
};
const surface = {
  position: 'relative' as const,
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 'var(--solar-inset-lg)',
  overflow: 'auto',
  background: 'var(--solar-color-surface-background)',
  borderRadius: 'var(--solar-radius-container)',
};
const drawnStyle = { display: 'flex' };
const outline = {
  position: 'absolute' as const,
  boxSizing: 'border-box' as const,
  border:
    'var(--solar-border-strong) solid var(--solar-color-border-feedback-focus-strong)',
  pointerEvents: 'none' as const,
};
const primary = { color: 'var(--solar-color-text-primary)' };
const secondary = { color: 'var(--solar-color-text-secondary)' };
