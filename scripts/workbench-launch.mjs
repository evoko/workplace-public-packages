// Makes sure the workbench service runs, for `npm run storybook` and `npm run widgetbook`: reuses
// one already answering on its port, else starts it detached (it outlives the viewers by a minute:
// scripts/workbench.mjs), printing to .workbench/service.log. Never called by a build.
import { spawn } from 'node:child_process';
import { closeSync, mkdirSync, openSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// Safe to import: workbench.mjs starts a server only when node runs it.
import { WORKBENCH_PORT } from './workbench.mjs';

export const WORKBENCH_URL = `http://127.0.0.1:${WORKBENCH_PORT}`;
const here = dirname(fileURLToPath(import.meta.url));
const logFile = join(resolve(here, '..'), '.workbench', 'service.log');

/** Whether the workbench, and not some other program, answers on its port. */
const answers = async () => {
  try {
    const r = await fetch(`${WORKBENCH_URL}/health`, {
      signal: AbortSignal.timeout(1_000),
    });
    return (await r.json()).service === 'solar-workbench';
  } catch {
    return false;
  }
};

export async function ensureWorkbench() {
  if (await answers()) return;
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
  // Until it answers, or it stops (the port taken: another launcher's may answer), for 10 s at most.
  const deadline = Date.now() + 10_000;
  while (!exited && Date.now() < deadline) {
    if (await answers()) return;
    await new Promise((ok) => setTimeout(ok, 200));
  }
  if (await answers()) return;
  console.warn(
    `workbench: the service did not start (see ${logFile}); the viewers run without the bar`,
  );
}
