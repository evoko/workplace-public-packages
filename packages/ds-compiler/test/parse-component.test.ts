import { describe, expect, it } from 'vitest';
import type { DsConfig } from '../src/config.js';
import type { Manifest } from '../src/components/manifest.js';
import { parseComponentCss } from '../src/components/parse-component.js';
import { Diagnostics } from '../src/errors.js';
import { parseTokenFile } from '../src/tokens/parse-tokens.js';
import { resolveTokens } from '../src/tokens/resolve-tokens.js';

const config: DsConfig = {
  name: 'Fictional',
  prefix: 'fx',
  modes: ['light', 'dark'],
  defaultMode: 'light',
  rootFontSize: 16,
  modeSelector: ':root[data-fx-theme="{mode}"]',
  targets: {},
  coverageFile: 'coverage.md',
};

const tokenFiles: Record<string, string> = {
  'color.css':
    ':root { --fx-color-brand: #1863d3; --fx-color-text: #111; --fx-color-border: #ccc; }',
  'space.css': ':root { --fx-space-1: 4px; --fx-space-2: 8px; }',
  'radius.css': ':root { --fx-radius-md: 6px; }',
  'font-family.css':
    ":root { --fx-font-family-body: 'Open Sans', sans-serif; }",
  'font-size.css': ':root { --fx-font-size-md: 1rem; }',
  'line-height.css': ':root { --fx-line-height-tight: 1.25; }',
  'duration.css': ':root { --fx-duration-fast: 150ms; }',
};

const manifest: Manifest = {
  name: 'button',
  displayName: 'Button',
  axes: {
    variant: { values: ['solid', 'outline'], default: 'solid' },
    size: { values: ['sm', 'md'], default: 'md' },
  },
  states: ['hover', 'disabled'],
  slots: {
    root: { element: 'button', optional: false },
    icon: { element: 'span', optional: true },
  },
  preview: {},
  targets: {},
};

function tokens() {
  const diag = new Diagnostics();
  const raws = Object.entries(tokenFiles).flatMap(([f, css]) =>
    parseTokenFile(`src/tokens/${f}`, css, config, diag),
  );
  return resolveTokens(raws, config, diag);
}

/** Builds a minimal manifest named "x" with the given states and slots (root always present). */
function manifestFor(opts: {
  states: string[];
  slots: Record<string, { element: string }>;
}): Manifest {
  return {
    name: 'x',
    displayName: 'X',
    axes: {},
    states: opts.states,
    slots: Object.fromEntries(
      Object.entries(opts.slots).map(([slot, { element }]) => [
        slot,
        { element, optional: false },
      ]),
    ),
    preview: {},
    targets: {},
  };
}

function parse(css: string) {
  const diag = new Diagnostics();
  const ir = parseComponentCss(
    'button.css',
    css,
    manifest,
    tokens(),
    config,
    diag,
  );
  return { ir, diag, codes: diag.errors.map((e) => e.code) };
}

describe('parseComponentCss', () => {
  it('builds normalized rules in cascade order with token and literal values', () => {
    const { ir, diag } = parse(`
.fx-button .fx-button__icon { width: var(--fx-space-2); }
.fx-button[data-size="sm"] { padding: var(--fx-space-1) var(--fx-space-2); }
.fx-button[data-variant="outline"]:hover { color: var(--fx-color-brand); }
.fx-button:disabled { cursor: not-allowed; opacity: 0.4; }
.fx-button[data-variant="outline"] { background-color: transparent; }
.fx-button:hover { background-color: var(--fx-color-brand); }
.fx-button {
  display: inline-flex;
  color: var(--fx-color-text);
  border-radius: var(--fx-radius-md);
  transition-property: color, background-color;
  transition-duration: var(--fx-duration-fast);
}
`);
    expect(diag.items).toEqual([]);
    expect(ir?.rules.map((r) => [r.slot, r.axes, r.states])).toEqual([
      ['root', {}, []],
      ['root', {}, ['hover']],
      ['root', {}, ['disabled']],
      ['root', { variant: 'outline' }, []],
      ['root', { variant: 'outline' }, ['hover']],
      ['root', { size: 'sm' }, []],
      ['icon', {}, []],
    ]);
    const base = ir!.rules[0];
    expect(base.declarations).toEqual({
      display: { kind: 'literal', type: 'keyword', value: 'inline-flex' },
      color: { kind: 'token', ref: 'color.text' },
      'border-top-left-radius': { kind: 'token', ref: 'radius.md' },
      'border-top-right-radius': { kind: 'token', ref: 'radius.md' },
      'border-bottom-right-radius': { kind: 'token', ref: 'radius.md' },
      'border-bottom-left-radius': { kind: 'token', ref: 'radius.md' },
      'transition-property': {
        kind: 'literal',
        type: 'string',
        value: 'color, background-color',
      },
      'transition-duration': { kind: 'token', ref: 'duration.fast' },
    });
    expect(base.source).toEqual({ file: 'button.css', line: 8, column: 1 });
    expect(ir!.rules[5].declarations).toEqual({
      'padding-top': { kind: 'token', ref: 'space.1' },
      'padding-right': { kind: 'token', ref: 'space.2' },
      'padding-bottom': { kind: 'token', ref: 'space.1' },
      'padding-left': { kind: 'token', ref: 'space.2' },
    });
    expect(ir!.rules[2].declarations.opacity).toEqual({
      kind: 'literal',
      type: 'number',
      value: 0.4,
    });
    expect(ir!.name).toBe('button');
    expect(ir!.slots.icon.optional).toBe(true);
  });

  it('merges rules with the same key from different source rules and selector lists', () => {
    const { ir, diag } = parse(`
.fx-button:hover, .fx-button[data-variant="outline"] { color: var(--fx-color-brand); }
.fx-button:hover { opacity: 0.9; }
`);
    expect(diag.items).toEqual([]);
    expect(ir?.rules).toHaveLength(2);
    expect(Object.keys(ir!.rules[0].declarations).sort()).toEqual([
      'color',
      'opacity',
    ]);
  });

  it('reports DS-E046 when the same key sets a property to two values', () => {
    const { codes } = parse(`
.fx-button:hover { color: var(--fx-color-brand); }
.fx-button:hover { color: var(--fx-color-text); }
`);
    expect(codes).toEqual(['DS-E046']);
  });

  it('allows an identical duplicate declaration', () => {
    const { codes } = parse(`
.fx-button { color: var(--fx-color-text); }
.fx-button { color: var(--fx-color-text); }
`);
    expect(codes).toEqual([]);
  });

  it('reports DS-E046 when a shorthand is followed by a conflicting longhand in the same rule', () => {
    const { codes, ir } = parse(`
.fx-button { padding: var(--fx-space-1); padding-top: var(--fx-space-2); }
`);
    expect(codes).toEqual(['DS-E046']);
    // The first value (from the shorthand) is kept.
    expect(ir!.rules[0].declarations['padding-top']).toEqual({
      kind: 'token',
      ref: 'space.1',
    });
  });

  it('allows an identical duplicate declaration within the same rule block', () => {
    const { codes, ir } = parse(`
.fx-button { color: var(--fx-color-text); color: var(--fx-color-text); }
`);
    expect(codes).toEqual([]);
    expect(ir!.rules[0].declarations.color).toEqual({
      kind: 'token',
      ref: 'color.text',
    });
  });

  it('drops a rule whose block has no resolvable declarations', () => {
    const { ir, diag } = parse(`
.fx-button {
  /* nothing here, just a comment */
}
`);
    expect(diag.items).toEqual([]);
    expect(ir?.rules).toEqual([]);
  });

  it('reports one diagnostic per bad selector, computes the declaration error once, and keeps declarations only on the valid key', () => {
    const { diag, ir } = parse(`
.fx-button:hover, .fx-button[data-bogus="x"] {
  color: var(--fx-color-text);
  padding-top: var(--fx-color-text);
}
`);
    // padding-top's category mismatch is reported once even though the rule
    // has two selectors; the bad selector adds exactly one more diagnostic.
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E044', 'DS-E031']);
    expect(ir!.rules).toHaveLength(1);
    expect(ir!.rules[0]).toMatchObject({
      slot: 'root',
      axes: {},
      states: ['hover'],
    });
    expect(ir!.rules[0].declarations).toEqual({
      color: { kind: 'token', ref: 'color.text' },
    });
  });

  it('reports DS-E034 for at-rules, nesting, !important, and stray declarations', () => {
    const { codes } = parse(`
@media (min-width: 600px) { .fx-button { display: flex; } }
.fx-button { color: var(--fx-color-text) !important; }
.fx-button { &:hover { color: var(--fx-color-text); } }
`);
    expect(codes).toEqual(['DS-E034', 'DS-E034', 'DS-E034']);
  });

  it('reports DS-E040, DS-E041, DS-E042, DS-E043, DS-E044, DS-E045', () => {
    const { diag } = parse(`
.fx-button {
  colr: red;
  color: #fff;
  display: flexbox;
  color: var(--fx-color-missing);
  padding-top: var(--fx-color-text);
  border: 1px solid red;
  margin: var(--fx-space-1) var(--fx-space-1) var(--fx-space-1) var(--fx-space-1) var(--fx-space-1);
  gap: var(--fx-space-1, 4px);
}
`);
    expect(diag.errors.map((e) => e.code)).toEqual([
      'DS-E040',
      'DS-E041',
      'DS-E042',
      'DS-E043',
      'DS-E044',
      'DS-E045',
      'DS-E042',
      'DS-E042',
      'DS-E042',
    ]);
    expect(diag.errors[0].location).toEqual({
      file: 'button.css',
      line: 3,
      column: 3,
    });
    expect(diag.errors[1].message).toContain('color token');
  });

  it('reports DS-E044 with a token-refusal message for a property that accepts no token category', () => {
    const { diag } = parse(`
.fx-button { transition-property: var(--fx-color-text); }
`);
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E044']);
    expect(diag.errors[0].message).toBe(
      '"transition-property" does not accept token references',
    );
  });

  it('returns null and DS-E061 on a CSS syntax error', () => {
    const { ir, codes } = parse('.fx-button { color: ');
    expect(ir).toBeNull();
    expect(codes).toEqual(['DS-E061']);
  });

  it('warns DS-W003 when :disabled or [disabled] is used on a non-form root', () => {
    const divManifest = manifestFor({
      states: ['disabled'],
      slots: { root: { element: 'div' } },
    });
    const warn = new Diagnostics();
    parseComponentCss(
      'src/components/x/x.css',
      `.fx-x:disabled { opacity: 0.4; }\n.fx-x[disabled] { opacity: 0.4; }`,
      divManifest,
      tokens(),
      config,
      warn,
    );
    expect(warn.warnings.map((d) => d.code)).toEqual(['DS-W003', 'DS-W003']);
    expect(warn.errors).toEqual([]);

    const aria = new Diagnostics();
    parseComponentCss(
      'src/components/x/x.css',
      `.fx-x[aria-disabled="true"] { opacity: 0.4; }`,
      divManifest,
      tokens(),
      config,
      aria,
    );
    expect(aria.items).toEqual([]);

    const buttonManifest = manifestFor({
      states: ['disabled'],
      slots: { root: { element: 'button' } },
    });
    const ok = new Diagnostics();
    parseComponentCss(
      'src/components/x/x.css',
      `.fx-x:disabled { opacity: 0.4; }`,
      buttonManifest,
      tokens(),
      config,
      ok,
    );
    expect(ok.items).toEqual([]);
  });

  it('warns once with only the disabled selector when a rule lists multiple selectors', () => {
    const divManifest = manifestFor({
      states: ['hover', 'disabled'],
      slots: { root: { element: 'div' } },
    });
    const diag = new Diagnostics();
    parseComponentCss(
      'src/components/x/x.css',
      '.fx-x:hover, .fx-x:disabled { opacity: 0.4; }',
      divManifest,
      tokens(),
      config,
      diag,
    );
    expect(diag.warnings).toHaveLength(1);
    expect(diag.warnings[0].code).toBe('DS-W003');
    expect(diag.warnings[0].message).toContain('.fx-x:disabled');
    expect(diag.warnings[0].message).not.toContain(':hover');
  });
});
