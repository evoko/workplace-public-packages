/**
 * Text Input (milestone 4, F5's pioneer): its IR, the recipes each emitter makes of it, and the
 * machinery it brought: a state value derived from content (its `filled`, from its value), the
 * state blocks in the table's order, and a target under the field's words.
 */

import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { renderFlutterComponent } from '../src/emit/flutter-component.mjs';
import { renderMuiComponent } from '../src/emit/mui-component.mjs';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import { parseOverlay } from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';
import { targetArea } from '../src/shells/target.mjs';
import { recipeAxes } from '../src/spec.mjs';

const { built, tokens } = stage.build();
const { spec, deviations, oracle } = built.find(
  (b) => b.spec.component === 'Text Input',
);

describe('the Text Input IR', () => {
  it('takes a size, disabled and error; its focus is Figma’s pressed, and filled is derived', () => {
    expect(Object.keys(spec.api)).toEqual(['size', 'disabled', 'error']);
    expect(spec.states).toEqual(['default', 'hover', 'focus']);
    expect(spec.derived.filled).toMatchObject({
      type: 'boolean',
      default: false,
      when: [
        { value: true, given: [], props: ['value'] },
        { value: false, given: [] },
      ],
    });
    expect(recipeAxes(spec).filled).toEqual({
      type: 'boolean',
      default: false,
      derived: true,
    });
  });

  it('has a label with its mandatory star, icons either side of its words, and a helper', () => {
    expect(Object.keys(spec.slots)).toEqual([
      'label',
      'mandatory',
      'leadingIcon',
      'trailingIcon',
      'helper',
    ]);
    expect(spec.layers.fieldLabel).toMatchObject({
      parent: 'field',
      type: 'TEXT',
    });
  });

  it('fills its container, and carries the field’s height as Figma’s number', () => {
    expect(spec.style.root.base.width).toMatchObject({ keyword: 'FILL' });
    expect(spec.style.root.size.sm.width).toMatchObject({ keyword: 'FILL' });
    expect(spec.style.field.base.height).toMatchObject({ literal: 40 });
    expect(spec.style.field.base.height.allowed).toMatch(
      /no control height token/,
    );
  });

  it('leaves Figma’s sm paddings and centring open: the code does not copy them', () => {
    const open = deviations.filter((d) => !d.decision).map((d) => d.token);
    expect(open.sort()).toEqual(
      [
        'field.align@state=disabled',
        'field.align@state=error',
        'field.paddingLeft@state=disabled',
        'field.paddingLeft@state=error',
        'field.paddingLeft@state=filled',
        'field.paddingLeft@state=focus',
        'field.paddingRight@state=disabled',
        'field.paddingRight@state=error',
        'field.paddingRight@state=filled',
        'field.paddingRight@state=focus',
      ]
        .map((t) => `component.text input.${t}`)
        .sort(),
    );
  });

  it('reaches filled in the oracle by a value, and every other variant by none', () => {
    const at = (figma) => oracle.variants.find((v) => v.figma === figma);
    expect(at('size=md, state=filled')).toMatchObject({
      props: { size: 'md', disabled: false, error: false },
      state: 'default',
      content: ['value'],
    });
    expect(at('size=md, state=pressed')).toMatchObject({
      state: 'focus',
      content: [],
    });
    expect(at('size=md, state=error').props).toEqual({
      size: 'md',
      disabled: false,
      error: true,
    });
  });
});

describe('the Text Input recipes', () => {
  const { styles, ts } = renderMuiComponent(spec, tokens);

  it('types filled as what the shell derives, not a prop', () => {
    expect(ts).toMatch(
      /export interface SolarTextInputProps \{\n {2}size\?: SolarTextInputSize;\n {2}disabled\?: boolean;\n {2}error\?: boolean;\n\}/,
    );
    expect(ts).toContain(
      'export interface SolarTextInputRecipeProps extends SolarTextInputProps {\n  filled?: boolean;\n}',
    );
  });

  it('draws the state blocks in the table’s order, so error and disabled win over hover', () => {
    expect(Object.keys(styles.appearances.default)).toEqual([
      '&:has(.SolarTextInput-field:hover)',
      '&:has(.SolarTextInput-field.Mui-focused)',
      '&.SolarTextInput-filled',
      '&.SolarTextInput-error',
      '&.SolarTextInput-disabled',
    ]);
  });

  it('draws the words and the placeholder in one ink, the input’s own padding gone', () => {
    const input =
      styles.reset['& .SolarTextInput-fieldLabel.MuiInputBase-input'];
    expect(input).toMatchObject({
      padding: '0',
      WebkitTextFillColor: 'currentcolor',
    });
    expect(input['&::placeholder']).toEqual({ color: 'inherit', opacity: '1' });
  });

  it('gives the field a 44 × 44 target under its words', () => {
    expect(styles.reset['& .SolarTextInput-field']).toEqual({
      position: 'relative',
      isolation: 'isolate',
    });
    expect(styles.reset['& .SolarTextInput-field::after']).toMatchObject({
      height: 'max(100%, 44px)',
      zIndex: '-1',
    });
  });

  it('tests filled in Flutter from the props the widget sets, weaker than error', () => {
    const { dart } = renderFlutterComponent(spec, tokens);
    const order = /statePrecedence = \[([^\]]*)\]/.exec(dart)[1];
    expect([...order.matchAll(/'(\w+)'/g)].map((m) => m[1])).toEqual([
      'disabled',
      'error',
      'filled',
      'focus',
      'hover',
    ]);
    expect(dart).toContain("'filled' => p.filled,");
    expect(dart).toContain('this.filled = false,');
  });
});

describe('a state value derived from content', () => {
  const catalog = loadWebCatalog();
  const names = tokenNames(loadContract());
  const on = (text) =>
    buildComponentSpec(loadComponent(catalog, 'Text Input'), {
      names,
      fileVersion: catalog.fileVersion,
      overlay: parseOverlay(`component: Text Input\n${text}`, 'test.yaml'),
    });

  it('needs true and false each once, and a state value that is a prop', () => {
    expect(() =>
      on(
        'derive:\n  filled:\n    when: [{ value: true, props: [value] }]\n    reason: r\n',
      ),
    ).toThrow(/derive filled: false must appear once in when/);
    expect(() =>
      on(
        'derive:\n  hover:\n    when: [{ value: true }, { value: false }]\n    reason: r\n',
      ),
    ).toThrow(/derive hover: Text Input has no axis hover/);
  });
});

describe('a target under an element’s content', () => {
  it('is a stacking context’s pseudo-element, beneath the content', () => {
    expect(targetArea('& .x', { under: true })).toEqual({
      '& .x': { position: 'relative', isolation: 'isolate' },
      '& .x::after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: 'max(100%, 44px)',
        height: 'max(100%, 44px)',
        transform: 'translate(-50%, -50%)',
        zIndex: '-1',
      },
    });
  });
});
