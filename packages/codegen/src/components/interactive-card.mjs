/**
 * SOLAR Interactive Card, beyond its IR: where MUI draws each layer and marks each state, and the
 * two shell templates, rendered into the shells by \`solar:codegen\` on every run. One file per
 * component, so adding one edits nothing shared; \`src/components/index.mjs\` finds them.
 *
 * A selectable row card of the family (`src/shells/card.mjs`): a drag handle, one control that
 * selects it (a Checkbox, a Radio or a Toggle, the caller's choice), its headline and
 * description, and the caller's actions; pressable where it is given something to do, and drawn
 * as it is dragged.
 */

import {
  cardFlutter,
  cardReact,
  cardResets,
  cardStates,
} from '../shells/card.mjs';

const R = 'SolarInteractiveCardRecipe';

const requireLayers = (spec) => {
  for (const slot of [
    'dragHandle',
    'toggle',
    'radioButton',
    'checkbox',
    'icon',
    'description',
    'actions',
    'title',
  ])
    if (!spec.slots[slot])
      throw new Error(`Interactive Card: the IR has no ${slot} slot`);
  if (!spec.api.control?.values)
    throw new Error('Interactive Card: the IR has no control prop');
};

const ABOUT = `One choice in a list of them (a room to book, a setting): a drag handle where it can be
reordered (\`dragHandle\`), the \`control\` that selects it (a Checkbox, a Radio or a Toggle,
following \`selected\` and calling \`onSelectedChange\`, named by \`selectLabel\` or its title), an
\`icon\` and its \`title\`, its \`description\`, and the caller's \`actions\` (SOLAR Icon Buttons, sm).
\`dragging\` draws it lifted, as it moves. Given \`onClick\` or \`href\`, it is pressable: its title
is the button or link, and its hit area the whole card, its control and actions reachable above it;
it is focused only then.`;

const CARD = {
  look: 'the card’s fill, edge and focus ring by selection and drag, its words’ and icon’s ink, and the controls it shows',
  about: ABOUT,
  title: 'title',
  selected: 'selected',
  props: [
    {
      name: 'title',
      kind: 'text',
      layer: 'title',
      required: true,
      doc: 'What it is, its headline; its action’s name where it is pressable.',
    },
    {
      name: 'icon',
      kind: 'icon',
      layer: 'icon',
      shown: true,
      doc: 'An icon before the title.',
    },
    {
      name: 'description',
      kind: 'text',
      layer: 'description',
      doc: 'What it means.',
    },
    {
      name: 'actions',
      kind: 'slot',
      layer: 'actions',
      shown: true,
      only: 'react',
      doc: 'The caller’s actions: SOLAR Icon Buttons, sm, square and secondary.',
    },
    {
      name: 'actions',
      kind: 'node',
      dart: 'List<Widget>',
      only: 'flutter',
      doc: 'The caller’s actions: SOLAR Icon Buttons, sm, square and secondary, laid out as Figma lays them out.',
    },
    {
      name: 'dragHandle',
      kind: 'node',
      react: 'boolean',
      dart: 'bool',
      doc: 'Shows a drag handle, where the list can be reordered.',
    },
    {
      name: 'onSelectedChange',
      kind: 'node',
      react: '(selected: boolean) => void',
      dart: 'ValueChanged<bool>',
      only: 'react',
      doc: 'Called with whether it is to be selected, by its control.',
    },
    {
      name: 'onSelectedChanged',
      kind: 'node',
      dart: 'ValueChanged<bool>',
      only: 'flutter',
      doc: 'Called with whether it is to be selected, by its control.',
    },
    {
      name: 'selectLabel',
      kind: 'node',
      react: 'string',
      dart: 'String',
      doc: 'The control’s accessible name; its title, where that is words.',
    },
  ],
  imports: `import { Checkbox } from './Checkbox.js';
import { DragHandle, type DragHandleProps } from './DragHandle.js';
import { Radio } from './Radio.js';
import { Toggle } from './Toggle.js';`,
  prelude: `// The control is named by the caller, or by the title where it is words.
const named = selectLabel ?? (typeof title === 'string' ? title : 'Select');
const handle = composed.dragHandle;`,
  present: {
    dragHandle: 'dragHandle === true',
    checkbox: "control === 'checkbox'",
    radioButton: "control === 'radio'",
    toggle: "control === 'toggle'",
  },
  render: `// The drag handle, a SOLAR DragHandle of the size the recipe names.
dragHandle: ({ className: c, style }: DrawnLayer) => (
  <span className={c} style={style}>
    <DragHandle size={handle['variant.size'] as DragHandleProps['size']} />
  </span>
),
// The control that selects it, SOLAR's own, following selected.
checkbox: ({ className: c, style }: DrawnLayer) => (
  <span className={c} style={style}>
    <Checkbox
      checked={selected}
      onChange={(e) => onSelectedChange?.(e.target.checked)}
      slotProps={{ input: { 'aria-label': named } }}
    />
  </span>
),
radioButton: ({ className: c, style }: DrawnLayer) => (
  <span className={c} style={style}>
    <Radio
      checked={selected}
      onChange={() => onSelectedChange?.(true)}
      slotProps={{ input: { 'aria-label': named } }}
    />
  </span>
),
toggle: ({ className: c, style }: DrawnLayer) => (
  <span className={c} style={style}>
    <Toggle
      selected={selected}
      onChange={(_, on) => onSelectedChange?.(on)}
      slotProps={{ input: { 'aria-label': named } }}
    />
  </span>
),`,
  importsDart: `import '../generated/components/draghandle.dart';
import 'solar_checkbox.dart';
import 'solar_draghandle.dart';
import 'solar_radio.dart';
import 'solar_toggle.dart';`,
  presentDart: {
    actions: 'actions != null',
    dragHandle: 'dragHandle == true',
    checkbox: 'control == SolarInteractiveCardControl.checkbox',
    radioButton: 'control == SolarInteractiveCardControl.radio',
    toggle: 'control == SolarInteractiveCardControl.toggle',
  },
  composed: `// The drag handle, a SOLAR DragHandle of the size the recipe names.
'dragHandle': SolarDragHandle(
  size: SolarDragHandleSize.values.byName(
    ${R}.lookup('dragHandle.variant.size', p, states)!.substring(2),
  ),
),
// The control that selects it, SOLAR's own, following selected; a Radio in a group of its own.
'checkbox': SolarCheckbox(
  checked: selected,
  onChanged: onSelectedChanged,
  semanticLabel: selectLabel ?? title,
),
'radioButton': RadioGroup<bool>(
  groupValue: selected ? true : null,
  onChanged: (_) => onSelectedChanged?.call(true),
  child: SolarRadio<bool>(value: true, semanticLabel: selectLabel ?? title),
),
'toggle': SolarToggle(
  selected: selected,
  onChanged: onSelectedChanged,
  semanticLabel: selectLabel ?? title,
),`,
  wraps: "'title': TextAlign.start, 'description': TextAlign.start",
  contentDart: "{'actions': ?actions}",
};

export default {
  name: 'Interactive Card',
  mui: {
    // The shell draws every layer itself, each with a class of its own (shells/card.mjs).
    slots: 'drawn',
    resets: cardResets('Interactive Card', {
      wrap: ['title', 'description'],
      icons: ['icon'],
      fixed: ['dragHandle', 'toggle', 'radioButton', 'checkbox', 'actions'],
    }),
    states: cardStates('Interactive Card', { selected: true }),
    overlaps: { focus: ['hover', 'selected'], hover: ['selected'] },
  },
  flutter: {},
  shells: {
    label: 'title',
    slots: {
      dragHandle: { react: 'dragHandle', flutter: 'dragHandle' },
      toggle: { react: 'control', flutter: 'control' },
      radioButton: { react: 'control', flutter: 'control' },
      checkbox: { react: 'control', flutter: 'control' },
      icon: { react: 'icon', flutter: 'icon' },
      description: { react: 'description', flutter: 'description' },
      actions: { react: 'actions', flutter: 'actions' },
      title: { react: 'title', flutter: 'title' },
    },
  },
  templates: {
    react: (spec) => {
      requireLayers(spec);
      return cardReact(spec, CARD);
    },
    flutter: (spec) => {
      requireLayers(spec);
      return cardFlutter(spec, CARD);
    },
  },
};
