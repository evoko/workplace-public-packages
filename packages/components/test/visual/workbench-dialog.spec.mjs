/**
 * The workbench's Inspect dialog (stories/workbench/InspectDialog.tsx) where the web's own, beside
 * the shared scenarios (workbench-scenarios.spec.mjs): the preview's outline sits on the selected
 * layer's box, to a pixel, and follows a resize; a click on a part of the component selects its
 * layer and never reaches the component; the focus stays inside the dialog; Escape closes it, but
 * in an open Select closes that Select alone. Against the scenario page (workbench-scenario-page.tsx),
 * its service answered here from the scenarios' fixtures (codegen/src/workbench/bar-scenarios.json),
 * whose layers carry their selectors as the service gives them (the recipe's slot table). Also the
 * preview drawn large, the property rows' target size and columns (each row's Token, Value and
 * From under their headings, nothing overflowing), the editor's small text's contrast, and Escape
 * in the token filter.
 *
 * A text MUI draws in the root shares the root's element: Button's label is its root (`&`), so a
 * click on the label's words selects `root`, and `label`, chosen in the tree, is outlined on the
 * root's box.
 */

import { expect, test } from '@playwright/test';
import {
  readScenarios,
  resolve,
} from '../../../codegen/src/workbench/bar-scenarios.mjs';
import { servePages } from './build.mjs';

const { fixtures } = readScenarios();
const fixture = (name) => resolve({ $fixture: name }, fixtures);

/** Each component's status and inspection, as the scenarios' fixtures give them. */
const SERVICE = {
  'Option Card': {
    status: fixture('status-option-card'),
    inspection: fixture('option-card-inspection'),
  },
  Button: { status: fixture('status'), inspection: fixture('inspection') },
};

/** Errors the page threw, which fail the test that caused them. */
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

/** The page with the component's bar, its service answering; the dialog opened. */
async function inspect(page, component) {
  const { status, inspection } = SERVICE[component];
  await page.route('http://solar.test/service/**', (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.slice('/service/'.length);
    if (path === 'health')
      return route.fulfill({ json: { service: 'solar-workbench' } });
    if (path === 'status') return route.fulfill({ json: status });
    if (path === 'component')
      return route.fulfill({
        json: {
          ...inspection,
          variant: Number(url.searchParams.get('variant')),
        },
      });
    // The events' long poll: nothing happens here, so it is never answered.
    if (path === 'events') return undefined;
    return route.fulfill({ status: 404, json: { error: `no route ${path}` } });
  });
  await page.goto(
    `http://solar.test/workbench-scenario.html#${encodeURIComponent(component)}`,
  );
  await page.locator('#ready').waitFor();
  await page.getByRole('button', { name: 'Inspect', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: `Inspect ${component}` });
  await expect(dialog).toBeVisible();
  const preview = dialog.locator('[aria-label="Preview"]');
  const outline = dialog.locator('[aria-label="Selected layer outline"]');
  /** A layer's element in the preview, by its selector: `&` the preview's first element. */
  const layerIn = (name) => {
    const root = preview.locator('xpath=./*[1]');
    const selector = inspection.layers.find((l) => l.name === name)?.selector;
    return selector === '&'
      ? root
      : root.locator(selector.replace(/^&\s*/, ':scope ')).first();
  };
  const item = (name) =>
    dialog
      .getByRole('tree', { name: 'Layers' })
      .getByRole('treeitem', { name: new RegExp(`^${name}(\\s|$)`) });
  return { dialog, preview, outline, layerIn, item, inspection };
}

/** How far the outline's box is from the layer's, in pixels, at the worst edge. */
async function offBy(outline, layer) {
  const [a, b] = [await outline.boundingBox(), await layer.boundingBox()];
  if (!a || !b) return Infinity;
  return Math.max(
    ...['x', 'y', 'width', 'height'].map((k) => Math.abs(a[k] - b[k])),
  );
}

test("the outline's box is the selected layer's, for every layer of Option Card, and after a resize", async ({
  page,
}) => {
  const { outline, layerIn, item, inspection } = await inspect(
    page,
    'Option Card',
  );
  for (const { name } of inspection.layers) {
    await item(name).click();
    await expect(item(name)).toHaveAttribute('aria-selected', 'true');
    await expect
      .poll(() => offBy(outline, layerIn(name)), { message: name })
      .toBeLessThanOrEqual(1);
  }
  await page.setViewportSize({ width: 900, height: 700 });
  await expect
    .poll(() => offBy(outline, layerIn('label')), { message: 'resized' })
    .toBeLessThanOrEqual(1);
});

test('a click on a part of the preview selects its layer, and never reaches the component', async ({
  page,
}) => {
  const { dialog, preview, outline, layerIn, item } = await inspect(
    page,
    'Option Card',
  );
  await preview.evaluate((el) => {
    window.reached = false;
    el.firstElementChild.addEventListener('click', () => {
      window.reached = true;
    });
  });
  for (const name of ['label', 'iconPlus', 'root']) {
    const box = await layerIn(name).boundingBox();
    // The root's own point: its corner, which no layer inside it covers.
    const [fx, fy] = name === 'root' ? [0.02, 0.1] : [0.5, 0.5];
    await page.mouse.click(box.x + box.width * fx, box.y + box.height * fy);
    await expect(item(name)).toHaveAttribute('aria-selected', 'true');
    await expect
      .poll(() => offBy(outline, layerIn(name)), { message: name })
      .toBeLessThanOrEqual(1);
  }
  expect(await page.evaluate(() => window.reached)).toBe(false);
  // Nothing in the component took the focus.
  expect(
    await preview.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(false);
  await expect(dialog).toBeVisible();
});

test("Button's layers where MUI draws them: the label is the root's element, the leading icon MUI's start icon", async ({
  page,
}) => {
  const { dialog, outline, layerIn, item } = await inspect(page, 'Button');
  // Pointing at the label's words, between the icons: the root, whose element they are in.
  const root = await layerIn('root').boundingBox();
  await page.mouse.click(root.x + root.width / 2, root.y + root.height / 2);
  await expect(item('root')).toHaveAttribute('aria-selected', 'true');
  // Pointing at the start icon: iconLeading, outlined on MUI's slot.
  const icon = await layerIn('iconLeading').boundingBox();
  await page.mouse.click(icon.x + icon.width / 2, icon.y + icon.height / 2);
  await expect(item('iconLeading')).toHaveAttribute('aria-selected', 'true');
  await expect
    .poll(() => offBy(outline, layerIn('iconLeading')))
    .toBeLessThanOrEqual(1);
  await expect
    .poll(async () => (await outline.boundingBox())?.width)
    .toBeLessThan(root.width / 2);
  // The label chosen in the tree: outlined on the root's box, which draws it.
  await item('label').click();
  await expect(item('label')).toHaveAttribute('aria-selected', 'true');
  await expect
    .poll(() => offBy(outline, layerIn('root')))
    .toBeLessThanOrEqual(1);
  // The trailing icon and the counter, each on its own element.
  for (const name of ['iconTrailing', 'counter']) {
    await item(name).click();
    await expect
      .poll(() => offBy(outline, layerIn(name)), { message: name })
      .toBeLessThanOrEqual(1);
  }
  await expect(dialog).toBeVisible();
});

test('the preview draws the component larger than it is, and the outline follows the scaling', async ({
  page,
}) => {
  const { outline, layerIn, item } = await inspect(page, 'Option Card');
  const root = layerIn('root');
  // The case draws Option Card 240 wide; the preview scales it up to fit its pane.
  const natural = await root.evaluate((el) => el.offsetWidth);
  await expect
    .poll(async () => (await root.boundingBox()).width)
    .toBeGreaterThan(natural);
  await item('iconPlus').click();
  await expect
    .poll(() => offBy(outline, layerIn('iconPlus')))
    .toBeLessThanOrEqual(1);
});

test('each property row is one target, at least size.target.min tall', async ({
  page,
}) => {
  const { dialog } = await inspect(page, 'Button');
  const rows = dialog
    .getByRole('table', { name: 'Properties' })
    .getByRole('button');
  const min = await page.evaluate(() =>
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        '--solar-size-target-min',
      ),
    ),
  );
  expect(min).toBeGreaterThan(0);
  for (const box of await rows.evaluateAll((els) =>
    els.map((e) => e.getBoundingClientRect().height),
  ))
    expect(box).toBeGreaterThanOrEqual(min);
});

/**
 * Runs in the page: where each row's Token, Value and From start against their headings, which cell
 * names take more than one line, and what in the table overflows its own box or the table's.
 */
function columnsOf(table) {
  const left = (el) => el.getBoundingClientRect().left;
  const heads = Object.fromEntries(
    [...table.querySelectorAll('[role="columnheader"]')].map((h) => [
      h.dataset.column,
      left(h),
    ]),
  );
  const off = [];
  for (const button of table.querySelectorAll('[role="button"]'))
    for (const column of ['Token', 'Value', 'From']) {
      const cell = button.querySelector(`[data-column="${column}"]`);
      const d = Math.abs(left(cell) - heads[column]);
      if (d > 1)
        off.push(`${button.getAttribute('aria-label')}: ${column} by ${d}`);
    }
  const box = table.getBoundingClientRect();
  const overflowing = [...table.querySelectorAll('*')]
    .filter((el) => {
      // An element that lays nothing out (a picker's panel host) has no box to overflow.
      if (!el.getClientRects().length) return false;
      const r = el.getBoundingClientRect();
      return (
        r.right > box.right + 1 ||
        r.left < box.left - 1 ||
        el.scrollWidth > el.clientWidth + 1
      );
    })
    .map(
      (el) => `${el.tagName}.${el.className} ${el.textContent.slice(0, 40)}`,
    );
  // A cell's name is one line: never broken within the word.
  const broken = [...table.querySelectorAll('[data-column="Cell"]')]
    .filter(
      (el) =>
        el.getBoundingClientRect().height >
        parseFloat(getComputedStyle(el).lineHeight) + 1,
    )
    .map((el) => el.textContent);
  const dialog = table.closest('[role="dialog"]').getBoundingClientRect();
  return {
    off,
    broken,
    overflowing,
    outside: box.right > dialog.right + 1 || box.left < dialog.left - 1,
  };
}

for (const component of ['Option Card', 'Button'])
  test(`${component}'s property rows keep to the headings' columns at 1440×900, cell names on one line, and nothing overflows`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const { dialog } = await inspect(page, component);
    const table = dialog.getByRole('table', { name: 'Properties' });
    await expect(table.getByRole('button').first()).toBeVisible();
    expect(await table.evaluate(columnsOf)).toEqual({
      off: [],
      broken: [],
      overflowing: [],
      outside: false,
    });
    // With a row's editor open under it, too.
    await table.getByRole('button').last().click();
    await expect(dialog.getByRole('group')).toBeVisible();
    expect(await table.evaluate(columnsOf)).toEqual({
      off: [],
      broken: [],
      overflowing: [],
      outside: false,
    });
  });

/** Runs in the page: the contrast of an element's text against the surface behind it. */
function contrastOf(el) {
  const rgb = (c) => c.match(/[\d.]+/g).map(Number);
  const lum = ([r, g, b]) => {
    const f = (v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  let bg = null;
  for (let e = el; e && !bg; e = e.parentElement) {
    const c = getComputedStyle(e).backgroundColor;
    const v = rgb(c);
    if (v.length < 4 || v[3] > 0) bg = v;
  }
  const [a, b] = [
    lum(rgb(getComputedStyle(el).color)),
    lum(bg ?? [255, 255, 255]),
  ];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

for (const theme of ['light', 'dark'])
  test(`the editor's small text meets 4.5:1 in ${theme}`, async ({ page }) => {
    const { dialog } = await inspect(page, 'Button');
    await page.evaluate((t) => {
      document.documentElement.dataset.theme = t;
    }, theme);
    await dialog
      .getByRole('table', { name: 'Properties' })
      .getByRole('button', { name: /^radius / })
      .click();
    const editor = dialog.getByRole('group', { name: 'root · radius' });
    for (const text of ['6 of 6', 'Figma draws radius.control']) {
      const el = editor.getByText(text, { exact: true });
      await expect(el).toBeVisible();
      const size = await el.evaluate((e) =>
        parseFloat(getComputedStyle(e).fontSize),
      );
      expect(size, `${text}: its size`).toBeGreaterThanOrEqual(10);
      expect(
        await el.evaluate(contrastOf),
        `${text}: its contrast`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

test('Escape in the token filter holding text clears it, and the dialog stays; empty, it closes the dialog', async ({
  page,
}) => {
  const { dialog } = await inspect(page, 'Button');
  await dialog
    .getByRole('table', { name: 'Properties' })
    .getByRole('button', { name: /^radius / })
    .click();
  const filter = dialog.getByRole('searchbox', { name: 'Filter tokens' });
  await expect(filter).toHaveValue('radius');
  await filter.press('Escape');
  await expect(filter).toHaveValue('');
  await expect(dialog).toBeVisible();
  await filter.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('the focus stays inside the dialog, both ways round', async ({ page }) => {
  const { dialog } = await inspect(page, 'Button');
  const inside = () =>
    dialog.evaluate((el) => el.contains(document.activeElement));
  expect(await inside()).toBe(true);
  // More presses than the dialog has stops, so the focus wraps.
  for (let i = 0; i < 30; i += 1) {
    await page.keyboard.press('Tab');
    expect(await inside(), `Tab ${i + 1}`).toBe(true);
  }
  for (let i = 0; i < 30; i += 1) {
    await page.keyboard.press('Shift+Tab');
    expect(await inside(), `Shift+Tab ${i + 1}`).toBe(true);
  }
});

test('Escape closes the dialog, and the focus goes back to Inspect', async ({
  page,
}) => {
  const { dialog } = await inspect(page, 'Button');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Inspect', exact: true }),
  ).toBeFocused();
});

test('Escape in an open Select closes the Select alone', async ({ page }) => {
  const { dialog } = await inspect(page, 'Button');
  const state = dialog.getByRole('combobox', { name: /^state(\s|$)/ });
  await state.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await expect(state).toBeFocused();
  // A second Escape, the Select closed, closes the dialog.
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});
