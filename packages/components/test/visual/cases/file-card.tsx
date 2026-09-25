import oracle from '../../../../../spec/verify/file-card.json';
import { FileCard, type FileCardProps } from '../../../src/FileCard.js';
import { icon } from './probes.js';
import type { VisualCase } from './types.js';

// Figma's words, an icon probe for the file's type, a More menu, pressable so its focus is
// reached as a user reaches it; as wide as Figma draws it.
export default {
  oracle,
  render: (v) => (
    <FileCard
      {...(v.props as Pick<FileCardProps, 'type'>)}
      title={v.props.type === 'create' ? 'New design' : 'File name'}
      meta="Edited just now"
      fileIcon={icon}
      moreItems={[{ label: 'Rename', onSelect: () => {} }]}
      onClick={() => {}}
      style={{ width: 308 }}
    />
  ),
} satisfies VisualCase;
