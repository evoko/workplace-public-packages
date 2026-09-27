import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import {
  allowPlaceholders,
  loadDefaults,
  parseOverlay,
  PLACEHOLDER,
} from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';
import { parse } from 'yaml';
import * as stage from '../src/stages/components.mjs';
import { MAX_FAILURES } from '../src/workbench/checks.mjs';
import { createSession, WorkbenchError } from '../src/workbench/session.mjs';

const OVERLAY = 'spec/overlay/button.yaml';

let build;
let buildOver;
beforeAll(() => {
  build = stage.build();
  const catalog = loadWebCatalog();
  const names = tokenNames(loadContract());
  const defaults = loadDefaults();
  const loaded = loadComponent(catalog, 'Button');
  // The build as the files in memory are: Button's IR from its overlay there (none where there is
  // no file), as the real service's build reads the files on disk, a pending placeholder let
  // through. Every other component, and Button's oracle, as the repository builds them.
  buildOver = (text) => {
    allowPlaceholders(true);
    try {
      const { spec } = buildComponentSpec(loaded, {
        names,
        fileVersion: catalog.fileVersion,
        overlay: text === null ? null : parseOverlay(text, OVERLAY),
        defaults,
      });
      return {
        ...build,
        built: build.built.map((b) =>
          b.spec.component === 'Button' ? { ...b, spec } : b,
        ),
      };
    } finally {
      allowPlaceholders(false);
    }
  };
});

/** Button's own overlay, with the given sections after its `component` line. */
const overlay = (sections = '') =>
  `component: Button\n${sections ? `\n${sections}` : ''}`;
const BASE = overlay();
const PENDING = '.workbench/pending.json';

/** A world of files in memory (Button's overlay with nothing in it), and every effect recorded. */
function world({
  colours = { Button: { web: 'yellow', flutter: 'yellow' } },
} = {}) {
  const files = new Map([[OVERLAY, BASE]]);
  const calls = [];
  const writes = [];
  const events = [];
  const coloured = Object.fromEntries(
    ['web', 'flutter'].map((p) => [
      p,
      Object.entries(colours).map(([name, c]) => ({
        name,
        colour: c[p],
        uses: c.uses ?? [],
        waitsOn: c.waitsOn?.[p] ?? [],
        fingerprint: `sha256:${name}-${p}`,
      })),
    ]),
  );
  const deps = {
    files: {
      read: (p) => files.get(p) ?? null,
      write: (p, t) => {
        writes.push(p);
        files.set(p, t);
      },
      remove: (p) => files.delete(p),
      list: (dir) =>
        [...files.keys()]
          .filter((k) => k.startsWith(`${dir}/`))
          .map((k) => k.slice(dir.length + 1)),
    },
    overlayPath: (name) => `spec/overlay/${name.toLowerCase()}.yaml`,
    approvalsPath: 'spec/approvals.yaml',
    pendingPath: PENDING,
    feedbackDir: 'spec/feedback',
    build: () => buildOver(files.get(OVERLAY) ?? null),
    codegen: async ({ pending }) => {
      calls.push(['codegen', pending]);
      return { ok: true, output: '' };
    },
    status: async () => ({ coloured, approvals: {} }),
    checks: async () => ({ ok: true, failures: [] }),
    reload: () => calls.push(['reload']),
    userName: () => 'A Person',
    today: () => '2026-09-27',
    emit: (e) => {
      events.push(e);
      calls.push(['emit', e.type]);
    },
  };
  return { files, calls, writes, events, deps };
}

const setBody = (s, extra = {}) => ({
  component: 'Button',
  variant: 0,
  layer: 'root',
  cell: 'background',
  scope: 'root.base.background',
  value: { token: 'color.text.primary' },
  revision: s.inspect('Button', extra.variant ?? 0).revision,
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

/** Nothing written: Button's overlay is `text`, and no edit is pending. */
function untouched(w, text = BASE) {
  expect(w.files.get(OVERLAY)).toBe(text);
  expect(w.files.has(PENDING)).toBe(false);
}

/**
 * Badge's approval holds until the first plain regeneration (Keep's), and not after: the Keep would
 * cancel it.
 */
function losing(w) {
  let regenerated = false;
  const codegen = w.deps.codegen;
  w.deps.codegen = async (o) => {
    if (!o.pending) regenerated = true;
    return codegen(o);
  };
  const row = (name, colour, fingerprint) => ({
    name,
    colour,
    uses: [],
    waitsOn: [],
    fingerprint,
  });
  w.deps.status = async () => ({
    coloured: {
      web: [
        row('Button', 'yellow', 'x'),
        row('Badge', regenerated ? 'yellow' : 'green', 'y'),
      ],
      flutter: [row('Button', 'yellow', 'z')],
    },
    approvals: {},
  });
}

const RULE =
  'set:\n  root.base.background:\n    token: color.text.secondary\n    reason: Old.\n';

describe('the session', () => {
  let w;
  let s;
  beforeEach(() => {
    w = world();
    s = createSession(w.deps);
  });

  it('reports each component’s colours and whether it may be edited', async () => {
    const st = await s.status();
    expect(st.components.Button).toMatchObject({
      web: 'yellow',
      flutter: 'yellow',
      editable: true,
      locked: null,
    });
    expect(st.pending).toBeNull();
  });

  it('offers exactly the operations of the HTTP contract', () => {
    expect(Object.keys(s).sort()).toEqual([
      'approve',
      'inspect',
      'keep',
      'report',
      'send',
      'set',
      'status',
      'unapprove',
      'unapprovePreview',
      'undo',
    ]);
  });

  it('answers Set and Undo with the status as it is once they finish: not busy', async () => {
    expect((await s.set(setBody(s))).busy).toBeNull();
    expect((await s.undo({ component: 'Button' })).busy).toBeNull();
  });

  it('reads the colours once for the gate and once for the answer, per Set', async () => {
    const status = w.deps.status;
    let reads = 0;
    w.deps.status = async () => {
      reads += 1;
      return status();
    };
    s = createSession(w.deps);
    await s.set(setBody(s));
    expect(reads).toBe(2);
  });

  it('keeps no borrowed reason as the one to rewrite', async () => {
    w.files.set(
      OVERLAY,
      overlay(
        'set:\n  root.base.gap:\n    token: inset.sm\n    reason: R.\n  root.base.background:\n    token: color.text.secondary\n    reason: { as: set root.base.gap }\n',
      ),
    );
    await s.set(setBody(s));
    expect((await s.status()).pending.previousReason).toBeNull();
    expect(JSON.parse(w.files.get(PENDING)).previousReason).toBeNull();
  });

  it('writes a pending set with the placeholder, regenerates with --pending, and reloads', async () => {
    await s.set(setBody(s));
    const text = w.files.get(OVERLAY);
    expect(text).toBe(
      `${BASE}\nset:\n  root.base.background:\n    token: color.text.primary\n    reason: TODO(reason)\n`,
    );
    expect(w.calls).toContainEqual(['codegen', true]);
    expect(w.calls).toContainEqual(['reload']);
    expect((await s.status()).pending).toMatchObject({
      component: 'Button',
      key: 'root.base.background',
      value: { token: 'color.text.primary' },
      deletes: false,
      borrowers: [],
    });
    expect(JSON.parse(w.files.get(PENDING))).toMatchObject({
      before: BASE,
      placeholder: text,
      after: text,
    });
  });

  it('saves the pending edit before it writes the overlay', async () => {
    await s.set(setBody(s));
    expect(w.writes.indexOf(PENDING)).toBeGreaterThanOrEqual(0);
    expect(w.writes.indexOf(PENDING)).toBeLessThan(w.writes.indexOf(OVERLAY));
  });

  it('writes the value as exactly one of token, keyword or none', async () => {
    await s.set(
      setBody(s, {
        value: { token: 'color.text.primary', none: true, keyword: 'FILL' },
      }),
    );
    expect(w.files.get(OVERLAY)).not.toMatch(/none|keyword/);
    expect((await s.status()).pending.value).toEqual({
      token: 'color.text.primary',
    });
  });

  it('keeps with a reason, regenerating without --pending', async () => {
    await s.set(setBody(s));
    const r = await s.keep({
      component: 'Button',
      reason: 'The owner’s choice.',
    });
    expect(r).toEqual({ ok: true });
    expect(w.files.get(OVERLAY)).toContain('reason: The owner’s choice.');
    expect(w.files.get(OVERLAY)).not.toContain(PLACEHOLDER);
    expect(w.calls.at(-3)).toEqual(['codegen', false]);
    expect((await s.status()).pending).toBeNull();
    expect(w.files.has(PENDING)).toBe(false);
  });

  it('refuses Keep without a reason, with the placeholder, on two lines, or with the old reason', async () => {
    w.files.set(OVERLAY, overlay(RULE));
    await s.set(setBody(s));
    const after = w.files.get(OVERLAY);
    expect((await s.status()).pending.previousReason).toBe('Old.');
    for (const [reason, pattern] of [
      [' ', /reason/],
      [PLACEHOLDER, /reason/],
      [`${PLACEHOLDER} later`, /reason/],
      ['One.\nTwo.', /one line/],
      ['Old.', /rewrite/],
    ]) {
      const error = await refusal(s.keep({ component: 'Button', reason }));
      expect(error.status).toBe(400);
      expect(error.message).toMatch(pattern);
    }
    expect(w.files.get(OVERLAY)).toBe(after);
    expect((await s.status()).pending).not.toBeNull();
  });

  it('undoes to the exact bytes before, and regenerates', async () => {
    const before =
      '# kept\ncomponent: Button\nset:\n  root.base.gap:\n    token: inset.xs\n    reason: R.\n';
    w.files.set(OVERLAY, before);
    await s.set(setBody(s));
    await s.undo({ component: 'Button' });
    untouched(w, before);
    expect(w.calls.at(-3)).toEqual(['codegen', false]);
  });

  it('keeps the edit pending where Undo’s regeneration fails, and Undo again finishes it', async () => {
    await s.set(setBody(s));
    w.deps.codegen = async () => ({ ok: false, output: 'boom' });
    s = createSession(w.deps);
    const error = await refusal(s.undo({ component: 'Button' }));
    expect(error.status).toBe(500);
    expect(error.message).toBe(
      'the overlay is back, but regenerating failed: boom; press Undo again',
    );
    expect(w.files.get(OVERLAY)).toBe(BASE);
    expect((await s.status()).pending).not.toBeNull();
    w.deps.codegen = async () => ({ ok: true, output: '' });
    await s.undo({ component: 'Button' });
    untouched(w);
  });

  it('keeps the edit pending where the lost-approval restore’s regeneration fails', async () => {
    losing(w);
    const codegen = w.deps.codegen;
    let plain = 0;
    w.deps.codegen = async (o) => {
      const r = await codegen(o);
      if (o.pending) return r;
      plain += 1;
      // Keep's own regeneration passes; the restore's after it fails.
      return plain === 1 ? r : { ok: false, output: 'boom' };
    };
    s = createSession(w.deps);
    await s.set(setBody(s));
    const error = await refusal(
      s.keep({ component: 'Button', reason: 'Why.' }),
    );
    expect(error.status).toBe(500);
    expect(error.message).toMatch(
      /regenerating failed: boom; press Undo again/,
    );
    expect(w.files.get(OVERLAY)).toBe(BASE);
    expect((await s.status()).pending).not.toBeNull();
  });

  it('undoes to the exact bytes before after a restart', async () => {
    const before = `# kept\n${overlay(RULE)}`;
    w.files.set(OVERLAY, before);
    await s.set(setBody(s));
    await createSession(w.deps).undo({ component: 'Button' });
    untouched(w, before);
  });

  it('comes back with the pending edit after a restart', async () => {
    await s.set(setBody(s));
    const again = createSession(w.deps);
    expect((await again.status()).pending).toMatchObject({
      component: 'Button',
    });
  });

  it.each([
    ['not JSON', '{ not json'],
    ['null', 'null'],
    ['without its texts', '{"component":"Button","key":"root.base.gap"}'],
    [
      'with a field of the wrong type',
      '{"component":"Button","key":1,"before":"","placeholder":"","after":""}',
    ],
  ])(
    'refuses to start on a pending record it cannot read (%s), naming the file and what to do',
    (_, text) => {
      w.files.set(PENDING, text);
      expect(() => createSession(w.deps)).toThrow(
        /\.workbench\/pending\.json is not the workbench's pending edit .*restore the overlay it names from git if needed, then delete this file/,
      );
    },
  );

  it('refuses a component with no overlay file, writing none', async () => {
    const body = setBody(s);
    w.files.delete(OVERLAY);
    const error = await refusal(s.set(body));
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/Button has no overlay file/);
    expect(w.files.has(OVERLAY)).toBe(false);
    expect(w.files.has(PENDING)).toBe(false);
  });

  it('refuses a component neither viewer shows, as a bad request', async () => {
    const error = await refusal(s.set({ ...setBody(s), component: 'Nope' }));
    expect(error.status).toBe(400);
    untouched(w);
  });

  it('refuses a stale revision: the file changed since the panel read it', async () => {
    const body = setBody(s);
    w.files.set(OVERLAY, overlay('bind: {}\n'));
    const error = await refusal(s.set(body));
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/changed on disk/);
    untouched(w, overlay('bind: {}\n'));
  });

  it('refuses a token not offered for the cell, a keyword, a scope not offered, and no value', async () => {
    for (const [extra, pattern] of [
      [{ value: { token: 'inset.sm' } }, /not offered/],
      [{ value: { keyword: 'FILL' } }, /not offered/],
      [{ scope: 'root.nope.background' }, /scope/],
      [{ value: {} }, /a token, a keyword or none/],
      [{ cell: 'nope' }, /has no root\.nope/],
      [{ variant: 9999 }, /no variant/],
    ]) {
      const error = await refusal(s.set({ ...setBody(s), ...extra }));
      expect(error.status).toBe(400);
      expect(error.message).toMatch(pattern);
    }
    untouched(w);
  });

  it('refuses any value on a raw value the overlay allows, with the cell’s note', async () => {
    const text = overlay('allowLiteral:\n  counter.height:\n    reason: R.\n');
    w.files.set(OVERLAY, text);
    const body = setBody(s, {
      layer: 'counter',
      cell: 'height',
      scope: 'counter.base.height',
    });
    for (const value of [{ token: 'size.control.md' }, { none: true }]) {
      const error = await refusal(s.set({ ...body, value }));
      expect(error.status).toBe(400);
      expect(error.message).toMatch(/allowLiteral\): use Report/);
    }
    untouched(w, text);
  });

  it('refuses a value the cell already draws there', async () => {
    const error = await refusal(
      s.set(
        setBody(s, { value: { token: 'color.action.primary.bg.default' } }),
      ),
    );
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/already draws/);
    untouched(w);
  });

  it('deletes the rule where Figma’s own value is chosen, and keeps without a reason', async () => {
    w.files.set(
      OVERLAY,
      overlay(
        'set:\n  root.base.gap:\n    token: inset.sm\n    reason: R.\n  root.base.background:\n    token: color.text.secondary\n    reason: Old.\n',
      ),
    );
    await s.set(
      setBody(s, { value: { token: 'color.action.primary.bg.default' } }),
    );
    expect(w.files.get(OVERLAY)).not.toContain('root.base.background');
    expect((await s.status()).pending).toMatchObject({ deletes: true });
    expect(await s.keep({ component: 'Button' })).toEqual({ ok: true });
    untouched(
      w,
      overlay('set:\n  root.base.gap:\n    token: inset.sm\n    reason: R.\n'),
    );
  });

  it('refuses to delete a rule another borrows the reason of, and names the borrowers on a replace', async () => {
    const before = overlay(
      `${RULE}  root.base.borderColor:\n    token: color.text.secondary\n    reason: { as: set root.base.background }\n`,
    );
    w.files.set(OVERLAY, before);
    const error = await refusal(
      s.set(
        setBody(s, { value: { token: 'color.action.primary.bg.default' } }),
      ),
    );
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/borrows its reason/);
    untouched(w, before);
    await s.set(setBody(s));
    expect((await s.status()).pending).toMatchObject({
      deletes: false,
      previousReason: 'Old.',
      borrowers: ['set root.base.borderColor'],
    });
  });

  it('refuses a second pending edit until the first is kept or undone', async () => {
    await s.set(setBody(s));
    const after = w.files.get(OVERLAY);
    const error = await refusal(
      s.set(
        setBody(s, { cell: 'borderColor', scope: 'root.base.borderColor' }),
      ),
    );
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/pending/);
    expect(w.files.get(OVERLAY)).toBe(after);
  });

  it('refuses a rule the variant never reads (a narrower entry wins), and puts the file back', async () => {
    // In variant 0 Button's background sits at base; in another prio its appearance's entry wins,
    // so a base rule would change nothing there.
    const { variants } = s.inspect('Button', 0);
    const shadowed = variants.findIndex(
      ({ index }) =>
        s
          .inspect('Button', index)
          .layers.find((l) => l.name === 'root')
          .cells.find((c) => c.cell === 'background').at !== 'base',
    );
    expect(shadowed).toBeGreaterThan(0);
    const error = await refusal(s.set(setBody(s, { variant: shadowed })));
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/wins/);
    untouched(w);
    // Nothing was regenerated, so nothing needs regenerating back.
    expect(w.calls.filter(([c]) => c === 'codegen')).toEqual([]);
  });

  it('rolls a set back where the build refuses it, regenerating plainly', async () => {
    w.deps.codegen = async ({ pending }) => {
      w.calls.push(['codegen', pending]);
      return pending
        ? { ok: false, output: 'line 1\nset root.base.background: no' }
        : { ok: true, output: '' };
    };
    s = createSession(w.deps);
    const error = await refusal(s.set(setBody(s)));
    expect(error.status).toBe(400);
    expect(error.message).toMatch(/refused the edit, which is undone: .*no$/);
    untouched(w);
    expect((await s.status()).pending).toBeNull();
    expect(w.calls.filter(([c]) => c === 'codegen')).toEqual([
      ['codegen', true],
      ['codegen', false],
    ]);
  });

  it('rolls a set back where the regeneration throws, even when regenerating back throws too', async () => {
    w.deps.codegen = async ({ pending }) => {
      w.calls.push(['codegen', pending]);
      throw new Error(pending ? 'spawn failed' : 'still failing');
    };
    s = createSession(w.deps);
    const error = await refusal(s.set(setBody(s)));
    expect(error.status).toBe(500);
    expect(error.message).toMatch(/spawn failed/);
    untouched(w);
    expect(w.calls).toContainEqual(['codegen', false]);
    // The session goes on: a later set is taken.
    w.deps.codegen = async () => ({ ok: true, output: '' });
    await s.set(setBody(s));
    expect((await s.status()).pending).not.toBeNull();
  });

  it('refuses Keep and Undo where the overlay changed after the set, leaving that change', async () => {
    await s.set(setBody(s));
    const edited = `${w.files.get(OVERLAY)}# a person's note\n`;
    w.files.set(OVERLAY, edited);
    for (const op of [
      () => s.keep({ component: 'Button', reason: 'Why.' }),
      () => s.undo({ component: 'Button' }),
    ]) {
      const error = await refusal(op());
      expect(error.status).toBe(409);
      expect(error.message).toMatch(
        /changed on disk since the edit: reload, or resolve it by hand/,
      );
    }
    expect(w.files.get(OVERLAY)).toBe(edited);
    expect((await s.status()).pending).not.toBeNull();
  });

  it('keeps the edit pending with the failures where the checks fail, and Undo still restores', async () => {
    const failures = [{ platform: 'web', layer: 'root', property: 'height' }];
    w.deps.checks = async () => ({ ok: false, failures });
    s = createSession(w.deps);
    await s.set(setBody(s));
    expect(await s.keep({ component: 'Button', reason: 'Why.' })).toEqual({
      ok: false,
      failures,
    });
    expect(w.files.get(OVERLAY)).toContain('reason: Why.');
    expect((await s.status()).pending).toMatchObject({ failing: failures });
    // Keep's own write is the edit's now, so Undo does not take it for someone else's.
    await createSession(w.deps).undo({ component: 'Button' });
    untouched(w);
  });

  it('sends a failing Keep to the agent: the edit stays as kept, a note carries the failures', async () => {
    const failures = [
      {
        platform: 'web',
        layer: 'root',
        property: 'height',
        figma: 40,
        drawn: 44,
      },
    ];
    w.deps.checks = async () => ({ ok: false, failures });
    s = createSession(w.deps);
    await s.set(setBody(s));
    expect((await s.keep({ component: 'Button', reason: 'Why.' })).ok).toBe(
      false,
    );
    const kept = w.files.get(OVERLAY);
    const regenerated = w.calls.filter((c) => c[0] === 'codegen').length;
    // The failures the viewer holds are the same; the pending edit's are the ones sent.
    const { file } = await s.send({
      component: 'Button',
      platform: 'web',
      note: '  Looks right to me. ',
      failures: [{ platform: 'web', message: 'not these' }],
    });
    expect(file).toBe('spec/feedback/button-1.yaml');
    expect(parse(w.files.get(file))).toEqual({
      component: 'Button',
      platform: 'web',
      on: '2026-09-27',
      note: 'Looks right to me.',
      layer: 'root',
      controls: {},
      rule: 'root.base.background',
      value: { token: 'color.text.primary' },
      failures,
    });
    expect((await s.status()).pending).toBeNull();
    expect(w.files.has(PENDING)).toBe(false);
    expect(w.files.get(OVERLAY)).toBe(kept);
    expect(kept).toContain('reason: Why.');
    // Nothing to regenerate: Keep already built the edit as it stays.
    expect(w.calls.filter((c) => c[0] === 'codegen')).toHaveLength(regenerated);
    // Kept, it is no longer pending: a second Send has nothing to carry.
    const again = await refusal(
      s.send({ component: 'Button', platform: 'web', note: 'x' }),
    );
    expect(again.status).toBe(400);
    expect(again.message).toBe('Button has no failing checks to send');
  });

  it('caps a failing Keep’s failures, so its status and a Send of them stay within the limit', async () => {
    w.deps.checks = async () => ({
      ok: false,
      failures: Array.from({ length: 450 }, (_, i) => ({
        platform: 'web',
        variant: `v${i}`,
        layer: 'root',
        property: 'borderDash',
        figma: [2, 4],
        drawn: [3, 3],
      })),
    });
    s = createSession(w.deps);
    await s.set(setBody(s));
    const r = await s.keep({ component: 'Button', reason: 'Why.' });
    expect(r.failures).toHaveLength(MAX_FAILURES);
    expect((await s.status()).pending.failing).toEqual(r.failures);
    const { file } = await s.send({
      component: 'Button',
      platform: 'web',
      note: '',
      failures: r.failures,
    });
    expect(parse(w.files.get(file)).failures).toEqual(r.failures);
    expect((await s.status()).pending).toBeNull();
  });

  it('refuses to send a pending edit whose checks have not failed', async () => {
    await s.set(setBody(s));
    const e = await refusal(
      s.send({ component: 'Button', platform: 'web', note: 'x' }),
    );
    expect(e.status).toBe(400);
    expect((await s.status()).pending).not.toBeNull();
    expect(
      [...w.files.keys()].some((k) => k.startsWith('spec/feedback/')),
    ).toBe(false);
  });

  it('keeps the edit pending where the plain build fails, saying it can be undone', async () => {
    await s.set(setBody(s));
    w.deps.codegen = async () => ({ ok: false, output: 'boom' });
    s = createSession(w.deps);
    const error = await refusal(
      s.keep({ component: 'Button', reason: 'Why.' }),
    );
    expect(error.status).toBe(400);
    expect(error.message).toMatch(
      /boom; the edit is still pending: Undo, or fix and Keep again/,
    );
    expect((await s.status()).pending).not.toBeNull();
    w.deps.codegen = async () => ({ ok: true, output: '' });
    await s.undo({ component: 'Button' });
    untouched(w);
  });

  it('locks a component approved on either platform, or waiting on another', async () => {
    const w2 = world({
      colours: {
        Button: { web: 'green', flutter: 'yellow' },
        Dialog: { web: 'red', flutter: 'yellow', waitsOn: { web: ['Button'] } },
      },
    });
    const s2 = createSession(w2.deps);
    const st = await s2.status();
    expect(st.components.Button).toMatchObject({
      editable: false,
      locked: expect.stringMatching(/approved on web/),
    });
    expect(st.components.Dialog).toMatchObject({
      editable: false,
      locked: expect.stringMatching(/waits on Button/),
    });
    const error = await refusal(s2.set(setBody(s2)));
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/approved on web/);
    untouched(w2);
  });

  it.each([
    ['a new rule', BASE, {}],
    ['a rule replaced', overlay(RULE), {}],
    [
      'a rule deleted',
      overlay(RULE),
      { value: { token: 'color.action.primary.bg.default' } },
    ],
  ])(
    'undoes a Keep that would cancel an approval, naming it: %s',
    async (_, before, extra) => {
      losing(w);
      w.files.set(OVERLAY, before);
      s = createSession(w.deps);
      await s.set(setBody(s, extra));
      const error = await refusal(
        s.keep({ component: 'Button', reason: 'Why.' }),
      );
      expect(error.status).toBe(409);
      expect(error.message).toMatch(/Badge \(web\)/);
      untouched(w, before);
      expect((await s.status()).pending).toBeNull();
    },
  );

  it('refuses to approve, or withdraw an approval, while any edit is pending; a preview is read-only', async () => {
    const approvals = {
      Badge: { web: { fingerprint: 'x', by: 'A', on: '2026-09-27' } },
    };
    w = world({
      colours: {
        Button: { web: 'yellow', flutter: 'yellow' },
        Badge: { web: 'green', flutter: 'yellow' },
      },
    });
    const status = w.deps.status;
    w.deps.status = async () => ({ ...(await status()), approvals });
    s = createSession(w.deps);
    await s.set(setBody(s));
    for (const op of [
      () => s.approve({ component: 'Button', platform: 'web' }),
      () => s.approve({ component: 'Badge', platform: 'flutter' }),
      () => s.unapprove({ component: 'Badge', platform: 'web' }),
    ]) {
      const error = await refusal(op());
      expect(error.status).toBe(409);
      expect(error.message).toBe(
        'keep or undo the pending edit on Button first',
      );
    }
    expect(
      await s.unapprovePreview({ component: 'Badge', platform: 'web' }),
    ).toEqual({ withdraws: ['Badge'] });
    expect(w.files.has('spec/approvals.yaml')).toBe(false);
  });

  it('runs one operation at a time, in order, telling the viewers, a refusal holding up nothing', async () => {
    const seen = [];
    const codegen = w.deps.codegen;
    w.deps.codegen = async (o) => {
      seen.push((await s.status()).busy);
      return codegen(o);
    };
    s = createSession(w.deps);
    const body = setBody(s);
    const first = s.undo({ component: 'Button' });
    const second = s.set(body);
    const error = await refusal(first);
    expect(error.message).toMatch(/no pending edit/);
    await second;
    expect(seen).toEqual(['Regenerating…']);
    expect(w.events).toEqual([
      { type: 'busy', message: 'Undoing…' },
      { type: 'failed', message: 'Button has no pending edit' },
      { type: 'changed' },
      { type: 'busy', message: 'Regenerating…' },
      { type: 'changed' },
    ]);
    expect((await s.status()).busy).toBeNull();
  });

  it('gives each outcome as it is where telling the viewers throws', async () => {
    w.deps.emit = () => {
      throw new Error('no viewer');
    };
    s = createSession(w.deps);
    const error = await refusal(s.undo({ component: 'Button' }));
    expect(error.message).toMatch(/no pending edit/);
    expect((await s.set(setBody(s))).pending).toMatchObject({
      component: 'Button',
    });
    expect((await s.status()).busy).toBeNull();
  });

  it('holds no pending edit it could not save', async () => {
    const write = w.deps.files.write;
    w.deps.files.write = (p, t) => {
      if (p === PENDING) throw new Error('disk full');
      write(p, t);
    };
    s = createSession(w.deps);
    await expect(s.set(setBody(s))).rejects.toThrow(/disk full/);
    expect((await s.status()).pending).toBeNull();
    untouched(w);
  });

  describe('where the overlay is already back as it was', () => {
    it('lets Undo be retried after a restore whose regeneration threw', async () => {
      await s.set(setBody(s));
      w.deps.codegen = async () => {
        throw new Error('spawn failed');
      };
      s = createSession(w.deps);
      await expect(s.undo({ component: 'Button' })).rejects.toThrow(
        /spawn failed/,
      );
      expect(w.files.get(OVERLAY)).toBe(BASE);
      expect((await s.status()).pending).not.toBeNull();
      w.deps.codegen = async ({ pending }) => {
        w.calls.push(['codegen', pending]);
        return { ok: true, output: '' };
      };
      w.calls.length = 0;
      await s.undo({ component: 'Button' });
      untouched(w);
      expect(w.calls).toContainEqual(['codegen', false]);
      expect(w.calls).toContainEqual(['reload']);
    });

    it('lets Undo clear, after a restart, an edit saved but never written', async () => {
      await s.set(setBody(s));
      w.files.set(OVERLAY, BASE);
      await createSession(w.deps).undo({ component: 'Button' });
      untouched(w);
    });

    it('refuses Keep, saying to press Undo', async () => {
      await s.set(setBody(s));
      w.files.set(OVERLAY, BASE);
      const error = await refusal(
        s.keep({ component: 'Button', reason: 'Why.' }),
      );
      expect(error.status).toBe(409);
      expect(error.message).toBe(
        `the edit is no longer in ${OVERLAY}: press Undo to clear it`,
      );
      expect(w.files.get(OVERLAY)).toBe(BASE);
      expect((await s.status()).pending).not.toBeNull();
    });
  });

  it('takes the placeholder text again where Keep saved its record but never wrote the file', async () => {
    await s.set(setBody(s));
    const placeholder = w.files.get(OVERLAY);
    const write = w.deps.files.write;
    let fail = true;
    w.deps.files.write = (p, t) => {
      if (p === OVERLAY && fail) {
        fail = false;
        throw new Error('disk full');
      }
      write(p, t);
    };
    s = createSession(w.deps);
    await expect(
      s.keep({ component: 'Button', reason: 'First.' }),
    ).rejects.toThrow(/disk full/);
    expect(w.files.get(OVERLAY)).toBe(placeholder);
    expect(await s.keep({ component: 'Button', reason: 'Second.' })).toEqual({
      ok: true,
    });
    expect(w.files.get(OVERLAY)).toContain('reason: Second.');
  });

  it('leaves someone else’s edit, and the record, where a set fails after the file changed', async () => {
    const edited = `${BASE}# a person's note\n`;
    w.deps.codegen = async ({ pending }) => {
      w.calls.push(['codegen', pending]);
      if (pending) w.files.set(OVERLAY, edited);
      return { ok: !pending, output: 'refused' };
    };
    s = createSession(w.deps);
    const error = await refusal(s.set(setBody(s)));
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/changed on disk since the edit/);
    expect(w.files.get(OVERLAY)).toBe(edited);
    expect((await s.status()).pending).not.toBeNull();
  });

  it('leaves someone else’s edit, and the record, where a Keep that would cancel an approval finds the file changed', async () => {
    losing(w);
    const codegen = w.deps.codegen;
    let edited;
    w.deps.codegen = async (o) => {
      if (!o.pending) {
        edited = `${w.files.get(OVERLAY)}# a person's note\n`;
        w.files.set(OVERLAY, edited);
      }
      return codegen(o);
    };
    s = createSession(w.deps);
    await s.set(setBody(s));
    const error = await refusal(
      s.keep({ component: 'Button', reason: 'Why.' }),
    );
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/changed on disk since the edit/);
    expect(w.files.get(OVERLAY)).toBe(edited);
    expect((await s.status()).pending).not.toBeNull();
  });
});
