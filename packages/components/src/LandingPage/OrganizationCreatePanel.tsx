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
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
  StackProps,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import { ChangeEvent, FormEvent, ReactNode, useId } from 'react';

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
  children,
}: {
  id: string;
  label: ReactNode;
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
  /** Card width, capped to the viewport. Default: 441 — the panel's width. */
  width?: number | string;
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
  width = 441,
  sx,
  ...stackProps
}: OrganizationCreatePanelProps) {
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
    domain.value.trim().length > 0;

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
      sx={{
        // Figma "Background/background_default" (#F5F5F5) is `grey[100]`, not
        // `palette.background.default` — that token is #FFFFFF in light mode.
        backgroundColor: ({ palette }: Theme) =>
          palette.mode === 'dark' ? palette.grey[700] : palette.grey[100],
        ...sx,
      }}
      {...stackProps}
    >
      <LabelledField id={regionId} label={region.label}>
        <TextField
          select
          id={regionId}
          fullWidth
          variant="outlined"
          value={region.value}
          onChange={region.onChange}
          error={Boolean(region.error)}
          helperText={region.error}
          sx={fieldSx}
          slotProps={{
            select: {
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
          }}
        >
          {region.options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </LabelledField>
      <LabelledField id={nameId} label={name.label}>
        <TextField
          id={nameId}
          fullWidth
          variant="outlined"
          value={name.value}
          onChange={name.onChange}
          placeholder={name.placeholder}
          error={Boolean(name.error)}
          helperText={name.error}
          sx={fieldSx}
        />
      </LabelledField>
      <LabelledField id={domainId} label={domain.label}>
        <TextField
          id={domainId}
          fullWidth
          variant="outlined"
          value={domain.value}
          onChange={domain.onChange}
          placeholder={domain.placeholder}
          error={Boolean(domain.error)}
          helperText={domain.error}
          sx={fieldSx}
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
            sx={{ p: 0 }}
          />
        }
        label={<Typography variant="body2">{checkbox.label}</Typography>}
        // MUI's own -11px/16px margins would break the same rhythm.
        sx={{ m: 0, gap: 1, alignItems: 'center' }}
      />
      <Stack direction="row" gap={1} width="100%">
        <Button variant="outlined" fullWidth onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!canSubmit}
        >
          {submitLabel}
        </Button>
      </Stack>
    </Stack>
  );
}
