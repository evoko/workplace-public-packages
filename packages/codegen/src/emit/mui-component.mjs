/**
 * Emits a component's recipe for MUI: plain style data keyed the way `styleOverrides` and `sx`
 * read it, plus the prop types, importing nothing from MUI -- exactly as the token theme does.
 *
 * Every value is a `var(--solar-…)` reference into tokens.css, never a resolved value, so the one
 * stylesheet is the runtime source: a `[data-theme='dark']` subtree re-themes the component with no
 * JavaScript. The only exceptions are CSS keywords (`transparent`, `none`, `center`), letter
 * spacing derived from a text style token, and the literals the overlay explicitly allowed.
 *
 * What is MUI-specific lives here and nowhere else: which element of MUI's Button each IR layer
 * is (`MUI_SLOTS`), and which class MUI sets for each state (`STATE_SELECTORS`).
 */

import { join } from 'node:path';
import { flattenSpec } from '../spec.mjs';
import { pascal } from '../util/naming.mjs';
import { packagesDir } from '../util/paths.mjs';
import { writeGenerated } from '../util/write.mjs';
import { canonical, letterSpacingEm } from './manifest.mjs';
import { cssTextFeatures, featuresOf } from './text-features.mjs';

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
export const MUI_SLOTS = {
  Button: {
    root: '&',
    label: '&',
    iconLeading: '& .MuiButton-startIcon',
    iconTrailing: '& .MuiButton-endIcon',
    spinner: '& .MuiButton-loadingIndicator',
    // Not an MUI slot: the shell renders the counter itself, with this class (task 7).
    counter: '& .SolarButton-counter',
  },
  // The shell sizes a box and lets CircularProgress fill it (size="100%"), since MUI writes the
  // size prop as an inline style no recipe rule could beat.
  Spinner: {
    root: '&',
    spinnerRing: '&',
    track: '& .MuiCircularProgress-track',
    indicator: '& .MuiCircularProgress-circle',
  },
};

/**
 * Layers MUI draws as SVG shapes, where Figma's stroke is `stroke` and `stroke-width`, not a CSS
 * border, and a fill is `fill`.
 */
export const MUI_SVG_LAYERS = { Spinner: ['track', 'indicator'] };

/**
 * MUI's own defaults that would otherwise show through the recipe. These are MUI knowledge, like
 * the slot table, so they live here and regenerate, rather than being copied into every hand-owned
 * shell. Each undoes something MUI draws that SOLAR does not: Button's 64px minimum width (SOLAR
 * buttons hug their label), its upper-case label (SOLAR labels are sentence case, and MUI's
 * default theme upper-cases them), the margins MUI puts around the icons (SOLAR spaces them with
 * the gap), and MUI's icon font size (the SOLAR icon fills its slot, which the recipe sizes). So a
 * component looks right whether or not the app installed the SOLAR MUI theme.
 */
export const MUI_RESETS = {
  Button: {
    // Not '0': MUI's sx reads a sizing value of 1 or less as a fraction, so '0' becomes '0%'.
    minWidth: 'auto',
    textTransform: 'none',
    '& .MuiButton-startIcon': { margin: '0' },
    '& .MuiButton-endIcon': { margin: '0' },
    '& .MuiButton-startIcon > svg, & .MuiButton-endIcon > svg': {
      width: '100%',
      height: '100%',
    },
  },
  // CircularProgress draws in a 44-unit viewBox scaled to its box, so a stroke width in CSS pixels
  // would scale with it; non-scaling-stroke keeps SOLAR's border width in screen pixels. MUI fades
  // its track to 12% of the indicator's colour; SOLAR's track has a colour of its own.
  Spinner: {
    display: 'inline-flex',
    '& .MuiCircularProgress-root': { display: 'block' },
    '& .MuiCircularProgress-track, & .MuiCircularProgress-circle': {
      vectorEffect: 'non-scaling-stroke',
    },
    '& .MuiCircularProgress-track': { opacity: '1' },
  },
};

/**
 * The selector MUI's Button uses for each state. Platform states are pseudo-classes, except focus,
 * which MUI marks with a class only for keyboard focus (focus-visible). `disabled` and `loading`
 * are props, and MUI sets a class for each. Order matters: at equal specificity the later rule
 * wins, so disabled comes last and beats hover, as it does in CSS.
 */
export const STATE_SELECTORS = {
  default: null,
  hover: '&:hover',
  pressed: '&:active',
  focus: '&.Mui-focusVisible',
  loading: '&.MuiButton-loading',
  // MUI disables a loading button too, so a loading one carries Mui-disabled as well; without the
  // :not it would draw in the disabled colours. A button both disabled and loading is disabled:
  // the shell does not pass loading to MUI then.
  disabled: '&.Mui-disabled:not(.MuiButton-loading)',
};

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

  /** One IR cell as CSS declarations. */
  const declare = (cell, entry, at, layer) => {
    const paint = (prop) =>
      entry.none ? { [prop]: 'transparent' } : { [prop]: ref(entry.token, at) };
    if (svg.has(layer))
      switch (cell) {
        case 'background':
          return entry.none ? { fill: 'none' } : paint('fill');
        case 'borderColor':
          return entry.none ? { stroke: 'none' } : paint('stroke');
        case 'borderWidth':
          return entry.none
            ? { strokeWidth: '0' }
            : { strokeWidth: ref(entry.token, at) };
        // A shape has no box to round or shadow.
        case 'radius':
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
      case 'radius':
        return {
          borderRadius: ref(entry.none ? 'radius.none' : entry.token, at),
        };
      case 'shadow':
        return { boxShadow: entry.none ? 'none' : ref(entry.token, at) };
      case 'gap':
      case 'paddingTop':
      case 'paddingRight':
      case 'paddingBottom':
      case 'paddingLeft':
        return length(entry, cell, at);
      case 'width':
      case 'height':
        return length(entry, cell, at);
      case 'direction':
        return { flexDirection: DIRECTION[entry.keyword] };
      case 'align': {
        const [main, cross] = entry.keyword.split('/');
        if (!ALIGN[main] || !ALIGN[cross])
          throw new Error(`${where} ${at}: cannot align ${entry.keyword}`);
        return { justifyContent: ALIGN[main], alignItems: ALIGN[cross] };
      }
      case 'typography':
        return entry.none ? {} : textStyle(entry.token, at);
      default:
        throw new Error(`${where} ${at}: no MUI rendering for cell ${cell}`);
    }
  };
  return { declare };
}

/**
 * CSS states overlap where Figma's do not (`OVERLAPS`): a pressed button is hovered too.
 * Figma draws each state alone, and the IR lists only what a state changes, so a property hover
 * sets and pressed does not would stay hover's while pressed (tertiary's underline). Each state
 * therefore restates every cell an earlier one in the cascade sets, with its own value where it
 * has one and the resting value otherwise -- per size, since the resting value can depend on it --
 * which is what Flutter's one-state-at-a-time lookup draws. Returns the style with those entries
 * added, marked `restates`.
 */
/**
 * Which earlier states in the cascade can hold at the same time as each state, in MUI. A pressed
 * button is hovered; a focused one may be hovered or pressed. A disabled or loading one (MUI marks
 * loading disabled) takes no pointer events and cannot keep focus, so it overlaps nothing.
 */
export const OVERLAPS = { pressed: ['hover'], focus: ['hover', 'pressed'] };

export function restateOverlaps(spec) {
  const style = structuredClone(spec.style);
  const states = Object.keys(STATE_SELECTORS).filter((s) => s !== 'default');
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
        const earlier = OVERLAPS[state] ?? [];
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

/** Merges declarations under a selector; the same property twice with two values is an error. */
function place(target, selector, decls, at) {
  const into = selector === '&' ? target : (target[selector] ??= {});
  for (const [k, v] of Object.entries(decls)) {
    if (k in into && into[k] !== v)
      throw new Error(`${at}: ${selector} ${k} is both ${into[k]} and ${v}`);
    into[k] = v;
  }
}

/**
 * @returns {{ts: string, styles: object, composition: object, file: string}}
 */
export function renderMuiComponent(spec, tokens) {
  const slots = MUI_SLOTS[spec.component];
  if (!slots) throw new Error(`${spec.component}: no MUI slot table`);
  for (const layer of Object.keys(spec.layers))
    if (!slots[layer])
      throw new Error(`${spec.component}: no MUI slot for layer ${layer}`);

  const { declare } = context(spec, tokens);
  const styles = {
    reset: structuredClone(MUI_RESETS[spec.component] ?? {}),
    root: {},
    sizes: {},
    appearances: {},
    combined: {},
  };
  const composition = {};

  /** Every cell of one style block (one size, one state …) into a target object. */
  const render = (target, layer, cells, at) => {
    for (const [cell, entry] of Object.entries(cells)) {
      const here = `${layer}.${at}.${cell}`;
      if (COMPOSITION(cell)) continue;
      place(target, slots[layer], declare(cell, entry, here, layer), here);
    }
  };
  const byState = (target, states, layer, at) => {
    for (const state of Object.keys(STATE_SELECTORS)) {
      const cells = states[state];
      if (!cells) continue;
      const sel = STATE_SELECTORS[state];
      render(
        sel ? (target[sel] ??= {}) : target,
        layer,
        cells,
        `${at}.${state}`,
      );
    }
    for (const state of Object.keys(states))
      if (!(state in STATE_SELECTORS))
        throw new Error(
          `${spec.component} ${layer}: no MUI selector for state ${state}`,
        );
  };

  for (const [layer, s] of Object.entries(restateOverlaps(spec))) {
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
          .filter(([c]) => COMPOSITION(c))
          .map(([c, e]) => [c, e.glyph ?? e.keyword ?? e.value ?? null]),
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

  // Keys in the API's own order -- sizes md, sm, lg; variants primary, secondary, tertiary -- not
  // in whatever order the layers first mentioned them.
  const rank = (key) =>
    key.split(', ').map((part) => {
      const [axis, value] = part.includes('=')
        ? part.split('=')
        : ['size', part];
      const def = spec.api[axis];
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

  // The axes an appearance is keyed by, from any key: `variant=primary, danger=false`.
  const appearanceAxes =
    Object.keys(styles.appearances)[0]
      ?.split(', ')
      .map((part) => part.split('=')[0]) ?? [];

  const name = pascal(spec.component);
  const typeLines = [];
  const propLines = [];
  const defaults = {};
  for (const [prop, def] of Object.entries(spec.api)) {
    if (def.type === 'boolean') {
      propLines.push(`  ${prop}?: boolean;`);
    } else {
      const type = `Solar${name}${pascal(prop)}`;
      typeLines.push(
        `export type ${type} = ${def.values.map((v) => `'${v}'`).join(' | ')};`,
      );
      propLines.push(`  ${prop}?: ${type};`);
    }
    defaults[prop] = def.default;
  }
  for (const axis of appearanceAxes)
    if (!(axis in spec.api))
      throw new Error(
        `${spec.component}: appearance axis ${axis} is not a prop`,
      );

  const key = appearanceAxes.map((a) => `${a}=\${p.${a}}`).join(', ');
  const sizeProp = 'size' in spec.api ? 'size' : null;

  const ts =
    `// SOLAR ${spec.component} recipe for MUI. Generated by @bwp-web/codegen from spec/components/${spec.component.toLowerCase()}.json. Do not edit.\n` +
    `// Plain data on purpose: this module imports nothing, so @bwp-web/styles stays dependency free.\n` +
    `// Every value is a var(--solar-*) reference into tokens.css, which must be loaded.\n\n` +
    `${typeLines.join('\n')}\n\n` +
    `export interface Solar${name}Props {\n${propLines.join('\n')}\n}\n\n` +
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
    `export function solar${name}Style(props: Solar${name}Props = {}): Style {\n` +
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
    `type Parts = Record<string, string | boolean | null>;\n` +
    `type Layered = {\n  base: Parts;\n  size?: Record<string, Parts>;\n  appearance?: Record<string, Record<string, Parts>>;\n  combined?: Record<string, Record<string, Record<string, Parts>>>;\n};\n\n` +
    `/**\n * What the shell renders for one set of props in one state, by layer: whether it shows, and which\n * component and variant a composed child takes. The same precedence as the style: base, size,\n * appearance, then size and appearance together, each at rest and then in the state.\n */\n` +
    `export function solar${name}Compose(\n  props: Solar${name}Props = {},\n  state: string = 'default',\n): Record<string, Parts> {\n` +
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
