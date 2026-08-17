/**
 * The join flow launched from `OrganizationsPanel`: a labelled field for the
 * organization's domain, a cancel and a confirm. Every piece of copy comes in as
 * a prop, so the same shape also serves the panel's create action — see that
 * story — but the join flow is what it is named and shaped for.
 *
 * Not an overlay. It is the same card as `OrganizationsPanel` — same surface,
 * radius and width — and is meant to take the panel's place while a flow is
 * open, with `onCancel` returning to it. The app owns which of the two is
 * rendered.
 */
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
 * Props for the parts this card builds itself. Each bag is spread onto its slot
 * *after* the card's own props, so it wins on conflict; `sx` merges rather than
 * replaces. Note this reaches the wiring too — spreading `disabled` onto
 * `submitButton` overrides the card's own enable/disable logic.
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
  /**
   * The field's label, rendered as a `<label>` bound to it — so it also gives
   * the field its accessible name, and clicking it focuses the input.
   */
  title: ReactNode;
  /** The single controlled text field. */
  field: {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    /** Hint inside the empty field — an example value, not the field's name. */
    placeholder: string;
  };
  /**
   * Message shown beneath the field, which also switches the field to its error
   * state — e.g. "No organization found with that ID" after a failed submit.
   */
  error?: ReactNode;
  /** Label for the outlined button on the left — typically returns to the panel. */
  cancelLabel: ReactNode;
  /** Label for the contained button on the right. */
  submitLabel: ReactNode;
  onCancel: () => void;
  /**
   * Fired by the submit button or Enter in the field. Never fires while the
   * field is empty — the submit button is disabled until it has content.
   */
  onSubmit: () => void;
  /**
   * A submit is in flight. Puts a spinner in the submit button and disables
   * both buttons, so `onSubmit` cannot fire twice for one request. The app owns
   * this — the component has no idea when its own submit has finished.
   */
  submitting?: boolean;
  /** Card width, capped to the viewport. Default: 441 — the panel's width. */
  width?: number | string;
  /**
   * Props for the parts the card renders itself — the label, the field, the
   * button row and each button. Use this to reach past its styling and defaults
   * without forking it.
   */
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
  // The field carries its own `sx`, so the slot's is merged rather than spread
  // over it. The other slots have no own styling and take a plain spread.
  const { sx: fieldSlotSx, ...fieldSlotProps } = slotProps?.field ?? {};
  const fieldId = useId();
  // Derived from the field's own value — a string the component is handed, not
  // something inferred about the caller's state.
  const canSubmit = field.value.trim().length > 0 && !submitting;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canSubmit) {
      onSubmit();
    }
  };

  return (
    <Stack
      // A form element, so Enter in the field submits.
      component="form"
      onSubmit={handleSubmit}
      gap={2}
      p={1.5}
      borderRadius={4}
      width={width}
      maxWidth="100%"
      sx={mergeSx(
        {
          // Figma "Background/background_default" (#F5F5F5) is `grey[100]`, not
          // `palette.background.default` — that token is #FFFFFF in light mode.
          // The field sits on `background.paper` on top of this, so it reads a
          // step brighter than the card around it.
          backgroundColor: ({ palette }: Theme) =>
            palette.mode === 'dark' ? palette.grey[700] : palette.grey[100],
        },
        sx,
      )}
      {...stackProps}
    >
      {/* Label and field are one group, so they sit tighter than the card's gap. */}
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
          // Matches the panel's search field: the theme leaves the resting
          // outline at MUI's faint default, so it is pulled up to the token the
          // theme already uses for hover. `Mui-error` is excluded so a field in
          // its error state keeps the theme's error colour.
          sx={mergeSx(
            {
              // A step brighter than the card: #FFFFFF in light, `grey[800]` in
              // dark, against the card's `grey[100]` / `grey[700]`.
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
