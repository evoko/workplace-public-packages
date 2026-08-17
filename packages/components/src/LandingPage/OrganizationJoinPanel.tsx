import {
  Button,
  ButtonProps,
  Stack,
  StackProps,
  TextField,
  TextFieldProps,
  Theme,
  Typography,
  TypographyProps,
} from '@mui/material';
import { ChangeEvent, FormEvent, ReactNode, useId } from 'react';
import { mergeSx } from '../slotProps';

/**
 * Spread after the card's own props, so they win on conflict — including the
 * wiring. `sx` merges rather than replaces.
 */
export type OrganizationJoinPanelSlotProps = {
  /** The `<label>` bound to the field. */
  label?: TypographyProps;
  /** The `TextField`. */
  field?: TextFieldProps;
  /** The row holding both buttons. */
  actions?: StackProps;
  /** The outlined button on the left. */
  cancelButton?: ButtonProps;
  /** The contained button on the right. */
  submitButton?: ButtonProps;
};

export type OrganizationJoinPanelProps = Omit<StackProps, 'onSubmit'> & {
  /** The field's label, rendered as a `<label>` bound to it. */
  title: ReactNode;
  /** The single controlled text field. */
  field: {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    /** Hint inside the empty field — an example value, not the field's name. */
    placeholder: string;
  };
  /** Shown beneath the field, and switches it to its error state. */
  error?: ReactNode;
  /** Label for the outlined button on the left — typically returns to the panel. */
  cancelLabel: ReactNode;
  /** Label for the contained button on the right. */
  submitLabel: ReactNode;
  onCancel: () => void;
  /** Never fires while the field is empty, or while `submitting`. */
  onSubmit: () => void;
  /** A submit is in flight: spinner in the submit button, both buttons disabled. */
  submitting?: boolean;
  /** Card width, capped to the viewport. Default: 441 — the panel's width. */
  width?: number | string;
  slotProps?: OrganizationJoinPanelSlotProps;
};

export function OrganizationJoinPanel({
  title,
  field,
  error,
  cancelLabel,
  submitLabel,
  onCancel,
  onSubmit,
  submitting = false,
  width = 441,
  slotProps,
  sx,
  ...stackProps
}: OrganizationJoinPanelProps) {
  // Pulled out so the slot's `sx` merges with the field's own instead of
  // replacing it.
  const { sx: fieldSlotSx, ...fieldSlotProps } = slotProps?.field ?? {};
  const fieldId = useId();
  const canSubmit = field.value.trim().length > 0 && !submitting;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canSubmit) {
      onSubmit();
    }
  };

  return (
    <Stack
      // A `<form>` so Enter in the field submits.
      component="form"
      onSubmit={handleSubmit}
      gap={2}
      p={1.5}
      borderRadius={4}
      width={width}
      maxWidth="100%"
      sx={mergeSx(
        {
          backgroundColor: ({ palette }: Theme) =>
            palette.mode === 'dark' ? palette.grey[700] : palette.grey[100],
        },
        sx,
      )}
      {...stackProps}
    >
      <Stack gap={0.5} width="100%">
        <Typography
          component="label"
          htmlFor={fieldId}
          fontSize={12}
          fontWeight={600}
          color="text.primary"
          {...slotProps?.label}
        >
          {title}
        </Typography>
        <TextField
          id={fieldId}
          fullWidth
          variant="outlined"
          value={field.value}
          onChange={field.onChange}
          placeholder={field.placeholder}
          error={Boolean(error)}
          helperText={error}
          // The theme leaves the resting outline at MUI's faint default, so it
          // is pulled up to the token used for hover. `Mui-error` is excluded so
          // an errored field keeps the theme's error colour.
          sx={mergeSx(
            {
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
              },
              '& .MuiOutlinedInput-root:not(.Mui-error) .MuiOutlinedInput-notchedOutline':
                {
                  borderColor: ({ palette }: Theme) =>
                    palette.dividers.secondary,
                },
            },
            fieldSlotSx,
          )}
          {...fieldSlotProps}
        />
      </Stack>
      <Stack direction="row" gap={1} width="100%" {...slotProps?.actions}>
        <Button
          variant="outlined"
          fullWidth
          onClick={onCancel}
          disabled={submitting}
          {...slotProps?.cancelButton}
        >
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          loading={submitting}
          disabled={!canSubmit}
          {...slotProps?.submitButton}
        >
          {submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
}
