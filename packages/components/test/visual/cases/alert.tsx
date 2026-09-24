import oracle from '../../../../../spec/verify/alert.json';
import { Alert, type AlertProps } from '../../../src/Alert.js';
import type { VisualCase } from './types.js';

// Every slot filled with Figma's own words, so each look is measured.
export default {
  oracle,
  render: (v) => (
    <Alert
      {...(v.props as AlertProps)}
      title="Label"
      description="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
      action="Action"
      onAction={() => {}}
    />
  ),
} satisfies VisualCase;
