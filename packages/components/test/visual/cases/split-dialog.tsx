import groupOracle from '../../../../../spec/verify/button-group.json';
import oracle from '../../../../../spec/verify/split-dialog.json';
import {
  SplitDialog,
  type SplitDialogProps,
} from '../../../src/SplitDialog.js';
import buttonGroup from './button-group.js';
import { icon } from './probes.js';
import type { OracleVariant, VisualCase } from './types.js';

type ChildLayer = { variant?: Record<string, string> };

/** The Button Group Figma draws for the variant's cta, as the Button Group check draws it. */
function actions(v: OracleVariant) {
  const layers = v.layers as Record<string, ChildLayer>;
  const wanted = (layers.actions ?? layers.actionsRegular)?.variant ?? {};
  const group = groupOracle.variants.find((g) =>
    Object.entries(wanted).every(([axis, value]) =>
      g.figma.split(', ').includes(`${axis}=${value}`),
    ),
  ) as OracleVariant;
  return buttonGroup.render(group);
}

// Each cta with its title and an icon probe, words in each pane (Figma's are samples), and the
// Button Group Figma draws for it; closable, so its close button is drawn; in place, as wide as
// Figma draws it.
export default {
  oracle,
  render: (v) => (
    <SplitDialog
      {...(v.props as Pick<SplitDialogProps, 'cta'>)}
      inline
      title="Dialog Title"
      icon={icon}
      left="Primary panel"
      right="Supporting panel"
      actions={actions(v)}
      onClose={() => {}}
    />
  ),
} satisfies VisualCase;
