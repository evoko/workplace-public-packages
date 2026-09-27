// A note (workbench/feedback.mjs) and the session's `report` and `send`, on files in memory.
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { noteFile, noteText } from '../src/workbench/feedback.mjs';
import { MAX_FAILURES } from '../src/workbench/checks.mjs';
import {
  createSession,
  MAX_NOTE,
  WorkbenchError,
} from '../src/workbench/session.mjs';

describe('a Report note', () => {
  it('is named after the component, numbered after the notes already there', () => {
    expect(noteFile([], 'Text Input')).toBe('text-input-1.yaml');
    expect(
      noteFile(
        ['text-input-1.yaml', 'text-input-3.yaml', 'button-1.yaml', '.gitkeep'],
        'Text Input',
      ),
    ).toBe('text-input-4.yaml');
    // Another component whose slug starts the same is not counted.
    expect(noteFile(['text-input-7.yaml'], 'Text')).toBe('text-1.yaml');
    // No stray dash from a name that starts or ends with a character a slug drops.
    expect(noteFile([], ' Chip (web) ')).toBe('chip-web-1.yaml');
  });

  it('holds everything the agent needs, as YAML under a header', () => {
    const text = noteText({
      component: 'Button',
      platform: 'web',
      controls: { label: 'Save', size: 'md' },
      layer: 'label',
      variant: 'size=md, prio=primary, state=default, danger=false',
      note: 'The label wraps at 120 wide.',
      on: '2026-09-27',
    });
    expect(text.startsWith('# A note for /solar-feedback')).toBe(true);
    expect(parse(text)).toEqual({
      component: 'Button',
      platform: 'web',
      on: '2026-09-27',
      note: 'The label wraps at 120 wide.',
      layer: 'label',
      variant: 'size=md, prio=primary, state=default, danger=false',
      controls: { label: 'Save', size: 'md' },
    });
  });

  it('keeps any control value and any note exactly, through YAML', () => {
    const controls = {
      label: 'true',
      count: 3,
      ratio: 0.5,
      negative: -1,
      disabled: false,
      open: true,
      icon: null,
      empty: '',
      number: '42',
      nothing: 'null',
      colon: 'a: b # not a comment',
      quote: `"it's"`,
      multi: 'one\ntwo',
      long: 'x '.repeat(80).trim(),
      'with space': 'yes',
    };
    const note = 'First line: tight.\n  - indented\n# not a comment\n\nlast';
    const text = noteText({
      component: 'Button',
      platform: 'flutter',
      controls,
      note,
      on: '2026-09-27',
    });
    expect(parse(text)).toEqual({
      component: 'Button',
      platform: 'flutter',
      on: '2026-09-27',
      note,
      controls,
    });
  });

  it('lists the failing checks where there are any, and nothing where there are none', () => {
    const base = {
      component: 'Button',
      platform: 'web',
      note: 'x',
      on: '2026-09-27',
    };
    expect(parse(noteText({ ...base, failures: [] }))).toEqual({
      ...base,
      controls: {},
    });
    const failures = [{ platform: 'web', layer: 'root', property: 'height' }];
    expect(parse(noteText({ ...base, failures })).failures).toEqual(failures);
  });

  it('names the rule a failing Keep kept, and its value, null where the edit removed it', () => {
    const base = {
      component: 'Button',
      platform: 'web',
      note: 'x',
      on: '2026-09-27',
    };
    expect(
      parse(
        noteText({
          ...base,
          rule: 'root.base.radius',
          value: { token: 'radius.full' },
        }),
      ),
    ).toEqual({
      ...base,
      controls: {},
      rule: 'root.base.radius',
      value: { token: 'radius.full' },
    });
    expect(
      parse(noteText({ ...base, rule: 'root.base.radius', value: null })).value,
    ).toBeNull();
    expect(parse(noteText(base))).not.toHaveProperty('rule');
  });
});

/** A session over files in memory, with Button's colours on both platforms as given. */
function world(colours = { web: 'yellow', flutter: 'yellow' }) {
  const files = new Map([['spec/overlay/button.yaml', 'component: Button\n']]);
  const events = [];
  const state = { colours };
  const deps = {
    files: {
      read: (p) => files.get(p) ?? null,
      write: (p, t) => files.set(p, t),
      remove: (p) => files.delete(p),
      list: (dir) =>
        [...files.keys()]
          .filter((k) => k.startsWith(`${dir}/`))
          .map((k) => k.slice(dir.length + 1)),
    },
    overlayPath: (name) => `spec/overlay/${name.toLowerCase()}.yaml`,
    approvalsPath: 'spec/approvals.yaml',
    pendingPath: '.workbench/pending.json',
    feedbackDir: 'spec/feedback',
    build: () => {
      throw new Error('not used');
    },
    codegen: async () => ({ ok: true, output: '' }),
    status: async () => ({
      coloured: Object.fromEntries(
        ['web', 'flutter'].map((p) => [
          p,
          state.colours[p]
            ? [
                {
                  name: 'Button',
                  colour: state.colours[p],
                  uses: ['Icon'],
                  waitsOn: state.colours[p] === 'red' ? ['Icon'] : [],
                },
              ]
            : [],
        ]),
      ),
      approvals: {},
    }),
    checks: async () => ({ ok: true, failures: [] }),
    reload: () => {},
    today: () => '2026-09-27',
    emit: (e) => events.push(e),
  };
  return { files, events, state, deps };
}

const reportBody = (extra = {}) => ({
  component: 'Button',
  platform: 'web',
  controls: {},
  note: 'Too tight.',
  ...extra,
});

/** The refusal an operation ends in; a test fails where it succeeds instead. */
async function refusal(promise) {
  const outcome = await promise.then(
    (value) => ({ value }),
    (error) => ({ error }),
  );
  expect(outcome.error, 'the operation should be refused').toBeInstanceOf(
    WorkbenchError,
  );
  return outcome.error;
}

/** The notes written, by path. */
const notes = (w) =>
  [...w.files.keys()].filter((k) => k.startsWith('spec/feedback/'));

describe('reporting from a viewer', () => {
  it('writes a note, numbered after the notes already there, trimmed, lines kept', async () => {
    const w = world();
    w.files.set('spec/feedback/.gitkeep', '');
    w.files.set('spec/feedback/button-2.yaml', 'old');
    const s = createSession(w.deps);
    const { file } = await s.report(
      reportBody({
        platform: 'flutter',
        controls: { label: 'Save', disabled: true, width: 120, icon: null },
        layer: 'label',
        variant: 'size=md, prio=primary',
        note: '  The label wraps.\nAt 120 wide.  \n',
      }),
    );
    expect(file).toBe('spec/feedback/button-3.yaml');
    expect(w.files.get('spec/feedback/button-2.yaml')).toBe('old');
    const text = w.files.get(file);
    expect(text.startsWith('# A note for /solar-feedback')).toBe(true);
    expect(parse(text)).toEqual({
      component: 'Button',
      platform: 'flutter',
      on: '2026-09-27',
      note: 'The label wraps.\nAt 120 wide.',
      layer: 'label',
      variant: 'size=md, prio=primary',
      controls: { label: 'Save', disabled: true, width: 120, icon: null },
    });
    expect(w.events.map((e) => e.type)).toEqual(['busy', 'changed']);
    const again = await s.report(reportBody());
    expect(again.file).toBe('spec/feedback/button-4.yaml');
    expect(parse(w.files.get(again.file)).controls).toEqual({});
  });

  it('takes a component absent from one platform, reported on the other', async () => {
    const w = world({ web: 'yellow' });
    const s = createSession(w.deps);
    const e = await refusal(s.report(reportBody({ platform: 'flutter' })));
    expect(e.status).toBe(400);
    expect(e.message).toBe('Flutter has no Button');
    expect(notes(w)).toEqual([]);
    const { file } = await s.report(reportBody());
    expect(file).toBe('spec/feedback/button-1.yaml');
    const onlyFlutter = world({ flutter: 'yellow' });
    const refused = await refusal(
      createSession(onlyFlutter.deps).report(reportBody()),
    );
    expect(refused.message).toBe('Web has no Button');
  });

  it('is written while a look edit is pending: it touches only spec/feedback/', async () => {
    const w = world();
    w.files.set(
      '.workbench/pending.json',
      JSON.stringify({
        component: 'Button',
        key: 'root.base.background',
        before: 'component: Button\n',
        placeholder: 'x',
        after: 'x',
      }),
    );
    const s = createSession(w.deps);
    const { file } = await s.report(reportBody());
    expect(file).toBe('spec/feedback/button-1.yaml');
    expect((await s.status()).pending.component).toBe('Button');
  });

  it('refuses an empty note, a platform other than the two, and controls that are not an object', async () => {
    const w = world();
    const s = createSession(w.deps);
    for (const body of [
      reportBody({ note: ' \n\t ' }),
      reportBody({ note: undefined }),
      reportBody({ note: 42 }),
    ]) {
      const e = await refusal(s.report(body));
      expect(e.status).toBe(400);
      expect(e.message).toMatch(/note/);
    }
    for (const platform of ['ios', undefined]) {
      const e = await refusal(s.report(reportBody({ platform })));
      expect(e.status).toBe(400);
      expect(e.message).toMatch(/web or flutter/);
    }
    for (const controls of [[1], 'label=Save', 3]) {
      const e = await refusal(s.report(reportBody({ controls })));
      expect(e.status).toBe(400);
      expect(e.message).toMatch(/controls/);
    }
    for (const extra of [{ layer: 3 }, { variant: { a: 1 } }]) {
      const e = await refusal(s.report(reportBody(extra)));
      expect(e.status).toBe(400);
    }
    expect(notes(w)).toEqual([]);
    expect(w.events.filter((e) => e.type === 'failed')).toHaveLength(10);
  });

  it('refuses a component neither viewer shows', async () => {
    const w = world();
    const e = await refusal(
      createSession(w.deps).report(reportBody({ component: 'Nothing' })),
    );
    expect(e.status).toBe(400);
    expect(e.message).toMatch(/Nothing is not a component/);
    expect(notes(w)).toEqual([]);
  });

  it('refuses a component approved on either platform, or waiting on another, with the gate’s sentence', async () => {
    for (const [colours, words] of [
      [{ web: 'green', flutter: 'yellow' }, /approved on web/],
      [{ web: 'yellow', flutter: 'green' }, /approved on Flutter/],
      [{ web: 'yellow', flutter: 'red' }, /waits on Icon on Flutter/],
    ]) {
      const w = world(colours);
      const e = await refusal(createSession(w.deps).report(reportBody()));
      expect(e.status).toBe(409);
      expect(e.message).toMatch(words);
      expect(notes(w)).toEqual([]);
    }
  });
});

describe('sending to the agent from a viewer', () => {
  const failures = [{ platform: 'flutter', message: 'boom' }];
  const sendBody = (extra = {}) => ({
    component: 'Button',
    platform: 'web',
    note: 'Approve refused.',
    failures,
    ...extra,
  });

  it('writes a refused Approve’s failures in a note, the component left unapproved', async () => {
    const w = world();
    w.deps.checks = async () => ({ ok: false, failures });
    const s = createSession(w.deps);
    const r = await s.approve({ component: 'Button', platform: 'web' });
    expect(r).toEqual({ ok: false, failures });
    const { file } = await s.send(sendBody({ failures: r.failures }));
    expect(file).toBe('spec/feedback/button-1.yaml');
    expect(parse(w.files.get(file))).toEqual({
      component: 'Button',
      platform: 'web',
      on: '2026-09-27',
      note: 'Approve refused.',
      controls: {},
      failures,
    });
    expect(w.files.has('spec/approvals.yaml')).toBe(false);
    expect(w.events.map((e) => e.type).slice(-2)).toEqual(['busy', 'changed']);
  });

  it('names the rule kept from a failing Keep saved before a restart, null where the edit removed it', async () => {
    const w = world();
    const kept = [{ platform: 'web', layer: 'root', property: 'height' }];
    w.files.set(
      '.workbench/pending.json',
      JSON.stringify({
        component: 'Button',
        key: 'root.size=md.radius',
        value: { token: 'radius.control' },
        deletes: true,
        before: 'component: Button\n',
        placeholder: 'x',
        after: 'x',
        failing: kept,
      }),
    );
    const s = createSession(w.deps);
    const { file } = await s.send(sendBody({ failures: undefined, note: '' }));
    expect(parse(w.files.get(file))).toMatchObject({
      layer: 'root',
      rule: 'root.size=md.radius',
      value: null,
      failures: kept,
    });
    expect(w.files.has('.workbench/pending.json')).toBe(false);
    expect((await s.status()).pending).toBeNull();
  });

  it('refuses failures that are not the contract’s, too many of them, and a note too long', async () => {
    const w = world();
    const s = createSession(w.deps);
    for (const bad of [
      [{ message: 'no platform' }],
      [{ platform: 'ios', message: 'x' }],
      [{ platform: 'web', colour: 'red' }],
      [{ platform: 'web', layer: 3 }],
      [{ platform: 'web', figma: { x: 1 } }],
      [{ platform: 'web', drawn: [{ x: 1 }] }],
      [{ platform: 'web', drawn: [[1]] }],
      [{ platform: 'web', figma: [null] }],
      [{ platform: 'web', drawn: Number.NaN }],
    ]) {
      const e = await refusal(s.send(sendBody({ failures: bad })));
      expect(e.status).toBe(400);
      expect(e.message).toMatch(/list of failing checks/);
    }
    const many = Array.from({ length: MAX_FAILURES + 1 }, () => ({
      platform: 'web',
      message: 'x',
    }));
    const e = await refusal(s.send(sendBody({ failures: many })));
    expect(e.status).toBe(400);
    expect(e.message).toMatch(`at most ${MAX_FAILURES} failing checks`);
    for (const body of [
      sendBody({ note: 'x'.repeat(MAX_NOTE + 1) }),
      reportBody({ note: 'x'.repeat(MAX_NOTE + 1) }),
    ]) {
      const long = await refusal(
        'failures' in body ? s.send(body) : s.report(body),
      );
      expect(long.status).toBe(400);
      expect(long.message).toMatch(`over ${MAX_NOTE} characters`);
    }
    expect(notes(w)).toEqual([]);
    // At the limits, and every kind of value Figma or the drawing may be: taken.
    const edge = [
      ...Array.from({ length: MAX_FAILURES - 1 }, () => ({
        platform: 'web',
        message: 'x',
      })),
      {
        platform: 'parity',
        variant: 'size=md',
        layer: 'root',
        property: 'height',
        figma: 40,
        drawn: null,
      },
    ];
    await s.send(sendBody({ failures: edge, note: 'x'.repeat(MAX_NOTE) }));
    await s.send(
      sendBody({
        failures: [{ platform: 'flutter', figma: 'a', drawn: true }],
      }),
    );
    await s.report(reportBody({ note: 'x'.repeat(MAX_NOTE) }));
    expect(notes(w)).toHaveLength(3);
  });

  // A dashed border's pattern is a list of numbers, and fills and strokes lists of words.
  const dash = {
    platform: 'web',
    variant: 'state=default',
    layer: 'root',
    property: 'borderDash',
    figma: [2, 4],
    drawn: [3, 3],
  };
  const fills = {
    platform: 'flutter',
    property: 'fill',
    figma: ['#fff'],
    drawn: [],
  };

  it('sends a refused Approve’s dash pattern and fills, lists as the checks measure them', async () => {
    const w = world();
    w.deps.checks = async () => ({ ok: false, failures: [dash, fills] });
    const s = createSession(w.deps);
    const r = await s.approve({ component: 'Button', platform: 'web' });
    const { file } = await s.send(sendBody({ failures: r.failures }));
    expect(parse(w.files.get(file)).failures).toEqual([dash, fills]);
  });

  it('sends a failing Keep’s own dash pattern, and never reads the body’s failures then', async () => {
    const w = world();
    w.files.set(
      '.workbench/pending.json',
      JSON.stringify({
        component: 'Button',
        key: 'root.base.borderStyle',
        value: { keyword: 'dashed' },
        deletes: false,
        before: 'component: Button\n',
        placeholder: 'x',
        after: 'x',
        failing: [dash],
      }),
    );
    const s = createSession(w.deps);
    const { file } = await s.send(
      sendBody({ failures: [{ platform: 'nowhere', figma: { x: 1 } }] }),
    );
    expect(parse(w.files.get(file)).failures).toEqual([dash]);
  });

  it('caps a refused Approve’s failures, so all of them can be sent', async () => {
    const w = world();
    const each = Array.from({ length: 450 }, (_, i) => ({
      platform: 'web',
      variant: `v${i}`,
      layer: 'root',
      property: 'height',
      figma: 40,
      drawn: 44,
    }));
    w.deps.checks = async () => ({ ok: false, failures: each });
    const s = createSession(w.deps);
    const r = await s.approve({ component: 'Button', platform: 'web' });
    expect(r.failures).toHaveLength(MAX_FAILURES);
    expect(r.failures.at(-1).message).toMatch(/and 251 more failing checks/);
    const { file } = await s.send(sendBody({ failures: r.failures }));
    expect(parse(w.files.get(file)).failures).toHaveLength(MAX_FAILURES);
  });

  it('says what the person judged where they write no note', async () => {
    const w = world();
    const s = createSession(w.deps);
    for (const note of [undefined, '', '  \n ']) {
      const { file } = await s.send(sendBody({ note }));
      expect(parse(w.files.get(file)).note).toBe(
        'The checks failed where the person judged the component right.',
      );
    }
  });

  it('refuses a note with no failing checks, failures that are not a list of them, a note that is not words, or a platform other than the two', async () => {
    const w = world();
    const s = createSession(w.deps);
    for (const [extra, words] of [
      [{ failures: undefined }, /no failing checks to send/],
      [{ failures: [] }, /no failing checks to send/],
      [{ failures: 'boom' }, /list of failing checks/],
      [{ failures: [1] }, /list of failing checks/],
      [{ failures: [null] }, /list of failing checks/],
      [{ note: 42 }, /note/],
      [{ platform: 'ios' }, /web or flutter/],
      [{ platform: undefined }, /web or flutter/],
    ]) {
      const e = await refusal(s.send(sendBody(extra)));
      expect(e.status).toBe(400);
      expect(e.message).toMatch(words);
    }
    expect(notes(w)).toEqual([]);
  });

  it('refuses where Report does: a component locked, absent, or not on that platform', async () => {
    for (const [colours, body, status, words] of [
      [{ web: 'yellow', flutter: 'green' }, {}, 409, /approved on Flutter/],
      [{ web: 'yellow', flutter: 'red' }, {}, 409, /waits on Icon on Flutter/],
      [
        { web: 'yellow' },
        { platform: 'flutter' },
        400,
        /Flutter has no Button/,
      ],
      [{}, { component: 'Nothing' }, 400, /Nothing is not a component/],
    ]) {
      const w = world(colours);
      const e = await refusal(createSession(w.deps).send(sendBody(body)));
      expect(e.status).toBe(status);
      expect(e.message).toMatch(words);
      expect(notes(w)).toEqual([]);
    }
  });
});
