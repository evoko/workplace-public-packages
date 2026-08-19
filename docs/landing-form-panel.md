# LandingFormPanel

The form card **on a landing page** — the standalone screen shown before entering an app. It is the card that takes `OrganizationsPanel`'s place while a flow is open: joining an organization, creating one, or signing in.

The package ships it as four composable primitives rather than one component per flow. It owns the _styling_: the card shell, the 12px/600 field label, the outlined-input treatment, the actions row, and the checkbox rhythm. Which fields exist, when they appear, and what gates a submit are the consuming app's — those are flow logic, and every flow's is different.

This replaces the `OrganizationJoinPanel` and `OrganizationCreatePanel` components removed in 2.0.0. See [Migrating from the panels](#migrating-from-the-panels).

For the organization picker these cards swap with, see [`OrganizationsPanel`](./organizations-panel.md).

## Installation

```bash
npm install @bwp-web/components
```

### Peer Dependencies

- `@bwp-web/styles` >= 1.0.13
- `@bwp-web/assets` >= 1.0.2
- `@mui/material` >= 7.0.0
- `react` >= 18.0.0
- `react-dom` >= 18.0.0

## Components

### `LandingFormPanel`

The card. Takes children and owns no field or flow knowledge. Its root `Stack` is the `<form>` element, which is what makes Enter submit.

**Not an overlay.** It is the same card as `OrganizationsPanel` — same fill, radius, padding and width — and takes the panel's place while a flow is open, with cancel returning to it. The app decides which is rendered; there is no `open` prop.

#### Props

| Prop       | Type               | Default      | Description                                                                                                               |
| ---------- | ------------------ | ------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `children` | `React.ReactNode`  | _(required)_ | The fields, checkbox and actions row, in order. Spaced at `gap: 2`                                                        |
| `onSubmit` | `() => void`       | —            | Fired by Enter in any field, or a `type="submit"` control. The panel never inspects the fields — gating a submit is yours |
| `width`    | `number \| string` | `441`        | Card width, capped to the viewport — matches `OrganizationsPanel`                                                         |
| `sx`       | `SxProps<Theme>`   | —            | Merged over the card's own styles rather than replacing them                                                              |
| _...rest_  | `StackProps`       | —            | Forwarded to the root `Stack`, which is the `<form>` element (minus `onSubmit`)                                           |

The submit handler always calls `preventDefault()`, with or without an `onSubmit`, so a panel without a handler never navigates the page.

### `LandingFormField`

A labelled input. Everything `TextField` takes passes through, so `select`, `type="password"`, `error` / `helperText`, and `slotProps.input` adornments all work without extra props.

#### Props

| Prop         | Type              | Default       | Description                                                                                                                                                            |
| ------------ | ----------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `label`      | `React.ReactNode` | _(required)_  | Rendered as a 12px/600 `<label>` bound to the input — **not** MUI's floating label, which this field does not use. Naming the screen is the page's job, above the card |
| `labelProps` | `TypographyProps` | —             | Props for that `<label>`                                                                                                                                               |
| `id`         | `string`          | _(generated)_ | Falls back to a `useId()` value, so the label binding holds either way                                                                                                 |
| `sx`         | `SxProps<Theme>`  | —             | Merged over the field's own outline treatment rather than replacing it                                                                                                 |
| _...rest_    | `TextFieldProps`  | —             | Forwarded to the `TextField`. `variant` is omitted — the panel's field is always outlined                                                                              |

Mark a field at fault with MUI's own props: `error={true}` for the state, `helperText` for the message beneath it.

### `LandingFormActions`

The row of buttons at the foot of the card — layout only (`direction="row"`, `gap: 1`, full width). It does not set variant, width or disabled state.

The convention across the family is an outlined button on the left and a contained `type="submit"` on the right, both `fullWidth`, with the submit disabled until the form is valid. That is yours to pass; see [Join](#join) below for the reference.

#### Props

| Prop      | Type         | Default | Description                                                                             |
| --------- | ------------ | ------- | --------------------------------------------------------------------------------------- |
| _...rest_ | `StackProps` | —       | Forwarded to the root `Stack`. Pass `direction`, `gap` or `sx` to override the defaults |

### `LandingFormCheckbox`

One checkbox with its label to the right, spaced to the card's rhythm. `checked` and `onChange` pass through to the control.

#### Props

| Prop                 | Type                    | Default      | Description                                                                 |
| -------------------- | ----------------------- | ------------ | --------------------------------------------------------------------------- |
| `label`              | `React.ReactNode`       | _(required)_ | Wrapped in a `body2` `Typography`                                           |
| `slotProps.checkbox` | `CheckboxProps`         | —            | Props for the `Checkbox` control itself. `sx` merges with the padding reset |
| `sx`                 | `SxProps<Theme>`        | —            | Merged over the label's own margin reset                                    |
| _...rest_            | `FormControlLabelProps` | —            | Forwarded to the `FormControlLabel`, minus `control`                        |

## Usage

### Join

One field over a cancel/submit row — the reference composition for the actions convention.

```tsx
import { useState } from 'react';
import { Button } from '@mui/material';
import {
  LandingFormActions,
  LandingFormField,
  LandingFormPanel,
} from '@bwp-web/components';

function JoinForm({ onCancel, onJoin }) {
  const [domain, setDomain] = useState('');
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = domain.trim().length > 0 && !submitting;

  return (
    <LandingFormPanel
      onSubmit={async () => {
        if (!canSubmit) return;
        setSubmitting(true);
        try {
          await onJoin(domain);
        } catch {
          setError('No organization found with that domain');
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <LandingFormField
        label="Organization domain"
        value={domain}
        onChange={(event) => setDomain(event.target.value)}
        placeholder="acme.com"
        error={Boolean(error)}
        helperText={error}
      />
      <LandingFormActions>
        <Button
          variant="outlined"
          fullWidth
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          loading={submitting}
          disabled={!canSubmit}
        >
          Ask to Join
        </Button>
      </LandingFormActions>
    </LandingFormPanel>
  );
}
```

`submitting` is the app's flag, not the card's: the panel can't know when a submit resolves. While it's `true`, the submit button shows a spinner and both buttons are disabled, so one request can't fire twice.

### Create

A `select`, two text fields, and a checkbox. The select has no room for a placeholder, so `renderValue` stands in for one.

```tsx
import { Box, Button, MenuItem } from '@mui/material';
import {
  LandingFormActions,
  LandingFormCheckbox,
  LandingFormField,
  LandingFormPanel,
} from '@bwp-web/components';

<LandingFormPanel onSubmit={submit}>
  <LandingFormField
    select
    label="Data Region"
    value={region}
    onChange={(event) => setRegion(event.target.value)}
    slotProps={{
      select: {
        displayEmpty: true,
        renderValue: () =>
          regions.find((option) => option.value === region)?.label ?? (
            <Box component="span" sx={{ color: 'text.secondary' }}>
              Select a region
            </Box>
          ),
      },
    }}
  >
    {regions.map((option) => (
      <MenuItem key={option.value} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </LandingFormField>
  <LandingFormField
    label="Organization name"
    value={name}
    onChange={(event) => setName(event.target.value)}
    placeholder="Acme Corporation"
  />
  <LandingFormField
    label="Organization domain"
    value={domain}
    onChange={(event) => setDomain(event.target.value)}
    placeholder="acme.com"
    error={Boolean(domainError)}
    helperText={domainError}
  />
  <LandingFormCheckbox
    checked={discoverable}
    onChange={(_event, checked) => setDiscoverable(checked)}
    label="Let anyone with this domain find and join this organization"
  />
  <LandingFormActions>
    <Button variant="outlined" fullWidth onClick={onCancel}>
      Cancel
    </Button>
    <Button type="submit" variant="contained" fullWidth disabled={!canSubmit}>
      Create
    </Button>
  </LandingFormActions>
</LandingFormPanel>;
```

Each field takes its own `error` / `helperText`, so the app can mark just the field at fault. The checkbox is deliberately not part of `canSubmit` — it's a preference, not a requirement.

### Login

No actions row at all: the submit is a small arrow button in the end adornment of the last field, and the password field is revealed only once there's an email. The step lives in the app — the panel has no notion of one.

```tsx
import { useState } from 'react';
import { IconButton, InputAdornment } from '@mui/material';
import { ArrowRightIcon } from '@bwp-web/assets';
import { LandingFormField, LandingFormPanel } from '@bwp-web/components';

const submitAdornment = (label: string, disabled: boolean) => ({
  endAdornment: (
    <InputAdornment position="end">
      <IconButton
        type="submit"
        size="small"
        edge="end"
        aria-label={label}
        disabled={disabled}
      >
        <ArrowRightIcon sx={{ width: 20, height: 20 }} />
      </IconButton>
    </InputAdornment>
  ),
});

function LoginForm({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [askPassword, setAskPassword] = useState(false);

  const canContinue = email.trim().length > 0;
  const canSignIn = canContinue && password.length > 0;

  return (
    <LandingFormPanel
      onSubmit={() => {
        if (!askPassword) {
          if (canContinue) setAskPassword(true);
        } else if (canSignIn) {
          onSignIn(email, password);
        }
      }}
    >
      <LandingFormField
        label="Email"
        type="email"
        autoComplete="username"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@acme.com"
        slotProps={
          askPassword
            ? undefined
            : { input: submitAdornment('Continue', !canContinue) }
        }
      />
      {askPassword && (
        <LandingFormField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          slotProps={{ input: submitAdornment('Sign in', !canSignIn) }}
        />
      )}
    </LandingFormPanel>
  );
}
```

The arrow is a `type="submit"` button, so it and Enter do the same thing. It carries an `aria-label` because it has no text — an icon-only button with none is unnameable to a screen reader.

## Migrating from the panels

`OrganizationJoinPanel` and `OrganizationCreatePanel` were removed in 2.0.0. Both are compositions of these primitives; the [Join](#join) and [Create](#create) examples above reproduce them.

Three things move from the component to your code:

- **Submit gating.** The old panels derived `disabled` from their own field values. Pass `disabled` to the submit `<Button>` yourself.
- **Button labels and handlers.** `cancelLabel` / `submitLabel` / `onCancel` become the `<Button>`s you pass to `LandingFormActions`.
- **`slotProps`.** The per-panel slot bags are gone. You now hold the `<Button>` or `<TextField>` directly, so style it directly.

Field config objects flatten into props: `field={{ value, onChange, placeholder }}` becomes `value` / `onChange` / `placeholder` on `LandingFormField`, `title` becomes `label`, and `error="…"` becomes `error={true}` plus `helperText="…"`.

## Design Details

- **One fill across the family** — the card uses the same `grey[100]` (`#F5F5F5`) / `grey[700]` as `OrganizationsPanel`, with its inputs a step brighter on `background.paper` (`#FFFFFF` / `grey[800]`) so they read as raised out of the card. Swapping one card for another changes nothing but the contents. Note Figma's `--Background-background_default` (`#F5F5F5`) is `grey[100]` here — `palette.background.default` is `#FFFFFF` in light mode, so the token name and the value don't line up.
- **Cards swap without moving anything** — `borderRadius: 4`, `p: 1.5` and the 441px width match `OrganizationsPanel` exactly, so replacing one with the other doesn't shift or resize its surroundings.
- **Field resting outline** — the theme supplies outlined inputs with the 6px radius, 0.6px width and matching shadow, but leaves the resting border at MUI's fainter default. `LandingFormField` raises it to `dividers.secondary` — the token the theme already uses for hover — so fields match the cards at rest. The rule excludes `Mui-error`, so a field in its error state keeps the theme's error colour.
- **The card has no heading of its own** — each field's `label` is a 12px/600 `<label>` (the weight the panel uses for its dividers), grouped with its input at `gap: 0.5` so it reads as attached. Naming the screen is the page's job, above the card.
- **The checkbox fights two MUI defaults** — the theme's 12px checkbox padding and `FormControlLabel`'s own -11px/16px margins would both break the card's 16px rhythm, so `LandingFormCheckbox` resets them and lets the card's `gap` do the spacing.
- **No component here reads its children** — the panel places what it's given and nothing more. Conditional fields, step state and validation are all app-side by construction.

## Exports

- `LandingFormPanel` — The card shell: `<form>` root, the shared fill, radius, padding and width.
- `LandingFormField` — Labelled input with the shared outline treatment; full `TextField` passthrough.
- `LandingFormActions` — The button row's layout.
- `LandingFormCheckbox` — Checkbox and label, spaced to the card's rhythm.
