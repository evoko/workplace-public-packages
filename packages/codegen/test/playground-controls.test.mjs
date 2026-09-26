import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ICON_NONE,
  ICON_SAMPLE,
  componentControls,
  controlsOf,
  iconComponents,
  iconNames,
  playgroundData,
  stemsOf,
} from '../src/playground/controls.mjs';
import { EXTRAS, WORDS } from '../src/playground/extras.mjs';
import { PLAYGROUND_VALUES } from '../src/playground/values.mjs';
import { specDir } from '../src/util/paths.mjs';

const data = playgroundData();
const controlsFor = (name) => data.components[name];
const byName = (name, control) =>
  controlsFor(name).find((c) => c.name === control);

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const iconSpec = readJson(join(specDir, 'icons.json'));
const specs = Object.fromEntries(
  readdirSync(join(specDir, 'components'))
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJson(join(specDir, 'components', f)))
    .map((s) => [s.component, s]),
);

describe('playground controls', () => {
  it('gives Button its axes, booleans, words, icons, counter and a width', () => {
    const names = controlsFor('Button').map((c) => `${c.kind}:${c.name}`);
    expect(names).toEqual([
      'select:size',
      'select:prio',
      'boolean:disabled',
      'boolean:loading',
      'boolean:danger',
      'icon:iconLeading',
      'text:label',
      'icon:iconTrailing',
      'child:counter',
      'width:width',
      'integer:counter count',
    ]);
    expect(byName('Button', 'size')).toMatchObject({
      default: 'md',
      options: ['md', 'sm', 'lg'],
    });
    expect(byName('Button', 'label')).toMatchObject({
      default: 'Label',
      optional: true,
    });
    expect(byName('Button', 'iconLeading')).toMatchObject({
      default: '_none',
    });
    expect(byName('Button', 'counter')).toMatchObject({
      default: false,
      component: 'Counter',
    });
    expect(byName('Button', 'width')).toMatchObject({ default: 'auto' });
    expect(byName('Button', 'counter count')).toEqual({
      name: 'counter count',
      kind: 'integer',
      default: 3,
      min: 0,
    });
  });

  it("gives a component slot its child's words where the child has a text slot", () => {
    // Banner's primary button is a Button, whose label is a text slot.
    const banner = controlsFor('Banner');
    const child = banner.find(
      (c) => c.kind === 'child' && c.component === 'Button',
    );
    expect(child).toBeDefined();
    expect(banner).toContainEqual(
      expect.objectContaining({
        kind: 'childText',
        name: `${child.name} label`,
        default: 'Label',
      }),
    );
  });

  it("starts a child's words at the child's sample words where Figma records none", () => {
    // Card's tag is a Tag, whose label Figma records no words for: the Tag's sample words.
    expect(byName('Card', 'tag label')).toMatchObject({
      kind: 'childText',
      default: WORDS.Tag.label,
    });
  });

  it('gives a component slot whose child has no text slot its toggle alone', () => {
    // Button's counter is a Counter, whose count is a number its shell takes: no childText, and
    // the count is the extras table's `counter count`.
    expect(controlsFor('Button').filter((c) => c.kind === 'childText')).toEqual(
      [],
    );
  });

  it('starts an icon at the icon Figma draws, a placeholder at the sample, a hidden one at none', () => {
    expect(byName('Banner', 'close')).toMatchObject({ default: 'close' });
    expect(byName('Select', 'trailingIcon')).toMatchObject({
      default: 'chevron-down',
    });
    // Figma's Icon/None and Icon/Empty are placeholders for the caller's icon.
    expect(byName('Text Input', 'leadingIcon')).toMatchObject({
      default: '_sample',
    });
    expect(byName('Dialog', 'icon')).toMatchObject({ default: '_sample' });
    expect(byName('Button', 'iconTrailing')).toMatchObject({
      default: '_none',
    });
  });

  it('lists every SOLAR icon, once each', () => {
    expect(iconNames()).toHaveLength(340);
    expect(new Set(iconNames()).size).toBe(340);
    expect(iconNames()).toContain('chevron-right');
    expect(data.icons).toEqual(iconNames());
  });

  it("names every icon's React component as the icon spec does", () => {
    const components = iconComponents();
    expect(Object.keys(components)).toEqual(iconNames());
    expect(components['chevron-right']).toBe('IconChevronRight');
    // An acronym keeps its capitals: no PascalCase of the stem gives these.
    expect(components['io-device']).toBe('IconIODevice');
    expect(components.usb).toBe('IconUSB');
    expect(new Set(Object.values(components)).size).toBe(340);
  });

  it("keeps an icon control's hidden and sample values apart from every icon stem", () => {
    // The SOLAR set has icons named `none` and `empty`: no stem may be a special value, and none
    // may read as another stem's solid style.
    expect(ICON_NONE).toBe('_none');
    expect(ICON_SAMPLE).toBe('_sample');
    expect(iconNames().filter((s) => s.startsWith('_'))).toEqual([]);
    expect(iconNames().filter((s) => s.endsWith(' solid'))).toEqual([]);
  });

  it("keeps every icon control value among the characters Storybook's URL keeps", () => {
    // Storybook drops an arg from its URL unless it matches this, so a state would not survive.
    const values = [
      ICON_NONE,
      ICON_SAMPLE,
      ...iconNames().flatMap((s) => [s, `${s} solid`]),
    ];
    expect(values.filter((v) => !/^[a-zA-Z0-9 _-]*$/.test(v))).toEqual([]);
  });

  it('covers every component that has a Playground, the same twice', () => {
    const names = Object.keys(data.components);
    expect(names).toContain('Checkbox');
    // Checked as Autocomplete's state, it has a story of its own.
    expect(names).toContain('Autocomplete Open');
    // A chart library draws it: no story.
    expect(names).not.toContain('Bar Chart');
    expect(playgroundData()).toEqual(data);
  });

  it("appends each component's extras, from the one table, after its width", () => {
    for (const [component, extras] of Object.entries(EXTRAS)) {
      const names = controlsFor(component).map((c) => c.name);
      const at = names.indexOf('width');
      expect(names.slice(at + 1), component).toEqual(extras.map((e) => e.name));
    }
    expect(byName('Pagination', 'page')).toMatchObject({
      kind: 'integer',
      default: 1,
      min: 1,
    });
    expect(byName('Dialog', 'open')).toMatchObject({
      kind: 'boolean',
      default: false,
    });
    expect(byName('Text Input', 'value')).toMatchObject({
      kind: 'text',
      default: '',
    });
  });

  it("fails an extra that repeats one of the component's controls' names", () => {
    const stemOf = stemsOf(iconSpec.icons);
    expect(() =>
      controlsOf(specs.Button, specs, stemOf, [
        { name: 'label', kind: 'text', default: '' },
      ]),
    ).toThrow(/Button: extra control "label" repeats a control's name/);
    expect(() =>
      controlsOf(specs.Button, specs, stemOf, [
        { name: 'width', kind: 'text', default: '' },
      ]),
    ).toThrow(/repeats/);
    expect(() =>
      controlsOf(specs.Button, specs, stemOf, [
        { name: 'x', kind: 'text', default: '' },
        { name: 'x', kind: 'text', default: '' },
      ]),
    ).toThrow(/repeats/);
  });

  it('starts a text slot Figma records no words for at its sample words', () => {
    expect(byName('Toast', 'message')).toMatchObject({
      kind: 'text',
      default: 'File saved',
      optional: true,
    });
    expect(byName('Tag', 'label').default).toBe('Label');
    for (const [component, words] of Object.entries(WORDS))
      for (const [slot, text] of Object.entries(words))
        expect(byName(component, slot).default, `${component} ${slot}`).toBe(
          text,
        );
    // Where it has none, a text slot Figma records no words for starts empty.
    expect(byName('Text Input', 'mandatory').default).toBe('');
  });

  it('fails sample words for no text slot, or for one whose words Figma records', () => {
    const stemOf = stemsOf(iconSpec.icons);
    const words = (component, w) => () =>
      controlsOf(specs[component], specs, stemOf, [], w);
    expect(words('Button', { iconLeading: 'x' })).toThrow(
      /Button: sample words for "iconLeading", which is no text slot/,
    );
    expect(words('Button', { nope: 'x' })).toThrow(/no text slot/);
    expect(words('Button', { label: 'Go' })).toThrow(
      /Button: sample words for "label", whose words Figma records/,
    );
    expect(words('Toast', { message: '' })).toThrow(/are not words/);
    expect(() =>
      componentControls(specs, iconSpec.icons, EXTRAS, {
        'No Such Thing': { x: 'y' },
      }),
    ).toThrow(/"No Such Thing", which has no Playground/);
  });

  it('fails an extras entry for a component with no Playground', () => {
    expect(() =>
      componentControls(specs, iconSpec.icons, {
        ...EXTRAS,
        'No Such Thing': [{ name: 'x', kind: 'text', default: '' }],
      }),
    ).toThrow(/"No Such Thing", which has no Playground/);
    // A chart library draws it: it has no story, so no Playground.
    expect(() =>
      componentControls(specs, iconSpec.icons, {
        'Bar Chart': [{ name: 'x', kind: 'text', default: '' }],
      }),
    ).toThrow(/"Bar Chart", which has no Playground/);
  });

  it('fails an extra whose kind or default the viewers cannot draw', () => {
    const stemOf = stemsOf(iconSpec.icons);
    const extra = (e) => () => controlsOf(specs.Checkbox, specs, stemOf, [e]);
    expect(extra({ name: 'x', kind: 'date', default: '' })).toThrow(/kind/);
    expect(extra({ name: 'x', kind: 'integer', default: 1.5 })).toThrow(
      /does not fit/,
    );
    expect(extra({ name: 'x', kind: 'integer', default: 0, min: 1 })).toThrow(
      /outside/,
    );
    expect(
      extra({ name: 'x', kind: 'select', default: 'c', options: ['a', 'b'] }),
    ).toThrow(/one of its options/);
  });

  it('fails a slot or an axis no control draws', () => {
    const stemOf = stemsOf(iconSpec.icons);
    const spec = (over) => ({ component: 'Fake', api: {}, slots: {}, ...over });
    expect(() =>
      controlsOf(spec({ slots: { x: { type: 'video' } } }), specs, stemOf, []),
    ).toThrow(/Fake: slot "x" is of type "video"/);
    expect(() =>
      controlsOf(spec({ api: { x: { default: 'a' } } }), specs, stemOf, []),
    ).toThrow(/Fake: axis "x"/);
    // An icon slot with no layer starts at the sample rather than failing.
    expect(
      controlsOf(
        spec({ slots: { i: { type: 'icon' } } }),
        specs,
        stemOf,
        [],
      )[0],
    ).toMatchObject({ kind: 'icon', default: ICON_SAMPLE });
  });

  it('serves the fixed values and the icon components with the controls', () => {
    expect(data.values).toEqual(PLAYGROUND_VALUES);
    expect(data.values.iconNone).toBe(ICON_NONE);
    expect(data.iconComponents).toEqual(iconComponents());
  });

  it('names every control of a component once', () => {
    for (const [name, controls] of Object.entries(data.components)) {
      const seen = controls.map((c) => c.name);
      expect(new Set(seen).size, name).toBe(seen.length);
    }
  });
});
