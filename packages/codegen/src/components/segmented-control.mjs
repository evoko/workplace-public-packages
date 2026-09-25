/**
 * SOLAR Segmented Control, beyond its IR: where MUI draws each layer, and the two shell templates,
 * rendered into the shells by \`solar:codegen\` on every run. One file per component, so adding one
 * edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn component: a field's label and helper around a track of the caller's segments (the
 * helpers' `content`), which is a radio group.
 */

import {
  drawnResets,
  keyPrefixOf,
  treeOf,
  wrapDoc,
  treeConsts,
} from '../shells/drawn.mjs';
import { dartField, dartParam } from '../shells/helpers.mjs';

const requireLayers = (spec) => {
  for (const layer of ['labelLabel', 'mandatory', 'track', 'helper'])
    if (!spec.layers[layer])
      throw new Error(`Segmented Control: the IR has no ${layer} layer`);
};

export default {
  name: 'Segmented Control',
  mui: {
    // The shell draws every layer itself, each with a class of its own; the track holds the
    // caller's segments in place of Figma's examples.
    slots: 'drawn',
    resets: drawnResets('Segmented Control'),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR Segmented Control.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarSegmentedControlStyle\` and \`solarSegmentedControlCompose\` in
 * \`@bwp-web/styles/mui\`: the track, and the label and helper's text styles, by size.
 *
 * Two to five SegmentedControlItems of its size, one always chosen, committed on click: a radio
 * group, whose segments are native radio inputs of one name, so the arrow keys move between them.
 * Its \`label\` names the group (a mandatory one is starred), and its \`helper\` says more below it.
 * For six or more choices, or for navigation, use Tabs; for on and off, a Toggle. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, useId, type ChangeEvent, type ReactNode } from 'react';
import {
  solarSegmentedControlCompose,
  solarSegmentedControlStyle,
  type SolarSegmentedControlProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import { SegmentedControlContext } from './SegmentedControlItem.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface SegmentedControlProps
  extends SolarSegmentedControlProps,
    Omit<BoxProps, keyof SolarSegmentedControlProps | 'children' | 'onChange' | 'ref'> {
  /** Two to five SegmentedControlItems, of its size. */
  children: ReactNode;
  /** The value of the chosen segment. */
  value: string | null;
  /** Called with the value of the segment chosen. */
  onChange: (event: ChangeEvent<HTMLInputElement>, value: string) => void;
  /** What the group chooses, above it. */
  label?: ReactNode;
  /** Whether a choice is required, which stars the label. */
  mandatory?: boolean;
  /** More about the choice, below it. */
  helper?: ReactNode;
  /** The radio group's name, for a form; one of its own where none is given. */
  name?: string;
}

export const SegmentedControl = forwardRef<HTMLSpanElement, SegmentedControlProps>(
  function SegmentedControl(
    { ${api.join(', ')}, children, value, onChange, label, mandatory = false, helper, name, sx, ...rest },
    ref,
  ) {
    const id = useId();
    const parts = solarSegmentedControlCompose({ ${api.join(', ')} });
    // Figma hides the label and helper, which show where the caller gives them.
    const drawn = {
      ...parts,
      label: { ...parts.label, present: label != null },
      labelLabel: { ...parts.labelLabel, present: label != null },
      mandatory: { ...parts.mandatory, present: mandatory },
      helper: { ...parts.helper, present: helper != null },
    };
    return (
      <Box
        component="span"
        ref={ref}
        {...rest}
        sx={[solarSegmentedControlStyle({ ${api.join(', ')} }), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        {drawChildren('root', {
          prefix: 'SolarSegmentedControl',
          tree: TREE, slots: SLOTS,
          parts: drawn,
          text: {
            labelLabel: <span id={\`\${id}-label\`}>{label}</span>,
            mandatory: <span aria-hidden>*</span>,
            helper,
          },
          content: {
            track: (
              <SegmentedControlContext.Provider value={{ name: name ?? id, value, onChange }}>
                {children}
              </SegmentedControlContext.Provider>
            ),
          },
          render: {
            track: (layer) => (
              <span
                role="radiogroup"
                aria-labelledby={label != null ? \`\${id}-label\` : undefined}
                aria-required={mandatory || undefined}
                {...layer}
              />
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
      const api = Object.entries(spec.api);
      const tree = Object.entries(treeOf(spec))
        .map(
          ([parent, kids]) =>
            `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarSegmentedControlRecipe]: the track, and the label and helper's text styles, by size, read cell by cell.`;
      const about = `Two to five [SolarSegmentedControlItem]s of its size, one always chosen, committed on tap: a [RadioGroup], which selects the segment whose value is [groupValue], calls [onChanged] with the one tapped, and moves between them with the arrow keys. Its [label] names the group (a [mandatory] one is starred), and its [helper] says more below it. Drawn from Figma's layer tree with [SolarLayers], the track holding the segments. For six or more choices, or for navigation, use tabs; for on and off, a SolarToggle.`;
      return `/// SOLAR Segmented Control.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/segmented_control.dart';
import '../solar_layers.dart';
import 'solar_theme_of.dart';

class SolarSegmentedControl<T> extends StatelessWidget {
  const SolarSegmentedControl({
    super.key,
${api.map(([prop, def]) => `    ${dartParam('SegmentedControl', prop, def)},`).join('\n')}
    required this.groupValue,
    required this.onChanged,
    required this.children,
    this.label,
    this.mandatory = false,
    this.helper,
  });

${api.map(([prop, def]) => dartField('SegmentedControl', prop, def)).join('\n')}

  /// The value of the chosen segment.
  final T? groupValue;

  /// Called with the value of the segment chosen.
  final ValueChanged<T?> onChanged;

  /// Two to five SolarSegmentedControlItems, of its size.
  final List<Widget> children;

  /// What the group chooses, above it.
  final String? label;

  /// Whether a choice is required, which stars the label.
  final bool mandatory;

  /// More about the choice, below it.
  final String? helper;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarSegmentedControlProps(${api.map(([prop]) => `${prop}: ${prop}`).join(', ')});
    const states = <WidgetState>{};
    final drawn = SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarSegmentedControlRecipe.lookup(c, p, states),
        dimension: (c) => SolarSegmentedControlRecipe.dimension(c, p, states),
        color: (c) => SolarSegmentedControlRecipe.color(t, c, p, states),
        shadow: (c) => SolarSegmentedControlRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarSegmentedControlRecipe.textStyle(t, c, p, states),
        // Figma hides the label and helper, which show where the caller gives them.
        present: (l) => switch (l) {
          'label' || 'labelLabel' => label != null,
          'mandatory' => mandatory,
          'helper' => helper != null,
          _ => SolarSegmentedControlRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: '${keyPrefixOf(spec.component)}',
      text: {'labelLabel': ?label, 'mandatory': '*', 'helper': ?helper},
      content: {'track': children},
      // The track is the group, named by the label.
      builders: {
        'track': (track) =>
            Semantics(container: true, label: label, child: track),
      },
    ).layer('root');
    return RadioGroup<T>(
      groupValue: groupValue,
      onChanged: onChanged,
      child: drawn,
    );
  }
}
`;
    },
  },
};
