/**
 * F9, the paging family (milestone 4): PaginationItem, PaginationNav, PaginationEllipsis and
 * Pagination, PageNavButton and PageNavigator, Stepper Indicator, Step and Stepper. What they
 * brought: an icon that follows one axis, a Step pressable whenever it has an `onPressed`, a
 * composed child's variant decided where Figma records none, a standalone child in the visual
 * checks, and the overlays and descriptors that decide the rest.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { DESCRIPTORS } from '../src/components/index.mjs';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import { loadDefaults, loadOverlay } from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';
import {
  dartIcon,
  drawnFlutter,
  iconsOf,
  reactIcon,
} from '../src/shells/drawn.mjs';
import { FLUTTER_TEMPLATES, TEMPLATES } from '../src/shells/index.mjs';
import { packagesDir, specDir } from '../src/util/paths.mjs';
import { buildOracle } from '../src/verify/oracle.mjs';

const { built, tokens } = stage.build();
const of = (name) => built.find((b) => b.spec.component === name);
const committed = (dir, file) =>
  JSON.parse(readFileSync(join(specDir, dir, `${file}.json`), 'utf8'));
const read = (...parts) => readFileSync(join(packagesDir, ...parts), 'utf8');
const descriptor = (name) => DESCRIPTORS.find((d) => d.name === name);

const names = tokenNames(loadContract());
const catalog = loadWebCatalog();
const defaults = loadDefaults();
const build = (component, overlay) =>
  buildComponentSpec(loadComponent(catalog, component), {
    names,
    fileVersion: catalog.fileVersion,
    overlay,
    defaults,
  });
// The build's findings no overlay rule decides.
const open = ({ deviations }) =>
  deviations.filter((d) => !d.decision).map((d) => d.token);
// The findings left open once `drop` takes rules out of the component's overlay.
const without = (component, drop) => {
  const overlay = structuredClone(loadOverlay(component));
  drop(overlay);
  return open(build(component, overlay));
};

const F9 = [
  'PaginationItem',
  'PaginationNav',
  'PaginationEllipsis',
  'Pagination',
  'PageNavButton',
  'PageNavigator',
  'Stepper Indicator',
  'Step',
  'Stepper',
];

describe('F9', () => {
  it('builds every member with each finding decided', () => {
    for (const name of F9) expect(open(of(name)), name).toEqual([]);
  });
});

describe('an icon that follows one axis', () => {
  // A one-layer spec whose `icon` draws ChevronLeft at rest, and whatever `style` adds.
  const fake = (style = {}, api) => ({
    component: 'Fake',
    api: api ?? {
      direction: { values: ['previous', 'next'], default: 'previous' },
    },
    slots: {},
    layers: {
      root: { type: 'FRAME', parent: null, path: '/' },
      icon: { type: 'INSTANCE', parent: 'root', path: '/Icon' },
    },
    style: {
      icon: {
        base: { component: { keyword: 'Icon/ChevronLeft' } },
        size: {},
        appearance: {},
        ...style,
      },
    },
  });
  const next = { component: { keyword: 'Icon/ChevronRight' } };
  const refused = /Fake icon: one layer draws icons by more than one axis/;

  it('leaves an icon of one name without byAxis, wherever it is named', () => {
    const one = {
      layer: 'icon',
      react: 'IconChevronLeft',
      solid: false,
      dart: 'SolarIcons.chevronLeftOutline',
    };
    expect(iconsOf(fake())).toEqual([one]);
    const again = fake({
      appearance: {
        'direction=next': {
          default: { component: { keyword: 'Icon/ChevronLeft' } },
        },
      },
    });
    expect(iconsOf(again)).toEqual([one]);
    const [icon] = iconsOf(again);
    expect(icon).not.toHaveProperty('byAxis');
    expect(reactIcon(icon, again)).toBe('<IconChevronLeft />');
    expect(dartIcon(icon, again)).toBe('SolarIcons.chevronLeftOutline');
  });

  it('gives a layer whose icon changes by one axis the icon of each value, the base’s elsewhere', () => {
    const spec = fake({ appearance: { 'direction=next': { default: next } } });
    expect(iconsOf(spec)).toEqual([
      {
        layer: 'icon',
        react: 'IconChevronLeft',
        solid: false,
        dart: 'SolarIcons.chevronLeftOutline',
        byAxis: {
          axis: 'direction',
          values: {
            next: {
              react: 'IconChevronRight',
              dart: 'SolarIcons.chevronRightOutline',
            },
            previous: {
              react: 'IconChevronLeft',
              dart: 'SolarIcons.chevronLeftOutline',
            },
          },
        },
      },
    ]);
  });

  it('renders the choice by the prop on each platform, solid where the layer is', () => {
    const spec = fake({ appearance: { 'direction=next': { default: next } } });
    const [icon] = iconsOf(spec);
    expect(reactIcon(icon, spec)).toBe(
      '({ "next": <IconChevronRight />, "previous": <IconChevronLeft /> } as const)[direction ?? "previous"]',
    );
    expect(dartIcon(icon, spec)).toBe(
      'switch (direction) { SolarFakeDirection.next => SolarIcons.chevronRightOutline, SolarFakeDirection.previous => SolarIcons.chevronLeftOutline, }',
    );
    const solid = fake({
      base: {
        component: { keyword: 'Icon/ChevronLeft' },
        'variant.solid': { keyword: 'true' },
      },
      appearance: { 'direction=next': { default: next } },
    });
    const [s] = iconsOf(solid);
    expect(s.solid).toBe(true);
    expect(s.byAxis.values.next.dart).toBe('SolarIcons.chevronRightSolid');
    expect(reactIcon(s, solid)).toContain(
      '"next": <IconChevronRight variant="solid" />',
    );
  });

  it('refuses an icon that changes by two axes, by state, or by size', () => {
    const twoInOne = fake({
      appearance: { 'direction=next, tone=muted': { default: next } },
    });
    expect(() => iconsOf(twoInOne)).toThrow(refused);
    const twoApart = fake(
      {
        appearance: {
          'direction=next': { default: next },
          'tone=muted': { default: next },
        },
      },
      {
        direction: { values: ['previous', 'next'], default: 'previous' },
        tone: { values: ['regular', 'muted'], default: 'regular' },
      },
    );
    expect(() => iconsOf(twoApart)).toThrow(refused);
    const byState = fake({ appearance: { 'direction=next': { hover: next } } });
    expect(() => iconsOf(byState)).toThrow(refused);
    const bySize = fake({ size: { lg: next } });
    expect(() => iconsOf(bySize)).toThrow(refused);
    const combined = fake({
      combined: { 'size=lg': { 'direction=next': { default: next } } },
    });
    expect(() => iconsOf(combined)).toThrow(refused);
  });

  it('refuses an axis the API does not list the values of', () => {
    const spec = fake(
      { appearance: { 'direction=next': { default: next } } },
      { direction: { type: 'boolean', default: false } },
    );
    expect(() => iconsOf(spec)).toThrow(refused);
  });

  it('draws PaginationNav’s chevron left for previous and right for next', () => {
    const icon = committed('components', 'paginationnav').style.icon;
    expect(icon.base.component.keyword).toBe('Icon/ChevronLeft');
    expect(icon.appearance['direction=next'].default.component.keyword).toBe(
      'Icon/ChevronRight',
    );
    const { spec } = of('PaginationNav');
    const [i] = iconsOf(spec);
    expect(i.byAxis.axis).toBe('direction');
    expect(i.byAxis.values).toEqual({
      next: {
        react: 'IconChevronRight',
        dart: 'SolarIcons.chevronRightOutline',
      },
      previous: {
        react: 'IconChevronLeft',
        dart: 'SolarIcons.chevronLeftOutline',
      },
    });
    // Without follows, the chevron's direction is an axis finding.
    expect(without('PaginationNav', (o) => delete o.follows)).toEqual(
      ['default', 'disabled', 'focus', 'hover', 'pressed'].map(
        (s) =>
          `component.paginationnav.icon.component@direction=next, state=${s}`,
      ),
    );
  });

  it('renders PaginationNav’s shells with the map, Flutter’s icons no longer const', () => {
    const { spec } = of('PaginationNav');
    const react = TEMPLATES.PaginationNav(spec);
    expect(react).toContain(
      "import { IconChevronLeft, IconChevronRight } from '@bwp-web/assets';",
    );
    expect(react).toContain(
      'icons: { icon: ({ "next": <IconChevronRight />, "previous": <IconChevronLeft /> } as const)[direction ?? "previous"] },',
    );
    const widget = FLUTTER_TEMPLATES.PaginationNav(spec);
    expect(widget).toContain(
      "icons: {'icon': switch (direction) { SolarPaginationNavDirection.next => SolarIcons.chevronRightOutline, SolarPaginationNavDirection.previous => SolarIcons.chevronLeftOutline, }},",
    );
    expect(widget).not.toContain('icons: const {');
    // The committed shell, formatted.
    expect(read('components/src/PaginationNav.tsx')).toContain('} as const');
    expect(
      read('solar_flutter/lib/src/components/solar_paginationnav.dart'),
    ).toContain(
      'SolarPaginationNavDirection.next => SolarIcons.chevronRightOutline,',
    );
  });

  it('keeps PageNavButton’s arrows, one icon each, in a const map', () => {
    const { spec } = of('PageNavButton');
    const icons = iconsOf(spec);
    expect(icons.map((i) => i.layer)).toEqual([
      'iconArrowLeft',
      'iconArrowRight',
    ]);
    for (const i of icons) expect(i, i.layer).not.toHaveProperty('byAxis');
    expect(FLUTTER_TEMPLATES.PageNavButton(spec)).toContain('icons: const {');
  });
});

describe('drawnFlutter’s pressable', () => {
  const { spec } = of('Step');
  const look = { look: 'l', about: 'a' };

  it('passes onPressed as it is where pressable is true (Step’s shell)', () => {
    const widget = drawnFlutter(spec, { ...look, pressable: true });
    expect(widget).toContain('            onPressed: onPressed,');
    expect(widget).not.toContain('? onPressed : null');
    expect(FLUTTER_TEMPLATES.Step(spec)).toContain(
      '            onPressed: onPressed,',
    );
    expect(read('solar_flutter/lib/src/components/solar_step.dart')).toContain(
      'onPressed: onPressed,',
    );
  });

  it('guards it with the expression where pressable is one', () => {
    const widget = drawnFlutter(spec, { ...look, pressable: '!disabled' });
    expect(widget).toContain('onPressed: !disabled ? onPressed : null,');
  });
});

describe('a composed child’s variant, decided where Figma records none', () => {
  const lineText = (oracle) =>
    oracle.variants.find((v) => v.figma === 'type=line+text').layers;

  it('checks Stepper’s first line+text step as a complete horizontal Step', () => {
    const layers = lineText(committed('verify', 'stepper'));
    expect(layers.stepCompleteHorizontal).toMatchObject({
      component: 'Step',
      variant: { status: 'complete', type: 'horizontal' },
      figmaVariant: {},
    });
    expect(of('Stepper').spec.overlay.rules).toContainEqual(
      expect.objectContaining({
        rule: 'composes',
        at: 'Step/complete/horizontal → Step',
      }),
    );
    // Without the sets, the step has no variant to be checked in.
    const overlay = structuredClone(loadOverlay('Stepper'));
    delete overlay.set['stepCompleteHorizontal.base.variant.status'];
    delete overlay.set['stepCompleteHorizontal.base.variant.type'];
    const stepper = of('Stepper');
    const oracle = buildOracle(
      loadComponent(catalog, 'Stepper').set,
      stepper.spec,
      stepper.deviations,
      { tokens, names, overlay, fileVersion: catalog.fileVersion },
    );
    const bare = lineText(oracle).stepCompleteHorizontal;
    expect(bare.component).toBe('Step');
    expect(bare).not.toHaveProperty('variant');
    expect(bare).not.toHaveProperty('figmaVariant');
  });

  it('checks the line+text second step active, where Figma draws it upcoming', () => {
    expect(lineText(committed('verify', 'stepper')).step).toMatchObject({
      component: 'Step',
      variant: { status: 'active', type: 'horizontal' },
      figmaVariant: { status: 'upcoming', type: 'horizontal' },
    });
    expect(lineText(of('Stepper').oracle).step.variant.status).toBe('active');
  });

  it('checks Pagination’s previous arrow and PageNavigator’s previous button disabled', () => {
    const [pagination] = committed('verify', 'pagination').variants;
    expect(pagination.layers.previous).toMatchObject({
      component: 'PaginationNav',
      variant: { direction: 'previous', state: 'disabled' },
      figmaVariant: { direction: 'previous', state: 'default' },
    });
    expect(pagination.layers.next).not.toHaveProperty('figmaVariant');
    const [navigator] = committed('verify', 'pagenavigator').variants;
    expect(navigator.layers.prevButton).toMatchObject({
      component: 'PageNavButton',
      variant: { direction: 'prev', state: 'disabled' },
      figmaVariant: { direction: 'prev', state: 'default' },
    });
    expect(navigator.layers.nextButton).not.toHaveProperty('figmaVariant');
  });

  it('is what the build makes', () => {
    for (const [name, file] of [
      ['Stepper', 'stepper'],
      ['Pagination', 'pagination'],
      ['PageNavigator', 'pagenavigator'],
    ])
      expect(of(name).oracle, name).toEqual(committed('verify', file));
  });
});

describe('a standalone child in the visual checks', () => {
  it('names Pagination’s ellipsis PaginationEllipsis, with no variant', () => {
    const [v] = committed('verify', 'pagination').variants;
    expect(v.layers.paginationEllipsis.component).toBe('PaginationEllipsis');
    expect(v.layers.paginationEllipsis).not.toHaveProperty('variant');
    // Its one variant is named by no axes.
    expect(
      committed('verify', 'paginationellipsis').variants.map((x) => x.figma),
    ).toEqual(['']);
  });

  it('is taken by both harnesses, whose wanted variant defaults to none', () => {
    expect(read('components/test/visual/components.spec.mjs')).toContain(
      'function childVariant(oracle, wanted = {})',
    );
    const dart = read('solar_flutter/test/visual/harness.dart');
    expect(dart).toContain(
      "(expected['variant'] as Map<String, dynamic>?) ?? const {}",
    );
    expect(dart).toContain("if (part.contains('='))");
  });
});

describe('Stepper', () => {
  const { spec, deviations, oracle } = of('Stepper');

  it('leaves the progress bar’s box and its fill’s width to the shell', () => {
    const rules = spec.overlay.rules.filter((r) => r.rule === 'controlDraws');
    expect(rules.map((r) => [r.at, r.cells])).toEqual([
      ['progress', ['x', 'right', 'width']],
      ['progressRectangle2', ['width']],
    ]);
    const excused = oracle.variants
      .find((v) => v.figma === 'type=with label')
      .excused.filter((e) => e.decision === 'controlDraws')
      .map((e) => [e.layer, e.property]);
    expect(excused).toEqual([
      ['progress', 'right'],
      ['progress', 'width'],
      ['progressRectangle2', 'width'],
    ]);
    expect(without('Stepper', (o) => delete o.controlDraws)).toEqual([
      'component.stepper.progress.width#unbound',
      'component.stepper.progressRectangle2.width#unbound',
    ]);
  });

  it('draws no right padding on its bar, Figma’s 225 presentation only', () => {
    expect(spec.style.progress.base.paddingRight).toMatchObject({
      none: true,
      from: 'overlay',
      replaced: { literal: 225 },
    });
    expect(spec.style.progress.base.paddingRight.reason).toMatch(/design team/);
    const finding = deviations.find(
      (d) => d.token === 'component.stepper.progress.paddingRight#unbound',
    );
    expect(finding.decision.rule).toBe('set');
    expect(
      without('Stepper', (o) => delete o.set['progress.base.paddingRight']),
    ).toEqual(['component.stepper.progress.paddingRight#unbound']);
  });

  it('follows type for its direction, alignment, gap and height, the line one hugging', () => {
    for (const at of [
      'root.direction',
      'root.align',
      'root.gap',
      'root.height',
    ])
      expect(spec.overlay.rules, at).toContainEqual(
        expect.objectContaining({ rule: 'follows', at }),
      );
    const { base, appearance } = spec.style.root;
    expect(base.direction.keyword).toBe('VERTICAL');
    for (const type of ['no label', 'line', 'line+text'])
      expect(appearance[`type=${type}`].default.direction.keyword, type).toBe(
        'HORIZONTAL',
      );
    expect(appearance['type=line'].default.height).toMatchObject({
      keyword: 'HUG',
      from: 'overlay',
      replaced: { literal: 4 },
    });
    const findings = without('Stepper', (o) => delete o.follows);
    expect(findings).toHaveLength(10);
    for (const prop of ['direction', 'align', 'gap'])
      for (const type of ['line', 'line+text', 'no label'])
        expect(findings).toContain(
          `component.stepper.root.${prop}@type=${type}`,
        );
    expect(findings).toContain('component.stepper.root.height@type=line');
    expect(
      without(
        'Stepper',
        (o) => delete o.set['root.appearance.type=line.default.height'],
      ),
    ).toEqual(['component.stepper.root.height#unbound']);
  });

  it('draws its steps as the caller gives them, Figma’s showStep slots its own', () => {
    expect(descriptor('Stepper').shells.slots).toEqual({
      step3: null,
      step4: null,
      step5: null,
    });
  });
});

describe('Step and Stepper Indicator', () => {
  it('follows type for a Step’s alignment, gap and width', () => {
    const { spec } = of('Step');
    for (const at of ['root.align', 'root.gap', 'root.width'])
      expect(spec.overlay.rules, at).toContainEqual(
        expect.objectContaining({ rule: 'follows', at }),
      );
    // Round, a hugging row; horizontal, a stack as wide as its share.
    expect(spec.style.root.base).toMatchObject({
      align: { keyword: 'MIN/CENTER' },
      gap: { token: 'inset.xs' },
      width: { keyword: 'HUG' },
    });
    for (const status of spec.api.status.values)
      expect(
        spec.style.root.appearance[`status=${status}, type=horizontal`].default,
        status,
      ).toMatchObject({
        align: { keyword: 'MIN/MIN' },
        gap: { token: 'stack.xs' },
        width: { keyword: 'FILL' },
      });
    const findings = without('Step', (o) => delete o.follows);
    expect(findings).toHaveLength(12);
    for (const prop of ['align', 'gap', 'width'])
      for (const status of ['active', 'complete', 'error', 'upcoming'])
        expect(findings).toContain(
          `component.step.root.${prop}@status=${status}, type=horizontal`,
        );
  });

  it('follows status for a Stepper Indicator’s edge, upcoming and error edged', () => {
    const { spec } = of('Stepper Indicator');
    expect(spec.style.root.base.borderWidth.none).toBe(true);
    for (const status of ['upcoming', 'error'])
      expect(
        spec.style.root.appearance[`status=${status}`].default.borderWidth
          .token,
        status,
      ).toBe('border.default');
    expect(without('Stepper Indicator', (o) => delete o.follows)).toEqual([
      'component.stepper indicator.root.borderWidth@status=error',
      'component.stepper indicator.root.borderWidth@status=upcoming',
    ]);
  });
});

describe('PageNavButton', () => {
  const { spec, deviations } = of('PageNavButton');

  it('hugs its words and arrow, where Figma draws it 112 wide', () => {
    expect(spec.style.root.base.width).toMatchObject({
      keyword: 'HUG',
      from: 'overlay',
      replaced: { literal: 112 },
    });
    expect(without('PageNavButton', (o) => delete o.set)).toEqual([
      'component.pagenavbutton.root.width#unbound',
    ]);
  });

  it('accepts its alignment and the next button’s gap, the same in a hugging button', () => {
    const accepted = deviations
      .filter((d) => d.decision?.rule === 'accept')
      .map((d) => d.token);
    expect(accepted).toHaveLength(14);
    expect(accepted).toContain('component.pagenavbutton.root.gap#unbound');
    for (const token of accepted)
      expect(token).toMatch(
        /^component\.pagenavbutton\.root\.(align|gap)(#unbound|@direction=(next|prev), state=\w+)$/,
      );
    expect(without('PageNavButton', (o) => delete o.accept).sort()).toEqual(
      [...accepted].sort(),
    );
  });

  it('pads a 44 × 44 target around it in Flutter', () => {
    expect(FLUTTER_TEMPLATES.PageNavButton(spec)).toContain('target: true,');
  });
});

describe('the pagination’s items', () => {
  it('allow their 24px squares, bound to nothing', () => {
    for (const name of [
      'PaginationItem',
      'PaginationNav',
      'PaginationEllipsis',
    ]) {
      const { base } = of(name).spec.style.root;
      for (const cell of ['width', 'height']) {
        expect(base[cell].literal, `${name} ${cell}`).toBe(24);
        expect(base[cell].allowed, `${name} ${cell}`).toBeTruthy();
      }
      const lc = name.toLowerCase();
      expect(
        without(name, (o) => delete o.allowLiteral),
        name,
      ).toEqual([
        `component.${lc}.root.height#unbound`,
        `component.${lc}.root.width#unbound`,
      ]);
    }
  });

  it('take their own 24 × 24 box as their target in Flutter', () => {
    for (const name of ['PaginationItem', 'PaginationNav']) {
      expect(descriptor(name).templates, name).toBeDefined();
      const widget = FLUTTER_TEMPLATES[name](of(name).spec);
      expect(widget, name).toContain('target: false,');
      expect(widget, name).not.toContain('target: true,');
    }
  });

  it('name a PaginationItem’s page its children in React and its page in Flutter', () => {
    expect(descriptor('PaginationItem').shells.slots).toEqual({
      page: { react: 'children', flutter: 'page' },
    });
  });
});

describe('Pagination and PageNavigator', () => {
  it('export the rule of the pages shown from both shells', () => {
    expect(read('components/src/Pagination.tsx')).toContain(
      'export function pagesOf',
    );
    expect(
      read('solar_flutter/lib/src/components/solar_pagination.dart'),
    ).toContain('List<int?> solarPagesOf');
  });

  it('name the PageNavigator’s position its indicator', () => {
    expect(descriptor('PageNavigator').shells.slots).toEqual({
      pageIndicator: 'indicator',
    });
  });
});
