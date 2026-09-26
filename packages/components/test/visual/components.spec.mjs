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
  MUI_SVG_LAYERS,
  STATE_SELECTORS,
  slotsOf,
} from '../../../codegen/src/emit/mui-component.mjs';
import {
  NAMES as ALL,
  fileOf,
  library,
} from '../../../codegen/src/stages/components.mjs';
import { solarMuiThemeDecisions } from '../../../styles/src/generated/mui/theme-components.ts';
import {
  byPrefix,
  withLayerClasses,
} from '../../../codegen/src/util/classes.mjs';
import {
  solarTokens,
  solarTypography,
} from '../../../styles/src/generated/tokens.ts';
import { compareLayer, matches, rgba } from './compare.mjs';

const repo = (path) =>
  fileURLToPath(new URL(`../../../../${path}`, import.meta.url));
const load = (path) => JSON.parse(readFileSync(repo(path), 'utf8'));
const out = (path) => fileURLToPath(new URL(`.out/${path}`, import.meta.url));

// A component a chart library draws has an oracle and no case: its plot is Figma's sample, which
// no per-variant check applies to (the chart theme's own test stands for it).
const NAMES = ALL.filter((c) => !library(c));
const oracles = Object.fromEntries(
  NAMES.map((c) => [c, load(`spec/verify/${fileOf(c)}`)]),
);
// Each layer's parent, for a position measured from the parent's edge, as Figma's is.
const specs = Object.fromEntries(
  NAMES.map((c) => [c, load(`spec/components/${fileOf(c)}`)]),
);
// A state table names a layer's class by the layer; the page carries its own (util/classes.mjs).
const layerClasses = byPrefix(Object.values(specs));

/** As `cases/index.ts` spells a component in `data-case`. */
const slug = (component) => component.toLowerCase().replace(/[^a-z0-9]+/g, '-');

// Measuring, not animating: the recipe's end state, not a frame of MUI's transition to it.
const STILL =
  '*, *::before, *::after { transition: none !important; animation-play-state: paused !important; }';

/**
 * Where each layer is, from the emitter's own slot table: `&` is the component's root. A case may
 * mark a layer's element with `data-layer` instead, where the slot table names several layers with
 * one selector (Button Group's buttons are all `& > *`).
 */
function targets(component, moved = {}) {
  const svg = new Set(MUI_SVG_LAYERS[component] ?? []);
  return Object.entries({
    ...slotsOf(specs[component]),
    // Where a layer is in a stock MUI component's own markup (spec/overlay/mui-theme.yaml).
    ...moved,
  }).map(([layer, selector]) => ({
    layer,
    selector: selector === '&' ? null : selector.replace(/^&\s*/, ':scope '),
    svg: svg.has(layer),
    parent: specs[component]?.layers[layer]?.parent ?? null,
  }));
}

/**
 * The mode a check measures in. In Dark, a variant is its Light entry with its `dark` over it: the
 * layers' values Dark draws otherwise (a token's Dark value), and its excuses where they differ.
 */
let mode = 'light';
const inMode = (v) =>
  mode === 'dark' && v?.dark
    ? {
        ...v,
        layers: Object.fromEntries(
          Object.entries(v.layers).map(([layer, e]) => [
            layer,
            { ...e, ...(v.dark.layers?.[layer] ?? {}) },
          ]),
        ),
        excused: v.dark.excused ?? v.excused,
      }
    : v;

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
          parent: specs[component]?.layers[layer]?.parent ?? null,
        };
  return out;
}

/**
 * Runs in the page: the computed values of each target inside `root`, and of each composed child's
 * targets inside the child, under `children`.
 */
function measure(root, { list, composed }) {
  const px = (v) => v;
  // A layer's place, from its parent layer's outer edge to its own, as Figma measures it.
  const within = (at, targets) => {
    const got = Object.fromEntries(targets.map((t) => [t.layer, one(at, t)]));
    for (const t of targets) {
      const own = got[t.layer];
      const parent = t.parent && got[t.parent];
      if (!own || !parent) continue;
      own.x = own.left - parent.left;
      own.y = own.top - parent.top;
      // From the far edges too, for a layer pinned to them (placementOf).
      own.right = parent.left + parent.width - (own.left + own.width);
      own.bottom = parent.top + parent.height - (own.top + own.height);
      // And from its centre, for a layer pinned to the parent's (a Tooltip's arrow).
      own.centerX = own.left + own.width / 2 - (parent.left + parent.width / 2);
      own.centerY = own.top + own.height / 2 - (parent.top + parent.height / 2);
    }
    // Its rank among the siblings its parent lays out, by where each falls along the parent's
    // axis, for a layer whose variants lay them out in different orders (a Popover's tip).
    for (const t of targets) {
      const own = got[t.layer];
      const parent = t.parent && got[t.parent];
      if (!own?.flows || !own.drawn || !parent) continue;
      const along = parent.direction.startsWith('row') ? 'left' : 'top';
      own.order = targets.filter((s) => {
        const sib = got[s.layer];
        return (
          s.parent === t.parent &&
          sib !== own &&
          sib?.flows &&
          sib.drawn &&
          sib[along] < own[along]
        );
      }).length;
    }
    return got;
  };
  // A layer of `at`'s own is never one of a composed child's (an Accordion's header, the collapsed
  // Accordion drawn in the expanded one, has a title of its own).
  const inChild = (el, at) => {
    for (let e = el.parentElement; e && e !== at; e = e.parentElement)
      if (e.hasAttribute('data-layer')) return true;
    return false;
  };
  const one = (at, { layer, selector, svg }) => {
    const el =
      at.querySelector(`:scope [data-layer="${layer}"]`) ??
      (selector
        ? ([...at.querySelectorAll(selector)].find((e) => !inChild(e, at)) ??
          null)
        : at);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    // An SVG shape paints with fill and stroke: the control's own (Spinner's), or a glyph the shell
    // draws as SVG in this variant (StatusIndicator's marks).
    const values =
      svg || el.namespaceURI === 'http://www.w3.org/2000/svg'
        ? {
            background: cs.fill,
            borderColor: cs.stroke,
            borderWidth: cs.strokeWidth,
          }
        : {
            // A layer painted with a gradient (Table's fade) shows it over its colour.
            background: cs.backgroundImage.startsWith('linear-gradient(')
              ? cs.backgroundImage
              : cs.backgroundColor,
            borderColor: cs.borderTopColor,
            borderWidth:
              cs.borderTopStyle === 'none' ? '0px' : cs.borderTopWidth,
            ...Object.fromEntries(
              ['Top', 'Right', 'Bottom', 'Left'].map((side) => [
                `border${side}Width`,
                cs[`border${side}Style`] === 'none'
                  ? '0px'
                  : cs[`border${side}Width`],
              ]),
            ),
            radius: cs.borderTopLeftRadius,
            ...Object.fromEntries(
              ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map(
                (corner) => [`radius${corner}`, cs[`border${corner}Radius`]],
              ),
            ),
            shadow: cs.boxShadow,
            // Whether its edge is dashed: CSS draws its own dashes, whose lengths it picks.
            borderDash: ['Top', 'Right', 'Bottom', 'Left'].some(
              (side) => cs[`border${side}Style`] === 'dashed',
            ),
            paddingTop: cs.paddingTop,
            paddingRight: cs.paddingRight,
            paddingBottom: cs.paddingBottom,
            paddingLeft: cs.paddingLeft,
            gap: cs.columnGap,
          };
    return {
      ...values,
      opacity: cs.opacity,
      color: cs.color,
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight,
      fontSize: px(cs.fontSize),
      lineHeight: cs.lineHeight,
      letterSpacing: cs.letterSpacing,
      textDecoration: cs.textDecorationLine,
      // Whether it shows any words: its own, or a field's value or placeholder.
      words:
        Boolean((el.innerText ?? el.textContent ?? '').trim()) ||
        [el, ...el.querySelectorAll('input, textarea')].some((f) =>
          Boolean((f.value || f.placeholder || '').trim()),
        ),
      width: box.width,
      height: box.height,
      left: box.left,
      top: box.top,
      drawn:
        box.width > 0 && cs.visibility !== 'hidden' && cs.display !== 'none',
      // Whether its parent's layout places it, and which way it lays out its own children.
      flows: cs.position !== 'absolute' && cs.position !== 'fixed',
      direction: cs.flexDirection,
    };
  };
  const out = within(root, list);
  for (const [layer, c] of Object.entries(composed)) {
    // A child the case marks is the child itself; otherwise it is the first element in its slot.
    const child =
      root.querySelector(`:scope [data-layer="${layer}"]`) ??
      (c.selector ? root.querySelector(c.selector) : root)?.firstElementChild;
    out[layer] = child ? { drawn: true, layers: within(child, c.list) } : null;
    // Its place, from the parent's layer, as any layer's (Text Area's buttons, in its field).
    const own = out[layer]?.layers.root;
    const parent = c.parent && out[c.parent];
    if (own && parent) {
      own.x = own.left - parent.left;
      own.y = own.top - parent.top;
      own.right = parent.left + parent.width - (own.left + own.width);
      own.bottom = parent.top + parent.height - (own.top + own.height);
      own.centerX = own.left + own.width / 2 - (parent.left + parent.width / 2);
      own.centerY = own.top + own.height / 2 - (parent.top + parent.height / 2);
    }
  }
  return out;
}

/** Puts the control into a platform state as a user would. Returns how to leave it. */
async function reach(page, control, state, component) {
  await page.mouse.move(0, 0);
  await page.evaluate(() => document.activeElement?.blur());
  // Hovered where the recipe says it is: the part its hover names (a PIN Input's cells, a Text
  // Input's field), or the whole.
  const part = /^&:has\((\.[\w-]+):hover\)$/.exec(
    withLayerClasses(STATE_SELECTORS[component]?.hover ?? '', layerClasses),
  )?.[1];
  if (state === 'hover')
    await (part ? control.locator(part).first() : control).hover();
  if (state === 'pressed') {
    await control.hover();
    await page.mouse.down();
    return () => page.mouse.up();
  }
  if (state === 'focus') {
    // A key first, so the browser (and MUI with it) treats the focus as keyboard focus.
    await page.keyboard.press('Shift');
    // The control's first focusable part, as Tab reaches it: the control itself, or, for a group
    // of buttons (SplitButton's halves), the first of them.
    // One taken out of the tab order (a stepper's button, tabindex -1) is not reached by Tab. A
    // field's focus is its input's, where it has one: the words it types in, not a Tag's close
    // button before them (Token Input's).
    await control.evaluate((el) => {
      const tabbable =
        ':is(button, a[href], input, textarea, [tabindex]):not([tabindex="-1"])';
      const words =
        ':is(input, textarea):not([type="hidden"], [tabindex="-1"])';
      (el.matches(tabbable)
        ? el
        : (el.querySelector(words) ?? el.querySelector(tabbable))
      )?.focus();
    });
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

async function open(page, hash = '') {
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
  await page.goto(`http://solar.test/index.html${hash}`);
  await page.addStyleTag({ content: STILL });
  await page
    .locator(
      ['#theme', '#app-code'].includes(hash) ? '[data-probe]' : '[data-case]',
    )
    .first()
    .waitFor();
  await page.evaluate(() => document.fonts.ready);
}

/**
 * Every variant of `component`, measured and compared. `only` limits it to some variants, for the
 * self-check below.
 */
async function check(
  page,
  component,
  { only, dark = false, prefix = slug(component), slots = {} } = {},
) {
  mode = dark ? 'dark' : 'light';
  // Dark as the app turns it on: the tokens' Dark values, by the root's data-theme.
  await page.evaluate(
    (on) =>
      on
        ? document.documentElement.setAttribute('data-theme', 'dark')
        : document.documentElement.removeAttribute('data-theme'),
    dark,
  );
  const oracle = oracles[component];
  const list = targets(component, slots);
  const composed = children(component);
  // Where the table marks focus with a class (MUI's focus-visible), the state is proven reached.
  const focusClass = /^&\.([\w-]+)/.exec(
    STATE_SELECTORS[component]?.focus ?? '',
  )?.[1];
  const failures = [];
  const gaps = [];
  for (const [i, entry] of oracle.variants.entries()) {
    const variant = inMode(entry);
    if (only && !only.includes(variant.figma)) continue;
    const kase = page.locator(`[data-case="${prefix}:${i}"]`);
    // A variant the page draws no case for (a stock component's MUI props reach no loading one).
    if (prefix !== slug(component) && (await kase.count()) === 0) continue;
    // The component's root: Button's <button>, Spinner's box; or, where the case holds it in what
    // it always sits in (a Dropdown Item in a menu), the element the case marks as the root.
    const marked = kase.locator('[data-case-root]');
    const control =
      (await marked.count()) > 0
        ? marked.first()
        : kase.locator(':scope > *').first();
    const leave = await reach(page, control, variant.state, component);
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
      const byProp = layer in oracle.slots && hiddenAtRest(oracle, layer);
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
        // Shown by a prop and hidden at rest (Button Group's tertiary): checked when rendered.
        if (!expected.hidden || (byProp && got)) {
          const excused = (variant.excused ?? []).filter(
            (e) => e.layer === layer,
          );
          checkChild(
            expected,
            got,
            excused,
            (f) => fail(layer, f),
            (g) => gaps.push({ variant: variant.figma, layer, ...g }),
          );
        }
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
function childVariant(oracle, wanted = {}) {
  // A standalone child (Pagination's ellipsis) has no variant to name: its one is the one.
  const found = oracle.variants.map(inMode).find((v) => {
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
 * A composed child (Button's spinner, Button Group's buttons) is the child component in the
 * variant Figma picks; what that variant looks like is the child's oracle, so the two are checked
 * together, layer by layer. What the child's oracle excuses is not compared: the child's own check
 * reports it. What the parent's entry holds of the child's root is the parent's to decide: its box
 * (a Button fills a group, whatever width it has alone), and its fill and edge where the parent
 * restyles it (Toast's Tag), so the root is measured against the parent's entry for those, with
 * the parent's excuses.
 */
const NAMING = new Set([
  'component',
  'variant',
  'figmaVariant',
  'hidden',
  'hides',
]);
function checkChild(expected, got, excusedHere, fail, gap) {
  if (!got) return fail({ property: 'present', figma: true, rendered: false });
  const box = Object.fromEntries(
    Object.entries(expected).filter(([p]) => !NAMING.has(p)),
  );
  const own = compareLayer(box, got.layers.root ?? {}, excusedHere);
  own.failures.forEach(fail);
  own.gaps.forEach(gap);
  // Detached in this variant (Card's loading Tag, a plain placeholder where the Tag is): Figma
  // draws a box there, no variant of the child, and its box is all there is to check. So for a
  // child no component of the library draws (Launch Card's App Icon, an asset the caller gives):
  // its box is the parent's, and it has no look of its own to check.
  if (!expected.component || !oracles[expected.component]) return;
  const child = childVariant(oracles[expected.component], expected.variant);
  for (const [layer, want] of Object.entries(child.layers)) {
    if (want.hidden) continue;
    const measured = got.layers[layer];
    // What the instance hides of the child (a Select's rows, their checkbox), it must not draw.
    if (expected.hides?.includes(layer)) {
      if (measured?.drawn)
        fail({ property: `${layer}.hidden`, figma: true, rendered: false });
      continue;
    }
    const excused = (child.excused ?? []).filter((e) => e.layer === layer);
    if (!measured) {
      fail({ property: `${layer}.present`, figma: true, rendered: false });
      continue;
    }
    // The child's box is always the parent's, and so is whatever else the parent's entry holds.
    const parents = (p) => p === 'width' || p === 'height' || p in box;
    const expectedHere =
      layer === 'root'
        ? Object.fromEntries(Object.entries(want).filter(([p]) => !parents(p)))
        : want;
    for (const f of compareLayer(expectedHere, measured, excused).failures)
      fail({ ...f, property: `${layer}.${f.property}` });
  }
}

/**
 * Whether Figma hides a layer at rest, a prop showing it: in the first variant, unless only a
 * choice the oracle makes hides it there (Interactive Card's controls, one drawn at a time).
 */
const hiddenAtRest = (oracle, layer) => {
  const rest = oracle.variants[0].layers[layer];
  return Boolean(rest?.hidden && !rest.unchosen);
};

/** The excused entries a check reaches: those on layers the variant draws, or a prop shows. */
function reachableExcuses(oracle) {
  return oracle.variants
    .map(inMode)
    .reduce(
      (n, v) =>
        n +
        (v.excused ?? []).filter(
          (e) =>
            !v.layers[e.layer]?.hidden ||
            (e.layer in oracle.slots && hiddenAtRest(oracle, e.layer)),
        ).length,
      0,
    );
}

const report = (component, gaps) =>
  writeFileSync(
    out(`${slug(component)}-gaps.json`),
    `${JSON.stringify(gaps, null, 2)}\n`,
  );

for (const component of NAMES)
  for (const dark of [false, true])
    test(`${component} draws what Figma draws${dark ? ' in Dark' : ''}, in every variant`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await open(page);
      // A component the codegen generates and the page does not render would pass by measuring
      // nothing.
      expect(
        await page.locator(`[data-case^="${slug(component)}:"]`).count(),
        `${component}: one case per oracle variant; register cases/${slug(component)}.tsx in cases/index.ts`,
      ).toBe(oracles[component].variants.length);
      const { failures, gaps } = await check(page, component, { dark });
      const named = `${slug(component)}${dark ? '-dark' : ''}`;
      report(dark ? `${component} dark` : component, gaps);
      writeFileSync(
        out(`${named}-failures.json`),
        `${JSON.stringify(failures, null, 2)}\n`,
      );
      expect(failures).toEqual([]);
      // Every excused entry was reached and measured.
      // Every excused entry was reached and measured, but for a layer the variant does not draw.
      expect(gaps).toHaveLength(reachableExcuses(oracles[component]));
      mode = 'light';
    });

test('one attribute turns a stock MUI component and a SOLAR one to Dark together', async ({
  page,
}) => {
  await open(page, '#theme');
  const surfaces = await page.evaluate(() =>
    ['light', 'dark'].map((mode) => {
      const at = document.querySelector(`[data-probe="${mode}"]`);
      const bg = (el) => getComputedStyle(el).backgroundColor;
      return {
        paper: bg(at.querySelector('.MuiPaper-root')),
        card: bg(at.querySelector('[data-part="card"]')),
      };
    }),
  );
  const [light, dark] = surfaces;
  // Each scheme's Paper is the surface SOLAR's Card is drawn on, and Dark's is not Light's.
  expect(light.paper).toBe(light.card);
  expect(dark.paper).toBe(dark.card);
  expect(dark.paper).not.toBe(light.paper);
});

// SOLAR in app code: what an app writes through the MUI theme draws SOLAR's values. A text style as a
// Typography variant, colours as sx palette paths and a translucent one by theme.alpha, in Light and
// in Dark, each against its token (packages/components/README.md, SOLAR in app code).
test('SOLAR written through the MUI theme draws its tokens, in both modes', async ({
  page,
}) => {
  await open(page, '#app-code');
  const drawn = await page.evaluate(() => {
    // Any CSS colour as sRGB [r, g, b, a], through a canvas: theme.alpha's colour computes as
    // oklch(…), which the check's own parser does not read.
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const srgb = (css) => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };
    return ['light', 'dark'].map((mode) => {
      const at = document.querySelector(`[data-probe="${mode}"]`);
      const part = (name) => at.querySelector(`[data-part="${name}"]`);
      const style = (name) => getComputedStyle(part(name));
      const title = style('title');
      return {
        mode,
        title: {
          element: part('title').tagName,
          fontSize: title.fontSize,
          lineHeight: title.lineHeight,
          fontWeight: title.fontWeight,
          letterSpacing: title.letterSpacing,
        },
        colours: {
          'color.surface.raised': srgb(style('raised').backgroundColor),
          'color.text.feedback.danger': srgb(style('raised').color),
          'color.border.subtle': srgb(style('raised').borderTopColor),
          'color.action.primary.bg.default': srgb(
            style('action').backgroundColor,
          ),
        },
        translucent: srgb(style('alpha').backgroundColor),
      };
    });
  });
  const near = (got, want, token) => {
    // Within 2 per channel (a translucent colour is stored premultiplied) and 0.01 of alpha.
    for (const i of [0, 1, 2])
      expect(
        Math.abs(got[i] - want[i]),
        `${token} channel ${i}`,
      ).toBeLessThanOrEqual(2);
    expect(Math.abs(got[3] - want[3]), `${token} alpha`).toBeLessThanOrEqual(
      0.01,
    );
  };
  const type = solarTypography.desktop['title.sm'];
  for (const { mode, title, colours, translucent } of drawn) {
    // The heading element MUI's own h6 has: title.sm is MUI's h6.
    expect(title.element, mode).toBe('H6');
    expect(title.fontSize, mode).toBe(type.fontSize);
    expect(title.lineHeight, mode).toBe(type.lineHeight);
    expect(title.fontWeight, mode).toBe(String(type.fontWeight));
    expect(parseFloat(title.letterSpacing), mode).toBeCloseTo(
      parseFloat(type.letterSpacing) * parseFloat(type.fontSize),
      1,
    );
    for (const [token, got] of Object.entries(colours))
      near(got, rgba(solarTokens[mode][token]), `${mode} ${token}`);
    const info = rgba(solarTokens[mode]['color.surface.feedback.info.strong']);
    near(
      translucent,
      [...info.slice(0, 3), 0.3],
      `${mode} theme.alpha(info.strong, 0.3)`,
    );
  }
});

// Stock MUI components under the SOLAR theme, each measured against the oracle of the SOLAR
// component whose recipe the theme gives it (spec/overlay/mui-theme.yaml): an app's own MUI Button
// draws what Figma draws, as @bwp-web/components' Button does.
for (const [key, component] of [
  ['MuiButton', 'Button'],
  ['MuiIconButton', 'Icon Button'],
])
  for (const dark of [false, true])
    test(`a stock ${key} under the SOLAR theme draws what Figma draws${dark ? ' in Dark' : ''}`, async ({
      page,
    }) => {
      test.setTimeout(120_000);
      await open(page, '#stock');
      const prefix = `stock-${slug(component)}`;
      expect(
        await page.locator(`[data-case^="${prefix}:"]`).count(),
        `${key}: cases on the #stock page`,
      ).toBeGreaterThan(0);
      const { failures } = await check(page, component, {
        dark,
        prefix,
        slots: solarMuiThemeDecisions[key].slots,
      });
      writeFileSync(
        out(`${prefix}${dark ? '-dark' : ''}-failures.json`),
        `${JSON.stringify(failures, null, 2)}\n`,
      );
      expect(failures).toEqual([]);
      mode = 'light';
    });

// And the SOLAR components those stock ones share an MUI base with, under the same theme: each
// draws its own recipe, not the theme's for a stock one (data-solar), in every variant.
for (const component of ['Button', 'Icon Button'])
  test(`the SOLAR ${component} under the SOLAR theme still draws what Figma draws`, async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await open(page, '#stock');
    const { failures } = await check(page, component, {
      prefix: `themed-${slug(component)}`,
    });
    expect(failures).toEqual([]);
  });

test('in Dark, the page is drawn in Dark: Light values fail', async ({
  page,
}) => {
  await open(page);
  // Button with no dark blocks: an oracle that expects Light in Dark, which a page drawn in Dark
  // must now differ from.
  const light = structuredClone(oracles.Button);
  for (const v of light.variants) delete v.dark;
  const primary = 'size=md, prio=primary, state=default, danger=false';
  const kept = oracles.Button;
  oracles.Button = light;
  try {
    const { failures } = await check(page, 'Button', {
      only: [primary],
      dark: true,
    });
    expect(failures.map((f) => `${f.layer}.${f.property}`)).toContain(
      'root.background',
    );
  } finally {
    oracles.Button = kept;
    mode = 'light';
  }
});

test('a difference nobody decided on fails, naming the variant and the property', async ({
  page,
}) => {
  await open(page);
  const hovered = 'size=md, prio=secondary, state=hover, danger=false';
  const i = oracles.Button.variants.findIndex((v) => v.figma === hovered);
  // A recipe that drew secondary hover in the wrong colour.
  await page.addStyleTag({
    content: `[data-case="button:${i}"] button:hover { background-color: rgb(255, 0, 0) !important; }`,
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

test('a text drawn in its style with no words in it fails', async ({
  page,
}) => {
  await open(page);
  const card = 'status=success, state=default, ghost=false';
  const i = oracles['Status Card'].variants.findIndex((v) => v.figma === card);
  // A Status Card whose value never reached its text: the text is there, styled, and empty.
  await page
    .locator(`[data-case="status-card:${i}"] .SolarStatusCard-value`)
    .evaluate((el) => {
      el.textContent = '';
    });
  const { failures } = await check(page, 'Status Card', { only: [card] });
  expect(failures).toEqual([
    expect.objectContaining({
      variant: card,
      layer: 'value',
      property: 'words',
      rendered: false,
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
    content: `[data-case="button:${i}"] .MuiCircularProgress-track { stroke: rgb(255, 0, 0) !important; }`,
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

// Every control is hit anywhere in a 44 × 44 target around it (SOLAR: "the 44×44px WCAG hit area
// is padded in code"), however small it is drawn: 21px from its centre, either way, is still the
// control. A part of another component (a Tag's close button) is hit as far as the page lets it.
const TARGETED = {
  Button: 'size=sm, prio=primary, state=default, danger=false',
  'Icon Button': null,
  Checkbox: null,
  Radio: null,
  Toggle: null,
  Slider: null,
  DragHandle: null,
  Link: null,
  'Segmented Control Item': null,
  // A field's target is its field's, which the label above and the helper below stand around.
  'Text Input': {
    figma: 'size=sm, state=default',
    part: '.SolarTextInput--field',
  },
  SearchField: 'state=default, size=sm',
  GlobalSearch: 'state=default, size=sm',
  // A password's eye, in its field.
  'Password Input': {
    figma: 'size=sm, state=default',
    part: 'button.SolarPasswordInput--icon',
  },
  // An inline stepper's plus, beside its number.
  'Number Input': {
    figma: 'size=sm, state=default, stepper=inline',
    part: 'button.SolarNumberInput--fieldIncrement',
  },
};

test('every control is hit anywhere in a 44 × 44 target around it', async ({
  page,
}) => {
  await open(page);
  const missed = [];
  for (const [component, entry] of Object.entries(TARGETED)) {
    const { figma, part } =
      typeof entry === 'string' ? { figma: entry } : (entry ?? {});
    const i = figma
      ? oracles[component].variants.findIndex((v) => v.figma === figma)
      : 0;
    const control = page
      .locator(`[data-case="${slug(component)}:${i}"]`)
      .locator(':scope > *')
      .first();
    const hits = await control.evaluate((root, part) => {
      // Room around it, as a page gives a control, where the check's cases stand closer than a
      // target is wide; and in the middle of the view, so every point probed is on the page.
      root.parentElement.style.margin = '48px 0';
      // The part a pointer must reach, where it is not the whole (a field's field).
      const el = part ? root.querySelector(part) : root;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      const box = el.getBoundingClientRect();
      const [x, y] = [box.left + box.width / 2, box.top + box.height / 2];
      return [
        [0, -21],
        [0, 21],
        [-21, 0],
        [21, 0],
      ].map(([dx, dy]) => {
        const at = document.elementFromPoint(x + dx, y + dy);
        return at !== null && (el === at || el.contains(at));
      });
    }, part);
    if (hits.includes(false)) missed.push({ component, hits });
  }
  expect(missed).toEqual([]);
});
