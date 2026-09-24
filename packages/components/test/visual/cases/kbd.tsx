import oracle from '../../../../../spec/verify/kbd.json';
import { Kbd, type KbdProps } from '../../../src/Kbd.js';
import type { VisualCase } from './types.js';

// Figma's own sample key.
export default {
  oracle,
  render: (v) => <Kbd {...(v.props as Omit<KbdProps, 'children'>)}>⌘K</Kbd>,
} satisfies VisualCase;
