/**
 * SOLAR Banner, beyond its IR: where MUI draws each layer, and the two shell templates, rendered
 * into the shells by \`solar:codegen\` on every run. One file per component, so adding one edits
 * nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn component (`src/shells/drawn.mjs`): a full-width strip whose icon is SOLAR's for its
 * type, holding the caller's Buttons, a text action and a close button.
 */

import {
  drawnFlutter,
  drawnResets,
  iconsOf,
  treeOf,
} from '../shells/drawn.mjs';
import { targetArea } from '../shells/target.mjs';

const requireLayers = (spec) => {
  for (const slot of [
    'description',
    'primaryButton',
    'secondaryButton',
    'action',
    'close',
  ])
    if (!spec.slots[slot])
      throw new Error(`Banner: the IR has no ${slot} slot`);
};

export default {
  name: 'Banner',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // One line, cut short where it runs out of room ("single line with truncation"); the text
    // action and the close button are bare <button>s, the icon filling the latter.
    resets: drawnResets('Banner', {
      '& .SolarBanner-description': {
        minWidth: '0',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      },
      '& button.SolarBanner-action, & button.SolarBanner-close': {
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        cursor: 'pointer',
      },
      // A 44 × 44 target around the text action and the close button ("implement each with a
      // ≥44×44px touch area", says the description; shells/target.mjs).
      ...targetArea('& button.SolarBanner-action'),
      ...targetArea('& button.SolarBanner-close'),
      '& .SolarBanner-close > svg': {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireLayers(spec);
      const icons = iconsOf(spec);
      return `/**
 * SOLAR Banner.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarBannerStyle\` and \`solarBannerCompose\` in \`@bwp-web/styles/mui\`: each type's
 * fill and icon, and the message's and action's text styles.
 *
 * A bold, full-width message for a page or the app, more urgent than an Alert: one line, cut short
 * where it runs out of room, with SOLAR's icon for its type. Offer at most one action, a Button
 * (\`primaryButton\` or \`secondaryButton\`, a SOLAR Button at sm) or the text \`action\`, and a close
 * button where \`onClose\` is given. It is announced as it appears, at once where it warns or
 * reports a danger. Bespoke: drawn from Figma's layer tree (\`internal/layers.tsx\`). The app must
 * load \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { ${[...new Set([...icons.map((i) => i.react), 'IconClose'])].sort().join(', ')} } from '@bwp-web/assets';
import { forwardRef, type ReactNode } from 'react';
import {
  solarBannerCompose,
  solarBannerStyle,
  type SolarBannerProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface BannerProps
  extends SolarBannerProps,
    Omit<BoxProps, keyof SolarBannerProps | 'children' | 'ref'> {
  /** The message, on one line. */
  description: ReactNode;
  /** A SOLAR Button, primary at sm, as the one action. */
  primaryButton?: ReactNode;
  /** A SOLAR Button, secondary at sm, as the one action. */
  secondaryButton?: ReactNode;
  /** The one action's words, as a link, which call \`onAction\`. */
  action?: ReactNode;
  /** Called by the text action. */
  onAction?: () => void;
  /** Shows a close button, which calls it. */
  onClose?: () => void;
  /** The close button's name. */
  closeLabel?: string;
}

export const Banner = forwardRef<HTMLDivElement, BannerProps>(function Banner(
  {
    type,
    description,
    primaryButton,
    secondaryButton,
    action,
    onAction,
    onClose,
    closeLabel = 'Dismiss',
    sx,
    ...rest
  },
  ref,
) {
  const parts = solarBannerCompose({ type });
  // A slot left empty is not drawn.
  const drawn = {
    ...parts,
    primaryButton: { ...parts.primaryButton, present: primaryButton != null },
    secondaryButton: { ...parts.secondaryButton, present: secondaryButton != null },
    action: { ...parts.action, present: action != null },
    close: { ...parts.close, present: onClose != null },
  };
  return (
    <Box
      ref={ref}
      role={type === 'danger' || type === 'warning' ? 'alert' : 'status'}
      {...rest}
      sx={[solarBannerStyle({ type }), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: 'SolarBanner',
        tree: TREE,
        parts: drawn,
        text: { description },
        icons: {
${icons.map((i) => `          ${i.layer}: <${i.react} />,`).join('\n')}
          primaryButton: <span>{primaryButton}</span>,
          secondaryButton: <span>{secondaryButton}</span>,
          close: (
            <button type="button" aria-label={closeLabel} onClick={onClose}>
              <IconClose />
            </button>
          ),
        },
        render: {
          action: ({ className, style }) => (
            <button type="button" className={className} style={style} onClick={onAction}>
              {action}
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
        look: 'each type’s fill and icon, and the message’s and action’s text styles, read cell by cell',
        about: `Bespoke: a bold, full-width message for a page or the app, more urgent than an Alert,
drawn from Figma's layer tree with [SolarLayers]: one line, with SOLAR's icon for its type.
Offer at most one action, a SolarButton ([primaryButton] or [secondaryButton], at sm) or the
text [action], and a close button where [onClose] is given. It is announced as it appears.`,
        params: `required this.description,
this.primaryButton,
this.secondaryButton,
this.action,
this.onAction,
this.onClose,
this.closeLabel = 'Dismiss',`,
        fields: `/// The message, on one line.
final String description;

/// A SolarButton, primary at sm, as the one action.
final Widget? primaryButton;

/// A SolarButton, secondary at sm, as the one action.
final Widget? secondaryButton;

/// The one action's words, as a link, which call [onAction].
final String? action;

/// Called by the text action.
final VoidCallback? onAction;

/// Shows a close button, which calls it.
final VoidCallback? onClose;

/// The close button's name.
final String closeLabel;`,
        text: "{'description': description, 'action': ?action}",
        slots: `{
        'primaryButton': ?primaryButton,
        'secondaryButton': ?secondaryButton,
        // The close button, in the colour and size the recipe gives its layer.
        'close': ?(onClose == null
            ? null
            : Builder(
                builder: (context) => SolarIcon(
                  SolarIcons.closeOutline,
                  size: IconTheme.of(context).size,
                  color: IconTheme.of(context).color,
                ),
              )),
      }`,
        // A slot left empty is not drawn.
        present: (recipe) => `switch (l) {
          'primaryButton' => primaryButton != null,
          'secondaryButton' => secondaryButton != null,
          'action' => action != null,
          'close' => onClose != null,
          _ => ${recipe},
        }`,
        builders: `{
        'action': (words) => SolarTarget.inside(child: Semantics(
          // A node of its own, so the control keeps its name inside the component's.
          container: true,
          child: SolarPressable(
          onPressed: onAction,
          link: true,
          builder: (_, _) => words,
        ))),
        'close': (close) => SolarTarget.inside(child: Semantics(
          // A node of its own, so the control keeps its name inside the component's.
          container: true,
          child: SolarPressable(
          onPressed: onClose,
          builder: (_, _) => Semantics(
            label: closeLabel,
            excludeSemantics: true,
            child: close,
          ),
        ))),
      }`,
        imports: `import '../solar_icon.dart';
import '../solar_states.dart';
import '../solar_target.dart';`,
        wrap: `Semantics(
      container: true,
      liveRegion: true,
      child: mark,
    )`,
      });
    },
  },
};
