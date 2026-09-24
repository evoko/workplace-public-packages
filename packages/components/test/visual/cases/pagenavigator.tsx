import oracle from '../../../../../spec/verify/pagenavigator.json';
import { PageNavigator } from '../../../src/PageNavigator.js';
import type { VisualCase } from './types.js';

// Figma's position, the first of ten.
export default {
  oracle,
  render: () => <PageNavigator count={10} page={1} />,
} satisfies VisualCase;
