import React, { createContext, forwardRef, useContext } from 'react';
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
  'renderInput' | 'renderOption' | 'PaperComponent'
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
  const maxChips = 3;
  const chips = option.associatedItems?.slice(0, maxChips) ?? [];
  const overflow = (option.associatedItems?.length ?? 0) - maxChips;

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
            width: 24,
            height: 24,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
            '& .MuiSvgIcon-root': { fontSize: 14 },
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
  onChange,
  onInputChange,
  ...props
}: BiampGlobalSearchProps) {
  const hasOptions = options.length > 0;

  const handleChange: typeof onChange = (event, value, reason, details) => {
    if (value && typeof value !== 'string' && value.onClick) {
      value.onClick();
    }
    onChange?.(event, value, reason, details);
  };

  const handleInputChange: typeof onInputChange = (event, value, reason) => {
    if (clearOnSelect && (reason === 'selectOption' || reason === 'reset')) {
      onInputChange?.(event, '', reason);
      return;
    }
    onInputChange?.(event, value, reason);
  };

  return (
    <SearchContext.Provider
      value={{
        hasOptions,
        loading,
        noResultsText,
        query: inputValueProp ?? '',
      }}
    >
      <Autocomplete<BiampGlobalSearchOption, false, false, true>
        options={options}
        inputValue={inputValueProp}
        loading={loading}
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
