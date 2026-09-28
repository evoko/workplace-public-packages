import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import {
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
  // no file), as the real service's build reads the files on disk. Every other component, and
  // Button's oracle, as the repository builds them.
  buildOver = (text) => {
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
    codegen: async () => {
      calls.push(['codegen']);
      return { ok: true, output: '' };
    },
    status: async () => ({ coloured, approvals: {} }),
    checks: async () => ({ ok: true, failures: [] }),
    reload: () => calls.push(['reload']),
    today: () => '2026-09-27',
    emit: (e) => {
      events.push(e);
      calls.push(['emit', e.type]);
    },
  };
  return { files, calls, writes, events, deps };
}

const WHY = 'The owner’s choice.';
const applyBody = (s, extra = {}) => ({
  component: 'Button',
  platform: 'web',
  variant: 0,
  layer: 'root',
  cell: 'background',
  scope: 'root.base.background',
  value: { token: 'color.text.primary' },
  reason: WHY,
  revision: s.inspect('Button', extra.variant ?? 0).revision,
  ...extra,
});
/** Button's overlay once an apply of `applyBody` wrote its rule. */
const APPLIED = `${BASE}\nset:\n  root.base.background:\n    token: color.text.primary\n    reason: ${WHY}\n`;

/** The checks fail from now on, with these failures. */
function failing(
  w,
  failures = [{ platform: 'web', layer: 'root', property: 'height' }],
) {
  w.deps.checks = async () => ({ ok: false, failures });
  return failures;
}

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
 * Badge's approval holds until the regeneration numbered `after` (the first: Apply's), and not
 * after: the edit would cancel it.
 */
function losing(w, after = 1) {
  let runs = 0;
  const codegen = w.deps.codegen;
  w.deps.codegen = async () => {
    runs += 1;
    return codegen();
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
        row('Badge', runs >= after ? 'yellow' : 'green', 'y'),
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
    expect(st.reopen).toBeNull();
  });

  it('offers exactly the operations of the HTTP contract', () => {
    expect(Object.keys(s).sort()).toEqual([
      'apply',
      'approve',
      'inspect',
      'keep',
      'report',
      'send',
      'status',
      'unapprove',
      'unapprovePreview',
      'undo',
    ]);
  });

  it('writes the rule with its reason, regenerates, runs the checks, and holds no edit where they pass', async () => {
    expect(await s.apply(applyBody(s))).toEqual({ ok: true });
    expect(w.files.get(OVERLAY)).toBe(APPLIED);
    expect(w.files.get(OVERLAY)).not.toContain(PLACEHOLDER);
    expect(w.calls.filter(([c]) => c !== 'emit')).toEqual([
      ['codegen'],
      ['reload'],
    ]);
    expect((await s.status()).pending).toBeNull();
    expect(w.files.has(PENDING)).toBe(false);
  });

  it('tells the viewers to reload once the regeneration is done, and says where the saving viewer reopens', async () => {
    await s.apply(applyBody(s));
    expect(w.events).toEqual([
      { type: 'busy', message: 'Saving…' },
      { type: 'reload' },
      { type: 'changed' },
    ]);
    expect((await s.status()).reopen).toEqual({
      platform: 'web',
      component: 'Button',
      variant: 0,
      layer: 'root',
      cell: 'background',
      age: expect.any(Number),
    });
  });

  it('names where to reopen for a minute, however often it is read, and not once the next operation starts', async () => {
    let clock = 1_000;
    w.deps.now = () => clock;
    s = createSession(w.deps);
    await s.apply(applyBody(s));
    clock += 30_000;
    // Read by every load of the page, not used up.
    expect((await s.status()).reopen).toMatchObject({ age: 30_000 });
    expect((await s.status()).reopen).toMatchObject({ age: 30_000 });
    clock += 30_001;
    expect((await s.status()).reopen).toBeNull();
    clock = 1_000;
    await s.apply(
      applyBody(s, {
        value: { token: 'color.text.secondary' },
        reason: 'Quieter.',
        revision: s.inspect('Button', 0).revision,
      }),
    );
    expect((await s.status()).reopen).not.toBeNull();
    await s.report({
      component: 'Button',
      platform: 'web',
      note: 'The label is too dim.',
    });
    expect((await s.status()).reopen).toBeNull();
  });

  it('refuses no reason, the placeholder, two lines, or the replaced rule’s reason unchanged, writing nothing', async () => {
    w.files.set(OVERLAY, overlay(RULE));
    for (const [reason, pattern] of [
      [undefined, /reason/],
      [' ', /reason/],
      [PLACEHOLDER, /reason/],
      [`${PLACEHOLDER} later`, /reason/],
      ['One.\nTwo.', /one line/],
      ['Old.', /rewrite/],
    ]) {
      const error = await refusal(s.apply(applyBody(s, { reason })));
      expect(error.status).toBe(400);
      expect(error.message).toMatch(pattern);
    }
    untouched(w, overlay(RULE));
    expect(w.calls.filter(([c]) => c === 'codegen')).toEqual([]);
  });

  it('refuses a platform other than the two', async () => {
    const error = await refusal(s.apply(applyBody(s, { platform: undefined })));
    expect(error.status).toBe(400);
    untouched(w);
  });

  it('keeps the edit pending with the failures where the checks fail, as Apply wrote it', async () => {
    const failures = failing(w);
    expect(await s.apply(applyBody(s))).toEqual({ ok: false, failures });
    expect(w.files.get(OVERLAY)).toBe(APPLIED);
    expect((await s.status()).pending).toMatchObject({
      component: 'Button',
      key: 'root.base.background',
      value: { token: 'color.text.primary' },
      was: 'color.action.primary.bg.default',
      reason: WHY,
      deletes: false,
      borrowers: [],
      failing: failures,
    });
    expect(JSON.parse(w.files.get(PENDING))).toMatchObject({
      before: BASE,
      after: APPLIED,
    });
    // The viewers reload on the edit as it is, and the saving viewer reopens.
    expect(w.calls).toContainEqual(['reload']);
    expect((await s.status()).reopen).toMatchObject({ platform: 'web' });
  });

  it('records a rule the edit replaces as was, and keeps no borrowed reason as the one replaced', async () => {
    failing(w);
    w.files.set(OVERLAY, overlay(RULE));
    await s.apply(applyBody(s));
    expect((await s.status()).pending).toMatchObject({
      was: 'color.text.secondary',
      previousReason: 'Old.',
    });
    w = world();
    failing(w);
    w.files.set(
      OVERLAY,
      overlay(
        'set:\n  root.base.gap:\n    token: inset.sm\n    reason: R.\n  root.base.background:\n    token: color.text.secondary\n    reason: { as: set root.base.gap }\n',
      ),
    );
    s = createSession(w.deps);
    await s.apply(applyBody(s));
    expect((await s.status()).pending.previousReason).toBeNull();
    expect(JSON.parse(w.files.get(PENDING)).previousReason).toBeNull();
  });

  it('saves the record before it writes the overlay, and shows no pending edit while it runs', async () => {
    const seen = [];
    const codegen = w.deps.codegen;
    w.deps.codegen = async () => {
      seen.push((await s.status()).pending);
      return codegen();
    };
    s = createSession(w.deps);
    await s.apply(applyBody(s));
    expect(w.writes.indexOf(PENDING)).toBeGreaterThanOrEqual(0);
    expect(w.writes.indexOf(PENDING)).toBeLessThan(w.writes.indexOf(OVERLAY));
    expect(seen).toEqual([null]);
  });

  it('writes the value as exactly one of token, keyword or none', async () => {
    await s.apply(
      applyBody(s, {
        value: { token: 'color.text.primary', none: true, keyword: 'FILL' },
      }),
    );
    expect(w.files.get(OVERLAY)).toBe(APPLIED);
  });

  it('keeps again: regenerates and runs the checks again, and a pass ends the pending edit', async () => {
    failing(w);
    await s.apply(applyBody(s));
    w.deps.checks = async () => ({ ok: true, failures: [] });
    w.calls.length = 0;
    expect(await s.keep({ component: 'Button', platform: 'web' })).toEqual({
      ok: true,
    });
    expect(w.files.get(OVERLAY)).toBe(APPLIED);
    expect(w.calls.filter(([c]) => c !== 'emit')).toEqual([
      ['codegen'],
      ['reload'],
    ]);
    expect((await s.status()).pending).toBeNull();
    expect(w.files.has(PENDING)).toBe(false);
  });

  it('keeps again with the failures where the checks fail again', async () => {
    failing(w);
    await s.apply(applyBody(s));
    const again = failing(w, [{ platform: 'flutter', message: 'still' }]);
    expect(await s.keep({ component: 'Button', platform: 'web' })).toEqual({
      ok: false,
      failures: again,
    });
    expect((await s.status()).pending.failing).toEqual(again);
  });

  it('undoes to the exact bytes before, regenerates, and tells the viewers to reload', async () => {
    const before =
      '# kept\ncomponent: Button\nset:\n  root.base.gap:\n    token: inset.xs\n    reason: R.\n';
    w.files.set(OVERLAY, before);
    failing(w);
    await s.apply(applyBody(s));
    w.calls.length = 0;
    w.events.length = 0;
    await s.undo({ component: 'Button', platform: 'web' });
    untouched(w, before);
    expect(w.calls.filter(([c]) => c !== 'emit')).toEqual([
      ['codegen'],
      ['reload'],
    ]);
    expect(w.events.map((e) => e.type)).toEqual(['busy', 'reload', 'changed']);
  });

  it('reopens the dialog where the edit was, on the platform that undoes or keeps it again', async () => {
    failing(w);
    await s.apply(applyBody(s));
    const at = {
      component: 'Button',
      variant: 0,
      layer: 'root',
      cell: 'background',
    };
    expect(JSON.parse(w.files.get(PENDING))).toMatchObject({
      variant: 0,
      layer: 'root',
      cell: 'background',
    });
    await s.keep({ component: 'Button', platform: 'flutter' });
    expect((await s.status()).reopen).toMatchObject({
      platform: 'flutter',
      ...at,
    });
    await s.undo({ component: 'Button', platform: 'web' });
    expect((await s.status()).pending).toBeNull();
    expect((await s.status()).reopen).toMatchObject({ platform: 'web', ...at });
    for (const op of [
      () => s.keep({ component: 'Button' }),
      () => s.undo({ component: 'Button' }),
    ]) {
      const error = await refusal(op());
      expect(error.status).toBe(400);
    }
  });

  it('answers Undo with the status as it is once it finishes: not busy', async () => {
    failing(w);
    await s.apply(applyBody(s));
    expect(
      (await s.undo({ component: 'Button', platform: 'web' })).busy,
    ).toBeNull();
  });

  it('keeps the edit pending where Undo’s regeneration fails, and Undo again finishes it', async () => {
    failing(w);
    await s.apply(applyBody(s));
    w.deps.codegen = async () => ({ ok: false, output: 'boom' });
    s = createSession(w.deps);
    const error = await refusal(
      s.undo({ component: 'Button', platform: 'web' }),
    );
    expect(error.status).toBe(500);
    expect(error.message).toBe(
      'the overlay is back, but regenerating failed: boom; press Undo again',
    );
    expect(w.files.get(OVERLAY)).toBe(BASE);
    expect((await s.status()).pending).not.toBeNull();
    w.deps.codegen = async () => ({ ok: true, output: '' });
    await s.undo({ component: 'Button', platform: 'web' });
    untouched(w);
  });

  it.each([
    ['a new rule', BASE, {}],
    ['a rule replaced', overlay(RULE), {}],
    [
      'a rule deleted',
      overlay(RULE),
      { value: { token: 'color.action.primary.bg.default' }, reason: '' },
    ],
  ])(
    'undoes an Apply that would cancel an approval, naming it: %s',
    async (_, before, extra) => {
      losing(w);
      w.files.set(OVERLAY, before);
      s = createSession(w.deps);
      const error = await refusal(s.apply(applyBody(s, extra)));
      expect(error.status).toBe(409);
      expect(error.message).toMatch(/saved, this would cancel Badge \(web\)/);
      untouched(w, before);
      expect((await s.status()).pending).toBeNull();
      // Regenerated with the edit and back without it: the viewers reloaded after each, and the
      // saving one reopens where it was.
      expect(w.events.map((e) => e.type)).toEqual([
        'busy',
        'reload',
        'reload',
        'failed',
        'changed',
      ]);
      expect((await s.status()).reopen).toMatchObject({ platform: 'web' });
    },
  );

  it('tells the viewers to reload as soon as the regeneration is done, before the checks', async () => {
    const seen = [];
    w.deps.checks = async () => {
      seen.push(
        w.events.map((e) => e.type),
        (await s.status()).reopen,
      );
      return { ok: false, failures: [{ platform: 'web', message: 'x' }] };
    };
    s = createSession(w.deps);
    await s.apply(applyBody(s));
    expect(seen).toEqual([
      ['busy', 'reload'],
      expect.objectContaining({ platform: 'web', cell: 'background' }),
    ]);
    // Where to reopen is named before the reload, so the reloaded page finds it.
    expect(w.events.map((e) => e.type)).toEqual(['busy', 'reload', 'changed']);
  });

  it('keeps the edit pending where the lost-approval restore’s regeneration fails', async () => {
    losing(w);
    const codegen = w.deps.codegen;
    let runs = 0;
    w.deps.codegen = async () => {
      const r = await codegen();
      runs += 1;
      // Apply's own regeneration passes; the restore's after it fails.
      return runs === 1 ? r : { ok: false, output: 'boom' };
    };
    s = createSession(w.deps);
    const error = await refusal(s.apply(applyBody(s)));
    expect(error.status).toBe(500);
    expect(error.message).toMatch(
      /regenerating failed: boom; press Undo again/,
    );
    expect(w.files.get(OVERLAY)).toBe(BASE);
    expect((await s.status()).pending).not.toBeNull();
  });

  it('undoes to the exact bytes before after a restart, and comes back with the pending edit', async () => {
    const before = `# kept\n${overlay(RULE)}`;
    w.files.set(OVERLAY, before);
    failing(w);
    await s.apply(applyBody(s));
    const again = createSession(w.deps);
    expect((await again.status()).pending).toMatchObject({
      component: 'Button',
    });
    await again.undo({ component: 'Button', platform: 'web' });
    untouched(w, before);
  });

  it('reads back a record an older service wrote, with its placeholder text, and undoes it', async () => {
    const placeholder = `${BASE}\nset:\n  root.base.background:\n    token: color.text.primary\n    reason: ${PLACEHOLDER}\n`;
    w.files.set(OVERLAY, placeholder);
    w.files.set(
      PENDING,
      JSON.stringify({
        component: 'Button',
        key: 'root.base.background',
        value: { token: 'color.text.primary' },
        deletes: false,
        before: BASE,
        placeholder,
        after: placeholder,
        previousReason: null,
        borrowers: [],
        failing: null,
      }),
    );
    s = createSession(w.deps);
    expect((await s.status()).pending).toMatchObject({ was: null });
    await s.undo({ component: 'Button', platform: 'web' });
    untouched(w);
  });

  it.each([
    ['not JSON', '{ not json'],
    ['null', 'null'],
    ['without its texts', '{"component":"Button","key":"root.base.gap"}'],
    [
      'with a field of the wrong type',
      '{"component":"Button","key":1,"before":"","after":""}',
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
    const body = applyBody(s);
    w.files.delete(OVERLAY);
    const error = await refusal(s.apply(body));
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/Button has no overlay file/);
    expect(w.files.has(OVERLAY)).toBe(false);
    expect(w.files.has(PENDING)).toBe(false);
  });

  it('refuses a component neither viewer shows, as a bad request', async () => {
    const error = await refusal(
      s.apply({ ...applyBody(s), component: 'Nope' }),
    );
    expect(error.status).toBe(400);
    untouched(w);
  });

  it('refuses a stale revision: the file changed since the dialog read it', async () => {
    const body = applyBody(s);
    w.files.set(OVERLAY, overlay('bind: {}\n'));
    const error = await refusal(s.apply(body));
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
      const error = await refusal(s.apply({ ...applyBody(s), ...extra }));
      expect(error.status).toBe(400);
      expect(error.message).toMatch(pattern);
    }
    untouched(w);
  });

  it('refuses any value on a raw value the overlay allows, with the cell’s note', async () => {
    const text = overlay('allowLiteral:\n  counter.height:\n    reason: R.\n');
    w.files.set(OVERLAY, text);
    const body = applyBody(s, {
      layer: 'counter',
      cell: 'height',
      scope: 'counter.base.height',
    });
    for (const value of [{ token: 'size.control.md' }, { none: true }]) {
      const error = await refusal(s.apply({ ...body, value }));
      expect(error.status).toBe(400);
      expect(error.message).toMatch(/allowLiteral\): use Report/);
    }
    untouched(w, text);
  });

  it('refuses a value the cell already draws there', async () => {
    const error = await refusal(
      s.apply(
        applyBody(s, { value: { token: 'color.action.primary.bg.default' } }),
      ),
    );
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/already draws/);
    untouched(w);
  });

  it('deletes the rule where Figma’s own value is chosen, asking no reason', async () => {
    w.files.set(
      OVERLAY,
      overlay(
        'set:\n  root.base.gap:\n    token: inset.sm\n    reason: R.\n  root.base.background:\n    token: color.text.secondary\n    reason: Old.\n',
      ),
    );
    expect(
      await s.apply(
        applyBody(s, {
          value: { token: 'color.action.primary.bg.default' },
          reason: undefined,
        }),
      ),
    ).toEqual({ ok: true });
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
      s.apply(
        applyBody(s, { value: { token: 'color.action.primary.bg.default' } }),
      ),
    );
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/borrows its reason/);
    untouched(w, before);
    failing(w);
    await s.apply(applyBody(s));
    expect((await s.status()).pending).toMatchObject({
      deletes: false,
      previousReason: 'Old.',
      borrowers: ['set root.base.borderColor'],
    });
  });

  it('refuses a second edit while one is pending', async () => {
    failing(w);
    await s.apply(applyBody(s));
    const error = await refusal(
      s.apply(
        applyBody(s, {
          cell: 'borderColor',
          scope: 'root.base.borderColor',
          revision: s.inspect('Button', 0).revision,
        }),
      ),
    );
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/pending/);
    expect(w.files.get(OVERLAY)).toBe(APPLIED);
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
    const error = await refusal(s.apply(applyBody(s, { variant: shadowed })));
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/wins/);
    untouched(w);
    // Nothing was regenerated, so nothing needs regenerating back, nor reloading.
    expect(w.calls.filter(([c]) => c !== 'emit')).toEqual([]);
  });

  it('rolls an apply back where the build refuses it, telling no viewer to reload', async () => {
    let runs = 0;
    w.deps.codegen = async () => {
      runs += 1;
      w.calls.push(['codegen']);
      return runs === 1
        ? { ok: false, output: 'line 1\nset root.base.background: no' }
        : { ok: true, output: '' };
    };
    s = createSession(w.deps);
    const error = await refusal(s.apply(applyBody(s)));
    expect(error.status).toBe(400);
    expect(error.message).toMatch(/refused the edit, which is undone: .*no$/);
    untouched(w);
    expect((await s.status()).pending).toBeNull();
    expect(w.calls.filter(([c]) => c !== 'emit')).toEqual([
      ['codegen'],
      ['codegen'],
    ]);
    expect(w.events.map((e) => e.type)).not.toContain('reload');
  });

  it('rolls an apply back where the regeneration throws, even when regenerating back throws too', async () => {
    let runs = 0;
    w.deps.codegen = async () => {
      runs += 1;
      throw new Error(runs === 1 ? 'spawn failed' : 'still failing');
    };
    s = createSession(w.deps);
    const error = await refusal(s.apply(applyBody(s)));
    expect(error.status).toBe(500);
    expect(error.message).toMatch(/spawn failed/);
    untouched(w);
    expect(runs).toBe(2);
    // The session goes on: a later apply is taken.
    w.deps.codegen = async () => ({ ok: true, output: '' });
    expect(await s.apply(applyBody(s))).toEqual({ ok: true });
  });

  it('refuses Keep again and Undo where the overlay changed after the apply, leaving that change', async () => {
    failing(w);
    await s.apply(applyBody(s));
    const edited = `${w.files.get(OVERLAY)}# a person's note\n`;
    w.files.set(OVERLAY, edited);
    for (const op of [
      () => s.keep({ component: 'Button', platform: 'web' }),
      () => s.undo({ component: 'Button', platform: 'web' }),
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

  it('keeps the edit pending with no failures where the checks cannot run, to Undo or Keep again', async () => {
    w.deps.checks = async () => {
      throw new Error('the runner crashed');
    };
    s = createSession(w.deps);
    await expect(s.apply(applyBody(s))).rejects.toThrow(/the runner crashed/);
    expect((await s.status()).pending).toMatchObject({ failing: null });
    // Nothing failed to send.
    const e = await refusal(
      s.send({ component: 'Button', platform: 'web', note: 'x' }),
    );
    expect(e.status).toBe(400);
    expect(
      [...w.files.keys()].some((k) => k.startsWith('spec/feedback/')),
    ).toBe(false);
    w.deps.checks = async () => ({ ok: true, failures: [] });
    expect(await s.keep({ component: 'Button', platform: 'web' })).toEqual({
      ok: true,
    });
    expect((await s.status()).pending).toBeNull();
  });

  it('sends a failing apply to the agent: the edit stays as written, a note carries the failures', async () => {
    const failures = failing(w, [
      {
        platform: 'web',
        layer: 'root',
        property: 'height',
        figma: 40,
        drawn: 44,
      },
    ]);
    expect((await s.apply(applyBody(s))).ok).toBe(false);
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
    expect(w.files.get(OVERLAY)).toBe(APPLIED);
    // Nothing to regenerate: Apply already built the edit as it stays.
    expect(w.calls.filter((c) => c[0] === 'codegen')).toHaveLength(regenerated);
    // Kept, it is no longer pending: a second Send has nothing to carry.
    const again = await refusal(
      s.send({ component: 'Button', platform: 'web', note: 'x' }),
    );
    expect(again.status).toBe(400);
    expect(again.message).toBe('Button has no failing checks to send');
  });

  it('caps a failing apply’s failures, so its status and a Send of them stay within the limit', async () => {
    failing(
      w,
      Array.from({ length: 450 }, (_, i) => ({
        platform: 'web',
        variant: `v${i}`,
        layer: 'root',
        property: 'borderDash',
        figma: [2, 4],
        drawn: [3, 3],
      })),
    );
    const r = await s.apply(applyBody(s));
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

  it('keeps the edit pending where Keep again’s build fails, saying it can be undone', async () => {
    failing(w);
    await s.apply(applyBody(s));
    w.deps.codegen = async () => ({ ok: false, output: 'boom' });
    s = createSession(w.deps);
    const error = await refusal(
      s.keep({ component: 'Button', platform: 'web' }),
    );
    expect(error.status).toBe(400);
    expect(error.message).toMatch(
      /boom; the edit is still pending: Undo, or fix and Keep again/,
    );
    expect((await s.status()).pending).not.toBeNull();
    w.deps.codegen = async () => ({ ok: true, output: '' });
    await s.undo({ component: 'Button', platform: 'web' });
    untouched(w);
  });

  it('undoes a Keep again that would cancel an approval, naming it', async () => {
    // Badge holds through Apply's regeneration and not Keep again's.
    losing(w, 2);
    failing(w);
    s = createSession(w.deps);
    await s.apply(applyBody(s));
    const error = await refusal(
      s.keep({ component: 'Button', platform: 'web' }),
    );
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/kept, this would cancel Badge \(web\)/);
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
    const error = await refusal(s2.apply(applyBody(s2)));
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/approved on web/);
    untouched(w2);
  });

  it('refuses to approve, or withdraw an approval, while any edit is pending; a preview is read-only', async () => {
    const approvals = {
      Badge: { web: { fingerprint: 'x', on: '2026-09-27' } },
    };
    w = world({
      colours: {
        Button: { web: 'yellow', flutter: 'yellow' },
        Badge: { web: 'green', flutter: 'yellow' },
      },
    });
    const status = w.deps.status;
    w.deps.status = async () => ({ ...(await status()), approvals });
    failing(w);
    s = createSession(w.deps);
    await s.apply(applyBody(s));
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
    w.deps.codegen = async () => {
      seen.push((await s.status()).busy);
      return codegen();
    };
    s = createSession(w.deps);
    const body = applyBody(s);
    const first = s.undo({ component: 'Button', platform: 'web' });
    const second = s.apply(body);
    const error = await refusal(first);
    expect(error.message).toMatch(/no pending edit/);
    await second;
    expect(seen).toEqual(['Saving…']);
    expect(w.events).toEqual([
      { type: 'busy', message: 'Undoing…' },
      { type: 'failed', message: 'Button has no pending edit' },
      { type: 'changed' },
      { type: 'busy', message: 'Saving…' },
      { type: 'reload' },
      { type: 'changed' },
    ]);
    expect((await s.status()).busy).toBeNull();
  });

  it('gives each outcome as it is where telling the viewers throws', async () => {
    w.deps.emit = () => {
      throw new Error('no viewer');
    };
    s = createSession(w.deps);
    const error = await refusal(
      s.undo({ component: 'Button', platform: 'web' }),
    );
    expect(error.message).toMatch(/no pending edit/);
    expect(await s.apply(applyBody(s))).toEqual({ ok: true });
    expect((await s.status()).busy).toBeNull();
  });

  it('holds no pending edit it could not save', async () => {
    const write = w.deps.files.write;
    w.deps.files.write = (p, t) => {
      if (p === PENDING) throw new Error('disk full');
      write(p, t);
    };
    s = createSession(w.deps);
    await expect(s.apply(applyBody(s))).rejects.toThrow(/disk full/);
    expect((await s.status()).pending).toBeNull();
    untouched(w);
  });

  describe('where the overlay is already back as it was', () => {
    it('lets Undo be retried after a restore whose regeneration threw', async () => {
      failing(w);
      await s.apply(applyBody(s));
      w.deps.codegen = async () => {
        throw new Error('spawn failed');
      };
      s = createSession(w.deps);
      await expect(
        s.undo({ component: 'Button', platform: 'web' }),
      ).rejects.toThrow(/spawn failed/);
      expect(w.files.get(OVERLAY)).toBe(BASE);
      expect((await s.status()).pending).not.toBeNull();
      w.deps.codegen = async () => {
        w.calls.push(['codegen']);
        return { ok: true, output: '' };
      };
      w.calls.length = 0;
      await s.undo({ component: 'Button', platform: 'web' });
      untouched(w);
      expect(w.calls).toContainEqual(['codegen']);
      expect(w.calls).toContainEqual(['reload']);
    });

    it('lets Undo clear, after a restart, an edit saved but never written', async () => {
      failing(w);
      await s.apply(applyBody(s));
      w.files.set(OVERLAY, BASE);
      await createSession(w.deps).undo({
        component: 'Button',
        platform: 'web',
      });
      untouched(w);
    });

    it('refuses Keep again, saying to press Undo', async () => {
      failing(w);
      await s.apply(applyBody(s));
      w.files.set(OVERLAY, BASE);
      const error = await refusal(
        s.keep({ component: 'Button', platform: 'web' }),
      );
      expect(error.status).toBe(409);
      expect(error.message).toBe(
        `the edit is no longer in ${OVERLAY}: press Undo to clear it`,
      );
      expect(w.files.get(OVERLAY)).toBe(BASE);
      expect((await s.status()).pending).not.toBeNull();
    });
  });

  it('leaves someone else’s edit, and the record, where an apply fails after the file changed', async () => {
    const edited = `${BASE}# a person's note\n`;
    let runs = 0;
    w.deps.codegen = async () => {
      runs += 1;
      if (runs === 1) w.files.set(OVERLAY, edited);
      return { ok: runs !== 1, output: 'refused' };
    };
    s = createSession(w.deps);
    const error = await refusal(s.apply(applyBody(s)));
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/changed on disk since the edit/);
    expect(w.files.get(OVERLAY)).toBe(edited);
    expect((await s.status()).pending).not.toBeNull();
  });

  it('leaves someone else’s edit, and the record, where an apply that would cancel an approval finds the file changed', async () => {
    losing(w);
    const codegen = w.deps.codegen;
    let edited;
    w.deps.codegen = async () => {
      edited = `${w.files.get(OVERLAY)}# a person's note\n`;
      w.files.set(OVERLAY, edited);
      return codegen();
    };
    s = createSession(w.deps);
    const error = await refusal(s.apply(applyBody(s)));
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/changed on disk since the edit/);
    expect(w.files.get(OVERLAY)).toBe(edited);
    expect((await s.status()).pending).not.toBeNull();
  });
});
