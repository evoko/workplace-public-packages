/**
 * Charts (milestone 4, F14): the chart theme a library draws in, generated from the chart IRs and
 * checked against them here (the per-variant visual check does not apply to a library's plot);
 * the components the library draws, built as IRs with no recipe of their own; and the machinery
 * the family brought: an axis taken from another component (the calendar's category) and an
 * `accept` pattern for a sample plot.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import {
  chartTheme,
  SEGMENT_ORDER,
  SERIES_ORDER,
} from '../src/emit/chart-theme.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { packagesDir } from '../src/util/paths.mjs';

const { built, tokens } = stage.build();
const specs = Object.fromEntries(built.map((b) => [b.spec.component, b.spec]));
const of = (name) => built.find((b) => b.spec.component === name);
const base = (name, layer, cell) => specs[name].style[layer].base[cell];

describe('the chart theme', () => {
  const theme = chartTheme(specs);

  it('takes the series order the owner chose, the charts’ own series first', () => {
    expect(theme.series).toEqual(
      SERIES_ORDER.map((n) => `color.data.category.${n}.strong`),
    );
    expect(theme.series[0]).toBe(
      base('Line Chart', 'lineA', 'borderColor').token,
    );
    // Series B, in a look of the multi chart.
    expect(JSON.stringify(specs['Line Chart'].style.lineB)).toContain(
      `"borderColor":{"token":"${theme.series[1]}"`,
    );
    expect(theme.segments).toEqual(
      SEGMENT_ORDER.map((n) => `color.data.category.${n}.strong`),
    );
  });

  it('carries each value from its IR cell', () => {
    expect(theme.line.width).toBe(
      base('Line Chart', 'lineA', 'borderWidth').token,
    );
    expect(theme.bar.radius).toBe(base('Bar', 'root', 'radius').token);
    expect(theme.axis.line).toBe(
      base('Chart Axis', 'axisLine', 'background').token,
    );
    expect(theme.axis.lineWidth).toBe(
      base('Chart Axis', 'axisLine', 'height').token,
    );
    expect(theme.axis.tickSize).toBe(
      base('Chart Axis', 'tickTickMark', 'height').literal,
    );
    expect(theme.axis.labelStyle).toBe(
      base('Chart Axis', 'tick0', 'typography').token,
    );
    expect(theme.grid.line).toBe(
      base('Chart Gridlines', 'gridline', 'background').token,
    );
    expect(theme.donut.inner).toBe(
      base('Donut Chart', 'segment', 'arc').value.inner,
    );
  });

  it('fails where Figma changes the charts’ series order, rather than drifting', () => {
    const changed = structuredClone(specs);
    changed['Line Chart'].style.lineA.base.borderColor.token =
      'color.data.category.01.strong';
    expect(() => chartTheme(changed)).toThrow(
      /series order needs a new decision/,
    );
  });

  it('is written for both platforms, in custom properties and theme fields', () => {
    const ts = readFileSync(
      join(packagesDir, 'styles', 'src', 'generated', 'mui', 'charts.ts'),
      'utf8',
    );
    expect(ts).toContain("'var(--solar-color-data-category-06-strong)'");
    expect(ts).toContain("width: 'var(--solar-border-strong)'");
    const dart = readFileSync(
      join(
        packagesDir,
        'solar_flutter',
        'lib',
        'src',
        'generated',
        'charts.dart',
      ),
      'utf8',
    );
    expect(dart).toContain('_t.colors.dataCategory06Strong');
    expect(dart).toContain('double get lineWidth => SolarBorder.strong;');
    expect(dart).toContain('double get donutInner => 0.6000;');
  });
});

describe('a component a chart library draws', () => {
  it('has an IR, every finding decided, and no recipe of its own', () => {
    for (const name of [
      'Bar Chart',
      'Line Chart',
      'Donut Chart',
      'Chart Axis',
      'Chart Gridlines',
    ]) {
      expect(stage.library(name), name).toBe('charts');
      expect(stage.shelled(name), name).toBe(false);
      expect(
        of(name).deviations.filter((d) => !d.decision),
        name,
      ).toEqual([]);
    }
    const index = readFileSync(
      join(
        packagesDir,
        'styles',
        'src',
        'generated',
        'mui',
        'components',
        'index.ts',
      ),
      'utf8',
    );
    expect(index).not.toContain('bar-chart');
    expect(index).toContain("from './bar-stack.js'");
  });

  it('accepts its sample plot by one pattern, after the named rules', () => {
    const rule = specs['Bar Chart'].overlay.rules.find(
      (r) => r.rule === 'accept',
    );
    expect(rule.at).toBe('component.bar chart.*');
    expect(of('Bar Chart').deviations.every((d) => d.decision)).toBe(true);
  });
});

describe('an axis taken from another component (tint)', () => {
  const { spec } = of('Agenda Row');

  it('gains Event Chip’s category at the default Figma draws, each colour Event Chip’s', () => {
    expect(spec.api.category).toEqual({
      values: specs['Event Chip'].api.category.values,
      default: 'blue',
    });
    expect(spec.tints.category.from).toBe('color.data.category.06');
    expect(spec.tints.category.values.red).toBe('color.data.category.01');
    // Figma's token stays in the recipe; the emitters swap it.
    expect(spec.style.dot.base.background.token).toBe(
      'color.data.category.06.strong',
    );
  });

  it('swaps the family where the caller picks another, on both platforms', () => {
    const { ts } = renderMuiComponent(spec, tokens);
    expect(ts).toContain('export const solarAgendaRowTints');
    expect(ts).toContain('"red": "--solar-color-data-category-01-"');
    const { dart } = renderFlutterComponent(spec, tokens);
    expect(dart).toContain("if (v.startsWith('t:color.data.category.06.')) {");
    expect(dart).toContain(
      "'t:color.data.category.01.strong' => c.dataCategory01Strong,",
    );
    // A component with no tint has none of it.
    expect(renderMuiComponent(of('Button').spec, tokens).ts).not.toContain(
      'Tints',
    );
  });
});

describe('the family’s checked IRs', () => {
  it('decide every finding', () => {
    for (const name of [
      'Sparkline',
      'Bar',
      'Bar Stack',
      'Data Legend',
      'Chart Tooltip',
    ])
      expect(
        of(name).deviations.filter((d) => !d.decision),
        name,
      ).toEqual([]);
  });

  it('derive a Chart Tooltip’s series from its rows', () => {
    expect(of('Chart Tooltip').spec.derived.series).toBeDefined();
    expect(of('Chart Tooltip').spec.api.series).toBeUndefined();
  });
});
