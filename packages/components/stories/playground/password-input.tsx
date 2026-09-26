/**
 * Password Input's Playground: its words the `value` extra, which typing sets (logged as Text
 * Input's are: a sample the tester types, which the `value` control shows anyway); its size and
 * states from their controls. Its label is shown by the `label` toggle, its words the `label text`
 * extra (the IR holds the label as a toggle alone), a cleared one left out; mandatory while
 * `mandatory` holds any text, as Text Input's. The helper and the forgot-password link from their
 * controls, a cleared one left out; the link is a SOLAR Link, which the app points at its reset
 * flow, its click logged. The eye shows and hides the words inside the shell, which gives no
 * callback, so nothing is logged for it. Unlabelled, it is named "Password".
 */

import { Link } from '../../src/Link.js';
import {
  PasswordInput,
  type PasswordInputProps,
} from '../../src/PasswordInput.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const words = p.words('label text');
    const label = p.child('label').shown ? words : undefined;
    const forgotPassword = p.words('forgotPassword');
    return (
      <PasswordInput
        size={p.choice<NonNullable<PasswordInputProps['size']>>('size')}
        disabled={p.flag('disabled')}
        error={p.flag('error')}
        label={label}
        mandatory={p.words('mandatory') !== undefined}
        helper={p.words('helper')}
        forgotPassword={
          forgotPassword ? (
            <Link
              href="#"
              onClick={(event) => {
                event.preventDefault();
                p.log('onClick', 'forgotPassword');
              }}
            >
              {forgotPassword}
            </Link>
          ) : undefined
        }
        placeholder="•••••••••"
        value={p.text('value')}
        onChange={(event) => {
          p.set('value', event.target.value);
          p.log('onChange', event.target.value);
        }}
        inputProps={label ? undefined : { 'aria-label': 'Password' }}
      />
    );
  },
} satisfies PlaygroundBuilder;
