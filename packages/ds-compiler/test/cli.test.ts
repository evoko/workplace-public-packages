import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { FIXTURE_MINI, MINI_CONFIG, makeRoot, withEntry } from './helpers.js';

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
    ]);
    expect(r.code).toBe(0);
    expect(r.stdout).toContain('button.manifest.json');
    expect(run(['scaffold', 'component', 'button', '--root', root]).code).toBe(
      1,
    );
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
});
