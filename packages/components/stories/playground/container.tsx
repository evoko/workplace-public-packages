/**
 * Container's Playground: its type from its control; its content a neutral placeholder, a SOLAR
 * Skeleton, shown by the `content` toggle.
 */

import { Container, type ContainerProps } from '../../src/Container.js';
import { Skeleton } from '../../src/Skeleton.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <Container type={p.choice<NonNullable<ContainerProps['type']>>('type')}>
      {p.flag('content') ? <Skeleton /> : undefined}
    </Container>
  ),
} satisfies PlaygroundBuilder;
