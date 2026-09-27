// The workbench service's command runner (scripts/workbench.mjs's runCommand), behind the checks
// that Keep and Approve run: it answers, whatever the command does.
import { dirname } from 'node:path';
import { describe, expect, it } from 'vitest';
import { runCommand } from '../../../scripts/workbench.mjs';

const node = process.execPath;

describe('running a command', () => {
  it('answers whether it passed, and all it printed', async () => {
    expect(
      await runCommand(node, [
        '-e',
        'console.log("out"); console.error("err")',
      ]),
    ).toEqual({ ok: true, output: 'out\nerr\n' });
    expect((await runCommand(node, ['-e', 'process.exit(3)'])).ok).toBe(false);
  });

  it('runs on this Node, with the env it is given', async () => {
    const r = await runCommand(
      'node',
      [
        '-e',
        'console.log(process.execPath + " " + process.env.SOLAR_VISUAL_ONLY)',
      ],
      { env: { SOLAR_VISUAL_ONLY: 'Button' } },
    );
    const [path, only] = r.output.trim().split(' ');
    expect(dirname(path)).toBe(dirname(node));
    expect(only).toBe('Button');
  });

  it('fails with a message, not a rejection, where a command cannot start', async () => {
    const r = await runCommand('solar-no-such-command', []);
    expect(r.ok).toBe(false);
    expect(r.output).toMatch(/ENOENT/);
  });

  it('stops a command that runs past its limit, with what it printed', async () => {
    const started = Date.now();
    const r = await runCommand(
      node,
      ['-e', 'console.log(process.pid); setTimeout(() => {}, 1e6)'],
      { timeoutMs: 1500 },
    );
    expect(Date.now() - started).toBeLessThan(5000);
    expect(r.ok).toBe(false);
    expect(r.output).toMatch(/… stopped after 2 seconds$/);
    const pid = Number(r.output.split('\n')[0]);
    expect(pid).toBeGreaterThan(0);
    // Stopped, not left running: signal 0 reaches no process once it has gone.
    await new Promise((ok) => setTimeout(ok, 300));
    expect(() => process.kill(pid, 0)).toThrow();
  });
});
