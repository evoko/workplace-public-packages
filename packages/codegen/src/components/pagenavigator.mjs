/**
 * SOLAR PageNavigator, beyond its IR: where MUI draws each layer, and the two shell templates,
 * rendered into the shells by \`solar:codegen\` on every run. One file per component, so adding one
 * edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn pager: the previous and next PageNavButtons and, between them, where the reader is.
 */

import {
  drawnResets,
  keyPrefixOf,
  treeOf,
  wrapDoc,
  treeConsts,
} from '../shells/drawn.mjs';

const P = 'SolarPageNavigator';

const requireLayers = (spec) => {
  for (const layer of ['prevButton', 'pageIndicator', 'nextButton'])
    if (!spec.layers[layer])
      throw new Error(`PageNavigator: the IR has no ${layer} layer`);
};

export default {
  name: 'PageNavigator',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('PageNavigator', { display: 'flex' }),
  },
  flutter: {},
  shells: {
    // Where the reader is, written from the page and the count.
    slots: { pageIndicator: 'indicator' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR PageNavigator.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarPageNavigatorStyle\` and \`solarPageNavigatorCompose\` in
 * \`@bwp-web/styles/mui\`: the gaps between its parts, and its position's text style and ink.
 *
 * A linear pager for a sequence walked from start to end (a wizard, onboarding, a document): the
 * previous and next PageNavButtons, disabled at the ends rather than hidden, and between them where
 * the reader is ("1 of 10", \`indicator\` overrides), announced as it changes. \`page\` (from 1) and
 * \`onChange\` hold the page. No page numbers: for jumping between pages use a Pagination. The app
 * must load \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { useControlled } from '@mui/material/utils';
import { forwardRef, type ReactNode } from 'react';
import {
  solarPageNavigatorCompose,
  solarPageNavigatorStyle,
} from '@bwp-web/styles/mui';
import { PageNavButton } from './PageNavButton.js';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface PageNavigatorProps extends Omit<BoxProps, 'children' | 'onChange' | 'ref'> {
  /** How many pages there are. */
  count: number;
  /** The current page, from 1, where the caller keeps it. */
  page?: number;
  /** The page it starts on, where \`page\` does not say. */
  defaultPage?: number;
  /** Called with the page gone to. */
  onChange?: (page: number) => void;
  /** Where the reader is, in words; "3 of 10" by default. */
  indicator?: (page: number, count: number) => ReactNode;
}

export const PageNavigator = forwardRef<HTMLDivElement, PageNavigatorProps>(function PageNavigator(
  { count, page: pageProp, defaultPage = 1, onChange, indicator, sx, ...rest },
  ref,
) {
  const [page, setPage] = useControlled({
    controlled: pageProp,
    default: defaultPage,
    name: 'PageNavigator',
    state: 'page',
  });
  const go = (to: number) => {
    setPage(to);
    onChange?.(to);
  };
  const parts = solarPageNavigatorCompose({});
  return (
    <Box ref={ref} {...rest} sx={[solarPageNavigatorStyle({}), ...(Array.isArray(sx) ? sx : [sx])]}>
      {drawChildren('root', {
        prefix: '${P}',
        tree: TREE, slots: SLOTS,
        parts,
        // Where the reader is, announced as it changes.
        text: {
          pageIndicator: (
            <span aria-live="polite">
              {indicator ? indicator(page, count) : \`\${page} of \${count}\`}
            </span>
          ),
        },
        render: {
          prevButton: ({ className, style }) => (
            <span className={className} style={style}>
              <PageNavButton direction="prev" disabled={page <= 1} onClick={() => go(page - 1)} />
            </span>
          ),
          nextButton: ({ className, style }) => (
            <span className={className} style={style}>
              <PageNavButton direction="next" disabled={page >= count} onClick={() => go(page + 1)} />
            </span>
          ),
        },
      })}
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
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarPageNavigatorRecipe]: the gaps between its parts, and its position's text style and ink, read cell by cell.`;
      const about = `A linear pager for a sequence walked from start to end (a wizard, onboarding, a document): the previous and next SolarPageNavButtons, disabled at the ends rather than hidden, and between them where the reader is ("1 of 10", [indicator] overrides), announced as it changes. [page] (from 1) and [onChanged] hold the page. No page numbers: for jumping between pages use a SolarPagination.`;
      return `/// SOLAR PageNavigator.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/pagenavbutton.dart';
import '../generated/components/pagenavigator.dart';
import '../solar_layers.dart';
import 'solar_pagenavbutton.dart';
import 'solar_theme_of.dart';

class SolarPageNavigator extends StatelessWidget {
  const SolarPageNavigator({
    super.key,
    required this.count,
    required this.page,
    required this.onChanged,
    this.indicator,
  });

  /// How many pages there are.
  final int count;

  /// The current page, from 1.
  final int page;

  /// Called with the page gone to.
  final ValueChanged<int>? onChanged;

  /// Where the reader is, in words; "3 of 10" by default.
  final String Function(int page, int count)? indicator;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    const p = SolarPageNavigatorProps();
    const states = <WidgetState>{};
    return SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarPageNavigatorRecipe.lookup(c, p, states),
        dimension: (c) => SolarPageNavigatorRecipe.dimension(c, p, states),
        color: (c) => SolarPageNavigatorRecipe.color(t, c, p, states),
        shadow: (c) => SolarPageNavigatorRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarPageNavigatorRecipe.textStyle(t, c, p, states),
        present: (l) => SolarPageNavigatorRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: '${keyPrefixOf(spec.component)}',
      text: {'pageIndicator': indicator?.call(page, count) ?? '$page of $count'},
      composed: {
        'prevButton': SolarPageNavButton(
          direction: SolarPageNavButtonDirection.prev,
          disabled: page <= 1,
          onPressed: () => onChanged?.call(page - 1),
        ),
        'nextButton': SolarPageNavButton(
          direction: SolarPageNavButtonDirection.next,
          disabled: page >= count,
          onPressed: () => onChanged?.call(page + 1),
        ),
      },
      // Where the reader is, announced as it changes.
      builders: {'pageIndicator': (layer) => Semantics(liveRegion: true, child: layer)},
    ).layer('root');
  }
}
`;
    },
  },
};
