import cssPackage from '@bwp-web/styles-css/dist/styles.css?inline';

import type { TargetId } from './spec';
import tailwindPackage from './tailwind.css?inline';

/** Marks the freeze stylesheet so the comparison can switch it off to read the transition longhands. */
export const FREEZE_MARK = 'data-ds-freeze';

/** Kills transitions and animations inside a cell so computed values are final. */
export const FREEZE_CSS =
  '*, *::before, *::after { transition: none !important; animation: none !important; }';

/**
 * `:root` plus the compound that may follow it (attribute selectors, classes
 * and pseudo-classes), which is every shape the targets emit: `:root`,
 * `:root[data-x='dark']`, and Tailwind's `:root, :host`.
 */
const ROOT_SELECTOR = /:root((?:\[[^\]]*\]|\.[\w-]+|:[\w-]+(?:\([^)]*\))?)*)/g;

/**
 * Rewrites a target's `:root` rules to `:host` so a cell's own token
 * variables live on its shadow host.
 *
 * Declaring them on the document instead would put the CSS package's and
 * Tailwind's variables in the same place, and the two namespaces are not
 * disjoint: ten names (`--bwp-border-width-1`, `--bwp-duration-fast`,
 * `--bwp-size-control-md`, `--bwp-z-index-modal`, …) are spelled identically
 * by both targets, so the css and tailwind cells would read one declaration
 * and five token categories would be compared against themselves. Neither
 * stylesheet contains `@font-face` or anything else that must reach the
 * document, so both are cell-local. MUI's variables are unaffected: its
 * `ThemeProvider` writes them to the document and no MUI cell carries one of
 * these stylesheets.
 */
export function hostScoped(css: string): string {
  return css.replace(ROOT_SELECTOR, ':host($1)').replace(/:host\(\)/g, ':host');
}

/** The stylesheet each non-MUI target contributes to a cell. MUI styles arrive through Emotion. */
export const TARGET_CSS: Record<Exclude<TargetId, 'mui'>, string> = {
  css: hostScoped(cssPackage),
  tailwind: hostScoped(tailwindPackage),
};
