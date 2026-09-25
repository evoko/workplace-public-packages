/**
 * Emits a component's recipe for MUI: plain style data keyed the way `styleOverrides` and `sx`
 * read it, plus the prop types, importing nothing from MUI -- exactly as the token theme does.
 *
 * Every value is a `var(--solar-…)` reference into tokens.css, never a resolved value, so the one
 * stylesheet is the runtime source: a `[data-theme='dark']` subtree re-themes the component with no
 * JavaScript. The only exceptions are CSS keywords (`transparent`, `none`, `center`), letter
 * spacing derived from a text style token, and the literals the overlay explicitly allowed.
 *
 * What is MUI-specific lives here and nowhere else: which element of the MUI control each IR layer
 * is (`MUI_SLOTS`), and which class MUI sets for each state (`STATE_SELECTORS`), per component.
 */

import { join } from 'node:path';
import { flattenSpec, recipeAxes } from '../spec.mjs';
import { pascal } from '../util/naming.mjs';
import { packagesDir } from '../util/paths.mjs';
import { writeGenerated } from '../util/write.mjs';
import { BOOLEAN_STATES } from '../normalize/component-layers.mjs';
import { PLACES } from '../normalize/recipe.mjs';
import { canonical, letterSpacingEm } from './manifest.mjs';
import { cssTextFeatures, featuresOf } from './text-features.mjs';
import { table as descriptorTable } from '../components/index.mjs';

const OUT_DIR = join(
  packagesDir,
  'styles',
  'src',
  'generated',
  'mui',
  'components',
);

/**
 * Where each IR layer of a component lives in MUI's DOM. `&` is the root element; MUI renders
 * the label text in the root, and the icons and spinner in its own named slots. A layer the IR
 * has and this table does not is an error, so a new Figma layer cannot go unstyled unnoticed.
 */
export const MUI_SLOTS = descriptorTable('mui', 'slots');

/**
 * A component's slot table: its descriptor's, or, for a drawn component (`slots: 'drawn'`), every
 * IR layer as the element the shell draws it as, with a class of its own (`& .SolarCounter-value`),
 * and the root as the component's own element. Read from the IR, so a drawing of 57 layers
 * (StatusIndicator's nine) lists none of them by hand.
 */
export function slotsOf(spec) {
  const slots = MUI_SLOTS[spec.component];
  if (slots !== 'drawn') return slots;
  return Object.fromEntries(
    Object.keys(spec.layers).map((l) => [
      l,
      l === 'root' ? '&' : `& .Solar${pascal(spec.component)}-${l}`,
    ]),
  );
}

/**
 * Layers MUI draws as SVG shapes, where Figma's stroke is `stroke` and `stroke-width`, not a CSS
 * border, and a fill is `fill`.
 */
export const MUI_SVG_LAYERS = descriptorTable('mui', 'svgLayers');

/**
 * MUI's own defaults that would otherwise show through the recipe. These are MUI knowledge, like
 * the slot table, so they live here and regenerate, rather than being copied into every shell's
 * template. Each undoes something MUI draws that SOLAR does not: Button's 64px minimum width (SOLAR
 * buttons hug their label), its upper-case label (SOLAR labels are sentence case, and MUI's
 * default theme upper-cases them), the margins MUI puts around the icons (SOLAR spaces them with
 * the gap), and MUI's icon font size (the SOLAR icon fills its slot, which the recipe sizes). So a
 * component looks right whether or not the app installed the SOLAR MUI theme.
 */
export const MUI_RESETS = descriptorTable('mui', 'resets');

/**
 * The selector each component's MUI control is in for each state, keyed like `MUI_SLOTS`. Platform
 * states are pseudo-classes or the class MUI sets for them; a state that is a prop (`disabled`,
 * `loading`, and Text Input's `error`) is the class MUI sets for the prop, or, where MUI has none,
 * one the shell sets (`&.Solar<Name>-<state>`), as it does for the counter. Order matters: at equal
 * specificity the later rule wins, so the stronger state comes later, as `BOOLEAN_STATES` orders
 * them, and Flutter resolves them in the same order reversed (`statePrecedence`). A component with
 * no table has no states; a state the IR keys an entry by and the table lacks is an error, so none
 * can go unstyled.
 */
export const STATE_SELECTORS = descriptorTable('mui', 'states');

/** One component's state table: `{ default: null }` for a component with no states. */
export function stateSelectors(component) {
  const table = STATE_SELECTORS[component] ?? { default: null };
  // The states the fold knows must keep its order, which is the order a platform resolves two at
  // once; a table that put hover after disabled would let hover win.
  const known = Object.keys(table).filter((s) => BOOLEAN_STATES.includes(s));
  const want = BOOLEAN_STATES.filter((s) => known.includes(s)).reverse();
  if (known.join() !== want.join())
    throw new Error(
      `${component}: states must be ordered ${want.join(', ')}, weakest first, not ${known.join(', ')}`,
    );
  return table;
}

const ALIGN = {
  MIN: 'flex-start',
  CENTER: 'center',
  MAX: 'flex-end',
  SPACE_BETWEEN: 'space-between',
  BASELINE: 'baseline',
};
const DIRECTION = { HORIZONTAL: 'row', VERTICAL: 'column' };

const cssVar = (token) => `var(--solar-${token.replaceAll('.', '-')})`;

/** Cells that decide composition rather than style; the shell reads them, not CSS. */
const COMPOSITION = (cell) =>
  cell === 'present' ||
  cell === 'component' ||
  cell === 'image' ||
  cell === 'glyph' ||
  cell.startsWith('variant.');

const PLACED = (cell) => PLACES.includes(cell);

/** Figma layers whose outline Figma records with their corners already rounded. */
const VECTORS = new Set([
  'VECTOR',
  'BOOLEAN_OPERATION',
  'STAR',
  'POLYGON',
  'LINE',
]);

/** Every entry of one layer's style, whatever its section. */
const entriesOf = (style) => [
  style.base,
  ...Object.values(style.size ?? {}),
  ...Object.values(style.appearance ?? {}).flatMap(Object.values),
  ...Object.values(style.combined ?? {}).flatMap((c) =>
    Object.values(c).flatMap(Object.values),
  ),
];

/** Whether a layer is drawn by its outline, a glyph, in any entry: then its place is the drawing's. */
function drawn(style) {
  return entriesOf(style).some((e) => e?.glyph);
}

/**
 * Whether the base's cells are a glyph's: where the base draws one, or where it draws the layer
 * not at all and every entry that shows it draws a glyph (Checkbox's tick, only in a checked box),
 * so its unchanging cells (no stroke) are the glyph's.
 */
function baseGlyph(style) {
  if (!style?.base) return false;
  if (style.base.glyph) return Boolean(style.base.glyph.glyph);
  if (style.base.present?.value !== false) return false;
  const shown = entriesOf(style)
    .slice(1)
    .filter((e) => e?.present?.value === true);
  return shown.length > 0 && shown.every((e) => e.glyph?.glyph);
}

function context(spec, tokens) {
  const all = flattenSpec(tokens);
  const byName = new Map(all.map((t) => [t.name, t]));
  const vars = new Set(
    all
      .filter((t) => t.type !== 'typography')
      .map((t) => `--solar-${t.name.replaceAll('.', '-')}`),
  );
  const where = spec.component;
  const ref = (token, at) => {
    const v = cssVar(token);
    if (!vars.has(v.slice(4, -1)))
      throw new Error(
        `${where} ${at}: ${token} has no custom property in tokens.css`,
      );
    return v;
  };

  /** A text style token as the custom properties it is made of. */
  const textStyle = (token, at) => {
    const t = byName.get(token);
    if (!t || t.type !== 'typography')
      throw new Error(`${where} ${at}: ${token} is not a text style`);
    const family = all.find(
      (x) =>
        x.name.startsWith('type.font-family.') &&
        x.value === t.value.fontFamily,
    );
    if (!family)
      throw new Error(
        `${where} ${at}: no font family token for ${t.value.fontFamily}`,
      );
    const { sizeToken, lineHeightToken } = t.ext;
    for (const v of [sizeToken, lineHeightToken])
      if (!vars.has(v))
        throw new Error(`${where} ${at}: ${v} is not in tokens.css`);
    return {
      fontFamily: ref(family.name, at),
      fontWeight: ref(`type.font-weight.${t.value.fontWeight}`, at),
      fontSize: `var(${sizeToken})`,
      lineHeight: `var(${lineHeightToken})`,
      letterSpacing: `${letterSpacingEm(t.value.letterSpacing, canonical.dimension(t.value.fontSize))}em`,
      // Explicit, so a state leaving an underlined style (tertiary hover back to rest) undoes it.
      ...cssTextFeatures(featuresOf(t.ext), {
        explicit: 'textDecoration' in featuresOf(t.ext),
      }),
    };
  };

  const length = (entry, prop, at) => {
    if (entry.token) return { [prop]: ref(entry.token, at) };
    if (entry.literal !== undefined) {
      if (!entry.allowed)
        throw new Error(
          `${where} ${at}: literal ${entry.literal} is not allowed by the overlay`,
        );
      return { [prop]: `${entry.literal}px` };
    }
    if (entry.keyword === 'HUG' || entry.keyword === undefined) return {};
    if (entry.keyword === 'FILL') return { [prop]: '100%' };
    throw new Error(`${where} ${at}: cannot size by ${entry.keyword}`);
  };

  const svg = new Set(MUI_SVG_LAYERS[spec.component] ?? []);
  // Layers the base control draws itself (the overlay's controlDraws: Spinner's ring,
  // ProgressBar's bar): where they sit and how big they are is the control's, so neither is
  // declared, where a declaration would fight the control's own layout.
  // A rule may name the only cells the control decides (a slider's handle: where it sits).
  const controlDrawn = new Map(
    (spec.overlay?.rules ?? [])
      .filter((r) => r.rule === 'controlDraws')
      .map((r) => [
        r.at,
        r.cells ?? ['x', 'y', 'right', 'bottom', 'width', 'height'],
      ]),
  );

  /** One IR cell as CSS declarations. */
  const declare = (cell, entry, at, layer, glyph = false) => {
    if (controlDrawn.get(layer)?.includes(cell)) return {};
    const paint = (prop) =>
      entry.none ? { [prop]: 'transparent' } : { [prop]: ref(entry.token, at) };
    // An SVG shape: a control's own (Spinner's ring), or a glyph the shell draws in this entry
    // (StatusIndicator's marks). A glyph's stroke is its outline, a path filled in the stroke's
    // colour (`.SolarGlyph-stroke`); `stroke` on the element says which colour that is.
    if (svg.has(layer) || glyph)
      switch (cell) {
        case 'background':
          return entry.none ? { fill: 'none' } : paint('fill');
        case 'borderColor':
          if (glyph && !svg.has(layer))
            return entry.none
              ? { stroke: 'none', '& .SolarGlyph-stroke': { fill: 'none' } }
              : {
                  ...paint('stroke'),
                  '& .SolarGlyph-stroke': paint('fill'),
                };
          return entry.none ? { stroke: 'none' } : paint('stroke');
        case 'borderWidth':
          return entry.none
            ? { strokeWidth: '0' }
            : { strokeWidth: ref(entry.token, at) };
        // The control's SVG places its shapes in its own view box, and sizes them there too; a
        // glyph the shell draws is an SVG element of its own, sized as a box is.
        case 'x':
        case 'y':
        case 'right':
        case 'bottom':
          return {};
        case 'width':
        case 'height':
          if (svg.has(layer)) return {};
          break;
        // A shape has no box to round or shadow. An ellipse is round already: its radius is the
        // recipe's word for that (recipe.mjs), which the SVG shape draws by being a circle.
        case 'radius':
          if (entry.ellipse) return {};
          // A vector's corner radius is in its outline already (RowExpand's rounded connector):
          // Figma rounds the path it records, so the glyph draws it.
          if (glyph && VECTORS.has(spec.layers[layer]?.type)) return {};
        // falls through
        case 'radiusTopLeft':
        case 'radiusTopRight':
        case 'radiusBottomRight':
        case 'radiusBottomLeft':
        case 'shadow':
          if (!entry.none)
            throw new Error(`${where} ${at}: an SVG shape cannot take ${cell}`);
          return {};
      }
    switch (cell) {
      case 'background':
        return paint('backgroundColor');
      case 'borderColor':
        return paint('borderColor');
      case 'color':
        return paint('color');
      case 'borderWidth':
        return entry.none
          ? { borderStyle: 'none' }
          : { borderWidth: ref(entry.token, at), borderStyle: 'solid' };
      // A side of its own (Button Group's divider): its width and style alone, over any uniform
      // border the layer has elsewhere.
      case 'borderTopWidth':
      case 'borderRightWidth':
      case 'borderBottomWidth':
      case 'borderLeftWidth': {
        const side = cell.slice('border'.length, -'Width'.length);
        return entry.none
          ? { [`border${side}Style`]: 'none' }
          : {
              ...length(entry, cell, at),
              [`border${side}Style`]: 'solid',
            };
      }
      case 'radius':
        return {
          borderRadius: ref(entry.none ? 'radius.none' : entry.token, at),
        };
      // A corner of its own (Popover's square corner by its arrow), over any uniform radius.
      case 'radiusTopLeft':
      case 'radiusTopRight':
      case 'radiusBottomRight':
      case 'radiusBottomLeft': {
        const prop = `border${cell.slice('radius'.length)}Radius`;
        return entry.none || entry.token
          ? { [prop]: ref(entry.none ? 'radius.none' : entry.token, at) }
          : length(entry, prop, at);
      }
      case 'shadow':
        return { boxShadow: entry.none ? 'none' : ref(entry.token, at) };
      // A box its parent's auto layout does not place: at Figma's position, from the parent's
      // edge. Positions are the drawing's coordinates, as a glyph's outline is, not spacing, so
      // they are pixels. `none` is a variant whose auto layout places it after all.
      case 'x':
        return entry.none
          ? { position: 'static' }
          : {
              position: 'absolute',
              left: `calc(${entry.position}px - var(--solar-placed-left, 0px))`,
            };
      case 'y':
        return entry.none
          ? {}
          : { top: `calc(${entry.position}px - var(--solar-placed-top, 0px))` };
      // One pinned to its parent's far edge, in a parent that grows (placementOf).
      case 'right':
        return entry.none
          ? { position: 'static' }
          : {
              position: 'absolute',
              right: `calc(${entry.position}px - var(--solar-placed-right, 0px))`,
            };
      case 'bottom':
        return entry.none
          ? {}
          : {
              bottom: `calc(${entry.position}px - var(--solar-placed-bottom, 0px))`,
            };
      // A layer with no auto-layout in this variant (the recipe writes it `none`) has no gap or
      // padding, which is inset.none, as a `none` radius is radius.none. Written, not left out, so
      // it overrides the gap the base's layout has.
      case 'gap':
      case 'paddingTop':
      case 'paddingRight':
      case 'paddingBottom':
      case 'paddingLeft':
        return entry.none
          ? { [cell]: ref('inset.none', at) }
          : length(entry, cell, at);
      case 'width':
      case 'height':
        // A hug past the base resets the size to the box's own (Tree Indent hugs its units, where
        // depth 00's base is a fixed 0px): declaring nothing would leave the base's standing.
        if (entry.keyword === 'HUG' && at.split('.')[1] !== 'base')
          return { [cell]: 'auto' };
        return length(entry, cell, at);
      // No auto-layout: Figma places the children itself, which the shell's own layout gives, so
      // nothing of the base's flex direction or alignment is restated.
      case 'direction':
        if (entry.none) return {};
        // A grid lays its children out in rows of the shell's columns (a month's week), spaced by
        // its gap both ways.
        if (entry.keyword === 'GRID') return { display: 'grid' };
        return { flexDirection: DIRECTION[entry.keyword] };
      case 'align': {
        if (entry.none) return {};
        const [main, cross] = entry.keyword.split('/');
        if (!ALIGN[main] || !ALIGN[cross])
          throw new Error(`${where} ${at}: cannot align ${entry.keyword}`);
        return { justifyContent: ALIGN[main], alignItems: ALIGN[cross] };
      }
      // A layer drawn translucent: Figma's opacity, a number the overlay must allow, since SOLAR
      // has no opacity scale.
      case 'opacity':
        if (entry.literal === undefined || !entry.allowed)
          throw new Error(
            `${where} ${at}: opacity ${entry.literal} is not allowed by the overlay`,
          );
        return { opacity: String(entry.literal) };
      case 'typography':
        return entry.none ? {} : textStyle(entry.token, at);
      default:
        throw new Error(`${where} ${at}: no MUI rendering for cell ${cell}`);
    }
  };
  return { declare, ref };
}

/**
 * Which earlier states in the cascade can hold at the same time as each state, per component, on
 * both platforms: a pointer that presses a control is over it, so a pressed button is hovered too
 * (in CSS and in Flutter's `WidgetState`s alike), and a focused one may be hovered or pressed. A
 * disabled or loading Button (MUI marks loading disabled) takes no pointer and cannot keep focus,
 * so it overlaps nothing. A component with no entry has no overlapping states.
 */
export const OVERLAPS = descriptorTable('mui', 'overlaps');

/**
 * Where states overlap (`OVERLAPS`) and Figma draws each alone, a property an earlier state sets
 * and a later one does not would stay the earlier one's: the IR lists only what a state changes, so
 * a pressed tertiary Button, hovered too, would keep hover's underline. Both platforms blend that
 * way -- CSS by the cascade, Flutter by looking each cell up in the strongest state that has it --
 * and both emitters read the style through this. Each state restates every cell an earlier one sets,
 * with its own value where it has one and the resting value otherwise, per size, since the resting
 * value can depend on it. Returns the style with those entries added, marked `restates`.
 */
export function restateOverlaps(spec) {
  const style = structuredClone(spec.style);
  const overlaps = OVERLAPS[spec.component] ?? {};
  const states = Object.keys(stateSelectors(spec.component)).filter(
    (s) => s !== 'default',
  );
  const sizes = spec.api.size?.values ?? null;
  for (const s of Object.values(style)) {
    const combos = new Set([
      ...Object.keys(s.appearance),
      ...Object.values(s.combined ?? {}).flatMap((c) => Object.keys(c)),
    ]);
    for (const combo of combos) {
      const at = (size, state) => s.combined?.[size]?.[combo]?.[state];
      const rest = (size, cell) =>
        at(size, 'default')?.[cell] ??
        s.appearance[combo]?.default?.[cell] ??
        s.size[size]?.[cell] ??
        s.base[cell];
      states.forEach((state) => {
        const earlier = overlaps[state] ?? [];
        const cells = new Set(
          earlier.flatMap((e) => [
            ...Object.keys(s.appearance[combo]?.[e] ?? {}),
            ...(sizes ?? []).flatMap((z) => Object.keys(at(z, e) ?? {})),
          ]),
        );
        // Two entries are the same drawing whatever their provenance.
        const same = (a, b) =>
          JSON.stringify({ ...a, from: 0, reason: 0, restates: 0 }) ===
          JSON.stringify({ ...b, from: 0, reason: 0, restates: 0 });
        for (const cell of cells) {
          if (COMPOSITION(cell)) continue;
          const own = s.appearance[combo]?.[state]?.[cell];
          // What each earlier state draws for this cell at a size, and whether it is per size:
          // a per-size rule comes later in the merge than a per-appearance one, so it beats this
          // state's own per-appearance entry.
          const earlierAt = (z) =>
            earlier
              .map((e) => ({
                value:
                  (z && at(z, e)?.[cell]) || s.appearance[combo]?.[e]?.[cell],
                perSize: Boolean(z && at(z, e)?.[cell]),
                e,
              }))
              .filter((x) => x.value);
          if (!sizes) {
            const value =
              own ?? s.appearance[combo]?.default?.[cell] ?? s.base[cell];
            const shows = earlierAt(null).find((x) => !same(x.value, value));
            if (!own && value && shows)
              ((s.appearance[combo] ??= {})[state] ??= {})[cell] = {
                ...value,
                restates: shows.e,
              };
            continue;
          }
          for (const z of sizes) {
            if (at(z, state)?.[cell]) continue;
            const value = own ?? rest(z, cell);
            if (!value) continue;
            // This state's own entry wins over earlier per-appearance ones by order already; only
            // a per-size earlier entry, or a state with none of its own, can show through.
            const shows = earlierAt(z).find(
              (x) => (!own || x.perSize) && !same(x.value, value),
            );
            if (!shows) continue;
            (((s.combined ??= {})[z] ??= {})[combo] ??= {})[state] ??= {};
            s.combined[z][combo][state][cell] = { ...value, restates: shows.e };
          }
        }
      });
    }
  }
  return style;
}

/**
 * What a base MUI control draws in a state by itself, over the recipe's resting value, by component
 * and state: the cells the recipe must restate for that state where it has no entry of its own.
 * MUI's IconButton marks a loading button disabled (it sets both classes), and its own
 * \`.Mui-disabled\` rule clears the background at a specificity the recipe's resting background
 * loses to, so a loading icon button would lose its fill. (MUI's Button draws no disabled
 * background for the text variant the shell pins, so it needs no entry.)
 */
export const MUI_STATE_RESTATES = descriptorTable('mui', 'restates');

/** The style with each MUI_STATE_RESTATES cell restated at its resting value, marked `restates`. */
function restateBase(spec, style) {
  for (const [state, list] of Object.entries(
    MUI_STATE_RESTATES[spec.component] ?? {},
  ))
    for (const at of list) {
      const [layer, cell] = at.split('.');
      const s = style[layer];
      if (!s)
        throw new Error(`${spec.component}: no layer ${layer} to restate`);
      for (const combo of Object.keys(s.appearance)) {
        const states = s.appearance[combo];
        if (!states[state]?.[cell]) {
          const rest = states.default?.[cell] ?? s.base[cell];
          if (rest) (states[state] ??= {})[cell] = { ...rest, restates: 'mui' };
        }
        // A resting value per size comes later in the merge than the per-appearance one, so it is
        // restated per size too.
        for (const byCombo of Object.values(s.combined ?? {})) {
          const own = byCombo[combo];
          const rest = own?.default?.[cell];
          if (rest && !own[state]?.[cell])
            (own[state] ??= {})[cell] = { ...rest, restates: 'mui' };
        }
      }
    }
  return style;
}

/**
 * Merges declarations under a selector; the same property twice with two values is an error. A
 * nested block (a restyled child's `& > *`) merges into the one already there.
 */
function place(target, selector, decls, at) {
  // Nothing to declare (a control's shape, sized in its own view box) is no rule.
  if (Object.keys(decls).length === 0) return;
  const into = selector === '&' ? target : (target[selector] ??= {});
  for (const [k, v] of Object.entries(decls)) {
    if (v !== null && typeof v === 'object') {
      place(into, k, v, at);
      continue;
    }
    if (k in into && into[k] !== v)
      throw new Error(`${at}: ${selector} ${k} is both ${into[k]} and ${v}`);
    into[k] = v;
  }
}

/**
 * @returns {{ts: string, styles: object, composition: object, file: string}}
 */
export function renderMuiComponent(spec, tokens) {
  const slots = slotsOf(spec);
  if (!slots) throw new Error(`${spec.component}: no MUI slot table`);
  for (const layer of Object.keys(spec.layers))
    if (!slots[layer])
      throw new Error(`${spec.component}: no MUI slot for layer ${layer}`);

  const { declare, ref } = context(spec, tokens);
  const selectors = stateSelectors(spec.component);
  const styles = {
    reset: structuredClone(MUI_RESETS[spec.component] ?? {}),
    root: {},
    sizes: {},
    appearances: {},
    combined: {},
  };
  const composition = {};
  // A shape's position is part of its drawing, which the shell draws from the composition data,
  // as it draws its outline; a box's is CSS, absolute in its parent.
  const shape = (layer) => drawn(spec.style[layer] ?? {});
  const composed = (layer, cell) =>
    COMPOSITION(cell) || (PLACED(cell) && shape(layer));
  // The parents of boxes placed by position, which position them: `relative`, once, at rest.
  const placing = new Set();
  // Every layer that places a child by position, box or glyph, with the edges it places them from.
  // Figma measures a child's position from its parent's outer edge, and CSS from inside its
  // border, so each says its own left and top border (`--solar-placed-left`, `--solar-placed-top`),
  // and its right and bottom where a child is pinned to those (placementOf), which its placed
  // children step back by; said at rest by every one, so a child never reads a grandparent's.
  const placers = new Map();
  for (const [layer, st] of Object.entries(spec.style)) {
    const parent = spec.layers[layer]?.parent;
    if (parent == null) continue;
    for (const [cell, edge] of [
      ['x', ['left', 'top']],
      ['right', ['right']],
      ['bottom', ['bottom']],
    ])
      if (entriesOf(st).some((e) => e?.[cell]?.position !== undefined))
        for (const side of edge)
          (
            placers.get(parent) ?? placers.set(parent, new Set()).get(parent)
          ).add(side);
  }
  const EDGES = {
    borderWidth: ['left', 'top', 'right', 'bottom'],
    borderLeftWidth: ['left'],
    borderTopWidth: ['top'],
    borderRightWidth: ['right'],
    borderBottomWidth: ['bottom'],
  };
  const edges = (layer, cell, entry, at) =>
    Object.fromEntries(
      (EDGES[cell] ?? [])
        .filter((side) => placers.get(layer)?.has(side))
        .map((side) => [
          `--solar-placed-${side}`,
          entry.none ? '0px' : ref(entry.token, at),
        ]),
    );

  /**
   * Every cell of one style block (one size, one state …) into a target object. Whether the layer
   * is drawn as a glyph there is the block's own glyph, or the base's where the block names none:
   * a layer may be a glyph in one variant and a box in another (StatusIndicator's container).
   */
  // The composed children the parent restyles (Toast's Tag): their fill and edge are drawn on the
  // child's own root, which sits inside the layer's element.
  const restyled = new Map(
    (spec.overlay?.rules ?? [])
      .filter((r) => r.rule === 'restyles')
      .map((r) => [r.at, new Set(r.cells)]),
  );
  const render = (target, layer, cells, at) => {
    const glyph =
      'glyph' in cells
        ? Boolean(cells.glyph?.glyph)
        : baseGlyph(spec.style[layer]);
    for (const [cell, entry] of Object.entries(cells)) {
      const here = `${layer}.${at}.${cell}`;
      if (composed(layer, cell)) continue;
      // A text the root draws itself (the words MUI renders in Button's root) has no box of its
      // own: its size is the root's.
      if (
        slots[layer] === '&' &&
        spec.layers[layer]?.type === 'TEXT' &&
        (cell === 'width' || cell === 'height')
      )
        continue;
      if (PLACED(cell) && entry.position !== undefined)
        placing.add(spec.layers[layer].parent);
      const decl = {
        ...declare(cell, entry, here, layer, glyph),
        ...edges(layer, cell, entry, here),
      };
      place(
        target,
        slots[layer],
        restyled.get(layer)?.has(cell) ? { '& > *': decl } : decl,
        here,
      );
    }
  };
  const byState = (target, states, layer, at) => {
    for (const state of Object.keys(selectors)) {
      const cells = states[state];
      if (!cells) continue;
      const sel = selectors[state];
      render(
        sel ? (target[sel] ??= {}) : target,
        layer,
        cells,
        `${at}.${state}`,
      );
    }
    for (const state of Object.keys(states))
      if (!(state in selectors))
        throw new Error(
          `${spec.component} ${layer}: no MUI selector for state ${state}`,
        );
  };

  for (const [layer, s] of Object.entries(
    restateBase(spec, restateOverlaps(spec)),
  )) {
    render(styles.root, layer, s.base, 'base');
    for (const [size, cells] of Object.entries(s.size))
      render((styles.sizes[size] ??= {}), layer, cells, `size.${size}`);
    // Every appearance appears, even one identical to the base, so the resolver can look any
    // combination up without a fallback.
    for (const [combo, states] of Object.entries(s.appearance))
      byState((styles.appearances[combo] ??= {}), states, layer, combo);
    for (const [size, byCombo] of Object.entries(s.combined ?? {}))
      for (const [combo, states] of Object.entries(byCombo))
        byState(
          ((styles.combined[size] ??= {})[combo] ??= {}),
          states,
          layer,
          `${size}.${combo}`,
        );

    const comp = {};
    const pick = (cells) =>
      Object.fromEntries(
        Object.entries(cells)
          .filter(([c]) => composed(layer, c))
          .map(([c, e]) => [
            c,
            e.glyph ?? e.keyword ?? e.value ?? e.position ?? null,
          ]),
      );
    comp.base = pick(s.base);
    for (const [combo, states] of Object.entries(s.appearance))
      for (const [state, cells] of Object.entries(states)) {
        const p = pick(cells);
        if (Object.keys(p).length)
          ((comp.appearance ??= {})[combo] ??= {})[state] = p;
      }
    for (const [size, cells] of Object.entries(s.size)) {
      const p = pick(cells);
      if (Object.keys(p).length) (comp.size ??= {})[size] = p;
    }
    for (const [size, byCombo] of Object.entries(s.combined ?? {}))
      for (const [combo, states] of Object.entries(byCombo))
        for (const [state, cells] of Object.entries(states)) {
          const p = pick(cells);
          if (Object.keys(p).length)
            (((comp.combined ??= {})[size] ??= {})[combo] ??= {})[state] = p;
        }
    if (
      Object.keys(comp.base).length ||
      comp.appearance ||
      comp.size ||
      comp.combined
    )
      composition[layer] = comp;
  }

  // Each placer's border at rest, where its base draws none.
  for (const [layer, sides] of placers) {
    const at = slots[layer] === '&' ? styles.root : styles.root[slots[layer]];
    for (const v of ['left', 'top', 'right', 'bottom']
      .filter((side) => sides.has(side))
      .map((side) => `--solar-placed-${side}`))
      if (!at?.[v])
        place(styles.root, slots[layer], { [v]: '0px' }, `${layer}.base.${v}`);
  }

  // A parent placed itself is `absolute` already, which positions its children as well.
  for (const parent of placing) {
    if (parent === null) continue;
    const at = slots[parent] === '&' ? styles.root : styles.root[slots[parent]];
    if (!at?.position)
      place(
        styles.root,
        slots[parent],
        { position: 'relative' },
        `${parent}.base.position`,
      );
  }

  // Keys in the API's own order -- sizes md, sm, lg; variants primary, secondary, tertiary -- not
  // in whatever order the layers first mentioned them.
  const rank = (key) =>
    key.split(', ').map((part) => {
      const [axis, value] = part.includes('=')
        ? part.split('=')
        : ['size', part];
      const def = recipeAxes(spec)[axis];
      return def?.values ? def.values.indexOf(value) : value === 'true' ? 1 : 0;
    });
  const ordered = (obj) =>
    Object.fromEntries(
      Object.entries(obj).sort(([a], [b]) => {
        const ra = rank(a);
        const rb = rank(b);
        for (let i = 0; i < Math.max(ra.length, rb.length); i++)
          if ((ra[i] ?? 0) !== (rb[i] ?? 0)) return (ra[i] ?? 0) - (rb[i] ?? 0);
        return 0;
      }),
    );
  styles.sizes = ordered(styles.sizes);
  styles.appearances = ordered(styles.appearances);
  styles.combined = Object.fromEntries(
    Object.entries(ordered(styles.combined)).map(([k, v]) => [k, ordered(v)]),
  );

  // Each state's block in the state table's order, where a later rule wins: a block is added where
  // a layer first has the state, so a first layer with only disabled and error (Text Input's
  // label) would put them before a later layer's hover, which would then win over both. The
  // blocks keep the places they have; only which state sits where follows the table.
  const inTableOrder = (block) => {
    const rank = Object.values(selectors);
    const keys = Object.keys(block);
    const states = keys
      .filter((k) => rank.includes(k))
      .sort((a, b) => rank.indexOf(a) - rank.indexOf(b));
    let next = 0;
    return Object.fromEntries(
      keys.map((k) => {
        const key = rank.includes(k) ? states[next++] : k;
        return [key, block[key]];
      }),
    );
  };
  for (const combo of Object.keys(styles.appearances))
    styles.appearances[combo] = inTableOrder(styles.appearances[combo]);
  for (const byCombo of Object.values(styles.combined))
    for (const combo of Object.keys(byCombo))
      byCombo[combo] = inTableOrder(byCombo[combo]);

  // The axes an appearance is keyed by, from any key: `variant=primary, danger=false`.
  // A drawing (StatusIndicator) keys its entries by size and appearance together, so the
  // combined section may be the only one that names them.
  // A component with states and no appearance axis (BackButton) keys them under `default`.
  const firstKey = [
    ...Object.keys(styles.appearances),
    ...Object.values(styles.combined).flatMap((c) => Object.keys(c)),
  ].find((k) => k !== 'default');
  const appearanceAxes =
    firstKey?.split(', ').map((part) => part.split('=')[0]) ?? [];

  const name = pascal(spec.component);
  const typeLines = [];
  const propLines = [];
  // An axis derived from content (FAB's type) is the shell's to set, not the caller's to give.
  const derivedLines = [];
  const defaults = {};
  const axesAll = recipeAxes(spec);
  for (const [prop, def] of Object.entries(axesAll)) {
    // A derived state value (Text Input's `filled`, from its value) is true or false.
    if (def.derived && def.type === 'boolean') {
      derivedLines.push(`  ${prop}?: boolean;`);
      defaults[prop] = def.default;
      continue;
    }
    if (def.derived) {
      const type = `Solar${name}${pascal(prop)}`;
      typeLines.push(
        `export type ${type} = ${def.values.map((v) => `'${v}'`).join(' | ')};`,
      );
      derivedLines.push(`  ${prop}?: ${type};`);
      defaults[prop] = def.default;
      continue;
    }
    if (def.type === 'boolean') {
      propLines.push(`  ${prop}?: boolean;`);
    } else if (def.type === 'color') {
      // A colour the caller gives (Avatar's): any CSS colour. It keys nothing in the recipe, which
      // draws its own where none is given; the shell draws this one.
      propLines.push(`  ${prop}?: string;`);
      continue;
    } else {
      const type = `Solar${name}${pascal(prop)}`;
      typeLines.push(
        `export type ${type} = ${def.values.map((v) => `'${v}'`).join(' | ')};`,
      );
      propLines.push(`  ${prop}?: ${type};`);
    }
    defaults[prop] = def.default;
  }
  // Every appearance key names the same axes, or a lookup would miss the ones that do not.
  const keyAxes = (key) =>
    key
      .split(', ')
      .map((part) => part.split('=')[0])
      .join();
  for (const key of [
    ...Object.keys(styles.appearances),
    ...Object.values(styles.combined).flatMap((c) => Object.keys(c)),
  ])
    if (
      (key !== 'default' || appearanceAxes.length) &&
      keyAxes(key) !== appearanceAxes.join()
    )
      throw new Error(
        `${spec.component}: appearance key ${key} does not name ${appearanceAxes.join(', ')}`,
      );
  for (const axis of appearanceAxes)
    if (!(axis in axesAll))
      throw new Error(
        `${spec.component}: appearance axis ${axis} is not a prop`,
      );

  const key =
    appearanceAxes.map((a) => `${a}=\${p.${a}}`).join(', ') || 'default';
  const sizeProp = 'size' in spec.api ? 'size' : null;

  const ts =
    `// SOLAR ${spec.component} recipe for MUI. Generated by @bwp-web/codegen from spec/components/${spec.component.toLowerCase()}.json. Do not edit.\n` +
    `// Plain data on purpose: this module imports nothing, so @bwp-web/styles stays dependency free.\n` +
    `// Every value is a var(--solar-*) reference into tokens.css, which must be loaded.\n\n` +
    `${typeLines.join('\n')}\n\n` +
    // A component with no props (EmptyState) takes none, which an empty interface would not say.
    (propLines.length
      ? `export interface Solar${name}Props {\n${propLines.join('\n')}\n}\n\n`
      : `export type Solar${name}Props = Record<never, never>;\n\n`) +
    (derivedLines.length
      ? `/** The props and what the shell derives from its content (the recipe is keyed by both). */\nexport interface Solar${name}RecipeProps extends Solar${name}Props {\n${derivedLines.join('\n')}\n}\n\n`
      : '') +
    `export const solar${name}Defaults = ${JSON.stringify(defaults, null, 2)} as const;\n\n` +
    `/** Style by layer and state: \`root\` is the base, then per size, per appearance, and per size and appearance together. */\n` +
    `export const solar${name}Styles = ${JSON.stringify(styles, null, 2)} as const;\n\n` +
    `/** What the shell renders rather than styles: which layers show, and which variant each child takes. */\n` +
    `export const solar${name}Composition = ${JSON.stringify(composition, null, 2)} as const;\n\n` +
    `type Style = { [key: string]: string | Style };\n\n` +
    `function merge(...styles: (Style | undefined)[]): Style {\n` +
    `  const out: Style = {};\n` +
    `  for (const style of styles)\n` +
    `    for (const [k, v] of Object.entries(style ?? {}))\n` +
    `      out[k] = typeof v === 'object' && typeof out[k] === 'object' ? merge(out[k] as Style, v) : v;\n` +
    `  return out;\n` +
    `}\n\n` +
    `/** The complete style for one set of props, for \`sx\` or \`styleOverrides.root\`. */\n` +
    `export function solar${name}Style(props: Solar${name}${derivedLines.length ? 'RecipeProps' : 'Props'} = {}): Style {\n` +
    // A prop passed as undefined means "not set", and must not overwrite its default: a shell
    // that forwards every prop it destructured passes undefined for each one the caller left out.
    `  const p: Record<string, unknown> = { ...solar${name}Defaults };\n` +
    `  for (const [k, v] of Object.entries(props)) if (v !== undefined) p[k] = v;\n` +
    `  const key = \`${key}\`;\n` +
    `  const s = solar${name}Styles as unknown as {\n` +
    `    reset: Style;\n    root: Style;\n    sizes: Record<string, Style>;\n    appearances: Record<string, Style>;\n    combined: Record<string, Record<string, Style>>;\n  };\n` +
    (sizeProp
      ? `  const size = p.size as string;\n  return merge(s.reset, s.root, s.sizes[size], s.appearances[key], s.combined[size]?.[key]);\n`
      : `  return merge(s.reset, s.root, s.appearances[key]);\n`) +
    `}\n\n` +
    `/** A drawn layer's outline: its box, and the fill's and the stroke's paths (Figma's geometry). */\n` +
    `type Glyph = {\n  width: number;\n  height: number;\n  fill: { d: string; evenOdd: boolean }[];\n  stroke: { d: string; evenOdd: boolean }[];\n};\n` +
    `/** One layer's composition: shown or not, its composed child, its glyph, its position. */\n` +
    `export type Solar${name}Parts = Record<string, string | number | boolean | Glyph | null>;\n` +
    `type Parts = Solar${name}Parts;\n` +
    `type Layered = {\n  base: Parts;\n  size?: Record<string, Parts>;\n  appearance?: Record<string, Record<string, Parts>>;\n  combined?: Record<string, Record<string, Record<string, Parts>>>;\n};\n\n` +
    `/**\n * What the shell renders for one set of props in one state, by layer: whether it shows, and which\n * component and variant a composed child takes. The same precedence as the style: base, size,\n * appearance, then size and appearance together, each at rest and then in the state.\n */\n` +
    `export function solar${name}Compose(\n  props: Solar${name}${derivedLines.length ? 'RecipeProps' : 'Props'} = {},\n  state: string = 'default',\n): Record<string, Parts> {\n` +
    `  const p: Record<string, unknown> = { ...solar${name}Defaults };\n` +
    `  for (const [k, v] of Object.entries(props)) if (v !== undefined) p[k] = v;\n` +
    `  const key = \`${key}\`;\n` +
    `  const size = ${sizeProp ? 'p.size as string' : "''"};\n` +
    `  const out: Record<string, Parts> = {};\n` +
    `  for (const [layer, c] of Object.entries(solar${name}Composition as unknown as Record<string, Layered>)) {\n` +
    `    const states = state === 'default' ? ['default'] : ['default', state];\n` +
    `    out[layer] = Object.assign(\n      {},\n      c.base,\n      c.size?.[size],\n      ...states.flatMap((st) => [c.appearance?.[key]?.[st], c.combined?.[size]?.[key]?.[st]]),\n    );\n  }\n  return out;\n` +
    `}\n`;

  return {
    ts,
    styles,
    composition,
    file: `${spec.component.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ts`,
  };
}

/** Writes every component's module and the barrel. */
export function emitMuiComponents(specs, tokens) {
  const rendered = specs.map((spec) => renderMuiComponent(spec, tokens));
  for (const r of rendered) writeGenerated(join(OUT_DIR, r.file), r.ts);
  writeGenerated(
    join(OUT_DIR, 'index.ts'),
    '// Generated by @bwp-web/codegen. Do not edit.\n' +
      rendered
        .map((r) => `export * from './${r.file.replace(/\.ts$/, '.js')}';\n`)
        .join(''),
  );
  return rendered.length;
}
