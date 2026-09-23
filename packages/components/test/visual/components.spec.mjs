/**
 * Web visual parity: every variant of every generated component, rendered by the real React
 * component in Chromium, measured with getComputedStyle, and compared with what Figma draws
 * (spec/verify/<name>.json). A state is reached the way a user reaches it -- the pointer over the
 * control, the button held down, focus by keyboard -- so MUI sets its own classes and the recipe is
 * tested through them, not around them. A state that is a prop (disabled, loading) is the case's
 * props, from the oracle.
 *
 * Generic over the components: how each is rendered is its case module (`cases/`), where each layer
 * is comes from the emitter's slot table, and a composed child (Button's Spinner) is checked against
 * its own oracle, in the variant the parent's oracle names.
 *
 * An entry the oracle excuses (an open finding, an overlay decision) is not compared; it is written
 * to the gap report instead, `.out/<name>-gaps.json`, so the difference stays visible.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import {
  MUI_SLOTS,
  MUI_SVG_LAYERS,
  STATE_SELECTORS,
} from '../../../codegen/src/emit/mui-component.mjs';
import { COMPONENTS, fileOf } from '../../../codegen/src/stages/components.mjs';
import { compareLayer, matches } from './compare.mjs';

const repo = (path) =>
  fileURLToPath(new URL(`../../../../${path}`, import.meta.url));
const load = (path) => JSON.parse(readFileSync(repo(path), 'utf8'));
const out = (path) => fileURLToPath(new URL(`.out/${path}`, import.meta.url));

const oracles = Object.fromEntries(
  COMPONENTS.map((c) => [c, load(`spec/verify/${fileOf(c)}`)]),
);

/** As `cases/index.ts` spells a component in `data-case`. */
const slug = (component) => component.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// Measuring, not animating: the recipe's end state, not a frame of MUI's transition to it.
const STILL =
  '*, *::before, *::after { transition: none !important; animation-play-state: paused !important; }';

/** Where each layer is, from the emitter's own slot table: `&` is the component's root. */
function targets(component) {
  const svg = new Set(MUI_SVG_LAYERS[component] ?? []);
  return Object.entries(MUI_SLOTS[component]).map(([layer, selector]) => ({
    layer,
    selector: selector === '&' ? null : selector.replace(/^& /, ''),
    svg: svg.has(layer),
  }));
}

/**
 * The layers of `component` that are other generated components (Button's spinner), with where the
 * child's layers are: its root is the first element in the parent's slot.
 */
function children(component) {
  const oracle = oracles[component];
  const out = {};
  for (const v of oracle.variants)
    for (const [layer, e] of Object.entries(v.layers))
      if (e.component && oracles[e.component])
        out[layer] = {
          component: e.component,
          selector: targets(component).find((t) => t.layer === layer).selector,
          list: targets(e.component),
        };
  return out;
}

/**
 * Runs in the page: the computed values of each target inside `root`, and of each composed child's
 * targets inside the child, under `children`.
 */
function measure(root, { list, composed }) {
  const px = (v) => v;
  const within = (at, targets) =>
    Object.fromEntries(targets.map((t) => [t.layer, one(at, t)]));
  const one = (at, { selector, svg }) => {
    const el = selector ? at.querySelector(selector) : at;
    if (!el) return null;
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    const values = svg
      ? {
          background: cs.fill,
          borderColor: cs.stroke,
          borderWidth: cs.strokeWidth,
        }
      : {
          background: cs.backgroundColor,
          borderColor: cs.borderTopColor,
          borderWidth: cs.borderTopStyle === 'none' ? '0px' : cs.borderTopWidth,
          radius: cs.borderTopLeftRadius,
          shadow: cs.boxShadow,
          paddingTop: cs.paddingTop,
          paddingRight: cs.paddingRight,
          paddingBottom: cs.paddingBottom,
          paddingLeft: cs.paddingLeft,
          gap: cs.columnGap,
        };
    return {
      ...values,
      color: cs.color,
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight,
      fontSize: px(cs.fontSize),
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      textDecoration: cs.textDecorationLine,
      width: box.width,
      height: box.height,
      drawn:
        box.width > 0 && cs.visibility !== 'hidden' && cs.display !== 'none',
    };
  };
  const out = within(root, list);
  for (const [layer, c] of Object.entries(composed)) {
    const slot = c.selector ? root.querySelector(c.selector) : root;
    const child = slot?.firstElementChild;
    out[layer] = child ? { drawn: true, layers: within(child, c.list) } : null;
  }
  return out;
}

/** Puts the control into a platform state as a user would. Returns how to leave it. */
async function reach(page, control, state) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.activeElement?.blur());
  if (state === 'hover') await control.hover();
  if (state === 'pressed') {
    await control.hover();
    await page.mouse.down();
    return () => page.mouse.up();
  }
  if (state === 'focus') {
    // A key first, so the browser (and MUI with it) treats the focus as keyboard focus.
    await page.keyboard.press('Shift');
    await control.focus();
  }
  return async () => {};
}

const TYPES = {
  html: 'text/html',
  js: 'text/javascript',
  css: 'text/css',
  woff2: 'font/woff2',
  woff: 'font/woff',
};

async function open(page) {
  // Served, not opened from disk: Chromium refuses module scripts from file:// URLs.
  await page.route('http://solar.test/**', (route) => {
    const path =
      new URL(route.request().url()).pathname.slice(1) || 'index.html';
    route.fulfill({
      body: readFileSync(out(path)),
      contentType: TYPES[path.split('.').pop()] ?? 'application/octet-stream',
    });
  });
  page.on('pageerror', (e) => {
    throw e;
  });
  await page.goto('http://solar.test/index.html');
  await page.addStyleTag({ content: STILL });
  await page.locator('[data-case]').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
}

/**
 * Every variant of `component`, measured and compared. `only` limits it to some variants, for the
 * self-check below.
 */
async function check(page, component, { only } = {}) {
  const oracle = oracles[component];
  const list = targets(component);
  const composed = children(component);
  // Where the table marks focus with a class (MUI's focus-visible), the state is proven reached.
  const focusClass = /^&\.([\w-]+)/.exec(
    STATE_SELECTORS[component]?.focus ?? '',
  )?.[1];
  const failures = [];
  const gaps = [];
  for (const [i, variant] of oracle.variants.entries()) {
    if (only && !only.includes(variant.figma)) continue;
    const kase = page.locator(`[data-case="${slug(component)}-${i}"]`);
    // The component's root: Button's <button>, Spinner's box.
    const control = kase.locator(':scope > *').first();
    const leave = await reach(page, control, variant.state);
    if (variant.state === 'focus' && focusClass)
      await expect(control, `${variant.figma}: keyboard focus`).toHaveClass(
        new RegExp(focusClass),
      );
    const rendered = await control.evaluate(measure, { list, composed });
    await leave();

    const fail = (layer, f) =>
      failures.push({ variant: variant.figma, layer, ...f });
    for (const [layer, expected] of Object.entries(variant.layers)) {
      const got = rendered[layer];
      // Shown by a prop (hidden at rest in Figma): measured whenever it is rendered. Hidden only
      // in this variant: the state removes it, so it must not be drawn.
      const byProp =
        layer in oracle.slots && oracle.variants[0].layers[layer]?.hidden;
      if (expected.hidden && !byProp) {
        // A text layer MUI renders in the root itself (Button's label) is hidden by its colour.
        const inRoot =
          layer !== 'root' &&
          !composed[layer] &&
          list.find((t) => t.layer === layer)?.selector === null;
        const drawn = inRoot
          ? got && !matches('color', 'transparent', got.color)
          : Boolean(got?.drawn);
        if (drawn)
          fail(layer, { property: 'hidden', figma: true, rendered: false });
        continue;
      }
      if (composed[layer]) {
        if (!expected.hidden) checkChild(expected, got, (f) => fail(layer, f));
        continue;
      }
      if (!got) {
        fail(layer, { property: 'present', figma: true, rendered: false });
        continue;
      }
      const excused = (variant.excused ?? []).filter((e) => e.layer === layer);
      const result = compareLayer(expected, got, excused);
      for (const f of result.failures) fail(layer, f);
      for (const g of result.gaps)
        gaps.push({ variant: variant.figma, layer, ...g });
    }
  }
  return { failures, gaps };
}

/** The child oracle's variant a parent's layer names: every axis it gives, by Figma's spelling. */
function childVariant(oracle, wanted) {
  const found = oracle.variants.find((v) => {
    const axes = Object.fromEntries(
      v.figma.split(', ').map((p) => p.split('=')),
    );
    return Object.entries(wanted).every(([a, value]) => axes[a] === value);
  });
  if (!found)
    throw new Error(
      `${oracle.component} has no variant ${JSON.stringify(wanted)}`,
    );
  return found;
}

/**
 * A composed child (Button's spinner) is the child component in the variant Figma picks; what that
 * variant looks like is the child's oracle, so the two are checked together, layer by layer. What
 * the child's oracle excuses is not compared: the child's own check reports it.
 */
function checkChild(expected, got, fail) {
  if (!got) return fail({ property: 'present', figma: true, rendered: false });
  const child = childVariant(oracles[expected.component], expected.variant);
  for (const [layer, want] of Object.entries(child.layers)) {
    if (want.hidden) continue;
    const excused = (child.excused ?? []).filter((e) => e.layer === layer);
    const measured = got.layers[layer];
    if (!measured) {
      fail({ property: `${layer}.present`, figma: true, rendered: false });
      continue;
    }
    for (const f of compareLayer(want, measured, excused).failures)
      fail({ ...f, property: `${layer}.${f.property}` });
  }
}

const report = (component, gaps) =>
  writeFileSync(
    out(`${component.toLowerCase()}-gaps.json`),
    `${JSON.stringify(gaps, null, 2)}\n`,
  );

for (const component of COMPONENTS)
  test(`${component} draws what Figma draws, in every variant`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await open(page);
    // A component the codegen generates and the page does not render would pass by measuring
    // nothing.
    expect(
      await page.locator(`[data-case^="${slug(component)}-"]`).count(),
      `${component}: one case per oracle variant; register cases/${slug(component)}.tsx in cases/index.ts`,
    ).toBe(oracles[component].variants.length);
    const { failures, gaps } = await check(page, component);
    report(component, gaps);
    writeFileSync(
      out(`${component.toLowerCase()}-failures.json`),
      `${JSON.stringify(failures, null, 2)}\n`,
    );
    expect(failures).toEqual([]);
    // Every excused entry was reached and measured.
    expect(gaps).toHaveLength(
      oracles[component].variants.reduce(
        (n, v) => n + (v.excused?.length ?? 0),
        0,
      ),
    );
  });

test('a difference nobody decided on fails, naming the variant and the property', async ({
  page,
}) => {
  await open(page);
  const hovered = 'size=md, prio=secondary, state=hover, danger=false';
  const i = oracles.Button.variants.findIndex((v) => v.figma === hovered);
  // A recipe that drew secondary hover in the wrong colour.
  await page.addStyleTag({
    content: `[data-case="button-${i}"] button:hover { background-color: rgb(255, 0, 0) !important; }`,
  });
  const { failures } = await check(page, 'Button', { only: [hovered] });
  expect(failures).toEqual([
    expect.objectContaining({
      variant: hovered,
      layer: 'root',
      property: 'background',
      rendered: 'rgb(255, 0, 0)',
    }),
  ]);
});

test('a composed child is checked against its own oracle, naming the layer inside it', async ({
  page,
}) => {
  await open(page);
  const loading = 'size=md, prio=primary, state=loading, danger=false';
  const i = oracles.Button.variants.findIndex((v) => v.figma === loading);
  // A Button whose Spinner drew its track in the wrong colour.
  await page.addStyleTag({
    content: `[data-case="button-${i}"] .MuiCircularProgress-track { stroke: rgb(255, 0, 0) !important; }`,
  });
  const { failures } = await check(page, 'Button', { only: [loading] });
  expect(failures).toEqual([
    expect.objectContaining({
      variant: loading,
      layer: 'spinner',
      property: 'track.borderColor',
      rendered: 'rgb(255, 0, 0)',
    }),
  ]);
});
