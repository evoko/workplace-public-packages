import oracle from '../../../../../spec/verify/slider.json';
import { Slider, type SliderProps } from '../../../src/Slider.js';
import type { VisualCase } from './types.js';

// At the value Figma draws (its fill's share of the track), in Figma's 320px sample width, which the
// overlay makes the caller's; named.
export default {
  oracle,
  render: (v) => {
    const fill = Number(v.layers?.fill?.width);
    const track = Number(v.layers?.track?.width);
    return (
      <Slider
        {...(v.props as SliderProps)}
        value={(fill / track) * 100}
        onChange={() => {}}
        aria-label="Volume"
        sx={{ width: Number(v.layers?.root?.width) }}
      />
    );
  },
} satisfies VisualCase;
