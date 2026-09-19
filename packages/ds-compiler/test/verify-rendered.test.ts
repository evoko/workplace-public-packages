import { chmodSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { DsConfig } from '../src/config.js';
import { Diagnostics } from '../src/errors.js';
import { runRendered } from '../src/verify/rendered.js';
import { makeRoot } from './helpers.js';

function configWith(rendered: DsConfig['rendered']): DsConfig {
  return {
    name: 'Fictional',
    prefix: 'fx',
    modes: ['light'],
    defaultMode: 'light',
    rootFontSize: 16,
    modeSelector: ':root[data-fx-theme="{mode}"]',
    targets: {},
    coverageFile: 'coverage.md',
    ...(rendered ? { rendered } : {}),
  };
}

describe('runRendered', () => {
  it('is skipped with DS-W005 when not configured', () => {
    const diag = new Diagnostics();
    expect(runRendered(makeRoot({}), configWith(undefined), diag)).toBe(
      'skipped',
    );
    expect(diag.warnings.map((w) => w.code)).toEqual(['DS-W005']);
    expect(diag.errors).toEqual([]);
  });

  it('passes when the command exits 0, running in the configured cwd', () => {
    const root = makeRoot({});
    mkdirSync(join(root, 'sb'));
    writeFileSync(join(root, 'sb', 'marker'), '');
    const diag = new Diagnostics();
    const status = runRendered(
      root,
      configWith({ cwd: 'sb', command: 'test -f marker' }),
      diag,
    );
    expect(status).toBe('pass');
    expect(diag.items).toEqual([]);
  });

  it('fails with DS-E087 carrying the output tail when the command exits non-zero', () => {
    const root = makeRoot({});
    mkdirSync(join(root, 'sb'));
    const script = join(root, 'sb', 'fail.sh');
    writeFileSync(
      script,
      '#!/bin/sh\nfor i in 1 2 3 4 5; do echo "line $i"; done\necho "button · variant=ghost · hover · mui · root · color: css rgb(1, 1, 1) vs mui rgb(2, 2, 2)" 1>&2\nexit 3\n',
    );
    chmodSync(script, 0o755);
    const diag = new Diagnostics();
    const status = runRendered(
      root,
      configWith({ cwd: 'sb', command: './fail.sh' }),
      diag,
    );
    expect(status).toBe('fail');
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E087']);
    expect(diag.errors[0].message).toContain('exited with 3');
    expect(diag.errors[0].message).toContain('line 5');
    expect(diag.errors[0].message).toContain('vs mui rgb(2, 2, 2)');
    expect(diag.errors[0].location).toEqual({
      file: 'ds.config.json',
      line: 1,
      column: 1,
    });
  });

  it('fails with DS-E087 when the cwd does not exist', () => {
    const diag = new Diagnostics();
    expect(
      runRendered(
        makeRoot({}),
        configWith({ cwd: 'nope', command: 'true' }),
        diag,
      ),
    ).toBe('fail');
    expect(diag.errors[0].message).toContain('does not exist');
  });

  it('fails with DS-E087 saying "is not a directory" when the cwd is a file (L2)', () => {
    const root = makeRoot({});
    writeFileSync(join(root, 'notadir'), '');
    const diag = new Diagnostics();
    expect(
      runRendered(root, configWith({ cwd: 'notadir', command: 'true' }), diag),
    ).toBe('fail');
    expect(diag.errors[0].message).toContain('is not a directory');
  });

  it('keeps only the last TAIL_LINES lines of output (T2)', () => {
    const root = makeRoot({});
    mkdirSync(join(root, 'sb'));
    const script = join(root, 'sb', 'many.sh');
    writeFileSync(
      script,
      '#!/bin/sh\nfor i in $(seq 1 80); do echo "line $i"; done\nexit 1\n',
    );
    chmodSync(script, 0o755);
    const diag = new Diagnostics();
    const status = runRendered(
      root,
      configWith({ cwd: 'sb', command: './many.sh' }),
      diag,
    );
    expect(status).toBe('fail');
    // 80 lines, last 60 kept: lines 1-20 dropped, line 21 is the first kept.
    expect(diag.errors[0].message).toContain('line 21');
    expect(diag.errors[0].message).not.toContain('line 20\n');
  });

  it('reports "was killed by <signal>" when the command is killed by a signal (T3)', () => {
    const diag = new Diagnostics();
    const status = runRendered(
      makeRoot({}),
      configWith({ cwd: '.', command: 'kill -TERM $$' }),
      diag,
    );
    expect(status).toBe('fail');
    expect(diag.errors[0].message).toContain('was killed by SIGTERM');
  });

  it('reports a timeout distinctly, using the configured timeoutMs (L1)', () => {
    const diag = new Diagnostics();
    const status = runRendered(
      makeRoot({}),
      configWith({ cwd: '.', command: 'sleep 2', timeoutMs: 200 }),
      diag,
    );
    expect(status).toBe('fail');
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E087']);
    expect(diag.errors[0].message).toContain('timed out');
  });
});
