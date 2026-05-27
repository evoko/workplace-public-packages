import React, { createContext, forwardRef, useContext, useState } from 'react';
import {
  Autocomplete,
  AutocompleteProps,
  Box,
  Chip,
  InputAdornment,
  Paper,
  PaperProps,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';
import { KeyArrowDownIcon, KeyArrowUpIcon, SearchIcon } from '@bwp-web/assets';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BiampGlobalSearchOption {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  associatedItems?: { label: string }[];
  endIcon?: React.ReactNode;
  onClick?: () => void;
}

export type BiampGlobalSearchProps = Omit<
  AutocompleteProps<BiampGlobalSearchOption, false, false, true>,
  'renderInput' | 'renderOption' | 'PaperComponent' | 'value' | 'defaultValue'
> & {
  placeholder?: string;
  noResultsText?: string;
  inputSx?: SxProps<Theme>;
  clearOnSelect?: boolean;
};

// ---------------------------------------------------------------------------
// SearchContext
// ---------------------------------------------------------------------------

const SearchContext = createContext<{
  hasOptions: boolean;
  loading: boolean;
  noResultsText: string;
  query: string;
}>({
  hasOptions: true,
  loading: false,
  noResultsText: 'No results found',
  query: '',
});

// ---------------------------------------------------------------------------
// KeyCap — keyboard key visual wrapper
// ---------------------------------------------------------------------------

function KeyCap({
  children,
  variant = 'icon',
}: {
  children: React.ReactNode;
  variant?: 'icon' | 'text';
}) {
  return (
    <Box
      component="kbd"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 20,
        height: 20,
        px: variant === 'text' ? '8px' : 0.5,
        borderRadius: '4px',
        bgcolor: 'grey.100',
        color: 'grey.400',
        fontFamily: 'inherit',
        fontSize: 'caption.fontSize',
        fontStyle: 'normal',
        fontWeight: (theme: Theme) => theme.typography.fontWeightMedium,
        border: 'none',
        '& svg': { width: 12, height: 12 },
      }}
    >
      {children}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// BiampGlobalSearchPaper
// ---------------------------------------------------------------------------

const BiampGlobalSearchPaper = forwardRef<HTMLDivElement, PaperProps>(
  function BiampGlobalSearchPaper({ children, ...props }, ref) {
    const { hasOptions, loading, noResultsText } = useContext(SearchContext);

    return (
      <Paper ref={ref} {...props}>
        {hasOptions || loading ? (
          children
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ px: 2, py: 1.5 }}
          >
            {noResultsText}
          </Typography>
        )}
        {hasOptions && (
          <Box
            sx={{
              borderTop: ({ palette }) =>
                `0.6px solid ${palette.dividers.secondary}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <KeyCap>
                  <KeyArrowDownIcon />
                </KeyCap>
                <KeyCap>
                  <KeyArrowUpIcon />
                </KeyCap>
              </Box>
              <Typography
                variant="caption"
                fontWeight={(theme) => theme.typography.fontWeightMedium}
                color="text.secondary"
              >
                Select
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <KeyCap variant="text">Enter</KeyCap>
              <Typography
                variant="caption"
                fontWeight={(theme) => theme.typography.fontWeightMedium}
                color="text.secondary"
              >
                Open
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>
    );
  },
);

// ---------------------------------------------------------------------------
// HighlightText
// ---------------------------------------------------------------------------

function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <>{text}</>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <Box
        component="span"
        sx={{
          bgcolor: 'background.info',
          borderRadius: '4px',
          color: 'info.main',
          paddingTop: '2px',
          paddingBottom: '2px',
        }}
      >
        {match}
      </Box>
      {after}
    </>
  );
}

// ---------------------------------------------------------------------------
// BiampGlobalSearchListItem
// ---------------------------------------------------------------------------

function BiampGlobalSearchListItem({
  option,
  props: liProps,
}: {
  option: BiampGlobalSearchOption;
  props: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key };
}) {
  const { query } = useContext(SearchContext);
  const { key, ...rest } = liProps;
  // Below `md` the chips would crowd out the title/subtitle on narrow viewports,
  // so we skip rendering them (and the `+N` overflow chip) entirely.
  const isMobile = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.down('md'),
  );
  const maxChips = 3;
  const chips = isMobile
    ? []
    : (option.associatedItems?.slice(0, maxChips) ?? []);
  const overflow = isMobile
    ? 0
    : (option.associatedItems?.length ?? 0) - maxChips;

  return (
    <li
      key={key}
      {...rest}
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        gap: 8,
        ...rest.style,
      }}
    >
      {option.icon && (
        <Box
          sx={{
            width: 16,
            height: 16,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            '& > svg, & > .MuiSvgIcon-root': {
              width: 16,
              height: 16,
              fontSize: 16,
            },
          }}
        >
          {option.icon}
        </Box>
      )}

      <Typography variant="body2" noWrap sx={{ flexShrink: 0 }}>
        <HighlightText text={option.title} query={query} />
      </Typography>

      {option.subtitle && (
        <Typography
          className="hoverContent"
          variant="body2"
          color="text.secondary"
          noWrap
          sx={{ flexShrink: 1, minWidth: 0, display: 'none' }}
        >
          {option.subtitle}
        </Typography>
      )}

      {chips.length > 0 && (
        <Box
          className="hoverContent"
          sx={{
            display: 'none',
            alignItems: 'center',
            gap: 1,
            ml: 'auto',
            flexShrink: 0,
            px: 2,
          }}
        >
          {chips.map((item, i) => (
            <Chip
              key={i}
              size="small"
              label={item.label}
              sx={{
                bgcolor: 'background.info',
                borderRadius: '2px',
                borderColor: ({ palette }: Theme) => palette.dividers.primary,
                padding: '0px 6px',
                '& .MuiChip-label': {
                  typography: 'caption',
                  fontWeight: (theme: Theme) =>
                    theme.typography.fontWeightMedium,
                },
              }}
            />
          ))}
          {overflow > 0 && (
            <Chip
              size="small"
              label={`+${overflow}`}
              sx={{
                bgcolor: 'background.info',
                borderRadius: '2px',
                borderColor: ({ palette }: Theme) => palette.dividers.primary,
                padding: '0px 6px',
                '& .MuiChip-label': {
                  typography: 'caption',
                  fontWeight: (theme: Theme) =>
                    theme.typography.fontWeightMedium,
                },
              }}
            />
          )}
        </Box>
      )}

      {option.endIcon && (
        <Box
          className="endIcon"
          sx={{
            width: 48,
            height: 48,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ml: chips.length > 0 ? 0 : 'auto',
            visibility: 'hidden',
            '& > svg, & > .MuiSvgIcon-root': {
              width: 16,
              height: 16,
              fontSize: 16,
            },
          }}
        >
          {option.endIcon}
        </Box>
      )}
    </li>
  );
}

// ---------------------------------------------------------------------------
// BiampGlobalSearch
// ---------------------------------------------------------------------------

export function BiampGlobalSearch({
  placeholder = 'Search...',
  noResultsText = 'No results found',
  options = [],
  inputValue: inputValueProp,
  loading = false,
  clearOnSelect = true,
  fullWidth = true,
  onChange,
  onInputChange,
  sx,
  ...props
}: BiampGlobalSearchProps) {
  const hasOptions = options.length > 0;

  // BiampGlobalSearch is a launcher, not a value-bound field — selecting an option
  // fires its `onClick` (e.g. navigation) but should never store a selected value
  // on the Autocomplete. We hardcode `value={null}` below to enforce that; the
  // internal input state below covers the case where the consumer hasn't
  // controlled `inputValue` themselves, so `clearOnSelect` works in all modes.
  const [internalInputValue, setInternalInputValue] = useState('');
  const inputValue = inputValueProp ?? internalInputValue;

  const handleChange: typeof onChange = (event, value, reason, details) => {
    if (value && typeof value !== 'string' && value.onClick) {
      value.onClick();
    }
    onChange?.(event, value, reason, details);
  };

  const handleInputChange: typeof onInputChange = (event, value, reason) => {
    let nextValue: string;
    if (reason === 'selectOption' || reason === 'reset') {
      // On selection the launcher should never adopt the option's label —
      // either clear the field or keep the user's typed text in place.
      nextValue = clearOnSelect ? '' : inputValue;
    } else {
      nextValue = value;
    }
    if (inputValueProp === undefined) {
      setInternalInputValue(nextValue);
    }
    onInputChange?.(event, nextValue, reason);
  };

  return (
    <SearchContext.Provider
      value={{
        hasOptions,
        loading,
        noResultsText,
        query: inputValue,
      }}
    >
      <Autocomplete<BiampGlobalSearchOption, false, false, true>
        options={options}
        value={null}
        inputValue={inputValue}
        loading={loading}
        fullWidth={fullWidth}
        sx={{
          px: 1.5,
          '& .MuiOutlinedInput-root': {
            height: '40px !important',
            minHeight: '40px',
          },
          '& .MuiOutlinedInput-input': {
            height: '40px !important',
          },
          '& .MuiOutlinedInput-notchedOutline': {
            height: '40px !important',
            border: 'none',
            boxShadow: 'none',
          },
          ...sx,
        }}
        onChange={handleChange}
        onInputChange={handleInputChange}
        loadingText={
          <Typography variant="body2" color="text.secondary">
            Loading…
          </Typography>
        }
        freeSolo
        filterOptions={(x) => x}
        getOptionLabel={(option) =>
          typeof option === 'string' ? option : option.title
        }
        noOptionsText={noResultsText}
        slots={{ paper: BiampGlobalSearchPaper }}
        slotProps={{
          listbox: {
            sx: {
              '& .MuiAutocomplete-option': {
                paddingRight: '0px !important',
              },
              '& li:hover .hoverContent, & li.Mui-focused .hoverContent': {
                display: 'flex',
              },
              '& li:hover p.hoverContent, & li.Mui-focused p.hoverContent': {
                display: 'block',
              },
              '& li:hover .endIcon, & li.Mui-focused .endIcon': {
                visibility: 'visible',
              },
            },
          },
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': { padding: '0px !important' },
              '& .MuiInputBase-input': { paddingLeft: '8px !important' },
            }}
            slotProps={{
              input: {
                ...params.InputProps,
                startAdornment: (
                  <>
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                    {params.InputProps.startAdornment}
                  </>
                ),
              },
            }}
          />
        )}
        renderOption={(optionProps, option) => (
          <BiampGlobalSearchListItem
            key={optionProps.key}
            option={option as BiampGlobalSearchOption}
            props={optionProps}
          />
        )}
        {...props}
      />
    </SearchContext.Provider>
  );
}
