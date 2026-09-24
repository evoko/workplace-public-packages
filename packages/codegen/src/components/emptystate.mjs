/**
 * SOLAR EmptyState, beyond its IR: where MUI draws each layer, and the two shell templates, run
 * once by \`solar:scaffold\`. One file per component, so adding one edits nothing shared;
 * \`src/components/index.mjs\` finds them.
 *
 * A drawn component (`src/scaffold/drawn.mjs`): a centred stack of the caller's icon, words and
 * Button.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../scaffold/drawn.mjs';

const requireSlots = (spec) => {
  for (const slot of ['icon', 'title', 'description', 'action'])
    if (!spec.slots[slot])
      throw new Error(`EmptyState: the IR has no ${slot} slot`);
};

export default {
  name: 'EmptyState',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    // The words wrap where they run out of room, centred in the stack Figma centres; the icon
    // fills its slot, which the recipe sizes and colours.
    resets: drawnResets('EmptyState', {
      '& .SolarEmptyState-title, & .SolarEmptyState-description': {
        whiteSpace: 'normal',
        textAlign: 'center',
      },
      '& .SolarEmptyState-icon > svg': {
        display: 'block',
        width: '100%',
        height: '100%',
      },
    }),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireSlots(spec);
      return drawnReact(spec, {
        look: 'the stack’s spacing, the icon’s size and colour, and the words’ text styles',
        about: `Bespoke: a placeholder for a view with nothing to show, drawn from Figma's layer tree
(\`internal/layers.tsx\`): an icon, a title, a description and one action, a SOLAR Button at sm,
each where it is given. The words carry the meaning: say why it is empty and what to do next.
For something still loading, use a Skeleton or a Spinner.`,
        // A placeholder for a view is a block.
        element: 'div',
        refType: 'HTMLDivElement',
        react: ['type ReactNode'],
        props: `/** What is empty. */
icon?: ReactNode;
/** Why it is empty, in a few words. */
title?: ReactNode;
/** What to do next. */
description?: ReactNode;
/** One SOLAR Button, secondary at sm, that does it. */
action?: ReactNode;`,
        own: ['icon', 'title', 'description', 'action'],
        omit: ['title'],
        text: '{ title, description }',
        icons: 'icon: <span>{icon}</span>, action: <span>{action}</span>',
        // A slot left empty is not drawn.
        present: {
          icon: 'icon != null',
          title: 'title != null',
          description: 'description != null',
          action: 'action != null',
        },
      });
    },
    flutter: (spec) => {
      requireSlots(spec);
      return drawnFlutter(spec, {
        look: 'the stack’s spacing, the icon’s size and colour, and the words’ text styles, read cell by cell',
        about: `Bespoke: a placeholder for a view with nothing to show, drawn from Figma's layer tree with
[SolarLayers]: an icon, a title, a description and one action, a SolarButton at sm, each where
it is given. The words carry the meaning: say why it is empty and what to do next. For something
still loading, use a SolarSkeleton or a SolarSpinner.`,
        params: `this.icon,
this.title,
this.description,
this.action,`,
        fields: `/// What is empty.
final Widget? icon;

/// Why it is empty, in a few words.
final String? title;

/// What to do next.
final String? description;

/// One SolarButton, secondary at sm, that does it.
final Widget? action;`,
        text: "{'title': ?title, 'description': ?description}",
        slots: "{'icon': ?icon, 'action': ?action}",
        wraps: "{'title': TextAlign.center, 'description': TextAlign.center}",
        // A slot left empty is not drawn.
        present: (recipe) => `switch (l) {
          'icon' => icon != null,
          'title' => title != null,
          'description' => description != null,
          'action' => action != null,
          _ => ${recipe},
        }`,
      });
    },
  },
};
