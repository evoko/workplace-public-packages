import oracle from '../../../../../spec/verify/skeleton.json';
import { Skeleton, type SkeletonProps } from '../../../src/Skeleton.js';
import type { VisualCase } from './types.js';

export default {
  oracle,
  render: (v) => <Skeleton {...(v.props as SkeletonProps)} />,
} satisfies VisualCase;
