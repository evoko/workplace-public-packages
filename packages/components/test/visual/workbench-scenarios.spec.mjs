/**
 * The workbench bar's shared scenarios (codegen/src/workbench/bar-scenarios.json), which
 * Widgetbook's bar runs too (widgetbook/test/workbench_scenarios_test.dart): one test each, against
 * Storybook's bar (stories/workbench/Bar.tsx) with its real HTTP client, the page's requests
 * answered here as the scenario's fake service. A step, an expectation or a fake's key this driver
 * does not know fails the scenario, as does a control the vocabulary does not name: the Inspect
 * dialog's while it is open (found by vocabulary.dialog's names), else the bar's. What is the web's
 * own (the focus) is workbench.spec.mjs.
 */

import { expect, test } from '@playwright/test';
import {
  readScenarios,
  scenariosFor,
} from '../../../codegen/src/workbench/bar-scenarios.mjs';
import { servePages } from './build.mjs';

const { vocabulary } = readScenarios();
const ACTIONS = vocabulary.actions;
/** Controls the web's bar may draw that no scenario names. */
const OWN = vocabulary.platformActions.web;
const SERIAL = new Set(vocabulary.serial.routes);
const FAKE_KEYS = new Set(Object.keys(vocabulary.fake));
const ANSWER_KEYS = new Set(['answer', 'status', 'refuse', 'events', 'hold']);
/** The words of vocabulary.named: such an action is the word, a space and a name. */
const NAMED = Object.keys(vocabulary.named).filter((k) => k !== 'about');
const namedOf = (name) => NAMED.find((w) => name.startsWith(`${w} `));
/** The controls `choose` opens: the editor's Selects and each axis. */
const isSelect = (name) =>
  ['Change to', 'Apply to'].includes(name) || namedOf(name) === 'Axis';
/** The actions the dialog's strip holds while an edit is pending. */
const STRIP = new Set([
  'Keep',
  'Undo',
  'Reason',
  'Agent note',
  'Send to agent',
]);
/** The roles a control may have. */
const ROLES = [
  'button',
  'combobox',
  'textbox',
  'checkbox',
  'radio',
  'switch',
  'slider',
  'link',
  'tab',
  'treeitem',
  'searchbox',
];
/** The text fields, by action: the pending edit's reason, Report's note, and Send to agent's. */
const FIELDS = { Reason: /^Why/, Note: /^Note/, 'Agent note': /^Agent note/ };
const FIELD_ACTIONS = {
  reason: 'Reason',
  note: 'Note',
  agentNote: 'Agent note',
  filter: 'Filter tokens',
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));

/**
 * The index of the one of `words` a fact names (its words contain it, or all of a list of facts;
 * of several, the one whose words are the fact), or why there is none.
 */
function choice(words, fact) {
  const facts = Array.isArray(fact) ? fact : [fact];
  let hits = words.flatMap((w, i) =>
    facts.every((f) => w.includes(f)) ? [i] : [],
  );
  if (hits.length > 1 && facts.length === 1)
    hits = hits.filter((i) => words[i] === facts[0]);
  return hits.length === 1
    ? hits[0]
    : `${JSON.stringify(fact)} names ${hits.length} of ${JSON.stringify(words)}`;
}

/** What differs between the options a control offers (`{ words, enabled, chosen }`) and `want`. */
function optionProblems(got, want) {
  const out = [];
  const words = got.map((g) => g.words);
  const entries = [
    ...(want.enabled ?? []).map((f) => [f, true]),
    ...(want.disabled ?? []).map((f) => [f, false]),
  ];
  const seen = new Set();
  for (const [fact, on] of entries) {
    const i = choice(words, fact);
    if (typeof i === 'string') {
      out.push(i);
      continue;
    }
    if (seen.has(i)) out.push(`${words[i]} is named twice`);
    seen.add(i);
    if (got[i].enabled !== on)
      out.push(`${words[i]} is ${got[i].enabled ? 'enabled' : 'disabled'}`);
  }
  if (
    ('enabled' in want || 'disabled' in want) &&
    got.length !== entries.length
  )
    out.push(`offered: ${JSON.stringify(words)}`);
  if ('chosen' in want) {
    const chosen = got.filter((g) => g.chosen).map((g) => g.words);
    if (chosen.length !== 1 || !chosen[0].includes(want.chosen))
      out.push(`chosen: ${JSON.stringify(chosen)}`);
  }
  return out;
}

/** Whether the layer `name` sits inside `ancestor`, by the inspection's parents. */
function within(layers, name, ancestor) {
  const parent = new Map(layers.map((l) => [l.name, l.parent]));
  for (let p = parent.get(name); p; p = parent.get(p))
    if (p === ancestor) return true;
  return false;
}

/** A point of `box` none of the boxes `inside` covers, the centre first; or null. */
function pointIn(box, inside) {
  const at = [0.5, 0.25, 0.75, 0.1, 0.9, 0.05, 0.95];
  for (const fy of at)
    for (const fx of at) {
      const x = box.x + box.width * fx;
      const y = box.y + box.height * fy;
      const covered = inside.some(
        (b) =>
          x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height,
      );
      if (!covered) return { x, y };
    }
  return null;
}

/**
 * The fake service a scenario describes, answering the page's requests under `/service/`: what it
 * was sent (`calls`, the POSTs; `reads`, the other GETs than /events), whether it is at work, and
 * the events the bar has asked for.
 */
function fakeService(fake) {
  for (const k of Object.keys(fake))
    if (!FAKE_KEYS.has(k)) throw new Error(`no such fake key: ${k}`);
  const answers = fake.answers ?? {};
  for (const [route, a] of Object.entries(answers))
    for (const k of Object.keys(a))
      if (!ANSWER_KEYS.has(k))
        throw new Error(`no such answer key: ${route}.${k}`);
  const service = {
    status: fake.status,
    starting: fake.startingTimes ?? 0,
    calls: [],
    reads: [],
    problems: [],
    working: 0,
    last: Date.now(),
    seq: 0,
    // The `after` of the last GET /events, and whether the bar has asked for any.
    polled: false,
    pollAfter: 0,
    busy: null,
    held: {},
  };
  const sent = [];
  let waiting = [];
  service.emit = (event) => {
    service.seq += 1;
    sent.push({ seq: service.seq, ...event });
    const answer = waiting;
    waiting = [];
    for (const w of answer) w();
    service.last = Date.now();
  };
  service.release = (route) => {
    const release = service.held[route];
    if (!release) throw new Error(`no answer held at ${route}`);
    delete service.held[route];
    release();
  };
  const refusal = (a) => ({
    status: a.refuse.status,
    body: { error: a.refuse.error },
  });

  /** The answer to one request other than /events: `{ status, body }`, or `{ abort: true }`. */
  const answer = async (method, route, query, body) => {
    if (method === 'GET') {
      if (route === 'health') {
        service.reads.push(['health']);
        return fake.health === false
          ? { abort: true }
          : { status: 200, body: { service: 'solar-workbench' } };
      }
      if (route === 'status') {
        service.reads.push(['status']);
        if (service.starting > 0) {
          service.starting -= 1;
          return {
            status: 503,
            body: { error: 'the workbench is still starting' },
          };
        }
        if (answers.status?.refuse) return refusal(answers.status);
        return {
          status: 200,
          body: {
            ...service.status,
            busy: service.busy ?? service.status.busy,
          },
        };
      }
      if (route === 'component') {
        const asked = {
          name: query.get('name'),
          variant: Number(query.get('variant')),
        };
        service.reads.push(['component', asked]);
        if (answers.component?.refuse) return refusal(answers.component);
        return {
          status: 200,
          body: {
            ...fake.inspection,
            ...fake.inspectionFor?.[asked.variant],
            variant: asked.variant,
          },
        };
      }
    } else {
      service.calls.push([route, body]);
      const a = answers[route];
      if (!a) {
        service.problems.push(`the scenario gives no answer to ${route}`);
        return { status: 500, body: { error: `no answer to ${route}` } };
      }
      // As the service's serial runs it, where the scenario gives no events of its own.
      const serial = SERIAL.has(route) && !('events' in a);
      if (serial) {
        service.busy = `working: ${route}`;
        service.emit({ type: 'busy', message: service.busy });
      }
      for (const e of a.events ?? []) service.emit(e);
      if (a.hold) {
        service.working -= 1;
        await new Promise((ok) => {
          service.held[route] = ok;
        });
        service.working += 1;
      }
      if (a.status) service.status = a.status;
      if (serial) {
        service.busy = null;
        if (a.refuse) service.emit({ type: 'failed', message: a.refuse.error });
        service.emit({ type: 'changed' });
      }
      if (a.refuse) return refusal(a);
      return { status: 200, body: a.answer ?? service.status };
    }
    service.problems.push(`an unknown request: ${method} ${route}`);
    return { status: 404, body: { error: `no route ${route}` } };
  };

  service.route = async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.slice('/service/'.length);
    if (path === 'events') {
      const after = Number(url.searchParams.get('after'));
      service.polled = true;
      service.pollAfter = after;
      service.last = Date.now();
      const reply = () =>
        route
          .fulfill({
            json: {
              seq: service.seq,
              events: sent.filter((e) => e.seq > after),
            },
          })
          .catch(() => {});
      if (service.seq > after) await reply();
      else waiting.push(reply);
      return;
    }
    service.working += 1;
    service.last = Date.now();
    try {
      const a = await answer(
        request.method(),
        path,
        url.searchParams,
        request.postDataJSON(),
      );
      if (a.abort) await route.abort('connectionrefused');
      else await route.fulfill({ status: a.status, json: a.body });
    } finally {
      service.working -= 1;
      service.last = Date.now();
    }
  };
  return service;
}

/**
 * Waits until what a step started has ended: no request is being answered (a held one aside), the
 * bar has asked for the events after the last one sent (it has read what they made it read), and
 * the page has drawn a frame since.
 */
async function settle(page, service) {
  service.last = Math.max(service.last, Date.now());
  for (const end = Date.now() + 5000; Date.now() < end;) {
    await sleep(25);
    const quiet = service.working === 0 && Date.now() - service.last >= 100;
    const heard = !service.polled || service.pollAfter >= service.seq;
    if (quiet && heard) break;
  }
  await page.evaluate(
    () => new Promise((ok) => requestAnimationFrame(() => setTimeout(ok, 0))),
  );
}

/**
 * The driver: the scenario's steps and expectations, as Playwright's actions and assertions, in
 * the Inspect dialog where it is open (found by vocabulary.dialog's names), else in the bar.
 */
function driver(page, service, component, inspection) {
  const bar = page.getByRole('region', { name: 'Workbench', exact: true });
  const inspect = page.getByRole('dialog', {
    name: `Inspect ${component}`,
    exact: true,
  });
  const confirmation = page.getByRole('alertdialog');
  const preview = inspect.locator('[aria-label="Preview"]');
  const outline = inspect.locator('[aria-label="Selected layer outline"]');
  /** The layer on top: the dialog where it is open, else the bar. */
  const top = async () => {
    const open = (await inspect.count()) > 0;
    return { open, scope: open ? inspect : bar };
  };
  /** A name at the start of an accessible name, alone or followed by more words. */
  const leading = (name) => new RegExp(`^${escape(name)}(\\s|$)`);

  /** The control of an action in `scope`, the dialog's strip holding the pending edit's. */
  const control = (scope, open, name) => {
    const word = namedOf(name);
    const rest = word && name.slice(word.length + 1);
    if (word === 'Axis')
      return scope.getByRole('combobox', { name: leading(rest) });
    if (word === 'Layer')
      return scope
        .getByRole('tree', { name: 'Layers', exact: true })
        .getByRole('treeitem', { name: leading(rest) });
    if (word === 'Cell')
      return scope
        .getByRole('table', { name: 'Properties', exact: true })
        .getByRole('button', { name: leading(rest) });
    const at =
      open && STRIP.has(name)
        ? scope.getByRole('region', { name: 'Pending edit', exact: true })
        : scope;
    if (isSelect(name))
      return at.getByRole('combobox', { name: new RegExp(`^${escape(name)}`) });
    if (name === 'Filter tokens')
      return at
        .getByRole('searchbox', { name, exact: true })
        .or(at.getByRole('textbox', { name, exact: true }));
    if (name in FIELDS) return at.getByRole('textbox', { name: FIELDS[name] });
    return at.getByRole('button', { name, exact: true });
  };
  const action = async (name) => {
    const { open, scope } = await top();
    return control(scope, open, name);
  };

  /** Every name the vocabulary may give a control, with the inspection's for the named ones. */
  const names = [
    ...new Set([
      ...ACTIONS,
      ...OWN,
      ...(inspection?.axes ?? []).map((a) => `Axis ${a.name}`),
      ...(inspection?.layers ?? []).map((l) => `Layer ${l.name}`),
      ...(inspection?.layers ?? []).flatMap((l) =>
        l.cells.map((c) => `Cell ${c.cell}`),
      ),
    ]),
  ];
  /**
   * The actions the layer on top offers, by the vocabulary's names; a control no name finds is
   * listed as `unknown: <its words>`. The component drawn in the preview is not the dialog's.
   */
  const offered = async () => {
    const { open, scope } = await top();
    const found = [];
    let known = 0;
    for (const name of names) {
      const n = await control(scope, open, name).count();
      known += n;
      if (n && !OWN.includes(name)) found.push(name);
    }
    const controls = ROLES.map((role) => scope.getByRole(role)).reduce(
      (all, one) => all.or(one),
    );
    const words = await controls.evaluateAll((els) =>
      els
        .filter((e) => !e.closest('[aria-label="Preview"]'))
        .map((e) => e.getAttribute('aria-label') ?? e.textContent ?? ''),
    );
    if (words.length !== known) found.push(`unknown: ${JSON.stringify(words)}`);
    return found.sort();
  };
  const each = async (list, want) => {
    for (const name of list) {
      const found = await action(name);
      await expect(found, `${name} is offered`).not.toHaveCount(0);
      for (let i = 0; i < (await found.count()); i += 1)
        await expect
          .poll(() => found.nth(i).isEnabled(), { message: `${name}` })
          .toBe(want);
    }
  };

  /** The words of each element, as rendered, spaces collapsed. */
  const wordsOf = (loc) =>
    loc.evaluateAll((els) =>
      els.map((e) =>
        (e.innerText || e.getAttribute('aria-label') || '')
          .replace(/\s+/g, ' ')
          .trim(),
      ),
    );
  /** The one element of `loc` named by `fact` (or all of a list of facts), as the vocabulary picks. */
  const pick = async (loc, fact) => {
    const i = choice(await wordsOf(loc), fact);
    if (typeof i === 'string') throw new Error(i);
    return loc.nth(i);
  };
  /** A Select's options: `{ words, enabled, chosen }` each. */
  const optionsOf = async (found) => {
    await found.click();
    const options = page.getByRole('option');
    await expect(options.first()).toBeVisible();
    const words = await wordsOf(options);
    const states = await options.evaluateAll((els) =>
      els.map((e) => ({
        enabled: e.getAttribute('aria-disabled') !== 'true',
        chosen: e.getAttribute('aria-selected') === 'true',
      })),
    );
    // Escape closes the open Select alone.
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    return words.map((w, i) => ({ words: w, ...states[i] }));
  };

  /**
   * A layer of the component in the preview: the element a case marks with it, else its selector's
   * under the component's root (the Preview's first element; `&` the root itself), else its class's.
   */
  const layerIn = (layer) => {
    const root = preview.locator('xpath=./*[1]');
    const marked = preview.locator(`[data-layer="${layer}"]`).first();
    const l = inspection?.layers.find((x) => x.name === layer);
    const selector = l?.selector ?? (l?.className ? `& .${l.className}` : '&');
    const found =
      selector === '&'
        ? root
        : root.locator(selector.replace(/^&\s*/, ':scope ')).first();
    return marked.or(found).first();
  };
  /** The editor, titled "<layer> · <cell>". */
  const editor = inspect.getByRole('group', {
    name: new RegExp(` · [^ ]+$`),
  });
  const boxOf = async (loc) => ((await loc.count()) ? loc.boundingBox() : null);

  const expectations = {
    calls: (v) => expect.poll(() => service.calls).toEqual(v),
    reads: (v) => expect.poll(() => service.reads).toEqual(v),
    enabled: (v) => each(v, true),
    disabled: (v) => each(v, false),
    absent: async (v) => {
      for (const name of v)
        await expect(await action(name), name).toHaveCount(0);
    },
    options: async (v) => {
      for (const [name, want] of Object.entries(v)) {
        const found = await action(name);
        await expect(found, `${name} is offered`).toHaveCount(1);
        await expect
          .poll(async () => optionProblems(await optionsOf(found), want), {
            message: `${name}'s options`,
          })
          .toEqual([]);
      }
    },
    outlined: async (layer) => {
      await expect
        .poll(
          async () => {
            const [a, b] = [await boxOf(outline), await boxOf(layerIn(layer))];
            if (!a || !b) return Infinity;
            return Math.max(
              ...['x', 'y', 'width', 'height'].map((k) =>
                Math.abs(a[k] - b[k]),
              ),
            );
          },
          { message: `the outline sits on ${layer}` },
        )
        .toBeLessThanOrEqual(1);
    },
    filter: async (v) =>
      expect(await action('Filter tokens'), 'Filter tokens').toHaveValue(v),
    editorUnder: async (cell) => {
      const table = inspect.getByRole('table', {
        name: 'Properties',
        exact: true,
      });
      await expect
        .poll(
          async () => {
            const at = await boxOf(editor);
            const row = await boxOf(await action(`Cell ${cell}`));
            if (!at || !row) return 'no editor or no row';
            const rows = await table
              .getByRole('button')
              .evaluateAll((els) =>
                els
                  .filter((e) => !e.closest('[role="group"]'))
                  .map((e) => e.getBoundingClientRect().top),
              );
            const next = rows
              .filter((top) => top > row.y + 1)
              .sort((a, b) => a - b)[0];
            if (at.y < row.y + row.height - 1)
              return 'the editor is above the row';
            if (next !== undefined && at.y + at.height > next + 1)
              return 'the editor is below the next row';
            return 'under';
          },
          { message: `the editor sits under ${cell}` },
        )
        .toBe('under');
    },
    shows: async (v) => {
      for (const fact of v)
        await expect(page.locator('body')).toContainText(fact);
    },
    hides: async (v) => {
      for (const fact of v)
        await expect(page.locator('body')).not.toContainText(fact);
    },
    noBar: () => expect(bar).toHaveCount(0),
    oneError: async (fact) => {
      const { open } = await top();
      const alerts = (open ? inspect : page).getByRole('alert');
      await expect(alerts).toHaveCount(1);
      await expect(alerts).toContainText(fact);
    },
    noError: async () => {
      const { open } = await top();
      await expect((open ? inspect : page).getByRole('alert')).toHaveCount(0);
    },
  };
  /** One expectation; `last` (or naming an action) also checks every action offered is named. */
  const check = async (e, last = false) => {
    for (const kind of Object.keys(e))
      if (!expectations[kind]) throw new Error(`no such expectation: ${kind}`);
    if (last || 'enabled' in e || 'disabled' in e || 'absent' in e)
      await expect
        .poll(offered, { message: 'the actions offered' })
        .toEqual([...(e.enabled ?? []), ...(e.disabled ?? [])].sort());
    for (const [kind, v] of Object.entries(e)) await expectations[kind](v);
  };

  const steps = {
    press: async (name) => {
      const found = await action(name);
      await expect(found, `${name} is offered`).toHaveCount(1);
      await expect.poll(() => found.isEnabled(), { message: name }).toBe(true);
      await found.click();
    },
    choose: async ({ select, option }) => {
      const found = await action(select);
      await expect(found, `${select} is offered`).toHaveCount(1);
      await found.click();
      const options = page.getByRole('option');
      await expect(options.first()).toBeVisible();
      await (await pick(options, option)).click();
      await expect(page.getByRole('listbox')).toHaveCount(0);
    },
    confirm: async () => {
      await confirmation
        .getByRole('button')
        .filter({ hasNotText: /^Cancel$/ })
        .click();
      await expect(confirmation).toHaveCount(0);
    },
    cancel: async () => {
      await confirmation
        .getByRole('button', { name: 'Cancel', exact: true })
        .click();
      await expect(confirmation).toHaveCount(0);
    },
    type: async ({ field, text }) => {
      if (!FIELD_ACTIONS[field]) throw new Error(`no such field: ${field}`);
      await (await action(FIELD_ACTIONS[field])).fill(text);
    },
    escape: async (field) => {
      if (!FIELD_ACTIONS[field]) throw new Error(`no such field: ${field}`);
      await (await action(FIELD_ACTIONS[field])).press('Escape');
    },
    point: async (layer) => {
      await expect(preview, 'the preview').toHaveCount(1);
      const box = await boxOf(layerIn(layer));
      if (!box) throw new Error(`no ${layer} in the preview`);
      const inside = [];
      for (const l of inspection?.layers ?? [])
        if (within(inspection.layers, l.name, layer)) {
          const b = await boxOf(layerIn(l.name));
          if (b?.width && b?.height) inside.push(b);
        }
      const at = pointIn(box, inside);
      if (!at) throw new Error(`no point of ${layer} is its own`);
      await page.mouse.click(at.x, at.y);
    },
    event: async (event) => service.emit(event),
    setStatus: async (status) => {
      service.status = status;
    },
    release: async (route) => service.release(route),
    expect: (e) => check(e),
  };
  const step = async (s) => {
    const [[kind, v], ...more] = Object.entries(s);
    if (more.length || !steps[kind])
      throw new Error(`no such step: ${JSON.stringify(s)}`);
    await steps[kind](v);
    await settle(page, service);
  };
  return { check, step };
}

let errors = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  await servePages(page);
  page.on('pageerror', (e) => errors.push(e));
});

test.afterEach(async ({ page }) => {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  expect(errors).toEqual([]);
});

for (const scenario of scenariosFor('web')) {
  test(scenario.name, async ({ page }) => {
    const service = fakeService(scenario.fake);
    // After servePages: the later route answers first.
    await page.route('http://solar.test/service/**', service.route);
    const component = scenario.fake.component ?? 'Button';
    const { check, step } = driver(
      page,
      service,
      component,
      scenario.fake.inspection,
    );
    // The Playground's values the bar is given, in the page's query.
    const controls = encodeURIComponent(
      JSON.stringify(scenario.fake.controls ?? {}),
    );
    await page.goto(
      `http://solar.test/workbench-scenario.html?controls=${controls}#${encodeURIComponent(component)}`,
    );
    await page.locator('#ready').waitFor();
    await settle(page, service);
    for (const s of scenario.steps ?? []) await step(s);
    await check(scenario.expect ?? {}, true);
    expect(service.problems).toEqual([]);
  });
}
