import oracle from '../../../../../spec/verify/icon-button.json';
import { IconButton, type IconButtonProps } from '../../../src/IconButton.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

export default {
  oracle,
  render: (v) => (
    <IconButton
      {...(v.props as Omit<IconButtonProps, 'icon' | 'aria-label'>)}
      icon={icon}
      aria-label="Icon"
    />
  ),
} satisfies VisualCase;
