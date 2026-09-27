import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { packagesDir } from '../src/util/paths.mjs';
import {
  capFailures,
  checkCommands,
  excerpt,
  failuresOf,
  MAX_FAILURES,
  runChecks,
  stemsOf,
} from '../src/workbench/checks.mjs';

const WEB_OUT = join(packagesDir, 'components', 'test', 'visual', '.out');
const FLUTTER_OUT = join(packagesDir, 'solar_flutter', 'build', 'visual');

/** A fake file system of report files: what the checks' runs write, and what was removed. */
function reports(initial = {}) {
  const files = { ...initial };
  const removed = [];
  return {
    files,
    removed,
    read: (p) => files[p] ?? null,
    remove: (p) => {
      removed.push(p);
      delete files[p];
    },
  };
}

/** Every report a passing run of Button's two visual checks writes: no failures, Light and Dark. */
const passing = {
  [`${WEB_OUT}/button-failures.json`]: '[]\n',
  [`${WEB_OUT}/button-dark-failures.json`]: '[]\n',
  [`${FLUTTER_OUT}/button-failures.json`]: '[]',
  [`${FLUTTER_OUT}/button_dark-failures.json`]: '[]',
};

describe('a component’s own checks', () => {
  it('are its two visual checks and the parity suite, run where each lives', () => {
    const [web, flutter, parity, ...more] = checkCommands('Icon Button');
    expect(more).toEqual([]);
    expect(web).toMatchObject({
      platform: 'web',
      cmd: 'npx',
      args: [
        'playwright',
        'test',
        'components.spec.mjs',
        '-g',
        'in every variant',
      ],
      cwd: join(packagesDir, 'components'),
      env: { SOLAR_VISUAL_ONLY: 'Icon Button' },
    });
    expect(flutter).toMatchObject({
      platform: 'flutter',
      cmd: 'flutter',
      args: [
        'test',
        'test/visual/components_visual_test.dart',
        '--name',
        '^Icon Button draws what Figma draws',
      ],
      cwd: join(packagesDir, 'solar_flutter'),
    });
    expect(parity).toMatchObject({
      platform: 'parity',
      cmd: 'npx',
      args: ['vitest', 'run', 'test/component-parity.test.mjs'],
      cwd: join(packagesDir, 'codegen'),
    });
  });

  it('escape a name for the Flutter test’s pattern', () => {
    expect(checkCommands('A (B)')[1].args[3]).toBe(
      '^A \\(B\\) draws what Figma draws',
    );
  });

  it('are the parity suite and the chart theme’s test for a component a chart library draws', () => {
    const commands = checkCommands('Donut Chart');
    expect(commands.map((c) => c.platform)).toEqual(['parity']);
    expect(commands[0].args).toEqual([
      'vitest',
      'run',
      'test/component-parity.test.mjs',
      'test/charts.test.mjs',
    ]);
  });

  it('read the reports each visual check writes, Light and Dark', () => {
    expect(stemsOf('Icon Button')).toEqual({
      web: [`${WEB_OUT}/icon-button`, `${WEB_OUT}/icon-button-dark`],
      flutter: [
        `${FLUTTER_OUT}/icon_button`,
        `${FLUTTER_OUT}/icon_button_dark`,
      ],
    });
  });

  it('turn a report’s failures into the contract’s, Dark ones marked', () => {
    const { read } = reports({
      '/w/button-failures.json':
        '[{"variant":"v","layer":"root","property":"height","figma":40,"rendered":44}]',
      '/w/button-dark-failures.json':
        '[{"variant":"v","layer":"label","property":"hidden","figma":true,"rendered":false},{"variant":"w","layer":"root","property":"color","figma":"#000","rendered":null,"painted":"x"}]',
      '/f/button_dark-failures.json':
        '[{"variant":"v","layer":"root","property":"fill","figma":"#fff","painted":"Color(1, 0, 0)"}]',
    });
    expect(failuresOf('web', ['/w/button', '/w/button-dark'], read)).toEqual([
      {
        platform: 'web',
        variant: 'v',
        layer: 'root',
        property: 'height',
        figma: 40,
        drawn: 44,
      },
      {
        platform: 'web',
        variant: 'v (Dark)',
        layer: 'label',
        property: 'hidden',
        figma: true,
        drawn: false,
      },
      {
        platform: 'web',
        variant: 'w (Dark)',
        layer: 'root',
        property: 'color',
        figma: '#000',
        drawn: null,
      },
    ]);
    expect(
      failuresOf('flutter', ['/f/button', '/f/button_dark'], read),
    ).toEqual([
      {
        platform: 'flutter',
        variant: 'v (Dark)',
        layer: 'root',
        property: 'fill',
        figma: '#fff',
        drawn: 'Color(1, 0, 0)',
      },
    ]);
  });

  it('say so where a report cannot be read', () => {
    const { read } = reports({ '/w/button-failures.json': '[{"vari' });
    const [f] = failuresOf('web', ['/w/button'], read);
    expect(f.platform).toBe('web');
    expect(f.message).toMatch(/\/w\/button-failures\.json/);
  });
});

describe('what a failing command printed', () => {
  it('is cut from the first line that says what failed, at most 40 lines', () => {
    const out = ['a', 'b', '  ✘ Button in Dark', ...Array(60).fill('x')].join(
      '\n',
    );
    const cut = excerpt(out).split('\n');
    expect(cut[0]).toBe('  ✘ Button in Dark');
    expect(cut).toHaveLength(40);
  });

  it('is its last 12 lines where no line says', () => {
    const out = Array.from({ length: 30 }, (_, i) => `line ${i}`).join('\n');
    expect(excerpt(`${out}\n\n`).split('\n')).toEqual(
      Array.from({ length: 12 }, (_, i) => `line ${i + 18}`),
    );
  });
});

describe('a failure list too long to carry', () => {
  const row = (platform, i) => ({ platform, variant: `v${i}`, property: 'x' });

  it('keeps the first, and counts the rest on the platform most are on, naming what shows them all', () => {
    const failures = [
      ...Array.from({ length: 150 }, (_, i) => row('web', i)),
      ...Array.from({ length: 300 }, (_, i) => row('flutter', i)),
    ];
    const capped = capFailures(failures, 'Text Input');
    expect(capped).toHaveLength(MAX_FAILURES);
    expect(capped.slice(0, -1)).toEqual(failures.slice(0, MAX_FAILURES - 1));
    expect(capped.at(-1)).toEqual({
      platform: 'flutter',
      message:
        '…and 251 more failing checks: run npm run solar:explain -- "Text Input" for all',
    });
  });

  it('leaves a list that fits as it is', () => {
    const failures = Array.from({ length: MAX_FAILURES }, (_, i) =>
      row('parity', i),
    );
    expect(capFailures(failures, 'Button')).toBe(failures);
    expect(capFailures([], 'Button')).toEqual([]);
  });
});

describe('running a component’s checks', () => {
  it('answers at most the failures one note carries, however many the reports hold', async () => {
    const fs = reports();
    const many = JSON.stringify(
      Array.from({ length: 450 }, (_, i) => ({
        variant: `v${i}`,
        layer: 'root',
        property: 'height',
        figma: 40,
        painted: '44.0',
      })),
    );
    const run = async (cmd) => {
      Object.assign(fs.files, passing);
      if (cmd === 'flutter')
        fs.files[`${FLUTTER_OUT}/button-failures.json`] = many;
      return { ok: cmd !== 'flutter', output: 'Some tests failed.\n' };
    };
    const r = await runChecks('Button', { run, ...fs });
    expect(r.ok).toBe(false);
    expect(r.failures).toHaveLength(MAX_FAILURES);
    expect(r.failures.at(-1)).toEqual({
      platform: 'flutter',
      message:
        '…and 251 more failing checks: run npm run solar:explain -- "Button" for all',
    });
  });

  it('runs them one after another, each with its own env and directory', async () => {
    const fs = reports();
    const calls = [];
    let running = 0;
    const run = async (cmd, args, opts) => {
      running += 1;
      expect(running).toBe(1);
      calls.push({ cmd, args, opts });
      await new Promise((ok) => setTimeout(ok, 5));
      Object.assign(fs.files, passing);
      running -= 1;
      return { ok: true, output: '' };
    };
    const r = await runChecks('Button', { run, ...fs });
    expect(r).toEqual({ ok: true, failures: [] });
    expect(calls.map((c) => c.cmd)).toEqual(['npx', 'flutter', 'npx']);
    expect(calls[0].opts).toEqual({
      cwd: join(packagesDir, 'components'),
      env: { SOLAR_VISUAL_ONLY: 'Button' },
    });
  });

  it('never reads an earlier run’s report: it removes the component’s reports first', async () => {
    const stale = {
      [`${WEB_OUT}/button-failures.json`]:
        '[{"variant":"old","layer":"root","property":"height","figma":40,"rendered":44}]',
      [`${WEB_OUT}/button-gaps.json`]: '[]',
      [`${FLUTTER_OUT}/button_dark-failures.json`]:
        '[{"variant":"old","layer":"root","property":"height","figma":40,"painted":"44.0"}]',
    };
    const fs = reports(stale);
    const run = async (cmd, args, opts) => {
      // The web check stops before it writes a report (its page failed to build).
      if (opts.env.SOLAR_VISUAL_ONLY) return { ok: false, output: 'no page' };
      return { ok: true, output: '' };
    };
    // Flutter's run writes its reports; the web's, above, writes none.
    const runAndWrite = async (cmd, args, opts) => {
      const r = await run(cmd, args, opts);
      if (cmd === 'flutter')
        for (const [p, t] of Object.entries(passing))
          if (p.startsWith(FLUTTER_OUT)) fs.files[p] = t;
      return r;
    };
    const r = await runChecks('Button', { run: runAndWrite, ...fs });
    expect(fs.removed).toEqual(
      expect.arrayContaining([
        `${WEB_OUT}/button-failures.json`,
        `${WEB_OUT}/button-gaps.json`,
        `${WEB_OUT}/button-dark-failures.json`,
        `${WEB_OUT}/button-dark-gaps.json`,
        `${FLUTTER_OUT}/button-failures.json`,
        `${FLUTTER_OUT}/button_dark-failures.json`,
      ]),
    );
    expect(r.ok).toBe(false);
    expect(r.failures.some((f) => f.variant === 'old')).toBe(false);
    expect(r.failures).toHaveLength(1);
    expect(r.failures[0]).toMatchObject({ platform: 'web' });
    expect(r.failures[0].message).toMatch(/no page/);
  });

  it('reports the measured failures of a failing visual check, and no message beside them', async () => {
    const fs = reports();
    const run = async (cmd) => {
      Object.assign(fs.files, passing);
      if (cmd === 'flutter')
        fs.files[`${FLUTTER_OUT}/button-failures.json`] =
          '[{"variant":"v","layer":"root","property":"height","figma":40,"painted":"44.0"}]';
      return { ok: cmd !== 'flutter', output: 'Some tests failed.\n' };
    };
    const r = await runChecks('Button', { run, ...fs });
    expect(r).toEqual({
      ok: false,
      failures: [
        {
          platform: 'flutter',
          variant: 'v',
          layer: 'root',
          property: 'height',
          figma: 40,
          drawn: '44.0',
        },
      ],
    });
  });

  it('says what a failing check printed where it reported no difference (the parity suite)', async () => {
    const fs = reports();
    const run = async (cmd, args) => {
      Object.assign(fs.files, passing);
      return args[0] === 'vitest'
        ? {
            ok: false,
            output: `${'noise\n'.repeat(40)} FAIL  test/component-parity.test.mjs > Button\n\x1b[31mAssertionError: expected 1 to be 2\x1b[39m\n`,
          }
        : { ok: true, output: '' };
    };
    const r = await runChecks('Button', { run, ...fs });
    expect(r.ok).toBe(false);
    expect(r.failures).toHaveLength(1);
    const [f] = r.failures;
    expect(f.platform).toBe('parity');
    expect(f.message).toMatch(/^The parity suite failed/);
    expect(f.message).toMatch(/AssertionError: expected 1 to be 2$/);
    expect(f.message).not.toContain('\x1b');
    // From the line that says what failed: none of the noise before it.
    expect(f.message).not.toMatch(/noise/);
  });

  it('says what a check printed where one of its reports is missing, beside the others’ failures', async () => {
    const fs = reports();
    const run = async (cmd, args, opts) => {
      Object.assign(fs.files, passing);
      if (opts.env.SOLAR_VISUAL_ONLY) {
        // Light measured a difference; Dark crashed before it wrote its report.
        fs.files[`${WEB_OUT}/button-failures.json`] =
          '[{"variant":"v","layer":"root","property":"height","figma":40,"rendered":44}]';
        delete fs.files[`${WEB_OUT}/button-dark-failures.json`];
        return {
          ok: false,
          output: 'Error: page crashed\n    at Dark\n',
        };
      }
      return { ok: true, output: '' };
    };
    const r = await runChecks('Button', { run, ...fs });
    expect(r.ok).toBe(false);
    expect(r.failures).toEqual([
      expect.objectContaining({ platform: 'web', variant: 'v', drawn: 44 }),
      {
        platform: 'web',
        message: expect.stringMatching(/Error: page crashed\n {4}at Dark$/),
      },
    ]);
  });

  it('is a failure with a message, not a crash, where a check cannot start', async () => {
    const fs = reports();
    const run = async (cmd) => {
      if (cmd === 'flutter')
        return { ok: false, output: 'spawn flutter ENOENT' };
      Object.assign(fs.files, passing);
      return { ok: true, output: '' };
    };
    const r = await runChecks('Button', { run, ...fs });
    expect(r.ok).toBe(false);
    expect(r.failures).toEqual([
      {
        platform: 'flutter',
        message: expect.stringMatching(
          /^The Flutter visual check failed[^]*spawn flutter ENOENT/,
        ),
      },
    ]);
  });

  it('fails a check that passed without writing its reports: it measured nothing', async () => {
    const fs = reports();
    const run = async (cmd) => {
      if (cmd !== 'flutter') Object.assign(fs.files, passing);
      for (const p of Object.keys(fs.files))
        if (p.startsWith(FLUTTER_OUT)) delete fs.files[p];
      return { ok: true, output: '' };
    };
    const r = await runChecks('Button', { run, ...fs });
    expect(r.ok).toBe(false);
    expect(r.failures).toEqual([
      {
        platform: 'flutter',
        message: expect.stringMatching(/wrote no report/),
      },
    ]);
  });

  it('runs the parity suite alone for a chart, and reads no report', async () => {
    const fs = reports();
    const cmds = [];
    const r = await runChecks('Donut Chart', {
      run: async (cmd, args) => {
        cmds.push(args.join(' '));
        return { ok: true, output: '' };
      },
      ...fs,
    });
    expect(r).toEqual({ ok: true, failures: [] });
    expect(cmds).toEqual([
      'vitest run test/component-parity.test.mjs test/charts.test.mjs',
    ]);
    expect(fs.removed).toEqual([]);
  });
});
