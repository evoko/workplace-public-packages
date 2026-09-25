/**
 * SOLAR Option Card, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A tile of the card family (`src/shells/card.mjs`): a Plus in a circle over its label, to create
 * something new, as Figma draws it; pressable where it is given something to do, and selected as
 * the current one of its set.
 */

import {
  cardFlutter,
  cardReact,
  cardResets,
  cardStates,
} from '../shells/card.mjs';

const requireLayers = (spec) => {
  if (!spec.slots.label)
    throw new Error('Option Card: the IR has no label slot');
  if (spec.api.selected?.type !== 'boolean')
    throw new Error('Option Card: the IR has no selected prop');
};

const ABOUT = `A tile to create something new, in a grid of them (“New design”): a Plus in a circle over
its \`label\`. Given \`onClick\` or \`href\`, it is pressable: its label is the button or link, and its
hit area the whole tile; it is hovered and focused only then. The \`selected\` one is the current
one of its set.`;

const TILE = {
  look: 'the tile’s edge, shadow and focus ring by state, the Plus’s circle and ink, and its label',
  about: ABOUT,
  title: 'label',
  selected: 'selected',
  props: [
    {
      name: 'label',
      kind: 'text',
      layer: 'label',
      required: true,
      doc: 'What it creates, in a few words; its action’s name where it is pressable.',
    },
  ],
};

export default {
  name: 'Option Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shells/card.mjs).
    slots: 'drawn',
    resets: cardResets('Option Card', {
      wrap: ['label'],
      icons: ['iconPlus'],
      extra: { '& .SolarOptionCard-label': { textAlign: 'center' } },
    }),
    states: cardStates('Option Card', { selected: true }),
    overlaps: { focus: ['hover', 'selected'], hover: ['selected'] },
  },
  flutter: {},
  // How each platform reaches what the IR names, where not by its own name (src/shells/api.mjs).
  api: {
    react: { label: 'label' },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return cardReact(spec, TILE);
    },
    flutter: (spec) => {
      requireLayers(spec);
      return cardFlutter(spec, { ...TILE, wraps: "'label': TextAlign.center" });
    },
  },
};
