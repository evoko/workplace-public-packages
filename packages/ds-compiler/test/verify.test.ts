import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, sep } from 'node:path';
import { describe, expect, it } from 'vitest';
import { build } from '../src/build.js';
import { Diagnostics } from '../src/errors.js';
import {
  UnknownTargetError,
  generate,
  generateOutputs,
} from '../src/generate.js';
import type { TargetPlugin } from '../src/targets/plugin.js';
import { verify } from '../src/verify/index.js';
import { BTN_FILES, catalogFile, FX_CATALOG } from './mui-mapped-fixture.js';
import {
  TW_CONFIG,
  twBuild,
  twConfigWith,
  twRoot,
} from './tailwind-fixture.js';

const BROKEN_SPACE = {
  'src/tokens/space.css': ':root {\n  --fx-space-2: nope;\n}\n',
};

/** `TW_CONFIG` with the `targets.stories` entry removed. */
const NO_STORIES_CONFIG = (() => {
  const config = JSON.parse(TW_CONFIG) as {
    targets: Record<string, unknown>;
  };
  delete config.targets.stories;
  return JSON.stringify(config, null, 2);
})();

/** A root that has been built and generated: what a clean checkout looks like. */
function ready(extra: Record<string, string> = {}): string {
  const root = twRoot(extra);
  build(root);
  generate(root);
  return root;
}

describe('generate', () => {
  it("writes every target's files into their configured outDirs and removes stale files", () => {
    const root = twRoot();
    build(root);
    const out = join(root, 'out');
    const twOut = join(out, 'tailwind');
    mkdirSync(twOut, { recursive: true });
    writeFileSync(join(twOut, 'stale.css'), 'x');
    const result = generate(root);
    expect(result.ir).not.toBeNull();
    expect(
      result.written.map((p) =>
        p
          .slice(out.length + 1)
          .split(sep)
          .join('/'),
      ),
    ).toEqual([
      'mui/theme.model.json',
      'mui/theme.ts',
      'mui/augmentation.ts',
      'mui/components/Chip.tsx',
      'mui/components/Tag.tsx',
      'mui/components/index.ts',
      'mui/index.ts',
      'mui/typecheck.tsx',
      'stories/config.ts',
      'stories/styles/chip.stories.tsx',
      'stories/styles/pill.stories.tsx',
      'stories/styles/tag.stories.tsx',
      'stories/foundations/color.stories.tsx',
      'stories/foundations/font-family.stories.tsx',
      'stories/foundations/shadow.stories.tsx',
      'stories/foundations/space.stories.tsx',
      'tailwind/components.css',
      'tailwind/index.css',
      'tailwind/theme.css',
    ]);
    expect(result.removed).toEqual([join(out, 'tailwind', 'stale.css')]);
    expect(readFileSync(join(twOut, 'theme.css'), 'utf8')).toContain(
      '@theme static {',
    );
  });

  it('writes nothing for any target when one plugin reports a generation error', () => {
    const root = twRoot({
      'src/tokens/space.css':
        ':root {\n  --fx-space-2: 8px;\n}\n:root[data-fx-theme="dark"] {\n  --fx-space-2: 10px;\n}\n',
    });
    build(root);
    const result = generate(root);
    expect(result.ir).not.toBeNull();
    // The mui target reports DS-E084 for the mode-varying non-color token,
    // and the stories plugin independently rebuilds the same mui model and
    // reports its own summary DS-E084 when that build fails.
    expect(result.diagnostics.errors.map((d) => d.code)).toEqual([
      'DS-E084',
      'DS-E084',
    ]);
    expect(result.written).toEqual([]);
    expect(existsSync(join(root, 'out'))).toBe(false);
  });

  it('writes nothing when the IR has errors', () => {
    const root = twRoot(BROKEN_SPACE);
    const result = generate(root);
    expect(result.ir).toBeNull();
    expect(result.written).toEqual([]);
    expect(existsSync(join(root, 'out'))).toBe(false);
  });

  it('rejects unknown targets before building', () => {
    expect(() => generate(twRoot(), ['nope'])).toThrow(UnknownTargetError);
  });

  it('dedupes repeated target ids', () => {
    const root = twRoot();
    build(root);
    const result = generate(root, ['tailwind', 'tailwind']);
    expect(result.written).toHaveLength(3);
  });

  it('recursively removes stray files in subdirectories, including now-empty directories', () => {
    const root = twRoot();
    build(root);
    const out = join(root, 'out', 'tailwind');
    mkdirSync(join(out, 'sub'), { recursive: true });
    writeFileSync(join(out, 'sub', 'deep.css'), 'x');
    const result = generate(root);
    expect(result.removed).toContain(join(out, 'sub', 'deep.css'));
    expect(existsSync(join(out, 'sub'))).toBe(false);
  });

  it('skips the auxiliary stories plugin entirely when ds.config.json has no targets.stories entry', () => {
    const root = twRoot({ 'ds.config.json': NO_STORIES_CONFIG });
    build(root);
    const result = generate(root);
    expect(result.diagnostics.errors).toEqual([]);
    expect(result.written.some((p) => p.includes('stories'))).toBe(false);
    expect(existsSync(join(root, 'out', 'stories'))).toBe(false);
    expect(verify(root).steps).toEqual({
      lint: 'pass',
      drift: 'pass',
      roundtrip: 'pass',
      coverage: 'pass',
      rendered: 'skipped',
    });
  });

  it('reports DS-W006 (a warning, exit code stays 0) when an auxiliary target is explicitly requested but not configured (L4)', () => {
    const root = twRoot({ 'ds.config.json': NO_STORIES_CONFIG });
    build(root);
    const result = generate(root, ['stories']);
    expect(result.diagnostics.errors).toEqual([]);
    expect(result.diagnostics.warnings.map((w) => w.code)).toEqual(['DS-W006']);
    expect(result.written).toEqual([]);
  });

  it('does not report DS-W006 for the default (implicit) full run, only when explicitly requested', () => {
    const root = twRoot({ 'ds.config.json': NO_STORIES_CONFIG });
    build(root);
    const result = generate(root);
    expect(result.diagnostics.items).toEqual([]);
  });

  it('writes nothing and reports DS-E086 for both the mui and stories plugins when the mui catalog is broken', () => {
    const root = twRoot({ 'catalogs/mui.json': '{ broken' });
    build(root);
    const result = generate(root);
    expect(result.written).toEqual([]);
    // Both plugins call `loadMuiCatalog` (the mui plugin directly, the
    // stories plugin through its own `loadCatalog` with a scratch
    // diagnostics object), so each reports its own DS-E086.
    expect(result.diagnostics.errors.map((d) => d.code)).toEqual([
      'DS-E086',
      'DS-E086',
    ]);
    expect(existsSync(join(root, 'out'))).toBe(false);
  });
});

describe('verify', () => {
  it('passes on a built and generated root and writes the coverage file', () => {
    const root = ready();
    const result = verify(root);
    expect(result.diagnostics.errors).toEqual([]);
    expect(result.steps).toEqual({
      lint: 'pass',
      drift: 'pass',
      roundtrip: 'pass',
      coverage: 'pass',
      rendered: 'skipped',
    });
    expect(result.coverageFile).toBe(join(root, 'out', 'coverage.md'));
    expect(readFileSync(result.coverageFile!, 'utf8')).toContain(
      '| `chip` | supported | supported |',
    );
  });

  it('fails drift when a plugin cannot generate, and still runs the other steps', () => {
    const root = ready();
    writeFileSync(
      join(root, 'src/tokens/space.css'),
      ':root {\n  --fx-space-2: 8px;\n}\n:root[data-fx-theme="dark"] {\n  --fx-space-2: 10px;\n}\n',
    );
    build(root);
    // the Tailwind theme gains a mode override for the token, so bring it up to date
    generate(root, ['tailwind']);
    const result = verify(root);
    expect(result.steps).toEqual({
      lint: 'pass',
      drift: 'fail',
      roundtrip: 'pass',
      coverage: 'pass',
      rendered: 'skipped',
    });
    // mui and stories each independently rebuild the mui model and each
    // reports its own DS-E084 for the mode-varying non-color token.
    expect(result.diagnostics.errors.map((d) => d.code)).toEqual([
      'DS-E084',
      'DS-E084',
    ]);
  });

  it('reports drift for a stale IR, a changed generated file, and a stray file', () => {
    const root = ready();
    const out = join(root, 'out', 'tailwind');
    writeFileSync(join(root, 'design.ir.json'), '{}\n');
    writeFileSync(
      join(out, 'theme.css'),
      `${readFileSync(join(out, 'theme.css'), 'utf8')}/* edit */\n`,
    );
    writeFileSync(join(out, 'extra.css'), '');
    const result = verify(root);
    expect(result.steps.drift).toBe('fail');
    expect(result.steps.roundtrip).toBe('pass');
    expect(
      result.diagnostics.errors
        .filter((d) => d.code === 'DS-E080')
        .map((d) => d.message),
    ).toEqual([
      'design.ir.json differs from a fresh build; run bwp-ds build',
      'out/tailwind/theme.css differs from a fresh generation; run bwp-ds generate --target tailwind',
      'out/tailwind/extra.css is not produced by the tailwind generator; delete it',
    ]);
  });

  it('fails drift and reports DS-E086 for both the mui and stories plugins when the mui catalog becomes broken after a clean generation', () => {
    const root = ready();
    mkdirSync(join(root, 'catalogs'), { recursive: true });
    writeFileSync(join(root, 'catalogs', 'mui.json'), '{ broken');
    const result = verify(root);
    expect(result.steps.drift).toBe('fail');
    expect(result.diagnostics.errors.map((d) => d.code)).toEqual([
      'DS-E086',
      'DS-E086',
    ]);
  });

  it('reports missing generated files', () => {
    const root = twRoot();
    build(root);
    const result = verify(root);
    expect(result.steps.drift).toBe('fail');
    expect(result.diagnostics.errors.map((d) => d.message)).toContain(
      'out/tailwind/theme.css is missing; run bwp-ds generate --target tailwind',
    );
  });

  it('reports stray files in subdirectories during drift', () => {
    const root = ready();
    const out = join(root, 'out', 'tailwind');
    mkdirSync(join(out, 'sub'), { recursive: true });
    writeFileSync(join(out, 'sub', 'deep.css'), 'x');
    const result = verify(root);
    expect(result.steps.drift).toBe('fail');
    expect(result.diagnostics.errors.map((d) => d.message)).toContain(
      'out/tailwind/sub/deep.css is not produced by the tailwind generator; delete it',
    );
  });

  it('reports a target file that is a directory instead of a file', () => {
    const root = ready();
    const out = join(root, 'out', 'tailwind');
    rmSync(join(out, 'theme.css'), { force: true });
    mkdirSync(join(out, 'theme.css'));
    const result = verify(root);
    expect(result.diagnostics.errors.map((d) => d.message)).toContain(
      'out/tailwind/theme.css is not a file; delete it and run bwp-ds generate --target tailwind',
    );
  });

  it('fails coverage for an unmapped component and still writes the report', () => {
    const root = ready({
      'src/components/dot/dot.manifest.json': JSON.stringify({
        name: 'dot',
        displayName: 'Dot',
        baseline: false,
      }),
      'src/components/dot/dot.css': '.fx-dot {\n  display: inline-block;\n}\n',
    });
    const result = verify(root);
    expect(result.steps).toEqual({
      lint: 'pass',
      drift: 'pass',
      roundtrip: 'pass',
      coverage: 'fail',
      rendered: 'skipped',
    });
    const unmapped = result.diagnostics.errors.filter(
      (d) => d.code === 'DS-E082',
    );
    expect(unmapped.map((d) => d.message)).toEqual([
      'dot has no targets.mui entry in its manifest',
      'dot has no targets.tailwind entry in its manifest',
    ]);
    expect(unmapped[0].location).toEqual({
      file: 'src/components/dot/dot.manifest.json',
      line: 1,
      column: 1,
    });
    expect(readFileSync(result.coverageFile!, 'utf8')).toContain(
      '| `dot` | **unmapped** | **unmapped** |',
    );
  });

  it('runs the rendered step only on request and only after the Node steps pass', () => {
    const root = ready();
    const passing = verify(root, { rendered: true });
    // the fixture config has no `rendered` entry, so the step is skipped with a warning
    expect(passing.steps.rendered).toBe('skipped');
    expect(passing.diagnostics.warnings.map((w) => w.code)).toContain(
      'DS-W005',
    );
    expect(passing.diagnostics.errors).toEqual([]);

    const noFlag = verify(root);
    expect(noFlag.steps.rendered).toBe('skipped');
    expect(noFlag.diagnostics.items).toEqual([]);

    writeFileSync(join(root, 'out', 'tailwind', 'stray.css'), 'x');
    const drifted = verify(root, { rendered: true });
    expect(drifted.steps.drift).toBe('fail');
    expect(drifted.steps.rendered).toBe('skipped');
    expect(drifted.diagnostics.warnings.map((w) => w.code)).not.toContain(
      'DS-W005',
    );
  });

  it('stops after lint when the source has errors', () => {
    const result = verify(twRoot(BROKEN_SPACE));
    expect(result.steps).toEqual({
      lint: 'fail',
      drift: 'skipped',
      roundtrip: 'skipped',
      coverage: 'skipped',
      rendered: 'skipped',
    });
    expect(result.coverageFile).toBeNull();
  });

  it('stops after lint when the IR is present but src/index.css is stale', () => {
    const root = ready();
    writeFileSync(join(root, 'src/index.css'), '/* stale */\n');
    const result = verify(root);
    expect(result.steps).toEqual({
      lint: 'fail',
      drift: 'skipped',
      roundtrip: 'skipped',
      coverage: 'skipped',
      rendered: 'skipped',
    });
    expect(
      result.diagnostics.errors.filter((d) => d.code === 'DS-E070'),
    ).toHaveLength(1);
    expect(result.coverageFile).toBeNull();
  });

  it('runs the configured rendered command and fails the rendered step end to end (T4)', () => {
    const root = ready({
      'ds.config.json': twConfigWith({
        rendered: { cwd: '.', command: 'exit 1' },
      }),
    });
    const result = verify(root, { rendered: true });
    expect(result.steps.rendered).toBe('fail');
    expect(result.diagnostics.errors.map((d) => d.code)).toEqual(['DS-E087']);
  });
});

describe('verify with a mapped component', () => {
  it('passes end to end with the fixture catalog and writes the wrapper', () => {
    const root = twRoot({ ...BTN_FILES, ...catalogFile() });
    build(root);
    const gen = generate(root);
    expect(gen.diagnostics.errors).toEqual([]);
    expect(gen.written.some((p) => p.endsWith('components/Btn.tsx'))).toBe(
      true,
    );
    const result = verify(root);
    expect(result.steps).toEqual({
      lint: 'pass',
      drift: 'pass',
      roundtrip: 'pass',
      coverage: 'pass',
      rendered: 'skipped',
    });
    expect(result.diagnostics.errors).toEqual([]);
    // the catalog's version cannot be checked from a temp outDir
    expect(result.diagnostics.warnings.map((w) => w.code)).toEqual(['DS-W004']);
    expect(readFileSync(result.coverageFile!, 'utf8')).toContain(
      '| `btn` | supported | supported |',
    );
  });

  it('fails drift with DS-E086 and writes nothing when the catalog is stale', () => {
    const stale = structuredClone(FX_CATALOG);
    stale.components.btn.renders = stale.components.btn.renders.slice(0, 1);
    const root = twRoot({ ...BTN_FILES, ...catalogFile(stale) });
    build(root);
    const gen = generate(root);
    expect(gen.written).toEqual([]);
    // mui reports the real DS-E086 (the stale render count) directly; the
    // stories plugin independently rebuilds the same mui model and reports
    // its own summary DS-E084 when that build fails.
    expect(gen.diagnostics.errors.map((e) => e.code)).toEqual([
      'DS-E086',
      'DS-E084',
    ]);
    const result = verify(root);
    // mui's generation fails, so `generateOutputs` drops it entirely: only
    // tailwind's output is left to round-trip, and it round-trips cleanly,
    // so `roundtrip` is vacuously "pass" even though the mui target itself
    // is broken (that failure is what `drift` reports).
    expect(result.steps).toEqual({
      lint: 'pass',
      drift: 'fail',
      roundtrip: 'pass',
      coverage: 'pass',
      rendered: 'skipped',
    });
    expect(
      result.diagnostics.errors.some(
        (e) =>
          e.code === 'DS-E086' && e.message.includes('no render for tone=loud'),
      ),
    ).toBe(true);
  });
});

describe('generateOutputs', () => {
  it('drops a plugin that reports a generation error and keeps the rest', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const failing: TargetPlugin<null> = {
      id: 'failing',
      generate: (_ir, _catalog, _ctx, diag) => {
        diag.add('DS-E084', 'boom');
        return [];
      },
      reparse: () => null,
      coverage: () => [],
      isMapped: () => true,
      ignoredProperties: () => new Set(),
    };
    const ok: TargetPlugin<null> = {
      id: 'ok',
      generate: () => [{ path: 'a.txt', contents: 'hi' }],
      reparse: () => null,
      coverage: () => [],
      isMapped: () => true,
      ignoredProperties: () => new Set(),
    };
    const diag = new Diagnostics();
    const outputs = generateOutputs(
      root,
      ir,
      config,
      [failing, ok],
      '0.0.0-test',
      diag,
    );
    expect(outputs.map((o) => o.plugin.id)).toEqual(['ok']);
    expect(outputs[0].files).toEqual([{ path: 'a.txt', contents: 'hi' }]);
    expect(diag.errors).toHaveLength(1);
  });

  it('generateOutputs hands each plugin its loaded catalog and drops a plugin whose catalog fails to load', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const seen: unknown[] = [];
    const loaded = { version: 'x' };
    const fine: TargetPlugin = {
      id: 'fine',
      loadCatalog: () => loaded,
      generate: (_ir, catalog) => {
        seen.push(catalog);
        return [{ path: 'a.txt', contents: 'a' }];
      },
      reparse: () => null,
      coverage: () => [],
      isMapped: () => false,
      ignoredProperties: () => new Set(),
    };
    let generated = false;
    const broken: TargetPlugin = {
      ...fine,
      id: 'broken',
      loadCatalog: (_ctx, diag) => {
        diag.add('DS-E086', 'broken: no');
        return null;
      },
      generate: () => {
        generated = true;
        return [];
      },
    };
    const diag = new Diagnostics();
    const outputs = generateOutputs(
      root,
      ir,
      config,
      [fine, broken],
      '0.0.0-test',
      diag,
    );
    expect(seen).toEqual([loaded]);
    expect(outputs.map((o) => o.plugin.id)).toEqual(['fine']);
    expect(outputs[0].catalog).toBe(loaded);
    expect(generated).toBe(false);
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E086']);
  });

  it('threads allowCatalogMismatch into every plugin context', () => {
    const root = twRoot();
    const { ir, config } = twBuild(root);
    const flags: boolean[] = [];
    const probe: TargetPlugin = {
      id: 'probe',
      generate: (_ir, _catalog, ctx) => {
        flags.push(ctx.allowCatalogMismatch);
        return [];
      },
      reparse: () => null,
      coverage: () => [],
      isMapped: () => false,
      ignoredProperties: () => new Set(),
    };
    generateOutputs(root, ir, config, [probe], '0.0.0-test', new Diagnostics());
    generateOutputs(
      root,
      ir,
      config,
      [probe],
      '0.0.0-test',
      new Diagnostics(),
      {
        allowCatalogMismatch: true,
      },
    );
    expect(flags).toEqual([false, true]);
  });
});
