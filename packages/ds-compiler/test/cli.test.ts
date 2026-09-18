import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FIXTURE_MINI, MINI_CONFIG, makeRoot, withEntry } from './helpers.js';
import { twRoot } from './tailwind-fixture.js';

const pkgDir = fileURLToPath(new URL('..', import.meta.url));

function run(args: string[]): { code: number; stdout: string; stderr: string } {
  try {
    const stdout = execFileSync('npx', ['tsx', 'src/cli.ts', ...args], {
      cwd: pkgDir,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30_000,
    });
    return { code: 0, stdout, stderr: '' };
  } catch (err) {
    const e = err as { status: number | null; stdout: string; stderr: string };
    return {
      code: e.status ?? -1,
      stdout: String(e.stdout),
      stderr: String(e.stderr),
    };
  }
}

describe('bwp-ds CLI', () => {
  it('lint exits 0 on the mini fixture', () => {
    const r = run(['lint', '--root', FIXTURE_MINI]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain('0 errors');
  });

  it('lint exits 1 and prints coded diagnostics on a broken root', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: nope; }',
    });
    const r = run(['lint', '--root', root]);
    expect(r.code).toBe(1);
    expect(r.stderr).toContain('DS-E012');
    expect(r.stderr).toContain('hint:');
  });

  it('lint --json prints a JSON array of diagnostics', () => {
    const root = withEntry(
      makeRoot({
        'ds.config.json': MINI_CONFIG,
        'src/tokens/color.css': ':root { --fx-color-a: nope; }',
      }),
    );
    const r = run(['lint', '--root', root, '--json']);
    const parsed = JSON.parse(r.stdout) as {
      diagnostics: Array<{ code: string }>;
    };
    expect(parsed.diagnostics[0].code).toBe('DS-E012');
  });

  it('build writes design.ir.json into the root', () => {
    const root = makeRoot({
      'ds.config.json': MINI_CONFIG,
      'src/tokens/color.css': ':root { --fx-color-a: #000; }',
    });
    const r = run(['build', '--root', root]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain('design.ir.json');
  });

  it('scaffold tokens and scaffold component write files', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    expect(run(['scaffold', 'tokens', 'color', '--root', root]).code).toBe(0);
    expect(run(['scaffold', 'tokens', 'colour', '--root', root]).code).toBe(1);
    const r = run([
      'scaffold',
      'component',
      'button',
      '--root',
      root,
      '--axis',
      'variant=solid,outline',
      '--axis',
      'size=sm,md',
      '--state',
      'hover,disabled',
      '--slot',
      'icon',
      '--root-element',
      'button',
    ]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain('button.manifest.json');
    const cssPath = join(root, 'src/components/button/button.css');
    expect(readFileSync(cssPath, 'utf8')).toContain('.fx-button:disabled');
    expect(run(['scaffold', 'component', 'button', '--root', root]).code).toBe(
      1,
    );
  });

  it('rejects an invalid --root-element', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const r = run([
      'scaffold',
      'component',
      'button',
      '--root',
      root,
      '--root-element',
      'Bad Element',
    ]);
    expect(r.code).toBe(1);
  });

  it('rejects a repeated --axis with the same name', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const r = run([
      'scaffold',
      'component',
      'button',
      '--root',
      root,
      '--axis',
      'size=sm,md',
      '--axis',
      'size=lg,xl',
    ]);
    expect(r.code).toBe(1);
    expect(r.stderr).toContain('size');
  });

  it('splits --axis on the first "=" only, so "size=sm,md=lg" rejects "md=lg" as an axis value', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const r = run([
      'scaffold',
      'component',
      'button',
      '--root',
      root,
      '--axis',
      'size=sm,md=lg',
    ]);
    expect(r.code).toBe(1);
    expect(r.stderr).toContain('md=lg');
  });

  it('--json on a scaffold error prints a JSON object with "error"', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const r = run(['scaffold', 'tokens', 'colour', '--root', root, '--json']);
    expect(r.code).toBe(1);
    const parsed = JSON.parse(r.stdout) as { error: string };
    expect(typeof parsed.error).toBe('string');
  });

  it('--json on a scaffold success prints a "wrote" array', () => {
    const root = makeRoot({ 'ds.config.json': MINI_CONFIG });
    const r = run([
      'scaffold',
      'component',
      'button',
      '--root',
      root,
      '--json',
      '--axis',
      'variant=solid,outline',
      '--state',
      'hover',
      '--slot',
      'icon',
    ]);
    expect(r.code).toBe(0);
    const parsed = JSON.parse(r.stdout) as { wrote: string[] };
    expect(parsed.wrote).toHaveLength(3);
  });

  it('generate and verify work end to end and report steps in JSON', () => {
    const root = twRoot();
    expect(run(['build', '--root', root]).code).toBe(0);
    const generated = run(['generate', '--root', root, '--json']);
    expect(generated.code).toBe(0);
    expect(
      (JSON.parse(generated.stdout) as { wrote: string[] }).wrote,
    ).toHaveLength(11);
    const targeted = run([
      'generate',
      '--root',
      root,
      '--target',
      'tailwind',
      '--json',
    ]);
    expect(targeted.code).toBe(0);
    expect(
      (JSON.parse(targeted.stdout) as { wrote: string[] }).wrote,
    ).toHaveLength(3);
    const verified = run(['verify', '--root', root, '--json']);
    expect(verified.code).toBe(0);
    const parsed = JSON.parse(verified.stdout) as {
      steps: Record<string, string>;
      coverageFile: string;
    };
    expect(parsed.steps).toEqual({
      lint: 'pass',
      drift: 'pass',
      roundtrip: 'pass',
      coverage: 'pass',
    });
    expect(parsed.coverageFile.endsWith('coverage.md')).toBe(true);

    const unknown = run(['generate', '--root', root, '--target', 'nope']);
    expect(unknown.code).toBe(1);
    expect(unknown.stderr).toContain('unknown target "nope"');

    writeFileSync(join(root, 'design.ir.json'), '{}\n');
    const stale = run(['verify', '--root', root]);
    expect(stale.code).toBe(1);
    expect(stale.stderr).toContain('DS-E080');
    expect(stale.stdout).toContain('steps: {"lint":"pass","drift":"fail"');
  });

  it('generate exits 1 and writes nothing when a plugin reports a generation error', () => {
    const root = twRoot({
      'src/tokens/space.css':
        ':root {\n  --fx-space-2: 8px;\n}\n:root[data-fx-theme="dark"] {\n  --fx-space-2: 10px;\n}\n',
    });
    expect(run(['build', '--root', root]).code).toBe(0);
    const r = run(['generate', '--root', root]);
    expect(r.code).toBe(1);
    expect(r.stderr).toContain('DS-E084');
    expect(existsSync(join(root, 'out'))).toBe(false);
  });
});
