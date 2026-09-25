import oracle from '../../../../../spec/verify/interactive-card.json';
import {
  InteractiveCard,
  type InteractiveCardProps,
} from '../../../src/InteractiveCard.js';
import { IconButton } from '../../../src/IconButton.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Figma's words, an icon probe, its drag handle, three Icon Buttons as its actions, and the control the variant chooses, pressable so its states are
// reached as a user reaches them; as wide as Figma draws it.
export default {
  oracle,
  render: (v) => (
    <InteractiveCard
      {...(v.props as Pick<
        InteractiveCardProps,
        'selected' | 'dragging' | 'control'
      >)}
      title="Headline"
      description="Description"
      icon={icon}
      // The caller's Icon Buttons, each marked as the layer Figma draws it in, so each is measured
      // as the Icon Button check measures one.
      actions={['iconButton', 'iconButton2', 'iconButton3'].map((layer) => (
        <IconButton
          key={layer}
          data-layer={layer}
          icon={icon}
          aria-label="Action"
          prio="secondary"
        />
      ))}
      dragHandle
      onSelectedChange={() => {}}
      onClick={() => {}}
      style={{ width: 423 }}
    />
  ),
} satisfies VisualCase;
