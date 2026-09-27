/**
 * The workbench bar's shared scenarios (codegen/src/workbench/bar-scenarios.json), which
 * Widgetbook's bar runs too (widgetbook/test/workbench_scenarios_test.dart): one test each, against
 * Storybook's bar (stories/workbench/Bar.tsx) with its real HTTP client, the page's requests
 * answered here as the scenario's fake service. A step, an expectation or a fake's key this driver
 * does not know fails the scenario, as does a control in the bar the vocabulary does not name. What
 * is the web's own (pointing at a layer, the focus) is workbench.spec.mjs.
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
const SELECTS = new Set(['Set to', 'Scope', 'Variant', 'Layer']);
/** The text fields, by action: the pending edit's reason, Report's note, and Send to agent's. */
const FIELDS = { Reason: /^Why/, Note: /^Note/, 'Agent note': /^Agent note/ };
const FIELD_ACTIONS = {
  reason: 'Reason',
  note: 'Note',
  agentNote: 'Agent note',
};

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));

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
          body: { ...fake.inspection, variant: asked.variant },
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

/** The driver: the scenario's steps and expectations, as Playwright's actions and assertions. */
function driver(page, service) {
  const bar = page.getByRole('region', { name: 'Workbench', exact: true });
  const action = (name) =>
    SELECTS.has(name)
      ? bar.getByRole('combobox', { name: new RegExp(`^${escape(name)}`) })
      : name in FIELDS
        ? bar.getByRole('textbox', { name: FIELDS[name] })
        : bar.getByRole('button', { name, exact: true });
  const dialog = page.getByRole('alertdialog');

  /**
   * The actions the bar offers, by the vocabulary's names; a control no name finds is listed as
   * `unknown: <its words>`.
   */
  const offered = async () => {
    const names = [];
    let known = 0;
    for (const name of [...ACTIONS, ...OWN]) {
      const n = await action(name).count();
      known += n;
      if (n && !OWN.includes(name)) names.push(name);
    }
    const controls = [
      'button',
      'combobox',
      'textbox',
      'checkbox',
      'radio',
      'switch',
      'slider',
      'link',
    ]
      .map((role) => bar.getByRole(role))
      .reduce((all, one) => all.or(one));
    const words = await controls.evaluateAll((els) =>
      els.map((e) => e.getAttribute('aria-label') ?? e.textContent ?? ''),
    );
    if (words.length !== known) names.push(`unknown: ${JSON.stringify(words)}`);
    return names.sort();
  };
  const each = async (names, check) => {
    for (const name of names) {
      const found = action(name);
      await expect(found, `${name} is offered`).not.toHaveCount(0);
      for (let i = 0; i < (await found.count()); i += 1)
        await check(expect(found.nth(i), name));
    }
  };

  const expectations = {
    calls: (v) => expect.poll(() => service.calls).toEqual(v),
    reads: (v) => expect.poll(() => service.reads).toEqual(v),
    enabled: (v) => each(v, (e) => e.toBeEnabled()),
    disabled: (v) => each(v, (e) => e.toBeDisabled()),
    absent: async (v) => {
      for (const name of v) await expect(action(name), name).toHaveCount(0);
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
      await expect(page.getByRole('alert')).toHaveCount(1);
      await expect(page.getByRole('alert')).toContainText(fact);
    },
    noError: () => expect(page.getByRole('alert')).toHaveCount(0),
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
      await expect(action(name), name).toBeEnabled();
      await action(name).click();
    },
    choose: async ({ select, option }) => {
      await action(select).click();
      const found = page.getByRole('option', {
        name: new RegExp(escape(option)),
      });
      await expect(found, `one option ${option}`).toHaveCount(1);
      await found.click();
      await expect(page.getByRole('listbox')).toHaveCount(0);
    },
    confirm: async () => {
      await dialog
        .getByRole('button')
        .filter({ hasNotText: /^Cancel$/ })
        .click();
      await expect(dialog).toHaveCount(0);
    },
    cancel: async () => {
      await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
      await expect(dialog).toHaveCount(0);
    },
    type: async ({ field, text }) => {
      if (!FIELD_ACTIONS[field]) throw new Error(`no such field: ${field}`);
      await action(FIELD_ACTIONS[field]).fill(text);
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
    const { check, step } = driver(page, service);
    // The Playground's values the bar is given, in the page's query.
    const controls = encodeURIComponent(
      JSON.stringify(scenario.fake.controls ?? {}),
    );
    await page.goto(
      `http://solar.test/workbench-scenario.html?controls=${controls}`,
    );
    await page.locator('#ready').waitFor();
    await settle(page, service);
    for (const s of scenario.steps ?? []) await step(s);
    await check(scenario.expect ?? {}, true);
    expect(service.problems).toEqual([]);
  });
}
