/**
 * SOLAR List, beyond its IR: where MUI draws each layer, and the two shell templates, rendered into
 * the shells by \`solar:codegen\` on every run. One file per component, so adding one edits nothing
 * shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn container (`src/shells/drawn.mjs`) whose items layer holds the caller's ListItems in place
 * of Figma's examples, a Divider between each two as Figma draws them; its rows take its
 * compactness, as Figma draws them.
 */

import {
  drawnResets,
  keyPrefixOf,
  treeOf,
  wrapDoc,
  treeConsts,
} from '../shells/drawn.mjs';
import { dartParam } from '../shells/helpers.mjs';

const requireLayers = (spec) => {
  if (spec.layers.items?.type !== 'SLOT')
    throw new Error('List: the IR has no items slot');
  if (spec.api.inCard?.type !== 'boolean')
    throw new Error('List: the IR has no inCard prop');
};

const P = 'SolarList';

export default {
  name: 'List',
  mui: {
    // The shell draws every layer itself, each with a class of its own; its items are a list.
    slots: 'drawn',
    // A block, as a list spans what holds it; its items layer is the <ul>, each row an <li> holding
    // the row and the divider after it, stacked as Figma stacks them.
    resets: drawnResets('List', {
      display: 'flex',
      flexDirection: 'column',
      [`& .${P}-items`]: { margin: '0', padding: '0', listStyle: 'none' },
      [`& .${P}-items > li`]: { display: 'flex', flexDirection: 'column' },
    }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR List.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarListStyle\` and \`solarListCompose\` in \`@bwp-web/styles/mui\`: the container's
 * edge, corners and shadow, in a card or not, and its rows' compactness.
 *
 * The container of ListItems, a list, drawn from Figma's layer tree (\`internal/layers.tsx\`), a
 * Divider between each two unless \`dividers\` is false. \`inCard\` draws it as Figma draws its
 * in-card list; its rows take its compactness, as Figma draws them. For navigation, settings and
 * pickers; for data in columns, use a Table. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import {
  Children,
  createContext,
  forwardRef,
  useContext,
  type ReactNode,
} from 'react';
import {
  solarListCompose,
  solarListStyle,
  type SolarListProps,
} from '@bwp-web/styles/mui';
import { Divider } from './Divider.js';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

const ListContext = createContext<boolean | undefined>(undefined);

/** Whether the List around a row makes it compact; undefined outside one. */
export const useListCompact = () => useContext(ListContext);

export interface ListProps
  extends SolarListProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarListProps | 'children' | 'ref'> {
  /** The rows: ListItems. */
  children: ReactNode;
  /** Whether a Divider goes between each two rows, as Figma draws them; true by default. */
  dividers?: boolean;
}

export const List = forwardRef<HTMLDivElement, ListProps>(function List(
  { inCard, children, dividers = true, sx, ...rest },
  ref,
) {
  const look = { inCard };
  const parts = solarListCompose(look);
  // The rows' compactness, as the recipe says Figma draws them in this list.
  const compact = parts.listItem?.['variant.compact'] === 'true';
  const rows = Children.toArray(children);
  return (
    <ListContext.Provider value={compact}>
      <Box ref={ref} {...rest} sx={[solarListStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}>
        {drawChildren('root', {
          prefix: '${P}',
          tree: TREE, slots: SLOTS,
          parts,
          content: {
            items: rows.map((row, i) => (
              <li key={i}>
                {row}
                {dividers && i < rows.length - 1 ? <Divider aria-hidden /> : null}
              </li>
            )),
          },
          render: {
            items: ({ className, style, children: items }) => (
              <ul className={className} style={style}>
                {items}
              </ul>
            ),
          },
        })}
      </Box>
    </ListContext.Provider>
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      const tree = Object.entries(treeOf(spec))
        .map(
          ([parent, kids]) =>
            `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarListRecipe]: the container's edge, corners and shadow, in a card or not, and its rows' compactness, read cell by cell.`;
      const about = `The container of SolarListItems, drawn from Figma's layer tree with [SolarLayers] and announced as a list, a SolarDivider between each two unless [dividers] is false. [inCard] draws it as Figma draws its in-card list; its rows take its compactness, as Figma draws them. For navigation, settings and pickers; for data in columns, use a Table.`;
      return `/// SOLAR List.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';

import '../generated/components/list.dart';
import '../solar_layers.dart';
import '../solar_list.dart';
import 'solar_divider.dart';
import 'solar_theme_of.dart';

class SolarList extends StatelessWidget {
  const SolarList({
    super.key,
    ${dartParam('List', 'inCard', spec.api.inCard)},
    required this.children,
    this.dividers = true,
  });

  final bool inCard;

  /// The rows: SolarListItems.
  final List<Widget> children;

  /// Whether a SolarDivider goes between each two rows, as Figma draws them.
  final bool dividers;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarListProps(inCard: inCard);
    const states = <WidgetState>{};
    // The rows' compactness, as the recipe says Figma draws them in this list.
    final compact =
        SolarListRecipe.lookup('listItem.variant.compact', p, states) == 'k:true';
    final items = <Widget>[
      for (final (i, row) in children.indexed) ...[
        Semantics(role: SemanticsRole.listItem, child: row),
        if (dividers && i < children.length - 1)
          const ExcludeSemantics(child: SolarDivider()),
      ],
    ];
    return SolarListScope(
      compact: compact,
      child: Semantics(
        role: SemanticsRole.list,
        explicitChildNodes: true,
        child: SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarListRecipe.lookup(c, p, states),
            dimension: (c) => SolarListRecipe.dimension(c, p, states),
            color: (c) => SolarListRecipe.color(t, c, p, states),
            shadow: (c) => SolarListRecipe.shadow(t, c, p, states),
            textStyle: (c) => SolarListRecipe.textStyle(t, c, p, states),
            present: (l) => SolarListRecipe.present(l, p, states),
            glyph: (_) => null,
          ),
          tree: _tree,
          keyPrefix: '${keyPrefixOf(spec.component)}',
          content: {'items': items},
        ).layer('root'),
      ),
    );
  }
}
`;
    },
  },
};
