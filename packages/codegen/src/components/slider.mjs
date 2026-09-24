/**
 * SOLAR Slider, beyond its IR: where MUI draws each layer and marks each state, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * MUI's Slider on the web; drawn in Flutter over SOLAR's own slider input. Its shells are
 * Slider Range's with one handle (`src/shells/slider.mjs`).
 */

import {
  requireSlider,
  sliderFlutter,
  sliderMui,
  sliderReact,
} from '../shells/slider.mjs';

const HANDLES = ['handle'];
const ABOUT = `One value in a continuous range, chosen by eye (a volume, a zoom): for an exact number,
pair it with a number input; for a range, use a Slider Range. \`filled\` and \`error\` are drawn as
at rest, as Figma draws them, until SOLAR draws them otherwise; \`error\` is announced.`;

export default {
  name: 'Slider',
  mui: sliderMui(HANDLES),
  flutter: {},
  templates: {
    react: (spec) => {
      requireSlider(spec, HANDLES);
      return sliderReact(spec, { range: false, about: ABOUT });
    },
    flutter: (spec) => {
      requireSlider(spec, HANDLES);
      return sliderFlutter(spec, {
        handles: HANDLES,
        about: ABOUT.replaceAll('`', '').replace(
          'is announced',
          'is not yet announced',
        ),
      });
    },
  },
};
