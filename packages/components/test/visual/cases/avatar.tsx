import oracle from '../../../../../spec/verify/avatar.json';
import { Avatar, type AvatarProps } from '../../../src/Avatar.js';
import { picture } from './probes.js';
import type { VisualCase } from './types.js';

// The colour is the caller's: each variant is drawn in the colour Figma samples there (the
// oracle's `color`), and a photo or a logo shows a stand-in picture.
export default {
  oracle,
  render: (v) => (
    <Avatar
      {...(v.props as Omit<AvatarProps, 'name'>)}
      name="Dana Scully"
      src={picture}
    />
  ),
} satisfies VisualCase;
