/**
 * The workbench bar (stories/workbench/Bar.tsx) end to end, over a fake service
 * (workbench-page.tsx): what it offers by the component's circle, what it sends, and how it follows
 * the service's events. That a token chosen here reaches the component is the batch's smoke run
 * against the real service.
 */

import { expect, test } from '@playwright/test';
import { servePages } from './build.mjs';

/** Errors the page threw, which fail the test that caused them. */
let errors = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  await servePages(page);
  page.on('pageerror', (e) => errors.push(e));
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

const open = async (page, mode) => {
  await page.goto(`http://solar.test/workbench.html#${mode}`);
  await page.locator('#ready').waitFor();
};
const calls = (page) => page.evaluate(() => window.calls);
const reads = (page) => page.evaluate(() => window.reads);
const bar = (page) => page.getByLabel('Workbench');
const combo = (page, name) =>
  page.getByRole('combobox', { name: new RegExp(`^${name}`) });

/** Chooses an option in a SOLAR Select: opens it, then clicks the option. */
async function choose(page, name, option) {
  await combo(page, name).click();
  await page.getByRole('option', { name: option }).click();
  await expect(page.getByRole('listbox')).toHaveCount(0);
}

test('a 🟡 component offers Inspect and Approve; choosing a token sends the set, at the narrowest scope', async ({
  page,
}) => {
  await open(page, 'yellow');
  await page.getByRole('button', { name: 'Inspect' }).click();
  await choose(page, 'Set to', /radius\.full/);
  await expect
    .poll(() => calls(page))
    .toEqual([
      [
        'set',
        {
          component: 'Button',
          variant: 0,
          layer: 'root',
          cell: 'radius',
          scope: 'root.size=md.radius',
          value: { token: 'radius.full' },
          revision: 'r1',
        },
      ],
    ]);
});

test('a scope chosen is the one the set is keyed on', async ({ page }) => {
  await open(page, 'yellow');
  await page.getByRole('button', { name: 'Inspect' }).click();
  await choose(page, 'Scope', 'every variant');
  await choose(page, 'Set to', 'none');
  await expect
    .poll(async () => (await calls(page))[0]?.[1])
    .toMatchObject({ scope: 'root.base.radius', value: { none: true } });
});

test('a cell with a note, or with nothing to offer, says so and offers nothing', async ({
  page,
}) => {
  await open(page, 'yellow');
  await page.getByRole('button', { name: 'Inspect' }).click();
  await expect(bar(page)).toContainText(
    'width: 120px (a raw value the overlay allows)',
  );
  await expect(bar(page)).toContainText(
    'gap: inset.xs (not editable here: use Report)',
  );
  await expect(combo(page, 'Set to')).toHaveCount(1);
});

test('choosing a variant reads it, and the set names it', async ({ page }) => {
  await open(page, 'yellow');
  await page.getByRole('button', { name: 'Inspect' }).click();
  await choose(page, 'Variant', /size=sm/);
  await expect.poll(() => reads(page)).toContainEqual(['inspect', 1]);
  await choose(page, 'Set to', /radius\.full/);
  await expect
    .poll(async () => (await calls(page))[0]?.[1])
    .toMatchObject({ variant: 1, scope: 'root.size=sm.radius' });
});

test('pointing at the component selects the layer under the click', async ({
  page,
}) => {
  await open(page, 'yellow');
  await page.getByRole('button', { name: 'Inspect' }).click();
  await page.getByRole('button', { name: 'Point' }).click();
  await page.locator('.SolarButton-label').click();
  await expect(combo(page, 'Layer')).toHaveText(/label/);
  await expect(bar(page)).toContainText(
    'color: color.text.inverse [prio=primary]',
  );
  // Disarmed once it has chosen.
  await expect(bar(page)).not.toContainText('Click a part of the component');
});

test('Approve asks first, approves on confirming, and the focus goes to the bar', async ({
  page,
}) => {
  await open(page, 'yellow');
  await page.getByRole('button', { name: 'Approve' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toContainText('Approve Button on the web?');
  await dialog.getByRole('button', { name: 'Approve' }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(() => calls(page)).toEqual([['approve', 'Button', 'web']]);
  await expect(
    page.getByRole('button', { name: 'Undo approval' }),
  ).toBeVisible();
  await expect(bar(page).locator('[aria-live="polite"]')).toBeFocused();
});

test('a refusal is shown once, though the service also sends it as an event', async ({
  page,
}) => {
  await open(page, 'refused');
  await page.getByRole('button', { name: 'Approve' }).click();
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: 'Approve' })
    .click();
  await expect(page.getByRole('alert')).toContainText('Button waits on Icon');
  // The `failed` and `changed` events have been heard: the bar read the status again for them.
  const before = (await reads(page)).length;
  await page.evaluate(() => window.emit('changed'));
  await expect
    .poll(async () => (await reads(page)).length)
    .toBeGreaterThan(before);
  await expect(page.getByRole('alert')).toHaveCount(1);
});

test('an event refetches: a component approved elsewhere shows 🟢', async ({
  page,
}) => {
  await open(page, 'yellow');
  await page.evaluate(() => {
    window.setWeb('green');
    window.emit('changed');
  });
  await expect(
    page.getByRole('button', { name: 'Undo approval' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Approve' })).toHaveCount(0);
});

test('Inspect closes when the component is approved meanwhile, and stays closed', async ({
  page,
}) => {
  await open(page, 'yellow');
  await page.getByRole('button', { name: 'Inspect' }).click();
  await expect(combo(page, 'Set to')).toHaveCount(1);
  await page.evaluate(() => {
    window.setWeb('green');
    window.emit('changed');
  });
  await expect(combo(page, 'Set to')).toHaveCount(0);
  await page.evaluate(() => {
    window.setWeb('yellow');
    window.emit('changed');
  });
  await expect(page.getByRole('button', { name: 'Inspect' })).toBeVisible();
  await expect(combo(page, 'Set to')).toHaveCount(0);
});

test('a pending edit asks for a reason, names the rules that borrow it, and holds Approve', async ({
  page,
}) => {
  await open(page, 'pending');
  await expect(bar(page)).toContainText(
    'Pending: root.base.radius → radius.full',
  );
  await expect(bar(page)).toContainText('Was: Figma rounds it fully');
  await expect(bar(page)).toContainText(
    'Also the reason of: root.size=sm.radius',
  );
  await expect(page.getByRole('button', { name: 'Approve' })).toBeDisabled();
  const why = page.getByRole('textbox', { name: /Why/ });
  await why.fill('The pill reads as a chip beside the Tag');
  await page.getByRole('button', { name: 'Keep' }).click();
  await expect(why).toHaveValue('');
  await why.fill('A second thought');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect(why).toHaveValue('');
  await expect
    .poll(() => calls(page))
    .toEqual([
      ['keep', 'Button', 'The pill reads as a chip beside the Tag'],
      ['undo', 'Button'],
    ]);
});

test('a pending edit whose checks fail lists them, from the parts each has', async ({
  page,
}) => {
  await open(page, 'failing');
  const list = page.getByRole('list', { name: 'Failing checks' });
  await expect(list.getByRole('listitem')).toHaveText([
    'web: size=md root.radius: Figma 8, drawn 9999',
    'flutter: label',
  ]);
  await expect(
    page.getByRole('button', { name: 'Undo', exact: true }),
  ).toBeVisible();
});

test('another component’s pending edit is named, and holds Approve', async ({
  page,
}) => {
  await open(page, 'other');
  await expect(bar(page)).toContainText(
    'Dialog has a pending edit: keep or undo it in its Playground first.',
  );
  await expect(page.getByRole('button', { name: 'Approve' })).toBeDisabled();
});

test('a 🟡 component locked by an approval elsewhere says so, and offers no Inspect or Report', async ({
  page,
}) => {
  await open(page, 'locked');
  await expect(bar(page)).toContainText(
    'Inspect and Report are locked: approved on Flutter: undo its approval in Widgetbook to change it.',
  );
  await expect(page.getByRole('button', { name: 'Inspect' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Report' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Approve' })).toBeEnabled();
});

test('a 🟢 component offers Undo approval alone, naming what it withdraws', async ({
  page,
}) => {
  await open(page, 'green');
  await expect(
    page.getByRole('button', { name: 'Undo approval' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Inspect' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Approve' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Undo approval' }).click();
  const dialog = page.getByRole('alertdialog');
  await expect(dialog).toContainText(
    'This withdraws the approval of Button, Dialog on the web.',
  );
  await dialog.getByRole('button', { name: 'Undo approval' }).click();
  await expect(dialog).toHaveCount(0);
  await expect
    .poll(() => calls(page))
    .toEqual([['unapprove', 'Button', 'web']]);
  await expect(bar(page).locator('[aria-live="polite"]')).toBeFocused();
});

test('a 🔴 component names the 🟡 ones to approve first, and offers nothing', async ({
  page,
}) => {
  await open(page, 'red');
  await expect(bar(page)).toContainText('Approve first: Counter.');
  await expect(page.getByRole('button')).toHaveCount(0);
});

test('a 🔴 component waiting on none that is 🟡 is in a cycle', async ({
  page,
}) => {
  await open(page, 'cycle');
  await expect(bar(page)).toContainText('It is in a cycle with: Dialog.');
  await expect(page.getByRole('button')).toHaveCount(0);
});

test('a service still starting is asked again, and then the bar shows', async ({
  page,
}) => {
  await open(page, 'starting');
  await expect(page.getByRole('button', { name: 'Inspect' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('with no service there is no bar', async ({ page }) => {
  await open(page, 'none');
  await expect.poll(() => reads(page)).toEqual([['health']]);
  await expect(bar(page)).toHaveCount(0);
});
