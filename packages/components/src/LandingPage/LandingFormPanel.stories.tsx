import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, IconButton, InputAdornment, MenuItem } from '@mui/material';
import { useState } from 'react';
import { ArrowRightIcon } from '@bwp-web/assets';
import {
  LandingFormActions,
  LandingFormCheckbox,
  LandingFormField,
  LandingFormPanel,
} from './LandingFormPanel';

/**
 * The landing-page form card, as four composable pieces: `LandingFormPanel`
 * (the shell), `LandingFormField`, `LandingFormCheckbox`, and
 * `LandingFormActions`. The package owns the styling; which fields exist, when
 * they appear, and what gates a submit are the consuming app's.
 *
 * Each story below is a reference composition — the demo component is written
 * to be copied.
 */
const meta: Meta<typeof LandingFormPanel> = {
  title: 'Components/LandingFormPanel',
  component: LandingFormPanel,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof LandingFormPanel>;

/* -------------------------------------------------------------------------- */
/* Join                                                                       */
/* -------------------------------------------------------------------------- */

type JoinDemoProps = {
  label: string;
  /** An example value, since the label already names the field. */
  placeholder: string;
  submitLabel: string;
  /** Pre-fills the field so the submit button starts enabled. */
  initialValue?: string;
  /** Error text under the field, as an app would set after a failed submit. */
  error?: string;
};

function JoinDemo({
  label,
  placeholder,
  submitLabel,
  initialValue = '',
  error,
}: JoinDemoProps) {
  const [value, setValue] = useState(initialValue);
  const canSubmit = value.trim().length > 0;

  return (
    <LandingFormPanel onSubmit={() => canSubmit && setValue('')}>
      <LandingFormField
        label={label}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        error={Boolean(error)}
        helperText={error}
      />
      <LandingFormActions>
        <Button variant="outlined" fullWidth onClick={() => setValue('')}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!canSubmit}
        >
          {submitLabel}
        </Button>
      </LandingFormActions>
    </LandingFormPanel>
  );
}

/**
 * The join flow: one field over a cancel/submit row. The submit button stays
 * disabled until the field has content — type into it to enable "Ask to Join".
 */
export const JoinOrganization: Story = {
  render: () => (
    <JoinDemo
      label="Organization domain"
      placeholder="acme.com"
      submitLabel="Ask to Join"
    />
  ),
};

/**
 * A failed submit: the app sets `error` and `helperText` on the field at fault,
 * which puts it in its error state and shows the message beneath it.
 */
export const JoinWithError: Story = {
  render: () => (
    <JoinDemo
      label="Organization domain"
      placeholder="acme.com"
      submitLabel="Ask to Join"
      initialValue="acme.example"
      error="No organization found with that domain"
    />
  ),
};

/* -------------------------------------------------------------------------- */
/* Create                                                                     */
/* -------------------------------------------------------------------------- */

const regions = [
  { value: 'eu', label: 'Europe' },
  { value: 'us', label: 'North America' },
  { value: 'apac', label: 'Asia Pacific' },
];

type CreateDemoProps = {
  /** Pre-fills the three fields so the submit button starts enabled. */
  filled?: boolean;
  /** Error text under the domain field, as an app would set after a failure. */
  domainError?: string;
};

function CreateDemo({ filled = false, domainError }: CreateDemoProps) {
  const [region, setRegion] = useState(filled ? 'eu' : '');
  const [name, setName] = useState(filled ? 'Acme Corporation' : '');
  const [domain, setDomain] = useState(filled ? 'acme.com' : '');
  const [discoverable, setDiscoverable] = useState(false);

  // The checkbox is deliberately not part of this.
  const canSubmit =
    region !== '' && name.trim().length > 0 && domain.trim().length > 0;

  return (
    <LandingFormPanel onSubmit={() => undefined}>
      <LandingFormField
        select
        label="Data Region"
        value={region}
        onChange={(event) => setRegion(event.target.value)}
        slotProps={{
          select: {
            displayEmpty: true,
            // Stands in for a placeholder, which a select has no room for.
            renderValue: () =>
              regions.find((option) => option.value === region)?.label ?? (
                <span style={{ opacity: 0.6 }}>Select a region</span>
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
        <Button variant="outlined" fullWidth onClick={() => undefined}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!canSubmit}
        >
          Create
        </Button>
      </LandingFormActions>
    </LandingFormPanel>
  );
}

/**
 * The create flow: a `select`, two text fields, and a checkbox. "Create" stays
 * disabled until a region is chosen and both text fields have content. The
 * checkbox is independent — it does not gate submission.
 */
export const CreateOrganization: Story = {
  render: () => <CreateDemo />,
};

/** All three fields filled, so the primary button is live. */
export const CreateOrganizationFilled: Story = {
  render: () => <CreateDemo filled />,
};

/** The domain field in its error state, as after a rejected submit. */
export const CreateWithError: Story = {
  render: () => (
    <CreateDemo filled domainError="That domain is already registered" />
  ),
};

/* -------------------------------------------------------------------------- */
/* Login                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * The arrow submit, as the end adornment of whichever field is currently last.
 * A `type="submit"` button, so it and Enter do the same thing.
 */
function submitAdornment({
  label,
  disabled,
}: {
  label: string;
  disabled: boolean;
}) {
  return {
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
  };
}

function LoginDemo() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // The app owns the step — the panel has no notion of one.
  const [askPassword, setAskPassword] = useState(false);

  const canContinue = email.trim().length > 0;
  const canSignIn = canContinue && password.length > 0;

  const handleSubmit = () => {
    if (!askPassword) {
      if (canContinue) setAskPassword(true);
      return;
    }
    if (canSignIn) {
      setEmail('');
      setPassword('');
      setAskPassword(false);
    }
  };

  return (
    <LandingFormPanel onSubmit={handleSubmit}>
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
            : {
                input: submitAdornment({
                  label: 'Continue',
                  disabled: !canContinue,
                }),
              }
        }
      />
      {askPassword && (
        <LandingFormField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="••••••••"
          slotProps={{
            input: submitAdornment({
              label: 'Sign in',
              disabled: !canSignIn,
            }),
          }}
        />
      )}
    </LandingFormPanel>
  );
}

/**
 * The login flow, with no actions row at all: the submit is a small arrow
 * button in the end adornment of the last field. Type an email and press the
 * arrow (or Enter) — the password field appears below it and the arrow moves
 * down to it.
 */
export const Login: Story = {
  render: () => <LoginDemo />,
};
