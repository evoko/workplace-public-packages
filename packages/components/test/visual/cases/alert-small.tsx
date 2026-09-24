import oracle from '../../../../../spec/verify/alert-small.json';
import { AlertSmall, type AlertSmallProps } from '../../../src/AlertSmall.js';
import type { VisualCase } from './types.js';

// Every slot filled with Figma's own words, so each look is measured.
export default {
  oracle,
  render: (v) => (
    <AlertSmall
      {...(v.props as AlertSmallProps)}
      title="Label"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      action="Action"
      onAction={() => {}}
    />
  ),
} satisfies VisualCase;
