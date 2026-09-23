/** `chevron-right` to `ChevronRight`: every run of non-alphanumerics is a word break. */
export const pascal = (text) =>
  text
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');

/** `chevron-right` to `chevronRight`. */
export const camel = (text) => {
  const name = pascal(text);
  return name[0].toLowerCase() + name.slice(1);
};

/** A single-quoted string literal, valid as both TypeScript and Dart source. */
export const quote = (text) =>
  `'${text.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
