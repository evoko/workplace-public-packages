/**
 * SOLAR Insight Card Small, beyond its IR: where MUI draws each layer and marks each state, and
 * the two shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A card of the family (`src/shells/card.mjs`): the StatusIndicator of its severity in a tile, a
 * title and a description; pressable where it is given something to do, and its placeholders
 * while it loads. Insight Card's smaller form, with no menu.
 */

import {
  cardFlutter,
  cardReact,
  cardResets,
  cardStates,
} from '../shells/card.mjs';
import { insightIndicator } from '../shells/insight.mjs';

const requireLayers = (spec) => {
  for (const slot of ['title', 'description'])
    if (!spec.slots[slot])
      throw new Error(`Insight Card Small: the IR has no ${slot} slot`);
  for (const prop of ['severity', 'loading'])
    if (!spec.api[prop])
      throw new Error(`Insight Card Small: the IR has no ${prop} prop`);
};

const ABOUT = `One insight, in a narrow panel or a summary: the StatusIndicator of its \`severity\` in a
tile, named by \`severityLabel\` (its severity's word by default), and its \`title\` and
\`description\`. Given \`onClick\` or \`href\`, it is pressable: its title is the button or link, and
its hit area the whole card; it is hovered and focused only then. \`loading\` draws Figma's
placeholders, announced busy. For one with a menu, selectable in a list, use an Insight Card.`;

const INSIGHT = {
  look: 'the surface’s edge, shadow and focus ring by state, the severity’s tile, its words, the StatusIndicator it shows, and the placeholders',
  about: ABOUT,
  title: 'title',
  // Figma draws a loading card at info alone.
  statusless: ['loading'],
  status: { axis: 'severity', none: 'info' },
  props: [
    {
      name: 'title',
      kind: 'text',
      layer: 'title',
      required: true,
      doc: 'What the insight is, in a few words; its action’s name where it is pressable.',
    },
    {
      name: 'description',
      kind: 'text',
      layer: 'description',
      doc: 'What it means.',
    },
    ...insightIndicator.props,
  ],
  ...insightIndicator.parts('Insight Card Small'),
};

export default {
  name: 'Insight Card Small',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shells/card.mjs).
    slots: 'drawn',
    resets: cardResets('Insight Card Small', {
      wrap: ['title', 'description'],
      fixed: ['icon'],
    }),
    states: cardStates('Insight Card Small'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    label: 'title',
    slots: {
      title: { react: 'title', flutter: 'title' },
      description: { react: 'description', flutter: 'description' },
    },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return cardReact(spec, INSIGHT);
    },
    flutter: (spec) => {
      requireLayers(spec);
      return cardFlutter(spec, INSIGHT);
    },
  },
};
