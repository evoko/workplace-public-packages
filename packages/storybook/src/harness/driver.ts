export interface Driver {
  hover(selector: string): Promise<void>;
  mouseDown(selector: string): Promise<void>;
  mouseUp(): Promise<void>;
  focusFrom(sentinelSelector: string): Promise<void>;
  blur(): Promise<void>;
}

// Vitest 4 declares `BrowserCommands` in `vitest/internal/browser`;
// `@vitest/browser/context` only re-exports the `commands` value typed by it,
// so the augmentation must name the declaring module.
declare module 'vitest/internal/browser' {
  interface BrowserCommands {
    parityHover(selector: string): Promise<void>;
    parityMouseDown(selector: string): Promise<void>;
    parityMouseUp(): Promise<void>;
    parityFocusFrom(sentinelSelector: string): Promise<void>;
    parityBlur(): Promise<void>;
  }
}

/**
 * The Playwright-backed commands when running under Vitest browser mode, or
 * null in the Storybook UI, where only attribute-driven states can be
 * compared.
 */
export async function getDriver(): Promise<Driver | null> {
  // Vitest browser mode defines these globals in the page; the Storybook UI does not.
  if (
    !('__vitest_browser_runner__' in globalThis) &&
    !('__vitest_browser__' in globalThis)
  ) {
    return null;
  }
  // `vitest/browser` is a stub module outside browser mode and a virtual one
  // inside it, so it resolves at build time as well: Storybook bundles it as
  // a lazy chunk that is never executed outside Vitest.
  const { commands } = await import('vitest/browser');
  return {
    hover: (s) => commands.parityHover(s),
    mouseDown: (s) => commands.parityMouseDown(s),
    mouseUp: () => commands.parityMouseUp(),
    focusFrom: (s) => commands.parityFocusFrom(s),
    blur: () => commands.parityBlur(),
  };
}
