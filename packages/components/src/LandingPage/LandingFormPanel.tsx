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
import { mergeSx } from '../slotProps';

export type LandingFormPanelProps = Omit<StackProps, 'onSubmit'> & {
  children: ReactNode;
  /**
   * Fires on submit — Enter in any field, or a `type="submit"` control. The
   * panel never inspects the fields: gating a submit is the consumer's job.
   */
  onSubmit?: () => void;
  /** Card width, capped to the viewport. Default: 441 — the panel's width. */
  width?: number | string;
};

/**
 * The landing-page form card: shell only, no field or flow knowledge. Compose
 * `LandingFormField`, `LandingFormCheckbox`, and `LandingFormActions` inside it.
 */
export function LandingFormPanel({
  children,
  onSubmit,
  width = 441,
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
// up to the token used for hover. `Mui-error` is excluded so an errored field
// keeps the theme's error colour.
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'background.paper',
  },
  '& .MuiOutlinedInput-root:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
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
  'label' | 'variant'
> & {
  /** Rendered as a 12px/600 `<label>` bound to the input — not MUI's floating label. */
  label: ReactNode;
  /** Props for that `<label>`. */
  labelProps?: TypographyProps;
};

/**
 * A labelled input inside a `LandingFormPanel`. Everything `TextField` takes
 * passes through, so `select`, `type="password"`, `error`/`helperText`, and
 * `slotProps.input` adornments all work without extra props.
 */
export function LandingFormField({
  label,
  labelProps,
  id,
  sx,
  ...textFieldProps
}: LandingFormFieldProps) {
  // Only used when the consumer does not supply an `id`, so the label binding
  // holds either way.
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <Stack gap={0.5} width="100%">
      <Typography
        component="label"
        htmlFor={fieldId}
        fontSize={12}
        fontWeight={600}
        color="text.primary"
        {...labelProps}
      >
        {label}
      </Typography>
      <TextField
        id={fieldId}
        fullWidth
        variant="outlined"
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
  'control'
> & {
  slotProps?: {
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
  return (
    <FormControlLabel
      control={
        <Checkbox
          // The theme's 12px checkbox padding would break the card's 16px
          // rhythm, so the card's own gap does the spacing instead.
          {...slotProps?.checkbox}
          sx={mergeSx({ p: 0 }, slotProps?.checkbox?.sx)}
        />
      }
      label={<Typography variant="body2">{label}</Typography>}
      {...formControlLabelProps}
      // MUI's own -11px/16px margins would break the same rhythm.
      sx={mergeSx({ m: 0, gap: 1, alignItems: 'center' }, sx)}
    />
  );
}
