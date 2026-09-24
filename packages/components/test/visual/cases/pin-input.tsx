import oracle from '../../../../../spec/verify/pin-input.json';
import { PINInput, type PINInputProps } from '../../../src/PINInput.js';
import type { VisualCase } from './types.js';

// Figma's six cells and words: its code, 1 to 6, where it is filled (the oracle's content), its
// placeholders otherwise, and its error's words where it is in error.
export default {
  oracle,
  render: (v) => (
    <PINInput
      {...(v.props as Pick<PINInputProps, 'size' | 'disabled' | 'error'>)}
      label="Label"
      mandatory
      helper="Helper text"
      errorMessage="Code is incorrect or expired."
      value={v.content?.includes('value') ? '123456' : ''}
      onChange={() => {}}
    />
  ),
} satisfies VisualCase;
