import oracle from '../../../../../spec/verify/section-nav-group-header.json';
import { SectionNavGroupHeader } from '../../../src/SectionNavGroupHeader.js';
import type { VisualCase } from './types.js';

// Figma's words.
export default {
  oracle,
  render: () => <SectionNavGroupHeader>Label</SectionNavGroupHeader>,
} satisfies VisualCase;
