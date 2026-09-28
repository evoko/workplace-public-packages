#!/usr/bin/env node
// The workbench service: the only thing that writes for Storybook's and Widgetbook's workbench bar.
// Local and dev-only: started by `npm run storybook` and `npm run widgetbook`
// (scripts/workbench-launch.mjs), never by a build. It answers on 127.0.0.1 alone, and pages on
// localhost alone; does one job at a time (packages/codegen/src/workbench/session.mjs); and exits a
// minute after the last viewer stops asking.
//
//   node scripts/workbench.mjs            serve on 6011
//
// The viewers hear what happens by long-polling `GET /events?after=<seq>`, answered at once where
// there is anything after `seq`, else within 25 seconds.
import { execFileSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import {
  basename,
  delimiter,
  dirname,
  join,
  relative,
  resolve,
} from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const WORKBENCH_PORT = 6011;

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * The files whose code the running service is, by path from the repository's root: this script,
 * the session and everything beside it (packages/codegen/src/workbench/), the approvals it reads
 * and writes (src/approvals/), the lookup it inspects by (src/explain/index.mjs), and the overlay
 * rules it edits (src/normalize/overlay.mjs). The rest of the generator runs as its own command
 * (`solar:codegen`), read afresh each time.
 */
export function codeFiles(root = REPO) {
  const dir = (d) =>
    readdirSync(join(root, d))
      .filter((f) => f.endsWith('.mjs'))
      .map((f) => `${d}/${f}`);
  return [
    'scripts/workbench.mjs',
    ...dir('packages/codegen/src/workbench'),
    ...dir('packages/codegen/src/approvals'),
    'packages/codegen/src/explain/index.mjs',
    'packages/codegen/src/normalize/overlay.mjs',
  ].sort();
}

/**
 * The version of the service's code as it is on disk: a hash of `codeFiles`, each path and its
 * text. A service answers the one it started with (`GET /health`), and the launcher starts a fresh
 * one where they differ (scripts/workbench-launch.mjs).
 */
export function codeVersion(root = REPO) {
  const hash = createHash('sha256');
  for (const file of codeFiles(root))
    hash
      .update(file)
      .update('\0')
      .update(readFileSync(join(root, file)))
      .update('\0');
  return hash.digest('hex').slice(0, 16);
}

/** The addresses of this machine itself: a stop is asked from here, never over the network. */
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
/** A page the service answers: served from this machine, over http. */
const LOCAL = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
/** The Host a request to this machine names; any other is a page's DNS rebinding it here. */
const HOST = /^(127\.0\.0\.1|localhost):\d+$/;
/** The largest body read: every request the viewers send is a few hundred bytes. */
const MAX_BODY = 1024 * 1024;

/** A refusal of the request itself, answered with its status (the session's WorkbenchError's shape). */
const refusal = (status, message) =>
  Object.assign(new Error(message), { status });

/** The status an error is answered with: its own where it is an HTTP error's, else 500. */
const statusOf = (error) =>
  Number.isInteger(error?.status) && error.status >= 400 && error.status <= 599
    ? error.status
    : 500;

/** Answers with a JSON body, serialised first: one that cannot be throws, with nothing sent. */
const reply = (res, status, headers, data) => {
  const text = JSON.stringify(data ?? null);
  res
    .writeHead(status, {
      ...headers,
      'Content-Length': Buffer.byteLength(text),
    })
    .end(text);
};

/** Each route: the session method that answers it, and its arguments from the body and the query. */
const ROUTES = {
  'GET /status': ['status', () => []],
  'GET /component': [
    'inspect',
    (_, q) => [q.get('name'), q.get('variant') ?? '0'],
  ],
  'POST /apply': ['apply', (b) => [b]],
  'POST /keep': ['keep', (b) => [b]],
  'POST /undo': ['undo', (b) => [b]],
  'POST /report': ['report', (b) => [b]],
  'POST /send': ['send', (b) => [b]],
  'POST /approve': ['approve', (b) => [b]],
  'POST /unapprove/preview': ['unapprovePreview', (b) => [b]],
  'POST /unapprove': ['unapprove', (b) => [b]],
};

/** A request's body as text, whole (a character split across chunks decoded once); at most MAX_BODY. */
const textOf = (req) =>
  new Promise((ok, fail) => {
    const tooLarge = () => refusal(413, `the body is over ${MAX_BODY} bytes`);
    if (Number(req.headers['content-length']) > MAX_BODY)
      return fail(tooLarge());
    const chunks = [];
    let size = 0;
    const take = (chunk) => {
      size += chunk.length;
      if (size <= MAX_BODY) return chunks.push(chunk);
      req.off('data', take);
      req.pause();
      return fail(tooLarge());
    };
    req.on('data', take);
    req.on('end', () => ok(Buffer.concat(chunks).toString('utf8')));
    req.on('error', fail);
    return undefined;
  });

/** A request's body, which must be a JSON object; none is `{}`. */
async function bodyOf(req) {
  const text = await textOf(req);
  if (!text.trim()) return {};
  let body;
  try {
    body = JSON.parse(text);
  } catch (error) {
    throw refusal(400, `the body is not a JSON object (${error.message})`);
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body))
    throw refusal(400, 'the body is not a JSON object');
  return body;
}

/**
 * Serves a session over HTTP, on 127.0.0.1 (the contract: docs/engineering/architecture.md, The
 * workbench). `server.session` may be set later: until it is, the session's routes answer 503, so
 * the port is taken before the session is built. `idleMs: 0` never exits (the tests); otherwise
 * `onIdle` runs once nothing has been asked for `idleMs`, with no poll waiting and no request being
 * answered. `version` is what `GET /health` names the service's code by (`codeVersion`), and
 * `onShutdown` what `POST /shutdown` runs once no request is being answered: the job running
 * finishes first, never cut mid-way, and no other starts meanwhile.
 * @param {{session?: object | null, port?: number, idleMs?: number, longPollMs?: number,
 *   onIdle?: () => void, version?: string | null, onShutdown?: () => void}} options
 * @returns {Promise<import('node:http').Server & { session: object | null,
 *   publish(event: object): void }>}
 */
export function serve({
  session = null,
  port = WORKBENCH_PORT,
  idleMs = 60_000,
  longPollMs = 25_000,
  onIdle = () => process.exit(0),
  version = null,
  onShutdown = () => process.exit(0),
}) {
  let seq = 0;
  let stopping = false;
  const events = [];
  const waiting = new Set();
  let answering = 0;
  let last = Date.now();

  const publish = (event) => {
    seq += 1;
    events.push({ seq, ...event });
    if (events.length > 100) events.shift();
    for (const wake of waiting) wake();
  };

  const handle = async (req, res, headers) => {
    const send = (status, data) => reply(res, status, headers, data);
    if (!HOST.test(req.headers.host ?? ''))
      return send(403, {
        error: `the workbench answers requests to 127.0.0.1 or localhost alone, not ${req.headers.host}`,
      });
    const origin = req.headers.origin;
    if (origin && !LOCAL.test(origin))
      return send(403, {
        error: `the workbench answers pages on localhost alone, not ${origin}`,
      });
    if (origin)
      Object.assign(headers, {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST',
      });
    if (req.method === 'OPTIONS') return res.writeHead(204, headers).end();
    let url;
    try {
      url = new URL(req.url, 'http://127.0.0.1');
    } catch {
      throw refusal(400, `${req.url} is not a path`);
    }
    const where = `${req.method} ${url.pathname}`;

    if (where === 'GET /health')
      return send(200, {
        service: 'solar-workbench',
        version,
        pid: process.pid,
      });

    // A stop, as the launcher asks one of an older service: from this machine alone, and never a
    // page's (a page's request names its Origin). It ends once the job running has finished.
    if (where === 'POST /shutdown') {
      if (origin || !LOOPBACK.has(req.socket.remoteAddress))
        return send(403, {
          error: 'the workbench is stopped from this machine alone',
        });
      stopping = true;
      send(202, { stopping: true });
      const stop = () => {
        if (answering > 0) return setTimeout(stop, 50);
        clearInterval(idle);
        return onShutdown();
      };
      stop();
      return undefined;
    }

    if (where === 'GET /events') {
      const after = Number(url.searchParams.get('after') ?? 0);
      if (!Number.isInteger(after) || after < 0)
        throw refusal(400, '`after` is the last event seq seen, 0 at first');
      const answer = () => {
        last = Date.now();
        send(200, { seq, events: events.filter((e) => e.seq > after) });
      };
      // Something new, or a viewer ahead of this service (it restarted): answered at once, the
      // second with nothing, so the viewer takes this `seq`.
      if (seq !== after) return answer();
      const done = () => {
        clearTimeout(timer);
        waiting.delete(wake);
      };
      const wake = () => {
        done();
        answer();
      };
      const timer = setTimeout(wake, longPollMs);
      waiting.add(wake);
      res.on('close', done);
      return undefined;
    }

    const route = ROUTES[where];
    if (!route) return send(404, { error: `no ${where}` });
    const [method, argsOf] = route;
    const s = server.session;
    if (!s) return send(503, { error: 'the workbench is still starting' });
    if (stopping) return send(503, { error: 'the workbench is stopping' });
    answering += 1;
    try {
      const body = req.method === 'POST' ? await bodyOf(req) : {};
      // The status names the last event sent before it was read: a bar long-polls from there,
      // and so hears every event after what it read, and none before (a reload of an earlier job).
      const at = seq;
      const answer = await s[method](...argsOf(body, url.searchParams));
      return send(
        200,
        where === 'GET /status' ? { ...answer, seq: at } : answer,
      );
    } finally {
      answering -= 1;
      last = Date.now();
    }
  };

  const server = createServer(async (req, res) => {
    last = Date.now();
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      Vary: 'Origin',
    };
    try {
      await handle(req, res, headers);
    } catch (error) {
      // Nothing escapes a request: its answer is the error's, or where that has begun, it is cut.
      if (res.headersSent) return res.destroy();
      const status = statusOf(error);
      if (status === 413) {
        // The rest of the body is not read: the connection ends once the refusal is sent.
        headers.Connection = 'close';
        res.on('finish', () => req.destroy());
      }
      reply(res, status, headers, {
        error: String(error?.message ?? error).split('\n')[0],
      });
    }
    return undefined;
  });

  server.session = session;
  server.publish = publish;
  const idle =
    idleMs > 0 &&
    setInterval(
      () => {
        if (Date.now() - last <= idleMs || waiting.size || answering) return;
        clearInterval(idle);
        onIdle();
      },
      Math.min(5_000, idleMs),
    ).unref();
  // Closing ends the polls still waiting, which would otherwise hold it open.
  const close = server.close.bind(server);
  server.close = (callback) => {
    if (idle) clearInterval(idle);
    close(callback);
    server.closeAllConnections();
    return server;
  };
  return new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(port, '127.0.0.1', () => {
      server.off('error', fail);
      ok(server);
    });
  });
}

/**
 * Writes a file whole or not at all (as the generator's util/write.mjs does): beside itself, then
 * renamed over the target, so a viewer, an agent or the generator never reads a note, an overlay
 * or the approvals cut short. A write that fails leaves the target as it was, and no partial file.
 */
export function writeWhole(path, text) {
  mkdirSync(dirname(path), { recursive: true });
  const partial = `${path}.partial-${process.pid}`;
  try {
    writeFileSync(partial, text);
    renameSync(partial, path);
  } catch (error) {
    rmSync(partial, { force: true });
    throw error;
  }
}

/** How long a command may run before it is stopped: a check that hangs would hold every job. */
const RUN_LIMIT_MS = 15 * 60_000;

/**
 * Runs a command to its end: whether it passed, and all it printed. It never rejects: a command
 * that cannot start is `{ ok: false, output: <why> }`, and one still running after `timeoutMs` is
 * stopped, with its process group (the test runners' own children too), and fails saying so. This
 * Node's directory leads PATH, so `npx` and the test runners it starts run on the Node the service
 * runs on (.nvmrc).
 * @param {string} cmd
 * @param {string[]} args
 * @param {{cwd?: string, env?: object, timeoutMs?: number}} [opts]
 * @returns {Promise<{ok: boolean, output: string}>}
 */
export function runCommand(
  cmd,
  args,
  { cwd, env = {}, timeoutMs = RUN_LIMIT_MS } = {},
) {
  return new Promise((ok) => {
    let output = '';
    let done = false;
    const finish = (result) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      ok(result);
    };
    const child = spawn(cmd, args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      // Its own process group, so a stop reaches what it started.
      detached: true,
      env: {
        ...process.env,
        PATH: `${dirname(process.execPath)}${delimiter}${process.env.PATH ?? ''}`,
        ...env,
      },
    });
    const timer = setTimeout(() => {
      try {
        process.kill(-child.pid, 'SIGTERM');
      } catch {
        // It ended as it was stopped.
      }
      const limit =
        timeoutMs >= 60_000
          ? `${Math.round(timeoutMs / 60_000)} minutes`
          : `${Math.round(timeoutMs / 1000)} seconds`;
      finish({ ok: false, output: `${output}\n… stopped after ${limit}` });
    }, timeoutMs);
    child.stdout.on('data', (d) => (output += d));
    child.stderr.on('data', (d) => (output += d));
    child.on('error', (error) => finish({ ok: false, output: error.message }));
    child.on('close', (code) => finish({ ok: code === 0, output }));
  });
}

/**
 * Tells Widgetbook's `flutter run` to hot-restart (SIGUSR2), by the pid scripts/widgetbook.mjs writes
 * to `pidFile`: a restart, not a reload, so the app starts again on what was regenerated and its
 * bar reopens the dialog where the person was (the status's `reopen`). Nothing where there is no
 * such file, it holds no pid, or the pid is not a flutter's or dart's: a stale pid may be another
 * program's. `commandOf` and `kill` are injected in the test.
 */
export function restartWidgetbook(
  pidFile,
  {
    commandOf = (pid) =>
      execFileSync('ps', ['-p', String(pid), '-o', 'comm='], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }),
    kill = (pid, signal) => process.kill(pid, signal),
  } = {},
) {
  if (!existsSync(pidFile)) return false;
  const pid = Number(readFileSync(pidFile, 'utf8').trim());
  // Never 0 or a negative number, which would signal this process's group.
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    if (!/^(flutter|dart)/.test(basename(String(commandOf(pid)).trim())))
      return false;
    kill(pid, 'SIGUSR2');
    return true;
  } catch {
    // Widgetbook is not running.
    return false;
  }
}

/** The real session: the repository's files, the generator, the approvals. */
async function realSession(publish) {
  const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const codegen = (p) =>
    pathToFileURL(join(repoRoot, 'packages/codegen/src', p)).href;
  const stage = await import(codegen('stages/components.mjs'));
  const { overlayDir, overlayFileOf } = await import(
    codegen('normalize/overlay.mjs')
  );
  const status = await import(codegen('approvals/status.mjs'));
  const { createSession, WorkbenchError } = await import(
    codegen('workbench/session.mjs')
  );
  const { runChecks } = await import(codegen('workbench/checks.mjs'));
  const abs = (p) => join(repoRoot, p);
  /** Runs a command, in the repository unless told where (runCommand). */
  const run = (cmd, args, opts = {}) =>
    runCommand(cmd, args, { cwd: repoRoot, ...opts });
  const pidFile = abs('.workbench/widgetbook.pid');
  return createSession({
    files: {
      read: (p) => (existsSync(abs(p)) ? readFileSync(abs(p), 'utf8') : null),
      write: (p, t) => writeWhole(abs(p), t),
      remove: (p) => rmSync(abs(p), { force: true }),
      list: (dir) => (existsSync(abs(dir)) ? readdirSync(abs(dir)) : []),
    },
    overlayPath: (name) => {
      const i = stage.NAMES.indexOf(name);
      if (i < 0)
        throw new WorkbenchError(400, `${name} is not a generated component`);
      return relative(
        repoRoot,
        join(overlayDir, overlayFileOf(stage.COMPONENTS[i])),
      );
    },
    approvalsPath: relative(repoRoot, status.approvalsFile),
    pendingPath: '.workbench/pending.json',
    feedbackDir: 'spec/feedback',
    // As the files are now.
    build: () => stage.build(),
    codegen: () =>
      run(process.execPath, ['packages/codegen/bin/solar-codegen.mjs']),
    status: async () => {
      const approvals = status.readApprovals();
      return {
        coloured: status.colour(await status.scan(), approvals),
        approvals,
      };
    },
    // A component's own checks, one after another: its web and Flutter visual checks and the
    // parity suite (workbench/checks.mjs). Their reports are git-ignored build output.
    checks: (component) =>
      runChecks(component, {
        run,
        read: (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null),
        remove: (p) => rmSync(p, { force: true }),
      }),
    reload: () => restartWidgetbook(pidFile),
    today: () => new Date().toISOString().slice(0, 10),
    emit: (event) => publish(event),
  });
}

/** Whether this file is the one node was asked to run (and not imported, as by its test). */
const isMain = () => {
  try {
    return (
      import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href
    );
  } catch {
    return false;
  }
};

if (isMain()) {
  // First, before the generator loads: the Node it needs (.nvmrc).
  await import('../packages/codegen/src/util/require-node.mjs');
  // The port first, so a second service started at the same time stops at once; the session's
  // routes answer 503 until it is built.
  let server;
  try {
    server = await serve({ version: codeVersion() });
  } catch (error) {
    console.error(
      error.code === 'EADDRINUSE'
        ? `workbench: port ${WORKBENCH_PORT} is taken (another workbench, or another program)`
        : `workbench: ${error.message}`,
    );
    process.exit(1);
  }
  try {
    server.session = await realSession((event) => server.publish(event));
  } catch (error) {
    console.error(`workbench: ${error.message}`);
    process.exit(1);
  }
  console.log(`solar workbench on http://127.0.0.1:${WORKBENCH_PORT}`);
}
