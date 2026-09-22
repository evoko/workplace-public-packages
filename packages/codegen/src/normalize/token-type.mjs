// Maps a css-contract.json entry to a DTCG $type. Throws rather than guessing, so a new
// Figma collection or path prefix fails the build instead of being silently mistyped.
export function dtcgType({ collection, figma }) {
  if (collection === 'Color') return 'color';
  if (collection === 'Spatial') return 'dimension';
  if (collection === 'Type') return 'dimension';
  if (collection === 'Layout') {
    return figma.startsWith('grid/columns/') ? 'number' : 'dimension';
  }
  if (collection === 'Primitives') {
    if (figma.startsWith('color/')) return 'color';
    if (figma.startsWith('type/font-family/')) return 'fontFamily';
    if (figma.startsWith('type/font-weight/')) return 'fontWeight';
    if (figma.startsWith('type/')) return 'dimension';
    if (figma.startsWith('spatial/')) return 'dimension';
    if (figma.startsWith('viewport/')) return 'dimension';
    if (figma.startsWith('motion/duration/')) return 'duration';
    if (figma.startsWith('motion/ease/')) return 'cubicBezier';
  }
  throw new Error(
    `unclassified token: collection=${collection} figma=${figma}`,
  );
}
