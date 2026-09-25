/**
 * Calendar parts (milestone 4, F13): their IRs, and the machinery they brought: a dashed stroke
 * (Time Slot's half-hour rule, FileUpload's drop zone) from the fetcher to both recipes and the
 * oracle, a line drawn as the top edge of a box that spans its parent, a fixed size that never
 * shrinks on the web, and what a standalone component hides.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';
import { componentOf } from '../src/normalize/components.mjs';

const { built, tokens } = stage.build();
const of = (name) => built.find((b) => b.spec.component === name);

describe('a dashed stroke', () => {
  it('is Figma’s pattern in the IR and the oracle', () => {
    const { spec, oracle } = of('FileUpload');
    expect(spec.style.field.base.borderDash).toMatchObject({ dash: [3, 3] });
    const first = oracle.variants[0];
    expect(first.layers.field.borderDash).toEqual([3, 3]);
  });

  it('is CSS’s dashed on the web, Figma’s pattern in Flutter', () => {
    const { spec } = of('FileUpload');
    const css = JSON.stringify(renderMuiComponent(spec, tokens).styles);
    expect(css).toContain('"--solar-border-style":"dashed"');
    expect(css).toContain('var(--solar-border-style, solid)');
    expect(renderFlutterComponent(spec, tokens).dart).toContain(
      "'field.borderDash|base': 'd:3,3',",
    );
  });

  it('is solid where a variant of the layer draws it so, and the oracle says so', () => {
    const { spec, oracle } = of('Image Card');
    const shown = oracle.variants.find((v) => v.props.filled === true);
    expect(shown.layers.root.borderDash).toBe(false);
    expect(JSON.stringify(spec.style.root)).toContain(
      '"borderDash":{"none":true',
    );
    // A component with no dashed layer reads none of it.
    expect(
      JSON.stringify(renderMuiComponent(of('Button').spec, tokens).styles),
    ).not.toContain('--solar-border-style');
  });
});

describe('a line', () => {
  const { spec, oracle } = of('Time Slot');
  const rule = spec.style.halfHourRule.base;

  it('is the top edge of a box as tall as its stroke, not Figma’s outline of it', () => {
    expect(rule.glyph).toBeUndefined();
    expect(rule.borderTopWidth).toMatchObject({ token: 'border.default' });
    expect(rule.borderBottomWidth).toMatchObject({ none: true });
    expect(rule.height).toMatchObject({ token: 'border.default' });
    expect(rule.width).toMatchObject({ keyword: 'FILL' });
    expect(oracle.variants[0].layers.halfHourRule).toMatchObject({
      borderTopWidth: 1,
      borderBottomWidth: 0,
      borderDash: [2, 4],
    });
  });
});

describe('a size inside a component on the web', () => {
  it('never shrinks where it is fixed, and fills only the room left where it fills', () => {
    const { styles } = renderMuiComponent(of('Agenda Row').spec, tokens);
    const css = JSON.stringify(styles);
    expect(css).toContain('"width":"8px","minWidth":"8px"');
    expect(css).toContain('"width":"100%","minWidth":0');
  });

  it('leaves the root to the page, which may be narrower than Figma draws it', () => {
    const css = JSON.stringify(
      renderMuiComponent(of('Dialog').spec, tokens).styles,
    );
    expect(css).toContain('"width":"480px"');
    expect(css).not.toContain('"minWidth":"480px"');
  });
});

describe('a standalone component', () => {
  it('records what it hides by path, as a set’s variants do', () => {
    const toolbar = componentOf({
      kind: 'standalone',
      section: 'components/calendar',
      slug: 'calendar-toolbar',
      name: 'Calendar Toolbar',
    });
    expect(toolbar.variants[0].hiddenPaths).toContain(
      '/Right/View Switcher/Label',
    );
    const { oracle } = of('Calendar Toolbar');
    expect(oracle.variants[0].layers.views.hides).toContain('label');
  });
});

describe('the family’s IRs', () => {
  it('decide every finding', () => {
    for (const name of [
      'Event Chip',
      'Calendar Day Cell',
      'Weekday Header',
      'Time Axis Label',
      'Time Slot',
      'All-Day Bar',
      'Agenda Row',
      'Calendar Toolbar',
    ])
      expect(
        of(name).deviations.filter((d) => !d.decision),
        name,
      ).toEqual([]);
  });

  it('set a look by Figma’s axis names, before the rename to variant', () => {
    const { spec } = of('All-Day Bar');
    expect(
      spec.style.title.appearance['variant=solid, span=end'].default.typography,
    ).toMatchObject({ token: 'typography.body.sm.semibold' });
    expect(
      spec.style.title.appearance['variant=subtle, span=end'],
    ).toBeUndefined();
  });
});
