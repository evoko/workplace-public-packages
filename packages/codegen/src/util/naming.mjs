/** `chevron-right` to `ChevronRight`: every run of non-alphanumerics is a word break. */
export const pascal = (text) =>
  text
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join('');

/**
 * `chevron-right` to `chevronRight`. A leading acronym is lower-cased whole, up to the capital that
 * starts the next word: `CTA` to `cta`, `CTAButton` to `ctaButton` (not `cTA`, `cTAButton`).
 */
export const camel = (text) => {
  const name = pascal(text);
  const run = name.match(/^[A-Z0-9]+/)?.[0] ?? '';
  const lead =
    run.length > 1 && run.length < name.length && /[a-z]/.test(name[run.length])
      ? run.slice(0, -1)
      : run;
  return (lead || name[0]).toLowerCase() + name.slice((lead || name[0]).length);
};

/** A single-quoted string literal, valid as both TypeScript and Dart source. */
export const quote = (text) =>
  `'${text.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
