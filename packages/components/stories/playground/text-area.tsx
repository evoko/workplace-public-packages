/**
 * Text Area's Playground: its words the `value` extra, which typing sets; its label, helper and
 * size from their controls, a cleared label or helper left out, and mandatory while `mandatory`
 * holds any text (the star's layer), as Text Input's. The footer's toggle shows or hides the helper
 * and the count together, as Figma's does. The count shows while `charCount` holds words, which say
 * what it counts against: Figma's "0/500" is a count of at most 500, the number after the slash
 * (none, the count alone). Its buttons are SOLAR Icon Buttons at sm, shown by their toggles: the
 * call to action a primary send, disabled while there is nothing to send, and the attachment a
 * secondary attach; a click on either is logged with its slot. Unlabelled, it is named "Label".
 */

import { IconAttachment, IconSend } from '@bwp-web/assets';
import { IconButton } from '../../src/IconButton.js';
import { TextArea, type TextAreaProps } from '../../src/TextArea.js';
import type { PlaygroundBuilder } from './types.js';

/** The most characters the count's words name, after a slash ("0/500"), or none. */
const maxOf = (count: string | undefined) => {
  const max = count?.match(/\/\s*(\d+)\s*$/)?.[1];
  return max === undefined ? undefined : Number(max);
};

export default {
  render: (p) => {
    const disabled = p.flag('disabled');
    const label = p.words('label');
    const value = p.text('value');
    const footer = p.flag('footer');
    const helper = p.words('helper');
    const count = p.words('charCount');
    const cta = p.child('cta').shown;
    const attachment = p.child('attachment').shown;
    return (
      <TextArea
        size={p.choice<NonNullable<TextAreaProps['size']>>('size')}
        disabled={disabled}
        error={p.flag('error')}
        label={label}
        mandatory={p.words('mandatory') !== undefined}
        helper={footer ? helper : undefined}
        charCount={footer && count !== undefined}
        maxLength={footer ? maxOf(count) : undefined}
        cta={
          cta ? (
            <IconButton
              size="sm"
              shape="square"
              prio="primary"
              icon={<IconSend />}
              aria-label="Send"
              disabled={disabled || value === ''}
              onClick={() => p.log('onClick', 'cta')}
            />
          ) : undefined
        }
        attachment={
          attachment ? (
            <IconButton
              size="sm"
              shape="square"
              prio="secondary"
              icon={<IconAttachment />}
              aria-label="Attach"
              disabled={disabled}
              onClick={() => p.log('onClick', 'attachment')}
            />
          ) : undefined
        }
        placeholder="Enter text..."
        value={value}
        onChange={(event) => {
          p.set('value', event.target.value);
          p.log('onChange', event.target.value);
        }}
        inputProps={label ? undefined : { 'aria-label': 'Label' }}
      />
    );
  },
} satisfies PlaygroundBuilder;
