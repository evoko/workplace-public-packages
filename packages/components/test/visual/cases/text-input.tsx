import oracle from '../../../../../spec/verify/text-input.json';
import { TextInput, type TextInputProps } from '../../../src/TextInput.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Every part shown with Figma's own words: holding Figma's "Text" where it is filled (the oracle's
// content), and showing it as the placeholder otherwise; both icons probes.
export default {
  oracle,
  render: (v) => (
    <TextInput
      {...(v.props as TextInputProps)}
      label="Label"
      mandatory
      helper="Helper text"
      leadingIcon={icon}
      trailingIcon={icon}
      value={v.content?.includes('value') ? 'Text' : ''}
      onChange={() => {}}
      placeholder="Text"
    />
  ),
} satisfies VisualCase;
