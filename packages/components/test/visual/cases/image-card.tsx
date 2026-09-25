import oracle from '../../../../../spec/verify/image-card.json';
import { ImageCard, type ImageCardProps } from '../../../src/ImageCard.js';
import { picture } from './probes.js';
import type { VisualCase } from './types.js';

// Figma's words, a stand-in picture, selectable, a More menu, pressable so a hover is reached as
// a user reaches it; as wide as Figma draws it.
export default {
  oracle,
  render: (v) => (
    <ImageCard
      {...(v.props as Pick<ImageCardProps, 'filled' | 'selected'>)}
      title="Title"
      subtitle="Last modified: 2h ago"
      label="Create new"
      image={picture}
      onSelectedChange={() => {}}
      moreItems={[{ label: 'Rename', onSelect: () => {} }]}
      onClick={() => {}}
      style={{ width: 200 }}
    />
  ),
} satisfies VisualCase;
