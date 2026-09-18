import type { MuiCatalog, MuiCatalogRule } from '../src/targets/mui/catalog.js';

/** MUI's Button as a fake `@mui/material` 9.4.0 would render it for the `btn` fixture: enough rules to exercise every reset case. */
const BTN_RULES: MuiCatalogRule[] = [
  {
    media: null,
    selector: '&',
    declarations: {
      color: 'inherit',
      'min-width': '64px',
      padding: '6px 16px',
      'text-transform': 'uppercase',
      '-webkit-transition': 'color 250ms',
      transition: 'color 250ms',
      '-webkit-tap-highlight-color': 'transparent',
    },
  },
  {
    media: null,
    selector: '&:hover',
    declarations: { 'text-decoration': 'none' },
  },
  {
    media: null,
    selector: '&.Mui-disabled',
    declarations: {
      color: 'gray',
      cursor: 'default',
      'pointer-events': 'none',
    },
  },
  {
    media: '(hover: hover)',
    selector: '&:hover',
    declarations: { '--variant-containedBg': 'blue' },
  },
  {
    media: null,
    selector: '& .MuiButton-startIcon',
    declarations: { display: 'inherit', 'margin-right': '8px' },
  },
  {
    media: null,
    selector: '& .MuiButton-startIcon::before',
    declarations: { content: '"\\200b"' },
  },
];

const other = (type: string, dflt: string | null = null) => ({
  kind: 'other' as const,
  type,
  default: dflt,
});

export const FX_CATALOG: MuiCatalog = {
  generated: 'test catalog',
  framework: { name: '@mui/material', version: '9.4.0' },
  frameworkComponents: {
    Button: {
      rootElement: 'button',
      themeKey: 'MuiButton',
      classes: {
        root: 'MuiButton-root',
        text: 'MuiButton-text',
        startIcon: 'MuiButton-startIcon',
        endIcon: 'MuiButton-endIcon',
        disabled: 'Mui-disabled',
        label: 'MuiButton-label',
      },
      props: {
        children: other('React.ReactNode'),
        classes: other('Partial<ButtonClasses> | undefined'),
        label: other('React.ReactNode'),
        color: {
          kind: 'union',
          type: "OverridableStringUnion<'inherit' | 'primary', ButtonPropsColorOverrides> | undefined",
          default: 'primary',
          values: ['inherit', 'primary'],
          overrides: 'ButtonPropsColorOverrides',
        },
        disabled: other('boolean | undefined', 'false'),
        disableElevation: other('boolean | undefined', 'false'),
        disableFocusRipple: other('boolean | undefined', 'false'),
        disableRipple: other('boolean | undefined', 'false'),
        disableTouchRipple: other('boolean | undefined', 'false'),
        endIcon: other('React.ReactNode'),
        focusRipple: other('boolean | undefined', 'false'),
        fullWidth: other('boolean | undefined', 'false'),
        href: other('string | undefined'),
        size: {
          kind: 'union',
          type: "OverridableStringUnion<'small' | 'medium' | 'large', ButtonPropsSizeOverrides> | undefined",
          default: 'medium',
          values: ['small', 'medium', 'large'],
          overrides: 'ButtonPropsSizeOverrides',
        },
        startIcon: other('React.ReactNode'),
        sx: other('SxProps<Theme> | undefined'),
        tabIndex: other('number | undefined'),
        type: other("'submit' | 'reset' | 'button' | undefined"),
        variant: {
          kind: 'union',
          type: "OverridableStringUnion<'text' | 'outlined' | 'contained', ButtonPropsVariantOverrides> | undefined",
          default: 'text',
          values: ['text', 'outlined', 'contained'],
          overrides: 'ButtonPropsVariantOverrides',
        },
      },
    },
  },
  components: {
    btn: {
      component: 'Button',
      axisMap: { tone: 'variant' },
      slotMap: { icon: 'startIcon' },
      defaultProps: {
        disableElevation: true,
        disableFocusRipple: true,
        disableRipple: true,
        disableTouchRipple: true,
        focusRipple: false,
        variant: 'quiet',
      },
      renders: [
        { axes: { tone: 'quiet' }, rules: BTN_RULES },
        { axes: { tone: 'loud' }, rules: BTN_RULES },
      ],
    },
  },
};

/** The fixture catalog as the file `bwp-ds` would read. */
export function catalogFile(
  catalog: MuiCatalog = FX_CATALOG,
): Record<string, string> {
  return { 'catalogs/mui.json': `${JSON.stringify(catalog, null, 2)}\n` };
}

function manifest(extra: Record<string, unknown>): string {
  return JSON.stringify({ displayName: 'X', baseline: false, ...extra });
}

/** A button-like component mapped onto MUI Button: one axis, two states, one optional slot. */
export const BTN_FILES: Record<string, string> = {
  'src/components/btn/btn.manifest.json': manifest({
    name: 'btn',
    displayName: 'Btn',
    axes: { tone: { values: ['quiet', 'loud'], default: 'quiet' } },
    states: ['hover', 'disabled'],
    slots: {
      root: { element: 'button' },
      icon: { element: 'span', optional: true },
    },
    targets: {
      tailwind: {},
      mui: {
        component: 'Button',
        axisMap: { tone: 'variant' },
        slotMap: { icon: 'startIcon' },
      },
    },
  }),
  'src/components/btn/btn.css': [
    '.fx-btn {',
    '  display: inline-flex;',
    '  padding: var(--fx-space-2);',
    '  color: var(--fx-color-text-default);',
    '  font-family: var(--fx-font-family-body);',
    '  cursor: pointer;',
    '}',
    '.fx-btn:hover {',
    '  box-shadow: var(--fx-shadow-focus);',
    '}',
    '.fx-btn:disabled {',
    '  cursor: not-allowed;',
    '}',
    '.fx-btn[data-tone="loud"] {',
    '  min-width: 44px;',
    '}',
    '.fx-btn .fx-btn__icon {',
    '  width: 20px;',
    '}',
    '',
  ].join('\n'),
};

/** `btn` with its manifest's `targets.mui` replaced. */
export function btnWithMui(
  mui: Record<string, unknown>,
): Record<string, string> {
  const parsed = JSON.parse(
    BTN_FILES['src/components/btn/btn.manifest.json'],
  ) as {
    targets: Record<string, unknown>;
  };
  parsed.targets.mui = mui;
  return {
    ...BTN_FILES,
    'src/components/btn/btn.manifest.json': JSON.stringify(parsed),
  };
}
