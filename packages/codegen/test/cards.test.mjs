/**
 * The card family's machinery (milestone 4): an added layer placed among its siblings (`places`),
 * layers Figma draws together that the caller picks one of (`choice`, by a prop or by the
 * content), what a composed child draws whatever Figma records hidden (`hides`), a look `set` adds
 * where no layer has it, an axis whose values alone are respelled (`rename`), the oracle's
 * expansion of a choice, and the card shells' templates.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { DESCRIPTORS } from '../src/components/index.mjs';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import {
  loadDefaults,
  loadOverlay,
  parseOverlay,
  placeLayers,
} from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { cardFlutter, cardReact } from '../src/shells/card.mjs';
import { buildOracle, hideInComposed } from '../src/verify/oracle.mjs';

const { built } = stage.build();
const of = (name) => built.find((b) => b.spec.component === name);
const descriptor = (name) => DESCRIPTORS.find((d) => d.name === name);
// Every IR, by component name, as the stage hands them to hideInComposed.
const specs = Object.fromEntries(built.map((b) => [b.spec.component, b.spec]));

const contract = loadContract();
const names = tokenNames(contract);
const catalog = loadWebCatalog();
const defaults = loadDefaults();
const build = (component, overlay = loadOverlay(component)) =>
  buildComponentSpec(loadComponent(catalog, component), {
    names,
    fileVersion: catalog.fileVersion,
    overlay,
    defaults,
  });
// The component's overlay, changed by `change`.
const changed = (component, change) => {
  const overlay = structuredClone(loadOverlay(component));
  change(overlay);
  return overlay;
};
const yaml = (text) => parseOverlay(text, 'test.yaml');
// Every look any layer of the IR has.
const looksOf = (spec) =>
  new Set(
    Object.values(spec.style).flatMap((s) => Object.keys(s.appearance ?? {})),
  );
// A fresh oracle, as the stage builds it, before hideInComposed.
const oracleOf = (component, overlay = loadOverlay(component)) => {
  const loaded = loadComponent(catalog, component);
  const { spec, deviations } = build(component, overlay);
  return {
    spec,
    set: loaded.set,
    oracle: buildOracle(loaded.set, spec, deviations, {
      tokens: buildTokenSpec(contract).spec,
      names,
      overlay,
      fileVersion: catalog.fileVersion,
    }),
  };
};

describe('a text that fills its row', () => {
  it('fills as Figma sizes it, with no overlay rule: a card’s title, its More at the row’s end', () => {
    for (const [component, layer] of [
      ['Card', 'titleTitle'],
      ['Action Card', 'titleTitle'],
      ['Expandable Card', 'title'],
      ['Accordion', 'title'],
    ])
      expect(
        of(component).spec.style[layer].base.width,
        `${component} ${layer}`,
      ).toMatchObject({
        keyword: 'FILL',
        from: expect.not.stringMatching(/^overlay$/),
      });
  });

  it('is given no size where it hugs its words, which are Figma’s sample', () => {
    // Status Card's value hugs in every variant.
    expect(of('Status Card').spec.style.value.base.width).toBeUndefined();
  });
});

describe('places', () => {
  it('reads a rule that addresses both layers by their Figma paths', () => {
    const o = yaml(`
component: Card
places:
  /Skeleton: { before: /Content, reason: r }
`);
    expect(o.places['/Skeleton']).toEqual({ before: '/Content', reason: 'r' });
  });

  it('refuses a layer or a sibling not addressed by its Figma path', () => {
    expect(() =>
      yaml(
        'component: Card\nplaces:\n  Skeleton: { before: /Content, reason: r }\n',
      ),
    ).toThrow(
      /places.Skeleton: address both layers by their Figma paths, from \//,
    );
    expect(() =>
      yaml(
        'component: Card\nplaces:\n  /Skeleton: { before: Content, reason: r }\n',
      ),
    ).toThrow(
      /places.\/Skeleton: address both layers by their Figma paths, from \//,
    );
    expect(() =>
      yaml('component: Card\nplaces:\n  /Skeleton: { reason: r }\n'),
    ).toThrow(/address both layers by their Figma paths/);
  });

  it('moves Card’s loading Skeleton before its Content, where Figma records it after', () => {
    const { spec } = build('Card');
    const order = Object.keys(spec.layers);
    expect(order.indexOf('skeleton')).toBeLessThan(order.indexOf('content'));
    expect(order.indexOf('skeleton')).toBe(order.indexOf('content') - 1);
    expect(spec.overlay.rules).toContainEqual(
      expect.objectContaining({
        rule: 'places',
        at: '/Skeleton before /Content',
      }),
    );
    const figma = Object.keys(
      build(
        'Card',
        changed('Card', (o) => delete o.places),
      ).spec.layers,
    );
    expect(figma.indexOf('skeleton')).toBeGreaterThan(figma.indexOf('content'));
  });

  it('refuses a layer the component lacks, before one it lacks, or before one that is not its sibling', () => {
    const place = (path, before) =>
      build(
        'Card',
        changed('Card', (o) => {
          o.places = { [path]: { before, reason: 'r' } };
        }),
      );
    expect(() => place('/Nope', '/Content')).toThrow(
      'Card: places /Nope: the component has no such layer',
    );
    expect(() => place('/Skeleton', '/Nope')).toThrow(
      'Card: places /Skeleton: the component has no layer /Nope',
    );
    expect(() => place('/Skeleton', '/Content/Description')).toThrow(
      'Card: places /Skeleton: /Content/Description is not its sibling',
    );
  });

  it('leaves the tree as it is where no rule places a layer', () => {
    const layers = { '/': { parent: null }, '/A': { parent: '/' } };
    expect(placeLayers(layers, null, 'X')).toBe(layers);
    expect(placeLayers(layers, { places: {} }, 'X')).toBe(layers);
  });
});

describe('choice', () => {
  it('reads a choice of layers by a prop, and one the content makes', () => {
    const o = yaml(`
component: X
choice:
  control:
    layers: { checkbox: checkbox, radio: radioButton }
    none: true
    reason: r
  place:
    layers: { image: a, headline: b }
    content: image
    reason: r
`);
    expect(o.choice.control.none).toBe(true);
    expect(o.choice.place.content).toBe('image');
  });

  it('checks the prop is a name in code, with two layers or more, and none true or absent', () => {
    const choice = (body) => () =>
      yaml(`component: X\nchoice:\n${body.replace(/^/gm, '  ')}\n`);
    expect(choice('Control:\n  layers: { a: x, b: y }\n  reason: r')).toThrow(
      /choice.Control: the prop must be a name in code/,
    );
    expect(choice('control:\n  layers: { a: x }\n  reason: r')).toThrow(
      /choice.control: layers must name two layers or more, by value/,
    );
    expect(choice('control:\n  layers: { a: x, b: 1 }\n  reason: r')).toThrow(
      /choice.control: layers must name two layers or more, by value/,
    );
    expect(choice('control:\n  reason: r')).toThrow(
      /choice.control: layers must name two layers or more/,
    );
    expect(
      choice('control:\n  layers: { a: x, b: y }\n  none: false\n  reason: r'),
    ).toThrow(/choice.control: none is true or absent/);
    expect(
      choice('control:\n  layers: { a: x, b: y }\n  slot: s\n  reason: r'),
    ).toThrow(/choice.control: unknown field slot/);
  });

  it('checks a content choice names one slot, for two layers and no none', () => {
    const content = (body) => () =>
      yaml(`component: X\nchoice:\n  place:\n${body.replace(/^/gm, '    ')}\n`);
    const refused =
      /choice.place: content names one slot, for two layers and no none/;
    expect(
      content('layers: { a: x, b: y, c: z }\ncontent: a\nreason: r'),
    ).toThrow(refused);
    expect(
      content('layers: { a: x, b: y }\ncontent: a\nnone: true\nreason: r'),
    ).toThrow(refused);
    expect(content('layers: { a: x, b: y }\ncontent: 1\nreason: r')).toThrow(
      refused,
    );
  });

  it('gives Interactive Card a control prop, none by default, then each control Figma draws', () => {
    const { spec } = build('Interactive Card');
    expect(spec.api.control).toEqual({
      values: ['none', 'checkbox', 'radio', 'toggle'],
      default: 'none',
    });
    expect(spec.overlay.rules).toContainEqual(
      expect.objectContaining({
        rule: 'choice',
        at: 'control: checkbox → checkbox, radio → radioButton, toggle → toggle',
      }),
    );
  });

  it('adds no prop for a choice the content makes (Launch Card’s favourite)', () => {
    const { spec } = build('Launch Card');
    expect(spec.api).not.toHaveProperty('favouritePlace');
    expect(spec.overlay.rules).toContainEqual(
      expect.objectContaining({
        rule: 'choice',
        at: 'favouritePlace: image → favourite, headline → favouriteNoImage',
      }),
    );
  });

  it('refuses a choice onto a prop the API has, or of a layer the IR lacks', () => {
    expect(() =>
      build(
        'Interactive Card',
        changed('Interactive Card', (o) => {
          o.choice = { selected: o.choice.control };
        }),
      ),
    ).toThrow(/choice selected: the API already has selected/);
    expect(() =>
      build(
        'Interactive Card',
        changed('Interactive Card', (o) => {
          o.choice.control.layers.radio = 'nope';
        }),
      ),
    ).toThrow(/choice control: the IR has no layer nope/);
    expect(() =>
      build(
        'Launch Card',
        changed('Launch Card', (o) => {
          o.choice.favouritePlace.content = 'nope';
        }),
      ),
    ).toThrow(/choice favouritePlace: the IR has no layer nope/);
  });
});

describe('hides', () => {
  it('reads what a composed child draws, a list of its layers', () => {
    const o = yaml(
      'component: X\nhides:\n  tag:\n    not: [label]\n    reason: r\n',
    );
    expect(o.hides.tag).toEqual({ not: ['label'], reason: 'r' });
  });

  it('refuses a not that is no non-empty list of names', () => {
    const refused = /hides.tag: not must list the child's layers it draws/;
    for (const not of ['[]', 'label', '[1]', '[label, 2]'])
      expect(
        () =>
          yaml(
            `component: X\nhides:\n  tag:\n    not: ${not}\n    reason: r\n`,
          ),
        not,
      ).toThrow(refused);
    expect(() => yaml('component: X\nhides:\n  tag:\n    reason: r\n')).toThrow(
      refused,
    );
  });
});

describe('set, onto a look no layer has', () => {
  it('adds File Card’s file tile, whose axes another look has, at a value Figma draws', () => {
    const without = build(
      'File Card',
      changed('File Card', (o) => {
        delete o.set['root.appearance.*.focus.shadow'];
      }),
    ).spec;
    expect(looksOf(without).has('type=file')).toBe(false);
    expect(looksOf(without).has('type=create')).toBe(true);
    const { spec } = build('File Card');
    expect(spec.style.root.appearance['type=file'].focus.shadow).toMatchObject({
      token: 'shadow.focus.default',
      from: 'overlay',
    });
  });

  it('reaches every look Figma draws where the look is a pattern', () => {
    const { spec } = build('File Card');
    for (const look of ['type=file', 'type=create'])
      expect(spec.style.root.appearance[look].focus.shadow.token, look).toBe(
        'shadow.focus.default',
      );
    // Card's loading look too, which no rule named before the pattern.
    const card = build('Card').spec;
    expect(
      card.style.root.appearance['status=none, loading=true'].focus.shadow
        .token,
    ).toBe('shadow.focus.default');
  });

  it('adds default where no layer has any look (Launch Card)', () => {
    const without = build(
      'Launch Card',
      changed('Launch Card', (o) => {
        delete o.set['root.appearance.default.focus.shadow'];
      }),
    ).spec;
    expect(looksOf(without).size).toBe(0);
    const { spec } = build('Launch Card');
    expect(spec.style.root.appearance.default.focus.shadow).toMatchObject({
      token: 'shadow.focus.default',
      from: 'overlay',
    });
  });

  it('still refuses a look of a value Figma does not draw, of another axis, or other than default where none has one', () => {
    const set = (component, at) =>
      build(
        component,
        changed(component, (o) => {
          o.set[at] = { token: 'shadow.focus.default', reason: 'r' };
        }),
      );
    expect(() =>
      set('File Card', 'root.appearance.type=Nope.focus.shadow'),
    ).toThrow(
      /set root.appearance.type=Nope.focus.shadow: the IR has no appearance type=Nope/,
    );
    expect(() =>
      set('File Card', 'root.appearance.kind=File Card.focus.shadow'),
    ).toThrow(/the IR has no appearance kind=File Card/);
    expect(() =>
      set('Launch Card', 'root.appearance.hover=true.focus.shadow'),
    ).toThrow(/the IR has no appearance hover=true/);
  });
});

describe('rename, of an axis’s values alone', () => {
  it('respells File Card’s type as file and create, keeping its name', () => {
    const { spec } = build('File Card');
    expect(spec.api.type).toEqual({
      values: ['file', 'create'],
      default: 'file',
    });
    expect(Object.keys(spec.style.root.appearance).sort()).toEqual([
      'type=create',
      'type=file',
    ]);
  });

  it('still refuses a rename onto another prop the API has, or onto its own name with no values', () => {
    expect(() =>
      build(
        'Interactive Card',
        changed('Interactive Card', (o) => {
          o.rename.drag.to = 'selected';
        }),
      ),
    ).toThrow(/rename drag: the API already has selected/);
    expect(() =>
      build(
        'File Card',
        changed('File Card', (o) => {
          delete o.rename.type.values;
        }),
      ),
    ).toThrow(/rename type: the API already has type/);
  });
});

describe('the oracle of a choice', () => {
  it('checks each Interactive Card variant once per control, the others not drawn', () => {
    const { oracle, set } = oracleOf('Interactive Card');
    const figma = new Set(oracle.variants.map((v) => v.figma));
    expect(oracle.variants).toHaveLength(12);
    expect(figma.size * 4).toBe(12);
    expect(figma.size).toBe(set.variants.length);
    const layerOf = {
      checkbox: 'checkbox',
      radio: 'radioButton',
      toggle: 'toggle',
    };
    for (const v of oracle.variants) {
      expect(['none', 'checkbox', 'radio', 'toggle']).toContain(
        v.props.control,
      );
      for (const [value, layer] of Object.entries(layerOf)) {
        const entry = v.layers[layer];
        if (value === v.props.control) {
          expect(entry, `${v.figma} ${layer}`).not.toHaveProperty('hidden');
          expect(entry).not.toHaveProperty('unchosen');
        } else
          expect(entry, `${v.figma} ${layer}`).toMatchObject({
            hidden: true,
            unchosen: true,
          });
      }
    }
    for (const f of figma)
      expect(
        oracle.variants
          .filter((v) => v.figma === f)
          .map((v) => v.props.control),
      ).toEqual(['none', 'checkbox', 'radio', 'toggle']);
  });

  it('checks each Launch Card variant with an image and without, the favourite then beside the name', () => {
    const { oracle, set } = oracleOf('Launch Card');
    expect(oracle.variants).toHaveLength(set.variants.length * 2);
    for (let i = 0; i < oracle.variants.length; i += 2) {
      const [filled, empty] = oracle.variants.slice(i, i + 2);
      expect(filled.figma).toBe(empty.figma);
      expect(filled.content).toEqual(['image']);
      expect(empty.content).toEqual([]);
      expect(filled.props).toEqual(empty.props);
      expect(filled.props).not.toHaveProperty('favouritePlace');
      expect(filled.layers.image).not.toHaveProperty('hidden');
      expect(filled.layers.favourite).not.toHaveProperty('hidden');
      expect(filled.layers.favouriteNoImage).toMatchObject({
        hidden: true,
        unchosen: true,
      });
      for (const layer of ['image', 'favourite'])
        expect(empty.layers[layer], `${empty.figma} ${layer}`).toMatchObject({
          hidden: true,
          unchosen: true,
        });
      expect(empty.layers.favouriteNoImage).not.toHaveProperty('hidden');
      expect(empty.layers.favouriteNoImage).not.toHaveProperty('unchosen');
    }
  });
});

describe('hideInComposed, with the overlay’s hides', () => {
  const batch = (oracle) =>
    oracle.variants.find((v) => v.figma === 'state=default, type=batch');

  it('keeps what Device Card’s Tag and Dropdown draw, whatever names Figma records hidden', () => {
    const overlay = loadOverlay('Device Card');
    const { oracle, spec, set } = oracleOf('Device Card', overlay);
    hideInComposed(oracle, spec, set, specs, overlay);
    const v = batch(oracle);
    expect(v.layers.headlineTag.component).toBe('Tag');
    expect(v.layers.devices.component).toBe('Dropdown');
    expect(v.layers.headlineTag.hides).not.toContain('label');
    expect(v.layers.devices.hides).not.toContain('fieldLabel');
    // As the stage builds it.
    expect(v.layers.headlineTag.hides).toEqual(
      batch(of('Device Card').oracle).layers.headlineTag.hides,
    );
  });

  it('would hide the Tag’s label and the Dropdown’s field label without them', () => {
    const overlay = changed('Device Card', (o) => delete o.hides);
    const { oracle, spec, set } = oracleOf('Device Card', overlay);
    hideInComposed(oracle, spec, set, specs, overlay);
    const v = batch(oracle);
    expect(v.layers.headlineTag.hides).toContain('label');
    expect(v.layers.devices.hides).toContain('fieldLabel');
  });

  it('refuses a not naming a layer the child lacks, or a layer that is no composed child', () => {
    const run = (change) => {
      const overlay = changed('Device Card', change);
      const { oracle, spec, set } = oracleOf('Device Card', overlay);
      return () => hideInComposed(oracle, spec, set, specs, overlay);
    };
    expect(
      run((o) => {
        o.hides.headlineTag.not = ['nope'];
      }),
    ).toThrow(
      'spec/overlay/device-card.yaml: hides headlineTag: Tag has no layer nope',
    );
    expect(
      run((o) => {
        o.hides.root = { not: ['label'], reason: 'r' };
      }),
    ).toThrow(
      'spec/overlay/device-card.yaml: hides root: no composed child there',
    );
  });
});

describe('the card shells', () => {
  const card = of('Card').spec;
  const react = descriptor('Card').templates.react(card);

  it('draws Card’s title as the stretched action, announced busy while loading, its More a named button', () => {
    expect(react).toContain('className="SolarCard-press"');
    expect(react).toContain('aria-busy={loading || undefined}');
    expect(react).toContain('aria-label={moreLabel}');
    expect(react).toContain("moreLabel = 'More actions'");
  });

  it('defines CardMoreItem in Card, which Status Card imports', () => {
    expect(react).toContain('export interface CardMoreItem');
    expect(react).not.toContain('import type { CardMoreItem }');
    const status = descriptor('Status Card').templates.react(
      of('Status Card').spec,
    );
    expect(status).toContain("import type { CardMoreItem } from './Card.js';");
    expect(status).not.toContain('export interface CardMoreItem');
    const dart = descriptor('Card').templates.flutter(card);
    expect(dart).toContain('class SolarCardMoreItem');
  });

  it('builds the props of a card with no API as a constant (Event Row)', () => {
    const row = of('Event Row').spec;
    expect(row.api).toEqual({});
    expect(descriptor('Event Row').templates.flutter(row)).toContain(
      'const p = SolarEventRowProps();',
    );
    expect(descriptor('Card').templates.flutter(card)).toContain(
      'final p = SolarCardProps(',
    );
  });

  it('refuses a descriptor prop naming a layer the IR lacks', () => {
    const o = {
      look: 'l',
      about: 'a',
      title: 'titleTitle',
      props: [
        { name: 'title', kind: 'text', layer: 'titleTitle', required: true },
        { name: 'nope', kind: 'text', layer: 'nope' },
      ],
    };
    expect(() => cardReact(card, o)).toThrow('Card: the IR has no nope layer');
    expect(() => cardFlutter(card, o)).toThrow(
      'Card: the IR has no nope layer',
    );
    expect(() => cardReact(card, { ...o, title: 'nope', props: [] })).toThrow(
      'Card: the IR has no nope layer',
    );
  });

  it('refuses a Card IR without a slot its descriptor draws', () => {
    const spec = structuredClone(card);
    delete spec.slots.icon;
    expect(() => descriptor('Card').templates.react(spec)).toThrow(
      'Card: the IR has no icon slot',
    );
  });
});

describe('card recipes', () => {
  it('hugs Split Dropdown’s top content, where Figma fills its zone', () => {
    expect(
      of('Split Dropdown').spec.style.topContent.base.height,
    ).toMatchObject({
      keyword: 'HUG',
      from: 'overlay',
      replaced: { keyword: 'FILL' },
    });
  });

  it('draws Insight Card Small’s severity tile as one layer, its StatusIndicator one', () => {
    const { spec } = of('Insight Card Small');
    const layers = Object.entries(spec.layers);
    expect(
      layers.filter(([name]) => /statusIndicator/i.test(name)).map(([n]) => n),
    ).toEqual(['statusIndicator']);
    expect(spec.layers.statusIndicator).toMatchObject({
      path: '/Icon/StatusIndicator',
      parent: 'icon',
    });
    expect(layers.some(([, l]) => l.path.startsWith('/Container'))).toBe(false);
    expect(spec.overlay.rules).toContainEqual(
      expect.objectContaining({ rule: 'same', at: '/Container → /Icon' }),
    );
  });
});

describe('defaults, a default of the API’s own', () => {
  it('starts an Image Card unselected, where Figma’s default variant is selected', () => {
    expect(build('Image Card').spec.api.selected).toEqual({
      type: 'boolean',
      default: false,
    });
    const figma = build(
      'Image Card',
      changed('Image Card', (o) => delete o.defaults),
    ).spec.api.selected;
    expect(figma.default).toBe(true);
  });

  it('refuses a prop the API lacks, or a value the prop has not', () => {
    expect(() =>
      build(
        'Image Card',
        changed('Image Card', (o) => {
          o.defaults = { nope: { value: false, reason: 'r' } };
        }),
      ),
    ).toThrow(/defaults nope: the API has no nope/);
    expect(() =>
      build(
        'Image Card',
        changed('Image Card', (o) => {
          o.defaults = { selected: { value: 'yes', reason: 'r' } };
        }),
      ),
    ).toThrow(/defaults selected: yes is no value of selected/);
  });
});
