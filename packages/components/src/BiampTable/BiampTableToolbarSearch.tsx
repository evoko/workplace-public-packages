import {
  IconButton,
  InputAdornment,
  TextField,
  type TextFieldProps,
} from '@mui/material';
import { InputCloseIcon, SearchIcon } from '@bwp-web/assets';
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
} & Omit<TextFieldProps, 'onChange' | 'value' | 'defaultValue'>;

const searchFieldSx = {
  '& .MuiInputBase-root': {
    height: 36,
    minHeight: 36,
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
  sx,
  ...textFieldProps
}: BiampTableToolbarSearchProps) {
  const [inputValue, setInputValue] = useState(defaultValue);
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

  return (
    <TextField
      name="search"
      type="text"
      placeholder={placeholder}
      slotProps={{
        htmlInput: { maxLength },
        input: {
          startAdornment: (
            <InputAdornment position="start" sx={{ ml: 1 }}>
              <SearchIcon color="inherit" sx={{ width: 16, height: 16 }} />
            </InputAdornment>
          ),
          endAdornment: inputValue ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                aria-label={clearLabel}
                sx={{ mr: 0.5 }}
              >
                <InputCloseIcon sx={{ width: 20, height: 20 }} />
              </IconButton>
            </InputAdornment>
          ) : null,
        },
      }}
      fullWidth
      sx={[searchFieldSx, { maxWidth }, ...(Array.isArray(sx) ? sx : [sx])]}
      variant="outlined"
      value={inputValue}
      onChange={handleChange}
      {...textFieldProps}
    />
  );
}
