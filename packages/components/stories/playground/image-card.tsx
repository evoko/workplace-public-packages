/**
 * Image Card's Playground: its words and states from their controls, a cleared one left out; the
 * sample picture (samples.ts) fills a filled one's image; its More menu the sample actions
 * (cards.ts). Its Checkbox, shown while it is selected and while the pointer or the keyboard is on
 * it, selects it, as an app's grid does: `selected` is set, and the change logged. Pressable, as an
 * app's image is (to open it): its press is logged.
 */

import { ImageCard } from '../../src/ImageCard.js';
import { moreItemsOf } from './cards.js';
import { picture } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => (
    <ImageCard
      filled={p.flag('filled')}
      selected={p.flag('selected')}
      title={p.words('title')}
      subtitle={p.words('subtitle')}
      label={p.words('label')}
      image={picture}
      onSelectedChange={(selected) => {
        p.set('selected', selected);
        p.log('onSelectedChange', selected);
      }}
      moreItems={moreItemsOf(p)}
      onClick={() => p.log('onClick')}
    />
  ),
} satisfies PlaygroundBuilder;
