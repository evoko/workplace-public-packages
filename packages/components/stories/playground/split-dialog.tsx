/**
 * Split Dialog's Playground: an "Open" button opens it, as an app's trigger would, and the `open`
 * extra follows it (overlay.tsx); its close button, Escape, a click on the Scrim or either action
 * closes it. Its icon and title from their controls. Its `cta` decides where its left pane and its
 * actions go, so each is shown by the toggle of the slot the cta draws (`left` and `actions` across
 * its foot; `leftRegular` and `actionsRegular` with the actions under the left pane), the shell
 * drawing the one content in whichever. Its panes hold a neutral placeholder, a SOLAR Skeleton each,
 * as the Dialog's content does; its actions Cancel and Continue in a Button Group of the cta's type,
 * each closing it, logged with its words.
 */

import { Button } from '../../src/Button.js';
import { ButtonGroup } from '../../src/ButtonGroup.js';
import { Skeleton } from '../../src/Skeleton.js';
import { SplitDialog, type SplitDialogProps } from '../../src/SplitDialog.js';
import { overlayOf } from './overlay.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const overlay = overlayOf(p);
    const cta = p.choice<NonNullable<SplitDialogProps['cta']>>('cta');
    const regular = cta === 'regular';
    const left = [p.flag('left'), p.flag('leftRegular')];
    const actions = [p.child('actions'), p.child('actionsRegular')];
    const place = regular ? 1 : 0;
    const action = (name: string, prio: 'primary' | 'secondary') => (
      <Button
        size="lg"
        prio={prio}
        onClick={() => overlay.close('onClick', name)}
      >
        {name}
      </Button>
    );
    return (
      <>
        {overlay.trigger}
        <SplitDialog
          open={overlay.open}
          onClose={() => overlay.close()}
          cta={cta}
          icon={p.icon('icon')}
          title={p.text('title')}
          left={left[place] ? <Skeleton /> : undefined}
          right={p.flag('right') ? <Skeleton /> : undefined}
          actions={
            actions[place]!.shown ? (
              <ButtonGroup type={regular ? 'regular' : 'full-width'}>
                {action('Cancel', 'secondary')}
                {action('Continue', 'primary')}
              </ButtonGroup>
            ) : undefined
          }
        />
      </>
    );
  },
} satisfies PlaygroundBuilder;
