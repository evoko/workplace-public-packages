/**
 * The shells of SOLAR's callouts, Alert and Alert Small: drawn on both from Figma's layers, their
 * StatusIndicator composed in the type the recipe names, their words the caller's, their action a
 * button of its own. The two differ in size alone, which is the recipe's.
 *
 * The templates are functions of the IR: the API and the layer tree come from it, never retyped.
 */

import { pascal } from '../util/naming.mjs';
import { drawnFlutter, drawnResets, wrapDoc, treeConsts } from './drawn.mjs';
import { targetArea } from './target.mjs';

/** The layers and slots a callout's templates need, refused where the IR lacks one. */
export function requireAlert(spec) {
  for (const slot of ['title', 'description', 'action'])
    if (!spec.slots[slot])
      throw new Error(`${spec.component}: the IR has no ${slot} slot`);
  if (!spec.layers.statusIndicator)
    throw new Error(`${spec.component}: the IR has no statusIndicator layer`);
  for (const prop of ['type', 'variant'])
    if (!spec.api[prop])
      throw new Error(`${spec.component}: the IR has no ${prop} prop`);
}

/** Where MUI draws each layer: every layer drawn by the shell, the action a bare <button>. */
export function alertMui(name) {
  const P = `Solar${pascal(name)}`;
  return {
    slots: 'drawn',
    resets: drawnResets(name, {
      [`& button.${P}-action`]: {
        appearance: 'none',
        border: '0',
        padding: '0',
        margin: '0',
        background: 'none',
        cursor: 'pointer',
        textAlign: 'start',
      },
      // A 44 × 44 target around the action (target.mjs).
      ...targetArea(`& button.${P}-action`),
    }),
  };
}

const ABOUT = `A callout in the page, of a status: a title, a description and one action, each shown
where it is given, beside the StatusIndicator of its type. It is announced as it appears, at
once where it warns or reports a danger.`;

/** The React shell. */
export function alertReact(spec, { about }) {
  const name = spec.component;
  const P = pascal(name);
  const api = Object.keys(spec.api);
  return `/**
 * SOLAR ${name}.
 *
${wrapDoc(`Generated from its template in \`packages/codegen/src/components/\` on every \`npm run solar:codegen\`: change the template there, never this file. What it looks like is not here. That is the recipe, \`solar${P}Style\` and \`solar${P}Compose\` in \`@bwp-web/styles/mui\`: each type's fill, edge and words, filled or outlined, and the StatusIndicator it shows.`, ' * ')}
 *
 * ${`${ABOUT} ${about}`.replace(/\n/g, ' ')} Bespoke: drawn from Figma's layer tree
 * (\`internal/layers.tsx\`). The app must load \`@bwp-web/styles/tokens.css\`.
 */

import Box, { type BoxProps } from '@mui/material/Box';
import { forwardRef, type ReactNode } from 'react';
import {
  solar${P}Compose,
  solar${P}Style,
  type Solar${P}Props,
} from '@bwp-web/styles/mui';
import { drawChildren } from './internal/layers.js';
import { StatusIndicator, type StatusIndicatorProps } from './StatusIndicator.js';

/** Each layer's children, as Figma nests them. */
${treeConsts(spec)}

export interface ${P}Props
  extends Solar${P}Props,
    Omit<BoxProps, keyof Solar${P}Props | 'title' | 'children' | 'ref'> {
  /** What happened, in a few words. */
  title?: ReactNode;
  /** What it means, and what to do. */
  description?: ReactNode;
  /** The one action's words, which call \`onAction\`. */
  action?: ReactNode;
  /** Called by the action. */
  onAction?: () => void;
}

export const ${P} = forwardRef<HTMLDivElement, ${P}Props>(function ${P}(
  { ${api.join(', ')}, title, description, action, onAction, sx, ...rest },
  ref,
) {
  const parts = solar${P}Compose({ ${api.join(', ')} });
  const dot = parts.statusIndicator;
  // A slot left empty is not drawn.
  const drawn = {
    ...parts,
    title: { ...parts.title, present: title != null },
    description: { ...parts.description, present: description != null },
    action: { ...parts.action, present: action != null },
  };
  return (
    <Box
      ref={ref}
      role={type === 'danger' || type === 'warning' ? 'alert' : 'status'}
      {...rest}
      sx={[solar${P}Style({ ${api.join(', ')} }), ...(Array.isArray(sx) ? sx : [sx])]}
    >
      {drawChildren('root', {
        prefix: 'Solar${P}',
        tree: TREE, slots: SLOTS,
        parts: drawn,
        text: { title, description },
        render: {
          // The mark is a StatusIndicator, in the type the recipe names, in its layer's element;
          // decorative, as the words say the status.
          statusIndicator: ({ className, style }) => (
            <span className={className} style={style}>
              <StatusIndicator
                type={dot['variant.type'] as StatusIndicatorProps['type']}
                size={dot['variant.size'] as StatusIndicatorProps['size']}
              />
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
}

/** The Flutter widget. */
export function alertFlutter(spec, { about }) {
  const name = spec.component;
  const P = pascal(name);
  const R = `Solar${P}Recipe`;
  return drawnFlutter(spec, {
    look: 'each type’s fill, edge and words, filled or outlined, and the StatusIndicator it shows, read cell by cell',
    about: `${ABOUT} ${about} Bespoke: drawn from Figma's layer tree with [SolarLayers].`,
    params: `this.title,
this.description,
this.action,
this.onAction,`,
    fields: `/// What happened, in a few words.
final String? title;

/// What it means, and what to do.
final String? description;

/// The one action's words, which call [onAction].
final String? action;

/// Called by the action.
final VoidCallback? onAction;`,
    text: "{'title': ?title, 'description': ?description, 'action': ?action}",
    // A slot left empty is not drawn.
    present: (recipe) => `switch (l) {
          'title' => title != null,
          'description' => description != null,
          'action' => action != null,
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
    composed: `{
        'statusIndicator': ExcludeSemantics(
          child: SolarStatusIndicator(
            type: SolarStatusIndicatorType.values.byName(
              ${R}.lookup('statusIndicator.variant.type', p, states)!
                  .substring(2),
            ),
            size: SolarStatusIndicatorSize.values.byName(
              ${R}.lookup('statusIndicator.variant.size', p, states)!
                  .substring(2),
            ),
          ),
        ),
      }`,
    imports: `import '../solar_states.dart';
import '../solar_target.dart';
import '../generated/components/statusindicator.dart';
import 'solar_statusindicator.dart';`,
    wrap: `Semantics(
      container: true,
      liveRegion: true,
      child: mark,
    )`,
  });
}
