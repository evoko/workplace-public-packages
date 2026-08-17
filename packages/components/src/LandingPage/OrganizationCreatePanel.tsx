/**
 * The create flow launched from `OrganizationsPanel`: a region dropdown, the
 * organization's name and domain, one checkbox, then cancel and confirm. Every
 * piece of copy comes in as a prop.
 *
 * Not an overlay. Like `OrganizationJoinPanel` it is the same card as
 * `OrganizationsPanel` — same fill, radius, padding and width — and takes the
 * panel's place while the flow is open, with `onCancel` returning to it. The app
 * owns which card is rendered.
 */
import {
  Box,
  Button,
  ButtonProps,
  Checkbox,
  CheckboxProps,
  FormControlLabel,
  FormControlLabelProps,
  MenuItem,
  Stack,
  StackProps,
  TextField,
  TextFieldProps,
  Theme,
  Typography,
  TypographyProps,
} from '@mui/material';
import { ChangeEvent, FormEvent, ReactNode, useId } from 'react';
import { mergeSlotProps, mergeSx } from '../slotProps';

/**
 * Shared by all three inputs: a step brighter than the card (`#FFFFFF` in light,
 * `grey[800]` in dark), and a resting outline pulled up from MUI's faint default
 * to the token the theme already uses for hover. `Mui-error` is excluded so a
 * field in its error state keeps the theme's error colour.
 */
const fieldSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'background.paper',
  },
  '& .MuiOutlinedInput-root:not(.Mui-error) .MuiOutlinedInput-notchedOutline': {
    borderColor: ({ palette }: Theme) => palette.dividers.secondary,
  },
};

/** A 12px/600 label bound to the input below it. */
function LabelledField({
  id,
  label,
  labelProps,
  children,
}: {
  id: string;
  label: ReactNode;
  labelProps?: TypographyProps;
  children: ReactNode;
}) {
  return (
    // Label and input are one group, so they sit tighter than the card's gap.
    <Stack gap={0.5} width="100%">
      <Typography
        component="label"
        htmlFor={id}
        fontSize={12}
        fontWeight={600}
        color="text.primary"
        {...labelProps}
      >
        {label}
      </Typography>
      {children}
    </Stack>
  );
}

type TextFieldConfig = {
  /** The field's label, rendered as a `<label>` bound to the input. */
  label: ReactNode;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Hint inside the empty field — an example value, not the field's name. */
  placeholder: string;
  /**
   * Message shown beneath the field, which also switches it to its error state.
   */
  error?: ReactNode;
};

/**
 * Props for the parts this card builds itself. Each bag is spread onto its slot
 * *after* the card's own props, so it wins on conflict; `sx` merges rather than
 * replaces. Note this reaches the wiring too — spreading `disabled` onto
 * `submitButton` overrides the card's own enable/disable logic.
 */
export type OrganizationCreatePanelSlotProps = {
  /** The `<label>` above each field — applied to all three. */
  label?: TypographyProps;
  /** The region `TextField` (a `select`). */
  regionField?: TextFieldProps;
  /** The organization-name `TextField`. */
  nameField?: TextFieldProps;
  /** The domain `TextField`. */
  domainField?: TextFieldProps;
  /** The `Checkbox` control itself. */
  checkbox?: CheckboxProps;
  /** The `FormControlLabel` pairing the checkbox with its label. */
  checkboxLabel?: Omit<FormControlLabelProps, 'control' | 'label'>;
  /** The row holding both buttons. */
  actions?: StackProps;
  /** The outlined button on the left. */
  cancelButton?: ButtonProps;
  /** The contained button on the right. */
  submitButton?: ButtonProps;
};

export type OrganizationCreatePanelProps = Omit<StackProps, 'onSubmit'> & {
  /** The region dropdown. Nothing is selected until the user picks an option. */
  region: Omit<TextFieldConfig, 'placeholder'> & {
    /** Shown in the closed dropdown while nothing is selected. */
    placeholder: string;
    options: { value: string; label: ReactNode }[];
  };
  /** The organization's display name. */
  name: TextFieldConfig;
  /** The organization's domain. */
  domain: TextFieldConfig;
  /** A single checkbox with its label to the right. */
  checkbox: {
    checked: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
    label: ReactNode;
  };
  /** Label for the outlined button on the left — typically returns to the panel. */
  cancelLabel: ReactNode;
  /** Label for the contained button on the right. */
  submitLabel: ReactNode;
  onCancel: () => void;
  /**
   * Fired by the submit button or Enter in a field. Never fires until a region
   * is chosen and both text fields have content — the checkbox does not gate it.
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
   * Props for the parts the card renders itself — each label, each field, the
   * checkbox, the button row and each button. Use this to reach past its styling
   * and defaults without forking it.
   */
  slotProps?: OrganizationCreatePanelSlotProps;
};

export function OrganizationCreatePanel({
  region,
  name,
  domain,
  checkbox,
  cancelLabel,
  submitLabel,
  onCancel,
  onSubmit,
  submitting = false,
  width = 441,
  slotProps,
  sx,
  ...stackProps
}: OrganizationCreatePanelProps) {
  // Each field carries `fieldSx`, so a slot's `sx` is merged rather than spread
  // over it. Slots with no own styling take a plain spread.
  //
  // The region field also sets its own `slotProps.select` to render the
  // placeholder, so the consumer's `slotProps` is pulled out too: their other
  // keys spread through, but `select` is layered rather than replaced. Without
  // this, passing any `slotProps` to this field would drop the placeholder.
  const {
    sx: regionSx,
    slotProps: regionFieldSlotProps,
    ...regionSlotProps
  } = slotProps?.regionField ?? {};
  const { sx: nameSx, ...nameSlotProps } = slotProps?.nameField ?? {};
  const { sx: domainSx, ...domainSlotProps } = slotProps?.domainField ?? {};
  const baseId = useId();
  const regionId = `${baseId}-region`;
  const nameId = `${baseId}-name`;
  const domainId = `${baseId}-domain`;

  const selectedRegion = region.options.find(
    (option) => option.value === region.value,
  );

  // Derived from the values the component is handed, not inferred about the
  // caller's state. The checkbox is deliberately not part of it.
  const canSubmit =
    region.value !== '' &&
    name.value.trim().length > 0 &&
    domain.value.trim().length > 0 &&
    !submitting;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canSubmit) {
      onSubmit();
    }
  };

  return (
    <Stack
      // A form element, so Enter in a field submits.
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
          backgroundColor: ({ palette }: Theme) =>
            palette.mode === 'dark' ? palette.grey[700] : palette.grey[100],
        },
        sx,
      )}
      {...stackProps}
    >
      <LabelledField
        id={regionId}
        label={region.label}
        labelProps={slotProps?.label}
      >
        <TextField
          select
          id={regionId}
          fullWidth
          variant="outlined"
          value={region.value}
          onChange={region.onChange}
          error={Boolean(region.error)}
          helperText={region.error}
          sx={mergeSx(fieldSx, regionSx)}
          slotProps={{
            ...regionFieldSlotProps,
            select: mergeSlotProps(
              {
                displayEmpty: true,
                // Stands in for a placeholder, which a select has no room for.
                renderValue: () =>
                  selectedRegion ? (
                    selectedRegion.label
                  ) : (
                    <Box component="span" sx={{ color: 'text.secondary' }}>
                      {region.placeholder}
                    </Box>
                  ),
              },
              regionFieldSlotProps?.select,
            ),
          }}
          {...regionSlotProps}
        >
          {region.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </LabelledField>
      <LabelledField
        id={nameId}
        label={name.label}
        labelProps={slotProps?.label}
      >
        <TextField
          id={nameId}
          fullWidth
          variant="outlined"
          value={name.value}
          onChange={name.onChange}
          placeholder={name.placeholder}
          error={Boolean(name.error)}
          helperText={name.error}
          sx={mergeSx(fieldSx, nameSx)}
          {...nameSlotProps}
        />
      </LabelledField>
      <LabelledField
        id={domainId}
        label={domain.label}
        labelProps={slotProps?.label}
      >
        <TextField
          id={domainId}
          fullWidth
          variant="outlined"
          value={domain.value}
          onChange={domain.onChange}
          placeholder={domain.placeholder}
          error={Boolean(domain.error)}
          helperText={domain.error}
          sx={mergeSx(fieldSx, domainSx)}
          {...domainSlotProps}
        />
      </LabelledField>
      <FormControlLabel
        control={
          <Checkbox
            checked={checkbox.checked}
            onChange={checkbox.onChange}
            // The theme pads checkboxes by 12px for standalone rows. Here that
            // padding would put the control 28px from its neighbours while
            // everything else in the card sits at 16px, so it is dropped and the
            // card's own gap does the spacing. The label stays clickable.
            {...slotProps?.checkbox}
            sx={mergeSx({ p: 0 }, slotProps?.checkbox?.sx)}
          />
        }
        label={<Typography variant="body2">{checkbox.label}</Typography>}
        {...slotProps?.checkboxLabel}
        // MUI's own -11px/16px margins would break the same rhythm.
        sx={mergeSx(
          { m: 0, gap: 1, alignItems: 'center' },
          slotProps?.checkboxLabel?.sx,
        )}
      />
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
