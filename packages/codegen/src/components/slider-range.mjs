/**
 * SOLAR Slider Range, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * MUI's Slider with a pair of values on the web; drawn in Flutter over SOLAR's own slider input,
 * one handle for each end (`src/shells/slider.mjs`).
 */

import {
  requireSlider,
  sliderFlutter,
  sliderMui,
  sliderReact,
} from '../shells/slider.mjs';

const HANDLES = ['handle', 'handle2'];
const ABOUT = `A range between two values, both of which matter (a price, a date span): show the two
values beside it, as SOLAR asks. For one value, use a Slider.`;

export default {
  name: 'Slider Range',
  mui: sliderMui(HANDLES),
  flutter: {},
  templates: {
    react: (spec) => {
      requireSlider(spec, HANDLES);
      return sliderReact(spec, { range: true, about: ABOUT });
    },
    flutter: (spec) => {
      requireSlider(spec, HANDLES);
      return sliderFlutter(spec, { handles: HANDLES, about: ABOUT });
    },
  },
};
