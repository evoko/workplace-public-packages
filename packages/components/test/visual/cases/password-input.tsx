import oracle from '../../../../../spec/verify/password-input.json';
import {
  PasswordInput,
  type PasswordInputProps,
} from '../../../src/PasswordInput.js';
import type { VisualCase } from './types.js';

// Figma's words: its label, its helper, and its bullets, held where it is filled (the oracle's
// content) and shown as the placeholder otherwise; the forgot-password link where Figma draws one.
export default {
  oracle,
  render: (v) => (
    <PasswordInput
      {...(v.props as PasswordInputProps)}
      label="Password"
      mandatory
      helper="Helper text"
      forgotPassword={
        v.layers?.forgotPassword?.hidden ? undefined : 'Forgot password?'
      }
      value={v.content?.includes('value') ? '•••••••••' : ''}
      onChange={() => {}}
      placeholder="•••••••••"
    />
  ),
} satisfies VisualCase;
