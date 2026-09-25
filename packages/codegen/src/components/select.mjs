/**
 * SOLAR Select, beyond its IR: where MUI draws each layer and marks each state, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A picker (`src/shells/picker.mjs`): a field that opens a panel of Dropdown Items under it, the
 * panel drawn from Select's own layer as Figma draws it (owner decision 2026-09-24). MUI's Select
 * on the web, a drawn field and SolarMenuAnchor in Flutter.
 */

import { pickerFlutter, pickerReact, pickerResets } from '../shells/picker.mjs';
import { fieldStates } from '../shells/field.mjs';
import { treeOf } from '../shells/drawn.mjs';

const requireLayers = (spec) => {
  const tree = treeOf(spec);
  const want = {
    root: ['label', 'field', 'helper', 'dropdownMenu'],
    label: ['labelLabel', 'mandatory'],
    field: ['placeholder', 'trailingIcon'],
  };
  for (const [layer, kids] of Object.entries(want))
    if (tree[layer]?.join() !== kids.join())
      throw new Error(
        `Select: ${layer} holds ${tree[layer]?.join(', ')}, not ${kids.join(', ')}`,
      );
};

export default {
  name: 'Select',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase around the Select's combobox, and the panel MUI's menu, kept in the component so
    // the recipe reaches it.
    slots: 'drawn',
    resets: pickerResets('Select', {
      value: 'placeholder',
      chevron: 'trailingIcon',
      panel: 'dropdownMenu',
    }),
    // Hovered and focused as the field is; open, in error and disabled by the shell's classes.
    states: fieldStates('Select', ['open', 'error', 'disabled']),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // The trailing icon is the chevron, which the shell draws.
  api: {
    react: { label: 'label', trailingIcon: null },
    flutter: { trailingIcon: null },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return pickerReact(spec, {
        look: "the field's fill, edge and focus ring by state, the panel's surface, and the label and helper",
        about: `One choice from a list of about seven or fewer, SOLAR says (beyond that, an Autocomplete): its
\`label\` above (a \`mandatory\` one is starred), its \`helper\` below, which says what is wrong where
it is in \`error\`, and the field showing the choice, or the \`placeholder\`. It is MUI's Select
on InputBase: a click, Enter or the arrow keys open its panel of DropdownItems, each with a
\`value\`, where the arrow keys move, a typed letter finds a row, Enter chooses and Escape closes.
\`value\` and \`onChange\` hold the choice, as a string; \`open\`, \`onOpen\` and \`onClose\` its panel,
where the caller keeps it. The panel is drawn as Figma draws Select's, as wide as the field.`,
        value: 'placeholder',
        chevron: 'trailingIcon',
        panel: 'dropdownMenu',
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return pickerFlutter(spec, {
        look: "the field's fill, edge and focus ring by state, the panel's surface, and the label and helper",
        about: `One choice from a list of about seven or fewer, SOLAR says (beyond that, an Autocomplete): its [label] above (a [mandatory] one is starred), its [helper] below, which says what is wrong where it is in [error], and the field showing the choice, or the [placeholder]. A tap, Enter or the down arrow opens its panel of [options] under the field, drawn as Figma draws Select's, as wide as the field, each a SolarDropdownItem, where the arrow keys move, Enter chooses and Escape closes. [open] opens it as it is first built.`,
        value: 'placeholder',
        chevron: 'trailingIcon',
        panel: 'dropdownMenu',
      });
    },
  },
};
