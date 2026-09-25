/**
 * SOLAR Accordion, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * One item of an accordion, drawn from Figma's layers (`src/shells/drawn.mjs`). Collapsed, the
 * item is its header, a disclosure button. Expanded, Figma draws it as its own collapsed header,
 * nested, over the content: the shells draw that header with the collapsed item's own look, a
 * button announced expanded, hovered with the item as Figma draws it.
 */

import {
  dartIcon,
  drawnResets,
  iconsOf,
  reactIcon,
  treeOf,
  wrapDoc,
  treeConsts,
} from '../shells/drawn.mjs';

const P = 'SolarAccordion';

const requireLayers = (spec) => {
  for (const slot of ['title', 'description', 'content'])
    if (!spec.slots[slot])
      throw new Error(`Accordion: the IR has no ${slot} slot`);
  if (!spec.layers.accordion)
    throw new Error('Accordion: the IR draws no nested header');
  for (const prop of ['expanded', 'disabled'])
    if (spec.api[prop]?.type !== 'boolean')
      throw new Error(`Accordion: the IR has no ${prop} prop`);
};

const ABOUT = `One item of an accordion, stacked with others: its header (the \`title\` and a chevron) is
a button that shows and hides the content under it (the \`description\`, in Figma's words' look,
then the caller's children), announced expanded or collapsed. Expanded, the header is drawn as the
collapsed item is, its chevron turned up. For a card that expands, use an Expandable Card.`;

export default {
  name: 'Accordion',
  mui: {
    // The shell draws every layer itself, each with a class of its own; the header is a bare
    // button, its words wrapping. Expanded, its chevron is turned up.
    slots: 'drawn',
    resets: drawnResets('Accordion', {
      display: 'flex',
      padding: '0',
      margin: '0',
      font: 'inherit',
      color: 'inherit',
      textAlign: 'start',
      [`& .${P}-title, & .${P}-description`]: {
        whiteSpace: 'normal',
        minWidth: '0',
      },
      [`&.${P}-expanded > .${P}--accordion .${P}--iconChevronDown`]: {
        transform: 'rotate(180deg)',
      },
    }),
    // Hovered as the pointer is over the item: its header, or the expanded item, whose nested
    // header is hovered with it, as Figma draws it. Focused as the keyboard reaches the header
    // (MUI marks it focus-visible); disabled by the shell's class.
    states: {
      default: null,
      hover: `&:hover, .${P}-expanded:hover > &`,
      focus: '&.Mui-focusVisible',
      disabled: `&.${P}-disabled`,
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
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, \`solarAccordionStyle\` and \`solarAccordionCompose\` in \`@bwp-web/styles/mui\`: the header's rule, fill and focus ring by state, and the content's, collapsed and expanded.`;
      return `/**
 * SOLAR Accordion.
 *
${wrapDoc(header, ' * ')}
 *
${wrapDoc(`${ABOUT} \`expanded\` and \`onExpandedChange\` hold whether it is expanded, where the caller keeps it; \`defaultExpanded\` where it does not. Drawn from Figma's layer tree (\`internal/layers.tsx\`). The app must load \`@bwp-web/styles/tokens.css\`.`, ' * ')}
 */

import Box, { type BoxProps } from '@mui/material/Box';
import ButtonBase, { type ButtonBaseProps } from '@mui/material/ButtonBase';
import { useControlled } from '@mui/material/utils';
import { ${icons.map((i) => i.react).join(', ')} } from '@bwp-web/assets';
import { forwardRef, useId, type ReactNode, type Ref } from 'react';
import {
  solarAccordionCompose,
  solarAccordionStyle,
  type SolarAccordionProps,
} from '@bwp-web/styles/mui';
import { drawChildren, type DrawnLayer } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface AccordionProps
  extends SolarAccordionProps,
    // MUI types BoxProps' ref for any element; the component's own comes from forwardRef.
    Omit<BoxProps, keyof SolarAccordionProps | 'title' | 'ref'> {
  /** What the item is about: its header's words, which name its button. */
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

export const Accordion = forwardRef<HTMLElement, AccordionProps>(function Accordion(
  {
    disabled = false,
    expanded: expandedProp,
    defaultExpanded = false,
    onExpandedChange,
    title,
    description,
    children,
    className,
    sx,
    ...rest
  },
  ref,
) {
  const [expanded, setExpanded] = useControlled({
    controlled: expandedProp,
    default: defaultExpanded,
    name: 'Accordion',
    state: 'expanded',
  });
  const id = useId();
  const toggle = () => {
    setExpanded(!expanded);
    onExpandedChange?.(!expanded);
  };
  const classes = (open: boolean, own?: string) =>
    [disabled ? '${P}-disabled' : null, open ? '${P}-expanded' : null, own]
      .filter(Boolean)
      .join(' ') || undefined;
  // The header's title and chevron, as the collapsed item draws them.
  const heading = drawChildren('root', {
    prefix: '${P}',
    tree: TREE, slots: SLOTS,
    parts: solarAccordionCompose({ disabled, expanded: false }),
    text: { title },
    icons: { ${icons.map((i) => `${i.layer}: ${reactIcon(i, spec)}`).join(', ')} },
  });
  const button = {
    disabled,
    disableRipple: true,
    'aria-expanded': expanded,
    onClick: toggle,
  } satisfies ButtonBaseProps;
  const sxOf = (open: boolean) => [
    solarAccordionStyle({ disabled, expanded: open }),
    ...(Array.isArray(sx) ? sx : [sx]),
  ];
  // Collapsed, the item is its header.
  if (!expanded)
    return (
      <ButtonBase
        ref={ref as Ref<HTMLButtonElement>}
        {...(rest as ButtonBaseProps)}
        {...button}
        className={classes(false, className)}
        sx={sxOf(false)}
      >
        {heading}
      </ButtonBase>
    );
  const composed = solarAccordionCompose({ disabled, expanded: true });
  // A slot left empty is not drawn.
  const parts = {
    ...composed,
    description: {
      ...composed.description,
      present: composed.description?.present !== false && description != null,
    },
  };
  return (
    <Box ref={ref} {...rest} className={classes(true, className)} sx={sxOf(true)}>
      {drawChildren('root', {
        prefix: '${P}',
        tree: TREE, slots: SLOTS,
        parts,
        text: { description },
        render: {
          // The header, nested: the collapsed item's look, a button naming the content it shows.
          accordion: ({ className: c, style }: DrawnLayer) => (
            <ButtonBase
              data-layer="accordion"
              {...button}
              aria-controls={\`\${id}-content\`}
              className={[c, classes(false)].filter(Boolean).join(' ')}
              style={style}
              sx={solarAccordionStyle({ disabled, expanded: false })}
            >
              {heading}
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
});
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
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarAccordionRecipe]: the header's rule, fill and focus ring by state, and the content's, collapsed and expanded, read cell by cell.`;
      return `/// SOLAR Accordion.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(`${ABOUT.replace(/`([a-z]+)`/g, '[$1]')} [expanded] and [onExpandedChanged] hold whether it is expanded. Drawn from Figma's layer tree with [SolarLayers].`, '/// ')}
library;

import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../generated/components/accordion.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_theme_of.dart';

class SolarAccordion extends StatefulWidget {
  const SolarAccordion({
    super.key,
    required this.title,
    this.expanded = false,
    this.disabled = false,
    this.onExpandedChanged,
    this.description,
    this.children = const [],
    this.statesController,
  });

  /// What the item is about: its header's words, which name its button.
  final String title;

  final bool expanded;

  final bool disabled;

  /// Called with whether it is to be expanded, as its header is pressed; null disables it.
  final ValueChanged<bool>? onExpandedChanged;

  /// The content's words, in the look Figma draws them.
  final String? description;

  /// The caller's content, after the description.
  final List<Widget> children;

  /// The item's states (the pointer over it), where the caller keeps them.
  final WidgetStatesController? statesController;

  @override
  State<SolarAccordion> createState() => _SolarAccordionState();
}

class _SolarAccordionState extends State<SolarAccordion> {
  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  WidgetStatesController? _own;
  final _header = WidgetStatesController();

  /// The item's states: the pointer over it, which its nested header is drawn in too.
  WidgetStatesController get _item =>
      widget.statesController ?? (_own ??= WidgetStatesController());

  @override
  void dispose() {
    _own?.dispose();
    _header.dispose();
    super.dispose();
  }

  SolarLayers _layers(
    SolarAccordionProps p,
    Set<WidgetState> states,
    String keyPrefix, {
    Map<String, Widget> composed = const {},
    Map<String, List<Widget>> content = const {},
    bool turned = false,
  }) {
    final t = solarThemeOf(context);
    final w = widget;
    return SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarAccordionRecipe.lookup(c, p, states),
        dimension: (c) => SolarAccordionRecipe.dimension(c, p, states),
        color: (c) => SolarAccordionRecipe.color(t, c, p, states),
        shadow: (c) => SolarAccordionRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarAccordionRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn.
        present: (l) => l == 'description'
            ? w.description != null &&
                  SolarAccordionRecipe.present(l, p, states)
            : SolarAccordionRecipe.present(l, p, states),
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: keyPrefix,
      text: {'title': w.title, 'description': ?w.description},
      wraps: const {'title': TextAlign.start, 'description': TextAlign.start},
      icons: const {${icons.map((i) => `'${i.layer}': ${dartIcon(i, spec)}`).join(', ')}},
      composed: composed,
      content: content,
      // Expanded, the header's chevron is turned up.
      builders: {
        if (turned)
          'iconChevronDown': (icon) => Transform.rotate(angle: math.pi, child: icon),
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final w = widget;
    return ListenableBuilder(
      listenable: Listenable.merge([_item, _header]),
      builder: (context, _) {
        final disabled = {if (w.disabled) WidgetState.disabled};
        // The header: the collapsed item's look, in its own states and the item's, a button.
        Widget header(String keyPrefix) {
          final heading = _layers(
            SolarAccordionProps(disabled: w.disabled, expanded: false),
            {..._header.value, ..._item.value, ...disabled},
            keyPrefix,
            turned: w.expanded,
          ).layer('root');
          return Semantics(
            expanded: w.expanded,
            child: SolarPressable(
              onPressed: w.disabled || w.onExpandedChanged == null
                  ? null
                  : () => w.onExpandedChanged!(!w.expanded),
              statesController: _header,
              builder: (_, _) => heading,
            ),
          );
        }

        // Collapsed, the item is its header.
        if (!w.expanded) return header('accordion');
        final p = SolarAccordionProps(disabled: w.disabled, expanded: true);
        final states = {..._item.value, ...disabled};
        final figma = _layers(p, states, 'accordion');
        return MouseRegion(
          onEnter: (_) => _item.update(WidgetState.hovered, true),
          onExit: (_) => _item.update(WidgetState.hovered, false),
          child: _layers(
            p,
            states,
            'accordion',
            composed: {'accordion': header('accordionHeader')},
            // The content: Figma's description, then the caller's children.
            content: {
              'content': [
                if (w.description != null) figma.layer('description'),
                ...w.children,
              ],
            },
          ).layer('root'),
        );
      },
    );
  }
}
`;
    },
  },
};
