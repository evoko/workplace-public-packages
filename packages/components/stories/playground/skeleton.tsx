/** Skeleton's Playground: its type and size, at Figma's size for them. */

import { Skeleton, type SkeletonProps } from '../../src/Skeleton.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <Skeleton
      type={p.choice<NonNullable<SkeletonProps['type']>>('type')}
      size={p.choice<NonNullable<SkeletonProps['size']>>('size')}
    />
  ),
} satisfies PlaygroundBuilder;
