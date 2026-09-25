import { appIconWorkplace } from '@bwp-web/assets';
import groupOracle from '../../../../../spec/verify/button-group.json';
import oracle from '../../../../../spec/verify/launch-card.json';
import { IconButton } from '../../../src/IconButton.js';
import { LaunchCard } from '../../../src/LaunchCard.js';
import buttonGroup from './button-group.js';
import { icon, picture } from './probes.js';
import type { OracleVariant, VisualCase } from './types.js';

/** The Button Group Figma draws as the card's actions, as the Button Group check draws it. */
function actions(v: OracleVariant) {
  const wanted =
    (v.layers as Record<string, { variant?: Record<string, string> }>).actions
      ?.variant ?? {};
  const group = groupOracle.variants.find((g) =>
    Object.entries(wanted).every(([axis, value]) =>
      g.figma.split(', ').includes(`${axis}=${value}`),
    ),
  ) as OracleVariant;
  return buttonGroup.render(group);
}

// Figma's words, a stand-in picture where the variant has one, the App Icon of Workplace, a Tag, its favourite and its
// Button Group, pressable so its focus is reached as a user reaches it; as wide as Figma draws it.
export default {
  oracle,
  render: (v) => (
    <LaunchCard
      name="Workplace"
      body="Book rooms and desks, and find your colleagues."
      appIcon={<img src={appIconWorkplace} alt="" />}
      tag="New"
      image={v.content?.includes('image') ? picture : undefined}
      favourite={
        <IconButton
          size="sm"
          shape="round"
          prio="tertiary"
          icon={icon}
          aria-label="Favourite"
        />
      }
      actions={actions(v)}
      onClick={() => {}}
      style={{ width: 340 }}
    />
  ),
} satisfies VisualCase;
