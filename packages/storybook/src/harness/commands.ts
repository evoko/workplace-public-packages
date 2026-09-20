import type { BrowserCommand } from 'vitest/node';

/**
 * Real pointer and keyboard interactions for the parity plays. Selectors are
 * resolved by Playwright, whose CSS engine pierces open shadow roots, so a
 * `[data-parity-root="..."]` attribute set inside a cell is enough.
 */
export const parityCommands = {
  parityHover: (async ({ iframe }, selector: string) => {
    await iframe.locator(selector).hover();
  }) as BrowserCommand<[selector: string]>,
  parityMouseDown: (async ({ iframe, page }, selector: string) => {
    await iframe.locator(selector).hover();
    await page.mouse.down();
  }) as BrowserCommand<[selector: string]>,
  parityMouseUp: (async ({ page }) => {
    await page.mouse.up();
    await page.mouse.move(0, 0);
  }) as BrowserCommand<[]>,
  parityFocusFrom: (async ({ iframe, page }, sentinelSelector: string) => {
    await iframe.locator(sentinelSelector).focus();
    await page.keyboard.press('Tab');
  }) as BrowserCommand<[sentinelSelector: string]>,
  parityBlur: (async ({ iframe }) => {
    await iframe.locator('body').evaluate((body) => {
      (body.ownerDocument.activeElement as HTMLElement | null)?.blur();
    });
  }) as BrowserCommand<[]>,
};
