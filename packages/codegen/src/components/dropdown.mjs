/**
 * SOLAR Dropdown, beyond its IR: where MUI draws each layer and marks each state, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A picker (`src/shells/picker.mjs`), the same control as Select in its own look (owner decision
 * 2026-09-24): a leading icon, a chevron that turns up while open, and a Dropdown Menu as its
 * panel, since Figma draws it none.
 */

import { fieldStates } from '../shells/field.mjs';
import { treeOf } from '../shells/drawn.mjs';
import { pickerFlutter, pickerReact, pickerResets } from '../shells/picker.mjs';

const requireLayers = (spec) => {
  const tree = treeOf(spec);
  const want = {
    root: ['label', 'field', 'helper'],
    label: ['labelLabel', 'mandatory'],
    field: [
      'leadingIcon',
      'fieldLabel',
      'trailingIcon',
      'iconChevronDown',
      'iconChevronUp',
    ],
  };
  for (const [layer, kids] of Object.entries(want))
    if (tree[layer]?.join() !== kids.join())
      throw new Error(
        `Dropdown: ${layer} holds ${tree[layer]?.join(', ')}, not ${kids.join(', ')}`,
      );
};

const picker = {
  value: 'fieldLabel',
  chevron: 'iconChevronDown',
  chevronOpen: 'iconChevronUp',
  panel: null,
  icons: ['leadingIcon', 'trailingIcon'],
};

export default {
  name: 'Dropdown',
  mui: {
    // The shell draws every layer itself, each with a class of its own: the field is MUI's
    // InputBase around the Select's combobox, and the panel MUI's menu drawn as a Dropdown Menu.
    slots: 'drawn',
    resets: pickerResets('Dropdown', picker),
    // Hovered and focused as the field is; open, in error and disabled by the shell's classes.
    states: fieldStates('Dropdown', ['open', 'error', 'disabled']),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: { label: 'label' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return pickerReact(spec, {
        look: "the field's fill, edge and focus ring by state, its icons and chevron, and the label and helper",
        about: `One choice from about ten or fewer, SOLAR says (beyond that, an Autocomplete), the same control as
a Select in Dropdown's look: its \`label\` above (a \`mandatory\` one is starred), its \`helper\`
below, which says what is wrong where it is in \`error\`, and the field showing the choice or the
\`placeholder\`, with a \`leadingIcon\` before it, a \`trailingIcon\` after it and a chevron that
turns up while open. It is MUI's Select on InputBase: a click, Enter or the arrow keys open its
panel, a DropdownMenu of DropdownItems, each with a \`value\`. \`value\` and \`onChange\` hold the
choice, as a string; \`open\`, \`onOpen\` and \`onClose\` its panel, where the caller keeps it.`,
        ...picker,
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return pickerFlutter(spec, {
        look: "the field's fill, edge and focus ring by state, its icons and chevron, and the label and helper",
        about: `One choice from about ten or fewer, SOLAR says (beyond that, an Autocomplete), the same control as a SolarSelect in Dropdown's look: its [label] above (a [mandatory] one is starred), its [helper] below, which says what is wrong where it is in [error], and the field showing the choice or the [placeholder], with a [leadingIcon] before it, a [trailingIcon] after it and a chevron that turns up while open. A tap, Enter or the down arrow opens its panel of [options] under the field, a SolarDropdownMenu as wide as the field. [open] opens it as it is first built.`,
        ...picker,
      });
    },
  },
};
