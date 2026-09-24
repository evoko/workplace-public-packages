/**
 * F4's members (milestone 4): Alert, Alert Small, Banner, Toast and EmptyState, their IR and the
 * recipes made of them, and the overlay forms they brought (restyles, a child's variant set).
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import { parseOverlay } from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';

const { built, tokens } = stage.build();
const of = (name) => built.find((b) => b.spec.component === name);
const open = (name) => of(name).deviations.filter((d) => !d.decision);

describe('the callouts', () => {
  it('take a type and a variant (Figma’s style), fill their space, and decide every finding', () => {
    for (const name of ['Alert', 'Alert Small']) {
      const { spec } = of(name);
      expect(Object.keys(spec.api).sort(), name).toEqual(['type', 'variant']);
      expect(Object.keys(spec.slots).sort(), name).toEqual([
        'action',
        'description',
        'title',
      ]);
      expect(spec.style.root.base.width, name).toMatchObject({
        keyword: 'FILL',
      });
      expect(open(name), name).toEqual([]);
    }
  });

  it('show the StatusIndicator of their type, a size of its own', () => {
    const { spec } = of('Alert');
    expect(spec.style.statusIndicator.base['variant.size']).toMatchObject({
      keyword: 'md',
    });
    expect(
      spec.style.statusIndicator.appearance['type=default, variant=filled']
        .default['variant.type'],
    ).toMatchObject({ keyword: 'neutral' });
  });
});

describe('the Banner', () => {
  it('draws SOLAR’s icon for its type, the caller’s Buttons, and decides every finding', () => {
    const { spec } = of('Banner');
    expect(Object.keys(spec.slots).sort()).toEqual([
      'action',
      'close',
      'description',
      'primaryButton',
      'secondaryButton',
    ]);
    expect(spec.style.primaryButton.base.height).toMatchObject({ none: true });
    expect(open('Banner')).toEqual([]);
  });
});

describe('the EmptyState', () => {
  it('holds the caller’s icon, words and Button, and decides every finding', () => {
    const { spec } = of('EmptyState');
    expect(Object.keys(spec.api)).toEqual([]);
    expect(Object.keys(spec.slots).sort()).toEqual([
      'action',
      'description',
      'icon',
      'title',
    ]);
    expect(open('EmptyState')).toEqual([]);
    const { styles } = renderMuiComponent(spec, tokens);
    expect(
      styles.reset['& .SolarEmptyState-title, & .SolarEmptyState-description'],
    ).toEqual({
      whiteSpace: 'normal',
      textAlign: 'center',
    });
  });
});

describe('the Toast', () => {
  const { spec, oracle } = of('Toast');

  it('draws its Tag as a status tag, where Figma names a type Tag no longer has', () => {
    expect(spec.style.tag.base['variant.type']).toMatchObject({
      keyword: 'status',
      replaced: { keyword: 'pill' },
    });
    const tag = oracle.variants[0].layers.tag;
    expect(tag.variant.type).toBe('status');
    expect(tag.figmaVariant.type).toBe('pill');
    expect(open('Toast')).toEqual([]);
  });

  it('restyles its Tag, on its own surface and edge, on the Tag’s own root', () => {
    expect(spec.style.tag.base.background).toMatchObject({
      token: 'color.surface.overlay',
    });
    const info = oracle.variants.find((v) => v.figma === 'status=info').layers
      .tag;
    expect(info).toHaveProperty('background');
    expect(info).toHaveProperty('borderColor');
    const { styles } = renderMuiComponent(spec, tokens);
    expect(styles.root['& .SolarToast-tag']['& > *']).toMatchObject({
      backgroundColor: 'var(--solar-color-surface-overlay)',
    });
  });

  it('refuses to restyle a layer that is no composed child, or a cell it cannot', () => {
    const catalog = loadWebCatalog();
    const on = (text) =>
      buildComponentSpec(loadComponent(catalog, 'Toast'), {
        names: tokenNames(loadContract()),
        fileVersion: catalog.fileVersion,
        overlay: parseOverlay(`component: Toast\n${text}`, 'test.yaml'),
      });
    expect(() =>
      on('restyles:\n  root: { cells: [background], reason: r }\n'),
    ).toThrow(/restyles root: the IR has no composed child root/);
    expect(() =>
      on('restyles:\n  tag: { cells: [radius], reason: r }\n'),
    ).toThrow(/restyles tag: cells must be some of background, borderColor/);
  });
});
