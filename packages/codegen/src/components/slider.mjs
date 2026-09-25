/**
 * SOLAR Slider, beyond its IR: where MUI draws each layer and marks each state. Its shells are
 * files of their own, written by hand. One file per component, so adding one edits nothing shared;
 * `src/components/index.mjs` finds them.
 *
 * MUI's Slider on the web; drawn in Flutter over SOLAR's own slider input. Its shells are
 * Slider Range's with one handle (`src/components/shared/slider.mjs`).
 */

import { sliderMui } from './shared/slider.mjs';

const HANDLES = ['handle'];

export default {
  name: 'Slider',
  mui: sliderMui(HANDLES),
  flutter: {},
};
