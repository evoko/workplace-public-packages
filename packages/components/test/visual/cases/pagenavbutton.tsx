import oracle from '../../../../../spec/verify/pagenavbutton.json';
import {
  PageNavButton,
  type PageNavButtonProps,
} from '../../../src/PageNavButton.js';
import type { VisualCase } from './types.js';

// The button in Figma's direction, with its words.
export default {
  oracle,
  render: (v) => (
    <PageNavButton
      {...(v.props as Pick<PageNavButtonProps, 'direction' | 'disabled'>)}
    />
  ),
} satisfies VisualCase;
