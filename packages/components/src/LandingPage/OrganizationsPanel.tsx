/**
 * Organization selection **on a landing page** — the standalone screen shown
 * before entering an app, where the user picks which organization to open (or
 * joins/creates one). `OrganizationsPanel` is the full card: a search field
 * over `OrganizationRowGroup`s of `OrganizationRow`s, sized to stand alone
 * over a background rather than to fit a toolbar.
 *
 * For switching organizations from inside an app, use the
 * `OrganizationSelector` family instead — those are built to live in the
 * package's `BiampHeader`. The two families are complements, not versions of
 * each other.
 */
import {
  alpha,
  Box,
  Divider,
  InputAdornment,
  ListItemButton,
  ListItemButtonProps,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  ChangeEvent,
  Children,
  Fragment,
  isValidElement,
  ReactNode,
} from 'react';
import { ChevronRightIcon, SearchIcon } from '@bwp-web/assets';

type OrganizationRowProps = Omit<ListItemButtonProps, 'children'> & {
  primaryText: ReactNode;
  secondaryText?: ReactNode;
  /** Logo element or an image URL. */
  logo?: ReactNode | string;
  /**
   * Whether the logo sits on a filled square (organization logos) or
   * transparently (action icons such as join/create). Default: true.
   */
  logoBackground?: boolean;
};

/** A single row inside an `OrganizationRowGroup` — logo, text, chevron. */
export function OrganizationRow({
  primaryText,
  secondaryText,
  logo,
  logoBackground = true,
  disabled,
  sx,
  ...props
}: OrganizationRowProps) {
  return (
    <ListItemButton
      disabled={disabled}
      disableRipple
      sx={{
        p: 1.5,
        gap: 2,
        backgroundColor: 'background.paper',
        '&.Mui-disabled': { opacity: 1 },
        ...(!disabled && {
          '&:hover': { backgroundColor: 'action.hover' },
        }),
        ...sx,
      }}
      {...props}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '6px',
          overflow: 'hidden',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: ({ palette }) =>
            logoBackground
              ? palette.mode === 'dark'
                ? palette.grey[800]
                : palette.grey[200]
              : 'transparent',
        }}
      >
        {typeof logo === 'string' ? (
          <Box
            component="img"
            src={logo}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          logo
        )}
      </Box>
      <Stack sx={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
        <Typography
          noWrap
          variant="body2"
          fontWeight={600}
          color="text.primary"
        >
          {primaryText}
        </Typography>
        {secondaryText && (
          <Typography noWrap variant="caption" color="text.secondary">
            {secondaryText}
          </Typography>
        )}
      </Stack>
      {!disabled && (
        <ChevronRightIcon
          sx={{
            width: 16,
            height: 16,
            flexShrink: 0,
            color: 'text.primary',
          }}
        />
      )}
    </ListItemButton>
  );
}

type OrganizationRowGroupProps = {
  children: ReactNode;
  /** Caps the group height and enables vertical scrolling. */
  maxHeight?: number | string;
};

/**
 * Bordered grouping that auto-renders dividers between its children.
 * Contains `OrganizationRow`s.
 */
export function OrganizationRowGroup({
  children,
  maxHeight,
}: OrganizationRowGroupProps) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <Box
      sx={{
        width: '100%',
        border: 0.6,
        borderColor: ({ palette }) =>
          palette.mode === 'dark'
            ? alpha(palette.common.white, 0.12)
            : alpha(palette.grey[900], 0.15),
        borderRadius: '6px',
        backgroundColor: 'background.paper',
        boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.05)',
        overflow: 'hidden',
        ...(maxHeight !== undefined && { overflowY: 'auto', maxHeight }),
      }}
    >
      {items.map((item, i) => (
        <Fragment key={item.key ?? i}>
          {item}
          {i !== items.length - 1 && <Divider />}
        </Fragment>
      ))}
    </Box>
  );
}

function TextDivider({ children }: { children: ReactNode }) {
  return (
    <Divider
      sx={{
        width: '100%',
        userSelect: 'none',
        color: 'text.primary',
        fontWeight: 600,
        fontSize: 14,
      }}
    >
      {children}
    </Divider>
  );
}

/** Default cap on the organizations group — three 64px rows plus borders. */
const DEFAULT_MAX_LIST_HEIGHT = 3 * 64 + 2;

type OrganizationsPanelProps = {
  search: {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
  };
  /** The current user's personal organization row (an `OrganizationRow`). */
  personalOrgItem?: ReactNode;
  organizationsLabel: ReactNode;
  /** The user's other organizations, as `OrganizationRow`s. */
  organizationItems?: ReactNode;
  /** Label for the divider between the org list and the join/create actions. */
  orLabel: ReactNode;
  /** Pre-built `OrganizationRow` for the "Join organization" row. */
  joinAction: ReactNode;
  /** Pre-built `OrganizationRow` for the "Create organization" row. */
  createAction: ReactNode;
  /** Panel width, capped to the viewport. Default: 441. */
  width?: number | string;
  /**
   * Height cap on the scrollable organizations group. Default: three 64px
   * rows. Raise it when passing rows taller than the default.
   */
  maxListHeight?: number | string;
};

/**
 * Content-sized card for picking, joining, or creating an organization.
 * Matches the Figma "Welcome / Organizations" design.
 */
export function OrganizationsPanel({
  search,
  personalOrgItem,
  organizationsLabel,
  organizationItems,
  orLabel,
  joinAction,
  createAction,
  width = 441,
  maxListHeight = DEFAULT_MAX_LIST_HEIGHT,
}: OrganizationsPanelProps) {
  return (
    <Stack
      gap={2}
      alignItems="center"
      justifyContent="center"
      p={1.5}
      borderRadius={4}
      width={width}
      maxWidth="100%"
      sx={{
        backgroundColor: ({ palette }) =>
          palette.mode === 'dark' ? palette.grey[700] : palette.grey[100],
      }}
    >
      <TextField
        variant="outlined"
        placeholder={search.placeholder}
        value={search.value}
        onChange={search.onChange}
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ ml: 1 }} />
              </InputAdornment>
            ),
          },
        }}
      />
      {personalOrgItem && (
        <OrganizationRowGroup>{personalOrgItem}</OrganizationRowGroup>
      )}
      {organizationItems && (
        <>
          <TextDivider>{organizationsLabel}</TextDivider>
          <OrganizationRowGroup maxHeight={maxListHeight}>
            {organizationItems}
          </OrganizationRowGroup>
        </>
      )}
      <TextDivider>{orLabel}</TextDivider>
      <Stack gap={1} width="100%">
        <OrganizationRowGroup>{joinAction}</OrganizationRowGroup>
        <OrganizationRowGroup>{createAction}</OrganizationRowGroup>
      </Stack>
    </Stack>
  );
}
