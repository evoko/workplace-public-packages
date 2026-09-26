/**
 * What the chart Playground builders share: the numbers a comma-separated text holds (words that
 * are no number ignored), and a series' colour, the SOLAR chart theme's (`solarChartTheme`), so a
 * sample series is coloured as a SOLAR chart colours it. As Flutter's
 * (widgetbook/lib/playground/charts.dart).
 */

import { solarChartTheme } from '@bwp-web/styles/mui';

export const numbersIn = (text: string): number[] =>
  text
    .split(',')
    .map((word) => word.trim())
    .filter((word) => word !== '')
    .map(Number)
    .filter(Number.isFinite);

/** The chart theme's colour for the series at `i`. */
export const seriesColor = (i: number) =>
  solarChartTheme.series[i % solarChartTheme.series.length]!;
