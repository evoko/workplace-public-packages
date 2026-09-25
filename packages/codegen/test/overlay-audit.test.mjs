import { describe, expect, it } from 'vitest';
import { loadOverlay } from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';
import { auditOverlays, renderAudit } from '../src/report/overlay-audit.mjs';
import { COMPONENTS, NAMES, fileOf } from '../src/stages/components.mjs';

const names = tokenNames(loadContract());
const audit = auditOverlays({
  components: COMPONENTS,
  overlayOf: loadOverlay,
  names,
  fileOf: (address) => fileOf(NAMES[COMPONENTS.indexOf(address)]),
});

describe('the overlay audit', () => {
  it('finds a decision many overlays repeat, as the focus ring and a filling root are', () => {
    const keys = new Map(audit.decisions.map((d) => [d.key, d.components]));
    expect(
      keys.get('set root.appearance.*.focus.shadow = shadow.focus.default')
        ?.length,
    ).toBeGreaterThanOrEqual(20);
    expect(
      keys.get('set root.base.width = FILL')?.length,
    ).toBeGreaterThanOrEqual(40);
    expect(audit.decisions.every((d) => d.components.length >= 3)).toBe(true);
  });

  it('counts a reason written verbatim three times or more', () => {
    expect(audit.reasons.length).toBeGreaterThan(0);
    expect(audit.reasons.every((r) => r.count >= 3)).toBe(true);
  });

  it('proposes a token only for an icon’s size, never a control’s', () => {
    expect(
      audit.literals.every((l) =>
        l.tokens.every((t) => !t.startsWith('icon.') || /icon/i.test(l.at)),
      ),
    ).toBe(true);
  });

  it('reads a repeated decision from any overlay, whatever it is for', () => {
    const fake = (component) => ({
      component,
      set: { 'root.base.width': { keyword: 'FILL', reason: 'r' } },
    });
    const small = auditOverlays({
      components: ['A', 'B', 'C'],
      overlayOf: fake,
      names,
      fileOf: () => 'no-such-component.json',
    });
    expect(small.decisions).toEqual([
      { key: 'set root.base.width = FILL', components: ['A', 'B', 'C'] },
    ]);
    expect(small.reasons).toEqual([
      { reason: 'r', count: 3, components: ['A', 'B', 'C'] },
    ]);
  });

  it('renders its four lists', () => {
    const text = renderAudit(audit);
    for (const heading of [
      '## Repeated decisions',
      '## Repeated reasons',
      '## Literals a token now matches',
      '## Sets Figma now agrees with',
    ])
      expect(text).toContain(heading);
  });
});
