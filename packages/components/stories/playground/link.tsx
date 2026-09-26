/**
 * Link's Playground: its words the `label` extra, its icons from their controls (both the sample at
 * first, as Figma shows both). A click is logged and goes nowhere; a disabled link is inert, as the
 * shell makes it.
 */

import { Link, type LinkProps } from '../../src/Link.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const disabled = p.flag('disabled');
    return (
      <Link
        size={p.choice<NonNullable<LinkProps['size']>>('size')}
        disabled={disabled}
        leadingIcon={p.icon('leadingIcon')}
        trailingIcon={p.icon('trailingIcon')}
        href="#"
        onClick={(event) => {
          event.preventDefault();
          if (!disabled) p.log('onClick');
        }}
      >
        {p.text('label')}
      </Link>
    );
  },
} satisfies PlaygroundBuilder;
