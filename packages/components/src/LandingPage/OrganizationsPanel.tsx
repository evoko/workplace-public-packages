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
  BoxProps,
  Divider,
  DividerProps,
  InputAdornment,
  ListItemButton,
  ListItemButtonProps,
  Stack,
  StackProps,
  TextField,
  TextFieldProps,
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
import { mergeSlotProps, mergeSx } from '../slotProps';

export type OrganizationRowProps = Omit<ListItemButtonProps, 'children'> & {
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
      sx={mergeSx(
        {
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
        },
        sx,
      )}
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

export type OrganizationRowGroupProps = Omit<
  BoxProps,
  'children' | 'maxHeight'
> & {
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
  sx,
  ...boxProps
}: OrganizationRowGroupProps) {
  const items = Children.toArray(children).filter(isValidElement);

  return (
    <Box
      sx={mergeSx(
        {
          width: '100%',
          ...outlineSx,
          // Matches the panel and the rows inside it; the outline is the
          // boundary.
          backgroundColor: ({ palette }: Theme) =>
            palette.mode === 'dark' ? palette.grey[700] : palette.grey[100],
          overflow: 'hidden',
          ...(maxHeight !== undefined && { overflowY: 'auto', maxHeight }),
        },
        sx,
      )}
      {...boxProps}
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

function TextDivider({ children, sx, ...props }: DividerProps) {
  return (
    <Divider
      sx={mergeSx(
        {
          width: '100%',
          userSelect: 'none',
          color: 'text.primary',
          fontWeight: 600,
          fontSize: 14,
        },
        sx,
      )}
      {...props}
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

/** A row group's props minus the children it wraps, which the panel supplies. */
type RowGroupSlotProps = Omit<OrganizationRowGroupProps, 'children'>;

/**
 * Props for the parts `OrganizationsPanel` builds itself. The rows are yours —
 * style those at the call site — but the search field, the labelled dividers and
 * each group outline are the panel's, so this is how you reach them.
 *
 * Each bag is spread onto its slot *after* the panel's own props, so it wins on
 * conflict; `sx` merges rather than replaces.
 */
export type OrganizationsPanelSlotProps = {
  /** The search `TextField`. Rendered only when `search` is passed. */
  search?: TextFieldProps;
  /** The labelled divider above the organizations list. */
  organizationsLabel?: DividerProps;
  /** The labelled divider between the list and the action rows. */
  orLabel?: DividerProps;
  /** The group wrapping `personalOrgItem`. */
  personalOrgGroup?: RowGroupSlotProps;
  /** The scrollable group wrapping `organizationItems`. */
  organizationsGroup?: RowGroupSlotProps;
  /** The column holding the join and create groups. */
  actions?: StackProps;
  /** The group wrapping `joinAction`. */
  joinGroup?: RowGroupSlotProps;
  /** The group wrapping `createAction`. */
  createGroup?: RowGroupSlotProps;
};

export type OrganizationsPanelProps = Omit<StackProps, 'children' | 'width'> & {
  /**
   * Controlled search field. Omit to render the panel without one — a user with
   * a handful of organizations has nothing to search.
   */
  search?: {
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    placeholder: string;
  };
  /** The current user's personal organization row (an `OrganizationRow`). */
  personalOrgItem?: ReactNode;
  /** Label for the divider above the organizations list. Omit for no label. */
  organizationsLabel?: ReactNode;
  /** The user's other organizations, as `OrganizationRow`s. */
  organizationItems?: ReactNode;
  /**
   * Label for the divider between the org list and the join/create actions.
   * Omit to drop the divider — e.g. when neither action row is passed.
   */
  orLabel?: ReactNode;
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
  /**
   * Pre-built `OrganizationRow` for the "Join organization" row. Omit when the
   * user has no right to join — the group is dropped, not disabled.
   */
  joinAction?: ReactNode;
  /** Pre-built `OrganizationRow` for the "Create organization" row. Omit to hide. */
  createAction?: ReactNode;
  /** Panel width, capped to the viewport. Default: 441. */
  width?: number | string;
  /**
   * Height cap on the scrollable organizations group. Default: three 64px
   * rows. Raise it when passing rows taller than the default.
   */
  maxListHeight?: number | string;
  /**
   * Props for the parts the panel renders itself — the search field, the
   * labelled dividers, each row group, and the actions column. Use this to reach
   * past the panel's own styling without forking it.
   */
  slotProps?: OrganizationsPanelSlotProps;
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
  slotProps,
  sx,
  ...stackProps
}: OrganizationsPanelProps) {
  // The search field carries its own `sx`, so the slot's is pulled out and
  // merged rather than spread over it. Slots without own styling (the actions
  // column) and those that merge internally (the row groups, the dividers) take
  // a plain spread.
  //
  // Its own `slotProps.input` carries the search icon, so the consumer's
  // `slotProps` is pulled out too: their other keys spread through, but `input`
  // is layered rather than replaced. Without this, adding an `endAdornment`
  // would drop the icon.
  const {
    sx: searchSx,
    slotProps: searchFieldSlotProps,
    ...searchSlotProps
  } = slotProps?.search ?? {};

  return (
    <Stack
      gap={2}
      alignItems="center"
      justifyContent="center"
      p={1.5}
      borderRadius={4}
      width={width}
      maxWidth="100%"
      sx={mergeSx(
        {
          // Figma "Background/background_default" (#F5F5F5) is `grey[100]`, not
          // `palette.background.default` — that token is #FFFFFF in light mode.
          // The row groups share this fill and rely on their outline; only the
          // search field is brighter than the card.
          backgroundColor: ({ palette }: Theme) =>
            palette.mode === 'dark' ? palette.grey[700] : palette.grey[100],
        },
        sx,
      )}
      {...stackProps}
    >
      {search && (
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
          sx={mergeSx(
            {
              // A step brighter than the card, like the row groups below it.
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'background.paper',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: ({ palette }: Theme) => palette.dividers.secondary,
              },
            },
            searchSx,
          )}
          slotProps={{
            ...searchFieldSlotProps,
            input: mergeSlotProps(
              {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ ml: 1 }} />
                  </InputAdornment>
                ),
              },
              searchFieldSlotProps?.input,
            ),
          }}
          {...searchSlotProps}
        />
      )}
      {personalOrgItem && (
        <OrganizationRowGroup {...slotProps?.personalOrgGroup}>
          {personalOrgItem}
        </OrganizationRowGroup>
      )}
      {organizationItems && (
        <>
          {organizationsLabel && (
            <TextDivider {...slotProps?.organizationsLabel}>
              {organizationsLabel}
            </TextDivider>
          )}
          <OrganizationRowGroup
            maxHeight={maxListHeight}
            {...slotProps?.organizationsGroup}
          >
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
        orLabel && <TextDivider {...slotProps?.orLabel}>{orLabel}</TextDivider>
      )}
      {(joinAction || createAction) && (
        // No own `sx` here, so the slot's spreads through untouched.
        <Stack gap={1} width="100%" {...slotProps?.actions}>
          {joinAction && (
            <OrganizationRowGroup {...slotProps?.joinGroup}>
              {joinAction}
            </OrganizationRowGroup>
          )}
          {createAction && (
            <OrganizationRowGroup {...slotProps?.createGroup}>
              {createAction}
            </OrganizationRowGroup>
          )}
        </Stack>
      )}
    </Stack>
  );
}
