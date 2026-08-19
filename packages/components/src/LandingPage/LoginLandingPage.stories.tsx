import {
  BiampLogo,
  LandingPageBackground,
  SquareRoundedArrowRightFilledIcon,
} from '@bwp-web/assets';
import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
// Reused for the lockup itself — the 24px Biamp mark, the 12px gap and the `h4`
// wordmark — not for anything header-shaped. There is no `BiampHeader` here.
import { BiampHeaderTitle } from '../BiampHeader';
import { LandingFormField, LandingFormPanel } from './LandingFormPanel';

const meta: Meta = {
  title: 'Pages/LoginLandingPage',
  parameters: {
    layout: 'fullscreen',
    // Opt out of the preview decorator's padding — this is a full-bleed page.
    noPadding: true,
  },
};

export default meta;
type Story = StoryObj;

/**
 * The submit arrow, as the end adornment of whichever field is currently last.
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
          variant="none"
          size="medium"
          aria-label={label}
          disabled={disabled}
          // Only the icon's square takes `currentColor` — the arrow inside it
          // is a fixed white, so the square is what greys out when disabled.
          sx={{
            color: 'info.main',
            '&.Mui-disabled': { color: 'action.disabled' },
          }}
        >
          <SquareRoundedArrowRightFilledIcon />
        </IconButton>
      </InputAdornment>
    ),
  };
}

/**
 * Deliberately loose: something before an `@`, something after it, and a dot in
 * the domain. Anything stricter rejects addresses that are actually valid — the
 * real check is whether the server can deliver to it.
 */
const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

type LoginLandingPageProps = {
  /** Pre-fills the email, and opens the password step unless `initialEmailError` is set. */
  initialEmail?: string;
  /** Error under the password field, as after a rejected sign-in. */
  initialError?: string;
  /** Error under the email field, as after submitting a malformed address. */
  initialEmailError?: string;
};

function LoginLandingPage({
  initialEmail = '',
  initialError,
  initialEmailError,
}: LoginLandingPageProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState(initialError ? 'hunter2' : '');
  // The page owns the step — the panel has no notion of one.
  const [askPassword, setAskPassword] = useState(
    initialEmail.length > 0 && initialEmailError === undefined,
  );
  const [error, setError] = useState(initialError);
  const [emailError, setEmailError] = useState(initialEmailError);

  const canContinue = email.trim().length > 0;
  const canSignIn = canContinue && password.length > 0;

  const handleSubmit = () => {
    if (!askPassword) {
      if (!canContinue) return;
      // The arrow stays enabled for any non-empty value, so pressing it is what
      // surfaces a bad format — validating per keystroke would flag "j@" while
      // the user is still typing it.
      if (!isValidEmail(email)) {
        setEmailError('Enter a valid email address');
        return;
      }
      setAskPassword(true);
      return;
    }
    if (canSignIn) {
      setPassword('');
      setAskPassword(false);
      setEmail('');
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* The real page pins this with `position: fixed; z-index: -1`; a negative
          z-index would hide behind Storybook's preview decorator. */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url("${LandingPageBackground}")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* The header's logo lockup, centred at the top of the page instead. The
          24px padding keeps roughly the 64px band the header occupied, so the
          vertically-centred hero below it does not shift. */}
      <Stack
        alignItems="center"
        py={3}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <BiampHeaderTitle
          title="Workplace"
          sx={{ '& .MuiTypography-root': { color: '#ffffff' } }}
        />
      </Stack>
      <Stack
        flex={1}
        alignItems="center"
        justifyContent="center"
        // 54px between the hero copy and the card. The card and the help text
        // under it keep the page's own 20px rhythm, in the nested Stack below.
        gap="54px"
        py={4}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        {/* The hero copy names the product; the card carries no heading. */}
        <Stack alignItems="center" gap="21px" px={2} maxWidth={441}>
          {/* `h1` for the Montserrat family and the page-title semantics; the
              rest is overridden because no theme variant is 36px/600 — the
              scale jumps from h1 (28px/500) to h0 (56px/500). Figma's
              `leading-trim` / `text-edge` are dropped (no browser support), as
              is `font-feature-settings` (Montserrat has no ligatures worth
              disabling here). `#FFF` is `common.white`. */}
          <Typography
            variant="h1"
            color="common.white"
            textAlign="center"
            sx={{
              fontSize: 36,
              fontWeight: 600,
              lineHeight: 1,
              letterSpacing: '-1.44px',
            }}
          >
            Welcome to Workplace
          </Typography>
          <Typography variant="body1" color="text.sidebar" textAlign="center">
            Manage every space effortlessly with intuitive tools for seamless
            operations and extraordinary experiences.
          </Typography>
        </Stack>
        <Stack alignItems="center" gap={2.5}>
          <LandingFormPanel
            onSubmit={handleSubmit}
            // 8px on the email step, 16px once the password field joins it.
            // `shape.borderRadius` is 4, so these are the ×4 scale values —
            // `sx` wins over the component's own `borderRadius={4}` prop.
            sx={{ borderRadius: askPassword ? 4 : 2 }}
          >
            <LandingFormField
              label="Email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError(undefined);
              }}
              placeholder="you@acme.com"
              error={Boolean(emailError)}
              helperText={emailError}
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
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError(undefined);
                }}
                error={Boolean(error)}
                helperText={error}
                slotProps={{
                  input: submitAdornment({
                    label: 'Sign in',
                    disabled: !canSignIn,
                  }),
                }}
              />
            )}
          </LandingFormPanel>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            px={2}
            maxWidth={441}
          >
            Trouble signing in? Contact your organization&rsquo;s administrator.
          </Typography>
        </Stack>
      </Stack>
      <Stack
        alignItems="center"
        gap={1}
        py={2}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <BiampLogo style={{ width: 76, height: 'auto', color: '#ffffff' }} />
        <Typography variant="caption" color="text.secondary">
          {`© ${new Date().getFullYear()} Biamp Systems LLC.`}
        </Typography>
      </Stack>
    </Box>
  );
}

/**
 * The first step: one email field, with the arrow disabled until it has
 * content. Press the arrow (or Enter) and the password field appears below it,
 * the arrow moves down to it, and the heading changes.
 */
export const Default: Story = {
  render: () => <LoginLandingPage />,
};

/**
 * A malformed address: pressing the arrow leaves the step where it is and puts
 * the message under the field in the theme's error colour. It clears as soon as
 * the user edits the field. Try `jane.doe@acme` or `jane.doe` in the story
 * above to reach this from the start.
 */
export const InvalidEmail: Story = {
  render: () => (
    <LoginLandingPage
      initialEmail="jane.doe@acme"
      initialEmailError="Enter a valid email address"
    />
  ),
};

/** The second step, entered directly — the password field is already revealed. */
export const PasswordStep: Story = {
  render: () => <LoginLandingPage initialEmail="jane.doe@acme.com" />,
};

/**
 * A rejected sign-in: the page sets `error` and `helperText` on the password
 * field, and clears it as soon as the user edits the field.
 */
export const WithError: Story = {
  render: () => (
    <LoginLandingPage
      initialEmail="jane.doe@acme.com"
      initialError="Incorrect password"
    />
  ),
};
