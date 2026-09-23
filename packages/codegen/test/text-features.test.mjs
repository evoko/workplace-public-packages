import { describe, expect, it } from 'vitest';
import { buildTokenSpec, loadContract } from '../src/normalize/tokens.mjs';
import { renderMui } from '../src/emit/mui.mjs';
import { renderFlutter } from '../src/emit/flutter.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import {
  canonicalDecoration,
  cssTextFeatures,
} from '../src/emit/text-features.mjs';
import * as stage from '../src/stages/components.mjs';

// The contract as build-derived.mjs writes it once solar:sync has read the text styles over REST.
// Until then no style carries these fields; this is the path that data will take.
const contract = structuredClone(loadContract());
const style = (name) => contract.textStyles.find((t) => t.figma === name);
for (const t of contract.textStyles) t.textDecoration = 'NONE';
style('link/md/hover').textDecoration = 'UNDERLINE';
style('caption/xs').textCase = 'UPPER';

const { spec, deviations } = buildTokenSpec(contract);
const button = stage
  .build()
  .built.find((b) => b.spec.component === 'Button').spec;

describe('text decoration and case, once the contract carries them', () => {
  it('reach the typography token as extensions, outside the DTCG composite', () => {
    const ext = spec.typography.link.md.hover.$extensions['com.biamp.solar'];
    expect(ext.textDecoration).toBe('UNDERLINE');
    expect(spec.typography.link.md.hover.$value).not.toHaveProperty(
      'textDecoration',
    );
  });

  it('underline the link style in the MUI theme, and leave a plain style alone', () => {
    const { data } = renderMui(spec);
    expect(data.typography.desktop['link.md.hover'].textDecoration).toBe(
      'underline',
    );
    expect(data.typography.desktop['label.md']).not.toHaveProperty(
      'textDecoration',
    );
    expect(data.typography.desktop['caption.xs'].textTransform).toBe(
      'uppercase',
    );
  });

  it('underline it in Flutter, and show TextDecoration only because it is used', () => {
    const { dart } = renderFlutter(spec);
    expect(dart).toMatch(
      /linkMdHover: TextStyle\([^)]*decoration: TextDecoration\.underline\)/,
    );
    expect(dart).toContain(
      'show BoxShadow, Color, FontWeight, Offset, TextDecoration, TextStyle;',
    );
    const plain = renderFlutter(buildTokenSpec(loadContract()).spec).dart;
    expect(plain).not.toContain('TextDecoration');
  });

  it('agree between MUI and Flutter, which parity compares', () => {
    const mui = renderMui(spec).manifest['typography.link.md.hover'];
    const flutter = renderFlutter(spec).manifest['typography.link.md.hover'];
    expect(JSON.parse(mui.normalized).textDecoration).toBe('underline');
    expect(mui.normalized).toBe(flutter.normalized);
    expect(mui.modes).toEqual(flutter.modes);
  });

  it('draw the underline on tertiary hover in the Button recipe, and undo it at rest', () => {
    const { styles } = renderMuiComponent(button, spec);
    expect(styles.root.textDecoration).toBe('none');
    expect(
      styles.combined.md['variant=tertiary, danger=false']['&:hover']
        .textDecoration,
    ).toBe('underline');
  });

  it('record a text case Flutter cannot apply, and only where one is used', () => {
    expect(deviations.map((d) => d.token)).toContain('typography.caption.xs');
    expect(deviations.some((d) => d.token === 'typography.link.md.hover')).toBe(
      false,
    );
  });
});

describe('the Figma enums', () => {
  it('map to CSS, and fail on one nobody has mapped', () => {
    expect(cssTextFeatures({ textDecoration: 'STRIKETHROUGH' })).toEqual({
      textDecoration: 'line-through',
    });
    expect(cssTextFeatures({ textCase: 'SMALL_CAPS' })).toEqual({
      fontVariantCaps: 'small-caps',
    });
    expect(cssTextFeatures({}, { explicit: true })).toEqual({
      textDecoration: 'none',
    });
    expect(() => cssTextFeatures({ textDecoration: 'WAVY' })).toThrow(
      /unknown text decoration/,
    );
  });

  it('read back from every target’s spelling to one value', () => {
    for (const v of ['UNDERLINE', 'underline', 'TextDecoration.underline'])
      expect(canonicalDecoration(v)).toBe('underline');
    expect(canonicalDecoration(undefined)).toBe('none');
    expect(canonicalDecoration('NONE')).toBe('none');
  });
});
