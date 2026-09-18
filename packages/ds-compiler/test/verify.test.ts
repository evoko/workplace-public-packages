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
import { twBuild, twRoot } from './tailwind-fixture.js';

const BROKEN_SPACE = {
  'src/tokens/space.css': ':root {\n  --fx-space-2: nope;\n}\n',
};

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
    expect(result.diagnostics.errors.map((d) => d.code)).toEqual(['DS-E084']);
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

  it('writes nothing and reports one DS-E086 when the mui catalog is broken', () => {
    const root = twRoot({ 'catalogs/mui.json': '{ broken' });
    build(root);
    const result = generate(root);
    expect(result.written).toEqual([]);
    expect(result.diagnostics.errors.map((d) => d.code)).toEqual(['DS-E086']);
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
    });
    expect(result.diagnostics.errors.map((d) => d.code)).toEqual(['DS-E084']);
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

  it('fails drift and reports one DS-E086 when the mui catalog becomes broken after a clean generation', () => {
    const root = ready();
    mkdirSync(join(root, 'catalogs'), { recursive: true });
    writeFileSync(join(root, 'catalogs', 'mui.json'), '{ broken');
    const result = verify(root);
    expect(result.steps.drift).toBe('fail');
    expect(result.diagnostics.errors.map((d) => d.code)).toEqual(['DS-E086']);
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

  it('stops after lint when the source has errors', () => {
    const result = verify(twRoot(BROKEN_SPACE));
    expect(result.steps).toEqual({
      lint: 'fail',
      drift: 'skipped',
      roundtrip: 'skipped',
      coverage: 'skipped',
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
    });
    expect(
      result.diagnostics.errors.filter((d) => d.code === 'DS-E070'),
    ).toHaveLength(1);
    expect(result.coverageFile).toBeNull();
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
