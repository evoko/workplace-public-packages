import { describe, expect, it } from 'vitest';
import {
  compareLayer,
  matches,
  pixels,
  rgba,
  sameColour,
  shadows,
} from './compare.mjs';

describe('the visual comparison', () => {
  it('reads colours as the browser and the oracle spell them', () => {
    expect(rgba('rgb(17, 17, 17)')).toEqual([17, 17, 17, 1]);
    expect(rgba('rgba(0, 0, 0, 0.2)')).toEqual([0, 0, 0, 0.2]);
    expect(rgba('#00000033')).toEqual([0, 0, 0, 0.2]);
    expect(rgba('transparent')).toEqual([0, 0, 0, 0]);
    expect(sameColour('#111111', 'rgb(17, 17, 17)')).toBe(true);
    expect(sameColour('#111111', 'rgb(19, 17, 17)')).toBe(false);
    // Two clear colours agree, whatever RGB a browser keeps for them.
    expect(sameColour('transparent', 'rgba(255, 255, 255, 0)')).toBe(true);
  });

  it('reads shadows in CSS’s order and Figma’s alike', () => {
    expect(shadows('rgba(0, 0, 0, 0.05) 0px 1px 1px 0px')).toEqual(
      shadows('0px 1px 1px 0px rgba(0, 0, 0, 0.05)'),
    );
    expect(shadows('none')).toEqual([]);
    expect(
      shadows(
        'rgb(0, 0, 0) 0px 0px 0px 2px, rgb(255, 255, 255) 0px 0px 0px 4px',
      ),
    ).toHaveLength(2);
    expect(
      matches('shadow', 'none', 'rgba(0, 0, 0, 0.05) 0px 1px 1px 0px'),
    ).toBe(false);
  });

  it('reads lengths, with normal spacing as none', () => {
    expect(pixels('12px')).toBe(12);
    expect(pixels('normal')).toBe(0);
    expect(Number.isNaN(pixels('auto'))).toBe(true);
    expect(matches('letterSpacing', -0.28, '-0.28px')).toBe(true);
    expect(matches('letterSpacing', -0.28, '-0.32px')).toBe(false);
    expect(
      matches('fontFamily', 'Inter', '"Inter", system-ui, sans-serif'),
    ).toBe(true);
  });

  it('reports excused entries as gaps, not failures, and ignores the colour of no border', () => {
    const { failures, gaps } = compareLayer(
      {
        background: 'transparent',
        borderColor: '#ff0000',
        borderWidth: 0,
        radius: 6,
      },
      {
        background: 'rgb(245, 245, 245)',
        borderColor: 'rgb(0, 0, 0)',
        borderWidth: '0px',
        radius: '4px',
      },
      [{ property: 'background', finding: 'f', decision: null }],
    );
    expect(failures).toEqual([
      { property: 'radius', figma: 6, rendered: '4px' },
    ]);
    expect(gaps).toEqual([
      {
        property: 'background',
        figma: 'transparent',
        rendered: 'rgb(245, 245, 245)',
        finding: 'f',
        decision: null,
      },
    ]);
  });
});
