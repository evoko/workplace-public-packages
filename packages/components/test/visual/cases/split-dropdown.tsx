import oracle from '../../../../../spec/verify/split-dropdown.json';
import { SplitDropdown } from '../../../src/SplitDropdown.js';
import type { VisualCase } from './types.js';

/** A stand-in of Figma's slot content: 48 tall, as its example control is. */
const zone = <span style={{ display: 'block', height: 48 }} />;

// Each zone holding content as tall as Figma's, the box as wide as Figma draws it.
export default {
  oracle,
  render: () => (
    <SplitDropdown top={zone} lower={zone} style={{ width: 680 }} />
  ),
} satisfies VisualCase;
