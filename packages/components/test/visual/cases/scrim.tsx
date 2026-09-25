import oracle from '../../../../../spec/verify/scrim.json';
import { Scrim } from '../../../src/Scrim.js';
import type { VisualCase } from './types.js';

// Shown, as it is behind a surface, at once: no fade. It covers the viewport, fixed, as it does
// behind a dialog; here it covers a box of Figma's size instead (a transform makes the box the
// fixed layer's frame), so it does not cover the other cases on the page and take their pointer.
export default {
  oracle,
  render: () => (
    <div
      style={{
        position: 'relative',
        width: 1440,
        height: 800,
        transform: 'translateZ(0)',
      }}
    >
      <Scrim open transitionDuration={0} data-case-root="" />
    </div>
  ),
} satisfies VisualCase;
