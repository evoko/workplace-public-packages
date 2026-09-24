/**
 * SOLAR Context Menu, beyond its IR: where MUI draws each layer, and the two shell templates,
 * rendered into the shells by \`solar:codegen\` on every run. One file per component, so adding one
 * edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn surface, as Dropdown Menu is (`src/shells/menu.mjs`): its content layer holds the
 * caller's rows and dividers, and it floats at a point, the pointer's, where it is anchored.
 */

import { drawnFlutter, drawnResets } from '../shells/drawn.mjs';
import { menuReact, menuResets } from '../shells/menu.mjs';

const requireLayers = (spec) => {
  if (spec.layers.content?.type !== 'SLOT')
    throw new Error('Context Menu: the IR has no content slot');
};

export default {
  name: 'Context Menu',
  mui: {
    // The shell draws every layer itself, each with a class of its own; its content is the list.
    slots: 'drawn',
    resets: drawnResets('Context Menu', {
      flexDirection: 'column',
      ...menuResets('Context Menu'),
    }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return menuReact(spec, {
        look: 'the surface’s fill, edge, corners and shadow',
        about: `The surface of an object's actions, ContextMenuItems with Dividers between them, drawn from
Figma's layer tree (\`internal/layers.tsx\`) around MUI's MenuList: the arrow keys move the focus
from row to row. Given \`anchorPosition\` (where the pointer was, on a right-click or a long press),
it floats there while \`open\`, in MUI's Popover, kept on the page: Escape, a click outside or Tab
call \`onClose\`, the focus is held in it and goes back. Without one, it draws in place. For a
toolbar's actions, use a DropdownMenu. A Divider in it is a list item: \`<Divider component="li"
/>\`.`,
        rows: 'The actions: ContextMenuItems, and Dividers between their groups.',
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the surface’s fill, edge, corners and shadow, read cell by cell',
        about: `Bespoke: the surface of an object's actions, SolarContextMenuItems with SolarDividers between
them, drawn from Figma's layer tree with [SolarLayers] around a [SolarMenuList]: the arrow keys
move the focus from row to row. It draws where it is put; to float it at the pointer, give it to
a [SolarMenuAnchor] and open its controller at the point (\`controller.open(position: …)\`). For a
toolbar's actions, use a SolarDropdownMenu.`,
        params: `required this.children,
this.maxHeight = solarMenuMaxHeight,`,
        fields: `/// The actions: SolarContextMenuItems, and SolarDividers between their groups.
final List<Widget> children;

/// The tallest it grows before its rows scroll.
final double maxHeight;`,
        content: `{
        'content': [SolarMenuList(maxHeight: maxHeight, children: children)],
      }`,
        imports: "import '../solar_menu.dart';",
      });
    },
  },
};
