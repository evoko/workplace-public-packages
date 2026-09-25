import oracle from '../../../../../spec/verify/text-area.json';
import { IconButton } from '../../../src/IconButton.js';
import { TextArea, type TextAreaProps } from '../../../src/TextArea.js';
import { icon } from './probes.js';
import type { OracleVariant, VisualCase } from './types.js';

// Every part shown with Figma's own words: holding Figma's placeholder where it is filled (the
// oracle's content), and showing it as the placeholder otherwise; its count against Figma's 500;
// both Icon Buttons as Figma draws them in the variant.
const button = (v: OracleVariant, layer: string) => {
  const b = v.layers?.[layer]?.variant ?? {};
  return (
    <IconButton
      size={b.size as 'sm'}
      shape={b.shape as 'square'}
      prio={b.prio as 'primary'}
      disabled={b.state === 'disabled'}
      aria-label="Icon"
      icon={icon}
    />
  );
};

export default {
  oracle,
  render: (v) => (
    <TextArea
      {...(v.props as TextAreaProps)}
      label="Label"
      mandatory
      helper="Helper text"
      charCount
      maxLength={500}
      cta={button(v, 'cta')}
      attachment={button(v, 'attachment')}
      value={v.content?.includes('value') ? 'Enter text...' : ''}
      onChange={() => {}}
      placeholder="Enter text..."
    />
  ),
} satisfies VisualCase;
