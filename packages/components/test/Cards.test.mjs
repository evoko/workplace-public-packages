import { describe, expect, it } from 'vitest';
import { createElement as h } from 'react';
import { renderToString } from 'react-dom/server';
import { Card } from '../src/Card.tsx';

/** The markup, the recipe's CSS left out. */
const html = (el) =>
  renderToString(el).replace(/<style[^>]*>.*?<\/style>/g, '');
const count = (text, re) => (text.match(re) ?? []).length;

describe('the SOLAR Card shells', () => {
  it('is no control until given something to do', () => {
    const text = html(h(Card, { title: 'Room' }, 'Body'));
    expect(text).not.toContain('<button');
    expect(text).not.toContain('<a ');
    expect(text).not.toContain('SolarCard-pressable');
    expect(text).toContain('Body');
  });

  it('pressable, its title is the button or link, stretched over the card', () => {
    const button = html(h(Card, { title: 'Room', onClick() {} }));
    expect(button).toMatch(/<button[^>]*SolarCard-press[^>]*>Room<\/button>/);
    expect(button).toContain('SolarCard-pressable');
    const link = html(h(Card, { title: 'Room', href: '/rooms/1' }));
    expect(link).toMatch(/<a[^>]*SolarCard-press[^>]*href="\/rooms\/1"/);
  });

  it('draws a More menu button where it has actions, and nothing where it has none', () => {
    const text = html(
      h(Card, {
        title: 'Room',
        onClick() {},
        moreItems: [{ label: 'Edit', onSelect() {} }],
      }),
    );
    expect(text).toMatch(
      /<button[^>]*aria-label="More actions"[^>]*aria-haspopup="menu"/,
    );
    expect(count(text, /<button/g)).toBe(2);
    expect(html(h(Card, { title: 'Room' }))).not.toContain('More actions');
  });

  it('loading, is busy, its words not drawn, its Tag a placeholder, its action its name alone', () => {
    const text = html(
      h(Card, {
        title: 'Room',
        description: 'Words',
        tag: 'New',
        loading: true,
        onClick() {},
      }),
    );
    expect(text).toContain('aria-busy="true"');
    expect(text).not.toContain('SolarCard-titleTitle');
    expect(text).not.toContain('Words');
    // Still pressable, as Figma draws a loading card hovered: its action is its name alone.
    expect(text).toMatch(
      /<button[^>]*SolarCard-press[^>]*><span class="SolarCard-name">Room<\/span>/,
    );
    expect(text).toMatch(/SolarCard-tag[^"]*" aria-hidden="true"/);
    expect(text).toContain('SolarCard-skeleton');
  });

  it('disabled, is no control, and says so', () => {
    const text = html(
      h(Card, {
        title: 'Room',
        disabled: true,
        onClick() {},
        moreItems: [{ label: 'Edit', onSelect() {} }],
      }),
    );
    expect(text).toContain('aria-disabled="true"');
    expect(text).not.toContain('SolarCard-press');
    expect(text).toMatch(
      /<button[^>]*disabled=""[^>]*aria-label="More actions"/,
    );
  });
});

describe('the SOLAR card family’s shells', () => {
  it('a Status Card names its status, as a word the StatusIndicator reads', async () => {
    const { StatusCard } = await import('../src/StatusCard.tsx');
    const text = html(
      h(StatusCard, { title: 'Incidents', value: '5', status: 'danger' }),
    );
    expect(text).toMatch(
      /role="img"[^>]*aria-label="Danger"|aria-label="Danger"[^>]*role="img"/,
    );
    expect(
      html(
        h(StatusCard, {
          title: 'Incidents',
          value: '5',
          statusLabel: 'Healthy',
        }),
      ),
    ).toContain('aria-label="Healthy"');
  });

  it('an Insight Card, selected and pressable, is the current one of its set', async () => {
    const { InsightCard } = await import('../src/InsightCard.tsx');
    const text = html(
      h(InsightCard, {
        title: 'Rooms over capacity',
        selected: true,
        onClick() {},
      }),
    );
    expect(text).toMatch(
      /<button[^>]*aria-current="true"[^>]*>Rooms over capacity</,
    );
    expect(text).toContain('SolarInsightCard-selected');
  });

  it('an Insight Row names its severity bar by its word', async () => {
    const { InsightRow } = await import('../src/InsightRow.tsx');
    const text = html(h(InsightRow, { title: 'Fault', severity: 'warning' }));
    expect(text).toMatch(/SolarInsightRow-name">Warning</);
  });

  it('an Expandable Card’s header is its button, its content shown expanded alone', async () => {
    const { ExpandableCard } = await import('../src/ExpandableCard.tsx');
    const shut = html(
      h(ExpandableCard, { title: 'Details', description: 'More' }),
    );
    expect(shut).toMatch(/<button[^>]*aria-expanded="false"/);
    expect(shut).not.toContain('More');
    const open = html(
      h(ExpandableCard, {
        title: 'Details',
        description: 'More',
        defaultExpanded: true,
      }),
    );
    expect(open).toMatch(
      /<button[^>]*aria-expanded="true"[^>]*aria-controls="[^"]+-content"/,
    );
    expect(open).toContain('More');
  });

  it('an Accordion is its header collapsed, and a header over its content expanded', async () => {
    const { Accordion } = await import('../src/Accordion.tsx');
    const shut = html(h(Accordion, { title: 'Question' }));
    expect(shut).toMatch(/^<button[^>]*aria-expanded="false"/);
    const open = html(
      h(Accordion, {
        title: 'Question',
        description: 'Answer',
        expanded: true,
      }),
    );
    expect(open).toMatch(/^<div[^>]*SolarAccordion-expanded/);
    expect(open).toMatch(
      /<button[^>]*data-layer="accordion"[^>]*aria-expanded="true"/,
    );
    expect(open).toContain('Answer');
    expect(html(h(Accordion, { title: 'Question', disabled: true }))).toContain(
      'disabled=""',
    );
  });

  it('an Event Row’s time is a <time> of the moment given', async () => {
    const { EventRow } = await import('../src/EventRow.tsx');
    const text = html(
      h(EventRow, {
        title: 'Room booked',
        timestamp: 'Just now',
        dateTime: '2026-09-25T09:00:00Z',
      }),
    );
    // React spells it dateTime, which HTML reads as datetime, its attributes caseless.
    expect(text).toMatch(
      /<time datetime="2026-09-25T09:00:00Z">Just now<\/time>/i,
    );
  });

  it('a File Card is a file’s tile, or the one that creates one, named by its title', async () => {
    const { FileCard } = await import('../src/FileCard.tsx');
    const file = html(
      h(FileCard, { title: 'Plan.pdf', meta: 'Edited now', onClick() {} }),
    );
    expect(file).toMatch(
      /SolarFileCard-title[^>]*><button[^>]*SolarFileCard-press[^>]*>Plan.pdf</,
    );
    const create = html(
      h(FileCard, { type: 'create', title: 'New design', onClick() {} }),
    );
    expect(create).toMatch(/SolarFileCard-label[^>]*><button[^>]*>New design</);
    expect(create).not.toContain('SolarFileCard-thumbnail');
  });

  it('an Image Card shows its Checkbox where it is selected, and not at rest', async () => {
    const { ImageCard } = await import('../src/ImageCard.tsx');
    const props = { title: 'Lobby', onSelectedChange() {} };
    expect(html(h(ImageCard, props))).not.toContain('SolarImageCard-checkbox');
    const selected = html(h(ImageCard, { ...props, selected: true }));
    expect(selected).toContain('SolarImageCard-checkbox');
    expect(selected).toContain('aria-label="Select"');
    expect(
      html(h(ImageCard, { ...props, filled: false, selected: true })),
    ).not.toContain('SolarImageCard-checkbox');
  });

  it('an Action Card draws both actions at rest, and the primary alone once done', async () => {
    const { ActionCard } = await import('../src/ActionCard.tsx');
    const props = {
      title: 'Set up',
      primaryAction: h('button', null, 'Go'),
      secondaryAction: h('button', null, 'Later'),
    };
    const rest = html(h(ActionCard, props));
    expect(rest).toContain('>Go<');
    expect(rest).toContain('>Later<');
    const done = html(h(ActionCard, { ...props, status: 'done' }));
    expect(done).toContain('>Go<');
    expect(done).not.toContain('>Later<');
  });

  it('an Interactive Card draws the one control it is given, and a drag handle where asked', async () => {
    const { InteractiveCard } = await import('../src/InteractiveCard.tsx');
    const props = { title: 'Room', onSelectedChange() {} };
    expect(html(h(InteractiveCard, props))).not.toMatch(
      /SolarInteractiveCard-(checkbox|radioButton|toggle)/,
    );
    for (const [control, layer] of [
      ['checkbox', 'checkbox'],
      ['radio', 'radioButton'],
      ['toggle', 'toggle'],
    ]) {
      const text = html(h(InteractiveCard, { ...props, control }));
      expect(
        count(text, /SolarInteractiveCard-(checkbox|radioButton|toggle)\b/g),
        control,
      ).toBe(1);
      expect(text).toContain(`SolarInteractiveCard-${layer}`);
      expect(text).toContain('aria-label="Room"');
    }
    expect(html(h(InteractiveCard, { ...props, dragHandle: true }))).toContain(
      'SolarInteractiveCard-dragHandle',
    );
  });

  it('a Device Card draws its type’s own layers, its health in the status given', async () => {
    const { DeviceCard } = await import('../src/DeviceCard.tsx');
    const single = html(
      h(DeviceCard, { name: 'Qt X', tag: 'Online', tagStatus: 'danger' }),
    );
    expect(single).toMatch(/SolarDeviceCard-contentName[^>]*>Qt X</);
    expect(single).toContain('SolarTag');
    const batch = html(
      h(DeviceCard, { name: 'Qt X', type: 'batch', count: '3 devices' }),
    );
    expect(batch).toMatch(/SolarDeviceCard-headlineContentName[^>]*>Qt X</);
    expect(batch).not.toContain('SolarDeviceCard-contentName');
    expect(html(h(DeviceCard, { name: 'Qt X', loading: true }))).toContain(
      'aria-busy="true"',
    );
    // Loading, it still draws its name, which stays its one action.
    const busy = html(
      h(DeviceCard, { name: 'Qt X', loading: true, onClick() {} }),
    );
    expect(count(busy, /SolarDeviceCard-press(?!able)/g)).toBe(1);
  });

  it('a Launch Card puts its favourite on its image, or beside its name without one', async () => {
    const { LaunchCard } = await import('../src/LaunchCard.tsx');
    const favourite = h('button', null, 'Fav');
    const pictured = html(
      h(LaunchCard, { name: 'Workplace', image: '/a.png', favourite }),
    );
    expect(pictured).toMatch(
      /SolarLaunchCard-favourite\b[^"]*"[^>]*><button>Fav</,
    );
    expect(pictured).not.toContain('SolarLaunchCard-favouriteNoImage');
    const plain = html(h(LaunchCard, { name: 'Workplace', favourite }));
    expect(plain).toContain('SolarLaunchCard-favouriteNoImage');
    expect(plain).not.toContain('SolarLaunchCard-image');
  });

  it('a Launch Card Full Screen draws up to three features, a Container and a Split Dropdown their content', async () => {
    const { LaunchCardFullScreen } =
      await import('../src/LaunchCardFullScreen.tsx');
    const text = html(
      h(LaunchCardFullScreen, { name: 'Workplace', features: ['One', 'Two'] }),
    );
    expect(text).toMatch(/SolarLaunchCardFullScreen-feature[^2-9][^>]*>One</);
    expect(text).toMatch(/SolarLaunchCardFullScreen-feature2[^>]*>Two</);
    expect(text).not.toContain('SolarLaunchCardFullScreen-feature3');
    const { Container } = await import('../src/Container.tsx');
    expect(html(h(Container, null, 'Grouped'))).toContain('Grouped');
    const { SplitDropdown } = await import('../src/SplitDropdown.tsx');
    const split = html(h(SplitDropdown, { top: 'Control', lower: 'Details' }));
    expect(split).toContain('Control');
    expect(split).toContain('Details');
  });
});
