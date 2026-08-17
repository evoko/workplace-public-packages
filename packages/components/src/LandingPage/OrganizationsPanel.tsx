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
  logo?: ReactNode | string;
  logoBackground?: boolean;
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
          backgroundColor: ({ palette }) =>
            palette.mode === 'dark' ? palette.grey[700] : palette.grey[100],
          // Disabled rows keep full opacity; only the logo dims (below).
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
            alt=""
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

/** Bordered grouping of `OrganizationRow`s, auto-divided. */
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
  icon?: JSX.Element;
  title?: ReactNode;
  description?: ReactNode;
};

/**
 * Status message shown in place of the `orLabel` divider when a search matches
 * nothing. `OrganizationsPanel` renders this for `empty={true}`; pass an instance
 * with your own copy when the defaults do not fit.
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

const DEFAULT_MAX_LIST_HEIGHT = 3 * 64 + 2;

type RowGroupSlotProps = Omit<OrganizationRowGroupProps, 'children'>;

/**
 * The rows are yours — style those at the call site. These are the parts the
 * panel builds itself. Spread after its own props, so they win on conflict;
 * `sx` merges rather than replaces.
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
  /** Controlled search field. Omit to render the panel without one. */
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
  /** Label for the divider before the join/create actions. Omit to drop it. */
  orLabel?: ReactNode;
  /**
   * Shown in place of the `orLabel` divider when truthy; the join/create actions
   * stay visible either way. `true` renders the default `OrganizationsEmptyState`.
   *
   * The panel never infers this — only the app holds the query and the
   * unfiltered list: `empty={query !== '' && matches.length === 0}`.
   */
  empty?: boolean | ReactNode;
  /** `OrganizationRow` for the "Join organization" row. Omit to hide the group. */
  joinAction?: ReactNode;
  /** `OrganizationRow` for the "Create organization" row. Omit to hide the group. */
  createAction?: ReactNode;
  /** Panel width, capped to the viewport. Default: 441. */
  width?: number | string;
  /** Height cap on the scrollable organizations group. Default: three 64px rows. */
  maxListHeight?: number | string;
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
  // Pulled out so the slot's `sx` merges with the field's own, and so the
  // field's `slotProps` (search icon, accessible name) are layered rather than
  // replaced. Every other slot takes a plain spread.
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
          // Figma's `background_default` (#F5F5F5) is `grey[100]` here, not
          // `palette.background.default` — that token is #FFFFFF in light mode.
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
          sx={mergeSx(
            {
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
            htmlInput: mergeSlotProps(
              { 'aria-label': search.placeholder },
              searchFieldSlotProps?.htmlInput,
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
