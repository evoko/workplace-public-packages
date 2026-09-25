/**
 * SOLAR Status Card, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A card of the family (`src/shells/card.mjs`): a title and a More menu over a figure and the
 * StatusIndicator of its status, pressable where it is given something to do, and its
 * placeholders while it loads.
 */

import {
  cardFlutter,
  cardReact,
  cardResets,
  cardStates,
  moreIconOf,
} from '../shells/card.mjs';

const requireLayers = (spec) => {
  for (const slot of ['title', 'value'])
    if (!spec.slots[slot])
      throw new Error(`Status Card: the IR has no ${slot} slot`);
  for (const layer of ['iconMore', 'statusIndicator', 'skeleton'])
    if (!spec.layers[layer])
      throw new Error(`Status Card: the IR has no ${layer} layer`);
  for (const prop of ['status', 'disabled', 'loading'])
    if (!spec.api[prop])
      throw new Error(`Status Card: the IR has no ${prop} prop`);
};

const ABOUT = `A figure and its status at a glance, on a dashboard: its \`title\`, a More menu of
\`moreItems\`, and the \`value\` beside the StatusIndicator of its \`status\`, named by
\`statusLabel\` (its status's word by default), so the status is read, not only seen. Given
\`onClick\` or \`href\`, it is pressable: its title is the button or link, and its hit area the whole
card, the More menu reachable above it; it is hovered and focused only then. \`loading\` draws
Figma's placeholders, announced busy.`;

const STATUS = {
  look: 'the surface’s edge, shadow and focus ring by state, its words’ ink, the StatusIndicator it shows, and the placeholders',
  about: ABOUT,
  title: 'titleTitle',
  props: [
    {
      name: 'title',
      kind: 'text',
      layer: 'titleTitle',
      required: true,
      doc: 'What the card counts, in a few words; its action’s name where it is pressable.',
    },
    {
      name: 'value',
      kind: 'text',
      layer: 'value',
      required: true,
      doc: 'The figure: a count, a share.',
    },
    {
      name: 'statusLabel',
      kind: 'node',
      react: 'string',
      dart: 'String',
      doc: 'The status’s name, which the StatusIndicator announces; its word by default.',
    },
  ],
  imports:
    "import { StatusIndicator, type StatusIndicatorProps } from './StatusIndicator.js';",
  prelude: `const dot = composed.statusIndicator;
// The status is read as well as seen: its word, where the caller names it no other way.
const named = statusLabel ?? status.charAt(0).toUpperCase() + status.slice(1);`,
  render: `// The mark is a StatusIndicator, in the type the recipe names, in its layer's element, named by
// the status's word.
statusIndicator: ({ className: c, style }: DrawnLayer) => (
  <span className={c} style={style}>
    <StatusIndicator
      type={dot['variant.type'] as StatusIndicatorProps['type']}
      size={dot['variant.size'] as StatusIndicatorProps['size']}
      label={named}
    />
  </span>
),`,
  importsDart: `import '../generated/components/statusindicator.dart';
import 'solar_statusindicator.dart';`,
  composed: `// The mark is a StatusIndicator, in the type the recipe names, named by the status's word.
'statusIndicator': SolarStatusIndicator(
  type: SolarStatusIndicatorType.values.byName(
    SolarStatusCardRecipe.lookup('statusIndicator.variant.type', p, states)!.substring(2),
  ),
  size: SolarStatusIndicatorSize.values.byName(
    SolarStatusCardRecipe.lookup('statusIndicator.variant.size', p, states)!.substring(2),
  ),
  label: statusLabel ?? '\${status.name[0].toUpperCase()}\${status.name.substring(1)}',
),`,
};

export default {
  name: 'Status Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shells/card.mjs).
    slots: 'drawn',
    resets: cardResets('Status Card', { more: 'iconMore' }),
    states: cardStates('Status Card'),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    label: 'title',
    slots: {
      title: { react: 'title', flutter: 'title' },
      value: { react: 'value', flutter: 'value' },
    },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return cardReact(spec, {
        ...STATUS,
        more: { layer: 'iconMore', icon: moreIconOf(spec, 'iconMore') },
      });
    },
    flutter: (spec) => {
      requireLayers(spec);
      return cardFlutter(spec, {
        ...STATUS,
        more: { layer: 'iconMore', icon: moreIconOf(spec, 'iconMore') },
      });
    },
  },
};
