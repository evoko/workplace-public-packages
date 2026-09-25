/**
 * SOLAR Expandable Card, beyond its IR: where MUI draws each layer and marks each state, and the
 * two shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn card (`src/shells/drawn.mjs`) whose header is a disclosure: the button that shows and
 * hides its content, announced expanded or collapsed; the card's edge and focus ring follow the
 * header's states.
 */

import {
  dartIcon,
  drawnResets,
  iconsOf,
  reactIcon,
  treeOf,
  wrapDoc,
} from '../shells/drawn.mjs';

const P = 'SolarExpandableCard';

const requireLayers = (spec) => {
  for (const slot of ['title', 'description', 'content'])
    if (!spec.slots[slot])
      throw new Error(`Expandable Card: the IR has no ${slot} slot`);
  if (!spec.layers.header)
    throw new Error('Expandable Card: the IR has no header layer');
  if (spec.api.expanded?.type !== 'boolean')
    throw new Error('Expandable Card: the IR has no expanded prop');
};

const ABOUT = `A card whose content shows on demand: its header (the \`title\` and a chevron) is a button
that shows and hides the content under it (the \`description\`, in Figma's words' look, then the
caller's children), announced expanded or collapsed. The card is hovered and focused as its header
is.`;

export default {
  name: 'Expandable Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own; the header is a bare
    // button. A card is a block, and its words wrap.
    slots: 'drawn',
    resets: drawnResets('Expandable Card', {
      display: 'flex',
      [`& .${P}-title, & .${P}-description`]: {
        whiteSpace: 'normal',
        minWidth: '0',
        textAlign: 'start',
      },
      [`& .${P}-header`]: {
        padding: '0',
        margin: '0',
        font: 'inherit',
        color: 'inherit',
      },
    }),
    // Hovered as the pointer is on its header, focused as the keyboard is (MUI marks it
    // focus-visible): the card's look follows its header's.
    states: {
      default: null,
      hover: `&:has(.${P}-header:hover)`,
      focus: `&:has(.${P}-header.Mui-focusVisible)`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    label: 'title',
    slots: {
      title: { react: 'title', flutter: 'title' },
      description: { react: 'description', flutter: 'description' },
      content: { react: 'children', flutter: 'children' },
    },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const icons = iconsOf(spec);
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, \`solarExpandableCardStyle\` and \`solarExpandableCardCompose\` in \`@bwp-web/styles/mui\`: the card's edge, shadow and focus ring by state, its header and content, collapsed and expanded.`;
      return `/**
 * SOLAR Expandable Card.
 *
${wrapDoc(header, ' * ')}
 *
${wrapDoc(`${ABOUT} \`expanded\` and \`onExpandedChange\` hold whether it is expanded, where the caller keeps it; \`defaultExpanded\` where it does not. Drawn from Figma's layer tree (\`internal/layers.tsx\`). The app must load \`@bwp-web/styles/tokens.css\`.`, ' * ')}
 */

import Box, { type BoxProps } from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { useControlled } from '@mui/material/utils';
import { ${icons.map((i) => i.react).join(', ')} } from '@bwp-web/assets';
import { forwardRef, useId, type ReactNode } from 'react';
import {
  solarExpandableCardCompose,
  solarExpandableCardStyle,
  type SolarExpandableCardProps,
} from '@bwp-web/styles/mui';
import { drawChildren, type DrawnLayer } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface ExpandableCardProps
  extends SolarExpandableCardProps,
    // MUI types BoxProps' ref for any element; the component's own, a <div>, comes from forwardRef.
    Omit<BoxProps, keyof SolarExpandableCardProps | 'title' | 'ref'> {
  /** What the card is about: its header's words, which name its button. */
  title: ReactNode;
  /** The content's words, in the look Figma draws them. */
  description?: ReactNode;
  /** The caller's content, after the description. */
  children?: ReactNode;
  /** Whether it starts expanded, where \`expanded\` does not say. */
  defaultExpanded?: boolean;
  /** Called with whether it is to be expanded, as its header is pressed. */
  onExpandedChange?: (expanded: boolean) => void;
}

export const ExpandableCard = forwardRef<HTMLDivElement, ExpandableCardProps>(
  function ExpandableCard(
    {
      expanded: expandedProp,
      defaultExpanded = false,
      onExpandedChange,
      title,
      description,
      children,
      sx,
      ...rest
    },
    ref,
  ) {
    const [expanded, setExpanded] = useControlled({
      controlled: expandedProp,
      default: defaultExpanded,
      name: 'ExpandableCard',
      state: 'expanded',
    });
    const id = useId();
    const composed = solarExpandableCardCompose({ expanded });
    // A slot left empty is not drawn.
    const parts = {
      ...composed,
      description: {
        ...composed.description,
        present: composed.description?.present !== false && description != null,
      },
    };
    const toggle = () => {
      setExpanded(!expanded);
      onExpandedChange?.(!expanded);
    };
    return (
      <Box
        ref={ref}
        {...rest}
        sx={[solarExpandableCardStyle({ expanded }), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: '${P}',
          tree: TREE,
          parts,
          text: { title, description },
          icons: { ${icons.map((i) => `${i.layer}: ${reactIcon(i, spec)}`).join(', ')} },
          render: {
            // The header is the disclosure's button, naming the content it shows.
            header: ({ className: c, style, children: drawn }: DrawnLayer) => (
              <ButtonBase
                className={c}
                style={style}
                disableRipple
                aria-expanded={expanded}
                aria-controls={expanded ? \`\${id}-content\` : undefined}
                onClick={toggle}
              >
                {drawn}
              </ButtonBase>
            ),
            // The content: Figma's description, then the caller's children.
            content: ({ className: c, style, children: drawn }: DrawnLayer) => (
              <div id={\`\${id}-content\`} className={c} style={style}>
                {drawn}
                {children}
              </div>
            ),
          },
        })}
      </Box>
    );
  },
);
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      const icons = iconsOf(spec);
      const tree = Object.entries(treeOf(spec))
        .map(
          ([parent, kids]) =>
            `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarExpandableCardRecipe]: the card's edge, shadow and focus ring by state, its header and content, collapsed and expanded, read cell by cell.`;
      return `/// SOLAR Expandable Card.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(`${ABOUT.replace(/`([a-z]+)`/g, '[$1]')} [expanded] and [onExpandedChanged] hold whether it is expanded. Drawn from Figma's layer tree with [SolarLayers].`, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/expandable_card.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarExpandableCard extends StatefulWidget {
  const SolarExpandableCard({
    super.key,
    required this.title,
    this.expanded = false,
    this.onExpandedChanged,
    this.description,
    this.children = const [],
    this.statesController,
  });

  /// What the card is about: its header's words, which name its button.
  final String title;

  final bool expanded;

  /// Called with whether it is to be expanded, as its header is pressed; null disables it.
  final ValueChanged<bool>? onExpandedChanged;

  /// The content's words, in the look Figma draws them.
  final String? description;

  /// The caller's content, after the description.
  final List<Widget> children;

  /// Its header's states, where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  State<SolarExpandableCard> createState() => _SolarExpandableCardState();
}

class _SolarExpandableCardState extends State<SolarExpandableCard> {
  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  WidgetStatesController? _own;

  /// The header's states, which the whole card is drawn in.
  WidgetStatesController get _states =>
      widget.statesController ?? (_own ??= WidgetStatesController());

  @override
  void dispose() {
    _own?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final w = widget;
    final p = SolarExpandableCardProps(expanded: w.expanded);
    return ListenableBuilder(
      listenable: _states,
      builder: (context, _) {
        final states = _states.value;
        SolarLayers layers(Map<String, List<Widget>> content) => SolarLayers(
          recipe: SolarLayerRecipe(
            lookup: (c) => SolarExpandableCardRecipe.lookup(c, p, states),
            dimension: (c) => SolarExpandableCardRecipe.dimension(c, p, states),
            color: (c) => SolarExpandableCardRecipe.color(t, c, p, states),
            shadow: (c) => SolarExpandableCardRecipe.shadow(t, c, p, states),
            textStyle: (c) =>
                SolarExpandableCardRecipe.textStyle(t, c, p, states),
            // A slot left empty is not drawn.
            present: (l) => l == 'description'
                ? w.description != null &&
                      SolarExpandableCardRecipe.present(l, p, states)
                : SolarExpandableCardRecipe.present(l, p, states),
            glyph: (_) => null,
          ),
          tree: _tree,
          keyPrefix: 'expandableCard',
          text: {'title': w.title, 'description': ?w.description},
          wraps: const {
            'title': TextAlign.start,
            'description': TextAlign.start,
          },
          icons: const {${icons.map((i) => `'${i.layer}': ${dartIcon(i, spec)}`).join(', ')}},
          content: content,
          builders: {
            // The header is the disclosure's button, in whose states the card is drawn.
            'header': (header) => Semantics(
              expanded: w.expanded,
              child: SolarPressable(
                onPressed: w.onExpandedChanged == null
                    ? null
                    : () => w.onExpandedChanged!(!w.expanded),
                statesController: _states,
                builder: (_, _) => header,
              ),
            ),
          },
        );
        // The content: Figma's description, then the caller's children.
        final figma = layers(const {});
        return layers(
          w.expanded
              ? {
                  'content': [
                    if (w.description != null) figma.layer('description'),
                    ...w.children,
                  ],
                }
              : const {},
        ).layer('root');
      },
    );
  }
}
`;
    },
  },
};
