/**
 * SOLAR Tab Item, beyond its IR: where MUI draws each layer and marks each state, and the two shell
 * templates, rendered into the shells by \`solar:codegen\` on every run. One file per component, so
 * adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * One tab of a Tabs strip: MUI's Tab on the web, drawn and pressable in Flutter, its icons, words
 * and Counter drawn by the shared layer helpers. The strip moves the focus with the arrow keys, and
 * Enter or Space selects (owner decision 2026-09-24); a focused tab draws Figma's focus, the
 * selected underline and the ring (owner decision 2026-09-24).
 */

import {
  drawnFlutter,
  drawnResets,
  iconsOf,
  treeConsts,
} from '../shells/drawn.mjs';
import { targetArea } from '../shells/target.mjs';

const P = 'SolarTabItem';

const requireLayers = (spec) => {
  for (const slot of ['leadingIcon', 'label', 'trailingIcon', 'counter'])
    if (!spec.slots[slot])
      throw new Error(`Tab Item: the IR has no ${slot} slot`);
  if (spec.slots.counter.component !== 'Counter')
    throw new Error('Tab Item: its counter is no Counter');
  for (const prop of ['selected', 'disabled'])
    if (spec.api[prop]?.type !== 'boolean')
      throw new Error(`Tab Item: the IR has no ${prop} prop`);
  if (iconsOf(spec).length)
    throw new Error(
      'Tab Item: its icons are the caller’s, not SOLAR icons of its own',
    );
};

export default {
  name: 'Tab Item',
  mui: {
    // The shell draws every layer itself, inside MUI's Tab, each with a class of its own.
    slots: 'drawn',
    // Tab's own look gives way to the recipe's: its minimum size, its capitals, its stacked icon,
    // its faded disabled tab (the recipe draws Figma's). A caller's icon fills its slot, which the
    // recipe sizes and colours. A 44 × 44 target around it, which takes no room.
    resets: drawnResets('Tab Item', {
      display: 'flex',
      flexDirection: 'row',
      minHeight: '0',
      minWidth: '0',
      maxWidth: 'none',
      textTransform: 'none',
      opacity: '1',
      overflow: 'visible',
      boxSizing: 'border-box',
      borderStyle: 'solid',
      [`& .${P}-leadingIcon, & .${P}-trailingIcon, & .${P}-counter`]: {
        flexShrink: '0',
      },
      [`& .${P}-leadingIcon > svg, & .${P}-trailingIcon > svg`]: {
        display: 'block',
        width: '100%',
        height: '100%',
      },
      ...targetArea(),
    }),
    // Hovered as the pointer is; focused as the keyboard reaches it (MUI marks it focus-visible);
    // selected and disabled as MUI marks them.
    states: {
      default: null,
      hover: '&:hover',
      focus: '&.Mui-focusVisible',
      selected: '&.Mui-selected',
      disabled: '&.Mui-disabled',
    },
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  // A tab's words are its `label`, as MUI's Tab names them.
  // The counter is a count, which the shell draws as a SOLAR Counter in the recipe's variant.
  api: {
    react: { label: 'label', counter: 'count' },
    flutter: { counter: 'count' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Tab Item.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarTabItemStyle\` and \`solarTabItemCompose\` in \`@bwp-web/styles/mui\`: the
 * tab's underline and focus ring by state, and its words' and icons' ink.
 *
 * One tab of a Tabs strip, MUI's Tab, so it lives inside a Tabs: the strip moves the focus from tab
 * to tab with the arrow keys, Enter or Space selects (SOLAR's description: "arrow keys move focus
 * and aria-selected marks the current tab"), and the selected tab is announced so. Its \`label\`,
 * an icon either side (\`leadingIcon\`, \`trailingIcon\`) and a \`count\`, a SOLAR Counter in the
 * variant Figma draws for the tab's state, are drawn from Figma's layer tree
 * (\`internal/layers.tsx\`). A focused tab draws Figma's focus, the selected underline and the ring.
 * In a Tabs it takes the strip's size, and its \`value\` is what the strip's \`onChange\` gives. The
 * app must load \`@bwp-web/styles/tokens.css\`.
 */

import Tab, { type TabProps } from '@mui/material/Tab';
import { forwardRef, useState, type FocusEvent, type FocusEventHandler, type ReactNode } from 'react';
import {
  solarTabItemCompose,
  solarTabItemStyle,
  type SolarTabItemProps,
} from '@bwp-web/styles/mui';
import { Counter } from './Counter.js';
import { useTabsSize } from './Tabs.js';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface TabItemProps
  extends SolarTabItemProps,
    Omit<
      TabProps,
      | keyof SolarTabItemProps
      | 'label'
      | 'icon'
      | 'iconPosition'
      | 'children'
      | 'wrapped'
      | 'onBlur'
      | 'onFocusVisible'
      | 'ref'
    > {
  /** The tab's words. */
  label: ReactNode;
  /** An icon before the words. */
  leadingIcon?: ReactNode;
  /** An icon after the words. */
  trailingIcon?: ReactNode;
  /** A count after the words, a SOLAR Counter; none at 0 or below. */
  count?: number;
  /** Called as the tab takes the keyboard's focus. */
  onFocusVisible?: FocusEventHandler<HTMLDivElement>;
  /** Called as the tab loses the focus. */
  onBlur?: FocusEventHandler<HTMLDivElement>;
}

export const TabItem = forwardRef<HTMLDivElement, TabItemProps>(function TabItem(
  {
    size,
    selected = false,
    disabled = false,
    label,
    leadingIcon,
    trailingIcon,
    count,
    className,
    onFocusVisible,
    onBlur,
    sx,
    ...rest
  },
  ref,
) {
  // In a strip, the strip's size, as Figma draws its tabs.
  const look = { size: useTabsSize() ?? size, selected, disabled };
  const composed = solarTabItemCompose(look);
  // The Counter's variant is the tab's state's, the keyboard's focus among them.
  const [focused, setFocused] = useState(false);
  const state = disabled ? 'disabled' : selected ? 'selected' : focused ? 'focus' : 'default';
  const counter = solarTabItemCompose(look, state).counter;
  // A slot left empty is not drawn.
  const parts = {
    ...composed,
    leadingIcon: { ...composed.leadingIcon, present: leadingIcon != null },
    trailingIcon: { ...composed.trailingIcon, present: trailingIcon != null },
    counter: { ...composed.counter, present: count != null && count > 0 },
  };
  // MUI types a Tab's root, and its events, as a div's, though it renders a button.
  return (
    <Tab
      ref={ref}
      {...rest}
      // Tabs gives each Tab \`selected\`, which MUI's types leave out; a tab's own says it too.
      {...({ selected } as object)}
      disabled={disabled}
      disableRipple
      onFocusVisible={(event: FocusEvent<HTMLDivElement>) => {
        setFocused(true);
        onFocusVisible?.(event);
      }}
      onBlur={(event: FocusEvent<HTMLDivElement>) => {
        setFocused(false);
        onBlur?.(event);
      }}
      className={className}
      sx={[solarTabItemStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
      label={drawChildren('root', {
        prefix: '${P}',
        tree: TREE, slots: SLOTS,
        parts,
        text: { label },
        icons: {
          leadingIcon: <span>{leadingIcon}</span>,
          trailingIcon: <span>{trailingIcon}</span>,
        },
        // The counter is a SOLAR Counter in the variant the recipe names for the tab's state.
        render: {
          counter: ({ className, style }) => (
            <span className={className} style={style}>
              <Counter
                count={count ?? 0}
                type={counter['variant.type'] as never}
              />
            </span>
          ),
        },
      })}
    />
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      return drawnFlutter(spec, {
        look: 'the tab’s underline and focus ring by state, and its words’ and icons’ ink, read cell by cell',
        about: `Bespoke: one tab of a SolarTabs strip, drawn from Figma's layer tree with [SolarLayers], pressable, and focusable in the strip's order, announced as a tab, selected where it is. Its [label], an icon either side and a [count], a SolarCounter in the variant Figma draws for the tab's state. A focused tab draws Figma's focus, the selected underline and the ring. Inside a SolarTabs it takes the strip's size, is selected where its [value] is the strip's, and selects it when pressed; outside one, [selected] and [onPressed] say.`,
        params: `required this.label,
this.value,
this.onPressed,
this.leadingIcon,
this.trailingIcon,
this.count,`,
        fields: `/// The tab's words.
final String label;

/// What the strip it is in selects when it is pressed, and is selected by.
final Object? value;

/// Called when it is pressed, outside a strip; null there draws it as it is, not pressable.
final VoidCallback? onPressed;

/// An icon before the words.
final Widget? leadingIcon;

/// An icon after the words.
final Widget? trailingIcon;

/// A count after the words, a SolarCounter; none at 0 or below.
final int? count;`,
        members: `/// In a strip, the strip's choice of it; outside one, its own [onPressed].
VoidCallback? _pressed(BuildContext context) {
  final strip = SolarTabsScope.maybeOf(context);
  if (disabled) return null;
  if (strip == null || value == null) return onPressed;
  return () => strip.onChanged?.call(value);
}

/// In a strip, whether its value is the strip's; outside one, [selected].
bool _selected(BuildContext context) {
  final strip = SolarTabsScope.maybeOf(context);
  return strip == null || value == null ? selected : strip.value == value;
}`,
        control: {
          onPressed: '_pressed(context)',
          semantics: `role: SemanticsRole.tab,
selected: p.selected,`,
        },
        // In a strip, the strip's size and choice.
        values: {
          selected: '_selected(context)',
          size: 'SolarTabsScope.sizeOf(context, SolarTabItemSize.values) ?? size',
        },
        text: "{'label': label}",
        slots: "{'leadingIcon': ?leadingIcon, 'trailingIcon': ?trailingIcon}",
        // The counter is a SOLAR Counter in the variant the recipe names for the tab's state.
        // In a scope of its own, at rest: it takes none of the tab's states, as Figma draws it.
        composed: `{
        if (count != null && count! > 0)
          'counter': SolarStatesScope(
            builder: (_, _) => SolarCounter(
              count: count!,
              type: SolarCounterType.values.byName(
                SolarTabItemRecipe.lookup('counter.variant.type', p, states)!.substring(2),
              ),
            ),
          ),
      }`,
        // A slot left empty is not drawn.
        present: (recipe) => `switch (l) {
          'leadingIcon' => leadingIcon != null,
          'trailingIcon' => trailingIcon != null,
          'counter' => count != null && count! > 0,
          _ => ${recipe},
        }`,
        imports: `import 'package:flutter/semantics.dart';

import '../generated/components/counter.dart';
import '../solar_tabs.dart';
import 'solar_counter.dart';`,
      });
    },
  },
};
