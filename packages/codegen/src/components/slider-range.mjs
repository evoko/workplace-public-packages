/**
 * SOLAR Slider Range, beyond its IR: where MUI draws each layer and marks each state. Its shells
 * are files of their own, written by hand. One file per component, so adding one edits nothing
 * shared; `src/components/index.mjs` finds them.
 *
 * MUI's Slider with a pair of values on the web; drawn in Flutter over SOLAR's own slider input,
 * one handle for each end (`src/components/shared/slider.mjs`).
 */

import { sliderMui } from './shared/slider.mjs';

const HANDLES = ['handle', 'handle2'];

export default {
  name: 'Slider Range',
  mui: sliderMui(HANDLES),
  flutter: {},
};
