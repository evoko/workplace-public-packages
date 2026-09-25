import groupOracle from '../../../../../spec/verify/button-group.json';
import oracle from '../../../../../spec/verify/dialog.json';
import stepperOracle from '../../../../../spec/verify/stepper.json';
import { Dialog } from '../../../src/Dialog.js';
import buttonGroup from './button-group.js';
import { icon, picture } from './probes.js';
import stepper from './stepper.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { variant?: Record<string, string> };

/** A child's oracle variant that is the one Figma composes at a layer, drawn by its own case. */
const child = (
  v: OracleVariant,
  layer: string,
  childOracle: { variants: unknown[] },
  render: (c: OracleVariant) => ReturnType<VisualCase['render']>,
) => {
  const wanted = (v.layers as Record<string, ChildLayer>)[layer]?.variant ?? {};
  const found = (childOracle.variants as OracleVariant[]).find((c) =>
    Object.entries(wanted).every(([axis, value]) =>
      c.figma.split(', ').includes(`${axis}=${value}`),
    ),
  );
  return found ? render(found) : undefined;
};

// Each type with what Figma draws in it (the oracle's content): its title and an icon probe, a
// picture probe and the words under the title for the image dialog, the Stepper Figma draws for
// the wizard, and the full-width Button Group; closable, so its close button is drawn; in place.
export default {
  oracle,
  render: (v) => {
    const has = (slot: string) => v.content?.includes(slot) ?? false;
    return (
      <Dialog
        inline
        title="Dialog Title"
        icon={icon}
        image={has('modalImage') ? <img src={picture} alt="" /> : undefined}
        description={
          has('modalImage')
            ? 'Biamp delivers professional audio-visual solutions.'
            : undefined
        }
        stepper={
          has('stepper')
            ? child(v, 'stepper', stepperOracle, stepper.render)
            : undefined
        }
        actions={child(v, 'actions', groupOracle, buttonGroup.render)}
        onClose={() => {}}
      />
    );
  },
} satisfies VisualCase;
