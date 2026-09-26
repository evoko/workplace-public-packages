/**
 * Launch Card Full Screen's Playground: its words from their controls, a cleared intro left out; the
 * `features` extra's count of Figma's sample paragraphs; the sample picture (samples.ts); its App
 * Icon Workplace's, shown by `appIcon`; its favourite, shown by `favourite`, a SOLAR Icon Button
 * (md, round, tertiary); its action, shown by `action`, a SOLAR Button, "Open". Each click is logged
 * with its name.
 */

import { IconStar, appIconWorkplace } from '@bwp-web/assets';
import { Button } from '../../src/Button.js';
import { IconButton } from '../../src/IconButton.js';
import { LaunchCardFullScreen } from '../../src/LaunchCardFullScreen.js';
import { features, picture } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const shownFeatures = p.whole('features');
    return (
      <LaunchCardFullScreen
        name={p.text('name')}
        intro={p.words('intro')}
        features={[
          shownFeatures > 0 ? features[0] : undefined,
          shownFeatures > 1 ? features[1] : undefined,
          shownFeatures > 2 ? features[2] : undefined,
        ]}
        image={picture}
        appIcon={
          p.child('appIcon').shown ? (
            <img src={appIconWorkplace} alt="" />
          ) : undefined
        }
        favourite={
          p.child('favourite').shown ? (
            <IconButton
              size="md"
              shape="round"
              prio="tertiary"
              icon={<IconStar />}
              aria-label="Favourite"
              onClick={() => p.log('onClick', 'favourite')}
            />
          ) : undefined
        }
        action={
          p.child('action').shown ? (
            <Button onClick={() => p.log('onClick', 'Open')}>Open</Button>
          ) : undefined
        }
      />
    );
  },
} satisfies PlaygroundBuilder;
