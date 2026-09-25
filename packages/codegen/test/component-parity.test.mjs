/**
 * Component parity: both platforms reach every part of Figma's contract, the IR, and draw from the
 * same recipe. What is shared is the contract (docs/superpowers/specs/
 * 2026-09-25-two-libraries-one-contract.md): each recipe is the IR, entry for entry, in the same
 * states, resolved in the same order; each shell reaches every prop and slot of the IR through its
 * descriptor's declared mapping (src/shells/api.mjs), in its platform's own spelling and mechanism,
 * never required to match the other platform's.
 *
 * Read from the artifacts -- the generated TypeScript and Dart, and the shells -- and
 * never from an emitter's own account of what it wrote. Milestone 1 learned why: three token
 * emitters recorded a mode they had forgotten to emit, and every assertion that read the emitter's
 * claim stayed green. Here each platform is parsed back and compared with the IR, which is the
 * oracle, and with the other platform.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DESCRIPTORS } from '../src/components/index.mjs';
import { dartEnumValue } from '../src/emit/flutter.mjs';
import { describe, expect, it } from 'vitest';
import { OVERLAPS, STATE_SELECTORS } from '../src/emit/mui-component.mjs';
import { apiOf, unreached } from '../src/shells/api.mjs';
import { iconsOf } from '../src/shells/icons.mjs';

const SELECTORS = STATE_SELECTORS.Button;
import { flattenSpec } from '../src/spec.mjs';
import * as stage from '../src/stages/components.mjs';
import { flutterFileOf, shellFileOf } from '../src/shells/index.mjs';
import { pascal } from '../src/util/naming.mjs';
import { packagesDir } from '../src/util/paths.mjs';

const { built, tokens } = stage.build();
const ir = built.find((b) => b.spec.component === 'Button').spec;
const tokenByName = new Map(flattenSpec(tokens).map((t) => [t.name, t]));

const read = (...path) => readFileSync(join(packagesDir, ...path), 'utf8');
const muiTs = read(
  'styles',
  'src',
  'generated',
  'mui',
  'components',
  'button.ts',
);
const dart = read(
  'solar_flutter',
  'lib',
  'src',
  'generated',
  'components',
  'button.dart',
);
const shell = read('components', 'src', 'Button.tsx');

// ---------------------------------------------------------------------------------------------
// Parsing the artifacts back. Each parser fails loudly rather than returning something partial.

/** A generated `export const <name> = {…} as const;` as a value. The file is our own output. */
function tsConst(source, name) {
  const m = new RegExp(
    `export const ${name} = (\\{[\\s\\S]*?\\n\\}) as const;`,
  ).exec(source);
  if (!m) throw new Error(`${name} not found in the MUI artifact`);
  return new Function(`return (${m[1]});`)();
}

/** `export type SolarButtonSize = 'md' | 'sm';` as ['md', 'sm']. */
function tsUnion(source, name) {
  const m = new RegExp(`export type ${name} = ([^;]+);`).exec(source);
  if (!m) throw new Error(`type ${name} not found in the MUI artifact`);
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
}

/** The fields of the generated props interface, as {name: 'union' | 'boolean'}. */
function tsProps(source) {
  const m = /export interface SolarButtonProps \{([\s\S]*?)\}/.exec(source);
  return Object.fromEntries(
    [...m[1].matchAll(/(\w+)\?: (\w+);/g)].map(([, prop, type]) => [
      prop,
      type,
    ]),
  );
}

/** `enum SolarButtonSize { md, sm, lg }` as ['md', 'sm', 'lg']. */
function dartEnum(source, name) {
  const m = new RegExp(`enum ${name} \\{([^}]*)\\}`).exec(source);
  if (!m) throw new Error(`enum ${name} not found in the Dart artifact`);
  return m[1]
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** The props constructor's defaults: `this.size = SolarButtonSize.md,` as {size: 'md'}. */
function dartDefaults(source) {
  const m = /const SolarButtonProps\(\{([\s\S]*?)\}\);/.exec(source);
  return Object.fromEntries(
    [...m[1].matchAll(/this\.(\w+) = ([\w.]+),/g)].map(([, prop, v]) => [
      prop,
      v === 'true' ? true : v === 'false' ? false : v.split('.').pop(),
    ]),
  );
}

/** The `cells` map, as {key: value}. */
function dartCells(source) {
  const m =
    /static const Map<String, String> cells = \{([\s\S]*?)\n {2}\};/.exec(
      source,
    );
  if (!m) throw new Error('cells not found in the Dart artifact');
  return Object.fromEntries(
    [...m[1].matchAll(/'([^']+)':\s*'([^']*)',/g)].map((x) => [x[1], x[2]]),
  );
}

const muiStyles = tsConst(muiTs, 'solarButtonStyles');
const muiDefaults = tsConst(muiTs, 'solarButtonDefaults');
const cells = dartCells(dart);

/** Every string leaf of a nested object. */
const leaves = (node) =>
  Object.values(node).flatMap((v) =>
    v && typeof v === 'object' ? leaves(v) : [v],
  );

// ---------------------------------------------------------------------------------------------

describe('component parity: the API', () => {
  const unions = Object.entries(ir.api).filter(([, d]) => d.values);
  const booleans = Object.entries(ir.api).filter(
    ([, d]) => d.type === 'boolean',
  );

  it('offers every value of every choice on each platform, in its own spelling', () => {
    for (const [prop, def] of unions) {
      const type = `SolarButton${prop[0].toUpperCase()}${prop.slice(1)}`;
      expect(tsUnion(muiTs, type), `${prop} in MUI`).toEqual(def.values);
      expect(dartEnum(dart, type), `${prop} in Flutter`).toEqual(
        def.values.map(dartEnumValue),
      );
    }
    expect(unions.map(([p]) => p).sort()).toEqual(['prio', 'size']);
  });

  // The defaults are Figma's default variant's, which is the contract: a default that differed on
  // one platform would draw another variant there.
  it('takes every IR prop in both recipes, with the IR’s default', () => {
    const expected = Object.fromEntries(
      Object.entries(ir.api).map(([p, d]) => [p, d.default]),
    );
    expect(muiDefaults).toEqual(expected);
    expect(dartDefaults(dart)).toEqual(expected);
    const types = tsProps(muiTs);
    for (const [prop] of booleans) expect(types[prop], prop).toBe('boolean');
    expect(Object.keys(types).sort()).toEqual(Object.keys(ir.api).sort());
  });

  it('keeps hover, pressed and focus out of both APIs, as platform states', () => {
    for (const state of ir.states) {
      expect(muiDefaults).not.toHaveProperty(state);
      expect(dartDefaults(dart)).not.toHaveProperty(state);
    }
    expect(booleans.map(([p]) => p).sort()).toEqual([
      'danger',
      'disabled',
      'loading',
    ]);
  });

  it('is what the shell takes too, so the React component offers the same API', () => {
    expect(shell).toMatch(/extends\s+SolarButtonProps/);
    for (const prop of Object.keys(ir.api))
      expect(shell).toMatch(new RegExp(`\\b${prop},`));
  });
});

describe('component parity: states and appearances', () => {
  // MUI's selectors mapped back to the state they stand for.
  const bySelector = new Map(
    Object.entries(SELECTORS)
      .filter(([, sel]) => sel)
      .map(([state, sel]) => [sel, state]),
  );
  const muiStates = new Set();
  const collect = (node) => {
    for (const [k, v] of Object.entries(node))
      if (v && typeof v === 'object') {
        if (bySelector.has(k)) muiStates.add(bySelector.get(k));
        collect(v);
      }
  };
  collect(muiStyles.appearances);
  collect(muiStyles.combined);
  const dartStates = new Set(
    Object.keys(cells)
      .filter((k) => k.includes('|appearance|') || k.includes('|combined|'))
      .map((k) => k.split('|').at(-1))
      .filter((s) => s !== 'default'),
  );

  it('styles the same states on both platforms, and every one the IR has', () => {
    const irStates = new Set();
    for (const s of Object.values(ir.style))
      for (const states of Object.values(s.appearance))
        for (const state of Object.keys(states))
          if (state !== 'default') irStates.add(state);
    expect([...muiStates].sort()).toEqual([...irStates].sort());
    expect([...dartStates].sort()).toEqual([...irStates].sort());
  });

  it('resolves states in the same order: what wins in CSS wins in Flutter', () => {
    const order = /statePrecedence = \[([\s\S]*?)\]/
      .exec(dart)[1]
      .match(/'(\w+)'/g)
      .map((s) => s.slice(1, -1));
    const cssOrder = Object.keys(SELECTORS).filter((s) => s !== 'default');
    expect(order).toEqual([...cssOrder].reverse());
  });

  it('covers the same appearance combinations on both platforms', () => {
    const irCombos = Object.keys(ir.style.root.appearance).sort();
    expect(Object.keys(muiStyles.appearances).sort()).toEqual(irCombos);
    const dartCombos = new Set(
      Object.keys(cells)
        .filter((k) => k.includes('|appearance|'))
        .map((k) => k.split('|')[2]),
    );
    expect([...dartCombos].sort()).toEqual(irCombos);
    expect(Object.keys(muiStyles.sizes).sort()).toEqual(
      Object.keys(ir.style.root.size).sort(),
    );
  });
});

describe('component parity: the recipe', () => {
  /** Every token the IR references, as MUI must name it: a text style is its parts. */
  function expectedMuiVars() {
    const names = new Set();
    const walk = (node) => {
      for (const v of Object.values(node))
        if (v && typeof v === 'object') {
          if (typeof v.token === 'string' && !v.from?.startsWith?.('never')) {
            const t = tokenByName.get(v.token);
            if (t.type === 'typography') {
              names.add(`--solar-type-font-weight-${t.value.fontWeight}`);
              names.add(t.ext.sizeToken);
              names.add(t.ext.lineHeightToken);
            } else names.add(`--solar-${v.token.replaceAll('.', '-')}`);
          } else walk(v);
        }
    };
    walk(ir.style);
    return names;
  }

  it('the Flutter recipe is the IR, entry for entry', () => {
    const irTokens = new Set();
    const walk = (node) => {
      for (const v of Object.values(node))
        if (v && typeof v === 'object') {
          if (typeof v.token === 'string') irTokens.add(v.token);
          else walk(v);
        }
    };
    walk(ir.style);
    const dartTokens = new Set(
      Object.values(cells)
        .filter((v) => v.startsWith('t:'))
        .map((v) => v.slice(2)),
    );
    expect([...dartTokens].sort()).toEqual([...irTokens].sort());
  });

  it('the MUI recipe names exactly the custom properties the IR implies, no more and no fewer', () => {
    const used = new Set(
      [...muiTs.matchAll(/var\((--solar-[a-z0-9-]+)\)/g)].map((m) => m[1]),
    );
    const expected = expectedMuiVars();
    // A font family is emitted as its token, which the IR names only through the text style.
    const families = [...used].filter((v) =>
      v.startsWith('--solar-type-font-family-'),
    );
    for (const f of families) expected.add(f);
    expect(
      [...used].filter((v) => !expected.has(v)),
      'in MUI, not implied by the IR',
    ).toEqual([]);
    expect(
      [...expected].filter((v) => !used.has(v)),
      'implied by the IR, missing in MUI',
    ).toEqual([]);
  });

  it('holds a raw value only where the overlay allowed one, the same ones on both platforms', () => {
    const allowed = new Set();
    const walk = (node) => {
      for (const v of Object.values(node))
        if (v && typeof v === 'object') {
          if ('literal' in v) {
            expect(v.allowed, `unallowed literal ${v.literal}`).toBeTruthy();
            allowed.add(v.literal);
          } else walk(v);
        }
    };
    walk(ir.style);
    const muiPx = new Set(
      leaves({ ...muiStyles, reset: {} })
        .filter((v) => /^\d+px$/.test(v))
        .map((v) => Number.parseInt(v, 10)),
    );
    const dartPx = new Set(
      Object.values(cells)
        .filter((v) => v.startsWith('px:'))
        .map((v) => Number(v.slice(3))),
    );
    // The icon and counter heights are allowed but drawn by their own children, so the Button's
    // MUI recipe never writes them; everything it does write must be allowed.
    for (const px of muiPx) expect(allowed, `MUI ${px}px`).toContain(px);
    expect([...dartPx].sort()).toEqual([...allowed].sort());
  });

  it('never holds a colour literal on either platform', () => {
    expect(muiTs).not.toMatch(/#[0-9a-f]{6}\b|rgba?\(/i);
    expect(dart).not.toMatch(/Color\(0x/);
  });
});

describe('component parity: slots', () => {
  it('the React shell reaches every slot the IR has, through its mapping', () => {
    const { react } = apiOf(ir);
    for (const slot of Object.keys(ir.slots))
      if (react[slot] === 'children') expect(shell).toContain('{children}');
      else expect(shell).toMatch(new RegExp(`\\b${react[slot]}\\?: ReactNode`));
  });

  it('Flutter can answer whether each slot is drawn', () => {
    for (const [slot, def] of Object.entries(ir.slots)) {
      const base = cells[`${slot}.present|base`];
      expect(base, slot).toBe(`b:${def.visible}`);
    }
  });
});

// Entry by entry, not token sets: a platform that swapped hover for rest would still name every
// token, and only a per-entry comparison sees it.
describe('component parity: every entry, in place', () => {
  /** Every IR entry with where it sits: [layer, cell, section, size?, combo?, state?, entry]. */
  function entries() {
    const out = [];
    for (const [layer, s] of Object.entries(ir.style)) {
      for (const [cell, e] of Object.entries(s.base))
        out.push({ layer, cell, section: 'base', e });
      for (const [size, c] of Object.entries(s.size))
        for (const [cell, e] of Object.entries(c))
          out.push({ layer, cell, section: 'size', size, e });
      for (const [combo, states] of Object.entries(s.appearance))
        for (const [state, c] of Object.entries(states))
          for (const [cell, e] of Object.entries(c))
            out.push({ layer, cell, section: 'appearance', combo, state, e });
      for (const [size, byCombo] of Object.entries(s.combined ?? {}))
        for (const [combo, states] of Object.entries(byCombo))
          for (const [state, c] of Object.entries(states))
            for (const [cell, e] of Object.entries(c))
              out.push({
                layer,
                cell,
                section: 'combined',
                size,
                combo,
                state,
                e,
              });
    }
    return out;
  }

  it('Flutter holds each IR entry at its own key, with its own value, and adds only restated overlaps', () => {
    const encode = (e) =>
      e.token
        ? `t:${e.token}`
        : e.none
          ? 'none'
          : e.keyword !== undefined
            ? `k:${e.keyword}`
            : e.value !== undefined
              ? `b:${e.value}`
              : `px:${e.literal}`;
    const all = entries();
    for (const { layer, cell, section, size, combo, state, e } of all) {
      const key = [`${layer}.${cell}`, section, size, combo, state]
        .filter((x) => x !== undefined)
        .join('|');
      expect(cells[key], key).toBe(encode(e));
    }
    // Beyond the IR, only what a state overlapping another restates (a pressed tertiary is hovered
    // too), each with the value MUI holds under that state's selector.
    const own = new Set(
      all.map(({ layer, cell, section, size, combo, state }) =>
        [`${layer}.${cell}`, section, size, combo, state]
          .filter((x) => x !== undefined)
          .join('|'),
      ),
    );
    const extra = Object.keys(cells).filter((k) => !own.has(k));
    expect(extra.length).toBeGreaterThan(0);
    for (const key of extra) {
      const [, section, size, combo, state] = key.split('|');
      expect(section, key).toBe('combined');
      expect(Object.keys(OVERLAPS.Button)).toContain(state);
      const node = muiStyles.combined[size][combo][SELECTORS[state]];
      expect(node, key).toBeDefined();
    }
  });

  // The cells whose CSS property is one-to-one, on the layers MUI draws at the root.
  const CSS = {
    background: ['backgroundColor', 'transparent'],
    borderColor: ['borderColor', 'transparent'],
    color: ['color', 'transparent'],
    shadow: ['boxShadow', 'none'],
    radius: ['borderRadius', null],
    gap: ['gap', null],
    paddingLeft: ['paddingLeft', null],
    paddingRight: ['paddingRight', null],
  };
  const selectorOf = new Map(Object.entries(SELECTORS));

  it('MUI holds each colour, shadow, radius and spacing entry at its selector, with its value', () => {
    let checked = 0;
    for (const { layer, cell, section, size, combo, state, e } of entries()) {
      if (
        !['root', 'label'].includes(layer) ||
        !CSS[cell] ||
        e.literal !== undefined
      )
        continue;
      const [prop, none] = CSS[cell];
      const want = e.none
        ? (none ?? 'var(--solar-radius-none)')
        : `var(--solar-${e.token.replaceAll('.', '-')})`;
      let node =
        section === 'base'
          ? muiStyles.root
          : section === 'size'
            ? muiStyles.sizes[size]
            : section === 'appearance'
              ? muiStyles.appearances[combo]
              : muiStyles.combined[size][combo];
      const sel = state && selectorOf.get(state);
      if (sel) node = node?.[sel];
      expect(
        node?.[prop],
        `${layer}.${cell} ${section} ${size ?? ''} ${combo ?? ''} ${state ?? ''}`,
      ).toBe(want);
      checked++;
    }
    expect(checked).toBeGreaterThan(100);
  });
});

// The widgets developers use, not the generated props classes alone: the React shell and the
// Flutter widget are written by hand, files of their own, so either can drift from the IR, and
// this is what notices.
describe('component parity: the React and Flutter widgets', () => {
  /** The names a React shell destructures from its props, as the app's theme gives them. */
  function reactProps(source, name) {
    const m = new RegExp(
      `const \\{([\\s\\S]*?)\\}\\s*=\\s*useSolarProps\\(\\s*inProps,\\s*'Solar${name}',?\\s*\\)`,
    ).exec(source);
    if (!m)
      throw new Error(
        `${name}: no props read through useSolarProps in the shell`,
      );
    return (
      m[1]
        .split(',')
        // A prop with a default (`children = 'Back'`), or renamed (`checked: checkedProp`, which
        // the shell reads beside its own state), by its name.
        .map((p) => p.trim().split(/\s*[=:]/)[0])
        .filter((p) => p && !p.startsWith('...'))
    );
  }

  /** A Flutter widget's constructor parameters, as {name: default or null}. */
  function dartParams(source, name) {
    const m = new RegExp(`const Solar${name}\\(\\{([\\s\\S]*?)\\}\\)`).exec(
      source,
    );
    if (!m) throw new Error(`Solar${name}: no constructor in the widget`);
    return Object.fromEntries(
      [...m[1].matchAll(/this\.(\w+)(?:\s*=\s*([^,\n]+))?/g)].map(
        ([, param, def]) => [param, def?.trim() ?? null],
      ),
    );
  }

  // A component checked as another's state (Autocomplete Open) has no shells of its own.
  const shelled = built.filter(
    ({ spec }) =>
      !DESCRIPTORS.find((d) => d.name === spec.component)?.checkedAs,
  );
  for (const { spec } of shelled) {
    // `Icon Button` is IconButton.tsx and solar_icon_button.dart, as the shells are named.
    const name = pascal(spec.component);
    const react = reactProps(
      read('components', 'src', shellFileOf(spec.component)),
      name,
    );
    const flutter = dartParams(
      read(
        'solar_flutter',
        'lib',
        'src',
        'components',
        flutterFileOf(spec.component),
      ),
      name,
    );

    const reactSource = read('components', 'src', shellFileOf(spec.component));
    const flutterSource = read(
      'solar_flutter',
      'lib',
      'src',
      'components',
      flutterFileOf(spec.component),
    );
    const api = apiOf(spec);

    // Every prop and slot of the IR, and every prop a derived axis follows from, is reached on
    // each platform, by the member its mapping names: its spelling and mechanism are its own.
    it(`${spec.component}: React reaches every prop and slot of the IR`, () => {
      expect(unreached(api.react, react, reactSource)).toEqual([]);
    });

    it(`${spec.component}: Flutter reaches every prop and slot of the IR`, () => {
      expect(
        unreached(api.flutter, Object.keys(flutter), flutterSource),
      ).toEqual([]);
    });

    // What the IR decides of the drawing reaches the shells, which are written by hand, with no
    // edit to them: the layer tree is the generated one, never a copy, and each icon Figma names
    // is the one the shell draws.
    it(`${spec.component}: draws the IR's layer tree, the generated one`, () => {
      expect(reactSource).not.toMatch(/const TREE\b|tree: \{/);
      expect(flutterSource).not.toMatch(/static const _tree\b|tree: const \{/);
      if (/\btree:/.test(reactSource))
        expect(reactSource).toContain(`tree: solar${name}Tree`);
      if (/\btree:/.test(flutterSource))
        expect(flutterSource).toContain(`tree: Solar${name}Recipe.tree`);
    });

    it(`${spec.component}: draws each icon its IR names, on both platforms`, () => {
      for (const i of iconsOf(spec))
        for (const x of i.byAxis ? Object.values(i.byAxis.values) : [i]) {
          // Figma's placeholder where the caller's icon goes (Tag's, Number Input's): no SOLAR icon.
          if (x.react === 'IconNone') continue;
          expect(reactSource, i.layer).toMatch(new RegExp(`<${x.react}\\b`));
          expect(flutterSource, i.layer).toContain(x.dart);
        }
    });

    it(`${spec.component}: reads its React props through the app's MUI theme`, () => {
      expect(reactSource).toMatch(
        new RegExp(`useSolarProps\\(\\s*inProps,\\s*'Solar${name}'`),
      );
    });

    it(`${spec.component}: Flutter defaults to the IR's defaults where it takes the prop`, () => {
      for (const [prop, def] of Object.entries(spec.api)) {
        // A colour the caller gives (Avatar's) has no default on either platform; a prop reached
        // another way (a group's, a callback's) has none of its own.
        const member = api.flutter[prop];
        // A negated member (a field's `enabled`) defaults to the negation of the IR's default.
        if (member?.not && def.type === 'boolean') {
          expect(flutter[member.not], member.not).toBe(String(!def.default));
          continue;
        }
        if (def.type === 'color' || member !== prop) continue;
        // An enum value as the emitter spells it in Dart (`top-search` is `topSearch`).
        const expected =
          def.type === 'boolean'
            ? String(def.default)
            : `.${dartEnumValue(def.default)}`;
        if (def.type === 'boolean') expect(flutter[prop], prop).toBe(expected);
        else expect(flutter[prop].endsWith(expected), prop).toBe(true);
      }
    });
  }
});

describe('component parity: the mapping', () => {
  const tag = built.find((b) => b.spec.component === 'Tag').spec;
  const flutterTag = [
    'status',
    'invert',
    'label',
    'icon',
    'indicator',
    'onClose',
  ];

  it('fails a shell that does not reach a slot, naming the slot', () => {
    const without = flutterTag.filter((p) => p !== 'icon');
    expect(unreached(apiOf(tag).flutter, without, '')).toEqual([
      'icon ("icon")',
    ]);
  });

  it('passes a platform that spells a prop its own way, where its mapping says so', () => {
    const spelled = flutterTag.map((p) => (p === 'invert' ? 'inverted' : p));
    expect(unreached(apiOf(tag).flutter, spelled, '')).toEqual([
      'invert ("invert")',
    ]);
    const mapped = apiOf(tag, { flutter: { invert: 'inverted' } }).flutter;
    expect(unreached(mapped, spelled, '')).toEqual([]);
  });

  it('reaches a prop through its negation, where its mapping says so, and fails without it', () => {
    const text = built.find((b) => b.spec.component === 'Text Input').spec;
    const mapping = apiOf(text).flutter;
    expect(mapping.disabled).toEqual({ not: 'enabled' });
    const members = Object.values(mapping).map((m) => m?.not ?? m);
    expect(unreached(mapping, members, '')).toEqual([]);
    expect(
      unreached(
        mapping,
        members.filter((m) => m !== 'enabled'),
        '',
      ),
    ).toEqual(['disabled ({"not":"enabled"})']);
  });

  it('refuses a mapping of what the IR does not name, as a stale overlay rule is', () => {
    expect(() => apiOf(tag, { flutter: { nothing: 'x' } })).toThrow(
      /maps what its IR does not name/,
    );
  });
});
