/**
 * SOLAR Device Card, beyond its IR: where MUI draws each layer and marks each state, and the two
 * shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A card of the family (`src/shells/card.mjs`): one device (its icon, name, details and health)
 * or a batch of them (its headline over the caller's Dropdown of its devices), each drawn from its
 * own layers as Figma draws each; its health a SOLAR Tag, its action the caller's Button, and its
 * placeholders while it loads.
 */

import {
  cardFlutter,
  cardReact,
  cardResets,
  cardStates,
} from '../shells/card.mjs';

const P = 'SolarDeviceCard';

const requireLayers = (spec) => {
  for (const slot of ['name', 'details', 'count', 'devices', 'button'])
    if (!spec.slots[slot])
      throw new Error(`Device Card: the IR has no ${slot} slot`);
  for (const layer of [
    'tag',
    'headlineTag',
    'headlineContentName',
    'rowName',
    'rowCount',
  ])
    if (!spec.layers[layer])
      throw new Error(`Device Card: the IR has no ${layer} layer`);
};

const ABOUT = `One device, or a batch of them (\`type\`): its \`name\`, and for one device its \`details\`
(what and where it is), for a batch its \`count\` and the caller's \`devices\` (a SOLAR Dropdown of
them, md); its health, a SOLAR Tag of \`tag\`'s words in \`tagStatus\` (success by default), and the
caller's \`action\` (a SOLAR Button, sm and secondary, such as "Try again"). \`loading\` draws
Figma's placeholders, announced busy. Given \`onClick\` or \`href\`, it is pressable: its name is the
button or link, and its hit area the whole card, its action and devices reachable above it; it is
focused only then.`;

const DEVICE = {
  look: 'the card’s fill, edge and focus ring, each type’s layout, its words’ and icons’ ink, and the placeholders',
  about: ABOUT,
  title: 'contentName',
  alsoTitle: ['headlineContentName', 'rowName'],
  props: [
    {
      name: 'name',
      kind: 'text',
      layer: 'contentName',
      required: true,
      doc: 'The device’s or the batch’s name; its action’s name where it is pressable.',
    },
    {
      name: 'details',
      kind: 'text',
      layer: 'details',
      doc: 'What and where it is, in a line.',
    },
    {
      name: 'count',
      kind: 'text',
      layer: 'contentCount',
      also: ['rowCount'],
      doc: 'How many a batch holds (“3 devices”).',
    },
    {
      name: 'tag',
      kind: 'node',
      layer: 'tag',
      also: ['headlineTag'],
      dart: 'String',
      doc: 'Its health, in a SOLAR Tag’s words.',
    },
    {
      name: 'tagStatus',
      kind: 'node',
      react: "TagProps['status']",
      dart: 'SolarTagStatus',
      doc: 'The health’s status; success by default.',
    },
    {
      name: 'action',
      kind: 'slot',
      layer: 'button',
      shown: true,
      doc: 'The caller’s action: a SOLAR Button, sm and secondary (“Try again”).',
    },
    {
      name: 'devices',
      kind: 'slot',
      layer: 'devices',
      doc: 'A batch’s devices: the caller’s SOLAR Dropdown, md.',
    },
  ],
  imports: "import { Tag, type TagProps } from './Tag.js';",
  render: `// Its health, a SOLAR Tag in the status the caller gives, with its dot on one device's card.
tag: ({ className: c, style }: DrawnLayer) => (
  <span className={c} style={style}>
    <Tag status={tagStatus ?? 'success'} indicator>
      {tag}
    </Tag>
  </span>
),
headlineTag: ({ className: c, style }: DrawnLayer) => (
  <span className={c} style={style}>
    <Tag status={tagStatus ?? 'success'}>{tag}</Tag>
  </span>
),`,
  importsDart: `import '../generated/components/tag.dart';
import 'solar_tag.dart';`,
  composed: `// Its health, a SOLAR Tag in the status the caller gives, with its dot on one device's card.
'tag': SolarTag(
  status: tagStatus ?? SolarTagStatus.success,
  label: tag,
  indicator: true,
),
'headlineTag': SolarTag(status: tagStatus ?? SolarTagStatus.success, label: tag),`,
  wraps: "'details': TextAlign.start",
  // Figma draws loading as a state of the card, not an axis.
  loadingState: true,
};

export default {
  name: 'Device Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shells/card.mjs).
    slots: 'drawn',
    resets: cardResets('Device Card', {
      wrap: ['details'],
      fixed: ['icon', 'headlineIcon', 'tag', 'headlineTag', 'button'],
      extra: { [`& .${P}-devices > *`]: { width: '100%' } },
    }),
    states: cardStates('Device Card', { loading: true }),
    overlaps: { focus: ['hover'] },
  },
  flutter: {},
  shells: {
    label: 'name',
    slots: {
      name: { react: 'name', flutter: 'name' },
      details: { react: 'details', flutter: 'details' },
      count: { react: 'count', flutter: 'count' },
      button: { react: 'action', flutter: 'action' },
      devices: { react: 'devices', flutter: 'devices' },
    },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return cardReact(spec, DEVICE);
    },
    flutter: (spec) => {
      requireLayers(spec);
      return cardFlutter(spec, DEVICE);
    },
  },
};
