import { describe, expect, it } from 'vitest';
import { categoryTitle } from '../src/targets/stories/render.js';

describe('categoryTitle', () => {
  it('title-cases a single-word kebab category', () => {
    expect(categoryTitle('color')).toBe('Color');
  });

  it('title-cases each hyphen-separated word', () => {
    expect(categoryTitle('font-family')).toBe('Font Family');
    expect(categoryTitle('letter-spacing')).toBe('Letter Spacing');
  });

  it('uppercases a leading digit-adjacent letter the same way', () => {
    expect(categoryTitle('z-index')).toBe('Z Index');
  });
});
