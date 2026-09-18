import { describe, expect, it } from 'vitest';
import { buildIR } from '../src/build.js';
import { Diagnostics } from '../src/errors.js';
import { TARGETS } from '../src/targets/index.js';
import { tailwindPlugin } from '../src/targets/tailwind/index.js';
import { manifestFromComponent } from '../src/targets/tailwind/reparse.js';
import { diffIR, ruleDiffKey } from '../src/verify/ir-diff.js';
import { FIXTURE_MINI } from './helpers.js';
import { twBuild, twContext, twRoot } from './tailwind-fixture.js';

function scopeFor(ir: ReturnType<typeof twBuild>['ir']) {
  return {
    components: Object.keys(ir.components).filter((n) =>
      tailwindPlugin.isMapped(ir.components[n]),
    ),
    ignored: (name: string) =>
      tailwindPlugin.ignoredProperties(ir.components[name]),
  };
}

describe('tailwind round-trip', () => {
  it('is registered', () => {
    expect(Object.keys(TARGETS).sort()).toEqual(['mui', 'tailwind']);
    expect(TARGETS.tailwind).toBe(tailwindPlugin);
  });

  it('reparses its own output to the source IR on the small fixture', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const diag = new Diagnostics();
    const reparsed = tailwindPlugin.reparse(
      tailwindPlugin.generate(ir, null, ctx, new Diagnostics()),
      ir,
      ctx,
      diag,
    );
    expect(diag.items).toEqual([]);
    expect(reparsed).not.toBeNull();
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
    // tokens survive exactly, including per-mode aliases and shadow color refs
    expect(reparsed!.tokens['color.text.default']).toMatchObject({
      modeInvariant: false,
      alias: { light: 'color.neutral.900' },
    });
    expect(reparsed!.tokens['shadow.focus'].$value).toEqual(
      ir.tokens['shadow.focus'].$value,
    );
    // excluded components are not part of the output
    expect(reparsed!.components.pill).toBeUndefined();
  });

  it('reparses the mini fixture to its source IR', () => {
    const result = buildIR(FIXTURE_MINI);
    const ir = result.ir!;
    const ctx = {
      rootDir: FIXTURE_MINI,
      config: result.config!,
      compilerVersion: '0.0.0-test',
      outDir: `${FIXTURE_MINI}out`,
    };
    const diag = new Diagnostics();
    const reparsed = tailwindPlugin.reparse(
      tailwindPlugin.generate(ir, null, ctx, new Diagnostics()),
      ir,
      ctx,
      diag,
    );
    expect(diag.items).toEqual([]);
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
  });

  it('a component whose every declaration is ignored round-trips with no differences', () => {
    const root = twRoot({
      'src/components/blob/blob.manifest.json': JSON.stringify({
        name: 'blob',
        displayName: 'Blob',
        baseline: false,
        targets: { tailwind: { ignore: ['opacity'] } },
      }),
      'src/components/blob/blob.css': '.fx-blob {\n  opacity: 0.5;\n}\n',
    });
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const diag = new Diagnostics();
    const reparsed = tailwindPlugin.reparse(
      tailwindPlugin.generate(ir, null, ctx, new Diagnostics()),
      ir,
      ctx,
      diag,
    );
    expect(diag.items).toEqual([]);
    expect(reparsed).not.toBeNull();
    expect(reparsed!.components.blob).toBeUndefined();
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
  });

  it('reports a changed declaration, a missing token, and unknown variables', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const files = tailwindPlugin.generate(ir, null, ctx, new Diagnostics());
    const tampered = files.map((f) =>
      f.path === 'components.css'
        ? {
            ...f,
            contents: f.contents.replace(
              'min-width: 44px;',
              'min-width: 40px;',
            ),
          }
        : f.path === 'theme.css'
          ? {
              ...f,
              contents: f.contents.replace('  --spacing-fx-2: 8px;\n', ''),
            }
          : f,
    );
    const diag = new Diagnostics();
    const reparsed = tailwindPlugin.reparse(tampered, ir, ctx, diag);
    // removing the space token makes the chip's four padding longhands unresolvable
    expect(diag.errors.length).toBeGreaterThan(0);
    expect(new Set(diag.errors.map((d) => d.code))).toEqual(
      new Set(['DS-E081']),
    );
    expect(diag.errors[0].message).toContain('DS-E043');
    expect(reparsed).toBeNull();

    const onlyCss = files.map((f) =>
      f.path === 'components.css'
        ? {
            ...f,
            contents: f.contents.replace(
              'min-width: 44px;',
              'min-width: 40px;',
            ),
          }
        : f,
    );
    const d2 = new Diagnostics();
    const r2 = tailwindPlugin.reparse(onlyCss, ir, ctx, d2)!;
    const diffs = diffIR(ir, r2, scopeFor(ir));
    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toMatchObject({
      kind: 'declaration',
      id: 'chip root[data-tone="loud"] min-width',
    });
    const loudRule = ir.components.chip.rules.find(
      (r) => ruleDiffKey(r) === 'root[data-tone="loud"]',
    )!;
    expect(diffs[0].location).toEqual(loudRule.source);

    const unknownVar = files.map((f) =>
      f.path === 'theme.css'
        ? {
            ...f,
            contents: f.contents.replace('--spacing-fx-2', '--tw-mystery'),
          }
        : f,
    );
    const d3 = new Diagnostics();
    expect(tailwindPlugin.reparse(unknownVar, ir, ctx, d3)).toBeNull();
    expect(d3.errors[0].message).toContain('--tw-mystery');
  });

  it('rejects generated rules for an excluded or unmapped component', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const files = tailwindPlugin.generate(ir, null, ctx, new Diagnostics());
    const tampered = files.map((f) =>
      f.path === 'components.css'
        ? {
            ...f,
            contents: f.contents.replace(
              '@layer components {',
              '@layer components {\n  .fx-pill {\n    display: inline-block;\n  }\n',
            ),
          }
        : f,
    );
    const diag = new Diagnostics();
    expect(tailwindPlugin.reparse(tampered, ir, ctx, diag)).toBeNull();
    expect(new Set(diag.errors.map((d) => d.code))).toEqual(
      new Set(['DS-E081']),
    );
    expect(diag.errors[0].message).toContain('pill');
    expect(diag.errors[0].message).toContain('excluded or unmapped');
  });

  it('rejects a selector that is not the canonical form for its rule', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const files = tailwindPlugin.generate(ir, null, ctx, new Diagnostics());
    const tampered = files.map((f) =>
      f.path === 'components.css'
        ? {
            ...f,
            contents: f.contents.replace(
              '.fx-chip:disabled {',
              '.fx-chip[aria-disabled="true"] {',
            ),
          }
        : f,
    );
    const diag = new Diagnostics();
    expect(tailwindPlugin.reparse(tampered, ir, ctx, diag)).toBeNull();
    expect(new Set(diag.errors.map((d) => d.code))).toEqual(
      new Set(['DS-E081']),
    );
    expect(diag.errors[0].message).toContain('.fx-chip:disabled');
    expect(diag.errors[0].message).toContain('.fx-chip[aria-disabled="true"]');
  });

  it('rejects a rule block duplicated byte-for-byte', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const files = tailwindPlugin.generate(ir, null, ctx, new Diagnostics());
    const block = '  .fx-chip[data-tone="loud"] {\n    min-width: 44px;\n  }';
    const tampered = files.map((f) => {
      if (f.path !== 'components.css') {
        return f;
      }
      expect(f.contents).toContain(block);
      return {
        ...f,
        contents: f.contents.replace(block, `${block}\n\n${block}`),
      };
    });
    const diag = new Diagnostics();
    expect(tailwindPlugin.reparse(tampered, ir, ctx, diag)).toBeNull();
    expect(new Set(diag.errors.map((d) => d.code))).toEqual(
      new Set(['DS-E081']),
    );
    expect(diag.errors[0].message).toContain('duplicate rule');
  });

  it('maps a token-parsing inner diagnostic location to theme.css', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const files = tailwindPlugin.generate(ir, null, ctx, new Diagnostics());
    const tampered = files.map((f) =>
      f.path === 'theme.css'
        ? {
            ...f,
            contents: f.contents.replace(
              '--spacing-fx-2: 8px;',
              '--spacing-fx-2: not-a-value;',
            ),
          }
        : f,
    );
    const diag = new Diagnostics();
    expect(tailwindPlugin.reparse(tampered, ir, ctx, diag)).toBeNull();
    expect(diag.errors[0].location?.file).toBe('theme.css');
    expect(diag.errors[0].message).not.toContain('src/tokens/');
  });

  it('rejects a reordered pair of equal-specificity rule blocks', () => {
    const root = twRoot({
      'src/components/x/x.manifest.json': JSON.stringify({
        name: 'x',
        displayName: 'X',
        baseline: false,
        states: ['hover', 'pressed'],
        targets: { tailwind: {} },
      }),
      'src/components/x/x.css':
        '.fx-x:hover {\n  opacity: 0.6;\n}\n.fx-x[aria-pressed="true"] {\n  opacity: 0.7;\n}\n',
    });
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const files = tailwindPlugin.generate(ir, null, ctx, new Diagnostics());
    const hoverBlock = '  .fx-x:hover {\n    opacity: 0.6;\n  }';
    const pressedBlock =
      '  .fx-x[aria-pressed="true"] {\n    opacity: 0.7;\n  }';
    const tampered = files.map((f) => {
      if (f.path !== 'components.css') {
        return f;
      }
      expect(f.contents).toContain(hoverBlock);
      expect(f.contents).toContain(pressedBlock);
      const swapped = f.contents
        .replace(hoverBlock, '@@SWAP@@')
        .replace(pressedBlock, hoverBlock)
        .replace('@@SWAP@@', pressedBlock);
      return { ...f, contents: swapped };
    });
    const diag = new Diagnostics();
    expect(tailwindPlugin.reparse(tampered, ir, ctx, diag)).toBeNull();
    expect(new Set(diag.errors.map((d) => d.code))).toEqual(
      new Set(['DS-E081']),
    );
    expect(diag.errors[0].message).toContain('canonical form');
  });

  it('skips selector verification for a group parseComponentCss already reported', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const files = tailwindPlugin.generate(ir, null, ctx, new Diagnostics());
    const tampered = files.map((f) =>
      f.path === 'components.css'
        ? {
            ...f,
            contents: f.contents.replace(
              '.fx-chip .fx-chip__icon {',
              '.fx-chip.fx-chip__icon {',
            ),
          }
        : f,
    );
    const diag = new Diagnostics();
    expect(tailwindPlugin.reparse(tampered, ir, ctx, diag)).toBeNull();
    // Exactly the one real diagnostic from parseComponentCss: no extraneous
    // "canonical form" or rule-count noise from verifySelectors as well.
    expect(diag.errors).toHaveLength(1);
    expect(diag.errors[0].code).toBe('DS-E081');
    expect(diag.errors[0].message).toContain(
      'the root compound may only contain',
    );
    expect(diag.errors[0].message).not.toContain('canonical form');
    expect(diag.errors[0].message).not.toContain('rules, found');
  });

  it('keeps a components.css inner diagnostic location as components.css', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const files = tailwindPlugin.generate(ir, null, ctx, new Diagnostics());
    const tampered = files.map((f) =>
      f.path === 'components.css'
        ? {
            ...f,
            contents: f.contents.replace(
              'var(--spacing-fx-2)',
              'var(--tw-mystery)',
            ),
          }
        : f,
    );
    const diag = new Diagnostics();
    expect(tailwindPlugin.reparse(tampered, ir, ctx, diag)).toBeNull();
    expect(diag.errors[0].location?.file).toBe('components.css');
  });

  it('rejects a theme.css whose @theme block is not "@theme static"', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const files = tailwindPlugin.generate(ir, null, ctx, new Diagnostics());
    const tampered = files.map((f) =>
      f.path === 'theme.css'
        ? {
            ...f,
            contents: f.contents.replace('@theme static {', '@theme inline {'),
          }
        : f,
    );
    const diag = new Diagnostics();
    expect(tailwindPlugin.reparse(tampered, ir, ctx, diag)).toBeNull();
    expect(diag.errors[0].message).toContain(
      'expected "@theme static", got "@theme inline"',
    );
  });

  it('resolves a single-quoted mode selector like a double-quoted one', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const files = tailwindPlugin.generate(ir, null, ctx, new Diagnostics());
    const singleQuoted = files.map((f) =>
      f.path === 'theme.css'
        ? {
            ...f,
            contents: f.contents.replace(
              'data-fx-theme="dark"',
              "data-fx-theme='dark'",
            ),
          }
        : f,
    );
    const diag = new Diagnostics();
    const reparsed = tailwindPlugin.reparse(singleQuoted, ir, ctx, diag);
    expect(diag.items).toEqual([]);
    expect(reparsed).not.toBeNull();
    expect(diffIR(ir, reparsed!, scopeFor(ir))).toEqual([]);
  });

  it('still rejects a bare :root rule in theme.css', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const ctx = twContext(root, config);
    const files = tailwindPlugin.generate(ir, null, ctx, new Diagnostics());
    const tampered = files.map((f) =>
      f.path === 'theme.css'
        ? { ...f, contents: `${f.contents}\n:root {\n}\n` }
        : f,
    );
    const diag = new Diagnostics();
    expect(tailwindPlugin.reparse(tampered, ir, ctx, diag)).toBeNull();
    expect(diag.errors[0].message).toContain(
      'unexpected rule at the top level of theme.css',
    );
  });

  it('builds a manifest from a component IR', () => {
    const { ir } = twBuild(twRoot());
    const m = manifestFromComponent(ir.components.chip);
    expect(m).toMatchObject({
      name: 'chip',
      displayName: 'Chip',
      baseline: false,
      axes: { tone: { values: ['quiet', 'loud'], default: 'quiet' } },
      states: ['hover', 'disabled'],
      slots: { root: { element: 'button', optional: false } },
      targets: { tailwind: {} },
    });
  });
});

describe('diffIR', () => {
  it('reports missing and extra rules and ignores ignored properties', () => {
    const { ir } = twBuild(twRoot());
    const clone = structuredClone(ir);
    clone.components.chip.rules = clone.components.chip.rules.slice(1);
    const extra = structuredClone(ir.components.chip.rules[0]);
    extra.states = ['hover', 'disabled'];
    clone.components.chip.rules.push(extra);
    const diffs = diffIR(ir, clone, {
      components: ['chip'],
      ignored: () => new Set(),
    });
    expect(diffs.map((d) => `${d.kind} ${d.id} ${d.message}`)).toEqual([
      'rule chip root missing from the generated output',
      'rule chip root:hover:disabled present only in the generated output',
    ]);

    const trimmed = structuredClone(ir);
    delete trimmed.components.tag.rules[0].declarations.opacity;
    delete trimmed.components.tag.rules[1].declarations.opacity;
    expect(
      diffIR(ir, trimmed, {
        components: ['tag'],
        ignored: () => new Set(['opacity']),
      }),
    ).toEqual([]);
    expect(
      diffIR(ir, trimmed, { components: ['tag'], ignored: () => new Set() }),
    ).toEqual([
      {
        kind: 'declaration',
        id: 'tag root opacity',
        message: 'missing from the generated output',
        location: ir.components.tag.rules[0].source,
      },
      {
        kind: 'declaration',
        id: 'tag root:disabled opacity',
        message: 'missing from the generated output',
        location: ir.components.tag.rules[1].source,
      },
    ]);

    const trimmedOne = structuredClone(ir);
    delete trimmedOne.components.tag.rules[0].declarations.opacity;
    expect(
      diffIR(ir, trimmedOne, {
        components: ['tag'],
        ignored: () => new Set(['opacity']),
      }),
    ).toEqual([
      {
        kind: 'declaration',
        id: 'tag root:disabled opacity',
        message: 'ignored property present in the generated output',
        location: ir.components.tag.rules[1].source,
      },
    ]);
  });

  it('compares tokens structurally, ignoring source locations', () => {
    const { ir } = twBuild(twRoot());
    const clone = structuredClone(ir);
    clone.tokens['space.2'].source = {
      file: 'elsewhere.css',
      line: 9,
      column: 9,
    };
    expect(
      diffIR(ir, clone, { components: [], ignored: () => new Set() }),
    ).toEqual([]);
    (clone.tokens['space.2'] as { $value: unknown }).$value = {
      value: 9,
      unit: 'px',
    };
    const diffs = diffIR(ir, clone, {
      components: [],
      ignored: () => new Set(),
    });
    expect(diffs).toHaveLength(1);
    expect(diffs[0]).toMatchObject({ kind: 'token', id: 'space.2' });
  });

  it('a component whose every declaration is ignored is legitimately absent', () => {
    const { ir } = twBuild(twRoot());
    const clone = structuredClone(ir);
    delete clone.components.tag;
    const diffs = diffIR(ir, clone, {
      components: ['tag'],
      ignored: () => new Set(['display', 'opacity']),
    });
    expect(diffs).toEqual([]);
  });

  it('reports a component missing from the generated output when not everything is ignored', () => {
    const { ir } = twBuild(twRoot());
    const clone = structuredClone(ir);
    delete clone.components.tag;
    const diffs = diffIR(ir, clone, {
      components: ['tag'],
      ignored: () => new Set(['opacity']),
    });
    expect(diffs).toEqual([
      {
        kind: 'component',
        id: 'tag',
        message: 'missing from the generated output',
      },
    ]);
  });

  it('reports a component present only in the reparsed IR', () => {
    const { ir } = twBuild(twRoot());
    const clone = structuredClone(ir);
    clone.components.extra = {
      ...structuredClone(ir.components.chip),
      name: 'extra',
    };
    const diffs = diffIR(ir, clone, {
      components: ['chip'],
      ignored: () => new Set(),
    });
    expect(diffs).toEqual([
      {
        kind: 'component',
        id: 'extra',
        message: 'present only in the generated output',
      },
    ]);
  });

  it('does not collapse internal spacing inside a differing value', () => {
    const { ir } = twBuild(twRoot());
    const clone = structuredClone(ir);
    (clone.tokens['space.2'] as { cssName: string }).cssName =
      '--fx-space-2  extra';
    const diffs = diffIR(ir, clone, {
      components: [],
      ignored: () => new Set(),
    });
    expect(diffs).toHaveLength(1);
    expect(diffs[0].message).toContain('--fx-space-2  extra');
  });

  it('truncates a very long differing value', () => {
    const { ir } = twBuild(twRoot());
    const clone = structuredClone(ir);
    (clone.tokens['space.2'] as { cssName: string }).cssName = 'x'.repeat(300);
    const diffs = diffIR(ir, clone, {
      components: [],
      ignored: () => new Set(),
    });
    expect(diffs).toHaveLength(1);
    expect(diffs[0].message).toContain('…');
    expect(diffs[0].message).not.toContain('x'.repeat(300));
    const generated = diffs[0].message.slice(
      diffs[0].message.indexOf('generated ') + 'generated '.length,
    );
    expect(generated.endsWith('…')).toBe(true);
    expect(generated.length).toBe(201);
  });
});
