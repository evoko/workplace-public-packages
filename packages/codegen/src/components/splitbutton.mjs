/**
 * SOLAR SplitButton, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, run once by \`solar:scaffold\`. One file per component, so adding one edits
 * nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn component with two press targets: the shells draw Figma's layer tree with the shared
 * helpers, the action and the chevron halves as buttons of their own, and the whole control takes
 * the states of whichever half is hovered, pressed or focused, as Figma draws them.
 */

import { dartField, dartParam } from '../scaffold/helpers.mjs';
import { drawnResets, treeOf } from '../scaffold/drawn.mjs';

const requireLayers = (spec) => {
  for (const layer of [
    'action',
    'label',
    'divider',
    'trigger',
    'iconChevronDown',
    'spinner',
  ])
    if (!spec.layers[layer])
      throw new Error(`SplitButton: the IR has no ${layer}`);
};

export default {
  name: 'SplitButton',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // The halves are buttons with no look of their own (MUI's ButtonBase); the loading Spinner sits
    // in the middle of the control, over the halves, which keep their room.
    resets: drawnResets('SplitButton', {
      '& .SolarSplitButton-action, & .SolarSplitButton-trigger': {
        font: 'inherit',
        color: 'inherit',
      },
      '& .SolarSplitButton-spinner': {
        position: 'absolute',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      },
    }),
    // The whole control's states, from either half: the pointer over it or pressing it, a half
    // focused by keyboard (MUI's focus-visible class on it), or the props' classes the shell sets.
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active',
      focus: '&:has(.Mui-focusVisible)',
      loading: '&.SolarSplitButton-loading',
      disabled: '&.SolarSplitButton-disabled',
    },
    overlaps: { pressed: ['hover'], focus: ['hover', 'pressed'] },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR SplitButton.
 *
 * Scaffolded once by \`npm run solar:scaffold SplitButton\` from spec/components/splitbutton.json,
 * and owned by developers from then on: change it freely. What it looks like is not here. That is
 * the recipe, \`solarSplitButtonStyle\` in \`@bwp-web/styles/mui\`: the control's colours, border,
 * shadow and focus ring by state, its halves' padding, and the rule between them.
 *
 * The dominant action and a chevron that opens a menu of its variants (Save, Save as, Save and
 * close): two buttons in one joined control, drawn from Figma's layer tree
 * (\`internal/layers.tsx\`). The chevron says it opens a menu (\`aria-haspopup\`, \`aria-expanded\`
 * from \`menuOpen\`); the menu itself is the caller's until Dropdown. Alt+Down on the action opens
 * it too. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { IconChevronDown } from '@bwp-web/assets';
import { forwardRef, type KeyboardEvent, type MouseEvent, type ReactNode } from 'react';
import {
  solarSplitButtonCompose,
  solarSplitButtonStyle,
  type SolarSplitButtonProps,
  type SolarSpinnerSize,
  type SolarSpinnerVariant,
} from '@bwp-web/styles/mui';
import { drawChildren, type DrawnLayer } from './internal/layers.js';
import { Spinner } from './Spinner.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface SplitButtonProps
  extends SolarSplitButtonProps,
    // MUI types BoxProps' ref for any element; the component's own, a <div>, comes from forwardRef.
    Omit<BoxProps, keyof SolarSplitButtonProps | 'children' | 'onClick' | 'ref'> {
  /** The dominant action's label. */
  children: ReactNode;
  /** The dominant action. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  /** Opens the menu of the action's variants, from the chevron or Alt+Down on the action. */
  onMenuOpen?: () => void;
  /** Whether that menu is open, for the chevron's \`aria-expanded\`. */
  menuOpen?: boolean;
  /** The chevron's accessible name. */
  menuLabel?: string;
}

export const SplitButton = forwardRef<HTMLDivElement, SplitButtonProps>(function SplitButton(
  {
    ${api.join(', ')},
    children,
    onClick,
    onMenuOpen,
    menuOpen = false,
    menuLabel = 'More options',
    className,
    sx,
    ...rest
  },
  ref,
) {
  const busy = Boolean(loading && !disabled);
  const inactive = Boolean(disabled) || busy;
  const parts = solarSplitButtonCompose({ ${api.join(', ')} }, busy ? 'loading' : 'default');
  const spinner = solarSplitButtonCompose({ ${api.join(', ')} }, 'loading').spinner;
  // What the loading state hides keeps its room, so the control does not resize.
  const kept = { ...parts };
  for (const half of ['action', 'divider', 'trigger'])
    kept[half] = { ...parts[half], present: true };
  const shown = (layer: string) =>
    parts[layer]?.present === false ? { visibility: 'hidden' as const } : undefined;
  const openMenu = (event: KeyboardEvent) => {
    if (event.altKey && event.key === 'ArrowDown') {
      event.preventDefault();
      onMenuOpen?.();
    }
  };
  return (
    <Box
      component="div"
      ref={ref}
      role="group"
      aria-busy={busy || undefined}
      className={
        [
          disabled ? 'SolarSplitButton-disabled' : null,
          busy ? 'SolarSplitButton-loading' : null,
          className,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      {...rest}
      sx={[solarSplitButtonStyle({ ${api.join(', ')} }), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: 'SolarSplitButton',
        tree: TREE,
        parts: kept,
        text: { label: children },
        icons: { iconChevronDown: <IconChevronDown /> },
        render: {
          action: ({ className: c, style, children: inner }: DrawnLayer) => (
            <ButtonBase
              className={c}
              style={{ ...style, ...shown('action') }}
              disabled={inactive}
              disableRipple
              onClick={onClick}
              onKeyDown={openMenu}
            >
              {inner}
            </ButtonBase>
          ),
          divider: ({ className: c, style }: DrawnLayer) => (
            <span className={c} style={{ ...style, ...shown('divider') }} aria-hidden />
          ),
          trigger: ({ className: c, style, children: inner }: DrawnLayer) => (
            <ButtonBase
              className={c}
              style={{ ...style, ...shown('trigger') }}
              disabled={inactive}
              disableRipple
              aria-label={menuLabel}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => onMenuOpen?.()}
            >
              {inner}
            </ButtonBase>
          ),
          spinner: ({ className: c }: DrawnLayer) =>
            busy ? (
              <span className={c}>
                <Spinner
                  size={spinner['variant.size'] as SolarSpinnerSize}
                  variant={spinner['variant.style'] as SolarSpinnerVariant}
                />
              </span>
            ) : null,
        },
      })}
    </Box>
  );
});
`;
    },
    flutter: (spec) => {
      requireLayers(spec);
      const api = Object.entries(spec.api);
      const tree = Object.entries(treeOf(spec))
        .map(
          ([p, kids]) =>
            `    '${p}': [${kids.map((k) => `'${k}'`).join(', ')}],`,
        )
        .join('\n');
      return `/// SOLAR SplitButton.
///
/// Scaffolded once by \`npm run solar:scaffold -- --flutter SplitButton\` from
/// spec/components/splitbutton.json, and owned by developers from then on: change it freely. What
/// it looks like is not here. That is the recipe, [SolarSplitButtonRecipe]: the control's colours,
/// border, shadow and focus ring by state, its halves' padding, and the rule between them.
///
/// The dominant action and a chevron that opens a menu of its variants: two buttons in one joined
/// control, drawn from Figma's layer tree with [SolarLayers]. The whole control takes the states of
/// whichever half is hovered, pressed or focused, as Figma draws them. The menu is the caller's
/// until Dropdown ([onMenuPressed]).
library;

import 'package:flutter/material.dart';

import '../generated/components/spinner.dart';
import '../generated/components/splitbutton.dart';
import '../generated/icons.dart';
import '../solar_layers.dart';
import '../solar_states.dart';
import 'solar_spinner.dart';
import 'solar_theme_of.dart';

class SolarSplitButton extends StatelessWidget {
  const SolarSplitButton({
    super.key,
    required this.label,
    required this.onPressed,
    required this.onMenuPressed,
    this.menuLabel = 'More options',
${api.map(([prop, def]) => `    ${dartParam('SplitButton', prop, def)},`).join('\n')}
    this.statesController,
  });

  /// The dominant action's label.
  final String label;

  /// The dominant action; null disables the control.
  final VoidCallback? onPressed;

  /// Opens the menu of the action's variants.
  final VoidCallback? onMenuPressed;

  /// The chevron's accessible name.
  final String menuLabel;

${api.map(([prop, def]) => dartField('SplitButton', prop, def)).join('\n')}

  /// The control's states, where the caller keeps them.
  final WidgetStatesController? statesController;

  /// Each layer's children, as Figma nests them.
  static const _tree = <String, List<String>>{
${tree}
  };

  static const _halves = {'action', 'divider', 'trigger'};

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    // Disabled wins over loading, as in Figma's state order.
    final busy = loading && !disabled;
    final active = !disabled && !busy;
    final p = SolarSplitButtonProps(
${api.map(([prop]) => `      ${prop}: ${prop === 'loading' ? 'busy' : prop},`).join('\n')}
    );
    return SolarStatesScope(
      controller: statesController,
      builder: (context, controller) => ListenableBuilder(
        listenable: controller,
        builder: (context, _) {
          final states = {...controller.value};
          bool shows(String l) => SolarSplitButtonRecipe.present(l, p, states);
          // What the loading state hides keeps its room, so the control does not resize.
          Widget kept(String l, Widget child) => Visibility(
                visible: shows(l),
                maintainSize: true,
                maintainAnimation: true,
                maintainState: true,
                child: child,
              );
          // Each half is a button of its own; both drive the one control's states.
          Widget half(String l, VoidCallback? onTap, Widget child) => kept(
                l,
                SolarPressable(
                  onPressed: active ? onTap : null,
                  statesController: controller,
                  builder: (_, _) => child,
                ),
              );
          final mark = SolarLayers(
            recipe: SolarLayerRecipe(
              lookup: (c) => SolarSplitButtonRecipe.lookup(c, p, states),
              dimension: (c) => SolarSplitButtonRecipe.dimension(c, p, states),
              color: (c) => SolarSplitButtonRecipe.color(t, c, p, states),
              shadow: (c) => SolarSplitButtonRecipe.shadow(t, c, p, states),
              textStyle: (c) => SolarSplitButtonRecipe.textStyle(t, c, p, states),
              present: (l) => l == 'spinner'
                  ? false
                  : _halves.contains(l) || shows(l),
              glyph: (_) => null,
            ),
            tree: _tree,
            keyPrefix: 'splitButton',
            text: {'label': label},
            icons: const {'iconChevronDown': SolarIcons.chevronDownOutline},
            builders: {
              'action': (w) => half('action', onPressed, w),
              'divider': (w) => kept('divider', ExcludeSemantics(child: w)),
              'trigger': (w) => Semantics(
                    label: menuLabel,
                    child: half('trigger', onMenuPressed, w),
                  ),
            },
          ).layer('root');
          if (!shows('spinner')) return mark;
          return Stack(
            alignment: Alignment.center,
            children: [
              mark,
              ExcludeSemantics(
                child: SolarSpinner(
                  size: SolarSpinnerSize.values.byName(
                    SolarSplitButtonRecipe.lookup('spinner.variant.size', p, states)!
                        .substring(2),
                  ),
                  variant: SolarSpinnerVariant.values.firstWhere(
                    (v) =>
                        'k:\${v.figma}' ==
                        SolarSplitButtonRecipe.lookup('spinner.variant.style', p, states),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
`;
    },
  },
};
