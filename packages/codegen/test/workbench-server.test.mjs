// The workbench service's HTTP layer (scripts/workbench.mjs), over a fake session on a free port:
// it never starts the real session, and touches no file of the repository.
import {
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { connect } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WORKBENCH_URL } from '../../../scripts/workbench-launch.mjs';
import {
  reloadWidgetbook,
  serve,
  WORKBENCH_PORT,
  writeWhole,
} from '../../../scripts/workbench.mjs';
import { WorkbenchError } from '../src/workbench/session.mjs';

const calls = [];
// No `send` yet (Batch 4): the server answers it as not done.
const session = {
  status: async () => ({ busy: null, pending: null, components: {} }),
  inspect: (name, variant) => ({ component: name, variant }),
  set: async (b) => {
    calls.push(['set', b]);
    return { ok: 1 };
  },
  keep: async () => {
    throw new WorkbenchError(400, 'write a reason a reviewer can check');
  },
  undo: async () => {
    throw new Error('the disk is full\nat somewhere deep');
  },
  report: async (b) => {
    calls.push(['report', b]);
    return { file: 'spec/feedback/button-1.yaml' };
  },
  approve: async (b) => ({ ok: true, b }),
  unapprovePreview: async () => ({ withdraws: ['Button'] }),
  unapprove: async () => ({ withdraws: ['Button'] }),
};

const waitFor = (ms) => new Promise((ok) => setTimeout(ok, ms));
const post = (url, body) => fetch(url, { method: 'POST', body });
const at = (server) => `http://127.0.0.1:${server.address().port}`;

/**
 * Writes a request's bytes over a raw socket, in parts with a pause between (so the service reads
 * them as separate chunks), and resolves with the status and body it answered before closing.
 */
const raw = (server, parts) =>
  new Promise((ok) => {
    const socket = connect(server.address().port, '127.0.0.1');
    const chunks = [];
    const done = () => {
      const text = Buffer.concat(chunks).toString('utf8');
      const [head, ...body] = text.split('\r\n\r\n');
      ok({
        status: Number(head.split(' ')[1]) || null,
        body: body.join('\r\n\r\n'),
      });
    };
    socket.on('data', (d) => chunks.push(d));
    socket.on('close', done);
    // A reset once the answer is sent (the service cuts a body it will not read).
    socket.on('error', () => {});
    socket.on('connect', async () => {
      for (const part of parts) {
        if (socket.destroyed) return;
        socket.write(part);
        await waitFor(30);
      }
    });
  });

/** A request's head, for `raw`, closing the connection after the answer. */
const head = (server, line, headers = {}) =>
  [
    line,
    ...Object.entries({
      Host: `127.0.0.1:${server.address().port}`,
      Connection: 'close',
      ...headers,
    }).map(([k, v]) => `${k}: ${v}`),
    '',
    '',
  ].join('\r\n');

let server;
let base;
beforeAll(async () => {
  server = await serve({ session, port: 0, idleMs: 0, longPollMs: 300 });
  base = at(server);
});
afterAll(() => server.close());

describe('the workbench service', () => {
  it('listens on 127.0.0.1 alone', () => {
    expect(server.address().address).toBe('127.0.0.1');
  });

  it('says who it is', async () => {
    expect(await (await fetch(`${base}/health`)).json()).toEqual({
      service: 'solar-workbench',
    });
  });

  it('routes a component’s inspection, and a set', async () => {
    expect(
      await (await fetch(`${base}/component?name=Button&variant=2`)).json(),
    ).toEqual({ component: 'Button', variant: '2' });
    expect(await (await fetch(`${base}/component?name=Button`)).json()).toEqual(
      { component: 'Button', variant: '0' },
    );
    const r = await post(
      `${base}/set`,
      JSON.stringify({ component: 'Button' }),
    );
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ ok: 1 });
    expect(calls[0]).toEqual(['set', { component: 'Button' }]);
  });

  it('routes the approvals', async () => {
    const body = JSON.stringify({ component: 'Button', platform: 'web' });
    expect(await (await post(`${base}/approve`, body)).json()).toEqual({
      ok: true,
      b: { component: 'Button', platform: 'web' },
    });
    for (const path of ['/unapprove/preview', '/unapprove'])
      expect(await (await post(`${base}${path}`, body)).json()).toEqual({
        withdraws: ['Button'],
      });
  });

  it('answers a refusal with its status and sentence', async () => {
    const r = await post(`${base}/keep`, '{}');
    expect(r.status).toBe(400);
    expect(await r.json()).toEqual({
      error: 'write a reason a reviewer can check',
    });
  });

  it('answers any other failure with 500 and its first line', async () => {
    const r = await post(`${base}/undo`, '{}');
    expect(r.status).toBe(500);
    expect(await r.json()).toEqual({ error: 'the disk is full' });
  });

  it('decodes a character split across two chunks of the body', async () => {
    const body = Buffer.from(JSON.stringify({ component: 'it’s' }));
    const cut = body.indexOf(Buffer.from('’')) + 1;
    const r = await raw(server, [
      head(server, 'POST /approve HTTP/1.1', {
        'Content-Type': 'application/json',
        'Content-Length': body.length,
      }),
      body.subarray(0, cut),
      body.subarray(cut),
    ]);
    expect(r.status).toBe(200);
    expect(JSON.parse(r.body).b).toEqual({ component: 'it’s' });
  });

  it('refuses a body over a megabyte, declared or sent', async () => {
    const declared = await raw(server, [
      head(server, 'POST /set HTTP/1.1', { 'Content-Length': 2_000_000 }),
    ]);
    expect(declared.status).toBe(413);
    expect(JSON.parse(declared.body).error).toMatch(/over/);
    const size = 1024 * 1024 + 1;
    const sent = await raw(server, [
      head(server, 'POST /set HTTP/1.1', { 'Transfer-Encoding': 'chunked' }),
      `${size.toString(16)}\r\n${'x'.repeat(size)}\r\n0\r\n\r\n`,
    ]);
    expect(sent.status).toBe(413);
    expect(calls.length).toBe(1);
  });

  it('answers a request target that is no URL with 400', async () => {
    const r = await raw(server, [head(server, 'GET http://[ HTTP/1.1')]);
    expect(r.status).toBe(400);
    expect(JSON.parse(r.body)).toEqual({ error: 'http://[ is not a path' });
    expect(await (await fetch(`${base}/health`)).json()).toEqual({
      service: 'solar-workbench',
    });
  });

  it('refuses a request naming another host (DNS rebinding)', async () => {
    const no = await raw(server, [
      head(server, 'GET /health HTTP/1.1', { Host: 'attacker.example:6011' }),
    ]);
    expect(no.status).toBe(403);
    expect(JSON.parse(no.body).error).toMatch(/127\.0\.0\.1 or localhost/);
    const yes = await raw(server, [
      head(server, 'GET /health HTTP/1.1', {
        Host: `localhost:${server.address().port}`,
      }),
    ]);
    expect(yes.status).toBe(200);
  });

  it('refuses a body that is not a JSON object', async () => {
    for (const body of ['{"component":', '[1]', 'null']) {
      const r = await post(`${base}/set`, body);
      expect(r.status).toBe(400);
      expect((await r.json()).error).toMatch(/JSON object/);
    }
  });

  it('answers a route it lacks with 404, and one the session lacks with 501', async () => {
    const none = await fetch(`${base}/nothing`);
    expect(none.status).toBe(404);
    expect(await none.json()).toEqual({ error: 'no GET /nothing' });
    const r = await post(`${base}/send`, '{}');
    expect(r.status).toBe(501);
    expect((await r.json()).error).toMatch(/not yet/);
  });

  it('hands a Report to the session, and answers with the note it wrote', async () => {
    const body = {
      component: 'Button',
      platform: 'web',
      controls: { label: 'Save', disabled: false, width: 120, icon: null },
      note: 'Too tight.\nAt 120 wide.',
    };
    const r = await post(`${base}/report`, JSON.stringify(body));
    expect(r.status).toBe(200);
    expect(await r.json()).toEqual({ file: 'spec/feedback/button-1.yaml' });
    expect(calls.at(-1)).toEqual(['report', body]);
  });

  it('lets a localhost page call it, and no other', async () => {
    for (const origin of ['http://localhost:6006', 'http://127.0.0.1:8080']) {
      const ok = await fetch(`${base}/health`, { headers: { Origin: origin } });
      expect(ok.status).toBe(200);
      expect(ok.headers.get('access-control-allow-origin')).toBe(origin);
    }
    for (const origin of [
      'https://example.com',
      'http://localhost.example.com',
      'https://localhost:6006',
    ]) {
      const no = await fetch(`${base}/health`, { headers: { Origin: origin } });
      expect(no.status).toBe(403);
      expect(no.headers.get('access-control-allow-origin')).toBeNull();
    }
  });

  it('refuses another page’s preflight', async () => {
    const r = await fetch(`${base}/set`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://example.com',
        'Access-Control-Request-Method': 'POST',
      },
    });
    expect(r.status).toBe(403);
    expect(r.headers.get('access-control-allow-origin')).toBeNull();
  });

  it('answers a localhost page’s preflight', async () => {
    const r = await fetch(`${base}/set`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:6006',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    expect(r.status).toBe(204);
    expect(r.headers.get('access-control-allow-origin')).toBe(
      'http://localhost:6006',
    );
    expect(r.headers.get('access-control-allow-methods')).toMatch(/POST/);
    expect(r.headers.get('access-control-allow-headers')).toMatch(
      /Content-Type/i,
    );
  });

  it('long-polls events: an event published wakes a waiting poll', async () => {
    const started = Date.now();
    const poll = fetch(`${base}/events?after=0`).then((r) => r.json());
    await waitFor(50);
    server.publish({ type: 'changed' });
    const { seq, events } = await poll;
    expect(Date.now() - started).toBeGreaterThanOrEqual(45);
    expect(seq).toBe(1);
    expect(events).toEqual([{ seq: 1, type: 'changed' }]);
  });

  it('answers at once with the events after the one a viewer has', async () => {
    server.publish({ type: 'busy', message: 'Regenerating…' });
    expect(await (await fetch(`${base}/events?after=0`)).json()).toEqual({
      seq: 2,
      events: [
        { seq: 1, type: 'changed' },
        { seq: 2, type: 'busy', message: 'Regenerating…' },
      ],
    });
  });

  it('answers a poll with nothing new once its wait is over', async () => {
    const started = Date.now();
    expect(await (await fetch(`${base}/events?after=2`)).json()).toEqual({
      seq: 2,
      events: [],
    });
    expect(Date.now() - started).toBeGreaterThanOrEqual(290);
  });

  it('answers at once a viewer ahead of it (the service restarted)', async () => {
    const started = Date.now();
    expect(await (await fetch(`${base}/events?after=40`)).json()).toEqual({
      seq: 2,
      events: [],
    });
    expect(Date.now() - started).toBeLessThan(250);
  });

  it('refuses an `after` that is not a number', async () => {
    const r = await fetch(`${base}/events?after=soon`);
    expect(r.status).toBe(400);
  });
});

describe('the workbench service, whatever a session does', () => {
  const circular = {};
  circular.self = circular;
  let odd;
  beforeAll(async () => {
    odd = await serve({ port: 0, idleMs: 0 });
  });
  afterAll(() => odd.close());

  it('answers 503 until it has a session', async () => {
    const r = await fetch(`${at(odd)}/status`);
    expect(r.status).toBe(503);
    expect(await r.json()).toEqual({
      error: 'the workbench is still starting',
    });
    expect((await fetch(`${at(odd)}/health`)).status).toBe(200);
  });

  it('answers 500 for an answer it cannot send, or a status no HTTP one', async () => {
    odd.session = {
      status: async () => circular,
      set: async () => {
        throw Object.assign(new Error('git failed'), { status: 1 });
      },
      keep: async () => {
        throw Object.assign(new Error('odd'), { status: 200 });
      },
      undo: async () => {
        throw Object.assign(new Error('odd'), { status: '409' });
      },
    };
    const r = await fetch(`${at(odd)}/status`);
    expect(r.status).toBe(500);
    expect((await r.json()).error).toMatch(/circular/i);
    for (const path of ['/set', '/keep', '/undo'])
      expect((await post(`${at(odd)}${path}`, '{}')).status).toBe(500);
    expect((await fetch(`${at(odd)}/health`)).status).toBe(200);
  });
});

describe('the workbench service’s idle exit', () => {
  it('ends after idleMs with nothing asked, never while a poll waits', async () => {
    let idle = 0;
    const s = await serve({
      session,
      port: 0,
      idleMs: 100,
      longPollMs: 10_000,
      onIdle: () => {
        idle += 1;
      },
    });
    try {
      const poll = fetch(`${at(s)}/events?after=0`).then((r) => r.json());
      await waitFor(400);
      expect(idle).toBe(0);
      s.publish({ type: 'changed' });
      await poll;
      await waitFor(400);
      expect(idle).toBe(1);
    } finally {
      s.close();
    }
  });

  it('ends once a waiting poll is given up', async () => {
    let idle = 0;
    const s = await serve({
      session,
      port: 0,
      idleMs: 100,
      longPollMs: 10_000,
      onIdle: () => {
        idle += 1;
      },
    });
    try {
      const giveUp = new AbortController();
      const poll = fetch(`${at(s)}/events?after=0`, {
        signal: giveUp.signal,
      }).catch(() => 'given up');
      await waitFor(300);
      expect(idle).toBe(0);
      giveUp.abort();
      expect(await poll).toBe('given up');
      await waitFor(400);
      expect(idle).toBe(1);
    } finally {
      s.close();
    }
  });

  it('never ends while a request is being answered', async () => {
    let idle = 0;
    let finish;
    const slow = {
      ...session,
      set: () => new Promise((ok) => (finish = ok)),
    };
    const s = await serve({
      session: slow,
      port: 0,
      idleMs: 100,
      onIdle: () => {
        idle += 1;
      },
    });
    try {
      const answer = post(`${at(s)}/set`, '{}');
      await waitFor(400);
      expect(idle).toBe(0);
      finish({ done: true });
      expect(await (await answer).json()).toEqual({ done: true });
      await waitFor(400);
      expect(idle).toBe(1);
    } finally {
      s.close();
    }
  });
});

describe('the launcher', () => {
  it('asks the service on its port', () => {
    expect(WORKBENCH_URL).toBe(`http://127.0.0.1:${WORKBENCH_PORT}`);
  });
});

describe('reloading Widgetbook', () => {
  const dir = mkdtempSync(join(tmpdir(), 'workbench-pid-'));
  const pidFile = join(dir, 'widgetbook.pid');
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  const reload = (text, command) => {
    const killed = [];
    if (text === null) rmSync(pidFile, { force: true });
    else writeFileSync(pidFile, text);
    const sent = reloadWidgetbook(pidFile, {
      commandOf: () => {
        if (command instanceof Error) throw command;
        return command;
      },
      kill: (pid, signal) => killed.push([pid, signal]),
    });
    return { sent, killed };
  };

  it('signals a flutter or dart by its pid', () => {
    expect(reload('4242\n', '/opt/flutter/bin/flutter\n')).toEqual({
      sent: true,
      killed: [[4242, 'SIGUSR1']],
    });
    expect(reload('4242', 'dart').killed).toEqual([[4242, 'SIGUSR1']]);
  });

  it('signals nothing else', () => {
    for (const [text, command] of [
      [null, 'flutter'],
      ['', 'flutter'],
      ['0', 'flutter'],
      ['-1', 'flutter'],
      ['12.5', 'flutter'],
      ['4242', '/usr/bin/vim'],
      ['4242', ''],
      ['4242', new Error('no such process')],
    ])
      expect(reload(text, command)).toEqual({ sent: false, killed: [] });
  });
});

describe('a file the real session writes', () => {
  let dir;
  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'workbench-write-'));
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('is written whole, beside itself and renamed, into a folder made where there is none', () => {
    const file = join(dir, 'spec/feedback/button-1.yaml');
    writeWhole(file, 'first\n');
    expect(readFileSync(file, 'utf8')).toBe('first\n');
    writeWhole(file, 'second\n');
    expect(readFileSync(file, 'utf8')).toBe('second\n');
    expect(readdirSync(join(dir, 'spec/feedback'))).toEqual(['button-1.yaml']);
  });

  it('leaves the target as it was, and no partial file, where the write fails', () => {
    // A folder in the target's place: the rename over it fails.
    const target = join(dir, 'taken');
    mkdirSync(join(target, 'inside'), { recursive: true });
    expect(() => writeWhole(target, 'text')).toThrow();
    expect(readdirSync(dir).sort()).toEqual(['spec', 'taken']);
    expect(readdirSync(target)).toEqual(['inside']);
  });
});
