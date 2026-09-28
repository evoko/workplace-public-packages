// Makes sure the workbench service runs, for `npm run storybook` and `npm run widgetbook`, on the
// code as it is on disk: reuses one already answering on its port whose version (a hash of its
// code, scripts/workbench.mjs `codeVersion`) is the one on disk; stops one that is older, after
// the job it is running, and starts it again detached (it outlives the viewers by a minute:
// scripts/workbench.mjs), printing to .workbench/service.log. The viewers ask again every 30 s,
// so a change to the service's code is running within that. Never called by a build.
import { spawn } from 'node:child_process';
import { closeSync, mkdirSync, openSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// Safe to import: workbench.mjs starts a server only when node runs it.
import { codeVersion, WORKBENCH_PORT } from './workbench.mjs';

export const WORKBENCH_URL = `http://127.0.0.1:${WORKBENCH_PORT}`;
const here = dirname(fileURLToPath(import.meta.url));
const logFile = join(resolve(here, '..'), '.workbench', 'service.log');

/** How long a stop, or a start, is waited for. */
const WAIT_MS = 10_000;

/** The real effects: the service over HTTP, a detached start, a signal, the clock. */
const real = {
  /** The service's `GET /health`, or null where nothing (or no JSON) answers. */
  health: async () => {
    try {
      const r = await fetch(`${WORKBENCH_URL}/health`, {
        signal: AbortSignal.timeout(1_000),
      });
      return await r.json();
    } catch {
      return null;
    }
  },
  /** The status `POST /shutdown` answers with, or null where nothing does. */
  shutdown: async () => {
    try {
      const r = await fetch(`${WORKBENCH_URL}/shutdown`, {
        method: 'POST',
        signal: AbortSignal.timeout(1_000),
      });
      return r.status;
    } catch {
      return null;
    }
  },
  /** Starts the service detached; `exited()` says whether it has stopped (its port taken). */
  start: () => {
    mkdirSync(dirname(logFile), { recursive: true });
    const log = openSync(logFile, 'a');
    const child = spawn(process.execPath, [join(here, 'workbench.mjs')], {
      detached: true,
      stdio: ['ignore', log, log],
    });
    closeSync(log);
    let exited = false;
    child.once('exit', () => (exited = true));
    child.unref();
    return { exited: () => exited };
  },
  kill: (pid, signal) => process.kill(pid, signal),
  sleep: (ms) => new Promise((ok) => setTimeout(ok, ms)),
  now: () => Date.now(),
  warn: (message) => console.warn(message),
  version: () => codeVersion(),
};

const isWorkbench = (h) => h?.service === 'solar-workbench';

/**
 * Stops a service running older code: by `POST /shutdown` (answered 202, the service exiting once
 * its job has finished), else, from a service that predates it, by SIGTERM to the pid it reported.
 * Whether it was asked to stop; where it cannot be, says so and names the port.
 */
async function stopOlder(h, fx) {
  const status = await fx.shutdown();
  if (status === 202) return true;
  if (Number.isInteger(h.pid) && h.pid > 0) {
    try {
      fx.kill(h.pid, 'SIGTERM');
      return true;
    } catch {
      // Gone already.
      return true;
    }
  }
  fx.warn(
    `workbench: an older workbench service answers on port ${WORKBENCH_PORT} and cannot be told to stop; stop it (the process listening on ${WORKBENCH_PORT}) so the viewers use the code on disk`,
  );
  return false;
}

/** Whether `until()` holds within WAIT_MS. */
async function waitFor(until, fx) {
  const deadline = fx.now() + WAIT_MS;
  while (fx.now() < deadline) {
    if (await until()) return true;
    await fx.sleep(200);
  }
  return until();
}

/** The check running, so a ping that comes while a restart is under way waits for it. */
let running = null;

/**
 * Makes sure a workbench service on the code on disk answers on its port.
 * @param {Partial<typeof real>} [effects] replaced in the test
 */
export function ensureWorkbench(effects = {}) {
  running ??= ensure({ ...real, ...effects }).finally(() => {
    running = null;
  });
  return running;
}

async function ensure(fx) {
  const want = fx.version();
  const now = await fx.health();
  if (isWorkbench(now)) {
    if (now.version === want) return;
    if (!(await stopOlder(now, fx))) return;
    // Until the port is free, or another launcher's fresh service answers there.
    const freed = await waitFor(async () => {
      const h = await fx.health();
      return !isWorkbench(h) || h.version === want;
    }, fx);
    if (!freed) {
      fx.warn(
        `workbench: the older service on port ${WORKBENCH_PORT} did not stop within ${WAIT_MS / 1000} s; the viewers use it`,
      );
      return;
    }
    if ((await fx.health())?.version === want) return;
  }
  const child = fx.start();
  // Until it answers, or it stops (the port taken: another launcher's may answer), for 10 s at most.
  const answered = await waitFor(
    async () => isWorkbench(await fx.health()) || child.exited(),
    fx,
  );
  if (answered && isWorkbench(await fx.health())) return;
  fx.warn(
    `workbench: the service did not start (see ${logFile}); the viewers run without the bar`,
  );
}
