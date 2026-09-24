/**
 * SOLAR Toast, beyond its IR: where MUI draws each layer, and the two shell templates, rendered
 * into the shells by \`solar:codegen\` on every run. One file per component, so adding one edits
 * nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A drawn component (`src/shells/drawn.mjs`): a pill holding a SOLAR Tag, restyled by the toast
 * (the overlay's restyles), the message, and an action.
 */

import { drawnFlutter, drawnResets, treeOf } from '../shells/drawn.mjs';
import { targetArea } from '../shells/target.mjs';

const requireLayers = (spec) => {
  for (const slot of ['message', 'tag', 'action', 'chevron'])
    if (!spec.slots[slot]) throw new Error(`Toast: the IR has no ${slot} slot`);
};

export default {
  name: 'Toast',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // The action is a bare <button>; the chevron fills its layer.
    resets: drawnResets('Toast', {
      '& button.SolarToast-action': {
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        cursor: 'pointer',
      },
      // A 44 × 44 target around the action (shells/target.mjs).
      ...targetArea('& button.SolarToast-action'),
      '& .SolarToast-chevron > svg': {
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
      return `/**
 * SOLAR Toast.
 *
 * Generated from its template in \`packages/codegen/src/components/\` on every \`npm run
 * solar:codegen\`: change the template there, never this file. What it looks like is not here. That
 * is the recipe, \`solarToastStyle\` and \`solarToastCompose\` in \`@bwp-web/styles/mui\`: each status's
 * fill, edge and action colour, and the Tag drawn on the toast's surface and edge.
 *
 * A passing message about something done in the background ("File saved", "Connection lost"),
 * with a Tag saying what it is about and an optional action ("Undo"). Never for an error that
 * needs a decision: that is a Dialog. Bespoke: drawn from Figma's layer tree
 * (\`internal/layers.tsx\`). Where it appears, and how long it stays (4 to 7 seconds, longer for a
 * danger), is the app's: show it in MUI's Snackbar. It is announced as it appears. The app must
 * load \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { IconChevronRight } from '@bwp-web/assets';
import { forwardRef, type ReactNode } from 'react';
import {
  solarToastCompose,
  solarToastStyle,
  type SolarToastProps,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import { Tag, type TagProps } from './Tag.js';

/** Each layer's children, as Figma nests them. */
const TREE: Record<string, string[]> = ${JSON.stringify(treeOf(spec))};

export interface ToastProps
  extends SolarToastProps,
    Omit<BoxProps, keyof SolarToastProps | 'children' | 'ref'> {
  /** What happened, in a few words. */
  message: ReactNode;
  /** What it is about, in the Tag before the message. */
  tag?: ReactNode;
  /** The action's words ("Undo"), which call \`onAction\`. */
  action?: ReactNode;
  /** Called by the action. */
  onAction?: () => void;
  /** Whether a chevron follows the action, where it opens something. */
  chevron?: boolean;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { status, message, tag, action, onAction, chevron = false, sx, ...rest },
  ref,
) {
  const parts = solarToastCompose({ status });
  const t = parts.tag;
  // A slot left empty is not drawn.
  const drawn = {
    ...parts,
    tag: { ...t, present: tag != null },
    action: { ...parts.action, present: action != null },
    chevron: { ...parts.chevron, present: action != null && chevron },
  };
  return (
    <Box
      ref={ref}
      role={status === 'danger' ? 'alert' : 'status'}
      {...rest}
      sx={[solarToastStyle({ status }), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: 'SolarToast',
        tree: TREE,
        parts: drawn,
        text: { message },
        icons: { chevron: <IconChevronRight /> },
        render: {
          // A SOLAR Tag, in the variant the recipe names, in its layer's element; the recipe draws
          // it on the toast's surface and edge.
          tag: ({ className, style }) => (
            <span className={className} style={style}>
              <Tag status={t['variant.status'] as TagProps['status']} indicator>
                {tag}
              </Tag>
            </span>
          ),
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
        look: 'each status’s fill, edge and action colour, and the Tag drawn on the toast’s surface and edge, read cell by cell',
        about: `Bespoke: a passing message about something done in the background, with a Tag saying what
it is about and an optional action ("Undo"), drawn from Figma's layer tree with [SolarLayers].
Never for an error that needs a decision: that is a dialog. Where it appears, and how long it
stays (4 to 7 seconds, longer for a danger), is the app's: show it in a SnackBar. It is
announced as it appears.`,
        params: `required this.message,
this.tag,
this.action,
this.onAction,
this.chevron = false,`,
        fields: `/// What happened, in a few words.
final String message;

/// What it is about, in the Tag before the message.
final String? tag;

/// The action's words ("Undo"), which call [onAction].
final String? action;

/// Called by the action.
final VoidCallback? onAction;

/// Whether a chevron follows the action, where it opens something.
final bool chevron;`,
        text: "{'message': message, 'action': ?action}",
        slots: `{
        // The chevron, in the colour and size the recipe gives its layer.
        'chevron': ?(action != null && chevron
            ? Builder(
                builder: (context) => SolarIcon(
                  SolarIcons.chevronRightOutline,
                  size: IconTheme.of(context).size,
                  color: IconTheme.of(context).color,
                ),
              )
            : null),
      }`,
        // A slot left empty is not drawn.
        present: (recipe) => `switch (l) {
          'tag' => tag != null,
          'action' => action != null,
          'chevron' => action != null && chevron,
          _ => ${recipe},
        }`,
        builders: `{
        'action': (words) => SolarTarget.inside(child: Semantics(
          // A node of its own, so the control keeps its name inside the component's.
          container: true,
          child: SolarPressable(
          onPressed: onAction,
          builder: (_, _) => words,
        ))),
      }`,
        // A SOLAR Tag, in the variant the recipe names, on the toast's surface and edge.
        composed: `{
        'tag': SolarTag(
          status: SolarTagStatus.values.byName(
            SolarToastRecipe.lookup('tag.variant.status', p, states)!.substring(2),
          ),
          label: tag,
          indicator: true,
          restyle: {
            'root.background': SolarToastRecipe.color(t, 'tag.background', p, states),
            'root.borderColor': SolarToastRecipe.color(t, 'tag.borderColor', p, states),
          },
        ),
      }`,
        imports: `import '../generated/components/tag.dart';
import '../generated/icons.dart';
import '../solar_icon.dart';
import '../solar_states.dart';
import '../solar_target.dart';
import 'solar_tag.dart';`,
        wrap: `Semantics(
      container: true,
      liveRegion: true,
      child: mark,
    )`,
      });
    },
  },
};
