import oracle from '../../../../../spec/verify/tag.json';
import { Tag, type TagProps } from '../../../src/Tag.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Given what makes Figma's type (the oracle's content): the words, an icon probe, the status dot,
// or a close button.
export default {
  oracle,
  render: (v) => {
    const has = (c: string) => v.content?.includes(c) ?? false;
    const props = {
      ...(v.props as Pick<TagProps, 'status'>),
      ...(v.props.invert
        ? { invert: true as const }
        : { indicator: has('indicator') }),
    };
    return (
      <Tag
        {...props}
        icon={has('icon') ? icon : undefined}
        onClose={has('onClose') ? () => {} : undefined}
        aria-label={has('label') ? undefined : 'Tag'}
      >
        {has('label') ? 'Label' : undefined}
      </Tag>
    );
  },
} satisfies VisualCase;
