/**
 * An Emotion cache key may hold only lowercase letters and `-`, so digits are
 * spelled out rather than dropped: a cell id differs from its neighbours by a
 * digit alone (`css|color.accent.200`), and two caches sharing a key would
 * write colliding class names into different shadow roots.
 */
const DIGIT_LETTERS = 'abcdefghij';

export function cacheKey(id: string): string {
  return `cell${id
    .toLowerCase()
    .replace(/[0-9]/g, (d) => DIGIT_LETTERS[Number(d)])
    .replace(/[^a-z]/g, '')}`;
}
