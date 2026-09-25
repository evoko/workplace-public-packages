import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Button } from '../src/Button.tsx';
import { ButtonGroup } from '../src/ButtonGroup.tsx';
import { Coachmark } from '../src/Coachmark.tsx';
import { ConfirmationDialog } from '../src/ConfirmationDialog.tsx';
import { Dialog } from '../src/Dialog.tsx';
import { Drawer } from '../src/Drawer.tsx';
import { Popover } from '../src/Popover.tsx';
import { Scrim } from '../src/Scrim.tsx';
import { SplitDialog } from '../src/SplitDialog.tsx';
import { Tooltip } from '../src/Tooltip.tsx';

const html = (el) => renderToString(el);
/** Whether an element, not the recipe's CSS, carries the class. */
const drawn = (text, cls) => new RegExp(`class="[^"]*\\b${cls}\\b`).test(text);
/** The id the element labelled by it points at, and whether an element has it. */
const labelled = (text) => {
  const id = text.match(/aria-labelledby="([^"]+)"/)?.[1];
  return id !== undefined && text.includes(`id="${id}"`);
};

const actions = h(
  ButtonGroup,
  { type: 'full-width' },
  h(Button, { prio: 'secondary' }, 'Cancel'),
  h(Button, null, 'Save'),
);

describe('the SOLAR Dialog shell', () => {
  it('is a dialog labelled by its title, its content and actions its own', () => {
    const dialog = html(
      h(Dialog, { inline: true, title: 'Rename room', actions }, 'Its content'),
    );
    expect(dialog).toContain('role="dialog"');
    expect(labelled(dialog)).toBe(true);
    expect(dialog).toContain('Its content');
    expect(dialog).toContain('Save');
  });

  it('draws its close button where it can close, and names it', () => {
    const shut = html(h(Dialog, { inline: true, title: 'Rename room' }));
    expect(drawn(shut, 'SolarDialog--close')).toBe(false);
    const closable = html(
      h(Dialog, {
        inline: true,
        title: 'Rename room',
        onClose: () => {},
        closeLabel: 'Close dialog',
      }),
    );
    expect(drawn(closable, 'SolarDialog--close')).toBe(true);
    expect(closable).toContain('aria-label="Close dialog"');
  });

  it('takes its type from what it is given: an image, a Stepper, or neither', () => {
    const image = html(
      h(Dialog, {
        inline: true,
        title: 'Welcome',
        image: h('img', { src: 'a.png', alt: '' }),
        description: 'Its words',
      }),
    );
    // The picture's header, and the title under it, where the others draw it in the header.
    expect(drawn(image, 'SolarDialog-modalImage')).toBe(true);
    expect(drawn(image, 'SolarDialog-imageTitle')).toBe(true);
    expect(image).toContain('Its words');
    const plain = html(h(Dialog, { inline: true, title: 'Welcome' }));
    expect(drawn(plain, 'SolarDialog-modalImage')).toBe(false);
    expect(drawn(plain, 'SolarDialog-stepper')).toBe(false);
  });

  it('draws nothing in place while closed, where it is modal', () => {
    expect(html(h(Dialog, { title: 'Rename room' }))).not.toContain(
      'role="dialog"',
    );
  });
});

describe('the SOLAR ConfirmationDialog shell', () => {
  it('is an alert dialog, its Cancel and Continue its own', () => {
    const confirm = html(
      h(ConfirmationDialog, {
        inline: true,
        title: 'Are you sure?',
        onConfirm: () => {},
        onCancel: () => {},
      }),
    );
    expect(confirm).toContain('role="alertdialog"');
    expect(labelled(confirm)).toBe(true);
    expect(confirm).toContain('Cancel');
    expect(confirm).toContain('Continue');
  });

  it('confirms with a danger Button where its intent is danger', () => {
    const danger = html(
      h(ConfirmationDialog, {
        inline: true,
        intent: 'danger',
        title: 'Delete room?',
        onConfirm: () => {},
        onCancel: () => {},
      }),
    );
    const dangerous = /SolarButton[^"]*danger|data-danger="true"/;
    expect(danger).toMatch(dangerous);
    const plain = html(
      h(ConfirmationDialog, {
        inline: true,
        title: 'Save changes?',
        onConfirm: () => {},
        onCancel: () => {},
      }),
    );
    expect(plain).not.toMatch(dangerous);
  });
});

describe('the SOLAR SplitDialog and Drawer shells', () => {
  it('draws a split dialog’s two panes, labelled by its title', () => {
    const split = html(
      h(SplitDialog, {
        inline: true,
        title: 'Compare',
        left: 'Left pane',
        right: 'Right pane',
        actions,
      }),
    );
    expect(split).toContain('role="dialog"');
    expect(labelled(split)).toBe(true);
    expect(split).toContain('Left pane');
    expect(split).toContain('Right pane');
  });

  it('draws a drawer’s content in place, labelled by its title', () => {
    const drawer = html(
      h(Drawer, { inline: true, title: 'Filters' }, 'Its content'),
    );
    expect(drawer).toContain('role="dialog"');
    expect(labelled(drawer)).toBe(true);
    expect(drawer).toContain('Its content');
  });
});

describe('the SOLAR Scrim and Tooltip shells', () => {
  it('draws the scrim as MUI’s Backdrop, open by default', () => {
    expect(drawn(html(h(Scrim)), 'MuiBackdrop-root')).toBe(true);
  });

  it('draws a tooltip’s bubble alone where it has no trigger', () => {
    const bubble = html(h(Tooltip, { title: 'Copy link' }));
    expect(bubble).toContain('Copy link');
    expect(drawn(bubble, 'SolarTooltip--arrow')).toBe(true);
  });

  it('draws the trigger alone until the tooltip shows', () => {
    const trigger = html(
      h(Tooltip, { title: 'Copy link' }, h('button', null, 'Copy')),
    );
    expect(trigger).toContain('Copy</button>');
    expect(drawn(trigger, 'SolarTooltip--arrow')).toBe(false);
  });
});

describe('the SOLAR Popover shell', () => {
  it('is a dialog labelled by its title, the caller’s controls after its words', () => {
    const popover = html(
      h(
        Popover,
        { title: 'Share', body: 'Anyone with the link can view.' },
        h('button', null, 'Copy link'),
      ),
    );
    expect(popover).toContain('role="dialog"');
    expect(labelled(popover)).toBe(true);
    expect(popover.indexOf('Anyone with the link')).toBeLessThan(
      popover.indexOf('Copy link'),
    );
  });

  it('draws no words where it is given none', () => {
    const bare = html(h(Popover, { title: 'Share' }));
    expect(drawn(bare, 'SolarPopover-body')).toBe(false);
  });

  it('draws nothing in place while closed, where it has an anchor', () => {
    expect(html(h(Popover, { title: 'Share', anchorEl: null }))).not.toContain(
      'role="dialog"',
    );
  });
});

describe('the SOLAR Coachmark shell', () => {
  it('is a dialog that is not modal, labelled by its title, announced politely', () => {
    const step = html(
      h(Coachmark, {
        title: 'Rooms',
        body: 'Every room you manage.',
        counter: '1 / 6 steps',
      }),
    );
    expect(step).toContain('role="dialog"');
    expect(step).toContain('aria-modal="false"');
    expect(step).toContain('aria-live="polite"');
    expect(labelled(step)).toBe(true);
    expect(step).toContain('1 / 6 steps');
  });

  it('draws its close button where it can end the tour, and its connector hidden', () => {
    const shut = html(h(Coachmark, { title: 'Rooms' }));
    expect(drawn(shut, 'SolarCoachmark--close')).toBe(false);
    const closable = html(
      h(Coachmark, {
        title: 'Rooms',
        onClose: () => {},
        closeLabel: 'End tour',
      }),
    );
    expect(closable).toContain('aria-label="End tour"');
    expect(closable).toMatch(
      /class="[^"]*SolarCoachmark--connector[^"]*" aria-hidden="true"/,
    );
  });
});
