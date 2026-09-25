import oracle from '../../../../../spec/verify/status-card.json';
import { StatusCard, type StatusCardProps } from '../../../src/StatusCard.js';
import type { VisualCase } from './types.js';

// Figma's title and figure, a More menu, pressable so a hover is reached as a user reaches it; as
// wide as Figma draws it.
export default {
  oracle,
  render: (v) => (
    <StatusCard
      {...(v.props as Pick<StatusCardProps, 'status' | 'disabled' | 'loading'>)}
      title="Label"
      value="5"
      moreItems={[{ label: 'Edit', onSelect: () => {} }]}
      onClick={() => {}}
      style={{ width: 240 }}
    />
  ),
} satisfies VisualCase;
