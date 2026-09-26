/** Section Nav Group Header's Playground: its words from their control; not interactive. */

import { SectionNavGroupHeader } from '../../src/SectionNavGroupHeader.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <SectionNavGroupHeader>{p.text('label')}</SectionNavGroupHeader>
  ),
} satisfies PlaygroundBuilder;
