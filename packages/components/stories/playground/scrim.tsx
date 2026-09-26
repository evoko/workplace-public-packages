/**
 * Scrim's Playground: the layer behind a blocking surface, shown alone: an "Open" button shows it,
 * as the surface's trigger would, and the `open` extra follows it (overlay.tsx). A click on it
 * dismisses it (`onClick`, as a dismissible surface above it takes it); Escape, which the surface
 * above it would take, hides it too, logged `onClose`.
 */

import { useEffect } from 'react';
import { Scrim } from '../../src/Scrim.js';
import { overlayOf } from './overlay.js';
import type { Playground, PlaygroundBuilder } from './types.js';

function ScrimPlayground({ p }: { p: Playground }) {
  const overlay = overlayOf(p);
  const { open, close } = overlay;
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
    // `close` is rebuilt on every render; whether it is shown alone decides the listener.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  return (
    <>
      {overlay.trigger}
      <Scrim open={open} onClick={() => close('onClick')} />
    </>
  );
}

export default {
  render: (p) => <ScrimPlayground p={p} />,
} satisfies PlaygroundBuilder;
