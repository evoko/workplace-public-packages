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
