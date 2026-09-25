import oracle from '../../../../../spec/verify/option-card.json';
import { OptionCard, type OptionCardProps } from '../../../src/OptionCard.js';
import type { VisualCase } from './types.js';

// Figma's words, pressable so a hover is reached as a user reaches it; as wide as Figma draws it.
export default {
  oracle,
  render: (v) => (
    <OptionCard
      {...(v.props as Pick<OptionCardProps, 'selected'>)}
      label="New design"
      onClick={() => {}}
      style={{ width: 240 }}
    />
  ),
} satisfies VisualCase;
