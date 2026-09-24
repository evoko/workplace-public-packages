/**
 * SOLAR Breadcrumbs, beyond its IR: where MUI draws each layer, and the two shell templates,
 * rendered into the shells by \`solar:codegen\` on every run. One file per component, so adding one
 * edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn trail: the caller's Breadcrumb Items, the last the current page, a chevron between each
 * two, each drawn in the layer Figma draws at its place (the first page `item1`, the next
 * `item2`…, the last `current`; the chevrons in order). Past five, the middle collapses to an
 * ellipsis that opens a Dropdown Menu of the pages it hides, as SOLAR's description says.
 */

import {
  drawnResets,
  iconsOf,
  keyPrefixOf,
  treeOf,
  wrapDoc,
} from '../shells/drawn.mjs';

const P = 'SolarBreadcrumbs';
const ITEMS = ['item1', 'item2', 'item3', 'item4'];
const CHEVRONS = [
  'iconChevronRight',
  'iconChevronRight2',
  'iconChevronRight3',
  'iconChevronRight4',
];

const requireLayers = (spec) => {
  for (const layer of [...ITEMS, ...CHEVRONS, 'current'])
    if (!spec.layers[layer])
      throw new Error(`Breadcrumbs: the IR has no ${layer} layer`);
  const icons = iconsOf(spec).filter((i) => CHEVRONS.includes(i.layer));
  if (
    icons.length !== CHEVRONS.length ||
    icons.some((i) => i.react !== 'IconChevronRight')
  )
    throw new Error('Breadcrumbs: its separators are not chevrons');
};

export default {
  name: 'Breadcrumbs',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // The trail is an ordered list laid out as the root is, none of a list's own look; each item
    // and separator an entry of it; a chevron's size is the recipe's.
    resets: drawnResets('Breadcrumbs', {
      display: 'flex',
      [`& .${P}-list`]: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'inherit',
        alignItems: 'inherit',
        margin: '0',
        padding: '0',
        listStyle: 'none',
      },
      [`& .${P}-list > li`]: { display: 'flex' },
      [CHEVRONS.map((c) => `& .${P}-${c}`).join(', ')]: {
        display: 'block',
        flexShrink: '0',
      },
    }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Breadcrumbs.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarBreadcrumbsStyle\` and \`solarBreadcrumbsCompose\` in \`@bwp-web/styles/mui\`:
 * the trail's gaps and its chevrons' size and ink.
 *
 * Where a page sits in its site: its ancestors, BreadcrumbItems with an \`href\`, and the page itself
 * last, drawn as the current page (\`aria-current="page"\`, no link), a chevron between each two,
 * hidden from a screen reader, in a \`nav\` named "Breadcrumb" and an ordered list, as SOLAR's
 * description asks. Past \`maxItems\` (5) the middle collapses to an ellipsis, a button that opens a
 * DropdownMenu of the pages it hides. For progress through steps use a Stepper. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { IconChevronRight } from '@bwp-web/assets';
import {
  Children,
  cloneElement,
  forwardRef,
  Fragment,
  isValidElement,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { solarBreadcrumbsStyle } from '@bwp-web/styles/mui';
import { BreadcrumbItem, type BreadcrumbItemProps } from './BreadcrumbItem.js';
import { DropdownItem } from './DropdownItem.js';
import { DropdownMenu } from './DropdownMenu.js';

/** The layer Figma draws each item in by its place, and each chevron by its. */
const ITEMS = ${JSON.stringify(ITEMS)};
const CHEVRONS = ${JSON.stringify(CHEVRONS)};

export interface BreadcrumbsProps extends Omit<BoxProps, 'children' | 'ref'> {
  /** The trail: BreadcrumbItems, the page's ancestors from the top, and the page itself last. */
  children: ReactNode;
  /** The longest trail shown whole; past it, the middle collapses to an ellipsis. */
  maxItems?: number;
  /** The ellipsis's name, for a screen reader. */
  expandLabel?: string;
}

export const Breadcrumbs = forwardRef<HTMLElement, BreadcrumbsProps>(function Breadcrumbs(
  {
    children,
    maxItems = 5,
    expandLabel = 'Show the hidden pages',
    'aria-label': label = 'Breadcrumb',
    sx,
    ...rest
  },
  ref,
) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<BreadcrumbItemProps>[];
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  // Past its longest, the first page, an ellipsis for the middle, and the current page.
  const collapsed = items.length > Math.max(maxItems, 2);
  const hidden = collapsed ? items.slice(1, -1) : [];
  const ellipsis = (
    <BreadcrumbItem
      aria-label={expandLabel}
      aria-haspopup="menu"
      aria-expanded={menu !== null}
      onClick={(event) => setMenu(event.currentTarget)}
    >
      …
    </BreadcrumbItem>
  );
  const shown = collapsed ? [items[0], ellipsis, items[items.length - 1]] : items;
  const last = shown.length - 1;
  return (
    <Box
      component="nav"
      ref={ref}
      aria-label={label}
      {...rest}
      sx={[solarBreadcrumbsStyle({}), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <ol className="${P}-list">
        {shown.map((item, i) => (
          <Fragment key={i}>
            {i > 0 ? (
              <li aria-hidden>
                <IconChevronRight className={\`${P}-\${CHEVRONS[Math.min(i - 1, CHEVRONS.length - 1)]} ${P}-drawnIcon\`} />
              </li>
            ) : null}
            <li className={\`${P}-\${i === last ? 'current' : ITEMS[Math.min(i, ITEMS.length - 1)]}\`}>
              {i === last ? cloneElement(item, { type: 'current' }) : item}
            </li>
          </Fragment>
        ))}
      </ol>
      {menu ? (
        <DropdownMenu anchorEl={menu} open onClose={() => setMenu(null)}>
          {hidden.map((page, i) => (
            <DropdownItem
              key={i}
              {...(page.props.href !== undefined ? { component: 'a', href: page.props.href } : {})}
              onClick={(event) => {
                setMenu(null);
                page.props.onClick?.(event);
              }}
            >
              {page.props.children}
            </DropdownItem>
          ))}
        </DropdownMenu>
      ) : null}
    </Box>
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
      const icons = iconsOf(spec);
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarBreadcrumbsRecipe]: the trail's gaps and its chevrons' size and ink, read cell by cell.`;
      const about = `Where a page sits in its app: its ancestors, SolarBreadcrumbItems given onPressed, and the page itself last, drawn as the current page, no link, a chevron between each two, excluded from semantics. Past [maxItems] (5) the middle collapses to an ellipsis that opens a SolarDropdownMenu of the pages it hides, as SOLAR's description says. For progress through steps use a Stepper.`;
      return `/// SOLAR Breadcrumbs.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/breadcrumb_item.dart';
import '../generated/components/breadcrumbs.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_menu.dart';
import 'solar_breadcrumb_item.dart';
import 'solar_dropdown_item.dart';
import 'solar_dropdown_menu.dart';
import 'solar_theme_of.dart';

class SolarBreadcrumbs extends StatelessWidget {
  const SolarBreadcrumbs({
    super.key,
    required this.children,
    this.maxItems = 5,
    this.expandLabel = 'Show the hidden pages',
  });

  /// The trail: SolarBreadcrumbItems, the page's ancestors from the top, and the page itself last.
  final List<SolarBreadcrumbItem> children;

  /// The longest trail shown whole; past it, the middle collapses to an ellipsis.
  final int maxItems;

  /// The ellipsis's name, for a screen reader.
  final String expandLabel;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  /// The layer Figma draws each item in by its place, and each chevron by its.
  static const _items = ${JSON.stringify(ITEMS).replace(/"/g, "'")};
  static const _chevrons = ${JSON.stringify(CHEVRONS).replace(/"/g, "'")};

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    const p = SolarBreadcrumbsProps();
    const states = <WidgetState>{};
    // Past its longest, the first page, an ellipsis for the middle, and the current page.
    final collapsed = children.length > (maxItems < 2 ? 2 : maxItems);
    final hidden = collapsed
        ? children.sublist(1, children.length - 1)
        : const <SolarBreadcrumbItem>[];
    final current = children.last;
    final shown = <Widget>[
      if (collapsed) ...[
        children.first,
        SolarMenuAnchor(
          menu: SolarDropdownMenu(
            children: [
              for (final page in hidden)
                SolarDropdownItem(label: page.label, onPressed: page.onPressed),
            ],
          ),
          builder: (context, menu) => Semantics(
            label: expandLabel,
            child: SolarBreadcrumbItem(label: '…', onPressed: menu.open),
          ),
        ),
      ] else
        ...children.take(children.length - 1),
      SolarBreadcrumbItem(
        type: SolarBreadcrumbItemType.current,
        label: current.label,
      ),
    ];
    final last = shown.length - 1;
    String itemAt(int i) =>
        i == last ? 'current' : _items[i < _items.length ? i : _items.length - 1];
    String chevronAt(int i) => _chevrons[i < _chevrons.length ? i : _chevrons.length - 1];
    // Each item drawn in the layer Figma draws at its place, and each chevron in its.
    final parts = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarBreadcrumbsRecipe.lookup(c, p, states),
        dimension: (c) => SolarBreadcrumbsRecipe.dimension(c, p, states),
        color: (c) => SolarBreadcrumbsRecipe.color(t, c, p, states),
        shadow: (c) => SolarBreadcrumbsRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarBreadcrumbsRecipe.textStyle(t, c, p, states),
        present: (_) => true,
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: '${keyPrefixOf(spec.component)}',
      icons: const {${icons.map((i) => `'${i.layer}': ${i.dart}`).join(', ')}},
      composed: {for (var i = 0; i < shown.length; i++) itemAt(i): shown[i]},
    );
    return SolarLayers(
      recipe: parts.recipe,
      tree: _tree,
      keyPrefix: '${keyPrefixOf(spec.component)}',
      content: {
        'root': [
          for (var i = 0; i < shown.length; i++) ...[
            if (i > 0) ExcludeSemantics(child: parts.layer(chevronAt(i - 1))),
            parts.layer(itemAt(i)),
          ],
        ],
      },
    ).layer('root');
  }
}
`;
    },
  },
};
