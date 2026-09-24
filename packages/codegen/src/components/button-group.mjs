/**
 * SOLAR Button Group, beyond its IR: where MUI draws each layer and marks each state, what the
 * Flutter base control's style reads, and the two shell templates, rendered into the shells by
 * \`solar:codegen\` on every run. One file per component, so adding one edits nothing shared;
 * \`src/components/index.mjs\` finds them.
 */

import { dartField, dartParam } from '../shells/helpers.mjs';

export default {
  name: 'Button Group',
  mui: {
    // A flex box of the caller's Buttons. Figma draws example Buttons at three layers; whatever
    // the caller passes, each is a child of the box, so the three are styled together.
    slots: {
      root: '&',
      tertiaryCTA: '& > *',
      secondaryCTA: '& > *',
      button3: '& > *',
    },
    // The shell renders a Box, which is a block; Figma's auto layout is a flex box.
    resets: { display: 'flex' },
  },
  flutter: {},
  templates: {
    react: (spec) => {
      for (const axis of ['orientation', 'fullWidth'])
        if (!spec.api[axis])
          throw new Error(`Button Group: the IR has no ${axis}`);
      return `/**
 * SOLAR Button Group.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarButtonGroupStyle\` in \`@bwp-web/styles/mui\`: the direction, the gap, the
 * padding, the full-width bar's divider, and its buttons filling it. This file is behaviour.
 *
 * Bespoke: a box of the caller's Buttons, which it never changes. The app must load
 * \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { Children, forwardRef, isValidElement, type ReactNode } from 'react';
import { solarButtonDefaults, solarButtonGroupStyle } from '@bwp-web/styles/mui';

/** Figma draws a horizontal group regular or full-width, and a vertical one regular only. */
export type ButtonGroupLayout =
  | { orientation?: 'horizontal'; fullWidth?: boolean }
  | { orientation: 'vertical'; fullWidth?: false };

export type ButtonGroupProps = ButtonGroupLayout &
  Omit<BoxProps, 'children'> & {
    /** Two to five SOLAR Buttons, of one size. */
    children: ReactNode;
  };

// Through globalThis, because \`process\` exists only where a bundler or Node provides it, and a
// browser library should not need Node's types to say so.
const DEV =
  (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV !==
  'production';

export const ButtonGroup = forwardRef<HTMLDivElement, ButtonGroupProps>(function ButtonGroup(
  { orientation, fullWidth, children, sx, ...rest },
  ref,
) {
  if (DEV) {
    // SOLAR: the buttons of a group share one size. (Figma's description says one priority too,
    // but every group it draws mixes secondary and primary, so only the size is checked.)
    const sizes = new Set(
      Children.toArray(children)
        .filter(isValidElement)
        .map((c) => (c.props as { size?: string }).size ?? solarButtonDefaults.size),
    );
    if (sizes.size > 1)
      // eslint-disable-next-line no-console -- a development-only design warning, on purpose
      console.warn('SOLAR Button Group: its buttons should share one size.');
  }

  return (
    <Box
      ref={ref}
      role="group"
      {...rest}
      sx={[solarButtonGroupStyle({ orientation, fullWidth }), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {children}
    </Box>
  );
});
`;
    },
    flutter: (spec) => {
      const api = Object.entries(spec.api);
      for (const axis of ['orientation', 'fullWidth'])
        if (!spec.api[axis])
          throw new Error(`Button Group: the IR has no ${axis}`);
      return `/// SOLAR Button Group.
///
/// Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
/// solar:codegen\`: change the template there, never this file. What it looks like is not here. That
/// is the recipe, [SolarButtonGroupRecipe]: the direction, the gap, the padding, the full-width
/// bar's divider, and its buttons filling it, read cell by cell.
///
/// Bespoke: a row or column of the caller's buttons, which it never changes.
library;

import 'package:flutter/material.dart';

import '../generated/components/button_group.dart';
import 'solar_theme_of.dart';

class SolarButtonGroup extends StatelessWidget {
  const SolarButtonGroup({
    super.key,
    required this.children,
${api.map(([prop, def]) => `    ${dartParam('ButtonGroup', prop, def)},`).join('\n')}
  }) : assert(
         !(orientation == SolarButtonGroupOrientation.vertical && fullWidth),
         'SOLAR Button Group: Figma draws no vertical full-width group.',
       );

  /// Two to five SOLAR buttons, of one size.
  final List<Widget> children;

${api.map(([prop, def]) => dartField('ButtonGroup', prop, def)).join('\n')}

  static const _main = {
    'MIN': MainAxisAlignment.start,
    'CENTER': MainAxisAlignment.center,
    'MAX': MainAxisAlignment.end,
    'SPACE_BETWEEN': MainAxisAlignment.spaceBetween,
  };

  @override
  Widget build(BuildContext context) {
    final t = solarThemeOf(context);
    final p = SolarButtonGroupProps(${api.map(([prop]) => `${prop}: ${prop}`).join(', ')});
    const rest = <WidgetState>{};
    String? at(String cell) => SolarButtonGroupRecipe.lookup(cell, p, rest);
    double length(String cell) =>
        SolarButtonGroupRecipe.dimension(cell, p, rest) ?? 0;

    final horizontal = at('root.direction') == 'k:HORIZONTAL';
    final main = _main[at('root.align')!.substring(2).split('/').first]!;
    // A side of its own where the recipe has one (the full-width divider), else the uniform border.
    final colour = SolarButtonGroupRecipe.color(t, 'root.borderColor', p, rest);
    BorderSide side(String name) {
      final cell = at('root.border\${name}Width') != null
          ? 'root.border\${name}Width'
          : 'root.borderWidth';
      final v = at(cell);
      if (v == null || v == 'none') return BorderSide.none;
      return BorderSide(color: colour, width: length(cell));
    }

    // Every button fills the group, as Figma draws them: equal shares of a row, the full width of
    // a column.
    final fills = at('secondaryCTA.width') == 'k:FILL';
    return Semantics(
      container: true,
      explicitChildNodes: true,
      child: SizedBox(
        width: at('root.width') == 'k:FILL' ? double.infinity : null,
        child: DecoratedBox(
          decoration: BoxDecoration(
            border: Border(
              top: side('Top'),
              right: side('Right'),
              bottom: side('Bottom'),
              left: side('Left'),
            ),
          ),
          child: Padding(
            padding: EdgeInsets.fromLTRB(
              length('root.paddingLeft'),
              length('root.paddingTop'),
              length('root.paddingRight'),
              length('root.paddingBottom'),
            ),
            child: Flex(
              direction: horizontal ? Axis.horizontal : Axis.vertical,
              mainAxisSize: horizontal ? MainAxisSize.max : MainAxisSize.min,
              mainAxisAlignment: main,
              crossAxisAlignment: !horizontal && fills
                  ? CrossAxisAlignment.stretch
                  : CrossAxisAlignment.center,
              spacing: length('root.gap'),
              children: [
                for (final child in children)
                  horizontal && fills ? Expanded(child: child) : child,
              ],
            ),
          ),
        ),
      ),
    );
  }
}
`;
    },
  },
};
