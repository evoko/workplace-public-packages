/**
 * SOLAR Segmented Control Item, beyond its IR: where MUI draws each layer and marks each state, and
 * the two shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * One choice of a Segmented Control, which is a radio group: on the web a label around a native
 * radio input, in Flutter a RawRadio; its words and icons drawn by the shared layer helpers.
 */

import {
  drawnResets,
  keyPrefixOf,
  treeOf,
  wrapDoc,
  treeConsts,
} from '../shells/drawn.mjs';
import { dartField, dartParam } from '../shells/helpers.mjs';
import { targetArea } from '../shells/target.mjs';

const requireLayers = (spec) => {
  for (const slot of ['iconLeading', 'iconTrailing'])
    if (!spec.slots[slot])
      throw new Error(`Segmented Control Item: the IR has no ${slot} slot`);
  if (spec.layers.label?.type !== 'TEXT')
    throw new Error('Segmented Control Item: the IR has no label text');
};

const P = 'SolarSegmentedControlItem';

export default {
  name: 'Segmented Control Item',
  mui: {
    // The shell draws every layer itself, inside its <label>, each with a class of its own.
    slots: 'drawn',
    // Its radio input is the browser's, and invisible: the segment is what shows. A caller's icon
    // fills its slot, which the recipe sizes and colours.
    resets: drawnResets('Segmented Control Item', {
      cursor: 'pointer',
      // A 44 × 44 target around the segment (shells/target.mjs).
      ...targetArea(),
      [`& .${P}-input`]: {
        position: 'absolute',
        opacity: '0',
        width: '1px',
        height: '1px',
        margin: '0',
        pointerEvents: 'none',
      },
      [`& .${P}-iconLeading > svg, & .${P}-iconTrailing > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
    states: {
      default: null,
      hover: '&:hover',
      focus: `&:has(.${P}-input:focus-visible)`,
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {
    // Its RadioGroup selects it, by its value, as it checks a SolarRadio.
    groupDecides: ['selected'],
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Segmented Control Item.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarSegmentedControlItemStyle\` in \`@bwp-web/styles/mui\`: the chosen segment's
 * raised surface, the others' quieter words, by size.
 *
 * One segment of a SegmentedControl, which selects the one whose \`value\` is its own: a <label>
 * around a native radio input, so the browser moves between the segments with the arrow keys and
 * a form sends the value chosen. Its words, and an icon either side, are drawn from Figma's layer
 * tree (\`internal/layers.tsx\`). Give it its control's size. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import {
  createContext,
  forwardRef,
  useContext,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import {
  solarSegmentedControlItemCompose,
  solarSegmentedControlItemStyle,
  type SolarSegmentedControlItemProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

/** What a SegmentedControl tells its segments: the radio group's name, its value, and its choice. */
export interface SegmentedControlChoice {
  name: string;
  value: string | null;
  onChange: (event: ChangeEvent<HTMLInputElement>, value: string) => void;
}

/** A SegmentedControl's choice, to the segments inside it. */
export const SegmentedControlContext = createContext<SegmentedControlChoice | null>(null);

export interface SegmentedControlItemProps
  extends SolarSegmentedControlItemProps,
    Omit<
      BoxProps<'label'>,
      keyof SolarSegmentedControlItemProps | 'children' | 'onChange' | 'ref'
    > {
  /** The segment's words. */
  children: ReactNode;
  /** The value it stands for: its SegmentedControl selects it where the control's value is this. */
  value: string;
  /** An icon before the words. */
  iconLeading?: ReactNode;
  /** An icon after the words. */
  iconTrailing?: ReactNode;
  /** Called when it is chosen, where no SegmentedControl holds it. */
  onChange?: (event: ChangeEvent<HTMLInputElement>, value: string) => void;
}

export const SegmentedControlItem = forwardRef<HTMLLabelElement, SegmentedControlItemProps>(
  function SegmentedControlItem(
    { selected: selectedProp, size, value, children, iconLeading, iconTrailing, onChange, sx, ...rest },
    ref,
  ) {
    const group = useContext(SegmentedControlContext);
    // Its prop where given, and otherwise whether its control's value is its own.
    const selected = selectedProp ?? group?.value === value;
    const look = { selected, size };
    const parts = solarSegmentedControlItemCompose(look);
    // A slot left empty is not drawn.
    const drawn = {
      ...parts,
      iconLeading: { ...parts.iconLeading, present: iconLeading != null },
      iconTrailing: { ...parts.iconTrailing, present: iconTrailing != null },
    };
    const choose = group?.onChange ?? onChange;
    return (
      <Box
        component="label"
        ref={ref}
        {...rest}
        sx={[solarSegmentedControlItemStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <input
          type="radio"
          className="SolarSegmentedControlItem-input"
          name={group?.name}
          value={value}
          checked={selected}
          readOnly={!choose}
          onChange={choose && ((event) => choose(event, value))}
        />
        {drawChildren('root', {
          prefix: 'SolarSegmentedControlItem',
          tree: TREE, slots: SLOTS,
          parts: drawn,
          text: { label: children },
          icons: {
            iconLeading: <span>{iconLeading}</span>,
            iconTrailing: <span>{iconTrailing}</span>,
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
      const api = Object.entries(spec.api).filter(([p]) => p !== 'selected');
      const tree = Object.entries(treeOf(spec))
        .map(
          ([parent, kids]) =>
            `    '${parent}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      const header = `Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, [SolarSegmentedControlItemRecipe]: the chosen segment's raised surface, the others' quieter words, by size, read cell by cell.`;
      const about = `One segment of a [SolarSegmentedControl], whose [RadioGroup] selects the one whose [value] is its own, calls its onChanged with the value tapped, and moves between them with the arrow keys. Built on [RawRadio], with its words, and an icon either side, drawn from Figma's layer tree with [SolarLayers]. Give it its control's size.`;
      return `/// SOLAR Segmented Control Item.
///
${wrapDoc(header, '/// ')}
///
${wrapDoc(about, '/// ')}
library;

import 'package:flutter/material.dart';

import '../generated/components/segmented_control_item.dart';
import '../solar_layers.dart';
import '../solar_target.dart';
import 'solar_theme_of.dart';

class SolarSegmentedControlItem<T> extends StatefulWidget {
  const SolarSegmentedControlItem({
    super.key,
    required this.value,
    required this.label,
${api.map(([prop, def]) => `    ${dartParam('SegmentedControlItem', prop, def)},`).join('\n')}
    this.iconLeading,
    this.iconTrailing,
    this.focusNode,
    this.statesController,
  });

  /// The value it stands for: its group selects it where the group's value is this.
  final T value;

  /// The segment's words.
  final String label;

${api.map(([prop, def]) => dartField('SegmentedControlItem', prop, def)).join('\n')}

  /// An icon before the words.
  final Widget? iconLeading;

  /// An icon after the words.
  final Widget? iconTrailing;

  /// Its focus, where the caller keeps it.
  final FocusNode? focusNode;

  /// States to draw it in beside its own, where the caller keeps them (the visual checks force a
  /// state through it).
  final WidgetStatesController? statesController;

  @override
  State<SolarSegmentedControlItem<T>> createState() =>
      _SolarSegmentedControlItemState<T>();
}

class _SolarSegmentedControlItemState<T>
    extends State<SolarSegmentedControlItem<T>> {
  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  FocusNode? _own;

  FocusNode get _focus => widget.focusNode ?? (_own ??= FocusNode());

  @override
  void dispose() {
    _own?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final group = RadioGroup.maybeOf<T>(context);
    final p = SolarSegmentedControlItemProps(
      selected: group != null && group.groupValue == widget.value,
${api.map(([prop]) => `      ${prop}: widget.${prop},`).join('\n')}
    );
    Widget draw(Set<WidgetState> states) => SolarLayers(
      recipe: SolarLayerRecipe(
        lookup: (c) => SolarSegmentedControlItemRecipe.lookup(c, p, states),
        dimension: (c) => SolarSegmentedControlItemRecipe.dimension(c, p, states),
        color: (c) => SolarSegmentedControlItemRecipe.color(t, c, p, states),
        shadow: (c) => SolarSegmentedControlItemRecipe.shadow(t, c, p, states),
        textStyle: (c) => SolarSegmentedControlItemRecipe.textStyle(t, c, p, states),
        // A slot left empty is not drawn.
        present: (l) => switch (l) {
          'iconLeading' => widget.iconLeading != null,
          'iconTrailing' => widget.iconTrailing != null,
          _ => SolarSegmentedControlItemRecipe.present(l, p, states),
        },
        glyph: (_) => null,
      ),
      tree: _tree,
      keyPrefix: '${keyPrefixOf(spec.component)}',
      text: {'label': widget.label},
      slots: {'iconLeading': ?widget.iconLeading, 'iconTrailing': ?widget.iconTrailing},
    ).layer('root');
    final forced = widget.statesController;
    return SolarTarget.inside(child: RawRadio<T>(
      value: widget.value,
      mouseCursor: WidgetStateMouseCursor.clickable,
      toggleable: false,
      focusNode: _focus,
      autofocus: false,
      groupRegistry: group,
      enabled: group != null,
      builder: (context, state) => forced == null
          ? draw(state.states)
          : ListenableBuilder(
              listenable: forced,
              builder: (_, _) => draw({...state.states, ...forced.value}),
            ),
    ));
  }
}
`;
    },
  },
};
