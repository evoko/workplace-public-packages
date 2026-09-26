/**
 * Launch Card's Playground: its words from their controls, a cleared body left out; its picture the
 * sample (samples.ts), shown by the `image` toggle; its App Icon Workplace's, shown by `appIcon`; its
 * Tag the `tag label` words, shown by `tag`. Its favourite, a SOLAR Icon Button (sm, round,
 * tertiary), sits on the picture, shown by `favourite`, or beside the name where there is none,
 * shown by `favouriteNoImage`. Its actions, shown by `actions`, are a Button Group of Learn more and
 * Open, as the README composes them. Every click is logged, a Button's with its words; pressable, as
 * an app's launcher is: its press is logged.
 */

import { IconStar, appIconWorkplace } from '@bwp-web/assets';
import { Button } from '../../src/Button.js';
import { ButtonGroup } from '../../src/ButtonGroup.js';
import { IconButton } from '../../src/IconButton.js';
import { LaunchCard } from '../../src/LaunchCard.js';
import { picture } from './samples.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const image = p.child('image').shown;
    const onImage = p.child('favourite').shown;
    const beside = p.child('favouriteNoImage').shown;
    const tag = p.child('tag');
    return (
      <LaunchCard
        name={p.text('name')}
        body={p.words('bodyText')}
        appIcon={
          p.child('appIcon').shown ? (
            <img src={appIconWorkplace} alt="" />
          ) : undefined
        }
        tag={tag.shown && tag.text ? tag.text : undefined}
        image={image ? picture : undefined}
        favourite={
          (image ? onImage : beside) ? (
            <IconButton
              size="sm"
              shape="round"
              prio="tertiary"
              icon={<IconStar />}
              aria-label="Favourite"
              onClick={() => p.log('onClick', 'favourite')}
            />
          ) : undefined
        }
        actions={
          p.child('actions').shown ? (
            <ButtonGroup>
              <Button
                prio="secondary"
                onClick={() => p.log('onClick', 'Learn more')}
              >
                Learn more
              </Button>
              <Button onClick={() => p.log('onClick', 'Open')}>Open</Button>
            </ButtonGroup>
          ) : undefined
        }
        onClick={() => p.log('onClick')}
      />
    );
  },
} satisfies PlaygroundBuilder;
