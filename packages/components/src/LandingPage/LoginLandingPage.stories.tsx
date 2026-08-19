import {
  AppsIcon,
  AppsIconFilled,
  BiampLogo,
  LandingPageBackground,
  SquareRoundedArrowRightFilledIcon,
} from '@bwp-web/assets';
import { DarkMode, LightMode } from '@mui/icons-material';
import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MouseEvent, useState } from 'react';
import { AppPopoverContent } from '../BiampHeader/BiampHeader.storyhelpers';
import {
  BiampAppPopover,
  BiampHeader,
  BiampHeaderActions,
  BiampHeaderButton,
  BiampHeaderButtonList,
  BiampHeaderTitle,
} from '../BiampHeader';
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
 * The same header as `OrganizationSelectorLandingPage`, minus the profile
 * button: nobody is signed in yet, so there are no initials to show.
 */
function LoginHeader() {
  const [appsAnchorEl, setAppsAnchorEl] = useState<HTMLElement | null>(null);
  // The showcase only swaps the icon; use Storybook's Color Mode toolbar.
  const [lightMode, setLightMode] = useState(true);

  const handleAppsClick = (event: MouseEvent<HTMLElement>) => {
    setAppsAnchorEl(event.currentTarget);
  };

  return (
    <BiampHeader sx={{ bgcolor: 'transparent' }}>
      <BiampHeaderTitle
        title="Workplace"
        sx={{ '& .MuiTypography-root': { color: '#ffffff' } }}
      />
      <BiampHeaderActions>
        <BiampHeaderButtonList>
          <BiampHeaderButton
            icon={<AppsIcon sx={{ color: 'text.secondary' }} />}
            selectedIcon={<AppsIconFilled sx={{ color: 'text.secondary' }} />}
            selected={Boolean(appsAnchorEl)}
            onClick={handleAppsClick}
          />
          <BiampHeaderButton
            icon={
              lightMode ? (
                <LightMode sx={{ color: 'text.secondary' }} />
              ) : (
                <DarkMode sx={{ color: 'text.secondary' }} />
              )
            }
            onClick={() => setLightMode((previous) => !previous)}
          />
        </BiampHeaderButtonList>
      </BiampHeaderActions>
      <BiampAppPopover
        open={Boolean(appsAnchorEl)}
        anchorEl={appsAnchorEl}
        onClose={() => setAppsAnchorEl(null)}
      >
        <AppPopoverContent />
      </BiampAppPopover>
    </BiampHeader>
  );
}

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
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <LoginHeader />
      </Box>
      <Stack
        flex={1}
        alignItems="center"
        justifyContent="center"
        gap={2.5}
        py={4}
        sx={{ position: 'relative', zIndex: 1 }}
      >
        {/* Naming the screen is the page's job — the card has no heading. */}
        <Typography variant="h2" color="text.sidebar">
          {askPassword ? 'Enter your password' : 'Sign in'}
        </Typography>
        <LandingFormPanel onSubmit={handleSubmit}>
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
