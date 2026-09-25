import oracle from '../../../../../spec/verify/accordion.json';
import { Accordion, type AccordionProps } from '../../../src/Accordion.js';
import type { VisualCase } from './types.js';

// Figma's words, expanded or not as the variant is; as wide as Figma draws it.
export default {
  oracle,
  render: (v) => (
    <Accordion
      {...(v.props as Pick<AccordionProps, 'expanded' | 'disabled'>)}
      title="Label"
      description="Content"
      style={{ width: 400 }}
    />
  ),
} satisfies VisualCase;
