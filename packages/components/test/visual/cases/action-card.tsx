import oracle from '../../../../../spec/verify/action-card.json';
import { ActionCard, type ActionCardProps } from '../../../src/ActionCard.js';
import { Button, type ButtonProps } from '../../../src/Button.js';
import { icon } from './probes.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { variant?: Record<string, string> };

/** The Button Figma draws at a layer, as the variant draws it (primary, where it draws none). */
const button = (v: OracleVariant, layer: string) => {
  const b = (v.layers as Record<string, ChildLayer>)[layer]?.variant ?? {};
  return (
    <Button
      size={(b.size ?? 'sm') as ButtonProps['size']}
      variant={(b.prio ?? 'primary') as ButtonProps['variant']}
      danger={b.danger === 'true'}
    >
      Label
    </Button>
  );
};

// Figma's words, an icon probe, the Buttons each status draws, a More menu, pressable so a hover
// is reached as a user reaches it; as wide as Figma draws it.
export default {
  oracle,
  render: (v) => (
    <ActionCard
      {...(v.props as Pick<ActionCardProps, 'status'>)}
      title="Label"
      icon={icon}
      description="Description goes here"
      primaryAction={button(
        v,
        v.props.status === 'default' ? 'primaryCTA' : 'button',
      )}
      secondaryAction={button(v, 'secondaryCTA')}
      moreItems={[{ label: 'Dismiss', onSelect: () => {} }]}
      onClick={() => {}}
      style={{ width: 300 }}
    />
  ),
} satisfies VisualCase;
