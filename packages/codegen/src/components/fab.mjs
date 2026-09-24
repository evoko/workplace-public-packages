/**
 * SOLAR FAB, beyond its IR: where MUI draws each layer and marks each state, what the Flutter base
 * control's style reads, and the two shell templates, rendered into the shells by \`solar:codegen\`
 * on every run. One file per component, so adding one edits nothing shared;
 * \`src/components/index.mjs\` finds them.
 *
 * On Button's machinery: MUI's Button and Flutter's FilledButton, restyled by the recipe. Its type
 * is derived (the overlay's `derive`): an extended FAB is one with a label, so the shells set it
 * from whether they are given one.
 */

import { dartField, dartParam } from '../shells/helpers.mjs';
import { targetArea } from '../shells/target.mjs';

const requireSlots = (spec) => {
  for (const slot of ['icon', 'label'])
    if (!spec.slots[slot]) throw new Error(`FAB: the IR has no ${slot} slot`);
  if (!spec.derived?.type)
    throw new Error('FAB: its type is not derived from its label');
};

export default {
  name: 'FAB',
  mui: {
    // `&` is the root; MUI renders the label in the root, the icon and spinner in its own slots.
    slots: {
      root: '&',
      label: '&',
      icon: '& .MuiButton-startIcon',
      spinner: '& .MuiButton-loadingIndicator',
    },
    resets: {
      // Not '0': MUI's sx reads a sizing value of 1 or less as a fraction.
      minWidth: 'auto',
      textTransform: 'none',
      // Figma draws the stroke inside the box, taking no room from the icon; CSS's border does,
      // so the icon keeps its size and overlaps the border's pixel, as Figma draws it.
      '& .MuiButton-startIcon': { margin: '0', flexShrink: '0' },
      '& .MuiButton-startIcon > svg': { width: '100%', height: '100%' },
      // A 44 × 44 target around the drawn button (shells/target.mjs).
      ...targetArea(),
    },
    states: {
      default: null,
      hover: '&:hover',
      pressed: '&:active',
      focus: '&.Mui-focusVisible',
      loading: '&.MuiButton-loading',
      disabled: '&.Mui-disabled:not(.MuiButton-loading)',
    },
    overlaps: { pressed: ['hover'], focus: ['hover', 'pressed'] },
  },
  flutter: {
    style: {
      background: 'root.background',
      shadow: 'root.shadow',
      radius: 'root.radius',
      borderColor: 'root.borderColor',
      borderWidth: 'root.borderWidth',
      paddingTop: 'root.paddingTop',
      paddingRight: 'root.paddingRight',
      paddingBottom: 'root.paddingBottom',
      paddingLeft: 'root.paddingLeft',
      height: 'root.height',
      width: 'root.width',
      foreground: 'label.color',
      textStyle: 'label.typography',
      iconColor: 'icon.color',
      iconSize: 'icon.width',
    },
  },
  templates: {
    react: (spec) => {
      requireSlots(spec);
      const api = Object.keys(spec.api);
      return `/**
 * SOLAR FAB.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarFABStyle\` in \`@bwp-web/styles/mui\`: each size and type, its colours by
 * state, its shadow and its focus ring.
 *
 * The screen's one most important action. It wraps MUI's Button, which supplies focus, keyboard
 * activation, and the disabled and loading states (MUI's Fab has no loading state). It is extended
 * when it has a label, and an icon alone otherwise, which then needs an \`aria-label\`. Where it
 * floats (usually the bottom right) is the app's. The app must load \`@bwp-web/styles/tokens.css\`.
 */

import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button';
import { forwardRef, type ReactNode } from 'react';
import {
  solarFABCompose,
  solarFABStyle,
  type SolarFABProps,
  type SolarSpinnerSize,
  type SolarSpinnerVariant,
} from '@bwp-web/styles/mui';
import { Spinner } from './Spinner.js';

export interface FABProps
  extends SolarFABProps,
    Omit<
      MuiButtonProps,
      | keyof SolarFABProps
      | 'color'
      | 'variant'
      | 'startIcon'
      | 'endIcon'
      | 'disableElevation'
    > {
  /** The action's icon: add, compose, scan. */
  icon: ReactNode;
  /** The label, which makes it an extended FAB. Without one, give it an \`aria-label\`. */
  children?: ReactNode;
}

// Through globalThis, because \`process\` exists only where a bundler or Node provides it.
const DEV =
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !==
  'production';

export const FAB = forwardRef<HTMLButtonElement, FABProps>(function FAB(
  { ${api.join(', ')}, icon, children, sx, ...rest },
  ref,
) {
  // Extended where it has a label, as SOLAR says; the icon FAB's name is its aria-label.
  const extended = children != null && children !== false && children !== '';
  if (DEV && !extended && !rest['aria-label'] && !rest['aria-labelledby'])
    // eslint-disable-next-line no-console -- a development-only accessibility warning, on purpose
    console.warn('SOLAR FAB: an icon FAB needs an aria-label.');
  const recipe = { ${api.join(', ')}, type: extended ? 'extended' : 'icon' } as const;
  const busy = Boolean(loading && !disabled);
  // Which Spinner the loading state shows, as Figma picks it per size, and what it hides: the icon
  // and the label, which keep their room so the FAB does not resize.
  const parts = solarFABCompose(recipe, busy ? 'loading' : 'default');
  const spinner = solarFABCompose(recipe, 'loading').spinner;

  return (
    <MuiButton
      ref={ref}
      {...rest}
      disabled={disabled}
      // Disabled wins over loading, as in Figma's state order.
      loading={busy}
      startIcon={icon}
      loadingIndicator={
        <Spinner
          size={spinner['variant.size'] as SolarSpinnerSize}
          variant={spinner['variant.style'] as SolarSpinnerVariant}
        />
      }
      // SOLAR's states have their own colours and shadows; MUI's ripple and elevation would paint
      // over them, so its own variant is pinned to text, as Button's is.
      variant="text"
      disableRipple
      sx={[
        solarFABStyle(recipe),
        parts.icon?.present === false
          ? { '& .MuiButton-startIcon': { visibility: 'hidden' } }
          : null,
        // Under the loading class the recipe's own colour rule is, so this one, later, wins.
        parts.label?.present === false
          ? { '&.MuiButton-loading': { color: 'transparent' } }
          : null,
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {extended ? children : null}
    </MuiButton>
  );
});
`;
    },
    flutter: (spec) => {
      requireSlots(spec);
      const api = Object.entries(spec.api);
      return `/// SOLAR FAB.
///
/// Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
/// solar:codegen\`: change the template there, never this file. What it looks like is not here. That
/// is the recipe, [SolarFABRecipe]: each size and type, its colours by state, its shadow and its
/// focus ring.
///
/// The screen's one most important action. It wraps Flutter's FilledButton, as SolarButton does,
/// restyled by [SolarFABRecipe.style]; where it floats is the app's (a Scaffold's
/// floatingActionButton takes it). It is extended when it has a label, its [child], and an icon alone
/// otherwise, which then needs a [semanticLabel].
library;

import 'package:flutter/material.dart';

import '../generated/components/fab.dart';
import '../generated/components/spinner.dart';
import 'solar_spinner.dart';
import 'solar_theme_of.dart';

class SolarFAB extends StatelessWidget {
  const SolarFAB({
    super.key,
    required this.onPressed,
    required this.icon,
    this.child,
${api.map(([prop, def]) => `    ${dartParam('FAB', prop, def)},`).join('\n')}
    this.semanticLabel,
    this.focusNode,
    this.autofocus = false,
    this.statesController,
  }) : assert(child != null || semanticLabel != null,
            'SOLAR FAB: an icon FAB needs a semanticLabel.');

  /// Called when it is tapped; null disables it, as for any Flutter button.
  final VoidCallback? onPressed;

  /// The action's icon: add, compose, scan.
  final Widget icon;

  /// The label, which makes it an extended FAB.
  final Widget? child;

${api.map(([prop, def]) => dartField('FAB', prop, def)).join('\n')}

  /// The accessible name, required when there is no label.
  final String? semanticLabel;

  final FocusNode? focusNode;
  final bool autofocus;
  final WidgetStatesController? statesController;

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    // Disabled wins over loading, as in Figma's state order.
    final busy = loading && !disabled;
    final p = SolarFABProps(
${api.map(([prop]) => `      ${prop}: ${prop === 'loading' ? 'busy' : prop},`).join('\n')}
      type: child == null ? SolarFABType.icon : SolarFABType.extended,
    );
    const rest = <WidgetState>{};
    bool shows(String layer) => SolarFABRecipe.present(layer, p, rest);
    final gap = SolarFABRecipe.dimension('root.gap', p, rest) ?? 0;
    // Loading hides the icon and the label but keeps their room, so the FAB does not resize.
    Widget kept(String layer, Widget child) => Visibility(
          visible: shows(layer),
          maintainSize: true,
          maintainAnimation: true,
          maintainState: true,
          maintainSemantics: true,
          child: child,
        );
    final content = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        kept('icon', icon),
        if (child != null) ...[SizedBox(width: gap), kept('label', child!)],
      ],
    );

    Widget button = FilledButton(
      onPressed: disabled || busy ? null : onPressed,
      style: SolarFABRecipe.style(t, p),
      focusNode: focusNode,
      autofocus: autofocus,
      statesController: statesController,
      child: Stack(
        alignment: Alignment.center,
        children: [
          content,
          if (shows('spinner'))
            ExcludeSemantics(
              child: SolarSpinner(
                size: SolarSpinnerSize.values.byName(
                    SolarFABRecipe.lookup('spinner.variant.size', p, rest)!
                        .substring(2)),
                variant: SolarSpinnerVariant.values.firstWhere((v) =>
                    'k:\${v.figma}' ==
                    SolarFABRecipe.lookup('spinner.variant.style', p, rest)),
              ),
            ),
        ],
      ),
    );
    if (semanticLabel != null) {
      button = MergeSemantics(
        child: Semantics(label: semanticLabel, child: button),
      );
    }
    return button;
  }
}
`;
    },
  },
};
