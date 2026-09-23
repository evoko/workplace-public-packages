/**
 * Web visual parity: every variant of every generated component, rendered by the real React
 * component in Chromium, measured with getComputedStyle, and compared with what Figma draws
 * (spec/verify/<name>.json). A state is reached the way a user reaches it -- the pointer over the
 * control, the button held down, focus by keyboard -- so MUI sets its own classes and the recipe is
 * tested through them, not around them.
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
} from '../../../codegen/src/emit/mui-component.mjs';
import { compareLayer, matches } from './compare.mjs';

const repo = (path) =>
  fileURLToPath(new URL(`../../../../${path}`, import.meta.url));
const load = (path) => JSON.parse(readFileSync(repo(path), 'utf8'));
const out = (path) => fileURLToPath(new URL(`.out/${path}`, import.meta.url));

const oracles = {
  Button: load('spec/verify/button.json'),
  Spinner: load('spec/verify/spinner.json'),
};

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

/** Runs in the page: the computed values of each target inside `root`. */
function measure(root, list) {
  const px = (v) => v;
  return Object.fromEntries(
    list.map(({ layer, selector, svg }) => {
      const el = selector ? root.querySelector(selector) : root;
      if (!el) return [layer, null];
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
            borderWidth:
              cs.borderTopStyle === 'none' ? '0px' : cs.borderTopWidth,
            radius: cs.borderTopLeftRadius,
            shadow: cs.boxShadow,
            paddingTop: cs.paddingTop,
            paddingRight: cs.paddingRight,
            paddingBottom: cs.paddingBottom,
            paddingLeft: cs.paddingLeft,
            gap: cs.columnGap,
          };
      return [
        layer,
        {
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
            box.width > 0 &&
            cs.visibility !== 'hidden' &&
            cs.display !== 'none',
        },
      ];
    }),
  );
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
  const failures = [];
  const gaps = [];
  for (const [i, variant] of oracle.variants.entries()) {
    if (only && !only.includes(variant.figma)) continue;
    const kase = page.locator(`[data-case="${component.toLowerCase()}-${i}"]`);
    // The component's root: Button's <button>, Spinner's box.
    const control = kase.locator(':scope > *').first();
    const leave = await reach(page, control, variant.state);
    if (variant.state === 'focus')
      await expect(control, `${variant.figma}: keyboard focus`).toHaveClass(
        /Mui-focusVisible/,
      );
    const rendered = await control.evaluate(measure, list);
    const composed =
      component === 'Button' ? await measureSpinner(control) : null;
    await leave();

    const fail = (layer, f) =>
      failures.push({ variant: variant.figma, layer, ...f });
    for (const [layer, expected] of Object.entries(variant.layers)) {
      const got = rendered[layer];
      // Shown by a prop (hidden at rest in Figma): measured whenever it is rendered. Hidden only
      // in this variant: the state removes it, so it must not be drawn.
      const byProp = oracle.variants[0].layers[layer]?.hidden;
      if (expected.hidden && !byProp) {
        const drawn =
          layer === 'label'
            ? got && !matches('color', 'transparent', got.color)
            : Boolean(got?.drawn);
        if (drawn)
          fail(layer, { property: 'hidden', figma: true, rendered: false });
        continue;
      }
      if (layer === 'spinner') {
        if (!expected.hidden)
          checkSpinner(expected, composed, (f) => fail(layer, f));
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

/** The Spinner a loading Button draws: its ring's box and its two strokes. */
async function measureSpinner(control) {
  return control.evaluate((root) => {
    const box = root.querySelector('.MuiButton-loadingIndicator .MuiBox-root');
    if (!box) return null;
    const stroke = (sel) => getComputedStyle(box.querySelector(sel)).stroke;
    const r = box.getBoundingClientRect();
    return {
      width: r.width,
      height: r.height,
      track: stroke('.MuiCircularProgress-track'),
      indicator: stroke('.MuiCircularProgress-circle'),
    };
  });
}

/**
 * Button's spinner is a Spinner in the variant Figma picks; what that variant looks like is the
 * Spinner oracle's, so the two oracles are checked together.
 */
function checkSpinner(expected, got, fail) {
  if (!got) return fail({ property: 'present', figma: true, rendered: false });
  const { size, style } = expected.variant;
  const spinner = oracles.Spinner.variants.find(
    (v) => v.figma === `size=${size}, style=${style}`,
  );
  const ring = spinner.layers.spinnerRing;
  for (const property of ['width', 'height'])
    if (!matches(property, ring[property], got[property]))
      fail({ property, figma: ring[property], rendered: got[property] });
  for (const layer of ['track', 'indicator']) {
    const figma = spinner.layers[layer].borderColor;
    // Unreadable in Figma (the default indicator); the Spinner check reports that gap.
    if (figma === null) continue;
    if (!matches('color', figma, got[layer]))
      fail({ property: `${layer}.stroke`, figma, rendered: got[layer] });
  }
}

const report = (component, gaps) =>
  writeFileSync(
    out(`${component.toLowerCase()}-gaps.json`),
    `${JSON.stringify(gaps, null, 2)}\n`,
  );

for (const component of Object.keys(oracles))
  test(`${component} draws what Figma draws, in every variant`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await open(page);
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
