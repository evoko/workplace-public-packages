import {
  Box,
  Collapse,
  IconButton,
  InputAdornment,
  InputBase,
  TextField,
  Theme,
  useMediaQuery,
  type TextFieldProps,
} from '@mui/material';
import { CloseIcon, SearchIcon } from '@bwp-web/assets';
import { useEffect, useState } from 'react';
import {
  BIAMP_TABLE_DEBOUNCE_DELAY,
  useDebouncedCallback,
} from './useDebouncedCallback';

export type BiampTableToolbarSearchProps = {
  /** Called with the debounced search string whenever the value changes. */
  onChange: (value: string) => void;
  /** Initial value for the search field. When this prop changes the input resets. */
  defaultValue?: string;
  /** Debounce delay in milliseconds. @default BIAMP_TABLE_DEBOUNCE_DELAY (300) */
  debounceDelay?: number;
  /** Maximum character length for the input. @default 120 */
  maxLength?: number;
  /** Maximum width of the text field. @default 280 */
  maxWidth?: number;
  /** Placeholder text. @default "Search" */
  placeholder?: string;
  /** Accessible label for the clear button. @default "Clear search" */
  clearLabel?: string;
  /** When true, the search field collapses to an icon button when empty and unfocused. @default false */
  expandable?: boolean;
  /** Accessible label for the collapsed icon button (only used when expandable is true). @default placeholder */
  expandLabel?: string;
  enableMobileView?: boolean;
} & Omit<TextFieldProps, 'onChange' | 'value' | 'defaultValue'>;

const searchFieldSx = {
  '& .MuiInputBase-root': {
    height: '36px !important',
    minHeight: '36px !important',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    height: '36px !important',
  },
} as const;

export function BiampTableToolbarSearch({
  onChange,
  defaultValue = '',
  debounceDelay = BIAMP_TABLE_DEBOUNCE_DELAY,
  maxLength = 120,
  maxWidth = 280,
  placeholder = 'Search',
  clearLabel = 'Clear search',
  expandable = false,
  expandLabel,
  enableMobileView = true,
  sx,
  ...textFieldProps
}: BiampTableToolbarSearchProps) {
  const isMobile = useMediaQuery<Theme>((t) => t.breakpoints.down('md'));
  const [inputValue, setInputValue] = useState(defaultValue);
  const [isExpanded, setIsExpanded] = useState(false);
  const debouncedOnChange = useDebouncedCallback(onChange, debounceDelay);

  useEffect(() => {
    setInputValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    debouncedOnChange(e.target.value);
  };

  const handleClear = () => {
    setInputValue('');
    debouncedOnChange('');
  };

  const handleBlur = () => {
    if (expandable && !inputValue) {
      setIsExpanded(false);
    }
  };

  const clearButton = inputValue ? (
    <InputAdornment position="end">
      <IconButton
        size="small"
        onClick={handleClear}
        aria-label={clearLabel}
        sx={{ mr: 0.5 }}
      >
        <CloseIcon variant="xs" sx={{ width: 20, height: 20 }} />
      </IconButton>
    </InputAdornment>
  ) : null;

  const textField = (
    <TextField
      name="search"
      type="text"
      placeholder={placeholder}
      slotProps={{
        htmlInput: { maxLength, 'aria-label': placeholder },
        input: {
          startAdornment: (
            <InputAdornment position="start" sx={{ ml: 1 }}>
              <SearchIcon
                variant="xs"
                color="inherit"
                sx={{ width: 16, height: 16 }}
              />
            </InputAdornment>
          ),
          endAdornment: clearButton,
        },
      }}
      fullWidth
      sx={[
        searchFieldSx,
        expandable ? { width: 170 } : { maxWidth },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
      variant="outlined"
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      {...(expandable && isExpanded && !defaultValue && { autoFocus: true })}
      {...textFieldProps}
    />
  );

  if (isMobile && enableMobileView) {
    return (
      <Box display="flex" alignItems="center" width="100%" pr={1} gap={1}>
        <SearchIcon sx={{ width: 16, height: 16 }} />
        <InputBase
          name="search"
          type="text"
          placeholder={placeholder}
          inputProps={{ maxLength, 'aria-label': 'Search' }}
          fullWidth
          value={inputValue}
          sx={{ paddingLeft: 1 }}
          onChange={handleChange}
          endAdornment={clearButton}
        />
      </Box>
    );
  }

  if (expandable) {
    return (
      <Box display="flex" alignItems="center" minWidth={28}>
        <IconButton
          aria-label={expandLabel ?? placeholder}
          onClick={() => setIsExpanded(true)}
          sx={{ display: isExpanded || inputValue ? 'none' : 'flex' }}
        >
          <SearchIcon
            variant="xs"
            color="inherit"
            sx={{ width: 16, height: 16 }}
          />
        </IconButton>
        <Collapse
          in={isExpanded || !!inputValue}
          orientation="horizontal"
          unmountOnExit
        >
          {textField}
        </Collapse>
      </Box>
    );
  }

  return textField;
}
