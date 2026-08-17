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

// Shared by all three inputs. `Mui-error` is excluded so an errored field keeps
// the theme's error colour.
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
  /** Shown beneath the field, and switches it to its error state. */
  error?: ReactNode;
};

/**
 * Spread after the card's own props, so they win on conflict — including the
 * wiring. `sx` merges rather than replaces.
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
   * Never fires until a region is chosen and both text fields have content — the
   * checkbox does not gate it — or while `submitting`.
   */
  onSubmit: () => void;
  /** A submit is in flight: spinner in the submit button, both buttons disabled. */
  submitting?: boolean;
  /** Card width, capped to the viewport. Default: 441 — the panel's width. */
  width?: number | string;
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
  // Pulled out so a slot's `sx` merges with `fieldSx`, and so the region's own
  // `slotProps.select` (the placeholder) is layered rather than replaced.
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

  // The checkbox is deliberately not part of this.
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
            // The theme's 12px checkbox padding would break the card's 16px
            // rhythm, so the card's own gap does the spacing instead.
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
