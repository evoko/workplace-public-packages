import oracle from '../../../../../spec/verify/slider-range.json';
import {
  SliderRange,
  type SliderRangeProps,
} from '../../../src/SliderRange.js';
import type { VisualCase } from './types.js';

// At the range Figma draws (where its fill starts and ends on the track), in Figma's 320px sample
// width, which the overlay makes the caller's; each end named.
export default {
  oracle,
  render: (v) => {
    const x = Number(v.layers?.fill?.x);
    const fill = Number(v.layers?.fill?.width);
    const track = Number(v.layers?.track?.width);
    return (
      <SliderRange
        {...(v.props as SliderRangeProps)}
        value={[(x / track) * 100, ((x + fill) / track) * 100]}
        onChange={() => {}}
        getAriaLabel={(i) => (i === 0 ? 'Lowest price' : 'Highest price')}
        sx={{ width: Number(v.layers?.root?.width) }}
      />
    );
  },
} satisfies VisualCase;
