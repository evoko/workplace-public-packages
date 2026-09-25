import oracle from '../../../../../spec/verify/card.json';
import { Card, type CardProps } from '../../../src/Card.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Every slot filled, so each look is measured: Figma's title, helper, description and Tag words,
// an icon probe, and a More menu; pressable, so a hover is reached as a user reaches it.
export default {
  oracle,
  render: (v) => (
    <Card
      {...(v.props as Pick<CardProps, 'status' | 'disabled' | 'loading'>)}
      title="Label"
      icon={icon}
      helper="Helper"
      description="Content goes here. Replace this with any content — text, lists, form fields, or"
      tag="Label"
      moreItems={[{ label: 'Edit', onSelect: () => {} }]}
      onClick={() => {}}
      style={{ width: 320 }}
    />
  ),
} satisfies VisualCase;
