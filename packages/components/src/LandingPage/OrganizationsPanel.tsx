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
  StackProps,
  TextField,
  Theme,
  Typography,
} from '@mui/material';
import {
  ChangeEvent,
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  type JSX,
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
  /**
   * Not selectable — e.g. a membership awaiting approval. Halves the logo's
   * opacity, drops the name to secondary text, and hides the chevron on top of
   * MUI's own disabled handling, so the row reads as provisional rather than
   * uniformly greyed out.
   */
  disabled?: boolean;
};

/** A single row inside an `OrganizationRowGroup` — logo, text, chevron. */
export function OrganizationRow({
  primaryText,
  secondaryText,
  logo,
  logoBackground = true,
  disabled = false,
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
        // Same fill as the panel around it — the group's outline and the
        // dividers do the separating, not a tonal step.
        backgroundColor: ({ palette }) =>
          palette.mode === 'dark' ? palette.grey[700] : palette.grey[100],
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
          // Dim the logo here rather than on the row: the row overrides
          // `Mui-disabled` back to `opacity: 1` so the whole thing does not
          // grey out uniformly.
          opacity: disabled ? 0.5 : 1,
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
          color={disabled ? 'text.secondary' : 'text.primary'}
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
        // `xs` (16px viewBox), not the default `md` (24px): at a 16px render
        // size only the xs artwork keeps the stroke at Figma's weight — md
        // scales the same stroke down to a hairline.
        <ChevronRightIcon
          variant="xs"
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

/**
 * The outline every top-level element in the panel shares — search field, the
 * personal-org card, the organizations list, and each action group. Figma
 * "Border/border_secondary" maps to `palette.dividers.secondary`:
 * `rgba(17, 17, 17, 0.4)` in light mode, the white equivalent in dark.
 *
 * Note this belongs to the *group*, never to the rows inside it: the list keeps
 * a single outline around all organizations, with plain dividers between them.
 */
const outlineSx = {
  border: 0.6,
  borderColor: ({ palette }: Theme) => palette.dividers.secondary,
  borderRadius: '6px',
  boxShadow: ({ palette }: Theme) =>
    `0px 1px 1px 0px ${alpha(palette.common.black, 0.05)}`,
};

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
        ...outlineSx,
        // Matches the panel and the rows inside it; the outline is the boundary.
        backgroundColor: ({ palette }) =>
          palette.mode === 'dark' ? palette.grey[700] : palette.grey[100],
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

export type OrganizationsEmptyStateProps = StackProps & {
  /** Icon above the title. Default: a search glyph. */
  icon?: JSX.Element;
  /** Default: "No results found". */
  title?: ReactNode;
  /** Optional second line — e.g. a hint to try another search term. */
  description?: ReactNode;
};

/**
 * Status message shown in place of the panel's `orLabel` divider when a search
 * matches nothing. Sits bare on the panel background so it reads as a status
 * message rather than another actionable row.
 *
 * `OrganizationsPanel` renders this for `empty` — pass an instance of it with
 * your own copy when the defaults do not fit.
 */
export function OrganizationsEmptyState({
  icon = <SearchIcon />,
  title = 'No results found',
  description,
  ...stackProps
}: OrganizationsEmptyStateProps) {
  return (
    <Stack
      role="status"
      alignItems="center"
      gap={0.5}
      width="100%"
      py={2}
      px={2}
      {...stackProps}
    >
      {cloneElement(icon, {
        'aria-hidden': true,
        sx: {
          width: 24,
          height: 24,
          mb: 0.5,
          color: 'text.secondary',
          ...icon.props.sx,
        },
      })}
      <Typography
        variant="body2"
        fontWeight={600}
        color="text.primary"
        textAlign="center"
      >
        {title}
      </Typography>
      {description && (
        <Typography variant="caption" color="text.secondary" textAlign="center">
          {description}
        </Typography>
      )}
    </Stack>
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
  /**
   * When truthy, shown in place of the `orLabel` divider — for a search that
   * matched nothing. The join/create actions stay visible either way. Pass
   * `true` for the default `OrganizationsEmptyState`, or a custom ReactNode.
   *
   * Only the app can answer this (it holds the query and the unfiltered list),
   * so the panel never infers it from the row slots:
   * `empty={query !== '' && matches.length === 0}`.
   */
  empty?: boolean | ReactNode;
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
  empty = false,
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
        // Figma "Background/background_default" (#F5F5F5) is `grey[100]`, not
        // `palette.background.default` — that token is #FFFFFF in light mode.
        // The row groups share this fill and rely on their outline; only the
        // search field is brighter than the card.
        backgroundColor: ({ palette }: Theme) =>
          palette.mode === 'dark' ? palette.grey[700] : palette.grey[100],
      }}
    >
      <TextField
        variant="outlined"
        placeholder={search.placeholder}
        value={search.value}
        onChange={search.onChange}
        fullWidth
        // The theme already gives outlined inputs the 6px radius, 0.6px width
        // and 1px shadow; only the *resting* outline color is left at MUI's
        // faint default, so it is pulled up to the same token the theme
        // already uses for this field's hover state.
        sx={{
          // A step brighter than the card, like the row groups below it.
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: ({ palette }: Theme) => palette.dividers.secondary,
          },
        }}
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
      {empty ? (
        empty === true ? (
          <OrganizationsEmptyState />
        ) : (
          empty
        )
      ) : (
        <TextDivider>{orLabel}</TextDivider>
      )}
      <Stack gap={1} width="100%">
        <OrganizationRowGroup>{joinAction}</OrganizationRowGroup>
        <OrganizationRowGroup>{createAction}</OrganizationRowGroup>
      </Stack>
    </Stack>
  );
}
