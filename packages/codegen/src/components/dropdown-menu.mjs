/**
 * SOLAR Dropdown Menu, beyond its IR: where MUI draws each layer, and the two shell templates,
 * rendered into the shells by \`solar:codegen\` on every run. One file per component, so adding one
 * edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn surface (`src/shells/drawn.mjs`) whose content layer holds the caller's rows and headings
 * in place of Figma's examples: MUI's MenuList on the web, `SolarMenuList` in Flutter. It floats
 * where it is anchored (`internal/float.tsx`, `SolarMenuAnchor`), and draws in place otherwise
 * (owner decision 2026-09-24).
 */

import { drawnFlutter, drawnResets } from '../shells/drawn.mjs';
import { menuReact, menuResets } from '../shells/menu.mjs';

const requireLayers = (spec) => {
  if (spec.layers.content?.type !== 'SLOT')
    throw new Error('Dropdown Menu: the IR has no content slot');
  if (!spec.api.size) throw new Error('Dropdown Menu: the IR has no size');
};

export default {
  name: 'Dropdown Menu',
  mui: {
    // The shell draws every layer itself, each with a class of its own; its content is the list.
    slots: 'drawn',
    resets: drawnResets('Dropdown Menu', {
      flexDirection: 'column',
      ...menuResets('Dropdown Menu'),
    }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return menuReact(spec, {
        look: 'the surface’s fill, edge, corners and shadow',
        about: `The surface of a trigger's DropdownItems and DropdownGroupLabels, drawn from Figma's layer tree
(\`internal/layers.tsx\`) around MUI's MenuList: the arrow keys move the focus from row to row,
Home and End to the ends, and a typed letter to a row it starts; its rows take its size. Given
\`anchorEl\` (its trigger), it floats under it while \`open\`, in MUI's Popover: Escape, a click
outside or Tab call \`onClose\`, the focus is held in it and goes back to the trigger. Without
one, it draws in place. Past 300px its rows scroll, as SOLAR's description says. Name it for a
screen reader with \`aria-labelledby\`, its trigger's id.`,
        rows: 'The rows and headings: DropdownItems, and DropdownGroupLabels between them.',
        sized: true,
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the surface’s fill, edge, corners and shadow, read cell by cell',
        about: `Bespoke: the surface of a trigger's SolarDropdownItems and SolarDropdownGroupLabels, drawn
from Figma's layer tree with [SolarLayers] around a [SolarMenuList]: the arrow keys move the focus
from row to row, and its rows take its size. It draws where it is put; to float it under its
trigger, give it to a [SolarMenuAnchor], which closes it on Escape or a tap outside. Past 300 its
rows scroll, as SOLAR's description says.`,
        params: `required this.children,
this.maxHeight = solarMenuMaxHeight,`,
        fields: `/// The rows and headings: SolarDropdownItems, and SolarDropdownGroupLabels between them.
final List<Widget> children;

/// The tallest it grows before its rows scroll.
final double maxHeight;`,
        content: `{
        'content': [
          SolarMenuList(size: size.name, maxHeight: maxHeight, children: children),
        ],
      }`,
        imports: "import '../solar_menu.dart';",
      });
    },
  },
};
