/**
 * SOLAR Dropdown Group Label, beyond its IR: where MUI draws each layer, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn component (`src/shells/drawn.mjs`): a section's heading in a Dropdown Menu, which takes
 * the menu's size.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../shells/drawn.mjs';

const requireLabel = (spec) => {
  if (spec.layers.groupLabel?.type !== 'TEXT')
    throw new Error('Dropdown Group Label: the IR has no groupLabel text');
};

export default {
  name: 'Dropdown Group Label',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A block, as a heading spans its menu.
    resets: drawnResets('Dropdown Group Label', { display: 'flex' }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLabel(spec);
      return drawnReact(spec, {
        look: 'the heading’s fill, padding and text style, by size',
        about: `Bespoke: a section's heading in a DropdownMenu ("Recent", "All projects"), drawn from Figma’s
layer tree (\`internal/layers.tsx\`) as one of the menu's list items, presentational, so the
menu's keyboard passes over it to the rows. In a menu it takes the menu's size. SOLAR
says to use it only where a menu has three or more kinds of row.`,
        element: 'li',
        refType: 'HTMLLIElement',
        imports: "import { useDropdownMenuSize } from './DropdownMenu.js';",
        react: ['type ReactNode'],
        props: `/** The heading's words. */
children: ReactNode;`,
        own: ['children'],
        prelude: `// In a menu, the menu's size, as Figma draws its rows.
size = useDropdownMenuSize() ?? size;`,
        attrs: 'role="presentation"',
        text: '{ groupLabel: children }',
      });
    },
    flutter: (spec) => {
      requireLabel(spec);
      return drawnFlutter(spec, {
        look: 'the heading’s fill, padding and text style, by size, read cell by cell',
        about: `Bespoke: a section's heading in a SolarDropdownMenu ('Recent', 'All projects'), drawn from
Figma's layer tree with [SolarLayers], announced as a heading, and passed over by the menu's
keyboard. In a menu it takes the menu's size. SOLAR says to use it only where a menu has three or more kinds of row.`,
        params: 'required this.label,',
        fields: `/// The heading's words.
final String label;`,
        text: "{'groupLabel': label}",
        // In a menu, the menu's size, as Figma draws its rows.
        values: {
          size: 'SolarMenuScope.sizeOf(context, SolarDropdownGroupLabelSize.values) ?? size',
        },
        imports: "import '../solar_menu.dart';",
        wrap: 'Semantics(header: true, child: mark)',
      });
    },
  },
};
