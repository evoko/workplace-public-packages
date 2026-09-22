import { beforeAll, describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { flattenSpec } from '../src/spec.mjs';
import { canonical } from '../src/emit/manifest.mjs';
import { renderCss } from '../src/emit/css.mjs';
import { renderMui } from '../src/emit/mui.mjs';
import { renderTailwind } from '../src/emit/tailwind.mjs';
import { dartName, MODAL_CLASS, renderFlutter } from '../src/emit/flutter.mjs';

let spec, tokens, byName, rendered, manifests;

beforeAll(() => {
  spec = buildTokenSpec(loadContract()).spec;
  tokens = flattenSpec(spec);
  byName = new Map(tokens.map((t) => [t.name, t]));
  rendered = {
    css: renderCss(spec),
    mui: renderMui(spec),
    tailwind: renderTailwind(spec),
    flutter: renderFlutter(spec),
  };
  manifests = Object.fromEntries(
    Object.entries(rendered).map(([target, r]) => [target, r.manifest]),
  );
});

/** The mode names a token varies over, or null when it is mode invariant. */
const modeNames = (t) =>
  t.type === 'typography'
    ? ['desktop', 'mobile']
    : t.modes
      ? Object.keys(t.modes)
      : null;

/** The spec value for one mode. `ext.modes` holds only the fields a text style overrides. */
const specValue = (t, mode) =>
  t.type === 'typography'
    ? { ...t.value, ...t.ext.modes[mode] }
    : t.modes[mode];

const show = (v) => JSON.stringify(v);

/** Every `--solar-*` declaration in the generated stylesheet, as "<var> [<mode>]". */
const cssDeclarations = (css) => {
  const block = (open) => {
    const from = css.indexOf('{', css.indexOf(open)) + 1;
    return css.slice(from, css.indexOf('\n}', from));
  };
  // Light and Desktop are both the unqualified :root rule; the other two are the overrides.
  const blocks = {
    light: block(':root {'),
    desktop: block(':root {'),
    dark: block("[data-theme='dark'] {"),
    mobile: block('@media (max-width: 767.98px)'),
  };
  const out = new Set();
  for (const [mode, text] of Object.entries(blocks))
    for (const m of text.matchAll(/^\s*(--solar-[\w-]+):/gm))
      out.add(`${m[1]} [${mode}]`);
  return out;
};

/** Every token the MUI data module actually carries, as "<name> [<mode>]". */
const muiKeys = (data) => {
  const out = new Set();
  const add = (group, prefix = '') => {
    for (const [mode, entries] of Object.entries(group))
      for (const name of Object.keys(entries))
        out.add(`${prefix}${name} [${mode}]`);
  };
  add(data.tokens);
  add(data.viewport);
  add(data.typography, 'typography.');
  for (const [name, modes] of Object.entries(data.shadows))
    for (const mode of Object.keys(modes)) out.add(`shadow.${name} [${mode}]`);
  return out;
};

/** Every field assigned in a generated Dart mode instance, as "<Class>.<field> [<mode>]". */
const dartFields = (dart) => {
  const out = new Set();
  for (const m of dart.matchAll(
    /static const (\w+) (\w+) = \1\(\n([\s\S]*?)\n {2}\);/g,
  ))
    for (const f of m[3].matchAll(/^\s*(\$?\w+):/gm))
      out.add(`${m[1]}.${f[1]} [${m[2]}]`);
  return out;
};

/** Where one token for one mode should appear in a given target's output. */
const artifactKey = (target, t, mode) => {
  if (target === 'css')
    return `--solar-${t.name.replaceAll('.', '-')} [${mode}]`;
  if (target === 'mui') return `${t.name} [${mode}]`;
  const [head, ...rest] = t.name.split('.');
  return `${MODAL_CLASS[head]}.${dartName(rest.join('.'))} [${mode}]`;
};

describe('token parity', () => {
  it('every emitted token exists in the spec', () => {
    for (const [target, m] of Object.entries(manifests)) {
      for (const name of Object.keys(m)) {
        expect(
          byName.has(name),
          `${target} emitted unknown token ${name}`,
        ).toBe(true);
      }
    }
  });

  it('css covers every non-typography token, mui and flutter cover every token', () => {
    for (const t of tokens) {
      if (t.type !== 'typography') {
        expect(manifests.css[t.name], `css is missing ${t.name}`).toBeDefined();
      }
      expect(manifests.mui[t.name], `mui is missing ${t.name}`).toBeDefined();
      expect(
        manifests.flutter[t.name],
        `flutter is missing ${t.name}`,
      ).toBeDefined();
    }
  });

  it('tailwind exposes the semantic layer, and a primitive only where SOLAR has no semantic one', () => {
    for (const name of Object.keys(manifests.tailwind)) {
      if (byName.get(name).ext.tier !== 'primitive') continue;
      // motion and the font families are the only ones with no semantic layer in SOLAR
      expect(name, `${name} is an unexpected primitive`).toMatch(
        /^(motion|type\.font-family)\./,
      );
    }
    expect(Object.keys(manifests.tailwind).length).toBeGreaterThan(100);
  });

  it('tailwind points at the CSS variables, except breakpoints, which media queries cannot read', () => {
    for (const [name, e] of Object.entries(manifests.tailwind)) {
      if (name.startsWith('layout.breakpoint.')) {
        expect(e.emitted).toBe(byName.get(name).value);
      } else {
        expect(e.emitted).toBe(`var(--solar-${name.replaceAll('.', '-')})`);
      }
    }
  });

  it('every target that emits a token agrees on its canonical value', () => {
    const mismatches = [];
    for (const t of tokens) {
      const seen = Object.entries(manifests)
        .map(([target, m]) => [target, m[t.name]])
        .filter(([, e]) => e !== undefined);
      if (seen.length < 2) continue;
      const [firstTarget, first] = seen[0];
      for (const [target, e] of seen.slice(1)) {
        if (show(e.normalized) !== show(first.normalized)) {
          mismatches.push(
            `${t.name}: ${firstTarget}=${show(first.normalized)} vs ${target}=${show(e.normalized)}`,
          );
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('every target that records a mode agrees on that mode', () => {
    const mismatches = [];
    for (const t of tokens) {
      for (const mode of modeNames(t) ?? []) {
        const seen = Object.entries(manifests)
          .map(([target, m]) => [target, m[t.name]?.modes?.[mode]])
          .filter(([, v]) => v !== undefined);
        if (seen.length < 2) continue;
        const [firstTarget, first] = seen[0];
        for (const [target, v] of seen.slice(1)) {
          if (show(v) !== show(first)) {
            mismatches.push(
              `${t.name} [${mode}]: ${firstTarget}=${show(first)} vs ${target}=${show(v)}`,
            );
          }
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('matches the spec value, not just each other', () => {
    // Agreement alone would pass if every target were uniformly wrong, so each value is also
    // checked against the spec. Shadows are excluded: their layers resolve a colour alias, so
    // there is no single spec value to compare and cross-target agreement covers them.
    const mismatches = [];
    for (const t of tokens) {
      if (t.type === 'shadow') continue;
      const base = show(canonical[t.type](t.value));
      for (const [target, m] of Object.entries(manifests)) {
        const e = m[t.name];
        if (!e) continue;
        if (show(e.normalized) !== base)
          mismatches.push(
            `${t.name}: ${target}=${show(e.normalized)} vs spec=${base}`,
          );
        for (const [mode, v] of Object.entries(e.modes ?? {})) {
          const want = show(canonical[t.type](specValue(t, mode)));
          if (show(v) !== want)
            mismatches.push(
              `${t.name} [${mode}]: ${target}=${show(v)} vs spec=${want}`,
            );
        }
      }
    }
    expect(mismatches).toEqual([]);
  });

  it('no target silently drops a mode axis', () => {
    // Tailwind is exempt: every entry it emits is a var() reference into the CSS target, so it
    // inherits both modes at runtime and has nothing of its own to record.
    const missing = [];
    for (const t of tokens) {
      const modes = modeNames(t);
      if (!modes) continue;
      for (const target of ['css', 'mui', 'flutter']) {
        // CSS does not emit typography composites at all; they exist there as type.* parts.
        if (target === 'css' && t.type === 'typography') continue;
        const e = manifests[target][t.name];
        for (const mode of modes)
          if (e?.modes?.[mode] === undefined)
            missing.push(`${t.name} [${mode}]: ${target} recorded nothing`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('claims no mode the generated output does not actually contain', () => {
    // Every assertion above reads the manifest, which each emitter builds alongside its output
    // rather than from it. That leaves the manifest able to promise a mode the artifact never
    // received, which is exactly the defect parity exists to catch, so the artifacts are read
    // back here and the promise is checked against them.
    const present = {
      css: cssDeclarations(rendered.css.css),
      mui: muiKeys(rendered.mui.data),
      flutter: dartFields(rendered.flutter.dart),
    };
    const unmet = [];
    for (const t of tokens) {
      for (const mode of modeNames(t) ?? []) {
        for (const target of ['css', 'mui', 'flutter']) {
          if (manifests[target][t.name]?.modes?.[mode] === undefined) continue;
          const key = artifactKey(target, t, mode);
          if (!present[target].has(key))
            unmet.push(
              `${t.name} [${mode}]: ${target} manifest claims it, ${key} is not in the output`,
            );
        }
      }
    }
    expect(unmet).toEqual([]);
  });
});
