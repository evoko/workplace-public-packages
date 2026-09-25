/**
 * SOLAR Line Chart, beyond its IR: drawn by a chart library (MUI X Charts on the web, fl_chart in Flutter),
 * not by a shell of its own. Its IR is built and its cells feed the SOLAR chart theme
 * (`src/emit/chart-theme.mjs`); Figma's plot is sample data, so no per-variant check applies.
 */

export default {
  name: 'Line Chart',
  library: 'charts',
  mui: { slots: 'drawn' },
  flutter: {},
};
