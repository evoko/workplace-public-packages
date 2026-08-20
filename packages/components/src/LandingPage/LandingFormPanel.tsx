import {
  Checkbox,
  CheckboxProps,
  FormControlLabel,
  FormControlLabelProps,
  Stack,
  StackProps,
  TextField,
  TextFieldProps,
  Theme,
  Typography,
  TypographyProps,
} from '@mui/material';
import { FormEvent, ReactNode, useId } from 'react';
import { mergeSlotProps, mergeSx } from '../slotProps';

/**
 * The root is a `<form>`, so every form attribute passes through —
 * `noValidate`, `autoComplete`, `name`, `onReset` — alongside `Stack`'s own
 * props.
 */
export type LandingFormPanelProps = Omit<StackProps<'form'>, 'onSubmit'> & {
  children: ReactNode;
  /**
   * Fires on submit — Enter in any field, or a `type="submit"` control. The
   * panel never inspects the fields: gating a submit is the consumer's job.
   */
  onSubmit?: () => void;
  /** Card width, capped to the viewport. Default: 441 — the panel's width. */
  width?: number | string;
  /**
   * Native browser validation, off by default: `required` and `type="email"`
   * on a field style the input without the browser blocking submit or showing
   * its own bubble, so errors stay the consumer's to render via
   * `error`/`helperText`. Pass `noValidate={false}` to hand the gating back to
   * the browser.
   *
   * @default true
   */
  noValidate?: boolean;
};

/**
 * The landing-page form card: shell only, no field or flow knowledge. Compose
 * `LandingFormField`, `LandingFormCheckbox`, and `LandingFormActions` inside it.
 */
export function LandingFormPanel({
  children,
  onSubmit,
  width = 441,
  noValidate = true,
  sx,
  ...stackProps
}: LandingFormPanelProps) {
  // Always preventDefault, handler or not, so a panel without `onSubmit` never
  // navigates the page.
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit?.();
  };

  return (
    <Stack
      // A `<form>` so Enter in a field submits.
      component="form"
      onSubmit={handleSubmit}
      noValidate={noValidate}
      gap={2}
      p={1.5}
      borderRadius={4}
      width={width}
      maxWidth="100%"
      sx={mergeSx(
        {
          // Figma's `background_default` (#F5F5F5) is `grey[100]` here, not
          // `palette.background.default` — that token is #FFFFFF in light mode.
          backgroundColor: ({ palette }: Theme) =>
            palette.mode === 'dark' ? palette.grey[700] : palette.grey[100],
        },
        sx,
      )}
      {...stackProps}
    >
      {children}
    </Stack>
  );
}

// The theme leaves the resting outline at MUI's faint default, so it is pulled
// up to the token the theme uses for hover.
//
// Resting state only: `Mui-error` and `Mui-focused` are both excluded so the
// theme's own rules for them still land. Without the `Mui-focused` exclusion
// this rule would win on source order — the theme sets the focus ring on the
// same `MuiTextField-root` class at the same specificity, and `sx` is
// serialised after `styleOverrides` — leaving a focused field with a 2px ring
// in the 40%-opacity divider colour instead of the solid `text.primary` one.
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'background.paper',
  },
  // `Mui-disabled` is deliberately not excluded: the theme has no disabled
  // outline colour, so dropping it here would fall back to MUI's faint default.
  '& .MuiOutlinedInput-root:not(.Mui-error):not(.Mui-focused) .MuiOutlinedInput-notchedOutline':
    {
      borderColor: ({ palette }: Theme) => palette.dividers.secondary,
    },
};

/**
 * `variant` is omitted rather than passed through: the panel's field is always
 * outlined, and dropping the discriminant collapses `TextFieldProps` from a
 * three-way union into one object type.
 */
export type LandingFormFieldProps = Omit<
  TextFieldProps,
  'label' | 'variant' | 'slotProps'
> & {
  /** Rendered as a 12px/600 `<label>` bound to the input — not MUI's floating label. */
  label: ReactNode;
  /**
   * `container` and `label` are this component's own slots — the two parts it
   * builds around the field. The rest are `TextField`'s, so MUI's `root`
   * (the field itself), `input`, `htmlInput` and `select` all still reach it.
   */
  slotProps?: TextFieldProps['slotProps'] & {
    /** The `Stack` grouping the `<label>` and the field. */
    container?: StackProps;
    /** The 12px/600 `<label>` above the field. */
    label?: TypographyProps;
  };
};

/**
 * A labelled input inside a `LandingFormPanel`. Everything `TextField` takes
 * passes through, so `select`, `type="password"`, `error`/`helperText`, and
 * `slotProps.input` adornments all work without extra props.
 */
export function LandingFormField({
  label,
  id,
  slotProps,
  sx,
  ...textFieldProps
}: LandingFormFieldProps) {
  // This component's own two slots; what is left is `TextField`'s own bag.
  // Both targets carry no `sx` of their own, so they take a plain spread —
  // only the field below needs its `sx` and `slotProps` merged.
  const {
    container: containerSlotProps,
    label: labelSlotProps,
    ...fieldSlotProps
  } = slotProps ?? {};

  // Only used when the consumer does not supply an `id`, so the label binding
  // holds either way.
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  // Read off the label slot rather than always derived, so overriding the
  // label's `id` keeps the select below pointing at it.
  const labelId = labelSlotProps?.id ?? `${fieldId}-label`;

  return (
    <Stack gap={0.5} width="100%" {...containerSlotProps}>
      <Typography
        component="label"
        id={labelId}
        htmlFor={fieldId}
        fontSize={12}
        fontWeight={600}
        color="text.primary"
        {...labelSlotProps}
      >
        {label}
      </Typography>
      <TextField
        id={fieldId}
        fullWidth
        variant="outlined"
        slotProps={{
          ...fieldSlotProps,
          // `select` renders a `div[role="combobox"]`, which `<label for>`
          // cannot name — and MUI points its `aria-labelledby` at the div
          // itself, so the name would come out as the selected value. Naming
          // the label explicitly is what MUI's own floating label does.
          // Inert on a text field: `slotProps.select` only reaches a `Select`.
          select: mergeSlotProps({ labelId }, fieldSlotProps.select),
        }}
        sx={mergeSx(fieldSx, sx)}
        {...textFieldProps}
      />
    </Stack>
  );
}

export type LandingFormActionsProps = StackProps;

/**
 * The row of buttons at the foot of a `LandingFormPanel` — layout only. The
 * convention is an outlined button on the left and a contained `type="submit"`
 * on the right, but that is the consumer's to pass.
 */
export function LandingFormActions(props: LandingFormActionsProps) {
  return <Stack direction="row" gap={1} width="100%" {...props} />;
}

export type LandingFormCheckboxProps = Omit<
  FormControlLabelProps,
  'control' | 'slotProps'
> & {
  /**
   * `checkbox` is this component's own slot; the rest are
   * `FormControlLabel`'s, so `typography` reaches the label's `Typography`.
   */
  slotProps?: FormControlLabelProps['slotProps'] & {
    /** The `Checkbox` control itself. */
    checkbox?: CheckboxProps;
  };
};

/**
 * A single checkbox with its label to the right, spaced to the card's rhythm.
 * `checked` and `onChange` pass through to the control.
 */
export function LandingFormCheckbox({
  label,
  slotProps,
  sx,
  ...formControlLabelProps
}: LandingFormCheckboxProps) {
  const { checkbox, ...labelSlotProps } = slotProps ?? {};

  return (
    <FormControlLabel
      control={
        <Checkbox
          // The theme's 12px checkbox padding would break the card's 16px
          // rhythm, so the card's own gap does the spacing instead.
          {...checkbox}
          sx={mergeSx({ p: 0 }, checkbox?.sx)}
        />
      }
      // Handed over as-is: wrapping it in a `Typography` here would trip
      // `FormControlLabel`'s `label.type !== Typography` guard, and the label
      // would lose the `MuiFormControlLabel-label` class the theme styles
      // (`flex: 1`) and MUI greys out when `disabled`. The variant goes through
      // the slot instead.
      label={label}
      slotProps={{
        ...labelSlotProps,
        typography: mergeSlotProps(
          { variant: 'body2' },
          labelSlotProps.typography,
        ),
      }}
      {...formControlLabelProps}
      // MUI's own -11px/16px margins would break the same rhythm.
      sx={mergeSx({ m: 0, gap: 1, alignItems: 'center' }, sx)}
    />
  );
}
