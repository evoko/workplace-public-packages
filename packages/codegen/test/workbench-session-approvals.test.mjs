import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { createSession, WorkbenchError } from '../src/workbench/session.mjs';

const HEADER = '# Which SOLAR components a person has approved.\n';

function world(colours) {
  const files = new Map([['spec/approvals.yaml', HEADER]]);
  const coloured = {
    web: Object.entries(colours).map(([name, c]) => ({
      name,
      colour: c.web,
      uses: c.uses ?? [],
      waitsOn: c.waitsOn ?? [],
      fingerprint: `sha256:${name}`,
    })),
    flutter: [],
  };
  const deps = {
    files: {
      read: (p) => files.get(p) ?? null,
      write: (p, t) => files.set(p, t),
      remove: (p) => files.delete(p),
      list: () => [],
    },
    overlayPath: (n) => `spec/overlay/${n}.yaml`,
    approvalsPath: 'spec/approvals.yaml',
    pendingPath: '.workbench/pending.json',
    feedbackDir: 'spec/feedback',
    build: () => {
      throw new Error('not used');
    },
    codegen: async () => ({ ok: true, output: '' }),
    status: async () => ({
      coloured,
      approvals: parse(files.get('spec/approvals.yaml')) ?? {},
    }),
    checks: async () => ({ ok: true, failures: [] }),
    reload: () => {},
    today: () => '2026-09-27',
    emit: () => {},
  };
  return { files, deps };
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

describe('approving from a viewer', () => {
  it('writes the line solar:status prints, for a 🟡 component', async () => {
    const w = world({ Button: { web: 'yellow' } });
    const r = await createSession(w.deps).approve({
      component: 'Button',
      platform: 'web',
    });
    expect(r).toEqual({ ok: true });
    expect(parse(w.files.get('spec/approvals.yaml'))).toEqual({
      Button: {
        web: { fingerprint: 'sha256:Button', on: '2026-09-27' },
      },
    });
    expect(w.files.get('spec/approvals.yaml').startsWith(HEADER)).toBe(true);
    expect(w.files.get('spec/approvals.yaml')).not.toMatch(/\bby:/);
  });

  it('refuses a 🔴 or 🟢 component, naming why', async () => {
    const w = world({
      Dialog: { web: 'red', waitsOn: ['Button'] },
      Button: { web: 'green' },
    });
    const s = createSession(w.deps);
    for (const [component, pattern] of [
      ['Dialog', /waits on Button/],
      ['Button', /already approved/],
    ]) {
      const error = await refusal(s.approve({ component, platform: 'web' }));
      expect(error.status).toBe(409);
      expect(error.message).toMatch(pattern);
    }
    expect(w.files.get('spec/approvals.yaml')).toBe(HEADER);
  });

  it('refuses a platform it does not know, or a component that platform lacks', async () => {
    const w = world({ Button: { web: 'yellow' } });
    const s = createSession(w.deps);
    expect(
      (await refusal(s.approve({ component: 'Button', platform: 'ios' })))
        .status,
    ).toBe(400);
    const error = await refusal(
      s.approve({ component: 'Button', platform: 'flutter' }),
    );
    expect(error.status).toBe(400);
    expect(error.message).toMatch(/Flutter has no Button/);
    expect(w.files.get('spec/approvals.yaml')).toBe(HEADER);
  });

  it('writes the fingerprint read after the checks, and refuses where the colour changed meanwhile', async () => {
    const w = world({ Button: { web: 'yellow' } });
    const status = w.deps.status;
    let checked = false;
    let after = { colour: 'yellow', fingerprint: 'sha256:after' };
    w.deps.checks = async () => {
      checked = true;
      return { ok: true, failures: [] };
    };
    w.deps.status = async () => {
      const st = await status();
      if (!checked) return st;
      return {
        ...st,
        coloured: {
          ...st.coloured,
          web: st.coloured.web.map((c) => ({ ...c, ...after })),
        },
      };
    };
    const s = createSession(w.deps);
    await s.approve({ component: 'Button', platform: 'web' });
    expect(
      parse(w.files.get('spec/approvals.yaml')).Button.web.fingerprint,
    ).toBe('sha256:after');

    w.files.set('spec/approvals.yaml', HEADER);
    checked = false;
    after = { colour: 'red', waitsOn: ['Icon'] };
    const error = await refusal(
      s.approve({ component: 'Button', platform: 'web' }),
    );
    expect(error.status).toBe(409);
    expect(error.message).toMatch(/changed on web while it was checked/);
    expect(w.files.get('spec/approvals.yaml')).toBe(HEADER);
  });

  it('refuses while its checks fail, returning the failures', async () => {
    const w = world({ Button: { web: 'yellow' } });
    w.deps.checks = async () => ({
      ok: false,
      failures: [
        {
          platform: 'web',
          layer: 'root',
          property: 'height',
          figma: 40,
          drawn: 44,
        },
      ],
    });
    const r = await createSession(w.deps).approve({
      component: 'Button',
      platform: 'web',
    });
    expect(r.ok).toBe(false);
    expect(r.failures[0].property).toBe('height');
    expect(parse(w.files.get('spec/approvals.yaml'))).toBeNull();
  });

  it('undoing Button’s approval withdraws Dialog’s too, and previews that first', async () => {
    const w = world({
      Button: { web: 'green' },
      Dialog: { web: 'green', uses: ['Button'] },
    });
    w.files.set(
      'spec/approvals.yaml',
      `${HEADER}Button:\n  web: { fingerprint: x, by: A, on: 2026-09-27 }\nDialog:\n  web: { fingerprint: x, by: A, on: 2026-09-27 }\n`,
    );
    const s = createSession(w.deps);
    expect(
      await s.unapprovePreview({ component: 'Button', platform: 'web' }),
    ).toEqual({ withdraws: ['Button', 'Dialog'] });
    expect(w.files.get('spec/approvals.yaml')).toContain('Dialog:');
    expect(await s.unapprove({ component: 'Button', platform: 'web' })).toEqual(
      { withdraws: ['Button', 'Dialog'] },
    );
    expect(parse(w.files.get('spec/approvals.yaml')) ?? {}).toEqual({});
    expect(w.files.get('spec/approvals.yaml').startsWith(HEADER)).toBe(true);
  });

  it('refuses to undo an approval there is none of', async () => {
    const w = world({ Button: { web: 'yellow' } });
    const s = createSession(w.deps);
    for (const op of [s.unapprove, s.unapprovePreview]) {
      const error = await refusal(op({ component: 'Button', platform: 'web' }));
      expect(error.status).toBe(409);
      expect(error.message).toMatch(/not approved/);
    }
    expect(w.files.get('spec/approvals.yaml')).toBe(HEADER);
  });

  it('refuses to undo an approval on a platform it does not know, as a bad request', async () => {
    const w = world({ Button: { web: 'green' } });
    w.files.set(
      'spec/approvals.yaml',
      `${HEADER}Button:\n  web: { fingerprint: x, by: A, on: 2026-09-27 }\n`,
    );
    const before = w.files.get('spec/approvals.yaml');
    const s = createSession(w.deps);
    for (const op of [s.unapprove, s.unapprovePreview]) {
      const error = await refusal(op({ component: 'Button', platform: 'ios' }));
      expect(error.status).toBe(400);
    }
    expect(w.files.get('spec/approvals.yaml')).toBe(before);
  });
});
