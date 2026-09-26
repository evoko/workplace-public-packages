/**
 * Tag's Playground: its status, inversion, words and icon from their controls; the `indicator`
 * extra shows its status dot (never on an inverted tag, which Figma does not draw, so it is left
 * off there), and `closable` gives it a close button, whose click is logged. Its type follows from
 * these, as the shell derives it. Without words it is an icon tag, named "Label".
 */

import { Tag, type TagLook, type TagProps } from '../../src/Tag.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const indicator = p.flag('indicator');
    const look: TagLook = p.flag('invert')
      ? { invert: true }
      : { invert: false, indicator };
    const label = p.words('label');
    return (
      <Tag
        status={p.choice<NonNullable<TagProps['status']>>('status')}
        {...look}
        icon={p.icon('icon')}
        onClose={p.flag('closable') ? () => p.log('onClose') : undefined}
        aria-label={label ? undefined : 'Label'}
      >
        {label}
      </Tag>
    );
  },
} satisfies PlaygroundBuilder;
