import { beforeAll, describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { tokenChoices } from '../src/workbench/tokens.mjs';

let tokens;
beforeAll(() => {
  ({ tokens } = stage.build());
});

describe('the tokens a cell may take', () => {
  it('are the semantic tokens of the current token’s kind, never a primitive', () => {
    const choices = tokenChoices(
      tokens,
      'background',
      'color.action.primary.bg.default',
    );
    const names = choices.map((c) => c.name);
    expect(names).toContain('color.action.primary.bg.default');
    expect(names).toContain('color.text.primary');
    // color.brand holds semantic tokens (primary, secondary, tertiary) beside primitives (red).
    expect(names).toContain('color.brand.primary');
    expect(names).not.toContain('color.brand.red');
    expect(names.some((n) => n.startsWith('color.neutral.'))).toBe(false);
    expect(names.some((n) => n.startsWith('inset.'))).toBe(false);
  });

  it('show a colour’s Light and Dark values', () => {
    const c = tokenChoices(
      tokens,
      'background',
      'color.action.primary.bg.default',
    ).find((x) => x.name === 'color.action.primary.bg.default');
    expect(c.value).toBe('#111111 / #f5f5f5');
  });

  it('put inset and stack together, as spacing', () => {
    const names = tokenChoices(tokens, 'paddingLeft', 'inset.sm').map(
      (c) => c.name,
    );
    expect(names).toContain('inset.md');
    expect(names).toContain('stack.md');
    expect(names).not.toContain('radius.control');
  });

  it('fall back to the cell’s kind where the cell has no token', () => {
    const names = tokenChoices(tokens, 'radius', null).map((c) => c.name);
    expect(names).toContain('radius.control');
    expect(tokenChoices(tokens, 'x', null)).toEqual([]);
  });

  it('show a text style as its size, line height and weight', () => {
    const c = tokenChoices(tokens, 'typography', 'typography.label.md').find(
      (x) => x.name === 'typography.label.md',
    );
    expect(c.value).toBe('14px/20px 500');
  });

  it('show a text style at Desktop and at Mobile, where they differ', () => {
    const c = tokenChoices(tokens, 'typography', 'typography.label.md').find(
      (x) => x.name === 'typography.display.lg',
    );
    expect(c.value).toBe('56px/72px 500 / 40px/52px 500');
  });
});
