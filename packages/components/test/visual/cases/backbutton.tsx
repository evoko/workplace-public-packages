import oracle from '../../../../../spec/verify/backbutton.json';
import { BackButton, type BackButtonProps } from '../../../src/BackButton.js';
import type { VisualCase } from './types.js';

// Figma's own label, "Back", the default.
export default {
  oracle,
  render: (v) => <BackButton {...(v.props as BackButtonProps)} />,
} satisfies VisualCase;
