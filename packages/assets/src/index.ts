/**
 * The public surface of `@bwp-web/assets`.
 *
 * A pure re-export and nothing else. The package is marked `sideEffects: false` and every icon
 * is its own module behind the generated barrel, so a consumer who imports one icon bundles one
 * icon: adding a statement with an effect here, or re-exporting through a wrapper, would undo
 * that for all 341.
 *
 * Raw SVG is not reached through this entry point. It ships as files under `./svg/*`, so a
 * sprite build or a CSS `mask-image` can name one without pulling in React.
 */

// Every icon component: `IconAccessibility` … `IconZoomOut`, each taking `IconProps`.
export * from './generated/icons/index.js';

// The logo components (`LogoBiamp`, `LogoOs`) with their per-set variant unions, and the app
// icon rasters (`appIcons` and the individual data URLs), which are data rather than components.
export * from './generated/logos/index.js';

// The shells' public types. The `Icon` and `Logo` components themselves stay internal: they take
// geometry, and the generated components are the supported way to get it. The types are exported
// because a consumer writing a wrapper around an icon or a logo needs to name its props, and one
// carrying its own artwork needs to name its shape.
export type { IconGeometry, IconPath, IconProps, IconSize } from './icon.js';
export type {
  LogoArtwork,
  LogoGeometry,
  LogoMarkup,
  LogoPath,
  LogoProps,
  LogoSize,
} from './logo.js';
