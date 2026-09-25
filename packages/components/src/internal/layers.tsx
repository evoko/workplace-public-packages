/**
 * Drawing a bespoke component's layers as Figma nests them, from its recipe's composition
 * (`solar<Name>Compose`): each layer as a glyph (an SVG of Figma's outline) where the recipe gives
 * it one, as a SOLAR icon or as text where the shell gives it one, and otherwise as a box. A layer its parent does
 * not lay out sits at the place the recipe gives it.
 *
 * Hand written and internal: the shells of StatusIndicator, Counter and the other drawn components
 * share it. A slot's layer carries the class `<prefix>-<slot>`, public, and every other layer
 * `<prefix>--<layer>`, internal (the codegen's util/classes.mjs), which the recipe styles and the
 * visual check finds; nothing here is a design value.
 */

import {
  cloneElement,
  Fragment,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react';

type Path = { d: string; evenOdd: boolean };
type Glyph = { width: number; height: number; fill: Path[]; stroke: Path[] };

/** What a shell's own element for a layer takes: the recipe's class and place, and its children. */
export interface DrawnLayer {
  className: string;
  style: CSSProperties | undefined;
  children: ReactNode[];
}

/** One layer's composition, as a generated `Solar<Name>Parts` holds it. */
export type LayerParts = Record<string, unknown>;

export interface LayerDrawing {
  /** The component's class prefix: `SolarStatusIndicator`. */
  prefix: string;
  /** Each slot's layer, by layer, to its slot's name: its class is public, `<prefix>-<slot>`. */
  slots?: Record<string, string>;
  /** Each layer's children, as Figma nests them. */
  tree: Record<string, string[]>;
  /** Each layer's composition in this variant, from the recipe. */
  parts: Record<string, LayerParts>;
  /** What each text layer says, by layer. */
  text?: Record<string, ReactNode>;
  /**
   * A text layer Figma repeats (the calendar's weekdays, the IR's `repeat`), by layer: drawn once
   * per item, each saying it, in the layer's class and place, as Figma draws its copies.
   */
  repeat?: Record<string, ReactNode[]>;
  /**
   * The caller's children of a layer, drawn in it in place of the ones Figma draws as examples
   * (Segmented Control's segments in its track), by layer.
   */
  content?: Record<string, ReactNode>;
  /**
   * A layer the shell draws as an element of its own, by layer (SplitButton's halves, two buttons):
   * given the class and place the recipe gives the layer, and its children drawn. A glyph keeps the
   * layer's class, its element given `<layer>Control` and the glyph's place, the glyph its child.
   */
  render?: Record<string, (layer: DrawnLayer) => ReactNode>;
  /** The SOLAR icon each icon layer draws, by layer (RowExpand's chevrons). */
  icons?: Record<
    string,
    ReactElement<{ className?: string; style?: CSSProperties }>
  >;
}

const isGlyph = (v: unknown): v is Glyph =>
  typeof v === 'object' && v !== null && 'fill' in v && 'stroke' in v;

const paths = (list: Path[], className: string, key: string) =>
  list.map((path, i) => (
    <path
      key={`${key}${i}`}
      className={className}
      d={path.d}
      fillRule={path.evenOdd ? 'evenodd' : 'nonzero'}
    />
  ));

/** The children of `name`, each drawn as this variant draws it. */
export function drawChildren(name: string, d: LayerDrawing): ReactNode[] {
  return (d.tree[name] ?? []).flatMap((child) =>
    d.repeat?.[child]
      ? d.repeat[child].map((item, i) => (
          <Fragment key={`${child}#${i}`}>
            {drawLayer(child, { ...d, text: { ...d.text, [child]: item } })}
          </Fragment>
        ))
      : [drawLayer(child, d)],
  );
}

/** One layer, drawn as Figma draws it in this variant, or nothing where it is hidden. */
export function drawLayer(name: string, d: LayerDrawing): ReactNode {
  const p = d.parts[name] ?? {};
  if (p.present === false) return null;
  // Figma measures a position from the parent's outer edge, CSS from inside its border, which the
  // recipe says on the parent (`--solar-placed-left`, `--solar-placed-top`); a layer pinned to its
  // parent's right or bottom (in a parent that grows) is placed from that edge.
  const from = (edge: string, at: unknown) =>
    typeof at === 'number'
      ? { [edge]: `calc(${at}px - var(--solar-placed-${edge}, 0px))` }
      : {};
  const place: CSSProperties | undefined =
    typeof p.x === 'number' || typeof p.right === 'number'
      ? {
          position: 'absolute',
          ...from('left', p.x),
          ...from('right', p.right),
          ...(typeof p.bottom === 'number'
            ? from('bottom', p.bottom)
            : from('top', typeof p.y === 'number' ? p.y : 0)),
        }
      : undefined;
  const className = d.slots?.[name]
    ? `${d.prefix}-${d.slots[name]}`
    : `${d.prefix}--${name}`;
  const own = d.render?.[name];
  if (isGlyph(p.glyph)) {
    const svg = (
      <svg
        key={name}
        className={`${className} ${d.prefix}-glyph`}
        viewBox={`0 0 ${p.glyph.width} ${p.glyph.height}`}
        // Drawn at its own size, as Figma draws it, where the recipe sizes it no other way (a glyph
        // placed by position); a size the recipe gives in CSS wins over these.
        width={p.glyph.width}
        height={p.glyph.height}
        style={own ? undefined : place}
        aria-hidden
      >
        {paths(p.glyph.fill, 'SolarGlyph-fill', 'f')}
        {paths(p.glyph.stroke, 'SolarGlyph-stroke', 's')}
      </svg>
    );
    // A glyph the shell makes a control (Image Card's More, a drawn mark): its element holds the
    // glyph, which keeps the layer's class, and sits where the glyph would.
    return own ? (
      <Fragment key={name}>
        {own({
          className: `${className}Control`,
          style: place,
          children: [svg],
        })}
      </Fragment>
    ) : (
      svg
    );
  }
  const icon = d.icons?.[name];
  // Marked as a drawn icon, by a class no layer is named (a layer named \`icon\`, ListItem's, would
  // otherwise style every icon of its component: its trailing one too).
  if (icon)
    return cloneElement(icon, {
      key: name,
      className: `${className} ${d.prefix}-drawnIcon`,
      style: place,
    });
  if (d.text && name in d.text)
    return (
      <span
        key={name}
        className={`${className} ${d.prefix}-text`}
        style={place}
      >
        {d.text[name]}
      </span>
    );
  if (own)
    return (
      <Fragment key={name}>
        {own({
          className: `${className} ${d.prefix}-box`,
          style: place,
          children: kids(name, d),
        })}
      </Fragment>
    );
  return (
    <span key={name} className={`${className} ${d.prefix}-box`} style={place}>
      {kids(name, d)}
    </span>
  );
}

/** A layer's children: the caller's where it gives them, and otherwise Figma's. */
const kids = (name: string, d: LayerDrawing): ReactNode[] =>
  d.content && name in d.content ? [d.content[name]] : drawChildren(name, d);
