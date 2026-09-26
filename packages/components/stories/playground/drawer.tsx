/**
 * Drawer's Playground: an "Open" button opens it, as an app's trigger would, and the `open` extra
 * follows it (overlay.tsx); its close button, Escape, a click on the Scrim or either action closes
 * it. Its title from its control; its content a neutral placeholder, a SOLAR Skeleton, as the
 * Dialog's, shown by the `content` toggle; its footer, shown by the `cta` toggle, Cancel and
 * Continue in a full-width Button Group, each closing it, logged with its words.
 */

import { Button } from '../../src/Button.js';
import { ButtonGroup } from '../../src/ButtonGroup.js';
import { Drawer } from '../../src/Drawer.js';
import { Skeleton } from '../../src/Skeleton.js';
import { overlayOf } from './overlay.js';
import type { PlaygroundBuilder } from './types.js';

export default {
  render: (p) => {
    const overlay = overlayOf(p);
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
        <Drawer
          open={overlay.open}
          onClose={() => overlay.close()}
          title={p.text('title')}
          actions={
            p.child('cta').shown ? (
              <ButtonGroup type="full-width">
                {action('Cancel', 'secondary')}
                {action('Continue', 'primary')}
              </ButtonGroup>
            ) : undefined
          }
        >
          {p.flag('content') ? <Skeleton /> : undefined}
        </Drawer>
      </>
    );
  },
} satisfies PlaygroundBuilder;
