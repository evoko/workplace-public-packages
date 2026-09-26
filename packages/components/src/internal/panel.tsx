/**
 * A picker's panel (Select's, Dropdown's): MUI's Menu, portaled into a host the picker draws in its
 * own root, first of its children, where the picker's recipe reaches it (Select's panel is its own
 * layer, styled from its root) and the visual check measures it.
 *
 * Not drawn in place (`disablePortal`): MUI's modal then hides from assistive technology every
 * child of the page's body but its own element, which sits deep in the page, so the open listbox
 * was hidden with the page around it. Portaled into the host, the modal hides the host's other
 * children, of which it has none: the listbox is announced. The host is its own container, so it
 * lays nothing out (`display: contents`, the picker's reset) and the panel's stacking is no longer
 * trapped in its field's.
 *
 * The page is not locked while the panel is open (the modal would lock its container, the host,
 * which scrolls nothing): the panel follows its field as the page, or any box around it, scrolls.
 *
 * Hand written and internal: the pickers share it.
 */

import type { PopoverActions } from '@mui/material/Popover';
import type { MenuProps } from '@mui/material/Menu';
import { useForkRef } from '@mui/material/utils';
import { useEffect, useRef, type ReactNode, type Ref } from 'react';

/** The host's class, `Solar<Name>-panelHost`, which the picker's reset lays out as nothing. */
export const panelHostClass = (prefix: string) => `${prefix}-panelHost`;

/**
 * The host to draw first in the picker's root, and the Menu's props that portal the panel into it.
 * The host comes first so that its element is attached before the Menu, later in the tree, asks
 * for it while it opens (a panel open from the start).
 */
export function usePickerPanel(
  prefix: string,
  open: boolean,
  action?: Ref<PopoverActions>,
): {
  host: ReactNode;
  menuProps: Pick<
    MenuProps,
    'container' | 'disablePortal' | 'disableScrollLock' | 'action'
  >;
} {
  const host = useRef<HTMLDivElement>(null);
  const own = useRef<PopoverActions>(null);
  const actions = useForkRef(own, action);
  useEffect(() => {
    if (!open) return undefined;
    const follow = () => own.current?.updatePosition();
    // In the capture phase, to hear a scroll of any box, which does not bubble.
    window.addEventListener('scroll', follow, true);
    return () => window.removeEventListener('scroll', follow, true);
  }, [open]);
  return {
    host: <div ref={host} className={panelHostClass(prefix)} />,
    menuProps: {
      container: () => host.current,
      disablePortal: false,
      disableScrollLock: true,
      action: actions,
    },
  };
}
