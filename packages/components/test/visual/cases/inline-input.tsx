import oracle from '../../../../../spec/verify/inline-input.json';
import {
  InlineInput,
  type InlineInputProps,
} from '../../../src/InlineInput.js';
import type { VisualCase } from './types.js';

// Figma's value. Figma's focused, filled and error variants are the edit mode, which the case
// starts in; the check then focuses its input for the focused one.
export default {
  oracle,
  render: (v) => (
    <InlineInput
      {...(v.props as Pick<InlineInputProps, 'error' | 'disabled'>)}
      value="Current value"
      onConfirm={() => false}
      label="Value"
      defaultEditing={
        v.state === 'focus' ||
        v.content?.includes('defaultEditing') ||
        Boolean(v.props.error)
      }
    />
  ),
} satisfies VisualCase;
