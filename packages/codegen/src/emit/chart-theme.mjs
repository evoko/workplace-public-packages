/**
 * SOLAR's chart theme, for the chart libraries that draw the plots (decision: MUI X Charts on the
 * web, fl_chart in Flutter): generated from the chart IRs, never written by hand. Bar Chart, Line
 * Chart, Donut Chart, Chart Axis and Chart Gridlines are drawn by the library, so they have no
 * recipe of their own (their descriptors' `library`); what a library can take of them is here:
 *
 * - the series colours: the bars' and lines' series (Line Chart's A and B, category 06 and 02),
 *   then 04, 07, 01, 03, 05 and 08; and the donut's segments, 01 to 08 in order, as Donut Chart
 *   draws them (owner decision 2026-09-26: two palettes, as drawn). Each order is checked against
 *   the IRs here, so a Figma change to it fails the build rather than drifting;
 * - the line's stroke, the bar's corner, the axis line and its ticks and labels, the gridlines,
 *   and the donut's hole and its centre's words.
 *
 * Written to `@bwp-web/styles/mui` (`solarChartTheme`, CSS custom properties, as every recipe) and
 * to `solar_flutter` (`SolarChartTheme`, read from the app's SolarTheme).
 */

import { join } from 'node:path';
import { flattenSpec } from '../spec.mjs';
import { packagesDir } from '../util/paths.mjs';
import { writeGenerated } from '../util/write.mjs';
import { dartName, STATIC_CLASS } from './flutter.mjs';
import { cssTokens } from './mui-component.mjs';

/** The owner's order of the series palette, by category (2026-09-26). */
export const SERIES_ORDER = ['06', '02', '04', '07', '01', '03', '05', '08'];
/** The donut's, as Donut Chart draws its segments. */
export const SEGMENT_ORDER = ['01', '02', '03', '04', '05', '06', '07', '08'];

const category = (n) => `color.data.category.${n}.strong`;

/** A cell's entry: the base's, or the first look's that has it (a centre label shown in one). */
function cellOf(spec, layer, cell) {
  const style = spec.style[layer];
  if (!style)
    throw new Error(`chart theme: ${spec.component} has no layer ${layer}`);
  if (style.base?.[cell]) return style.base[cell];
  for (const looks of Object.values(style.appearance ?? {}))
    for (const entry of Object.values(looks))
      if (entry?.[cell]) return entry[cell];
  throw new Error(`chart theme: ${spec.component} draws no ${layer}.${cell}`);
}

const tokenOf = (spec, layer, cell) => {
  const e = cellOf(spec, layer, cell);
  if (!e.token)
    throw new Error(
      `chart theme: ${spec.component} ${layer}.${cell} is no token`,
    );
  return e.token;
};

/**
 * What the theme takes, as token names and numbers, from the chart IRs; checked as it is read.
 *
 * @param {Record<string, object>} specs every IR, by component
 */
export function chartTheme(specs) {
  const need = (name) => {
    const spec = specs[name];
    if (!spec) throw new Error(`chart theme: no ${name} IR`);
    return spec;
  };
  const line = need('Line Chart');
  const donut = need('Donut Chart');
  const axis = need('Chart Axis');
  const grid = need('Chart Gridlines');
  const bar = need('Bar');
  // The series Figma draws are the first of the owner's order: A and B of the line chart.
  const drawn = ['lineA', 'lineB'].map((l) => tokenOf(line, l, 'borderColor'));
  if (drawn.join() !== SERIES_ORDER.slice(0, 2).map(category).join())
    throw new Error(
      `chart theme: Line Chart draws its series in ${drawn.join(', ')}, not ${SERIES_ORDER.slice(0, 2).map(category).join(', ')}; the series order needs a new decision`,
    );
  // The donut's segments are its categories in order, as far as Figma draws them.
  const segments = Object.keys(donut.style)
    .filter((l) => /^segment\d*$/.test(l))
    .map((l) => cellOf(donut, l, 'background').token);
  segments.forEach((t, i) => {
    if (t !== category(SEGMENT_ORDER[i]))
      throw new Error(
        `chart theme: Donut Chart's segment ${i + 1} is ${t}, not ${category(SEGMENT_ORDER[i])}`,
      );
  });
  const arc = cellOf(donut, 'segment', 'arc').value;
  const tickSize = cellOf(axis, 'tickTickMark', 'height');
  if (tickSize.literal === undefined || !tickSize.allowed)
    throw new Error('chart theme: the tick length is no allowed literal');
  return {
    series: SERIES_ORDER.map(category),
    segments: SEGMENT_ORDER.map(category),
    bar: { radius: tokenOf(bar, 'root', 'radius') },
    line: { width: tokenOf(line, 'lineA', 'borderWidth') },
    axis: {
      line: tokenOf(axis, 'axisLine', 'background'),
      lineWidth: tokenOf(axis, 'axisLine', 'height'),
      tick: tokenOf(axis, 'tickTickMark', 'background'),
      tickWidth: tokenOf(axis, 'tickTickMark', 'width'),
      tickSize: tickSize.literal,
      label: tokenOf(axis, 'tick0', 'color'),
      labelStyle: tokenOf(axis, 'tick0', 'typography'),
    },
    grid: {
      line: tokenOf(grid, 'gridline', 'background'),
      lineWidth: tokenOf(grid, 'gridline', 'height'),
    },
    donut: {
      inner: arc.inner,
      value: tokenOf(donut, '100', 'color'),
      valueStyle: tokenOf(donut, '100', 'typography'),
      label: tokenOf(donut, 'total', 'color'),
      labelStyle: tokenOf(donut, 'total', 'typography'),
    },
  };
}

/** The theme as TypeScript for `@bwp-web/styles/mui`: custom properties, as every recipe. */
function renderTs(theme, tokens) {
  const { ref, textStyle } = cssTokens(tokens, 'chart theme');
  const byName = new Map(flattenSpec(tokens).map((t) => [t.name, t]));
  const px = (token) => {
    const v = byName.get(token)?.value;
    const n = Number.parseFloat(String(v));
    if (!Number.isFinite(n))
      throw new Error(`chart theme: ${token} is no length`);
    return n;
  };
  const out = {
    series: theme.series.map((t) => ref(t, 'series')),
    segments: theme.segments.map((t) => ref(t, 'segments')),
    bar: { radius: px(theme.bar.radius) },
    line: { width: ref(theme.line.width, 'line') },
    axis: {
      line: ref(theme.axis.line, 'axis'),
      lineWidth: ref(theme.axis.lineWidth, 'axis'),
      tick: ref(theme.axis.tick, 'axis'),
      tickWidth: ref(theme.axis.tickWidth, 'axis'),
      tickSize: theme.axis.tickSize,
      label: {
        color: ref(theme.axis.label, 'axis'),
        ...textStyle(theme.axis.labelStyle, 'axis'),
      },
    },
    grid: {
      line: ref(theme.grid.line, 'grid'),
      lineWidth: ref(theme.grid.lineWidth, 'grid'),
    },
    donut: {
      inner: theme.donut.inner,
      value: {
        color: ref(theme.donut.value, 'donut'),
        ...textStyle(theme.donut.valueStyle, 'donut'),
      },
      label: {
        color: ref(theme.donut.label, 'donut'),
        ...textStyle(theme.donut.labelStyle, 'donut'),
      },
    },
  };
  return (
    `// SOLAR chart theme for MUI X Charts. Generated by @bwp-web/codegen from the chart IRs in spec/components. Do not edit.\n` +
    `// Every colour and length is a var(--solar-*) reference into tokens.css, which must be loaded; a number is where the\n` +
    `// library takes one (the bar's corner, from radius's value; the tick's length and the donut's hole, Figma's).\n\n` +
    `/**\n * What a chart library takes of SOLAR's charts: the series palette of bars and lines, the donut's\n * segments, the line's stroke, the bar's corner, the axis, the gridlines and the donut's hole and\n * centre (owner decision 2026-09-26: two palettes, as drawn).\n */\n` +
    `export const solarChartTheme = ${JSON.stringify(out, null, 2)} as const;\n`
  );
}

/** The theme as Dart for `solar_flutter`: read from the app's SolarTheme, as every recipe. */
function renderDart(theme, tokens) {
  const byName = new Map(flattenSpec(tokens).map((t) => [t.name, t]));
  const color = (token) => {
    if (byName.get(token)?.type !== 'color')
      throw new Error(`chart theme: ${token} is no colour`);
    return `_t.colors.${dartName(token.split('.').slice(1).join('.'))}`;
  };
  const length = (token) => {
    const [head, ...rest] = token.split('.');
    if (!STATIC_CLASS[head])
      throw new Error(`chart theme: ${token} is no static length`);
    return `${STATIC_CLASS[head]}.${dartName(rest.join('.'))}`;
  };
  const text = (style, ink) =>
    `_t.typography.${dartName(style.split('.').slice(1).join('.'))}.copyWith(color: ${color(ink)})`;
  const list = (tokens) =>
    `[\n${tokens.map((t) => `        ${color(t)},`).join('\n')}\n      ]`;
  return `// SOLAR chart theme for fl_chart. Generated by @bwp-web/codegen from the chart IRs in spec/components. Do not edit.

import 'package:flutter/material.dart';

import 'tokens.dart';

/// What a chart library takes of SOLAR's charts, read from the app's [SolarTheme]: the series
/// palette of bars and lines, the donut's segments, the line's stroke, the bar's corner, the axis,
/// the gridlines and the donut's hole and centre (owner decision 2026-09-26: two palettes, as
/// drawn).
@immutable
class SolarChartTheme {
  const SolarChartTheme(this._t);

  final SolarTheme _t;

  /// Bars' and lines' series, in order.
  List<Color> get series => ${list(theme.series)};

  /// A donut's segments, in order.
  List<Color> get segments => ${list(theme.segments)};

  /// A bar's corner.
  double get barRadius => ${length(theme.bar.radius)};

  /// A line's stroke.
  double get lineWidth => ${length(theme.line.width)};

  /// The axis line.
  Color get axisLine => ${color(theme.axis.line)};
  double get axisLineWidth => ${length(theme.axis.lineWidth)};

  /// A tick mark, and its length (Figma's, which no token gives).
  Color get tick => ${color(theme.axis.tick)};
  double get tickWidth => ${length(theme.axis.tickWidth)};
  double get tickSize => ${Number(theme.axis.tickSize).toFixed(1)};

  /// A tick's label.
  TextStyle get axisLabel => ${text(theme.axis.labelStyle, theme.axis.label)};

  /// A gridline.
  Color get gridLine => ${color(theme.grid.line)};
  double get gridLineWidth => ${length(theme.grid.lineWidth)};

  /// The donut's hole, as a fraction of its radius (Figma's).
  double get donutInner => ${Number(theme.donut.inner).toFixed(4)};

  /// The donut's centre: its value and the words under it.
  TextStyle get donutValue => ${text(theme.donut.valueStyle, theme.donut.value)};
  TextStyle get donutLabel => ${text(theme.donut.labelStyle, theme.donut.label)};
}
`;
}

export function emitChartTheme(specs, tokens) {
  const theme = chartTheme(specs);
  writeGenerated(
    join(packagesDir, 'styles', 'src', 'generated', 'mui', 'charts.ts'),
    renderTs(theme, tokens),
  );
  writeGenerated(
    join(
      packagesDir,
      'solar_flutter',
      'lib',
      'src',
      'generated',
      'charts.dart',
    ),
    renderDart(theme, tokens),
  );
  return 2;
}
