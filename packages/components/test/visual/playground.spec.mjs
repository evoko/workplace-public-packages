/**
 * The Playground builders, live: one component of each kind of interaction, used in Chromium the
 * way a tester uses it in Storybook, on a page with no viewer (playground-page.tsx) that renders
 * the builder the URL's hash names, keeps its values in React state and records every `set` on
 * `window.__sets`. Each check proves the component changed and the builder handed the new value to
 * `set`, which is how the Storybook panel follows the component; and every overlay opens and
 * closes without an error. The page is bundled by build.mjs, beside the visual checks' page, and
 * served the same way.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { EXTRAS } from '../../../codegen/src/playground/extras.mjs';

const out = (path) => fileURLToPath(new URL(`.out/${path}`, import.meta.url));

const TYPES = {
  html: 'text/html',
  js: 'text/javascript',
  css: 'text/css',
  woff2: 'font/woff2',
  woff: 'font/woff',
};

/** A component's name as the page finds it (`Text Input` → `text-input`). */
const slug = (component) => component.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** Errors the page threw, which fail the test that caused them. */
let errors = [];

test.beforeEach(async ({ page }) => {
  errors = [];
  // Served, not opened from disk: Chromium refuses module scripts from file:// URLs.
  await page.route('http://solar.test/**', (route) => {
    const path = new URL(route.request().url()).pathname.slice(1);
    route.fulfill({
      body: readFileSync(out(path)),
      contentType: TYPES[path.split('.').pop()] ?? 'application/octet-stream',
    });
  });
  page.on('pageerror', (e) => errors.push(e));
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

/**
 * Opens one builder's Playground, its width box at `width` (`auto` where none), and any control in
 * `start` at its value; returns it.
 */
async function open(page, component, width, start = {}) {
  const params = new URLSearchParams({
    ...(width ? { width: String(width) } : {}),
    ...start,
  }).toString();
  const query = params ? `?${params}` : '';
  // A new document each time: a URL that differs only in its hash would not load the page again.
  await page.goto('about:blank');
  await page.goto(
    `http://solar.test/playground.html#${slug(component)}${query}`,
  );
  const playground = page.locator(`[data-playground="${slug(component)}"]`);
  await playground.waitFor();
  return playground;
}

/** Every `set` the builder has called, in order. */
const sets = (page) => page.evaluate(() => window.__sets);

test('clicking the Checkbox checks it, and sets `checked`', async ({
  page,
}) => {
  const box = (await open(page, 'Checkbox')).getByRole('checkbox', {
    name: 'Option',
  });
  await expect(box).not.toBeChecked();
  await box.click();
  await expect(box).toBeChecked();
  expect(await sets(page)).toContainEqual(['checked', true]);
});

test('typing in the Text Input shows the words, and sets `value` to them', async ({
  page,
}) => {
  const input = (await open(page, 'Text Input')).getByRole('textbox');
  await input.click();
  await input.pressSequentially('abc');
  await expect(input).toHaveValue('abc');
  expect((await sets(page)).at(-1)).toEqual(['value', 'abc']);
});

test('choosing page 3 in the Pagination makes it current, and sets `page`', async ({
  page,
}) => {
  const pagination = await open(page, 'Pagination');
  await pagination.getByRole('button', { name: 'Page 3', exact: true }).click();
  await expect(pagination.locator('[aria-current="page"]')).toHaveText('3');
  expect(await sets(page)).toContainEqual(['page', 3]);
});

test('clicking “Open” opens the Dialog, and sets `open`', async ({ page }) => {
  const dialog = await open(page, 'Dialog');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await sets(page)).toContainEqual(['open', true]);
});

test('clicking the Icon Button switches it on and off, and sets `active`', async ({
  page,
}) => {
  const button = (await open(page, 'Icon Button')).getByRole('button', {
    name: 'Label',
  });
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  expect(await sets(page)).toContainEqual(['active', true]);
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  expect((await sets(page)).at(-1)).toEqual(['active', false]);
});

test('the SplitButton’s chevron opens its menu, and choosing a variant closes it', async ({
  page,
}) => {
  const chevron = (await open(page, 'SplitButton')).getByRole('button', {
    name: 'More options',
  });
  await chevron.click();
  // The open menu is modal, hiding the page (the chevron among it) from the accessibility tree.
  await expect(page.getByRole('menu')).toBeVisible();
  await page.getByRole('menuitem', { name: 'Option 2' }).click();
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(chevron).toHaveAttribute('aria-expanded', 'false');
});

// Figma's full-width Button Group fills its container, its Buttons sharing the width edge to edge,
// lg ones too, whose own width is a fixed 200: the group's fill wins over it, as in Figma's
// full-width variant. The oracle records no width for a filling Button, so the visual check cannot
// see this; the Dialog's sample actions are that group, of lg Buttons.
test('the Dialog’s full-width Button Group shares its whole width between its Buttons', async ({
  page,
}) => {
  const dialog = await open(page, 'Dialog');
  await dialog.getByRole('button', { name: 'Open' }).click();
  const group = page.getByRole('dialog').getByRole('group');
  await expect(group).toBeVisible();
  const { width } = await group.boundingBox();
  const buttons = await group.getByRole('button').all();
  expect(buttons).toHaveLength(2);
  const widths = await Promise.all(
    buttons.map(async (b) => (await b.boundingBox()).width),
  );
  for (const w of widths) expect(w).toBeCloseTo(width / 2, 0);
});

test('clicking another Radio of the group chooses it, and sets `selected`', async ({
  page,
}) => {
  const group = (await open(page, 'Radio')).getByRole('radiogroup');
  const first = group.getByRole('radio', { name: 'Option 1' });
  const second = group.getByRole('radio', { name: 'Option 2' });
  await expect(first).toBeChecked();
  await second.click();
  await expect(second).toBeChecked();
  await expect(first).not.toBeChecked();
  expect(await sets(page)).toContainEqual(['selected', 'Option 2']);
});

test('clicking the Toggle turns it on, and sets `selected`', async ({
  page,
}) => {
  const toggle = (await open(page, 'Toggle')).getByRole('switch', {
    name: 'Setting',
  });
  await expect(toggle).not.toBeChecked();
  await toggle.click();
  await expect(toggle).toBeChecked();
  expect(await sets(page)).toContainEqual(['selected', true]);
});

test('an arrow key moves the Slider, and sets `value`', async ({ page }) => {
  const slider = (await open(page, 'Slider')).getByRole('slider', {
    name: 'Volume',
  });
  await expect(slider).toHaveValue('50');
  await slider.focus();
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('51');
  expect((await sets(page)).at(-1)).toEqual(['value', 51]);
  // Still focused across the re-render, the next key moves it on.
  await page.keyboard.press('ArrowRight');
  await expect(slider).toHaveValue('52');
});

test('dragging the Slider moves it smoothly, and sets `value` at every step', async ({
  page,
}) => {
  const playground = await open(page, 'Slider');
  const slider = playground.getByRole('slider', { name: 'Volume' });
  const box = await playground.locator('.MuiSlider-root').boundingBox();
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + box.width / 2, y);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.9, y, { steps: 10 });
  await page.mouse.up();
  await expect(slider).toHaveValue('90');
  const values = (await sets(page)).map(([, v]) => v);
  expect(values.length).toBeGreaterThan(5);
  expect(values.at(-1)).toBe(90);
});

// The text fields: typing is as in an app, the cursor staying where the tester puts it, every
// keystroke kept, and what the component makes of the words (a step, a filter, an entry) is what
// the control holds.
test('typing mid-word in the Text Area keeps the cursor there, and sets `value`', async ({
  page,
}) => {
  const area = (await open(page, 'Text Area')).getByRole('textbox', {
    name: 'Label',
  });
  const send = page.getByRole('button', { name: 'Send' });
  await expect(send).toBeDisabled();
  await area.click();
  await area.pressSequentially('helo wrld');
  // Back into "wrld", then into "helo": each letter goes where the cursor is.
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowLeft');
  await page.keyboard.type('o');
  for (let i = 0; i < 5; i++) await page.keyboard.press('ArrowLeft');
  await page.keyboard.type('l');
  await expect(area).toHaveValue('hello world');
  // Fast, all at once, at the end: nothing dropped.
  await page.keyboard.press('End');
  await page.keyboard.type(', and the rest of a long sentence typed fast');
  const words = 'hello world, and the rest of a long sentence typed fast';
  await expect(area).toHaveValue(words);
  expect((await sets(page)).at(-1)).toEqual(['value', words]);
  // Something to send: the call to action is enabled.
  await expect(send).toBeEnabled();
});

test('Enter in the Token Input adds the draft as an entry, and sets `tokens` and `draft`', async ({
  page,
}) => {
  const tokens = await open(page, 'Token Input');
  const input = tokens.getByRole('textbox', { name: 'Label' });
  await input.click();
  await input.pressSequentially('Opps');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('Backspace');
  await expect(input).toHaveValue('Ops');
  expect((await sets(page)).at(-1)).toEqual(['draft', 'Ops']);
  await page.keyboard.press('Enter');
  await expect(input).toHaveValue('');
  await expect(tokens.getByText('Ops', { exact: true })).toBeVisible();
  expect(await sets(page)).toContainEqual(['tokens', 'Design, Research, Ops']);
  expect((await sets(page)).at(-1)).toEqual(['draft', '']);
  // Backspace in the empty draft removes the last entry.
  await page.keyboard.press('Backspace');
  await expect(tokens.getByText('Ops', { exact: true })).toHaveCount(0);
  expect((await sets(page)).at(-1)).toEqual(['tokens', 'Design, Research']);
  // An entry with a comma in it is two, as the control reads it; past `maxVisible` (3), a Counter
  // counts the rest.
  await input.pressSequentially('Ops, QA');
  await page.keyboard.press('Enter');
  expect(await sets(page)).toContainEqual([
    'tokens',
    'Design, Research, Ops, QA',
  ]);
  await expect(tokens.getByText('Ops', { exact: true })).toBeVisible();
  await expect(tokens.getByText('QA', { exact: true })).toHaveCount(0);
  await expect(tokens.getByText('1', { exact: true })).toBeVisible();
});

test('typing a code fills the PIN Input, digits only, and sets `value`', async ({
  page,
}) => {
  const input = (await open(page, 'PIN Input')).getByRole('textbox', {
    name: 'Label',
  });
  await input.click();
  await input.pressSequentially('12a34');
  await expect(input).toHaveValue('1234');
  expect((await sets(page)).at(-1)).toEqual(['value', '1234']);
  await input.pressSequentially('5678');
  // Six cells: the rest is not taken.
  await expect(input).toHaveValue('123456');
  expect((await sets(page)).at(-1)).toEqual(['value', '123456']);
});

test('the Number Input’s number is typed and stepped within its range, and sets `value`', async ({
  page,
}) => {
  const number = await open(page, 'Number Input');
  const input = number.getByRole('spinbutton', { name: 'Label' });
  await expect(input).toHaveValue('1');
  await input.fill('');
  expect((await sets(page)).at(-1)).toEqual(['value', '']);
  await input.pressSequentially('7.5');
  await expect(input).toHaveValue('7.5');
  expect((await sets(page)).at(-1)).toEqual(['value', '7.5']);
  // The arrow keys step it, clamped to its max, 10, where Increase is disabled.
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowUp');
  await expect(input).toHaveValue('10');
  expect((await sets(page)).at(-1)).toEqual(['value', '10']);
  await expect(number.getByRole('button', { name: 'Increase' })).toBeDisabled();
  await number.getByRole('button', { name: 'Decrease' }).click();
  await expect(input).toHaveValue('9');
  expect((await sets(page)).at(-1)).toEqual(['value', '9']);
});

test('the Inline Input’s confirmed edit sets `value`, and a cancelled one does not', async ({
  page,
}) => {
  const inline = await open(page, 'Inline Input');
  await inline.getByText('Current value').click();
  const input = inline.getByRole('textbox', { name: 'Value' });
  await input.fill('New value');
  // Enter confirms and closes it, the focus back on the edit button, which the key does not then
  // press (it once did, opening it again).
  await input.press('Enter');
  await expect(inline.getByText('New value')).toBeVisible();
  await expect(inline.getByRole('textbox')).toHaveCount(0);
  await expect(inline.getByRole('button', { name: /^Edit/ })).toBeFocused();
  expect(await sets(page)).toEqual([['value', 'New value']]);
  await inline.getByText('New value').click();
  await inline.getByRole('textbox', { name: 'Value' }).fill('Discarded');
  await page.keyboard.press('Escape');
  await expect(inline.getByText('New value')).toBeVisible();
  expect(await sets(page)).toEqual([['value', 'New value']]);
});

test('a file chosen through FileUpload’s Browse shows, and sets `files`', async ({
  page,
}) => {
  const upload = await open(page, 'FileUpload');
  const chooser = page.waitForEvent('filechooser');
  await upload.getByRole('button', { name: 'Browse' }).click();
  await (
    await chooser
  ).setFiles({
    name: 'photo.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(''),
  });
  await expect(upload.getByText('photo.jpg')).toBeVisible();
  expect((await sets(page)).at(-1)).toEqual(['files', 'photo.jpg']);
  await upload.getByRole('button', { name: 'Remove file' }).click();
  expect((await sets(page)).at(-1)).toEqual(['files', '']);
});

// The menus and pickers: choosing in the component sets the control, and is logged with the
// callback's name.
/** Every `log` the builder has called, in order, as `[event, detail]`. */
const logs = (page) => page.evaluate(() => window.__logs);

/** Whether an element, or any element around it, is hidden from assistive technology. */
const hiddenAround = (locator) =>
  locator.evaluate((el) => el.closest('[aria-hidden="true"]') !== null);

test('choosing an option in the Select shows it, and sets `value` and `open`', async ({
  page,
}) => {
  const select = (await open(page, 'Select')).getByRole('combobox', {
    name: 'Label',
  });
  await expect(select).toHaveText('Placeholder');
  await select.click();
  // In the accessibility tree: no ancestor of the open panel is hidden from it (MUI's modal once
  // hid the page the panel was drawn in, the panel among it).
  const panel = page.getByRole('listbox');
  await expect(panel).toBeVisible();
  expect(await hiddenAround(panel)).toBe(false);
  expect(await sets(page)).toContainEqual(['open', true]);
  await page.getByRole('option', { name: 'Option 2' }).click();
  await expect(panel).toHaveCount(0);
  await expect(select).toHaveText('Option 2');
  expect(await sets(page)).toContainEqual(['value', 'Option 2']);
  expect((await sets(page)).filter(([name]) => name === 'open').at(-1)).toEqual(
    ['open', false],
  );
  expect(await logs(page)).toContainEqual(['onChange', 'Option 2']);
});

test('the Dropdown’s open panel is announced, and choosing a row shows it', async ({
  page,
}) => {
  const dropdown = (await open(page, 'Dropdown')).getByRole('combobox');
  await dropdown.click();
  const panel = page.getByRole('listbox');
  await expect(panel).toBeVisible();
  expect(await hiddenAround(panel)).toBe(false);
  await page.getByRole('option', { name: 'Option 2' }).click();
  await expect(panel).toHaveCount(0);
  await expect(dropdown).toHaveText('Option 2');
  expect(await sets(page)).toContainEqual(['value', 'Option 2']);
});

test('the Dropdown Menu opens from “Open”, and choosing a row logs it and closes it', async ({
  page,
}) => {
  const playground = await open(page, 'Dropdown Menu');
  await playground.getByRole('button', { name: 'Open' }).click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.getByRole('menuitem', { name: 'Option 2' }).click();
  await expect(page.getByRole('menu')).toHaveCount(0);
  expect((await sets(page)).at(-1)).toEqual(['open', false]);
  expect((await logs(page)).at(-1)).toEqual(['onClick', 'Option 2']);
});

test('picking a day in the DatePicker’s calendar sets `value` to its date', async ({
  page,
}) => {
  const picker = await open(page, 'DatePicker');
  const input = picker.getByRole('textbox', { name: 'Select Date' });
  // Figma's 2026-05-11, in the page's figures.
  await expect(input).toHaveValue('05/11/2026');
  await picker.getByRole('button', { name: 'Choose date' }).click();
  const calendar = page.getByRole('dialog');
  await expect(calendar).toBeVisible();
  await calendar.getByRole('gridcell', { name: /May 20, 2026/ }).click();
  await expect(calendar).toHaveCount(0);
  await expect(input).toHaveValue('05/20/2026');
  expect((await sets(page)).at(-1)).toEqual(['value', '2026-05-20']);
  expect(await logs(page)).toContainEqual(['onChange', '2026-05-20']);
});

test('picking a time in the TimePicker’s list sets `value` to it, HH:MM', async ({
  page,
}) => {
  const picker = await open(page, 'TimePicker');
  const input = picker.getByRole('textbox', { name: 'Label' });
  // Figma's words, 12:00 AM, read on the 12-hour clock.
  await expect(input).toHaveValue('12:00 AM');
  await picker.getByRole('button', { name: 'Choose time' }).click();
  await page.getByRole('option', { name: '9:30 PM' }).click();
  await expect(page.getByRole('listbox')).toHaveCount(0);
  await expect(input).toHaveValue('9:30 PM');
  expect((await sets(page)).at(-1)).toEqual(['value', '21:30']);
  expect(await logs(page)).toContainEqual(['onChange', '21:30']);
});

test('typing in the Autocomplete suggests, and choosing a suggestion sets `value` to it', async ({
  page,
}) => {
  const input = (await open(page, 'Autocomplete')).getByRole('combobox', {
    name: 'Label',
  });
  await input.click();
  await input.pressSequentially('on');
  expect((await sets(page)).at(-1)).toEqual(['value', 'on']);
  // Of the sample suggestions, only London holds "on".
  await expect(page.getByRole('option')).toHaveCount(1);
  await page.getByRole('option', { name: 'London' }).click();
  await expect(input).toHaveValue('London');
  expect((await sets(page)).at(-1)).toEqual(['value', 'London']);
  expect(await logs(page)).toContainEqual(['onChange', 'London']);
});

// Navigation, paging and the cards: choosing, expanding, stepping and selecting in the component
// sets the control, as in an app; a card's More menu opens and its choice is logged.
test('choosing another tab in the Tabs selects it, and sets `selected`', async ({
  page,
}) => {
  const tabs = (await open(page, 'Tabs')).getByRole('tablist');
  const activity = tabs.getByRole('tab', { name: 'Activity' });
  await expect(tabs.getByRole('tab', { name: 'Overview' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await activity.click();
  await expect(activity).toHaveAttribute('aria-selected', 'true');
  expect(await sets(page)).toContainEqual(['selected', 'Activity']);
  expect(await logs(page)).toContainEqual(['onChange', 'Activity']);
});

test('clicking the Accordion’s header expands it, and sets `expanded`', async ({
  page,
}) => {
  const header = (await open(page, 'Accordion')).getByRole('button', {
    name: 'Label',
  });
  await expect(header).toHaveAttribute('aria-expanded', 'false');
  await header.click();
  await expect(header).toHaveAttribute('aria-expanded', 'true');
  expect(await sets(page)).toContainEqual(['expanded', true]);
  await header.click();
  await expect(header).toHaveAttribute('aria-expanded', 'false');
  expect((await sets(page)).at(-1)).toEqual(['expanded', false]);
});

test('Next moves the Stepper on, and a completed step goes back to it, setting `activeStep`', async ({
  page,
}) => {
  const playground = await open(page, 'Stepper');
  const current = playground.locator('[aria-current="step"]');
  await expect(current).toContainText('Profile');
  await playground.getByRole('button', { name: 'Next' }).click();
  await expect(current).toContainText('Devices');
  expect((await sets(page)).at(-1)).toEqual(['activeStep', 2]);
  // The first step is complete: a button back to it.
  await playground.getByRole('button', { name: /Account/ }).click();
  await expect(current).toContainText('Account');
  expect((await sets(page)).at(-1)).toEqual(['activeStep', 0]);
  expect(await logs(page)).toContainEqual(['onStepClick', 0]);
  await expect(playground.getByRole('button', { name: 'Back' })).toBeDisabled();
});

test('the Image Card’s Checkbox selects it, and sets `selected`', async ({
  page,
}) => {
  const playground = await open(page, 'Image Card');
  // The Checkbox shows while the pointer is on the tile, as Figma draws it hovered.
  await playground.getByText('Title', { exact: true }).hover();
  const box = playground.getByRole('checkbox', { name: 'Select' });
  await expect(box).not.toBeChecked();
  await box.click();
  await expect(box).toBeChecked();
  expect(await sets(page)).toContainEqual(['selected', true]);
  expect(await logs(page)).toContainEqual(['onSelectedChange', true]);
});

test('a Card’s More menu opens, and choosing an action logs it and closes it', async ({
  page,
}) => {
  const playground = await open(page, 'Card');
  const more = playground.getByRole('button', { name: 'More actions' });
  await more.click();
  await expect(page.getByRole('menu')).toBeVisible();
  await page.getByRole('menuitem', { name: 'Duplicate' }).click();
  await expect(page.getByRole('menu')).toHaveCount(0);
  expect((await logs(page)).at(-1)).toEqual(['onSelect', 'Duplicate']);
  // Its title is its press, logged too.
  await playground.getByRole('button', { name: 'Label' }).click();
  expect((await logs(page)).at(-1)).toEqual(['onClick', null]);
});

test('choosing a page in the Breadcrumbs ends the trail at it, and sets `items`', async ({
  page,
}) => {
  const trail = (await open(page, 'Breadcrumbs')).getByRole('navigation', {
    name: 'Breadcrumb',
  });
  await expect(trail.locator('[aria-current="page"]')).toHaveText('Building A');
  await trail.getByRole('button', { name: 'Spaces' }).click();
  await expect(trail.locator('[aria-current="page"]')).toHaveText('Spaces');
  expect((await sets(page)).at(-1)).toEqual(['items', 2]);
});

// Tables, overlays and dialogs: selecting, hovering, opening and confirming in the component sets
// the control and logs the callback, as in an app.
test('clicking the RowSelect selects its row, and sets `selected`', async ({
  page,
}) => {
  const box = (await open(page, 'RowSelect')).getByRole('checkbox', {
    name: 'Select row',
  });
  await expect(box).not.toBeChecked();
  await box.click();
  await expect(box).toBeChecked();
  expect(await sets(page)).toContainEqual(['selected', true]);
  expect(await logs(page)).toContainEqual(['onChange', true]);
});

test('hovering the Tooltip’s trigger shows it after its delay, and sets `open`', async ({
  page,
}) => {
  const trigger = (await open(page, 'Tooltip')).getByRole('button', {
    name: 'Open',
  });
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  await trigger.hover();
  await expect(page.getByRole('tooltip')).toBeVisible();
  await expect(page.getByRole('tooltip')).toHaveText('Label');
  expect(await sets(page)).toContainEqual(['open', true]);
  expect(await logs(page)).toContainEqual(['onOpen', null]);
  // The pointer leaving hides it, and `open` follows.
  await page.mouse.move(0, 0);
  await expect(page.getByRole('tooltip')).toHaveCount(0);
  expect((await sets(page)).at(-1)).toEqual(['open', false]);
});

test('the Drawer opens from “Open”, and its close button closes it', async ({
  page,
}) => {
  const playground = await open(page, 'Drawer');
  await playground.getByRole('button', { name: 'Open' }).click();
  const drawer = page.getByRole('dialog', { name: 'Drawer Title' });
  await expect(drawer).toBeVisible();
  expect(await sets(page)).toContainEqual(['open', true]);
  await drawer.getByRole('button', { name: 'Close' }).click();
  await expect(drawer).toHaveCount(0);
  expect((await sets(page)).at(-1)).toEqual(['open', false]);
  expect((await logs(page)).at(-1)).toEqual(['onClose', null]);
});

test('the ConfirmationDialog’s Continue confirms, logs `onConfirm` and closes it', async ({
  page,
}) => {
  const playground = await open(page, 'ConfirmationDialog');
  await playground.getByRole('button', { name: 'Open' }).click();
  const dialog = page.getByRole('alertdialog', { name: 'Are you sure?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Continue' }).click();
  await expect(dialog).toHaveCount(0);
  expect((await sets(page)).at(-1)).toEqual(['open', false]);
  expect((await logs(page)).at(-1)).toEqual(['onConfirm', null]);
});

// The width box, as both adapters draw it: at `auto` as wide as the Playground, so a filling
// component takes the whole width, and a hugging one keeps its own; a width picked is the box's.
test('a filling component takes the width box’s width, at auto and at a width picked', async ({
  page,
}) => {
  for (const width of [undefined, '320']) {
    const playground = await open(page, 'ProgressBar', width);
    const box = await playground.locator('[data-width-box]').boundingBox();
    const bar = await playground.getByRole('progressbar').boundingBox();
    expect(box.width).toBeCloseTo(
      width ? Number(width) : page.viewportSize().width - 2 * box.x,
      0,
    );
    expect(bar.width).toBeCloseTo(box.width, 0);
  }
});

test('a hugging component keeps its own width in the width box', async ({
  page,
}) => {
  for (const width of [undefined, '320']) {
    const playground = await open(page, 'Button', width);
    const box = await playground.locator('[data-width-box]').boundingBox();
    const button = await playground.getByRole('button').boundingBox();
    expect(button.width).toBeLessThan(box.width / 2);
    expect(button.x).toBeCloseTo(box.x, 0);
  }
});

// A vertical divider fills the row it separates, sized by its words: the row stretches it (the
// recipe's `height: 100%` once filled only a parent of a set height, and the builder worked around
// it). Figma draws it full alone, so the builder writes `full` back to a type picked for it.
test('a vertical Divider stretches to its row’s height, and is always full', async ({
  page,
}) => {
  const playground = await open(page, 'Divider', undefined, {
    orientation: 'vertical',
    type: 'inset',
  });
  const divider = playground.getByRole('separator');
  const word = await playground.getByText('Text').first().boundingBox();
  const rule = await divider.boundingBox();
  expect(rule.height).toBeGreaterThan(1);
  expect(rule.height).toBeCloseTo(word.height, 0);
  expect(rule.width).toBeCloseTo(1, 0);
  await expect
    .poll(async () => (await sets(page)).at(-1))
    .toEqual(['type', 'full']);
});

// Every overlay, a component with an `open` extra (an IR's own `open`, a Select's, is no trigger's),
// opens from its trigger and closes on Escape.
const overlays = Object.entries(EXTRAS)
  .filter(([, extras]) => extras.some((c) => c.name === 'open'))
  .map(([component]) => component);

for (const component of overlays)
  test(`${component} opens from “Open” and closes on Escape without an error`, async ({
    page,
  }) => {
    const playground = await open(page, component);
    await playground.getByRole('button', { name: 'Open' }).click();
    expect(await sets(page)).toContainEqual(['open', true]);
    await page.keyboard.press('Escape');
    await expect
      .poll(async () => (await sets(page)).at(-1))
      .toEqual(['open', false]);
  });
