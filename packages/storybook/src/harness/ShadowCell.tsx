import createCache, { type EmotionCache } from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { cacheKey } from './cache-key';
import { copyModeToHost } from './mode';
import type { ModeSwitch } from './spec';
import { FREEZE_CSS, FREEZE_MARK } from './styles';

export interface ShadowCellProps {
  /** Unique within the story; becomes `data-parity-cell` and the sentinel's key. */
  id: string;
  /** Stylesheets placed in the shadow root before the content. */
  css?: readonly string[];
  /** Raw HTML content (CSS and Tailwind cells). */
  html?: string;
  /** React content rendered through a portal with its own Emotion cache (MUI cells). */
  children?: React.ReactNode;
  /** Selector, inside the cell, of the element interactions target. */
  rootSelector: string;
  /** How a color mode is spelled, so the host can carry the document's mode. */
  mode: ModeSwitch;
}

interface Mount {
  container: HTMLElement;
  cache: EmotionCache | null;
}

const EMPTY: readonly string[] = [];

/**
 * One isolated cell: an open shadow root with the target's stylesheets and
 * either raw HTML or a React subtree. The host carries the document's color
 * mode, because the target stylesheets inside the cell are `:host`-scoped. A
 * hidden focusable sentinel precedes the host so `Tab` from it lands on the
 * cell's first focusable element with `:focus-visible` matching. After mount
 * the root element is marked with `data-parity-root="<id>"` so Playwright can
 * address it through the shadow boundary.
 */
export function ShadowCell({
  id,
  css = EMPTY,
  html,
  children,
  rootSelector,
  mode,
}: ShadowCellProps) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const [mount, setMount] = React.useState<Mount | null>(null);
  const hasChildren = children !== undefined;

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }
    copyModeToHost(host, mode);
    const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    root.replaceChildren();
    const freeze = document.createElement('style');
    freeze.setAttribute(FREEZE_MARK, '');
    freeze.textContent = FREEZE_CSS;
    root.appendChild(freeze);
    for (const text of css) {
      const style = document.createElement('style');
      style.textContent = text;
      root.appendChild(style);
    }
    const container = document.createElement('div');
    if (html !== undefined) {
      container.innerHTML = html;
    }
    root.appendChild(container);
    setMount({
      container,
      // Raw-HTML cells render no Emotion styles, so they need no cache.
      cache: hasChildren
        ? createCache({
            key: cacheKey(id),
            container: root as unknown as HTMLElement,
            prepend: true,
          })
        : null,
    });
  }, [id, html, css, mode, hasChildren]);

  React.useEffect(() => {
    if (!mount) {
      return;
    }
    const mark = () => {
      const el = mount.container.querySelector(rootSelector);
      if (el) {
        el.setAttribute('data-parity-root', id);
      }
    };
    mark();
    const observer = new MutationObserver(mark);
    observer.observe(mount.container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [mount, rootSelector, id]);

  return (
    <>
      <button
        type="button"
        data-parity-sentinel={id}
        aria-hidden="true"
        tabIndex={-1}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />
      <div ref={hostRef} data-parity-cell={id} />
      {mount && mount.cache && hasChildren
        ? createPortal(
            <CacheProvider value={mount.cache}>{children}</CacheProvider>,
            mount.container,
          )
        : null}
    </>
  );
}
