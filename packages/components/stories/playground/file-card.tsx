/**
 * File Card's Playground: its type from its control; a file's name, when it changed and its type's
 * icon, or the create tile's words (`label`, the shell's title for the tile), from theirs; its More
 * menu the sample actions (cards.ts). Pressable, as an app's file grid is: its press is logged.
 */

import { FileCard, type FileCardProps } from '../../src/FileCard.js';
import { moreItemsOf } from './cards.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const type = p.choice<NonNullable<FileCardProps['type']>>('type');
    const title = p.text('title');
    const meta = p.text('meta');
    const label = p.text('label');
    return (
      <FileCard
        type={type}
        title={type === 'create' ? label : title}
        meta={type === 'create' ? undefined : meta}
        fileIcon={p.icon('fileIcon')}
        moreItems={moreItemsOf(p)}
        onClick={() => p.log('onClick')}
      />
    );
  },
} satisfies PlaygroundBuilder;
