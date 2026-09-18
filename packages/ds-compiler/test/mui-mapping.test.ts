import { describe, expect, it } from 'vitest';
import { Diagnostics } from '../src/errors.js';
import { muiMapping } from '../src/targets/mui/hints.js';
import { planMapping } from '../src/targets/mui/mapping.js';
import { BTN_FILES, FX_CATALOG, btnWithMui } from './mui-mapped-fixture.js';
import { twBuild, twRoot } from './tailwind-fixture.js';

function plan(files: Record<string, string> = BTN_FILES) {
  const { ir } = twBuild(twRoot(files));
  const component = ir.components.btn;
  const hints = muiMapping(component)!;
  const diag = new Diagnostics();
  const result = planMapping(
    component,
    hints,
    FX_CATALOG.frameworkComponents.Button,
    diag,
  );
  return { result, diag, component };
}

describe('mui mapping plan', () => {
  it('reads the mapping hints and leaves own components alone', () => {
    const { ir } = twBuild(twRoot(BTN_FILES));
    expect(muiMapping(ir.components.btn)).toEqual({
      component: 'Button',
      axisMap: { tone: 'variant' },
      slotMap: { icon: 'startIcon' },
      defaultProps: {},
    });
    expect(muiMapping(ir.components.chip)).toBeNull();
    expect(muiMapping(ir.components.pill)).toBeNull();
  });

  it('plans the btn fixture: parity props, axis default, slot class, children, unions', () => {
    const { result, diag } = plan();
    expect(diag.errors).toEqual([]);
    expect(result).toEqual({
      component: 'Button',
      themeKey: 'MuiButton',
      rootElement: 'button',
      axisMap: { tone: 'variant' },
      slotMap: { icon: 'startIcon' },
      slotClasses: { icon: 'MuiButton-startIcon' },
      defaultProps: {
        disableElevation: true,
        disableFocusRipple: true,
        disableRipple: true,
        disableTouchRipple: true,
        focusRipple: false,
        variant: 'quiet',
      },
      children: { kind: 'children' },
      ownProps: [
        'children',
        'classes',
        'color',
        'disableElevation',
        'disableFocusRipple',
        'disableRipple',
        'disableTouchRipple',
        'disabled',
        'endIcon',
        'focusRipple',
        'fullWidth',
        'href',
        'label',
        'size',
        'startIcon',
        'sx',
        'tabIndex',
        'type',
        'variant',
      ],
      unions: {
        color: {
          overrides: 'ButtonPropsColorOverrides',
          defaults: ['inherit', 'primary'],
          values: [],
        },
        size: {
          overrides: 'ButtonPropsSizeOverrides',
          defaults: ['small', 'medium', 'large'],
          values: [],
        },
        variant: {
          overrides: 'ButtonPropsVariantOverrides',
          defaults: ['text', 'outlined', 'contained'],
          values: ['quiet', 'loud'],
        },
      },
    });
  });

  it('merges manifest defaultProps after the parity props', () => {
    const { result, diag } = plan(
      btnWithMui({
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon' },
        defaultProps: { fullWidth: false, href: '#' },
      }),
    );
    expect(diag.errors).toEqual([]);
    expect(result?.defaultProps).toEqual({
      disableElevation: true,
      disableFocusRipple: true,
      disableRipple: true,
      disableTouchRipple: true,
      focusRipple: false,
      fullWidth: false,
      href: '#',
      variant: 'quiet',
    });
  });

  it('accepts scalar defaultProps whose type matches the declared prop', () => {
    const { result, diag } = plan(
      btnWithMui({
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon' },
        defaultProps: { fullWidth: false, href: '', tabIndex: 0 },
      }),
    );
    expect(diag.errors).toEqual([]);
    expect(result?.defaultProps).toMatchObject({
      fullWidth: false,
      href: '',
      tabIndex: 0,
    });
  });

  it('accepts a string default that matches a quoted member of a plain string-literal union', () => {
    const { result, diag } = plan(
      btnWithMui({
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon' },
        defaultProps: { type: 'button' },
      }),
    );
    expect(diag.errors).toEqual([]);
    expect(result?.defaultProps).toMatchObject({ type: 'button' });
  });

  it.each([
    [
      { component: 'Button', slotMap: { icon: 'startIcon' } },
      'axis "tone" has no axisMap entry; Button exposes color, size, variant',
    ],
    [
      {
        component: 'Button',
        axisMap: { tone: 'fullWidth' },
        slotMap: { icon: 'startIcon' },
      },
      'axisMap.tone: "fullWidth" is not an overridable prop of Button',
    ],
    [
      {
        component: 'Button',
        axisMap: { tone: 'variant', size: 'size' },
        slotMap: { icon: 'startIcon' },
      },
      'axisMap.size: the manifest has no axis "size"',
    ],
    [
      { component: 'Button', axisMap: { tone: 'variant' } },
      'slot "icon" has no slotMap entry; Button renders endIcon, label, startIcon',
    ],
    [
      {
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'avatar' },
      },
      'slotMap.icon: "avatar" is not a slot of Button',
    ],
    [
      {
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'text' },
      },
      '"text" is not a slot of Button',
    ],
    [
      {
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon', root: 'root' },
      },
      'slotMap.root: the manifest has no slot "root"',
    ],
    [
      {
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon' },
        defaultProps: { disableRipple: false },
      },
      'defaultProps.disableRipple is set by the compiler',
    ],
    [
      {
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon' },
        defaultProps: { nope: true },
      },
      'defaultProps.nope: Button has no prop "nope"',
    ],
    [
      {
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon' },
        defaultProps: { variant: 'text' },
      },
      'defaultProps.variant is already mapped',
    ],
    [
      {
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon' },
        defaultProps: { children: 'nope' },
      },
      'defaultProps.children is not allowed',
    ],
    [
      {
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon' },
        defaultProps: { sx: 'x' },
      },
      'defaultProps.sx is not allowed',
    ],
    [
      {
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon' },
        defaultProps: { color: 'primary' },
      },
      'defaultProps.color: "color" is an overridable prop; map an axis onto it instead',
    ],
    [
      {
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon' },
        defaultProps: { fullWidth: 'yes' },
      },
      'defaultProps.fullWidth: a string does not fit "boolean | undefined"',
    ],
    [
      {
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon' },
        defaultProps: { type: 'link' },
      },
      "defaultProps.type: a string does not fit \"'submit' | 'reset' | 'button' | undefined\"",
    ],
  ])('rejects %j with DS-E085', (mui, message) => {
    const { result, diag } = plan(btnWithMui(mui));
    expect(result).toBeNull();
    expect(diag.errors.map((e) => e.code)).toEqual(['DS-E085']);
    expect(diag.errors[0].message).toContain(message);
    expect(diag.errors[0].location?.file).toBe(
      'src/components/btn/btn.manifest.json',
    );
  });

  it('rejects two axes mapped onto the same MUI prop', () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as {
      axes: Record<string, unknown>;
      targets: { mui: { axisMap: Record<string, string> } };
    };
    m.axes.size = { values: ['sm', 'md'], default: 'md' };
    m.targets.mui.axisMap.size = 'variant';
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    const { diag } = plan(files);
    expect(diag.errors.map((e) => e.message)).toEqual([
      'mui: btn: axisMap maps more than one axis onto "variant"',
    ]);
  });

  it('rejects two slots mapped onto the same MUI class key', () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as {
      slots: Record<string, unknown>;
      targets: { mui: { slotMap: Record<string, string> } };
    };
    m.slots.icon2 = { element: 'span', optional: true };
    m.targets.mui.slotMap.icon2 = 'startIcon';
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    files['src/components/btn/btn.css'] +=
      '.fx-btn .fx-btn__icon2 {\n  width: 20px;\n}\n';
    const { diag } = plan(files);
    expect(diag.errors.map((e) => e.message)).toEqual([
      'mui: btn: slotMap maps more than one slot onto "startIcon"',
    ]);
  });

  it('rejects a root element MUI does not render and a disabled state without a disabled prop', () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as {
      slots: { root: { element: string } };
    };
    m.slots.root.element = 'div';
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    files['src/components/btn/btn.css'] = files[
      'src/components/btn/btn.css'
    ].replace('.fx-btn:disabled', '.fx-btn[aria-disabled="true"]');
    const { diag } = plan(files);
    expect(diag.errors.map((e) => e.message)).toEqual([
      'mui: btn: root element is "div" but Button renders "button"',
    ]);

    const framework = {
      ...FX_CATALOG.frameworkComponents.Button,
      props: Object.fromEntries(
        Object.entries(FX_CATALOG.frameworkComponents.Button.props).filter(
          ([k]) => k !== 'disabled',
        ),
      ),
    };
    const { ir } = twBuild(twRoot(BTN_FILES));
    const diag2 = new Diagnostics();
    expect(
      planMapping(
        ir.components.btn,
        muiMapping(ir.components.btn)!,
        framework,
        diag2,
      ),
    ).toBeNull();
    expect(diag2.errors[0].message).toContain(
      'state "disabled" needs a disabled prop',
    );
  });

  it('defaults the root element to div when the manifest omits slots.root', () => {
    const files = {
      'src/components/plain/plain.manifest.json': JSON.stringify({
        name: 'plain',
        displayName: 'Plain',
        baseline: false,
        targets: { tailwind: {}, mui: { component: 'Button' } },
      }),
      'src/components/plain/plain.css':
        '.fx-plain {\n  display: inline-block;\n}\n',
    };
    const { ir } = twBuild(twRoot(files));
    const component = ir.components.plain;
    const diag = new Diagnostics();
    const result = planMapping(
      component,
      muiMapping(component)!,
      FX_CATALOG.frameworkComponents.Button,
      diag,
    );
    expect(result).toBeNull();
    expect(diag.errors.map((e) => e.message)).toEqual([
      'mui: plain: root element is "div" but Button renders "button"',
    ]);
  });

  it('plans a component with no axes and no non-root slots', () => {
    const files = {
      'src/components/plain2/plain2.manifest.json': JSON.stringify({
        name: 'plain2',
        displayName: 'Plain2',
        baseline: false,
        slots: { root: { element: 'button' } },
        targets: { tailwind: {}, mui: { component: 'Button' } },
      }),
      'src/components/plain2/plain2.css':
        '.fx-plain2 {\n  display: inline-flex;\n}\n',
    };
    const { ir } = twBuild(twRoot(files));
    const component = ir.components.plain2;
    const diag = new Diagnostics();
    const result = planMapping(
      component,
      muiMapping(component)!,
      FX_CATALOG.frameworkComponents.Button,
      diag,
    );
    expect(diag.errors).toEqual([]);
    expect(result).toMatchObject({
      axisMap: {},
      slotMap: {},
      slotClasses: {},
      children: { kind: 'children' },
      defaultProps: {
        disableElevation: true,
        disableFocusRipple: true,
        disableRipple: true,
        disableTouchRipple: true,
        focusRipple: false,
      },
    });
  });

  it('routes children into a mapped label slot', () => {
    const files = { ...BTN_FILES };
    const m = JSON.parse(files['src/components/btn/btn.manifest.json']) as {
      slots: Record<string, unknown>;
      targets: { mui: { slotMap: Record<string, string> } };
    };
    m.slots.label = { element: 'span' };
    m.targets.mui.slotMap.label = 'label';
    files['src/components/btn/btn.manifest.json'] = JSON.stringify(m);
    const { result, diag } = plan(files);
    expect(diag.errors).toEqual([]);
    expect(result?.children).toEqual({
      kind: 'slot',
      slot: 'label',
      muiProp: 'label',
    });
    expect(result?.slotClasses).toEqual({
      icon: 'MuiButton-startIcon',
      label: 'MuiButton-label',
    });
  });
});
