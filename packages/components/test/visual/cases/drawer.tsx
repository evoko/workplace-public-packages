import groupOracle from '../../../../../spec/verify/button-group.json';
import oracle from '../../../../../spec/verify/drawer.json';
import { Drawer } from '../../../src/Drawer.js';
import buttonGroup from './button-group.js';
import type { OracleVariant, VisualCase } from './types.js';

/** The full-width Button Group Figma draws as its footer, as the Button Group check draws it. */
const actions = () =>
  buttonGroup.render(
    groupOracle.variants.find((g) =>
      g.figma.includes('type=full-width'),
    ) as OracleVariant,
  );

// Its title, a line of words as its content (Figma's are a sample) and its footer; closable, so its
// close button is drawn; in place, as Figma draws it, the height of a short screen.
export default {
  oracle,
  render: () => (
    <Drawer
      inline
      title="Drawer Title"
      actions={actions()}
      onClose={() => {}}
      style={{ height: 560 }}
    >
      Drawer content goes here.
    </Drawer>
  ),
} satisfies VisualCase;
