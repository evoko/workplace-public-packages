/**
 * The web Playground's viewer-free core (stories/playground/core.tsx): the argTypes per kind, a
 * component slot's words, the event log, and the checks `value` and `set` make.
 */

import { describe, expect, it, vi } from 'vitest';
import { renderToString } from 'react-dom/server';
import { playgroundData } from '../../codegen/src/playground/controls.mjs';
import {
  argTypeOf,
  argTypesOf,
  controlsOf,
  defaultsOf,
  iconElement,
  logLine,
  makePlayground,
  startSync,
  syncArgs,
  withLine,
} from '../stories/playground/core.tsx';

const data = playgroundData();

/** A Playground over a component's defaults (and `over`), recording `set` and `log`. */
function playground(component, over = {}) {
  const controls = controlsOf(data, component);
  const set = vi.fn();
  const log = vi.fn();
  const p = makePlayground({
    data,
    controls,
    values: { ...defaultsOf(controls), ...over },
    set,
    log,
  });
  return { p, set, log };
}

const control = (component, name) =>
  controlsOf(data, component).find((c) => c.name === name);

describe('argTypeOf', () => {
  it('draws each kind of control', () => {
    const button = argTypesOf(data, 'Button');
    expect(button.size).toEqual({
      control: 'select',
      options: ['md', 'sm', 'lg'],
    });
    expect(button.disabled).toEqual({ control: 'boolean' });
    expect(button.counter).toEqual({ control: 'boolean' });
    expect(button.label).toEqual({ control: 'text' });
    expect(button.iconLeading.control).toBe('select');
    expect(button.iconLeading.options.slice(0, 4)).toEqual([
      '_none',
      '_sample',
      data.icons[0],
      `${data.icons[0]} solid`,
    ]);
    expect(button.iconLeading.options).toHaveLength(2 + 2 * data.icons.length);
    expect(button.width).toEqual({
      control: 'select',
      options: data.values.widths,
    });
    expect(argTypesOf(data, 'Dialog').content).toEqual({ control: 'boolean' });
    expect(argTypesOf(data, 'Banner')['primaryButton label']).toEqual({
      control: 'text',
    });
  });

  it('gives a number or integer its bounds and step', () => {
    expect(argTypesOf(data, 'Button')['counter count']).toEqual({
      control: { type: 'number', min: 0, max: undefined, step: 1 },
    });
    expect(
      argTypeOf(
        { name: 'v', kind: 'number', default: 0, min: 0, max: 1, step: 0.1 },
        data,
      ),
    ).toEqual({ control: { type: 'number', min: 0, max: 1, step: 0.1 } });
  });
});

describe('the Playground', () => {
  it("gives a component slot its toggle and its child's words", () => {
    const { p } = playground('Banner');
    const words = control('Banner', 'primaryButton label');
    expect(words).toMatchObject({ slot: 'primaryButton', default: 'Label' });
    expect(p.child('primaryButton')).toEqual({
      shown: control('Banner', 'primaryButton').default,
      text: 'Label',
    });
    // Button's counter has no words: its toggle alone.
    expect(playground('Button').p.child('counter')).toEqual({
      shown: false,
      text: undefined,
    });
  });

  it('reads each kind through its accessor', () => {
    const { p } = playground('Text Input', { label: '', value: 'abc' });
    expect(p.flag('disabled')).toBe(false);
    expect(p.text('value')).toBe('abc');
    expect(p.words('label')).toBeUndefined();
    expect(p.text('label')).toBe('');
    expect(p.choice('size')).toBe(control('Text Input', 'size').default);
    expect(p.value('value')).toBe('abc');
    const pagination = playground('Pagination', { page: 0, count: 2.6 }).p;
    // Within its bounds (min 1), and whole.
    expect(pagination.whole('page')).toBe(1);
    expect(pagination.whole('count')).toBe(3);
    // Cleared, it is its default; from a URL, a string.
    expect(
      playground('Pagination', { count: undefined }).p.whole('count'),
    ).toBe(12);
    expect(playground('Pagination', { count: '7' }).p.whole('count')).toBe(7);
  });

  it('throws for a name that is not a control, or a control of another kind', () => {
    const { p } = playground('Button');
    expect(() => p.value('nope')).toThrow(/"nope" is not one of/);
    expect(() => p.flag('nope')).toThrow(/not one of/);
    expect(() => p.set('nope', true)).toThrow(/not one of/);
    expect(() => p.icon('nope')).toThrow(/not one of/);
    expect(() => p.child('nope')).toThrow(/not one of/);
    expect(() => p.flag('label')).toThrow(/text control, not a toggle/);
    expect(() => p.text('disabled')).toThrow(/boolean control/);
    expect(() => p.whole('size')).toThrow(/select control/);
    expect(() => p.choice('label')).toThrow(/text control/);
    expect(() => p.icon('label')).toThrow(/not an icon/);
    expect(() => p.child('iconLeading')).toThrow(/not a component slot/);
  });

  it('checks what `set` is given against the control', () => {
    const { p, set } = playground('Button');
    p.set('disabled', true);
    p.set('label', 'Go');
    p.set('size', 'lg');
    p.set('iconLeading', 'chevron-right solid');
    p.set('width', '320');
    p.set('counter count', 0);
    expect(set.mock.calls).toEqual([
      ['disabled', true],
      ['label', 'Go'],
      ['size', 'lg'],
      ['iconLeading', 'chevron-right solid'],
      ['width', '320'],
      ['counter count', 0],
    ]);
    expect(() => p.set('disabled', 'yes')).toThrow(/takes a boolean/);
    expect(() => p.set('label', null)).toThrow(/takes a string/);
    expect(() => p.set('size', 'xl')).toThrow(/one of/);
    expect(() => p.set('iconLeading', 'no-such-icon')).toThrow(/icon value/);
    expect(() => p.set('width', '999')).toThrow(/one of/);
    expect(() => p.set('counter count', 1.5)).toThrow(/an integer/);
    expect(() => p.set('counter count', -1)).toThrow(/an integer within 0/);
    expect(set).toHaveBeenCalledTimes(6);
  });

  it('logs an event, and its detail unless null or undefined', () => {
    expect(logLine('onClick')).toBe('onClick');
    expect(logLine('onClose', null)).toBe('onClose');
    expect(logLine('onChange', true)).toBe('onChange: true');
    expect(logLine('onChange', 'abc')).toBe('onChange: "abc"');
    expect(logLine('onChange', 3)).toBe('onChange: 3');
  });

  it('keeps the last lines of the log, newest first', () => {
    let lines = [];
    for (let i = 1; i <= 7; i++) lines = withLine(lines, `e${i}`, data);
    expect(data.values.logLength).toBe(5);
    expect(lines).toEqual(['e7', 'e6', 'e5', 'e4', 'e3']);
  });

  it('draws an icon value, and nothing for none or a name that is no icon', () => {
    expect(iconElement('_none', data)).toBeUndefined();
    expect(iconElement('no-such-icon', data)).toBeUndefined();
    expect(renderToString(iconElement('_sample', data))).toMatch(/<svg/);
    expect(renderToString(iconElement('chevron-right solid', data))).toMatch(
      /<svg/,
    );
  });
});

describe('syncArgs', () => {
  const controls = controlsOf(data, 'Text Input');
  const args = defaultsOf(controls);
  /** What `set` does to the copy: the value, pending until the args carry it. */
  const set = (sync, name, value) => ({
    ...sync,
    local: { ...sync.local, [name]: value },
    pending: { ...sync.pending, [name]: value },
  });

  it('keeps typed words while older args arrive, and confirms them once the args carry them', () => {
    let sync = set(set(startSync(args), 'value', 'a'), 'value', 'ab');
    // The first keystroke's round trip ends: the copy keeps the newer words.
    sync = syncArgs(sync, { ...args, value: 'a' }, controls);
    expect(sync.local.value).toBe('ab');
    expect(sync.pending).toEqual({ value: 'ab' });
    sync = syncArgs(sync, { ...args, value: 'ab' }, controls);
    expect(sync.local.value).toBe('ab');
    expect(sync.pending).toEqual({});
  });

  it('takes a value the panel or Reset changed where nothing is pending', () => {
    let sync = set(startSync(args), 'value', 'x');
    sync = syncArgs(sync, { ...args, value: 'x', disabled: true }, controls);
    expect(sync.local).toMatchObject({ value: 'x', disabled: true });
    sync = syncArgs(sync, { ...args, value: 'panel' }, controls);
    expect(sync.local).toMatchObject({ value: 'panel', disabled: false });
  });
});
