/**
 * SOLAR Timestamp, beyond its IR: where MUI draws each layer, and the two shell templates, run
 * once by \`solar:scaffold\`. One file per component, so adding one edits nothing shared;
 * \`src/components/index.mjs\` finds them.
 *
 * A drawn component: one text, the words the app formats (owner decision, 2026-09-24), drawn by
 * the shared layer helpers (`src/scaffold/drawn.mjs`). `format` changes the words, not the look.
 */

import { drawnFlutter, drawnReact, drawnResets } from '../scaffold/drawn.mjs';

const requireValue = (spec) => {
  if (spec.layers.value?.type !== 'TEXT')
    throw new Error('Timestamp: the IR has no value text');
  if (!spec.api.format) throw new Error('Timestamp: the IR has no format');
};

export default {
  name: 'Timestamp',
  mui: {
    // The shell draws every layer itself, each with a class of its own.
    slots: 'drawn',
    resets: drawnResets('Timestamp'),
  },
  flutter: {},
  templates: {
    react: (spec) => {
      requireValue(spec);
      return drawnReact(spec, {
        look: 'its text style and colour, by size and emphasis',
        about: `Bespoke: a time in words, drawn as HTML’s <time> from Figma’s layer tree
(\`internal/layers.tsx\`). The words are the app’s, formatted in the user’s locale and timezone
(relative, ‘2 min ago’; absolute, ‘Apr 18, 2026, 14:32’); \`format\` says which they are, and
\`dateTime\` is the moment, machine-readable. For \`combined\`, \`detail\` is the absolute time the
words abbreviate, shown on hover.`,
        element: 'time',
        refType: 'HTMLTimeElement',
        react: ['type ReactNode'],
        props: `/** The moment the words describe, written into the page for machines (\`<time datetime>\`). */
dateTime: Date | string;
/** The words for it, which the app formats in the user's locale and timezone. */
children: ReactNode;
/** For \`combined\`: the absolute time the words abbreviate, shown on hover. */
detail?: string;`,
        own: ['dateTime', 'children', 'detail'],
        attrs: `dateTime={typeof dateTime === 'string' ? dateTime : dateTime.toISOString()}
title={detail}`,
        text: '{ value: children }',
      });
    },
    flutter: (spec) => {
      requireValue(spec);
      return drawnFlutter(spec, {
        look: 'its text style and colour, by size and emphasis, read cell by cell',
        about: `Bespoke: a time in words, drawn from Figma's layer tree with [SolarLayers]. The words
are the app's, formatted in the user's locale and timezone (relative, '2 min ago'; absolute,
'Apr 18, 2026, 14:32'); [format] says which they are. For combined, [detail] is the absolute
time the words abbreviate, a tooltip, which a screen reader reads too.`,
        params: `required this.text,
this.detail,`,
        fields: `/// The words for the time, which the app formats in the user's locale and timezone.
final String text;

/// For combined: the absolute time the words abbreviate, shown as a tooltip.
final String? detail;`,
        text: "{'value': text}",
        wrap: `detail == null ? mark : Tooltip(message: detail, child: mark)`,
      });
    },
  },
};
