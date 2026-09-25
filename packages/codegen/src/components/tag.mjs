/**
 * SOLAR Tag, beyond its IR: where MUI draws each layer, and the two shell templates, rendered into
 * the shells by \`solar:codegen\` on every run. One file per component, so adding one edits nothing
 * shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn component (`src/shells/drawn.mjs`): a pill whose type follows from what the caller
 * gives (the overlay's derive), its close button a pressable of its own.
 */

import { drawnFlutter, drawnResets, treeConsts } from '../shells/drawn.mjs';
import { targetArea } from '../shells/target.mjs';

const requireLayers = (spec) => {
  for (const slot of ['label', 'icon'])
    if (!spec.slots[slot]) throw new Error(`Tag: the IR has no ${slot} slot`);
  for (const layer of ['statusIndicator', 'iconNone', 'iconClose'])
    if (!spec.layers[layer])
      throw new Error(`Tag: the IR has no ${layer} layer`);
  if (!spec.derived?.type) throw new Error('Tag: its type is not derived');
};

export default {
  name: 'Tag',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // A caller's icon fills its slot, which the recipe sizes and colours; the close button is a
    // <button> with none of the browser's own look, its icon filling it.
    resets: drawnResets('Tag', {
      '& .SolarTag-icon > svg, & .SolarTag--iconNone > svg, & .SolarTag--iconClose > svg':
        {
          display: 'block',
          width: '100%',
          height: '100%',
        },
      // A 44 × 44 target around the close button, as far as the page lets it reach
      // (shells/target.mjs).
      ...targetArea('& button.SolarTag--iconClose'),
      '& button.SolarTag--iconClose': {
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        cursor: 'pointer',
      },
    }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return `/**
 * SOLAR Tag.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarTagStyle\` and \`solarTagCompose\` in \`@bwp-web/styles/mui\`: each status's
 * fill, edge and words, inverted or not, and each type's layout.
 *
 * A compact label for a status, a category or a user's entry, of one to three words. Bespoke: a
 * pill drawn from Figma's layer tree (\`internal/layers.tsx\`). Its type follows from what it is
 * given, as Figma's five are drawn: \`indicator\` shows the status dot, \`onClose\` a close button
 * (named "Remove" and its words), an \`icon\` sits before the words, or alone where there are none,
 * which then needs an \`aria-label\`. An inverted tag has no dot, as Figma draws none. The app must
 * load \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { IconClose } from '@bwp-web/assets';
import { forwardRef, type ReactNode } from 'react';
import {
  solarTagCompose,
  solarTagStyle,
  type SolarTagProps,
  type SolarTagRecipeProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import { StatusIndicator, type StatusIndicatorProps } from './StatusIndicator.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

/** Figma draws the status dot on a tag that is not inverted alone. */
export type TagLook =
  | { invert?: false; indicator?: boolean }
  | { invert: true; indicator?: false };

export type TagProps = Omit<SolarTagProps, 'invert'> &
  TagLook &
  Omit<BoxProps, keyof SolarTagProps | 'children' | 'ref'> & {
    /** The words, one to three; none makes it an icon tag, named by \`aria-label\`. */
    children?: ReactNode;
    /** An icon before the words, or alone. */
    icon?: ReactNode;
    /** Shows a close button, which calls it: a user's entry, removable. */
    onClose?: () => void;
    /** The close button's name, before the words. */
    closeLabel?: string;
  };

/** Which of Figma's five a tag is, from what it is given, first match first (the overlay's derive). */
function typeOf(p: {
  indicator?: boolean;
  onClose?: unknown;
  icon?: unknown;
  label: boolean;
}): SolarTagRecipeProps['type'] {
  if (p.indicator && p.label) return 'status';
  if (p.onClose && p.label) return 'closable';
  if (p.icon != null) return p.label ? 'icon+text' : 'icon-only';
  return 'text-only';
}

export const Tag = forwardRef<HTMLSpanElement, TagProps>(function Tag(
  { status, invert, indicator, children, icon, onClose, closeLabel = 'Remove', sx, ...rest },
  ref,
) {
  const label = children != null && children !== false && children !== '';
  const look: SolarTagRecipeProps = {
    status,
    invert,
    type: typeOf({ indicator, onClose, icon, label }),
  };
  const words = typeof children === 'string' ? \` \${children}\` : '';
  const parts = solarTagCompose(look);
  const dot = parts.statusIndicator;
  return (
    <Box
      component="span"
      ref={ref}
      {...rest}
      sx={[solarTagStyle(look), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: 'SolarTag',
        tree: TREE, slots: SLOTS,
        parts,
        text: { label: children },
        // The dot is a StatusIndicator, in the type and size the recipe names for the status, in
        // its layer's element; decorative, as the words say the status.
        render: {
          statusIndicator: ({ className, style }) => (
            <span className={className} style={style}>
              <StatusIndicator
                type={dot['variant.type'] as StatusIndicatorProps['type']}
                size={dot['variant.size'] as StatusIndicatorProps['size']}
              />
            </span>
          ),
        },
        icons: {
          icon: <span>{icon}</span>,
          iconNone: <span>{icon}</span>,
          iconClose: (
            <button type="button" aria-label={\`\${closeLabel}\${words}\`} onClick={onClose}>
              <IconClose />
            </button>
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
      return drawnFlutter(spec, {
        look: 'each status’s fill, edge and words, inverted or not, and each type’s layout, read cell by cell',
        about: `Bespoke: a compact label for a status, a category or a user's entry, of one to three words,
drawn from Figma's layer tree with [SolarLayers]. Its type follows from what it is given, as
Figma's five are drawn: [indicator] shows the status dot, [onClose] a close button (named
[closeLabel] and the words), an [icon] sits before the words, or alone where there are none, which
then needs a [semanticLabel]. An inverted tag has no dot, as Figma draws none.`,
        params: `this.label,
this.icon,
this.indicator = false,
this.onClose,
this.closeLabel = 'Remove',
this.semanticLabel,`,
        fields: `/// The words, one to three; none makes it an icon tag, named by [semanticLabel].
final String? label;

/// An icon before the words, or alone.
final Widget? icon;

/// Whether it shows the status dot; never on an inverted tag.
final bool indicator;

/// Shows a close button, which calls it: a user's entry, removable.
final VoidCallback? onClose;

/// The close button's name, before the words.
final String closeLabel;

/// What an icon tag says, for a screen reader.
final String? semanticLabel;`,
        prelude: `assert(
  !(invert && indicator),
  'SolarTag: Figma draws no inverted tag with a status dot',
);`,
        members: `/// Which of Figma's five it is, from what it is given, first match first (the overlay's derive).
SolarTagType get _type {
  final words = label != null && label!.isNotEmpty;
  if (indicator && words) return SolarTagType.status;
  if (onClose != null && words) return SolarTagType.closable;
  if (icon != null) {
    return words ? SolarTagType.iconText : SolarTagType.iconOnly;
  }
  return SolarTagType.textOnly;
}`,
        values: { type: '_type' },
        // A Toast draws its Tag on its own surface and edge.
        restyle: true,
        text: "{'label': ?label}",
        slots: "{'icon': ?icon, 'iconNone': ?icon}",
        builders: `{
        'iconClose': (close) => SolarTarget.inside(child: Semantics(
          // A node of its own, so the control keeps its name inside the component's.
          container: true,
          child: SolarPressable(
          onPressed: onClose,
          builder: (_, _) => Semantics(
            label: [closeLabel, ?label].join(' '),
            excludeSemantics: true,
            child: close,
          ),
        ))),
      }`,
        // The dot is a StatusIndicator, in the type and size the recipe names for the status.
        composed: `{
        'statusIndicator': SolarStatusIndicator(
          type: SolarStatusIndicatorType.values.byName(
            SolarTagRecipe.lookup('statusIndicator.variant.type', p, states)!
                .substring(2),
          ),
          size: SolarStatusIndicatorSize.values.byName(
            SolarTagRecipe.lookup('statusIndicator.variant.size', p, states)!
                .substring(2),
          ),
        ),
      }`,
        imports: `import '../solar_states.dart';
import '../solar_target.dart';
import '../generated/components/statusindicator.dart';
import 'solar_statusindicator.dart';`,
        wrap: `semanticLabel == null
        ? mark
        : Semantics(label: semanticLabel, child: mark)`,
      });
    },
  },
};
