// The workbench bar's scenarios (src/workbench/bar-scenarios.json), which both viewers' bar tests
// run: each is written in the file's own vocabulary, so a typo fails here, before either viewer.

import { describe, expect, it } from 'vitest';
import {
  forPlatform,
  readScenarios,
  resolve,
  scenariosFor,
} from '../src/workbench/bar-scenarios.mjs';

const file = readScenarios();
const { vocabulary } = file;
const kinds = (o) => Object.keys(o);
const ACTIONS = new Set(vocabulary.actions);
const SELECTS = new Set(['Set to', 'Scope', 'Variant', 'Layer']);
const EVENTS = new Set(vocabulary.events);
const GETS = new Set(['status', 'component']);
const POSTS = new Set([
  'set',
  'keep',
  'undo',
  'approve',
  'unapprove/preview',
  'unapprove',
  'report',
  'send',
]);
/** The text fields `type` may name, and the action each is. */
const FIELD_ACTIONS = {
  reason: 'Reason',
  note: 'Note',
  agentNote: 'Agent note',
};
const FIELDS = new Set(Object.keys(FIELD_ACTIONS));
/** The actions that are text fields or Selects: what `press` cannot name. */
const NOT_BUTTONS = new Set([...SELECTS, ...Object.values(FIELD_ACTIONS)]);
const READS = new Set(['health', 'status', 'component']);

/** What is wrong with one scenario (resolved), as sentences; none where it is well written. */
function problems(s) {
  const out = [];
  const only = (what, o, allowed) => {
    if (o === null || typeof o !== 'object' || Array.isArray(o))
      return out.push(`${what} is no object`);
    for (const k of Object.keys(o))
      if (!allowed.includes(k)) out.push(`${what} has an unknown kind: ${k}`);
  };
  const strings = (what, v, allowed) => {
    if (!Array.isArray(v) || v.some((x) => typeof x !== 'string' || !x))
      return out.push(`${what} is no list of words`);
    if (allowed)
      for (const x of v)
        if (!allowed.has(x)) out.push(`${what} names no action: ${x}`);
  };
  const event = (what, e) => {
    only(what, e, ['type', 'message']);
    if (!EVENTS.has(e?.type)) out.push(`${what} has no known type`);
  };
  const expectation = (what, e) => {
    only(what, e, kinds(vocabulary.expect));
    const lists = ['enabled', 'disabled', 'absent'].filter((k) => k in e);
    for (const [i, a] of lists.entries())
      for (const b of lists.slice(i + 1))
        for (const x of e[a] ?? [])
          if (e[b]?.includes?.(x))
            out.push(`${what} has ${x} both ${a} and ${b}`);
    for (const x of e.shows ?? [])
      if (e.hides?.includes?.(x)) out.push(`${what} both shows and hides ${x}`);
    for (const [k, v] of Object.entries(e ?? {})) {
      const at = `${what}.${k}`;
      if (k === 'calls' || k === 'reads') {
        const routes = k === 'calls' ? POSTS : READS;
        if (!Array.isArray(v)) out.push(`${at} is no list`);
        else
          for (const c of v)
            if (
              !Array.isArray(c) ||
              c.length < 1 ||
              c.length > 2 ||
              !routes.has(c[0])
            )
              out.push(`${at} has an unknown entry: ${JSON.stringify(c)}`);
      } else if (['enabled', 'disabled', 'absent'].includes(k))
        strings(at, v, ACTIONS);
      else if (k === 'shows' || k === 'hides') strings(at, v);
      else if (k === 'noBar' || k === 'noError') {
        if (v !== true) out.push(`${at} is not true`);
      } else if (k === 'oneError' && (typeof v !== 'string' || !v))
        out.push(`${at} is no fact`);
    }
  };

  only('the scenario', s, ['name', 'fake', 'steps', 'expect']);
  if (typeof s.name !== 'string' || !s.name) out.push('it has no name');

  const fake = s.fake ?? {};
  only('fake', fake, kinds(vocabulary.fake));
  if ('health' in fake && typeof fake.health !== 'boolean')
    out.push('fake.health is no boolean');
  if (
    'startingTimes' in fake &&
    !(Number.isInteger(fake.startingTimes) && fake.startingTimes >= 0)
  )
    out.push('fake.startingTimes is no count');
  if (fake.health === false) {
    // Nothing answers: no status to give.
  } else if (!fake.status?.components) out.push('fake.status is no Status');
  if (
    'controls' in fake &&
    (fake.controls === null ||
      typeof fake.controls !== 'object' ||
      Array.isArray(fake.controls))
  )
    out.push('fake.controls is no object');
  for (const [route, a] of Object.entries(fake.answers ?? {})) {
    const at = `fake.answers.${route}`;
    if (!GETS.has(route) && !POSTS.has(route)) out.push(`${at} is no route`);
    only(at, a, ['answer', 'status', 'refuse', 'events', 'hold']);
    if ('status' in a && !a.status?.components)
      out.push(`${at}.status is no Status`);
    if ('events' in a && !Array.isArray(a.events))
      out.push(`${at}.events is no list`);
    if ('hold' in a && (typeof a.hold !== 'boolean' || GETS.has(route)))
      out.push(`${at}.hold is no boolean on a POST route`);
    if (a.refuse) {
      only(`${at}.refuse`, a.refuse, ['status', 'error']);
      if (typeof a.refuse.status !== 'number' || !a.refuse.error)
        out.push(`${at}.refuse needs a status and an error`);
      if ('answer' in a) out.push(`${at} both answers and refuses`);
    } else if (GETS.has(route)) out.push(`${at} takes refuse alone`);
    else if (!['set', 'undo'].includes(route) && !('answer' in a))
      out.push(`${at} needs an answer (only a Status is the default)`);
    for (const [i, e] of (Array.isArray(a.events) ? a.events : []).entries())
      event(`${at}.events[${i}]`, e);
  }

  const steps = s.steps ?? [];
  if (!Array.isArray(steps)) out.push('steps is no list');
  let expects = s.expect ? 1 : 0;
  for (const [i, step] of steps.entries()) {
    const at = `steps[${i}]`;
    const ks = Object.keys(step ?? {});
    if (ks.length !== 1) {
      out.push(`${at} is not one step`);
      continue;
    }
    const [k] = ks;
    const v = step[k];
    if (!kinds(vocabulary.steps).includes(k)) {
      out.push(`${at} has an unknown kind: ${k}`);
      continue;
    }
    if (k === 'press' && !ACTIONS.has(v)) out.push(`${at} names no action`);
    else if (k === 'press' && NOT_BUTTONS.has(v))
      out.push(`${at} presses what is no button: ${v}`);
    if (k === 'release' && !fake.answers?.[v]?.hold)
      out.push(`${at} releases no answer held`);
    if (k === 'choose') {
      only(`${at}.choose`, v, ['select', 'option']);
      if (!SELECTS.has(v.select) || typeof v.option !== 'string')
        out.push(`${at} needs a Select and an option`);
    }
    if ((k === 'confirm' || k === 'cancel') && v !== true)
      out.push(`${at} is not true`);
    if (k === 'type') {
      only(`${at}.type`, v, ['field', 'text']);
      if (!FIELDS.has(v.field) || typeof v.text !== 'string')
        out.push(`${at} types in no field`);
    }
    if (k === 'event') event(`${at}.event`, v);
    if (k === 'setStatus' && !v?.components) out.push(`${at} is no Status`);
    if (k === 'expect') {
      expects += 1;
      expectation(`${at}.expect`, v);
    }
  }
  if (s.expect) expectation('expect', s.expect);
  if (!expects) out.push('it expects nothing');
  // What the person did is followed by what was sent, even nothing: a request too many fails.
  const acts = steps.some(
    (x) => 'press' in x || 'choose' in x || 'confirm' in x || 'cancel' in x,
  );
  if (acts && !('calls' in (s.expect ?? {})))
    out.push('it acts, and its last expectation names no calls');
  return out;
}

describe("the workbench bar's scenarios", () => {
  it('are named once each', () => {
    const names = file.scenarios.map((s) => s.name);
    expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual([]);
  });

  it('use only the kinds the vocabulary names, in their shapes', () => {
    const found = Object.fromEntries(
      file.scenarios.map((s) => [s.name, problems(resolve(s, file.fixtures))]),
    );
    expect(
      Object.fromEntries(Object.entries(found).filter(([, p]) => p.length)),
    ).toEqual({});
  });

  it('use every kind, action and event the vocabulary names', () => {
    const scenarios = file.scenarios.map((s) => resolve(s, file.fixtures));
    const used = new Set();
    const note = (prefix, keys) => {
      for (const k of keys) used.add(`${prefix}.${k}`);
    };
    for (const s of scenarios) {
      note('fake', Object.keys(s.fake ?? {}));
      for (const a of Object.values(s.fake?.answers ?? {}))
        for (const e of a.events ?? []) used.add(`event.${e.type}`);
      const expects = [s.expect ?? {}];
      for (const st of s.steps ?? []) {
        note('step', Object.keys(st));
        if (st.expect) expects.push(st.expect);
        if (st.event) used.add(`event.${st.event.type}`);
        if (st.press) used.add(`action.${st.press}`);
        if (st.choose) used.add(`action.${st.choose.select}`);
        if (st.type) used.add(`action.${FIELD_ACTIONS[st.type.field]}`);
      }
      for (const e of expects) {
        note('expect', Object.keys(e));
        for (const k of ['enabled', 'disabled', 'absent'])
          note('action', e[k] ?? []);
      }
    }
    const named = [
      ...kinds(vocabulary.fake).map((k) => `fake.${k}`),
      ...kinds(vocabulary.steps).map((k) => `step.${k}`),
      ...kinds(vocabulary.expect).map((k) => `expect.${k}`),
      ...vocabulary.actions.map((k) => `action.${k}`),
      ...vocabulary.events.map((k) => `event.${k}`),
    ];
    expect(named.filter((n) => !used.has(n))).toEqual([]);
  });

  it('name serial routes and platform actions the contract has', () => {
    expect(vocabulary.serial.routes.filter((r) => !POSTS.has(r))).toEqual([]);
    for (const [p, names] of Object.entries(vocabulary.platformActions)) {
      expect(['web', 'flutter']).toContain(p);
      expect(names.filter((n) => ACTIONS.has(n))).toEqual([]);
    }
  });

  it('resolve for either platform', () => {
    for (const p of ['web', 'flutter'])
      expect(scenariosFor(p)).toHaveLength(file.scenarios.length);
  });

  it('find a mistake', () => {
    expect(
      problems({
        name: 'x',
        fake: {
          status: { components: {} },
          controls: [],
          answers: { aprove: {} },
        },
        steps: [
          { pres: 'Inspect' },
          { press: 'Inpsect' },
          { type: { field: 'why', text: 'x' } },
          { press: 'Set to' },
          { release: 'keep' },
          { expect: { enabled: ['Keep'], absent: ['Keep'] } },
        ],
        expect: { shown: ['x'], shows: ['y'], hides: ['y'] },
      }),
    ).toEqual([
      'fake.controls is no object',
      'fake.answers.aprove is no route',
      'fake.answers.aprove needs an answer (only a Status is the default)',
      'steps[0] has an unknown kind: pres',
      'steps[1] names no action',
      'steps[2] types in no field',
      'steps[3] presses what is no button: Set to',
      'steps[4] releases no answer held',
      'steps[5].expect has Keep both enabled and absent',
      'expect has an unknown kind: shown',
      'expect both shows and hides y',
      'it acts, and its last expectation names no calls',
    ]);
    expect(
      problems({
        name: 'y',
        fake: {
          health: 'no',
          startingTimes: -1,
          status: { components: {} },
          answers: {
            keep: { answer: {}, status: {}, events: {}, hold: 1 },
            status: { refuse: { status: 500, error: 'x' }, hold: true },
          },
        },
        expect: { noError: true },
      }),
    ).toEqual([
      'fake.health is no boolean',
      'fake.startingTimes is no count',
      'fake.answers.keep.status is no Status',
      'fake.answers.keep.events is no list',
      'fake.answers.keep.hold is no boolean on a POST route',
      'fake.answers.status.hold is no boolean on a POST route',
    ]);
  });
});

describe('a fixture and a platform', () => {
  it('are a copy with the keys over it, and the platforms named', () => {
    const fixtures = { a: { x: 1, y: { $fixture: 'b' } }, b: { z: 2 } };
    expect(resolve({ $fixture: 'a', x: 3 }, fixtures)).toEqual({
      x: 3,
      y: { z: 2 },
    });
    expect(() => resolve({ $fixture: 'c' }, fixtures)).toThrow('no fixture c');
    expect(
      forPlatform(
        { $platform: 'yellow', $other: 'green', p: '$platform' },
        'flutter',
      ),
    ).toEqual({ flutter: 'yellow', web: 'green', p: 'flutter' });
  });
});
