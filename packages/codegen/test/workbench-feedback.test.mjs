// A Report note (workbench/feedback.mjs) and the session's `report`, on files in memory.
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { noteFile, noteText } from '../src/workbench/feedback.mjs';
import { createSession, WorkbenchError } from '../src/workbench/session.mjs';

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
    userName: () => 'A Person',
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
