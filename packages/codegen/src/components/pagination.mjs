/**
 * SOLAR Pagination, beyond its IR: where MUI draws each layer, and the two shell templates,
 * rendered into the shells by \`solar:codegen\` on every run. One file per component, so adding one
 * edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn assembly: the previous arrow, the pages and their gaps, the next arrow, each drawn in the
 * layer Figma draws at its place (the first page `page1`, then `page2` and `page3`, the last
 * `page12`, a gap `paginationEllipsis`). The pages shown are Figma's (owner decision 2026-09-24).
 */

import { drawnResets, keyPrefixOf, treeOf, wrapDoc } from '../shells/drawn.mjs';

const P = 'SolarPagination';
const LAYERS = [
  'previous',
  'page1',
  'page2',
  'page3',
  'paginationEllipsis',
  'page12',
  'next',
];

const requireLayers = (spec) => {
  for (const layer of LAYERS)
    if (!spec.layers[layer])
      throw new Error(`Pagination: the IR has no ${layer} layer`);
};

export default {
  name: 'Pagination',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // The pages are a list laid out as the root is, none of a list's own look.
    resets: drawnResets('Pagination', {
      display: 'flex',
      [`& .${P}-list`]: {
        display: 'flex',
        gap: 'inherit',
        alignItems: 'inherit',
        margin: '0',
        padding: '0',
        listStyle: 'none',
      },
      [`& .${P}-list > li`]: { display: 'flex' },
    }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Pagination.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarPaginationStyle\` in \`@bwp-web/styles/mui\`: the gaps between its items.
 *
 * A list's pages, where their count is known and a reader jumps between them: the previous arrow,
 * the pages, the next arrow, in a \`nav\` named "Pagination" and a list, as SOLAR's description asks.
 * The pages shown are the first, the last and the current ± 1, with three at the end the current is
 * near (\`1 2 3 … 12\`), a gap of more than one page an ellipsis, one of one page that page. The
 * current page is announced (\`aria-current="page"\`); the arrows are disabled at the ends. \`page\`
 * (from 1) and \`onChange\` hold the page; \`hrefOf\` makes each page a link. A single page draws
 * nothing. For a step-by-step flow use a PageNavigator. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { useControlled } from '@mui/material/utils';
import { forwardRef } from 'react';
import { solarPaginationStyle } from '@bwp-web/styles/mui';
import { PaginationEllipsis } from './PaginationEllipsis.js';
import { PaginationItem } from './PaginationItem.js';
import { PaginationNav } from './PaginationNav.js';

/**
 * The pages shown for \`page\` of \`count\`, and the gaps between them, as Figma draws them: the first,
 * the last, the current ± 1, and three at the end the current is near; a gap of one page is that
 * page.
 */
export function pagesOf(page: number, count: number): (number | 'gap')[] {
  const shown = new Set([1, count, page - 1, page, page + 1]);
  if (page <= 2) [1, 2, 3].forEach((p) => shown.add(p));
  if (page >= count - 1) [count - 2, count - 1, count].forEach((p) => shown.add(p));
  const pages = [...shown].filter((p) => p >= 1 && p <= count).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  pages.forEach((p, i) => {
    const before = pages[i - 1];
    if (before !== undefined && p - before === 2) out.push(p - 1);
    else if (before !== undefined && p - before > 2) out.push('gap');
    out.push(p);
  });
  return out;
}

/** The layer Figma draws each page in by its place among the pages. */
const pageLayer = (i: number, last: boolean) =>
  last ? 'page12' : i === 0 ? 'page1' : i === 1 ? 'page2' : 'page3';

export interface PaginationProps extends Omit<BoxProps, 'children' | 'onChange' | 'ref'> {
  /** How many pages there are. */
  count: number;
  /** The current page, from 1, where the caller keeps it. */
  page?: number;
  /** The page it starts on, where \`page\` does not say. */
  defaultPage?: number;
  /** Called with the page chosen. */
  onChange?: (page: number) => void;
  /** Where each page is: each is then a link. */
  hrefOf?: (page: number) => string;
}

export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  { count, page: pageProp, defaultPage = 1, onChange, hrefOf, 'aria-label': label = 'Pagination', sx, ...rest },
  ref,
) {
  const [page, setPage] = useControlled({
    controlled: pageProp,
    default: defaultPage,
    name: 'Pagination',
    state: 'page',
  });
  // A single page is no pagination, as its description says.
  if (count <= 1) return null;
  const go = (to: number) => {
    setPage(to);
    onChange?.(to);
  };
  const items = pagesOf(page, count);
  const pages = items.filter((p) => p !== 'gap').length;
  let seen = 0;
  return (
    <Box
      component="nav"
      ref={ref}
      aria-label={label}
      {...rest}
      sx={[solarPaginationStyle({}), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <ul className="${P}-list">
        <li className="${P}-previous">
          <PaginationNav direction="previous" disabled={page <= 1} onClick={() => go(page - 1)} />
        </li>
        {items.map((p, i) => {
          if (p === 'gap')
            return (
              <li key={\`gap\${i}\`} className="${P}-paginationEllipsis">
                <PaginationEllipsis />
              </li>
            );
          const at = seen++;
          return (
            <li key={p} className={\`${P}-\${pageLayer(at, at === pages - 1)}\`}>
              <PaginationItem
                selected={p === page}
                onClick={() => go(p)}
                {...(hrefOf ? { href: hrefOf(p) } : {})}
              >
                {p}
              </PaginationItem>
            </li>
          );
        })}
        <li className="${P}-next">
          <PaginationNav direction="next" disabled={page >= count} onClick={() => go(page + 1)} />
        </li>
      </ul>
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
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarPaginationRecipe]: the gaps between its items, read cell by cell.`;
      const about = `A list's pages, where their count is known and a reader jumps between them: the previous arrow, the pages, the next arrow. The pages shown are the first, the last and the current ± 1, with three at the end the current is near (1 2 3 … 12), a gap of more than one page an ellipsis, one of one page that page. The current page is announced selected; the arrows are disabled at the ends. [page] (from 1) and [onChanged] hold the page. A single page draws nothing. For a step-by-step flow use a SolarPageNavigator.`;
      return `/// SOLAR Pagination.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/pagination.dart';
import '../generated/components/paginationnav.dart';
import '../solar_layers.dart';
import 'solar_paginationellipsis.dart';
import 'solar_paginationitem.dart';
import 'solar_paginationnav.dart';
import 'solar_theme_of.dart';

/// The pages shown for [page] of [count], and the gaps between them (null), as Figma draws them:
/// the first, the last, the current ± 1, and three at the end the current is near; a gap of one
/// page is that page.
List<int?> solarPagesOf(int page, int count) {
  final shown = {1, count, page - 1, page, page + 1};
  if (page <= 2) shown.addAll([1, 2, 3]);
  if (page >= count - 1) shown.addAll([count - 2, count - 1, count]);
  final pages = shown.where((p) => p >= 1 && p <= count).toList()..sort();
  final out = <int?>[];
  for (var i = 0; i < pages.length; i++) {
    if (i > 0 && pages[i] - pages[i - 1] == 2) out.add(pages[i] - 1);
    if (i > 0 && pages[i] - pages[i - 1] > 2) out.add(null);
    out.add(pages[i]);
  }
  return out;
}

class SolarPagination extends StatelessWidget {
  const SolarPagination({
    super.key,
    required this.count,
    required this.page,
    required this.onChanged,
  });

  /// How many pages there are.
  final int count;

  /// The current page, from 1.
  final int page;

  /// Called with the page chosen.
  final ValueChanged<int>? onChanged;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  @override
  Widget build(BuildContext context) {
    // A single page is no pagination, as its description says.
    if (count <= 1) return const SizedBox.shrink();
    final t = solarThemeOf(context);
    const p = SolarPaginationProps();
    const states = <WidgetState>{};
    final recipe = SolarLayerRecipe(
      lookup: (c) => SolarPaginationRecipe.lookup(c, p, states),
      dimension: (c) => SolarPaginationRecipe.dimension(c, p, states),
      color: (c) => SolarPaginationRecipe.color(t, c, p, states),
      shadow: (c) => SolarPaginationRecipe.shadow(t, c, p, states),
      textStyle: (c) => SolarPaginationRecipe.textStyle(t, c, p, states),
      present: (_) => true,
      glyph: (_) => null,
    );
    void go(int to) => onChanged?.call(to);
    final items = solarPagesOf(page, count);
    final pages = items.whereType<int>().length;
    // Each item drawn in the layer Figma draws at its place.
    final drawn = <(String, Widget)>[
      (
        'previous',
        SolarPaginationNav(
          direction: SolarPaginationNavDirection.previous,
          disabled: page <= 1,
          onPressed: () => go(page - 1),
        ),
      ),
    ];
    var seen = 0;
    for (final item in items) {
      if (item == null) {
        drawn.add(('paginationEllipsis', const SolarPaginationEllipsis()));
        continue;
      }
      final at = seen++;
      drawn.add((
        at == pages - 1
            ? 'page12'
            : at == 0
            ? 'page1'
            : at == 1
            ? 'page2'
            : 'page3',
        SolarPaginationItem(
          page: item,
          selected: item == page,
          onPressed: () => go(item),
        ),
      ));
    }
    drawn.add((
      'next',
      SolarPaginationNav(
        direction: SolarPaginationNavDirection.next,
        disabled: page >= count,
        onPressed: () => go(page + 1),
      ),
    ));
    Widget layerOf((String, Widget) d) => SolarLayers(
      recipe: recipe,
      tree: _tree,
      keyPrefix: '${keyPrefixOf(spec.component)}',
      composed: {d.$1: d.$2},
    ).layer(d.$1);
    return SolarLayers(
      recipe: recipe,
      tree: _tree,
      keyPrefix: '${keyPrefixOf(spec.component)}',
      // Each in a subtree of its own: several items share a layer (the middle pages, two gaps).
      content: {
        'root': [
          for (var i = 0; i < drawn.length; i++)
            KeyedSubtree(key: ValueKey(i), child: layerOf(drawn[i])),
        ],
      },
    ).layer('root');
  }
}
`;
    },
  },
};
