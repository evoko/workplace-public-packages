/**
 * The workbench bar (stories/workbench/Bar.tsx) end to end, over a fake service
 * (workbench-page.tsx): what it offers by the component's circle, what it sends, and how it follows
 * the service's events. Inspect's dialog is the shared scenarios' (workbench-scenarios.spec.mjs).
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

test('a pending edit names its key and value, holds Approve, and Keep again and Undo send its platform', async ({
  page,
}) => {
  await open(page, 'pending');
  await expect(bar(page)).toContainText(
    'Pending: root.base.radius → radius.full',
  );
  // The reason was written with the edit: the bar asks none.
  await expect(page.getByRole('textbox', { name: /Why/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Approve' })).toBeDisabled();
  await page.getByRole('button', { name: 'Keep again' }).click();
  await expect.poll(() => calls(page)).toEqual([['keep', 'Button', 'web']]);
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await expect
    .poll(() => calls(page))
    .toEqual([
      ['keep', 'Button', 'web'],
      ['undo', 'Button', 'web'],
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
