import oracle from '../../../../../spec/verify/divider.json';
import { Divider, type DividerProps } from '../../../src/Divider.js';
import type { VisualCase } from './types.js';

// A divider fills what it is given; each case gives it Figma's sample box (320 wide, or 32 tall),
// whose size the oracle excuses by the overlay's decision.
export default {
  oracle,
  render: (v) => {
    const props = v.props as DividerProps;
    return (
      <Divider
        {...props}
        sx={props.orientation === 'vertical' ? { height: 32 } : { width: 320 }}
      >
        {props.type === 'with-label' ? 'Or' : undefined}
      </Divider>
    );
  },
} satisfies VisualCase;
