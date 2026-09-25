import oracle from '../../../../../spec/verify/container.json';
import { Container, type ContainerProps } from '../../../src/Container.js';
import type { VisualCase } from './types.js';

// Its content a line of words, as wide as Figma draws the container.
export default {
  oracle,
  render: (v) => (
    <Container
      {...(v.props as Pick<ContainerProps, 'type'>)}
      style={{ width: 440 }}
    >
      Content
    </Container>
  ),
} satisfies VisualCase;
