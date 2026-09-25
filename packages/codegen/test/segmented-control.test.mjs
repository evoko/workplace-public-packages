/**
 * Segmented Control and its Item (milestone 4, F3): their IR, and the recipes each emitter makes
 * of them. A radio group of segments; the label Figma always hides, drawn where given (shownBy).
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

describe('the Segmented Control Item IR', () => {
  const { spec, deviations } = of('Segmented Control Item');

  it('takes selected and a size, an icon either side, and gains a focus ring', () => {
    expect(Object.keys(spec.api).sort()).toEqual(['selected', 'size']);
    expect(Object.keys(spec.slots).sort()).toEqual([
      'iconLeading',
      'iconTrailing',
    ]);
    expect(spec.states).toEqual(['default', 'hover', 'focus']);
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('keeps an unselected segment’s edge, transparent, so choosing one does not grow it', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(styles.root.borderStyle).toBe('solid');
    expect(styles.appearances['selected=false'].borderColor).toBe(
      'transparent',
    );
  });

  it('rings the segment whose radio input has keyboard focus', () => {
    const { styles } = renderMuiComponent(spec, tokens);
    expect(
      styles.appearances['selected=true'][
        '&:has(.SolarSegmentedControlItem-input:focus-visible)'
      ],
    ).toMatchObject({ boxShadow: 'var(--solar-shadow-focus-default)' });
  });
});

describe('the Segmented Control IR', () => {
  const { spec, deviations, oracle } = of('Segmented Control');

  it('takes a size, a label, a starred mandatory, a helper and its track of segments', () => {
    expect(Object.keys(spec.api)).toEqual(['size']);
    expect(spec.slots.track.type).toBe('content');
    expect(deviations.filter((d) => !d.decision)).toEqual([]);
  });

  it('leaves the segments’ heights to them', () => {
    expect(spec.style.segmentedControlItem.base.height).toMatchObject({
      none: true,
    });
  });

  it('shows the label, and its words Figma hides, where the caller fills it', () => {
    // Figma's show label (2026-09-25) shows the label's frame, and its words stay hidden: the
    // overlay's shownBy draws them by the label slot.
    expect(oracle.slots).toMatchObject({
      label: 'filled label',
      labelLabel: 'filled label',
    });
  });
});

describe('the overlay forms F3 added', () => {
  const catalog = loadWebCatalog();
  const names = tokenNames(loadContract());
  const on = (component, text) =>
    buildComponentSpec(loadComponent(catalog, component), {
      names,
      fileVersion: catalog.fileVersion,
      overlay: parseOverlay(`component: ${component}\n${text}`, 'test.yaml'),
    });

  it('shownBy refuses a layer Figma shows in some variant, and a slot the component lacks', () => {
    expect(() =>
      on(
        'Segmented Control',
        'shownBy:\n  track: { slot: label, reason: r }\n',
      ),
    ).toThrow(/shownBy track: Figma shows track in some variant already/);
    expect(() =>
      on(
        'Segmented Control',
        'shownBy:\n  label: { slot: title, reason: r }\n',
      ),
    ).toThrow(/shownBy label: Segmented Control has no slot title/);
  });

  it('set gives focus to a component Figma draws without one, and no other state', () => {
    const { spec } = on(
      'Toggle',
      'set:\n  root.appearance.selected=false.focus.shadow: { token: shadow.focus.default, reason: r }\n',
    );
    expect(spec.states).toContain('focus');
    expect(() =>
      on(
        'Toggle',
        'set:\n  root.appearance.selected=false.pressed.shadow: { token: shadow.focus.default, reason: r }\n',
      ),
    ).toThrow(/the IR has no appearance pressed/);
  });
});
