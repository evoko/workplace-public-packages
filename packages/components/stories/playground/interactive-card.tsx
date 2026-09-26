/**
 * Interactive Card's Playground: its words, icon and states from their controls. Its control is the
 * `control` select's, drawn while that control's slot toggle (`checkbox`, `radioButton`, `toggle`)
 * is on; its drag handle shown by `dragHandle`; its actions, shown by `actions`, three sample SOLAR
 * Icon Buttons (sm, square, secondary, as the README composes them), each click logged with its
 * name. The card is a choice, as in an app's list of them: its control, or a press on the card,
 * selects it (a radio's press only chooses it), which sets `selected` and is logged.
 */

import { IconDelete, IconDuplicate, IconEdit } from '@bwp-web/assets';
import { IconButton } from '../../src/IconButton.js';
import {
  InteractiveCard,
  type InteractiveCardProps,
} from '../../src/InteractiveCard.js';
import type { PlaygroundBuilder } from './types.js';

type Control = NonNullable<InteractiveCardProps['control']>;

/** Each control's slot, whose toggle shows it. */
const SLOT: Record<Exclude<Control, 'none'>, string> = {
  checkbox: 'checkbox',
  radio: 'radioButton',
  toggle: 'toggle',
};

/** The sample actions, by name. */
const ACTIONS = [
  ['Edit', <IconEdit key="edit" />],
  ['Duplicate', <IconDuplicate key="duplicate" />],
  ['Delete', <IconDelete key="delete" />],
] as const;

export default {
  render: (p) => {
    const control = p.choice<Control>('control');
    const shown = {
      checkbox: p.child('checkbox').shown,
      radioButton: p.child('radioButton').shown,
      toggle: p.child('toggle').shown,
    } as Record<string, boolean>;
    const drawn = control !== 'none' && shown[SLOT[control]] ? control : 'none';
    const selected = p.flag('selected');
    return (
      <InteractiveCard
        selected={selected}
        dragging={p.flag('dragging')}
        control={drawn}
        dragHandle={p.child('dragHandle').shown}
        icon={p.icon('icon')}
        title={p.text('title')}
        description={p.words('description')}
        actions={
          p.child('actions').shown
            ? ACTIONS.map(([name, icon]) => (
                <IconButton
                  key={name}
                  size="sm"
                  shape="square"
                  prio="secondary"
                  icon={icon}
                  aria-label={name}
                  onClick={() => p.log('onClick', name)}
                />
              ))
            : undefined
        }
        onSelectedChange={(next) => {
          p.set('selected', next);
          p.log('onSelectedChange', next);
        }}
        onClick={() => {
          p.set('selected', drawn === 'radio' ? true : !selected);
          p.log('onClick');
        }}
      />
    );
  },
} satisfies PlaygroundBuilder;
