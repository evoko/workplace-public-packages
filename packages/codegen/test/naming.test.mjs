/** The name helpers every emitter shares. */

import { describe, expect, it } from 'vitest';
import { camel, pascal } from '../src/util/naming.mjs';

describe('camel', () => {
  it('breaks words at every run of non-alphanumerics', () => {
    expect(camel('chevron-right')).toBe('chevronRight');
    expect(camel('Button 3')).toBe('button3');
    expect(pascal('chevron-right')).toBe('ChevronRight');
  });

  it('lower-cases a leading acronym whole, up to the next word', () => {
    // Drawer's `hasCTA` shows its Button Group: the slot is `cta`, not `cTA`.
    expect(camel('CTA')).toBe('cta');
    expect(camel('CTAButton')).toBe('ctaButton');
    expect(camel('OS google')).toBe('osGoogle');
    // An acronym later in the name is kept, as before.
    expect(camel('TertiaryCTA')).toBe('tertiaryCTA');
    expect(camel('A')).toBe('a');
  });
});

// The palette's keys and the Typography variants are SOLAR's names through camel, segment by segment
// for a palette path and whole for a variant: the same words solar_flutter's tokens use (dartName),
// so both platforms say `subtleAlpha` and `titleSm` (packages/components/README.md, SOLAR in app code).
describe('camel, on SOLAR token names', () => {
  it('names a palette key: a hyphenated segment camelCased, a numeric or plain one kept', () => {
    expect(camel('subtle-alpha')).toBe('subtleAlpha');
    expect(camel('negative-100')).toBe('negative100');
    expect(camel('01')).toBe('01');
    expect(camel('100')).toBe('100');
    expect(camel('primary')).toBe('primary');
  });

  it('names a variant: a text style’s whole path as one word', () => {
    expect(camel('title.sm')).toBe('titleSm');
    expect(camel('body.md.regular')).toBe('bodyMdRegular');
    expect(camel('title.2xs')).toBe('title2xs');
    expect(camel('display.xs.semibold')).toBe('displayXsSemibold');
    expect(camel('link.md.hover')).toBe('linkMdHover');
  });
});
