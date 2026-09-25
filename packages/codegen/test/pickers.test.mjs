/**
 * The pickers (milestone 4): DatePicker and TimePicker, typed and picked, their panels (Date Picker
 * Open, TimePicker Dropdown), Select and Dropdown, and Autocomplete Open, an open Autocomplete. The
 * machinery they brought: a compound state, an instance named for another component, what a
 * composed child hides, a grid's gap, a text placed by position, a descriptor checked as another
 * component, a menu whose rows are its own, and the typed pickers' shared shell.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import * as stage from '../src/stages/components.mjs';
import { DESCRIPTORS } from '../src/components/index.mjs';
import { renderRegistries } from '../src/emit/registries.mjs';
import {
  buildComponentSpec,
  loadComponent,
  loadWebCatalog,
} from '../src/normalize/components.mjs';
import {
  loadDefaults,
  loadOverlay,
  parseOverlay,
} from '../src/normalize/overlay.mjs';
import { tokenNames } from '../src/normalize/recipe.mjs';
import { loadContract } from '../src/normalize/tokens.mjs';
import {
  renderShells,
  shellFileOf,
  flutterFileOf,
} from '../src/shells/index.mjs';
import { typedResets, typedStates } from '../src/components/shared/typed.mjs';
import { flat, flutterShell, reactShell } from './shell-files.mjs';
import { packagesDir, specDir } from '../src/util/paths.mjs';
import { hideInComposed } from '../src/verify/oracle.mjs';

const { built } = stage.build();
const of = (name) => built.find((b) => b.spec.component === name);
const committed = (dir, file) =>
  JSON.parse(readFileSync(join(specDir, dir, `${file}.json`), 'utf8'));
const read = (...parts) => readFileSync(join(packagesDir, ...parts), 'utf8');

const names = tokenNames(loadContract());
const catalog = loadWebCatalog();
const defaults = loadDefaults();
const build = (component, overlay) =>
  buildComponentSpec(loadComponent(catalog, component), {
    names,
    fileVersion: catalog.fileVersion,
    overlay,
    defaults,
  });
const yaml = (text) => parseOverlay(text, 'test.yaml');

describe('states.compound', () => {
  it('refuses an unknown field, fewer than two parts, and a missing reason', () => {
    expect(() =>
      yaml(
        'component: X\nstates:\n  compound:\n    error-focused: { of: [error, focus], also: x, reason: r }\n',
      ),
    ).toThrow(/test.yaml: states.compound.error-focused: unknown field also/);
    expect(() =>
      yaml(
        'component: X\nstates:\n  compound:\n    error-focused: { of: [error], reason: r }\n',
      ),
    ).toThrow(/states.compound.error-focused names no two states it is/);
    expect(() =>
      yaml(
        'component: X\nstates:\n  compound:\n    error-focused: { of: error, reason: r }\n',
      ),
    ).toThrow(/states.compound.error-focused names no two states it is/);
    expect(() =>
      yaml(
        'component: X\nstates:\n  compound:\n    error-focused: { of: [error, focus] }\n',
      ),
    ).toThrow(/states.compound.error-focused has no reason/);
  });

  it('fails for a value the state axis lacks, or a part that is neither a state nor a boolean', () => {
    expect(() =>
      build(
        'Button',
        yaml(
          'component: Button\nstates:\n  compound:\n    error-focused: { of: [error, focus], reason: r }\n',
        ),
      ),
    ).toThrow(
      /test.yaml: states.compound.error-focused: the state axis has no error-focused/,
    );
    expect(() =>
      build(
        'Button',
        yaml(
          'component: Button\nstates:\n  compound:\n    hover: { of: [bogus, focus], reason: r }\n',
        ),
      ),
    ).toThrow(/states.compound.hover: bogus is no state of Button/);
  });

  it('makes DatePicker’s and TimePicker’s error-focused a state, not a prop', () => {
    for (const file of ['datepicker', 'timepicker']) {
      const spec = committed('components', file);
      expect(spec.states, file).toEqual([
        'default',
        'hover',
        'focus',
        'error-focused',
      ]);
      expect(Object.keys(spec.api), file).toEqual([
        'size',
        'disabled',
        'error',
      ]);
      expect(spec.api['error-focused'], file).toBeUndefined();
    }
    // Without the rule, the value is a boolean prop, as any non-platform state is.
    const overlay = structuredClone(loadOverlay('DatePicker'));
    delete overlay.states;
    const { spec } = build('DatePicker', overlay);
    expect(spec.states).not.toContain('error-focused');
    expect(spec.api['error-focused']).toEqual({
      type: 'boolean',
      default: false,
    });
  });

  it('reaches a compound variant by setting its prop part and its platform state', () => {
    for (const file of ['datepicker', 'timepicker']) {
      const variants = committed('verify', file).variants.filter((v) =>
        v.figma.includes('state=error-focused'),
      );
      expect(
        variants.map((v) => v.figma),
        file,
      ).toEqual([
        'size=md, state=error-focused',
        'size=sm, state=error-focused',
      ]);
      for (const v of variants) {
        expect(v.props, v.figma).toMatchObject({
          error: true,
          disabled: false,
        });
        expect(v.props).not.toHaveProperty('error-focused');
        expect(v.state, v.figma).toBe('focus');
      }
    }
  });

  it('records the applied rule in the spec’s overlay record', () => {
    for (const file of ['datepicker', 'timepicker'])
      expect(committed('components', file).overlay.rules, file).toContainEqual(
        expect.objectContaining({
          rule: 'states.compound',
          at: 'error-focused = error + focus',
        }),
      );
  });
});

describe('composes', () => {
  it('names Date Picker Open’s day cells Date Picker Day Cell in its oracle, the IR keeping Figma’s name', () => {
    const spec = committed('components', 'date-picker-open');
    expect(spec.style.dayGridDayCell.base.component.keyword).toBe('Day Cell');
    const components = new Set();
    for (const v of committed('verify', 'date-picker-open').variants)
      for (const [name, entry] of Object.entries(v.layers))
        if (/DayGridDayCell|^dayGridDayCell/.test(name))
          components.add(entry.component);
    expect([...components]).toEqual(['Date Picker Day Cell']);
    expect(spec.overlay.rules).toContainEqual(
      expect.objectContaining({
        rule: 'composes',
        at: 'Day Cell → Date Picker Day Cell',
      }),
    );
  });

  it('fails for a component no layer is an instance of, and for a rule with no reason', () => {
    const overlay = structuredClone(loadOverlay('Date Picker Open'));
    overlay.composes = { 'Nope Cell': { name: 'X', reason: 'r' } };
    expect(() => build('Date Picker Open', overlay)).toThrow(
      /composes Nope Cell: no layer is an instance of Nope Cell/,
    );
    expect(() =>
      yaml(
        'component: X\ncomposes:\n  Day Cell:\n    name: Date Picker Day Cell\n',
      ),
    ).toThrow(/test.yaml: composes.Day Cell has no reason/);
    expect(() =>
      yaml(
        'component: X\ncomposes:\n  Day Cell: { name: Y, as: Z, reason: r }\n',
      ),
    ).toThrow(/composes.Day Cell: unknown field as/);
  });
});

describe('hideInComposed', () => {
  // A parent holding one instance of Row, and a Label of its own.
  const parent = {
    component: 'Parent',
    layers: {
      root: { path: '/', parent: null },
      item: { path: '/Item', parent: 'root' },
      label: { path: '/Label', parent: 'root' },
    },
  };
  const row = {
    component: 'Row',
    layers: {
      root: { path: '/', parent: null },
      checkbox: { path: '/Checkbox', parent: 'root' },
      label: { path: '/Label', parent: 'root' },
      text: { path: '/Text', parent: 'root' },
      helper: { path: '/Text/Helper', parent: 'text' },
      icon2: { path: '/Icon#2', parent: 'root' },
    },
  };
  const set = {
    defaultVariant: 'a',
    variants: [
      { variant: 'a', hidden: ['Checkbox', 'Helper', 'Label', 'Icon', 'Nope'] },
      // Recorded only where it differs from the default's, so b hides what a does.
      { variant: 'b' },
      { variant: 'c', hidden: [] },
    ],
  };
  const oracleOf = () => ({
    variants: ['a', 'b', 'c'].map((figma) => ({
      figma,
      layers: {
        root: {},
        item: { component: 'Row' },
        other: { component: 'Unbuilt' },
      },
    })),
  });

  it('records the child’s layers the variant hides, by the child’s names, sorted', () => {
    const oracle = oracleOf();
    hideInComposed(oracle, parent, set, { Parent: parent, Row: row });
    const [a, b, c] = oracle.variants;
    // The parent's own Label is its own, not the child's; `#2` is no part of Figma's name.
    expect(a.layers.item.hides).toEqual(['checkbox', 'helper', 'icon2']);
    expect(b.layers.item.hides).toEqual(['checkbox', 'helper', 'icon2']);
    expect(c.layers.item).not.toHaveProperty('hides');
    // A component with no IR, and a layer that is no instance, are left alone.
    expect(a.layers.other).not.toHaveProperty('hides');
    expect(a.layers.root).toEqual({});
  });

  it('marks the Dropdown Items the menus and Select hide their checkbox, second line and icon of', () => {
    const DROPDOWN_ITEM = ['checkbox', 'helper', 'icon'];
    for (const file of ['select', 'dropdown-menu', 'timepicker-dropdown']) {
      const entries = committed('verify', file).variants.flatMap((v) =>
        Object.values(v.layers).filter((e) => e.component === 'Dropdown Item'),
      );
      expect(entries.length, file).toBeGreaterThan(0);
      for (const e of entries) expect(e.hides, file).toEqual(DROPDOWN_ITEM);
    }
  });
});

describe('a grid', () => {
  it('reads its gap from its row gap binding: Date Picker Open’s day grid, inset.2xs', () => {
    const { spec } = of('Date Picker Open');
    expect(spec.style.dayGrid.base.direction.keyword).toBe('GRID');
    expect(spec.style.dayGrid.base.gap.token).toBe('inset.2xs');
    expect(
      committed('components', 'date-picker-open').style.dayGrid.base.gap.token,
    ).toBe('inset.2xs');
  });

  it('is a CSS grid in the MUI recipe, spaced by that gap', () => {
    const recipe = read(
      'styles/src/generated/mui/components/date-picker-open.ts',
    );
    const grid = recipe.slice(
      recipe.indexOf("'& .SolarDatePickerOpen--dayGrid': {"),
    );
    const block = grid.slice(0, grid.indexOf('}'));
    expect(block).toContain("display: 'grid'");
    expect(block).toContain("gap: 'var(--solar-inset-2xs)'");
    expect(block).not.toContain('flexDirection');
  });
});

describe('a text placed by position', () => {
  it('gets x and y cells: Date Picker Open’s month labels in the double calendar', () => {
    const { spec } = of('Date Picker Open');
    for (const layer of [
      'containerMonthHeaderMonthLabel',
      'container2MonthHeaderMonthLabel',
    ]) {
      expect(spec.layers[layer].type).toBe('TEXT');
      const at =
        spec.style[layer].appearance['inline=true, type=double'].default;
      expect(at.x.position, layer).toBe(32);
      expect(at.y.position, layer).toBe(11);
    }
  });

  it('is those two layers alone among the committed components, so a new one is noticed', () => {
    const placed = [];
    const walk = (o, hit) => {
      if (!o || typeof o !== 'object') return;
      for (const [k, v] of Object.entries(o))
        if (
          ['x', 'y', 'right', 'bottom'].includes(k) &&
          v?.position !== undefined
        )
          hit();
        else walk(v, hit);
    };
    const dir = join(specDir, 'components');
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.json'))) {
      const spec = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      for (const [name, l] of Object.entries(spec.layers)) {
        if (l.type !== 'TEXT') continue;
        let hit = false;
        walk(spec.style[name], () => (hit = true));
        if (hit) placed.push(`${f}:${name}`);
      }
    }
    expect(placed.sort()).toEqual([
      'date-picker-open.json:container2MonthHeaderMonthLabel',
      'date-picker-open.json:containerMonthHeaderMonthLabel',
    ]);
  });
});

describe('checkedAs', () => {
  const at = { src: '/x', stories: '/x', flutter: '/x' };

  it('gives Autocomplete Open no shells and no export, but a case on each platform', () => {
    const d = DESCRIPTORS.find((x) => x.name === 'Autocomplete Open');
    expect(d.checkedAs).toBe('Autocomplete');
    expect(
      existsSync(
        join(packagesDir, 'components/src', shellFileOf('Autocomplete Open')),
      ),
    ).toBe(false);
    expect(
      existsSync(
        join(
          packagesDir,
          'solar_flutter/lib/src/components',
          flutterFileOf('Autocomplete Open'),
        ),
      ),
    ).toBe(false);
    const barrel = read('components/src/components.generated.ts');
    expect(barrel).toContain("export * from './Autocomplete.js';");
    expect(barrel).not.toContain('AutocompleteOpen');
    const dart = read('solar_flutter/lib/src/components/components.dart');
    expect(dart).toContain("export 'solar_autocomplete.dart';");
    expect(dart).not.toContain('autocomplete_open');
    expect(
      read('components/test/visual/cases/registry.generated.ts'),
    ).toContain("  'Autocomplete Open': autocompleteOpen,");
    expect(read('solar_flutter/test/visual/cases/cases.dart')).toContain(
      "  'Autocomplete Open': autocompleteOpenCase,",
    );
  });

  it('renders only its story', () => {
    const out = renderShells([{ component: 'Autocomplete Open' }], at);
    expect(out.map((o) => o.path)).toEqual(['/x/AutocompleteOpen.stories.tsx']);
  });

  it('leaves it out of the barrels, and in the cases, where the registries are told it has no shells', () => {
    const files = Object.fromEntries(
      renderRegistries(['Autocomplete', 'Autocomplete Open'], {
        shelled: (n) => n !== 'Autocomplete Open',
      }).map((f) => [f.file, f.text]),
    );
    expect(files['components/src/components.generated.ts']).not.toContain(
      'AutocompleteOpen',
    );
    expect(
      files['solar_flutter/lib/src/components/components.dart'],
    ).not.toContain('autocomplete_open');
    expect(
      files['components/test/visual/cases/registry.generated.ts'],
    ).toContain("'Autocomplete Open': autocompleteOpen,");
    expect(files['solar_flutter/variants/lib/src/registry.dart']).toContain(
      "'Autocomplete Open': buildAutocompleteOpen,",
    );
  });

  it('refuses one checked as no component', () => {
    const specs = [{ component: 'Autocomplete Open' }];
    const autocomplete = { name: 'Autocomplete' };
    expect(() =>
      renderShells(specs, {
        ...at,
        descriptors: [
          autocomplete,
          { name: 'Autocomplete Open', checkedAs: 'Autocomplete Closed' },
        ],
      }),
    ).toThrow(/is checked as Autocomplete Closed, which is no component/);
  });
});

describe('the menus’ shells', () => {
  const timeList = reactShell('TimePicker Dropdown');
  const menu = reactShell('Dropdown Menu');
  const omitOf = (text) => flat(text).match(/Omit<BoxProps, ([^>]*)>/)[1];

  it('gives TimePicker Dropdown its own rows in a listbox, sized by the Dropdown Menu’s context', () => {
    expect(flat(timeList)).toContain(flat('role="listbox"'));
    expect(flat(timeList)).toContain(flat('ref={list}'));
    expect(flat(timeList)).toContain(flat('content: { content: rows }'));
    expect(flat(timeList)).toContain(
      flat("import { DropdownMenuSizeContext } from './DropdownMenu.js';"),
    );
    expect(flat(timeList)).toContain(
      flat("<DropdownMenuSizeContext.Provider value={size ?? 'md'}>"),
    );
    // It reads another menu's context, and declares none of its own.
    expect(flat(timeList)).not.toContain(flat('createContext'));
    expect(flat(timeList)).not.toContain(flat('children: ReactNode'));
    expect(omitOf(timeList)).toContain("'onChange'");
    expect(flat(timeList)).toContain(
      flat('onChange?: (value: string) => void;'),
    );
    expect(flat(timeList)).toContain(flat('value = null, onChange, step = 30'));
    expect(flat(timeList)).toContain(flat('  useLayoutEffect,\n  useRef,\n'));
    expect(timeList).toContain('const rows = timesOf(step');
  });

  it('leaves a Dropdown Menu the caller’s children, its onChange, and a context of its own', () => {
    expect(flat(menu)).toContain(flat('children: ReactNode;'));
    expect(flat(menu)).toContain(flat('content: { content: children }'));
    expect(flat(menu)).not.toContain(flat('role="listbox"'));
    expect(flat(menu)).not.toContain(flat('ref={list}'));
    expect(omitOf(menu)).not.toContain("'onChange'");
    expect(flat(menu)).toContain(
      flat(
        "export const DropdownMenuSizeContext = createContext<SolarDropdownMenuProps['size'] | undefined>(undefined);",
      ),
    );
    expect(flat(menu)).toContain(
      flat("<DropdownMenuSizeContext.Provider value={size ?? 'md'}>"),
    );
    expect(flat(menu)).not.toContain(flat("from './DropdownMenu.js'"));
  });
});

describe('the typed pickers’ shell', () => {
  it('orders its states error-focused after error and disabled last', () => {
    const states = typedStates('DatePicker');
    expect(Object.keys(states)).toEqual([
      'default',
      'hover',
      'focus',
      'filled',
      'error',
      'error-focused',
      'disabled',
    ]);
    expect(states['error-focused']).toBe(
      // By the layer's name, as a helper that knows only names writes it; the codegen writes the
      // field's own class, internal (util/classes.mjs).
      '&.SolarDatePicker-error:has(.SolarDatePicker-field.Mui-focused)',
    );
  });

  it('keeps the target’s position and the button reset under one selector', () => {
    const resets = typedResets('DatePicker', 'iconCalendar');
    const button = resets['& .SolarDatePicker-iconCalendar'];
    // Regression: a spread of the target's rules used to overwrite the reset, or the reset it.
    expect(button).toMatchObject({
      position: 'relative',
      appearance: 'none',
      border: '0',
      cursor: 'pointer',
      minWidth: '0',
    });
    expect(resets['& .SolarDatePicker-iconCalendar::after']).toMatchObject({
      position: 'absolute',
      width: 'max(100%, 44px)',
    });
  });
});

describe('the pickers’ shells', () => {
  it('make Select’s field MUI’s Select, its own icon none, its panel in the component as Figma draws it', () => {
    const select = reactShell('Select');
    expect(select).toContain("from '@mui/material/Select';");
    expect(select).toContain('IconComponent={NoIcon}');
    expect(select).toContain('disablePortal: true');
    expect(select).toContain(
      "className: 'SolarSelect--dropdownMenu SolarSelect-box'",
    );
    expect(select).not.toContain('solarDropdownMenuStyle');
    const widget = flutterShell('Select');
    expect(widget).not.toContain('SolarDropdownMenu(');
  });

  it('make Dropdown’s panel a Dropdown Menu, since Figma draws it none', () => {
    const dropdown = reactShell('Dropdown');
    expect(dropdown).toContain('IconComponent={NoIcon}');
    expect(dropdown).toContain('disablePortal: true');
    expect(dropdown).toContain("className: 'SolarDropdownMenu'");
    expect(dropdown).toContain('sx: solarDropdownMenuStyle({ size })');
    const widget = flutterShell('Dropdown');
    expect(widget).toContain('SolarDropdownMenu(');
    expect(widget).toContain("import 'solar_dropdown_menu.dart';");
  });
});
