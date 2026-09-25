/**
 * What SOLAR's sliders share on the web, Slider and Slider Range: the MUI table of MUI's Slider,
 * its rail, track and thumbs restyled by the recipe, for one value or a pair.
 */

import { TARGET, targetArea } from './target.mjs';

/** Where MUI draws each layer, and the resets its own styles need. */
export function sliderMui(handles) {
  const thumb = (i) =>
    handles.length === 1
      ? '& .MuiSlider-thumb'
      : `& .MuiSlider-thumb[data-index="${i}"]`;
  return {
    slots: {
      root: '&',
      track: '& .MuiSlider-rail',
      fill: '& .MuiSlider-track',
      ...Object.fromEntries(handles.map((h, i) => [h, thumb(i)])),
    },
    // MUI centres its rail and track with a transform, and its thumb on both axes, where the recipe
    // places them from the slider's top as Figma does: the thumb keeps only its centring on the
    // value. Its elevation, a ::before, gives way to the recipe's shadow, and the padding that
    // enlarges its touch area to the recipe's height.
    resets: {
      display: 'block',
      padding: '0',
      boxSizing: 'border-box',
      '& .MuiSlider-rail': { opacity: '1', transform: 'none' },
      '& .MuiSlider-track': { border: 'none', transform: 'none' },
      '& .MuiSlider-thumb': {
        transform: 'translateX(-50%)',
        boxSizing: 'border-box',
        '&::before': { display: 'none' },
        // MUI's own touch area, a pseudo-element, is the 44 × 44 target (target.mjs).
        '&::after': { width: TARGET, height: TARGET },
      },
      // A 44-tall target along the rail (target.mjs).
      ...targetArea(),
    },
    // Figma draws each state on the whole slider: pressed while a thumb is held, focused while
    // one has the keyboard.
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:has(.Mui-active)',
      focus: '&:has(.Mui-focusVisible)',
      disabled: '&.Mui-disabled',
    },
    overlaps: { pressed: ['hover'], focus: ['hover', 'pressed'] },
  };
}
